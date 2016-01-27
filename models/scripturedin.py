import time
import logging
import datetime
from google.appengine.api import users
from google.appengine.datastore.datastore_query import Cursor
from google.appengine.ext import ndb

from webapp2_extras import security
from webapp2_extras.appengine.auth.models import User as AuthUser
from google.appengine.api import memcache
from service import util

# alias ndb types
type_string = ndb.StringProperty
type_text = ndb.TextProperty
type_int = ndb.IntegerProperty
type_json = ndb.JsonProperty
type_key = ndb.KeyProperty
type_struct = ndb.StructuredProperty
type_bool = ndb.BooleanProperty
type_date = ndb.DateProperty
type_datetime = ndb.DateTimeProperty


PRIVACY = ('public', 'members')


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
    title = type_string(default='')
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


class Feed(BaseModel):
    ref_key = type_key()
    privacy = type_string(choices=PRIVACY, repeated=True)


class Notification(ndb.Model):
    type = type_string()
    ref_key = type_key


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
    summary = type_text()
    note = type_text()
    # pastor_key = type_key()
    church_key = type_key()
    publish = type_bool()
    questions = type_json()
    cal_color = type_string()  # calendar color
    comment_count = type_int(default=0)
    like_count = type_int(default=0)
    view_count = type_int(default=0)
    viewers_key = type_key(kind='User', repeated=True)
    likers_key = type_key(kind='User', repeated=True)
    commenters_key = type_key(kind='User', repeated=True)
    privacy = type_string(choices=PRIVACY)


class Tags(BaseModel):
    tag = type_string()


class Request(BaseModel):
    headline = type_string()
    context = type_string()
    tag_keys = type_key(repeated=True)
    commentators_key = type_key(repeated=True)
    # list of dict {type: 'email' : email: ''} {type: 'twitter', handler: ''}
    invited_commentators = ndb.JsonProperty()
    # {book: '', 'chapter': ''; 'translation':'',
    # selection:[{verse: 12, selected: ''},...]}
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
    if 'name' not in data or not data['name'] or len(
            get_church_by_name(data['name'])) > 0:
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
            if key == 'title':
                user.title = val
        user.put()
    return user


def _update_sermon(user_id, data, publish=False):
    if not isinstance(data, dict):
        raise Exception('data should be a dictionary')
    if 'title' not in data or not data['title']:
        raise Exception('sermon requires title')
    if 'scripture' not in data or not isinstance(data['scripture'],
                                                 list) or not data['scripture']:
        raise Exception('sermon requires at least one scripture')
    if ('notes' not in data or not isinstance(data['notes'], list)
        or not data['notes']) and ('note' not in data or not data['note']):
        raise Exception('sermon requires at a note. Note can be list of notes '
                        'or free text')

    user = get_user_by_id(user_id)
    if not user.is_pastor:
        raise Exception('user must be a pastor to create a sermon')

    sermon = get_sermon(data['id']) if 'id' in data else Sermon(
            created_by=user.key)
    sermon.title = data['title']
    sermon.created_by = user.key
    sermon.publish = publish
    if 'date' in data:
        sermon.date = []
        for d in data['date']:
            try:
                sermon.date.append(
                        datetime.datetime.utcfromtimestamp(float(d) / 1000.0))
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

    if 'summary' in data:
        sermon.summary = data['summary']

    if 'questions' in data and data['questions']:
        qsts = []
        for q in data['questions']:
            if 'content' in q and q['content']:
                qsts.append(q)
        sermon.questions = qsts

    if 'privacy' in data and data['privacy'].lower() in PRIVACY:
        sermon.privacy = data['privacy'].lower()
    else:
        sermon.privacy = 'public'

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
    """Add a comment.

    Args:
        data: Dict with details about the comment. The dict should contains at
        the following fields:
            comment: The actual comment being posted
            user_key: The key of the user doing the commenting
            ref_key: The key of the object being commented on
            reply_to: Optional key or id of the comment for which this
            comment is a reply to.

    Returns:
        A comment object

    """
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
        # comment is a reply, add the key to the replies_key list of the
        # original comment, and increment the reply_count
        parent = comment.reply_to.get()
        parent.replies_key.append(comment.id)
        parent.reply_count += 1
        parent.put()

    if comment.ref_key.kind() == 'Sermon':
        # if commenting on a sermon, increment the number of comments and add
        #  the user to the list of commenters
        sermon = comment.ref_key.get()
        if not sermon.commenters_key:
            sermon.commenters_key = []
        if comment.created_by not in sermon.commenters_key:
            sermon.commenters_key.append(comment.created_by)
            sermon.comment_count = len(sermon.commenters_key)
            sermon.put()

    return comment


def save_sermon_note(data):
    if 'notes' not in data:
        raise Exception('notes is required and cannot be empty')
    if 'user_key' not in data:
        raise Exception('user id is required')
    if 'sermon_key' not in data:
        raise Exception('sermon id is required')

    logging.info(data)

    sermon = SermonNote.get_by_id(
            int(data['id'])) if 'id' in data else SermonNote()
    sermon.notes = data['notes']
    if isinstance(data['sermon_key'], ndb.Key):
        sermon.sermon_key = data['sermon_key']
    else:
        sermon.sermon_key = Sermon.get_by_id(int(data['sermon_key'])).key

    if isinstance(data['user_key'], ndb.Key):
        sermon.created_by = data['user_key']
    else:
        sermon.created_by = User.get_by_id(int(data['user_key'])).key
    sermon.id = sermon.put()
    return sermon


def get_sermons():
    pass


def get_sermon_note(user_id, sermon_id):
    return SermonNote.query(
            SermonNote.created_by == ndb.Key('User', int(user_id)),
            SermonNote.sermon_key == ndb.Key('Sermon', int(sermon_id))).get()


def get_comment_replies(comment_id, cursor=None, page_size=10):
    """Returns replies to a comment.

    Args:
        comment_id: The id of the comment for which we want the replies.
        cursor: An option value that specifies what point to start fetching the
        replies from.
        page_size: The number of items to return.

    Returns:
        A dict similar the response of the {get_comments} function.
    """
    try:

        q = Comment.query(
                Comment.reply_to == ndb.Key('Comment', int(comment_id))).order(
                -Comment.created_at)
        if cursor:
            comments, next_curs, more = q.fetch_page(page_size,
                                                     start_cursor=cursor)
        else:
            comments, next_curs, more = q.fetch_page(page_size)

        replies = []
        for c in comments:
            reply = util.model_to_dict(c)
            reply['user'] = User.query(User.key == c.created_by).get(
                    projection=[User.first_name, User.last_name, User.title])
            replies.append(reply)

        return {
            'comments': replies,
            'next': next_curs.url_safe() if more and next_curs else None
        }
    except Exception as e:
        print e


def get_comments(type, id, cursor=None, page_size=20):
    """ Returns comments associated with the object type with the input id.

    If a cursor is provided, start querying from the cursor. We also include the
    replies with the result, the replies also paged, so a cursor is returned
    along with the replies for the caller to load more replies.

    Args:
        type: A string representing the Kind of object.
        id: The object id.
        cursor: An optional value that when specified indicates the starting
        point of the fetch.
        page_size: The number of items to return.

    Returns:
        Returns a dict with a key (comments) mapped to the list of comments and
        a key (next) with the cursor value.
        The field comments contains an array of comment objects represent as
        dict. Each comment has the user field with info of the creator,
        as well as field replies that contains dict with the replies to the
        comment.
        Example
        {
          "comments": [
            {
              "like_count": 1,
              "reply_to": null,
              "user": {
                "title": "Pastor",
                "last_name": "Anjorin Jnr",
                "first_name": "Tola",
                "id": 5629499534213120
              },
              ...
               "likes_key": [
                5629499534213120
              ],
              "comment": "This is comment",
              "created_at": 1452982257257,
              "replies": {
                "comments": [
                  {
                    ...
                    "user": {
                      "title": "",
                      "last_name": "Anjorin",
                      "first_name": "Ebby",
                      "id": 5733953138851840
                    },
                    "comment": "reply...",
                  }
                ],
                "next": null
              }
            }
          ],
          "next": null
        }
    """
    q = Comment.query(Comment.ref_key == ndb.Key(type, int(id)),
                      Comment.reply_to == None).order(-Comment.created_at)
    if cursor:
        comments, next_curs, more = q.fetch_page(page_size, start_cursor=cursor)
    else:
        comments, next_curs, more = q.fetch_page(page_size)

    data = []
    for c in comments:
        comment = util.model_to_dict(c)
        comment['ref_kind'] = c.ref_key.kind()
        comment['replies'] = get_comment_replies(c.key.id())
        comment['user'] = User.query(User.key == c.created_by).get(
                projection=[User.first_name, User.last_name, User.title])
        data.append(comment)

    return {
        'comments': data,
        'next': next_curs.url_safe() if more and next_curs else None
    }


def get_sermon_comments(sermon_id, cursor):
    return get_comments('Sermon', sermon_id, cursor)


def like_sermon(sermon_id, user_id):
    """Action for a user to like a sermon.

    When a user likes a sermon, we add the sermon to the user's favorite
    sermon list. And also add the user to the list of people who likes the
    sermon.

    Args:
        sermon_id: Id of the sermon being liked
        user_id: Id of the user doing the liking

    """
    user = User.get_by_id(int(user_id))
    sermon = Sermon.get_by_id(int(sermon_id))
    if sermon.key not in user.fav_sermon_keys:
        user.fav_sermon_keys.append(sermon.key)
        sermon.likers_key.append(user.key)
        if not sermon.like_count:
            sermon.like_count = 0
        sermon.like_count += 1
        sermon.put()
        user.put()
        return True


def unlike_sermon(sermon_id, user_id):
    """Action for a user to unlike a sermon.

    When a user unlikes a sermon, we remove the sermon to the user's favorite
    sermon list. And also remove the user to the list of people who likes the
    sermon.

    Args:
        sermon_id: Id of the sermon being liked
        user_id: Id of the user doing the liking
    """
    user = User.get_by_id(int(user_id))
    sermon = Sermon.get_by_id(int(sermon_id))
    if sermon.key in user.fav_sermon_keys:
        user.fav_sermon_keys.remove(sermon.key)
        sermon.likers_key.remove(user.key)
        sermon.like_count -= 1
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
        sermon.view_count = len(sermon.viewers_key)
        sermon.put()
        return True


def get_feed(user_id, cursor=None, last_time=None, page_size=15):
    """Returns news feed for a user.

    A feed is generated when events such as publishing a new sermon is created.
    When such events happens, we create a feed entry that get's displayed on
    the appropriate user's wall. To get feeds for a user we query all
    available feeds an apply a filter to determine what's applicable to the
    user.

    Args:
        user_id: The id of the user we are retrieving feeds for.
        cursor: An optional value that specifies that starting point to fetch
        the feeds from.
        last_time: An optional value that specifies that only feeds created
        after this value should be return.
        page_size: An optional number of items to return. Defaults to 15.

    Returns:
        A dict with 3 keys: feeds, next and ts. The feeds maps to a list of
        feed items, the next is the cursor and ts is a timestamp of the most
        recent feed at the time of query
    """
    if isinstance(cursor, str):
        cursor = Cursor(urlsafe=cursor)

    user = User.get_by_id(user_id)

    # apply this function to each item and return a result if the feed is
    # applicable to the user
    def filter_feed(item):
        if item.ref_key.kind() == 'Sermon':
            sermon = item.ref_key.get()
            if user.church_key and user.church_key == sermon.church_key:
                sermon_dict = util.model_to_dict(sermon)
                sermon_dict['kind'] = sermon.key.kind()
                sermon_dict['comments'] = get_comments(sermon.key.kind(),
                                                       sermon.key.id(),
                                                       page_size=5)
                sermon_dict['user'] = User.query(
                        User.key == sermon.created_by).get(
                        projection=[User.first_name, User.last_name,
                                    User.title])
                return sermon_dict

    if last_time:
        # query feeds created after this time
        q = Feed.query(Feed.created_at > last_time).order(-Feed.created_at)
    else:
        # query feeds from the most recent
        q = Feed.query().order(-Feed.created_at)

    if cursor:
        # return feeds from this point
        feeds, next_curs, more = q.fetch_page(page_size, start_cursor=cursor)
    else:
        print 'gere'
        feeds, next_curs, more = q.fetch_page(page_size)

    filtered = []

    for f in feeds:
        resp = filter_feed(f)
        if resp:
            filtered.append(resp)

    return {
        'feeds': filtered,
        'next': next_curs.urlsafe() if more and next_curs else None,
        'ts': feeds[0].created_at if feeds else None
    }


def create_feed(obj):
    feed = Feed()
    feed.ref_key = obj.key
    feed.created_by = obj.created_by
    feed.put()
