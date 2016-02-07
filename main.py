import os

import routes

import webapp2
import appengine_config
from  models.scripturedin import User
from service import util
import sys
from google.appengine.ext import vendor

rootdir = os.path.dirname(os.path.abspath(__file__))
lib = os.path.join(rootdir, 'lib')
sys.path.append(lib)
vendor.add(os.path.join(os.path.dirname(os.path.realpath(__file__)), 'lib'))


def _IsDevEnv():
    """Returns whether we are in a development environment (non-prod)."""
    software = os.environ['SERVER_SOFTWARE']
    server = os.environ['SERVER_NAME']
    if software.lower().startswith('dev') or 'test' in server:
        return True
    return False


def _IsLocalEnv():
    """Returns whether we are in a local environment."""
    return os.environ['SERVER_SOFTWARE'].lower().startswith('dev')


config = {}
config['webapp2_extras.sessions'] = {
    'secret_key': util.Config.configs('secret_key'),
}
config['webapp2_extras.auth'] = {
    'user_model': 'models.scripturedin.User',
    'user_attributes': ['email']
}
app = webapp2.WSGIApplication(routes.ROUTES,
                              config=config,
                              debug=_IsDevEnv() or _IsLocalEnv())

task_queue_app = webapp2.WSGIApplication(routes.TASK_ROUTES,
                                         config=config,
                                         debug=_IsDevEnv() or _IsLocalEnv())
