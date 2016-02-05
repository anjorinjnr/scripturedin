from handlers import base_handler
from models import scripturedin as model
from handlers.base_handler import user_required
from service import util
import logging

from service.validator import Validator


class UserHandler(base_handler.BaseHandler):
    def current_user(self):
        if self.user:
            self.write_model(self.user)
        else:
            self.write_response({'status': 'no active user session'})

    @user_required
    def update_profile(self):
        # logging.info(self.user)
        data = self.request_data()
        user = model.update_user(self.user.key.id(), data)
        if user:
            user = util.model_to_dict(user)
            self.write_response(user)
        else:
            return self.error_response()


    @user_required
    def search(self):
        query = self.request.get('query')
        type = self.request.get('type')
        users = model.find_users(query, pastor_only=(type and type.lower().strip() == 'pastor'))
        self.write_model(users)

    @user_required
    def get_notes(self):
        notes = model.get_user_notes(self.user.key)
        self.write_model(notes)

    @user_required
    def get_note(self, note_id):
        note = model.get_note(self.user.key, note_id)
        self.write_model(note)

    @user_required
    def post_note(self):
        data = self.request_data()
        note = model.save_note(self.user.key, data)
        self.write_model(note)

    def signup(self):
        try:
            data = self.request_data()
            resp = None
            if 'password' in data:
                resp = self._email_signup(data)
            elif 'channel' in data and data['channel'] == 'facebook':
                resp = self._facebook_signup(data)

            if resp and resp[0]:
                user = resp[1]
                # start new session
                self.auth.set_session(self.auth.store.user_to_dict(user), remember=True)
                # print self.auth.session
                user_dict = util.model_to_dict(user)
                self.write_response(user_dict)
            else:
                if 'email' in resp[1]:
                    self.error_response('An account with %s already exists' % data['email'])
                else:
                    self.error_response(resp[1])
        except Exception as e:
            logging.error(e.message)

            self.error_response('Unable to complete signup.')

    def _email_signup(self, data):
        validator = Validator({'email': 'required|email',
                               # 'first_name': 'required',
                               # 'last_name': 'required'
                               },
                              data,
                              {'email': 'email is required',
                               'first_name': 'first name is required',
                               'last_name': 'last name is required',
                               'password': 'password is required'}
                              )

        if validator.is_valid():
            return self._create_user(data)
        else:
            return (False, validator.errors)

    def _facebook_signup(self, data):
        validator = Validator({'email': 'required',
                               'first_name': 'required',
                               'last_name': 'required',
                               'access_token': 'required'},
                              data,
                              {'email': 'email is required',
                               'first_name': 'first name is required',
                               'last_name': 'last name is required',
                               'access_token': 'access token is required'}
                              )
        if validator.is_valid():
            user = model.get_user_by_email(data['email'])
            if user:
                if util._validate_facebook_token(data['access_token']):
                    return (True, user)
            elif util._validate_facebook_token(data['access_token']):
                return self._create_user(data)
            else:
                return (False, 'Failed to verify access token')
        else:
            return (False, validator.errors)

    def _create_user(self, data):
        if not data:
            raise Exception('Invalid data')

        # print data
        user_data = None
        if 'password' in data:
            user_data = self.user_model.create_user(data['email'],
                                                    ['email'],
                                                    email=data['email'],
                                                    first_name=data['first_name'],
                                                    last_name=data['last_name'],
                                                    password_raw=data['password'],
                                                    verified=False)
        else:
            user_data = self.user_model.create_user(data['email'],
                                                    ['email'],
                                                    email=data['email'],
                                                    first_name=data['first_name'],
                                                    last_name=data['last_name'],
                                                    verified=True)
        return user_data
