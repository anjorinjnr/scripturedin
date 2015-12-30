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


class Church(BaseModel):
    name = type_string()
    name_lower_case = type_string()
    address = type_string()
    website = type_string()
    country = type_string()
    state = type_string()
    city = type_string()
    denom = type_string()


class SermonPoint(ndb.Model):
    message = type_string()
    scriptures = type_json()


class Sermon(BaseModel):
    title = type_string()
    date = type_datetime(repeated=True)
    scripture = type_json()
    notes = type_json()  # list of note objects {content: ''}
    note = type_string()
    pastor_key = type_key()
    publish = type_bool()
    questions = type_json()


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
    res = User.query(User.email == email).fetch()
    if res:
        return res[0]


def get_object(model, id):
    return ndb.Key(model, int(id)).get()


def get_user_by_id(id):
    return ndb.Key('User', int(id)).get()


def get_sermon(id):
    return get_object('Sermon', id)


def create_user(first_name, last_name, email):
    user = users.User('email')


def get_churches():
    churches = memcache.get('churches')
    if churches is not None:
        return churches
    else:
        churches = Church.query().fetch()
        memcache.set('churches', churches)
        return churches


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
            date = d.split('/')
            sermon.date.append(datetime.datetime(int(date[0]), int(date[1]), int(date[2])))
    # @todo validate scripture
    sermon.scripture = data['scripture']
    if 'notes' in data:
        notes = []
        for n  in data['notes']:
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
    sermon.key = sermon.put()
    return sermon


def save_sermon(user_id, data):
    return _update_sermon(user_id, data, False)


def publish_sermon(user_id, data):
    return _update_sermon(user_id, data, True)
