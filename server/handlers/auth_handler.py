from handlers import base_handler

from webapp2_extras import security
from models import scripturedin as model
from service import util
import logging
import sys
import json

from google.appengine.api import urlfetch


class AuthHandler(base_handler.BaseHandler):

    def login(self):
        data = self.request_data()
        #if 'email' in data and 'pass'
        # user = model.get_user_by_id(5838406743490560)
        print self.auth.session
        user = model.get_user_by_id(id)
        u = self.auth.store.user_to_dict(user)
        self.auth.set_session(u, remember=True)

        print self.session
        # token =  model.User.create_auth_token(id)
        # print self.auth.get_user_by_token(id, token)
        # print user.get_id()
        # print self.user_model.get_by_id('ebby@gmail.com')
        # self.auth.get_user_by_token(u.)
        # self.session['id'] = 'somerandomstuff'
        # return self.write_response({'resp': 'ss'})

    def logout(self):
        self.auth.unset_session()
        return self.success_response()
