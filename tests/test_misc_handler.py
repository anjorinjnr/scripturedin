import unittest
import webapp2
import webtest
import mock
import json
import os
from google.appengine.ext import testbed

from handlers.misc_handler import MiscHandler
from handlers.user_handler import UserHandler
from models import scripturedin as model
from service import util


class MiscHandlerTestCase(unittest.TestCase):
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
        app = webapp2.WSGIApplication([webapp2.Route(r'/api/church',
                                                     handler=MiscHandler,
                                                     handler_method='add_church',
                                                     methods=['POST'])],
                                      config=config)
        self.testapp = webtest.TestApp(app)

    @mock.patch('webapp2_extras.auth.Auth.get_user_by_session')
    def test_add_church(self, mock_get_user_by_session):
        mock_get_user_by_session.return_value = {'id': 1}

        params = {'name': 'foo bar',
                  'website': 'http://foo.com'}

        response = self.testapp.post('/api/church', json.dumps(params))

        # print response.headers['Set-Cookie']
        self.assertEqual(response.status_int, 200)
        church = json.loads(response.normal_body)
        # print church
        self.assertEqual(params['name'], church['name'])
        self.assertEqual(params['website'], church['website'])
