import unittest
import webapp2
import webtest
import mock
from google.appengine.ext import testbed

from service import util


class UtilTestCase(unittest.TestCase):

    def setUp(self):
        config = {}
        config['webapp2_extras.sessions'] = {
            'secret_key': str(util.Config.configs('secret_key')),
        }
        config['webapp2_extras.auth'] = {
            'user_model': 'models.scripturedin.User',
            'user_attributes': ['email']
        }
        #self.testapp = webtest.TestApp(app)
        self.testbed = testbed.Testbed()
        self.testbed.activate()
        self.testbed.init_memcache_stub()
        self.testbed.init_datastore_v3_stub()

    @mock.patch('service.util.Config.configs')
    @mock.patch('google.appengine.api.urlfetch.fetch')
    def test_get_facebook_app_token(self, mock_fetch, mock_config):
        mock_config.side_effect = ['id', 'secret']

        mock_resp = mock.Mock()
        mock_resp.status_code = 200
        mock_resp.content = 'access_token=my-token'
        mock_fetch.return_value = mock_resp


        token = util._get_facebook_app_token()
        self.assertEqual('my-token', token)
        mock_fetch.assert_called_once_with('https://graph.facebook.com/oauth/access_token?'
                                           'client_id=id&client_secret=secret&grant_type=client_credentials')
        calls = [mock.call('facebook_id'), mock.call('facebook_secret')]
        mock_config.assert_has_calls(calls)


    @mock.patch('google.appengine.api.urlfetch.fetch')
    @mock.patch('service.util._get_facebook_app_token')
    def test_validate_facebook_token(self, mock_get_fb_app_token, mock_fetch):
        access_token = 'CAAXQZBqsFd7QBAOAa5ZBSVZCyCYgCWxCRBknMvpw6tnuW1Px5Agn0ajBtU9gYhejDo3pOjJGT1792cgmh6DXyun7928ofFzLXaZCSZBmOjBpe6ENdy80TVbJ9Qe5ud6hmGNpTNGv9vaNzQ16n2q9TIF2hrUQZAaEPgZAHE0fwGZCIjYZBTgIYlQORMgJ7b7JmZCP1wswqTBpjQwwABCD'
        mock_get_fb_app_token.return_value = 'app_token'
        mock_resp = mock.Mock()
        mock_resp.status_code = 200
        mock_resp.content = """
                        {
                        "data": {
                                 "is_valid": true
                                }
                        }
                        """
        mock_fetch.return_value = mock_resp

        resp = util._validate_facebook_token(access_token)

        self.assertTrue(resp)
        mock_get_fb_app_token.assert_called_once_with()
        mock_fetch.assert_called_once_with('https://graph.facebook.com/debug_token?input_token=%s&access_token=%s' % (
            access_token, 'app_token'))


if __name__ == '__main__':
    unittest.main()
