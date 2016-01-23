import unittest
import webapp2
import webtest
import mock
import json
import os
from google.appengine.ext import testbed

from handlers.misc_handler import MiscHandler
from handlers.sermon_handler import SermonHandler
from handlers.user_handler import UserHandler
from models import scripturedin as model
from service import util


class SermonHandlerTestCase(unittest.TestCase):
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
        app = webapp2.WSGIApplication([webapp2.Route(r'/api/sermon/<sermon_id:\d+>/like',
                                                     handler=SermonHandler,
                                                     handler_method='like',
                                                     methods=['POST'])],
                                      config=config)
        self.testapp = webtest.TestApp(app)

    @mock.patch('models.scripturedin.Sermon.get_by_id')
    @mock.patch('models.scripturedin.User.get_by_id')
    @mock.patch('webapp2_extras.auth.Auth.get_user_by_session')
    def test_add_church(self, mock_get_user_by_session, mock_user_get, mock_sermon_get):

        user = model.User(id=123)
        sermon = model.Sermon(id=456)
        mock_user_get.return_value = user
        mock_sermon_get.return_value = sermon

        mock_get_user_by_session.return_value = {'user_id': 123}

        response = self.testapp.post('/api/sermon/456/like')
        self.assertEqual(response.status_int, 200)
        self.assertEqual([sermon.key], user.fav_sermon_keys )
        self.assertEqual(1, sermon.like_count)