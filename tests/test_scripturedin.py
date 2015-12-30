import unittest

import datetime
import webapp2
import webtest
import mock
import json
import os
from google.appengine.ext import testbed

from handlers.user_handler import UserHandler
from models import scripturedin as model
from service import util


class ScripturedinTestCase(unittest.TestCase):
    def setUp(self):
        self.testbed = testbed.Testbed()
        self.testbed.activate()
        self.testbed.init_memcache_stub()
        self.testbed.init_datastore_v3_stub()

    def test_save_church(self):
        data = {'name': 'Church of God'}
        church = model.save_church(data)
        self.assertEqual(data['name'], church.name)
        self.assertTrue(church.key.id() == 1)

        data = {'name': 'New Church',
                'website': 'http://foo.com'}
        church = model.save_church(data)
        self.assertEqual(data['name'], church.name)
        self.assertEqual(data['website'], church.website)
        self.assertTrue(church.key.id() == 2)

    @mock.patch('models.scripturedin.get_user_by_id')
    def test_update_sermon_publish(self, mock_get_user_by_id):
        mock_get_user_by_id.return_value = model.User(id=1, first_name='foo', last_name='bar', is_pastor=True)
        data = {'title': 'sermon title',
                'scripture': [{'book': 'John', 'chapter': 3, 'verses': ['16']}],
                'notes': [{'content': 'this is a sample point'}],
                'date': ['2015/12/27']
                }
        model._update_sermon(1, data, True)
        mock_get_user_by_id.assert_called_once_with(1)
        sermon = model.Sermon.get_by_id(1)
        self.assertIsNotNone(sermon)
        self.assertTrue(sermon.publish)
        self.assertEquals(data['title'],sermon.title)
        self.assertEquals([datetime.datetime(2015, 12, 27)], sermon.date)
        self.assertEquals(data['scripture'], sermon.scripture)
        self.assertEquals(data['notes'], sermon.notes)
        self.assertEquals(1, sermon.pastor_key.id())

        # test updating existing sermon
        data['id'] = sermon.key.id();
        data['title'] = 'updated sermon title'
        model._update_sermon(1, data, True)
        sermon = model.Sermon.get_by_id(1)
        self.assertEquals(data['title'],sermon.title)



    @mock.patch('models.scripturedin.get_user_by_id')
    def test_update_sermon_save(self, mock_get_user_by_id):
        mock_get_user_by_id.return_value = model.User(id=1, first_name='foo', last_name='bar', is_pastor=True)
        data = {'title': 'sermon title',
                'scripture': [{'book': 'John', 'chapter': 3, 'verses': ['16']}],
                'notes': [{'content': 'this is a sample point'}],
                'date': ['2015/12/27']
                }
        model._update_sermon(1, data)
        mock_get_user_by_id.assert_called_once_with(1)
        sermon = model.Sermon.get_by_id(1)
        self.assertIsNotNone(sermon)
        self.assertFalse(sermon.publish)
        self.assertEquals(data['title'],sermon.title)
        self.assertEquals([datetime.datetime(2015, 12, 27)], sermon.date)
        self.assertEquals(data['scripture'], sermon.scripture)
        self.assertEquals(data['notes'], sermon.notes)
        self.assertEquals(1, sermon.pastor_key.id())


    @mock.patch('models.scripturedin.get_user_by_id')
    def test_update_sermon_validation(self, mock_get_user_by_id):
        user_id = 1
        # validate title
        data = {}
        with self.assertRaisesRegexp(Exception, 'sermon requires title'):
            model._update_sermon(user_id, data)
        data = {'title': ''}
        with self.assertRaisesRegexp(Exception, 'sermon requires title'):
            model._update_sermon(user_id, data)
        # validate scripture
        data = {'title': 'sermon title'}
        with self.assertRaisesRegexp(Exception, 'sermon requires at least one scripture'):
            model._update_sermon(user_id, data)
        data = {'title': 'sermon title', 'scripture': []}
        with self.assertRaisesRegexp(Exception, 'sermon requires at least one scripture'):
            model._update_sermon(user_id, data)
        # validate sermon notes/point
        data = {'title': 'sermon title', 'scripture': [{'book': 'John', 'chapter': 3, 'verses': ['16']}]}
        with self.assertRaisesRegexp(Exception, 'sermon requires at a note. Note can be list of notes or free text'):
            model._update_sermon(user_id, data)
        data = {'title': 'sermon title',
                'scripture': [{'book': 'John', 'chapter': 3, 'verses': ['16']}],
                'notes': []}
        with self.assertRaisesRegexp(Exception, 'sermon requires at a note. Note can be list of notes or free text'):
            model._update_sermon(user_id, data)
        data = {'title': 'sermon title',
                'scripture': [{'book': 'John', 'chapter': 3, 'verses': ['16']}],
                'notes': [{'content': 'this is a sample point'}],
                }
        # validate user is pastor
        mock_get_user_by_id.return_value = model.User(id=user_id, first_name='foo', last_name='bar')
        with self.assertRaisesRegexp(Exception, 'user must be a pastor to create a sermon'):
            model._update_sermon(user_id, data)
        data = {'title': 'sermon title',
                'scripture': [{'book': 'John', 'chapter': 3, 'verses': ['16']}],
                'note': 'this is a sample note'}
        with self.assertRaisesRegexp(Exception, 'user must be a pastor to create a sermon'):
            model._update_sermon(user_id, data)
        # validadate data is dictionary
        data = []
        with self.assertRaisesRegexp(Exception, 'data should be a dictionary'):
            model._update_sermon(user_id, data)

    def test_save_church_returns_none(self):
        data = {}
        church = model.save_church(data)
        self.assertFalse(church)
