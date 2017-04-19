from handlers import base_handler
from models import scripturedin as model
from handlers.base_handler import user_required
from service import util
from google.appengine.api import urlfetch
import logging
import json
import re
import urllib
from google.appengine.api import memcache
from  service import bible_service


class BibleHandler(base_handler.BaseHandler):
    @user_required
    def get(self):
        book = self.request.get('book')
        chapter = self.request.get('chapter')
        verses = self.request.get_all('verses')
        translation = self.request.get('translation', default_value='kjv')
        passage = bible_service.get_passage(book, chapter, verses, translation)
        self.write_response(passage)

    @user_required
    def get_versions(self):
        self.write_response(bible_service.versions())
