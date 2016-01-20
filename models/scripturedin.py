import time
import logging
import datetime
from google.appengine.api import users
from google.appengine.ext import ndb

from webapp2_extras import security
from webapp2_extras.appengine.auth.models import User as AuthUser
from google.appengine.api import memcache

type_string = ndb.StringProperty
type_int = ndb.IntegerProperty
type_json = ndb.JsonProperty
type_key = ndb.KeyProperty
type_struct = ndb.StructuredProperty
type_bool = ndb.BooleanProperty
type_date = ndb.DateProperty
type_datetime = ndb.DateTimeProperty


class BaseModel(ndb.Model):
    created_at = type_int()
    created_by = type_key()
    modified_at = type_int()

    def _pre_put_hook(self):
        """Pre-put operations. Store UTC timestamp(s) in milliseconds."""
        now = int(time.time() * 1000)
        self.modified_at = now
        if not self.created_at:
            self.created_at = now


class User(AuthUser):
    first_name = type_string()
    last_name = type_string()
    email = type_string()
    profile_info = type_string()
    gender = type_string(choices=('f', 'm'))
    church_key = type_key()
    is_pastor = type_bool()
    fav_sermon_keys = type_key(kind='Sermon', repeated=True)
    # def get_id(self):
    #     return self.id

    def set_password(self, raw_password):
        """Sets the password for the current user

        :param raw_password:
            The raw password which will be hashed and stored
        """
        self.password = security.generate_password_hash(raw_password, length=12)


class Scripture(ndb.Model):
    book = type_string()
    chapter = type_int()
    verses = type_string(repeated=True)
    translation = type_string()
    language = type_string(default='eng')


class Church(BaseModel):
    name = type_string()
    name_lower_case = type_string()
    address = type_string()
    website = type_string()
    country = type_string()
    state = type_string()
    city = type_string()
    denom = type_string()


class SermonNote(BaseModel):
    sermon_key = type_key(kind='Sermon')
    notes = type_string()


class Comment(BaseModel):
    ref_key = type_key()
    comment = type_string()
    reply_to = type_key(kind='Comment')
    likes_key = type_key(kind='User', repeated=True)
    like_count = type_int(default=0)
    replies_key = type_key(kind='Comment', repeated=True)
    reply_count = type_int(default=0)


class Sermon(BaseModel):
    title = type_string()
    date = type_datetime(repeated=True)
    scripture = type_json()
    notes = type_json()  # list of note objects {content: ''}
    note = type_string()
    pastor_key = type_key()
    church_key = type_key()
    publish = type_bool()
    questions = type_json()
    cal_color = type_string()  # calendar color
    comments = type_int(default=0)
    likes = type_int(default=0)
    views = type_int(default=0)
    viewers_key = type_key(kind='User', repeated=True)


class Tags(BaseModel):
    tag = type_string()


class Request(BaseModel):
    headline = type_string()
    context = type_string()
    tag_keys = type_key(repeated=True)
    commentators_key = type_key(repeated=True)
    # list of dict {type: 'email' : email: ''} {type: 'twitter', handler: ''}
    invited_commentators = ndb.JsonProperty()
    # {book: '', 'chapter': ''; 'translation':'', selection:[{verse: 12, selected: ''},...]}
    scripture = ndb.JsonProperty()


def get_user_by_email(email):
    return User.query(User.email == email).get()


def get_object(model, id):
    return ndb.Key(model, int(id)).get()


def get_user_by_id(id):
    return ndb.Key('User', int(id)).get()


def get_sermon(id):
    return get_object('Sermon', int(id))


def create_user(first_name, last_name, email):
    user = users.User('email')


def get_churches():
    return Church.query().fetch()


def get_church(id):
    return ndb.Key('Church', int(id)).get()


def get_church_by_name(name):
    return Church.query(Church.name == name).fetch()


def save_church(data):
    if 'name' not in data or not data['name'] or len(get_church_by_name(data['name'])) > 0:
        return False
    else:
        church = Church()
        church.name = data['name']
        church.website = data['website'] if 'website' in data else None
        church.address = data['address'] if 'address' in data else None
        church.city = data['city'] if 'city' in data else None
        church.state = data['state'] if 'state' in data else None
        church.country = data['country'] if 'country' in data else None
        church.key = church.put()
        # @todo update cache
        return church


def update_user(id, data):
    # fields = ['gender', 'church', 'is_pastor']
    logging.info(data)
    user = get_user_by_id(id)
    if user:
        for (key, val) in data.iteritems():
            if key == 'gender':
                val = val.lower()
                if val in ['f', 'female']:
                    user.gender = 'f'
                elif val in ['m', 'male']:
                    user.gender = 'm'
            if key == 'is_pastor':
                if type(val) == bool:
                    user.is_pastor = val
                elif val.lower() in ['t', 'true', 'y', 'yes']:
                    user.is_pastor = True
                else:
                    user.is_pastor = False
            if key == 'church_id':
                user.church_key = ndb.Key('Church', val)
        user.put()
    return user


def _update_sermon(user_id, data, publish=False):
    if not isinstance(data, dict):
        raise Exception('data should be a dictionary')
    if 'title' not in data or not data['title']:
        raise Exception('sermon requires title')
    if 'scripture' not in data or not isinstance(data['scripture'], list) or not data['scripture']:
        raise Exception('sermon requires at least one scripture')
    if ('notes' not in data or not isinstance(data['notes'], list) or not data['notes']) and (
                    'note' not in data or not data['note']):
        raise Exception('sermon requires at a note. Note can be list of notes or free text')

    user = get_user_by_id(user_id)
    if not user.is_pastor:
        raise Exception('user must be a pastor to create a sermon')

    sermon = get_sermon(data['id']) if 'id' in data else Sermon(pastor_key=user.key)
    sermon.title = data['title']
    sermon.publish = publish
    if 'date' in data:
        sermon.date = []
        for d in data['date']:
            try:
                sermon.date.append(datetime.datetime.utcfromtimestamp(float(d) / 1000.0))
            except ValueError:
                logging.info('Cannot parse d %s' % d)
    # @todo validate scripture
    sermon.scripture = data['scripture']
    if 'notes' in data:
        notes = []
        for n in data['notes']:
            if 'content' in n and n['content']:
                notes.append(n)
        sermon.notes = notes
    if 'note' in data:
        sermon.note = data['note']
    if 'questions' in data and data['questions']:
        qsts = []
        for q in data['questions']:
            if 'content' in q and q['content']:
                qsts.append(q)
        sermon.questions = qsts

    sermon.church_key = user.church_key
    sermon.key = sermon.put()
    return sermon


def save_sermon(user_id, data):
    return _update_sermon(user_id, data, False)


def publish_sermon(user_id, data):
    return _update_sermon(user_id, data, True)


def get_sermons_by_church(church_id, ):
    return Sermon.query(Sermon.church_key == ndb.Key('Church', int(church_id)),
                        Sermon.publish == True).fetch()


def get_sermons_by_pastor(pastor):
    pass


def save_comment(data):
    if 'comment' not in data or not data['comment'].strip():
        raise Exception('comment is required and cannot be empty')
    if 'user_key' not in data or not isinstance(data['user_key'], ndb.Key):
        raise Exception('user id is required')
    if 'ref_key' not in data or not isinstance(data['ref_key'], ndb.Key):
        raise Exception('ref_key is required')
    comment = Comment()
    comment.comment = data['comment']
    comment.ref_key = data['ref_key']
    if 'reply_to' in data:
        if isinstance(data['reply_to'], ndb.Key):
            comment.reply_to = data['reply_to']
        else:
            comment.reply_to = ndb.Key('Comment', int(data['reply_to']))
    comment.created_by = data['user_key']
    comment.id = comment.put()
    if comment.id and comment.reply_to:
        parent = comment.reply_to.get()
        parent.replies_key.append(comment.id)
        parent.reply_count += 1
        parent.put()
    return comment


def save_sermon_note(data):
    if 'notes' not in data:
        raise Exception('notes is required and cannot be empty')
    if 'user_key' not in data:
        raise Exception('user id is required')
    if 'sermon_key' not in data:
        raise Exception('sermon id is required')

    logging.info(data)

    sermon = SermonNote.get_by_id(int(data['id'])) if 'id' in data else SermonNote()
    sermon.notes = data['notes']
    sermon.sermon_key = data['sermon_key'] if isinstance(data['sermon_key'], ndb.Key) else Sermon.get_by_id(
            int(data['sermon_key'])).key
    sermon.created_by = data['user_key'] if isinstance(data['user_key'], ndb.Key) else User.get_by_id(
            int(data['user_key'])).key
    sermon.id = sermon.put()
    return sermon


def get_sermons():
    pass


def get_sermon_note(user_id, sermon_id):
    return SermonNote.query(SermonNote.created_by == ndb.Key('User', int(user_id)),
                            SermonNote.sermon_key == ndb.Key('Sermon', int(sermon_id))).get()


def get_comment_replies(comment_id, cursor=None):

    try:
        page_size = 10
        q = Comment.query(Comment.reply_to == ndb.Key('Comment', int(comment_id))).order(-Comment.created_at)
        #q.map(callback)
        if cursor:
            comments, next_curs, more = q.fetch_page(page_size, start_cursor=cursor)
        else:
            comments, next_curs, more = q.fetch_page(page_size)

        return {
            'comments': comments,
            'next': next_curs.url_safe() if more and next_curs else None
        }
    except Exception as e:
        print e


def get_comments(type, id, cursor):
    page_size = 20
    q = Comment.query(Comment.ref_key == ndb.Key(type, int(id)),
                      Comment.reply_to == None).order(-Comment.created_at)
    if cursor:
        comments, next_curs, more = q.fetch_page(page_size, start_cursor=cursor)
    else:
        comments, next_curs, more = q.fetch_page(page_size)

    return {
        'comments': comments,
        'next': next_curs.url_safe() if more and next_curs else None
    }


def get_sermon_comments(sermon_id, cursor):
    return get_comments('Sermon', sermon_id, cursor)


def like_sermon(sermon_id, user_id):
    logging.info(sermon_id)
    logging.info(user_id)
    user = User.get_by_id(int(user_id))
    sermon = Sermon.get_by_id(int(sermon_id))
    if sermon.key not in user.fav_sermon_keys:
        user.fav_sermon_keys.append(sermon.key)
        if not sermon.likes:
            sermon.likes = 0
        sermon.likes += 1
        sermon.put()
        user.put()
        return True


def unlike_sermon(sermon_id, user_id):
    user = User.get_by_id(int(user_id))
    sermon = Sermon.get_by_id(int(sermon_id))
    if sermon.key in user.fav_sermon_keys:
        user.fav_sermon_keys.remove(sermon.key)
        sermon.likes -= 1
        sermon.put()
        user.put()
        return True

def like_comment(comment_id, user_id):
    comment = Comment.get_by_id(int(comment_id))
    user_key = ndb.Key('User', int(user_id))
    if user_key not in comment.likes_key:
        comment.likes_key.append(user_key)
        comment.like_count += 1
        comment.put()
        return True

def unlike_comment(comment_id, user_id):
    comment = Comment.get_by_id(int(comment_id))
    user_key = ndb.Key('User', int(user_id))
    if user_key in comment.likes_key:
        comment.likes_key.remove(user_key)
        comment.like_count -= 1
        comment.put()
        return True

def log_sermon_view(sermon_id, user_id):
    sermon = Sermon.get_by_id(int(sermon_id))
    user = User.get_by_id(int(user_id))
    if user and sermon and user.key not in sermon.viewers_key:
        sermon.viewers_key.append(user.key)
        sermon.views = len(sermon.viewers_key)
        sermon.put()
        return True
