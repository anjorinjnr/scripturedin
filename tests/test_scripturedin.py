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

    def test_save_church_returns_none(self):
        data = {}
        church = model.save_church(data)
        self.assertFalse(church)