from handlers import base_handler
from models import scripturedin as model
from handlers.base_handler import user_required
from service import util
import logging
from webapp2_extras.auth import InvalidAuthIdError, InvalidPasswordError
from service.validator import Validator


class UserHandler(base_handler.BaseHandler):
    def login(self):
        """Login user into the app.

        A user can login using email credentials or using services like facebook.
        A logging in with facebook, we first check if a user with the email exists
        as facebook login/signup get's handled here.
        If the email exists, we can treat this as a login, only have to validate the
        facebook access_token.
        If the email doesn't exist then we treat this as a signup with facebook.
        """
        data = self.request_data()
        auth = data['auth'] if 'auth' in data else 'email'
        if auth == 'email' and 'email' in data:
            try:
                email = data['email']
                password = data['password']
                u = self.auth.get_user_by_password(email, password, remember=True)
                self.write_response(self._user_response(self.user))
            except (InvalidAuthIdError, InvalidPasswordError, KeyError) as e:
                logging.info('Login with email failed for user %s because of %s', email, type(e))
                self.error_response('Invalid credentials, please try again.')
        elif auth == 'facebook':
            try:
                user = model.get_user_by_email(data['email'])
                if user:
                    # user with email already exist, we validate token and login
                    if util._validate_facebook_token(data['access_token']):
                        # user = model.get_user_by_email(data['email'])
                        self.auth.set_session(self.auth.store.user_to_dict(user), remember=True)
                        self.write_response(self._user_response(user))
                    else:
                        self.error_response('Invalid login credentials.')
                else:
                    resp = self._facebook_signup(data)
                    if resp and resp[0]:
                        user = resp[1]
                        user.profile_photo = data['profile_photo'] if 'profile_photo' in data else None
                        user.put()
                        # start new session
                        self.auth.set_session(self.auth.store.user_to_dict(user), remember=True)
                        self.write_model(user)
                    else:
                        self.write_response(resp[1])
            except Exception as e:
                logging.info('Login with facebok failed for user %s because of %s',
                             data['email'] if 'email' in data else '', type(e))
                self.error_response('Unable to complete facebook login, please try again')

    def logout(self):
        self.auth.unset_session()
        return self.success_response()

    def current_user(self):
        if self.user:
            user = util.model_to_dict(self.user)
            if self.user.church_key:
                user['church'] = model.get_mini_church_info(self.user.church_key)
            self.write_response(user)
        else:
            self.write_response({'status': 'no active user session'})

    @user_required
    def update_profile(self):
        # logging.info(self.user)
        try:
            data = self.request_data()
            user = model.update_user(self.user.key.id(), data)
            user = util.model_to_dict(user)
            if self.user.church_key:
                user['church'] = model.get_mini_church_info(self.user.church_key)
            self.write_response(user)
        except Exception as e:
            logging.info(e)
            self.error_response('Update failed..')

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
        """Handles email signup. """
        try:
            data = self.request_data()
            resp = self._email_signup(data)
            if resp and resp[0]:
                user = resp[1]
                # start new session
                self.auth.set_session(self.auth.store.user_to_dict(user), remember=True)
                self.write_model(user)
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
                               'first_name': 'required',
                               'last_name': 'required',
                               'password': 'required'
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
            if util._validate_facebook_token(data['access_token']):
                logging.info(data)
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
            logging.info(user_data)
        return user_data
