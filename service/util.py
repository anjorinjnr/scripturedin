"""Useful utilities for the all handler modules."""

import json
import logging
from google.appengine.api import mail
from google.appengine.api import users
from google.appengine.ext import ndb
from google.appengine.api import urlfetch
from google.appengine.api import memcache
from models import scripturedin as model
import datetime


class Config(object):
    _data = None

    @classmethod
    def configs(self, key):
        config = memcache.get('_config')
        if config is not None:
            return str(config[key]) if key else config
        else:
            with open('client_secrets.json', 'r') as f:
                c = f.read()
                config = json.loads(c)
                memcache.set('_config', config, 86400)  # cache for a day
                return str(config[key]) if key else config


def required(value):
    if value:
        return True
    else:
        return False


RULE = {
    'required': required
}


class Validator(object):
    def __init__(self, config, data, messages=None):
        self.config = config
        self.data = data
        self.error = 0
        self.errors = []
        self.messages = messages

    def validate(self):
        for key, value in self.data.iteritems():
            if key in self.config:
                config = self.config['key'].split('|')
                for validator in config:
                    if not RULE[validator](value):
                        self.error += 1
                        if self.messages:
                            self.errors.append(self.messages['key'])

    def is_valid(self):
        return self.error == 0


def validate(config, data):
    return Validator(config, data)


def get_user_email():
    user = users.get_current_user()
    if user:
        return user.email()


class NdbModelEncoder(json.JSONEncoder):
    """JSONEncoder class for NDB models."""

    def default(self, o):
        """Override default encoding for Model and Key objects."""
        if isinstance(o, ndb.Model):
            return model_to_dict(o)
        elif isinstance(o, ndb.Key):
            return {'kind': o.kind(), 'id': o.id()}
        else:
            return super(NdbModelEncoder, self).default(o)


def _convert_list(obj):
    lst = []
    for i in obj:
        if isinstance(i, datetime.datetime):
            lst.append(date_time_to_millis(i))
        elif isinstance(i, ndb.Key):
            lst.append(i.id())
        else:
            lst.append(i)
    return  lst


def _convert_dict(obj):
    o = {}
    for k, v in obj.iteritems():
        if isinstance(v, ndb.Key):
            # value is a key
            o[k] = v.id()
        elif isinstance(v, list):
            # value is a list, so we convert the items appropriately
            o[k] = _convert_list(v)
        elif isinstance(v, datetime.datetime):
            # value is datetime
            o[k] = date_time_to_millis(v)
        elif isinstance(v, ndb.Model):
            o[k] = model_to_dict(v)
        elif isinstance(v, dict):
            o[k] = _convert_dict(v)
        else:
            o[k] = v
    return o


def model_to_dict(o, **kwargs):
    """Converts a Model to a dict and assigns additional attributes via kwargs.

    Args:
      o: ndb.Model object
      **kwargs: arbitrary keyword values to assign as attributes of the dict.

    Returns:
      dict object
    """

    obj = _convert_dict(_secure_user_data(o.to_dict()))
    obj['id'] = o.key.id()

    # convert and add the additional(extra) attributes
    extra = _convert_dict(kwargs)
    if extra:
        t = obj.copy()
        t.update(extra)
        return t
    else:
        return obj

def _secure_user_data(obj):
    if 'password' in obj:
        del obj['password']
    if 'auth_ids' in obj:
        del obj['auth_ids']
    return obj


def encode_model(o, **kwargs):
    """Encode a model as JSON, adding any additional attributes via kwargs."""
    if isinstance(o, ndb.Model):
        obj = model_to_dict(o, **kwargs)
    elif isinstance(o, list):
        obj = []
        for lo in o:
            if isinstance(lo, ndb.Model):
                obj.append(model_to_dict(lo, **kwargs))
            else:
                obj.append(lo)
    elif isinstance(o, ndb.Key):
        obj = {'kind': o.kind(), 'id': o.id()}
    else:
        obj = o
    return NdbModelEncoder().encode(obj)


def send_email(subject, message, recipients, sender_name='CI Central Command',
               html=False):
    """Simple wrapper for sending a e-mail.

    Args:
      subject: Subject of the message
      message: Message body
      recipients: List of e-mail addresses
      sender_name: [optional] Name to associate with the sender's e-mail
      html: [optional] Send as HTML
    """
    if html:
        mail.send_mail('%s <cicentcom-noreply@google.com>' % sender_name,
                       recipients, subject, message, html=message)
    else:
        mail.send_mail('%s <cicentcom-noreply@google.com>' % sender_name,
                       recipients, subject, message)


def _get_facebook_app_token():
    """
    Returns access token
    """
    token = memcache.get('fb_app_token')
    if token is not None:
        return token
    else:
        logging.info('getting facebook app access token')
        url = ('https://graph.facebook.com/oauth/access_token?'
               'client_id=%s&client_secret=%s&grant_type=client_credentials') % (Config.configs('facebook_id'),
                                                                                 Config.configs('facebook_secret'))
        result = urlfetch.fetch(url)
        if result.status_code == 200:
            token = result.content.split('=')[1]
            memcache.set('fb_app_token', token, 3600)
            return token


def _validate_facebook_token(token):
    logging.info('validating fb acces token %s' % token)
    app_token = _get_facebook_app_token()
    url = 'https://graph.facebook.com/debug_token?input_token=%s&access_token=%s' % (token, app_token)
    # print url
    try:
        result = urlfetch.fetch(url)
        if result.status_code == 200:
            resp = json.loads(result.content)
            return resp['data']['is_valid']
    except Exception as e:
        logging.error(e.message)
        return False


def date_time_to_millis(dt):
    epoch = datetime.datetime.utcfromtimestamp(0)
    return (dt - epoch).total_seconds() * 1000.0
