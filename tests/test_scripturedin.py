import unittest

import datetime
import mock

from google.appengine.ext import testbed
from google.appengine.ext import ndb
from service import util
from models import scripturedin as model


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
        utc_date = datetime.datetime.utcnow()
        data = {'title': 'sermon title',
                'scripture': [{'book': 'John', 'chapter': 3, 'verses': ['16']}],
                'notes': [{'content': 'this is a sample point'}],
                'date': [util.date_time_to_millis(utc_date)]
                }
        model._update_sermon(1, data, True)
        mock_get_user_by_id.assert_called_once_with(1)
        sermon = model.Sermon.get_by_id(1)
        self.assertIsNotNone(sermon)
        self.assertTrue(sermon.publish)
        self.assertEquals(data['title'], sermon.title)
        self.assertEquals([utc_date], sermon.date)
        self.assertEquals(data['scripture'], sermon.scripture)
        self.assertEquals(data['notes'], sermon.notes)
        self.assertEquals(1, sermon.pastor_key.id())

        # test updating existing sermon
        data['id'] = sermon.key.id()
        data['title'] = 'updated sermon title'
        model._update_sermon(1, data, True)
        sermon = model.Sermon.get_by_id(1)
        self.assertEquals(data['title'], sermon.title)

    @mock.patch('models.scripturedin.get_user_by_id')
    def test_update_sermon_save(self, mock_get_user_by_id):
        mock_get_user_by_id.return_value = model.User(id=1, first_name='foo', last_name='bar', is_pastor=True,
                                                      church_key=ndb.Key('Church', 123))
        utc_date = datetime.datetime.utcnow()
        data = {'title': 'sermon title',
                'scripture': [{'book': 'John', 'chapter': 3, 'verses': ['16']}],
                'notes': [{'content': 'this is a sample point'}],
                'date': [util.date_time_to_millis(utc_date)]
                }
        model._update_sermon(1, data)
        mock_get_user_by_id.assert_called_once_with(1)
        sermon = model.Sermon.get_by_id(1)
        self.assertIsNotNone(sermon)
        self.assertFalse(sermon.publish)
        self.assertEquals(data['title'], sermon.title)
        self.assertEquals([utc_date], sermon.date)
        self.assertEquals(data['scripture'], sermon.scripture)
        self.assertEquals(data['notes'], sermon.notes)
        self.assertEquals(1, sermon.pastor_key.id())
        self.assertEquals(sermon.church_key, ndb.Key('Church', 123))

    def test_save_comment(self):
        data = {}
        # with self.assertRaisesRegexp(Exception, 'comment is required and cannot be empty'):
        #     model.save_sermon_comment(data)
        data = {'comment': '  '}
        with self.assertRaisesRegexp(Exception, 'comment is required and cannot be empty'):
            model.save_comment(data)
        data = {'comment': 'some comment'}
        with self.assertRaisesRegexp(Exception, 'user id is required'):
            model.save_comment(data)
        data = {'comment': 'some comment', 'user_key': ndb.Key('User', 5360119185408000),
                'ref_key': ndb.Key('Sermon', 5733953138851840)}

        comment = model.save_comment(data)
        # print sermon_note
        self.assertEquals(comment.created_by, data['user_key'])
        self.assertEquals(comment.ref_key, data['ref_key'])
        self.assertEquals(data['comment'], comment.comment)
        data = {'comment': 'some comment with reply', 'user_key': ndb.Key('User', 5360119185408000),
                'ref_key': ndb.Key('Sermon', 5733953138851840), 'reply_to': comment.key}
        comment = model.save_comment(data)
        self.assertEquals(comment.created_by, data['user_key'])
        self.assertEquals(comment.ref_key, data['ref_key'])
        self.assertEquals(comment.comment, data['comment'])
        self.assertEquals(comment.reply_to, data['reply_to'])

    @mock.patch('models.scripturedin.Sermon.get_by_id')
    @mock.patch('models.scripturedin.User.get_by_id')
    def test_save_sermon_note(self, mock_user_get_id, mock_sermon_get_by_id):
        data = {}
        with self.assertRaisesRegexp(Exception, 'notes is required and cannot be empty'):
            model.save_sermon_note(data)
        data = {'notes': 'some notes'}
        with self.assertRaisesRegexp(Exception, 'user id is required'):
            model.save_sermon_note(data)
        data = {'notes': 'some notes', 'user_key': 123}
        with self.assertRaisesRegexp(Exception, 'sermon id is required'):
            model.save_sermon_note(data)
        data = {'notes': 'some notes', 'user_key': 5360119185408000L, 'sermon_key': 5733953138851840}

        mock_sermon_get_by_id.return_value = model.Sermon(id=5733953138851840)
        mock_user_get_id.return_value = model.User(id=5360119185408000L)
        sermon_note = model.save_sermon_note(data)
        # print sermon_note
        self.assertEquals(sermon_note.created_by.id(), data['user_key'])
        self.assertEquals(sermon_note.sermon_key.id(), data['sermon_key'])
        self.assertEquals(data['notes'], sermon_note.notes)
        mock_user_get_id.assert_called_once_with(data['user_key'])
        mock_sermon_get_by_id.assert_called_once_with(data['sermon_key'])
        data['id'] = sermon_note.key.id()
        data['notes'] = 'updated note'
        sermon_note = model.save_sermon_note(data)
        self.assertEquals(sermon_note.created_by.id(), data['user_key'])
        self.assertEquals(sermon_note.sermon_key.id(), data['sermon_key'])
        self.assertEquals(data['notes'], sermon_note.notes)

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

    @mock.patch('models.scripturedin.Sermon.get_by_id')
    @mock.patch('models.scripturedin.User.get_by_id')
    def test_like_sermon(self, mock_user_get, mock_sermon_get):
        user = model.User(id=123)
        sermon = model.Sermon(id=456)
        mock_user_get.return_value = user
        mock_sermon_get.return_value = sermon

        resp = model.like_sermon(456, 123)
        mock_user_get.assert_called_once_with(123)
        mock_sermon_get.assert_called_once_with(456)
        self.assertEqual([sermon.key], user.fav_sermon_keys )
        self.assertEqual(1, sermon.likes)

    @mock.patch('models.scripturedin.Sermon.get_by_id')
    @mock.patch('models.scripturedin.User.get_by_id')
    def test_log_sermon_view(self, mock_user_get, mock_sermon_get):
        user = model.User(id=123)
        sermon = model.Sermon(id=456)
        mock_user_get.return_value = user
        mock_sermon_get.return_value = sermon

        resp = model.log_sermon_view(456, 123)
        mock_user_get.assert_called_once_with(123)
        mock_sermon_get.assert_called_once_with(456)
        self.assertTrue(resp)
        self.assertEqual([user.key], sermon.viewers_key )
        self.assertEqual(1, sermon.views)

        resp = model.log_sermon_view(456, 123)
        self.assertEqual([user.key], sermon.viewers_key )
        self.assertEqual(1, sermon.views)

