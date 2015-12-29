import time
import logging
import datetime
from google.appengine.api import users
from google.appengine.ext import ndb

from webapp2_extras import security
from webapp2_extras.appengine.auth.models import User as AuthUser
from google.appengine.api import memcache
from service import util



type_string = ndb.StringProperty
type_int = ndb.IntegerProperty
type_json = ndb.JsonProperty
type_key = ndb.KeyProperty
type_struct = ndb.StructuredProperty
type_bool = ndb.BooleanProperty
type_date = ndb.DateProperty


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
    date = type_date(repeated=True)
    main_scripture = type_struct(Scripture, repeated=True)
    points = type_struct(SermonPoint, repeated=True)
    pastor_key = type_key()
    publish = type_bool()



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
    return  ndb.Key(model, int(id)).get()

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


def publish_sermon(data):
    if 'title' not in data or not data['title']:
        raise Exception('sermon requires title')
    if 'scriptures' not in data or  not isinstance(data['scriptures'], 'list') or not data['scriptures']:
        raise Exception('sermon requires at least one scripture')
    if 'points' not in data or  not isinstance(data['points'], 'list') or not data['points']:
        raise Exception('sermon requires at least one point')
    if 'id' in data:
        sermon = get_sermon(data['id'])

    sermon = sermon or Sermon()
    sermon.title = data['title']
    if 'dates' in data:
        sermon.date = []
        for d in data['dates']:
            date = d.split('/')
            sermon.data.append(datetime.datetime(date[0], date[1], date[2]))

    scripture = Scripture()



    sermon.dates = []




