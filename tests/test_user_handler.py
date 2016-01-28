import unittest
import webapp2
import webtest
import mock
import json
import os
from google.appengine.ext import testbed

from handlers.user_handler import UserHandler
from models import scripturedin as model
from service import util


class UserHandlerTestCase(unittest.TestCase):
    def setUp(self):
        self.testbed = testbed.Testbed()
        self.testbed.activate()
        self.testbed.init_memcache_stub()
        self.testbed.init_datastore_v3_stub()
        config = {}
        config['webapp2_extras.sessions'] = {
            'secret_key': str(util.Config.configs('secret_key')),
        }
        config['webapp2_extras.auth'] = {
            'user_model': 'models.scripturedin.User',
            'user_attributes': ['email']
        }
        app = webapp2.WSGIApplication([webapp2.Route(r'/api/signup',
                                                     handler=UserHandler,
                                                     handler_method='signup',
                                                     methods=['POST'])],
                                      config=config)
        self.testapp = webtest.TestApp(app)


    def test_signup_email(self):
        # test success case
        params = {"email": "tola.anjorin@gmail.com",
                  "first_name": "Tola",
                  "last_name": "Anjorin Jnr",
                  "password": "pass"
                  }
        response = self.testapp.post('/api/signup', json.dumps(params))
        self.assertEqual(response.status_int, 200)
        self.assertTrue('Set-Cookie' in response.headers)
        user = json.loads(response.normal_body)
        self.assertEqual(1, user['id'])

        # test failure case account already exist
        response = self.testapp.post('/api/signup', json.dumps(params))
        self.assertEquals('An account with tola.anjorin@gmail.com already exists',
                          json.loads(response.normal_body)['message'])

        # test failure case, missing fields
        params = {"email": "",
                  "first_name": "Tola",
                  "last_name": "Anjorin Jnr",
                  "password": "pass"
                  }

        response = self.testapp.post('/api/signup', json.dumps(params))
        self.assertEquals(['email is required'],
                          json.loads(response.normal_body)['message'])

        params = {"email": "wrongemail@",
                  "first_name": "Tola",
                  "last_name": "Anjorin Jnr",
                  "password": "pass"
                  }

        response = self.testapp.post('/api/signup', json.dumps(params))
        self.assertEquals(['email is required'],
                          json.loads(response.normal_body)['message'])

    @mock.patch('service.util._validate_facebook_token')
    def test_signup_facebook(self, mock_val_fb_token):
        params = {"email": "tola.anjorin@gmail.com",
                  "first_name": "Tola",
                  "last_name": "Anjorin Jnr",
                  "id": "12345",
                  "access_token": "random_token",
                  "channel": "facebook"}
        mock_val_fb_token.return_value = True

        response = self.testapp.post('/api/signup', json.dumps(params))
        # print response.headers['Set-Cookie']
        self.assertEqual(response.status_int, 200)
        self.assertTrue('Set-Cookie' in response.headers)
        user = json.loads(response.normal_body)
        self.assertEqual(1, user['id'])
        mock_val_fb_token.assert_called_once_with(params['access_token'])

    @mock.patch('handlers.base_handler.BaseHandler.user_model')
    @mock.patch('service.util._validate_facebook_token')
    @mock.patch('models.scripturedin.get_user_by_email')
    def test_facebook_signup_success(self, mock_get_user_by_email, mock_val_fb_token, mock_user_model):
        data = {
            'first_name': 'ebby',
            'last_name': 'anjorin',
            'email': 'ebby@app.com',
            'access_token': 'some_token'
        }
        mock_get_user_by_email.return_value = None
        mock_val_fb_token.return_value = True
        created_user = model.User(
                first_name=data['first_name'],
                last_name=data['last_name'],
                email=data['email']
        )
        mock_user_model.create_user.return_value = (True, created_user)

        handler = UserHandler()
        resp = handler._facebook_signup(data)

        self.assertEqual(resp, (True, created_user))
        mock_val_fb_token.assert_called_once_with(data['access_token'])
        mock_get_user_by_email.assert_called_once_with(data['email'])
        mock_user_model.create_user.assert_called_once_with(data['email'],
                                                            ['email'],
                                                            email=data['email'],
                                                            first_name=data['first_name'],
                                                            last_name=data['last_name'],
                                                            verified=True)

    @mock.patch('handlers.base_handler.BaseHandler.user_model')
    @mock.patch('service.util._validate_facebook_token')
    @mock.patch('models.scripturedin.get_user_by_email')
    def test_facebook_signup_invalid_data(self, mock_get_user_by_email, mock_val_fb_token, mock_user_model):
        data = {
            'first_name': 'ebby',
            'last_name': 'anjorin',
            'email': 'ebby@app.com',
            'access_token': 'some_token'
        }
        mock_get_user_by_email.return_value = None
        mock_val_fb_token.return_value = False

        handler = UserHandler()
        resp = handler._facebook_signup(data)

        self.assertEqual(resp, (False, 'Failed to verify access token'))
        mock_val_fb_token.assert_called_once_with(data['access_token'])
        mock_get_user_by_email.assert_called_once_with(data['email'])
        self.assertFalse(mock_user_model.create_user.called)

    @mock.patch('models.scripturedin.User.put')
    @mock.patch('models.scripturedin.get_user_by_id')
    def test_update_user(self, mock_get_user_by_id, mock_user_put ):
        mock_get_user_by_id.return_value = model.User(id=2, first_name='foo', last_name='bar')
        data = {
            'gender': 'female',
            'is_pastor': True,
            'church_id': 1234
        }
        user = model.update_user(2, data)
        #print user.is_pastor
        user_dict = user.to_dict()
        self.assertEquals('f', user_dict['gender'])
        self.assertTrue(user_dict['is_pastor'])
        self.assertEquals(1234, user.church_key.id())
        mock_user_put.assert_called_once_with()
