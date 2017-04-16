from handlers import base_handler
from models import scripturedin as model
from handlers.base_handler import user_required
from service import util
import logging
from webapp2_extras.auth import InvalidAuthIdError, InvalidPasswordError
from webapp2_extras import security
from service.validator import Validator
from service import email_service
from service import notification_service
import uuid
import time


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
                        user.profile_photo = 'https://graph.facebook.com/' + data['id'] + '/picture?type=large';
                        # if 'profile_photo' in data and data['profile_photo']:
                        #     user.profile_photo = data['profile_photo']
                        user.put()
                        #send welcome email 
                        email_service.send_welcome_email(user) 
                        # start new session
                        self.auth.set_session(self.auth.store.user_to_dict(user), remember=True)
                        self.write_model(user, signup=True)
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

    @user_required
    def save_post(self):
        try:
            data = self.request_data()
            post = model.save_post(self.user.key, data)
            if 'id' in data:
                self.write_model(post)
            else:
                feed = model.create_feed(post)
                self.write_model(model.process_feed(feed, self.user, ref_object=post))
            
            notifier = notification_service.notify({'user_id':self.user.key.id(), 'post_id':post.key.id(), 'type':'NEW_POST'})
            if not notifier:
                logging.error(notifier[1])
        except Exception as e:
            logging.error(e)
            self.error_response(e.message)

    def signup(self):
        """Handles email signup. """
        try:
            data = self.request_data()
            resp = self._email_signup(data)
            if resp and resp[0]:
                user = resp[1]
                #send welcome email 
                email_service.send_welcome_email(user) 
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

    @user_required
    def like_post(self, post_id):
        try:
            if model.like_post(post_id, self.user.key):
                notifier = notification_service.notify({'actor_id':self.user.key.id(), 'user_id':self.user.key.id(), 'post_id':post_id, 'type':'POST_LIKE'})
                if not notifier:
                    logging.error(notifier[1])
                logging.info(notifier)
                self.success_response()
        except Exception as e:
            logging.info(e)
            self.error_response([e.message])

    @user_required
    def unlike_post(self, post_id):
        try:
            if model.unlike_post(post_id, self.user.key):
                self.success_response()
        except Exception as e:
            logging.info(e)
        self.error_response([e.message])

    @user_required
    def delete_post(self, post_id):
        try:
            if model.delete_post(post_id, self.user.key):
                self.success_response()
        except Exception as e:
            logging.info(e)
            self.error_response('failed to delete post')

    @user_required
    def delete_note(self, note_id):
        try:
            if model.delete_note(note_id, self.user.key):
                self.success_response()
        except Exception as e:
            logging.info(e)
            self.error_response('failed to delete post')


    def passwordreset(self):
        """Sends password reminder email """
        try:
            data = self.request_data()
            if "token" in data: 
                return self._do_password_reset()

            validator = Validator({'email': 'required|email'},data,{'email': 'email is required'})
        
            if validator.is_valid():
                user = model.get_user_by_email(data['email'])
                if not user: 
                    self.error_response("We can't find a user with that e-mail address")
                else: 
                    passwordReset = model.create_password_reset_token(data['email'])
                    if passwordReset:
                        user.token = passwordReset.token
                        email_service.send_password_reset_email(user)
                        self.success_response();         
            else:
                self.error_response(validator.errors)
           
        except Exception as e:
            logging.error(e)
            self.error_response('Unable to complete password reset.')

    
    def _do_password_reset(self):
        try:
            data = self.request_data()
            logging.info(data)

            validator = Validator({'email': 'required|email',
                                'password': 'required',
                                'token' : 'required'
                                },
                                data,
                                {'email': 'email is required',
                                'password': 'password is required',
                                'token' : 'token is required'})

            if validator.is_valid():
                user = model.get_user_by_email(data['email'])
                if not user: 
                    self.error_response("We can't find a user with that e-mail address")
                    return False

            tokenInfo = model.get_token_info(data['token'])
            if not tokenInfo: 
                self.error_response("Unknown Token")
                return False

            if tokenInfo.email != data['email']:
                self.error_response("Unknown Token - ")
                return False
                
            now = int(time.time() * 1000)
            if (now - tokenInfo.created_at) > 7200000: # if greater than 2 hours 
                self.error_response('Token expired')
                return False

            user.password = security.generate_password_hash(data['password'], length=12)
            user.put()
            tokenInfo.key.delete()

            email_service.send_password_reset_success(user)
            self.success_response()
        except Exception as e:
            logging.error(e)
            self.error_response('Unable to complete password reset.')


    @user_required
    def get_notifications(self):
        notifications = model.get_user_notifications(self.user.key)
        self.write_model(notifications)

    @user_required
    def update_notification_setting(self):
        # "POST_REPLY", "NEW_POST", "POST_LIKE", "MENTION", "NEW_SERMON", "GENERAL"'
        
        notification_settings = []

        data = self.request_data()
        if "notification_post_reply" in data:
            notification_setting["notification_type"] = "POST_REPLY"
            notification_setting["value"] = data["notification_post_reply"]
            notification_settings.push(notification_setting)
            

        return data


    @user_required
    def get_notification_setting(self):
        notification_settings = model.get_user_notification_settings(self.user.key)
        self.write_model(notification_settings)
            
