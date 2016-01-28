import json
import logging
import os
import time

import webapp2

from google.appengine.api import users

from webapp2_extras import sessions
from webapp2_extras import auth

from service import util


def user_required(handler):
    """
      Decorator that checks if there's a user associated with the current session.
      Will also fail if there's no session present.
    """

    def check_login(self, *args, **kwargs):
        auth = self.auth
        if not auth.get_user_by_session():
            self.response.status = 401
            self.response.headers['Content-Type'] = 'application/json'
            self.response.out.write(json.dumps({'status': 'error', 'message': 'login required'}))
        else:
            return handler(self, *args, **kwargs)

    return check_login


class BaseHandler(webapp2.RequestHandler):
    """Base class for request handlers."""

    @webapp2.cached_property
    def config(self):
        return util.Config.configs()

    @webapp2.cached_property
    def auth(self):
        """Shortcut to access the auth instance as a property."""
        return auth.get_auth()

    @webapp2.cached_property
    def user_info(self):
        """Shortcut to access a subset of the user attributes that are stored
        in the session.

        The list of attributes to store in the session is specified in
          config['webapp2_extras.auth']['user_attributes'].
        :returns
          A dictionary with most user information
        """
        return self.auth.get_user_by_session()

    @webapp2.cached_property
    def user(self):
        """Shortcut to access the current logged in user.

        Unlike user_info, it fetches information from the persistence layer and
        returns an instance of the underlying model.

        :returns
          The instance of the user model associated to the logged in user.
        """
        u = self.user_info
        return self.user_model.get_by_id(u['user_id']) if u else None

    @webapp2.cached_property
    def user_model(self):
        """Returns the implementation of the user model.

        It is consistent with config['webapp2_extras.auth']['user_model'], if set.
        """
        return self.auth.store.user_model

    @webapp2.cached_property
    def session(self):
        """Shortcut to access the current session."""
        return self.session_store.get_session(backend="securecookie")

    def dispatch(self):
        # Get a session store for this request.
        self.session_store = sessions.get_store(request=self.request)
        try:
            # Dispatch the request.
            webapp2.RequestHandler.dispatch(self)
        finally:
            # Save all sessions.
            # print self.response
            self.session_store.save_sessions(self.response)

    def base_url(self):
        if os.environ['HTTP_HOST'].startswith('0.0.0.0'):
            return 'http://localhost:8080/'
        else:
            return 'http://scripturein.com'

    def write_model(self, obj, **kwargs):
        self.response.write(util.encode_model(obj, **kwargs))

    def write_response(self, data):
        # response = webapp2.Response()
        self.response.headers['Content-Type'] = 'application/json'
        self.response.out.write(json.dumps(data))

    def request_data(self):
        return json.loads(self.request.body)

    def current_time(self):
        return int(time.time() * 1000)

    def success_response(self):
        return self.write_response({'status': 'success'})

    def error_response(self, error=''):
        return self.write_response({'status': 'error', 'message': error})
