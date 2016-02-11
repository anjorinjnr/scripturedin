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
from google.appengine.api import search

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

PRIVACY_PUBLIC = 'public'
PRIVACY_MEMBER = 'members'
PRIVACY_ME = 'only me'
PRIVACY_FRIENDS = 'friends'
PRIVACY_OPTIONS = (PRIVACY_PUBLIC, PRIVACY_MEMBER, PRIVACY_FRIENDS, PRIVACY_ME)


class BaseModel(ndb.Model):
    created_at = type_int()
    created_by = type_key()
    modified_at = type_int()
    deleted = type_bool()
    deleted_at = type_int()

    _has_index = False

    def _pre_put_hook(self):
        """Pre-put operations. Store UTC timestamp(s) in milliseconds."""
        now = int(time.time() * 1000)
        self.modified_at = now
        if not self.created_at:
            self.created_at = now
        if self.deleted:
            self.deleted_at = now

    def _post_put_hook(self, future):
        """Post-put operations. Store UTC timestamp(s) in milliseconds."""
        o = future.get_result().get()
        if o._has_index:
            o.update_index()


class File(BaseModel):
    blobstore_key = ndb.TextProperty()
    file_name = ndb.StringProperty()
    file_path = ndb.StringProperty()
    file_type = ndb.StringProperty()


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
    profile_photo = type_string()

    _has_index = True

    created_at = type_int()
    modified_at = type_int()
    deleted = type_bool()
    deleted_at = type_int()

    def _pre_put_hook(self):
        """Pre-put operations. Store UTC timestamp(s) in milliseconds."""
        now = int(time.time() * 1000)
        self.modified_at = now
        if not self.created_at:
            self.created_at = now
        if self.deleted:
            self.deleted_at = now

    def _post_put_hook(self, future):
        """Post-put operations. Store UTC timestamp(s) in milliseconds."""
        future.get_result().get().update_index()

    @classmethod
    def get_index(cls):
        return search.Index('USER')

    def update_index(self):
        """Create and update document index for user"""
        full_name = ''
        try:
            doc_id = self.key.id()
            # todo index other fields
            if self.title:
                full_name = '%s %s %s' % (self.title, self.first_name, self.last_name)
            else:
                full_name = '%s %s' % (self.first_name, self.last_name)

            doc = search.Document(doc_id=str(doc_id),
                                  fields=[search.TextField(name='title', value=str(self.title)),
                                          search.TextField(name='first_name', value=str(self.first_name)),
                                          search.TextField(name='last_name', value=str(self.last_name)),
                                          search.TextField(name='full_name', value=full_name)
                                          ])
            User.get_index().put(doc)
        except (search.Error, UnicodeEncodeError) as e:
            logging.error('Error updating index %s: %s' % (full_name, e.message))

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
    privacy = type_string(choices=PRIVACY_OPTIONS, repeated=True)


class Notification(ndb.Model):
    type = type_string()
    ref_key = type_key


class Church(BaseModel):
    name = type_string()
    address = type_string()
    website = type_string()
    country = type_string()
    state = type_string()
    city = type_string()
    denom = type_string()

    _has_index = True

    @classmethod
    def get_index(cls):
        return search.Index('CHURCH')

    def update_index(self):
        """Create and update document index for church"""
        try:
            doc_id = self.key.id()
            # todo index other fields
            doc = search.Document(doc_id=str(doc_id),
                                  fields=[search.TextField(name='name', value=str(self.name)),
                                          search.TextField(name='city', value=str(self.city)),
                                          search.TextField(name='website', value=str(self.website))])
            Church.get_index().put(doc)
        except (search.Error, UnicodeEncodeError) as e:
            logging.error('Error updating index %s: %s ' % (self.name, e.message))


class SermonNote(BaseModel):
    sermon_key = type_key(kind='Sermon')
    notes = type_string()
    pastor = type_string()
    title = type_string()
    pastor_key = type_key(kind='User')
    church_key = type_key(kind='Church')


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
    privacy = type_string(choices=PRIVACY_OPTIONS, default=PRIVACY_PUBLIC)

    _has_index = True

    @classmethod
    def get_index(cls):
        return search.Index('SERMON')

    def update_index(self):
        """Create and update document index for sermon"""
        try:
            doc_id = self.key.id()
            # todo index other fields
            doc = search.Document(doc_id=str(doc_id), fields=[search.TextField(name='title', value=str(self.title))])
            Sermon.get_index().put(doc)
        except (search.Error, UnicodeEncodeError) as e:
            logging.error('Error updating index %s ', e)


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


class Post(BaseModel):
    content = type_text()
    privacy = type_string(choices=PRIVACY_OPTIONS, default=PRIVACY_PUBLIC)
    like_count = type_int(default=0)
    view_count = type_int(default=0)
    comment_count = type_int(default=0)
    likers_key = type_key(kind='User', repeated=True)
    viewers_key = type_key(kind='User', repeated=True)
    commenters_key = type_key(kind='User', repeated=True)

    _has_index = True

    @classmethod
    def get_index(cls):
        return search.Index('POST')

    def update_index(self):
        """Create and update document index"""
        try:
            doc_id = self.key.id()
            # todo index other fields
            doc = search.Document(doc_id=str(doc_id),
                                  fields=[search.HtmlField(name='content', value=str(self.content))])
            Post.get_index().put(doc)
        except (search.Error, UnicodeEncodeError) as e:
            logging.error('Error updating index %s ', e)


def create_feed(obj):
    feed = Feed.query(Feed.ref_key == obj.key).get()
    if feed is None:
        feed = Feed()
        feed.ref_key = obj.key
        feed.created_by = obj.created_by
        feed.put()
    return feed


def save_post(user_key, data):
    logging.info(data)
    if not isinstance(user_key, ndb.Key):  # todo may want to actually validate the key
        raise Exception('a valid user is required')
    if 'content' not in data or len(u''.join((data['content'])).encode('utf-8').strip()) == 0:
        raise Exception('a post cannot be empty.')
    post = Post.get_by_id(int(data['id'])) if 'id' in data else Post()
    post.content = data['content']
    post.created_by = user_key
    post.privacy = data['privacy'] if 'privacy' in data and data['privacy'] in PRIVACY_OPTIONS else PRIVACY_PUBLIC
    post.key = post.put()
    return post


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
                if isinstance(val, bool):
                    user.is_pastor = val
                elif isinstance(val, str) and val.lower() in ['t', 'true', 'y', 'yes']:
                    user.is_pastor = True
                else:
                    user.is_pastor = False
            if key == 'church' and isinstance(val, str):
                user.church_key = save_church({'name': val}).key
            if key in ['church_id', 'church_key']:
                user.church_key = ndb.Key('Church', val)
            if key == 'title':
                user.title = val
            if key == 'first_name':
                user.first_name = val
            if key == 'last_name':
                user.last_name = val

        user.put()
    return user


def find_users(query, pastor_only=False):
    """Find sermon that match for the query."""
    try:
        index = User.get_index()
        # todo implement paging with cursors
        search_results = index.search(query)
        results = []
        for doc in search_results:
            add = True
            user = User.get_by_id(int(doc.doc_id))
            if pastor_only and user and user.is_pastor:
                add = False

            if add:
                res = {'id': int(doc.doc_id)}
                for field in doc.fields:
                    res[field.name] = field.value
                results.append(res)

        return results
    except search.Error as e:
        logging.error('Error searching sermon  %s ' % e)


def find_church(query):
    """Find churches that match for the query."""
    try:
        index = Church.get_index()
        # todo implement paging with cursors
        search_results = index.search(query)
        results = []
        for doc in search_results:
            res = {'id': int(doc.doc_id)}
            for field in doc.fields:
                res[field.name] = field.value
            results.append(res)
        return results
    except search.Error as e:
        logging.error('Error searching sermon  %s ' % e)


def find_sermon(query, user_key=None):
    """Find sermon that match for the query."""

    user = user_key.get() if user_key else None

    def filter(sermon):
        if sermon is None: return
        """Filter sermon and add extra data."""
        if sermon.privacy == PRIVACY_MEMBER and (not user or user.church_key != sermon.church_key):
            return

        pastor = sermon.created_by.get()
        church = sermon.church_key.get()
        sermon_ = util.model_to_dict(sermon)
        sermon_['pastor'] = {
            'id': pastor.key.id(),
            'title': pastor.title,
            'first_name': pastor.first_name,
            'last_name': pastor.last_name
        }
        sermon_['church'] = {
            'id': church.key.id(),
            'name': church.name
        }
        return sermon_

    try:
        index = Sermon.get_index()
        # todo implement paging with cursors
        search_results = index.search(query)
        results = []
        # for doc in search_results:
        #     res = {'doc_id': int(doc.doc_id)}
        #     for field in doc.fields:
        #         res[field.name] = field.value
        #     results.append(res)
        #
        # create list of keys from search results
        for doc in search_results:
            results.append(ndb.Key('Sermon', int(doc.doc_id)))

        # query all found items
        sermons = ndb.get_multi(results)
        results = []
        # apply filter to found results
        for sermon in sermons:
            res = filter(sermon)
            if res:
                results.append(res)
        return results
    except search.Error as e:
        logging.error('Error searching sermon  %s ' % e)


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

    if 'privacy' in data and data['privacy'].lower() in PRIVACY_OPTIONS:
        sermon.privacy = data['privacy'].lower()
    else:
        sermon.privacy = PRIVACY_PUBLIC

    sermon.church_key = user.church_key
    sermon.key = sermon.put()

    return sermon


def save_sermon(user_id, data):
    return _update_sermon(user_id, data, False)


def publish_sermon(user_id, data):
    return _update_sermon(user_id, data, True)


def get_sermons_by_church(church_id, cursor=None, page_size=100):
    """Return published sermons in this church.

    Args:
        church_id: the church id
        cursor: optional cursor for paging
        page_size: optional page size

    Returns:
        Returns dict with results
    """

    if isinstance(cursor, str):
        cursor = Cursor(urlsafe=cursor)

    church_key = ndb.Key('Church', int(church_id))
    total = Sermon.query(Sermon.church_key == church_key, Sermon.publish == True).count(keys_only=True)
    q = Sermon.query(Sermon.church_key == church_key, Sermon.publish == True).order(-Sermon.created_at)

    if cursor:
        sermons, next_curs, more = q.fetch_page(page_size, start_cursor=cursor)
    else:
        sermons, next_curs, more = q.fetch_page(page_size)

    data = [_process_sermon(sermon) for sermon in sermons]
    return {
        'sermons': data,
        'next': next_curs.urlsafe() if more and next_curs else None,
        'total': total,
        'page_size': page_size
    }


def get_sermons_by_pastor(pastor_id, cursor=None, page_size=100):
    """Return published sermons created by specified pastor.

    Args:
        pastor_id: the pastor id
        cursor: optional cursor for paging
        page_size: optional page size

    Returns:
        Returns dict with results

    """
    if isinstance(cursor, str):
        cursor = Cursor(urlsafe=cursor)

    pastor_key = ndb.Key('User', int(pastor_id))
    total = Sermon.query(Sermon.created_by == pastor_key, Sermon.publish == True).count(keys_only=True)
    q = Sermon.query(Sermon.created_by == pastor_key, Sermon.publish == True).order(-Sermon.created_at)

    if cursor:
        sermons, next_curs, more = q.fetch_page(page_size, start_cursor=cursor)
    else:
        sermons, next_curs, more = q.fetch_page(page_size)

    data = [_process_sermon(sermon) for sermon in sermons]
    return {
        'sermons': data,
        'next': next_curs.urlsafe() if more and next_curs else None,
        'total': total,
        'page_size': page_size
    }


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

    ref = comment.ref_key.get()
    if not ref.commenters_key:
        ref.commenters_key = []
    if comment.created_by not in ref.commenters_key:
        ref.commenters_key.append(comment.created_by)
        ref.comment_count = len(ref.commenters_key)
        ref.put()

    # if comment.ref_key.kind() == 'Sermon':
    #     # if commenting on a sermon, increment the number of comments and add
    #     #  the user to the list of commenters
    #     sermon = comment.ref_key.get()
    #     if not sermon.commenters_key:
    #         sermon.commenters_key = []
    #     if comment.created_by not in sermon.commenters_key:
    #         sermon.commenters_key.append(comment.created_by)
    #         sermon.comment_count = len(sermon.commenters_key)
    #         sermon.put()

    return comment


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
                projection=[User.first_name, User.last_name, User.title, User.profile_photo])
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
            projection=[User.first_name, User.last_name, User.profile_photo, User.title])
        data.append(comment)

    return {
        'comments': data,
        'next': next_curs.url_safe() if more and next_curs else None
    }


def get_sermon_comments(sermon_id, cursor):
    return get_comments('Sermon', sermon_id, cursor)


def like_post(post_id, user_key):
    post = Post.get_by_id(int(post_id))
    if user_key not in post.likers_key:
        post.likers_key.append(user_key)
        post.like_count += 1
        post.put()
        return True

def unlike_post(post_id, user_key):
    post = Post.get_by_id(int(post_id))
    if user_key in post.likers_key:
        post.likers_key.remove(user_key)
        post.like_count -= 1
        post.put()
        return True

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


# apply this function to each item and return a result if the feed is
# applicable to the user
def process_feed(feed, user, ref_object=None):
    valid = False
    item = feed.ref_key.get() if ref_object is None else ref_object
    if feed.ref_key.kind() == 'Sermon':
        if item.privacy == PRIVACY_PUBLIC:
            valid = True
        elif item.privacy == PRIVACY_MEMBER and user.church_key and user.church_key == item.church_key:
            valid = True
    elif feed.ref_key.kind() == 'Post':
        # todo, implement friends later
        if item.privacy == PRIVACY_PUBLIC:
            valid = True
        elif item.privacy == PRIVACY_ME and item.created_by == user.key:
            valid = True

    if valid:
        feed_item = util.model_to_dict(item)
        feed_item['kind'] = item.key.kind()
        feed_item['feed_id'] = feed.key.id()
        feed_item['comments'] = get_comments(item.key.kind(), item.key.id(), page_size=5)
        feed_item['user'] = get_mini_user_info(item.created_by)
        return feed_item


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
        feeds, next_curs, more = q.fetch_page(page_size)

    filtered = []

    for f in feeds:
        resp = process_feed(f, user)
        if resp:
            filtered.append(resp)

    return {
        'feeds': filtered,
        'next': next_curs.urlsafe() if more and next_curs else None,
        'ts': feeds[0].created_at if feeds else None
    }


def get_mini_user_info(user_key):
    user = user_key.get()
    return {'id': user.key.id(),
            'title': user.title,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'profile_photo': user.profile_photo
            }


def get_mini_church_info(church_key):
    church = church_key.get()
    return {'id': church.key.id(),
            'name': church.name,
            'website': church.website,
            'city': church.city
            }


def _process_sermon(sermon):
    sermon_ = util.model_to_dict(sermon)
    sermon_['pastor'] = get_mini_user_info(sermon.created_by)
    sermon_['church'] = get_mini_church_info(sermon.church_key)
    return sermon_


def _process_note(note):
    logging.info(note)
    note_ = util.model_to_dict(note)
    if note.sermon_key:
        sermon = note.sermon_key.get()
        note_['sermon'] = {
            'id': sermon.key.id(),
            'title': sermon.title,
            'pastor': get_mini_user_info(sermon.created_by),
            'church': get_mini_church_info(sermon.church_key)
        }
    else:
        if note.church_key:
            note_['church'] = get_mini_church_info(note.church_key)
        if note.pastor_key:
            note_['pastor'] = get_mini_user_info(note.pastor_key)
    return note_


def get_note(user_key, note_id):
    """Return a note saved by a user."""

    note = SermonNote.get_by_id(int(note_id))

    # todo apply privacy/share settings, so others with access can get a note

    # only return note if requested by creator
    if note and note.created_by == user_key:
        return _process_note(note)


def get_user_notes(user_key, cursor=None, page_size=15):
    """Return (sermon) notes created by this user."""

    if isinstance(cursor, str):
        cursor = Cursor(urlsafe=cursor)

    # todo consider using async here
    total = SermonNote.query(SermonNote.created_by == user_key).count(keys_only=True)
    if cursor:
        notes, next_curs, more = SermonNote.query(SermonNote.created_by == user_key).order(
            -SermonNote.created_at).fetch_page(page_size, start_cursor=cursor)
    else:
        notes, next_curs, more = SermonNote.query(SermonNote.created_by == user_key).order(
            -SermonNote.created_at).fetch_page(page_size)

    data = [_process_note(note) for note in notes]
    return {
        'notes': data,
        'next': next_curs.urlsafe() if more and next_curs else None,
        'total': total,
        'page_size': page_size
    }


def save_sermon_note(data):
    if 'notes' not in data:
        raise Exception('notes is required and cannot be empty')
    if 'user_key' not in data:
        raise Exception('user id is required')
    if 'sermon_key' not in data:
        raise Exception('sermon id is required')

    logging.info(data)

    sermon_note = SermonNote.get_by_id(
        int(data['id'])) if 'id' in data else SermonNote()
    sermon_note.notes = data['notes']
    if isinstance(data['sermon_key'], ndb.Key):
        sermon_note.sermon_key = data['sermon_key']
    else:
        sermon_note.sermon_key = Sermon.get_by_id(int(data['sermon_key'])).key

    if isinstance(data['user_key'], ndb.Key):
        sermon_note.created_by = data['user_key']
    else:
        sermon_note.created_by = User.get_by_id(int(data['user_key'])).key
    sermon_note.id = sermon_note.put()
    return sermon_note


def save_note(user_key, data):
    """Create or update new note.

    A user can create notes for an existing sermon or for a non-existing sermon.

    Args:
        user_key: Id of the user
        data: Dict with information about the note to be saved

    Returns:
        Created/saved note
    """
    if 'sermon' in data and 'id' in data['sermon']:
        return save_sermon_note({
            'sermon_key': data['sermon']['id'],
            'notes': data['notes'],
            'user_key': user_key
        })
    else:
        if 'notes' not in data:
            raise Exception('notes is required')
        if 'title' not in data:
            raise Exception('title is required')
        sermon_note = SermonNote.get_by_id(int(data['id'])) if 'id' in data else SermonNote(created_by=user_key)
        sermon_note.notes = data['notes']
        sermon_note.title = data['title']
        if 'pastor_id' in data and data['pastor_id']:
            sermon_note.pastor_key = ndb.Key('User', int(data['pastor_id']))
        elif 'pastor' in data:
            sermon_note.pastor = data['pastor']
        # else:
        #     raise Exception('pastor name or id is required')

        if 'church_id' in data and data['church_id']:
            sermon_note.church_key = ndb.Key('Church', int(data['church_id']))
        elif sermon_note.church_key is None:
            if 'church' in data and isinstance(data['church'], str) and Church.query(
                            Church.name == data['church']).get() is None:
                ch = Church(name=data['church'])
                ch.key = ch.put()
                sermon_note.church_key = ch.key
        sermon_note.id = sermon_note.put()
        return sermon_note


def get_object_feed(object_key):
    return Feed.query(Feed.ref_key == object_key).get()

def delete_post(post_id, key):
    post = Post.get_by_id(int(post_id))
    if post.created_by == key:
        feed = get_object_feed(post.key)
        ndb.delete_multi([feed.key, post.key])
        return True