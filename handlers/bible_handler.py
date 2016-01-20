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
        verses = self.request.get('verses')
        translation = self.request.get('translation', default_value='kjv')

        passage = bible_service.get_passage(book,
                                            chapter,
                                            verses,
                                            translation
                                            )
        self.write_response(passage)
        # pattern = '\((.*)\);'
        # query = self.request.GET['query']
        # version = self.request.get('version', default_value= 'kjv')
        # params  = urllib.urlencode({'passage': query, 'version':version})
        # passage = memcache.get(params)
        # if passage is None:
        #     url = 'https://getbible.net/json?%s' % (params)
        #     try:
        #         result = urlfetch.fetch(url)
        #         if result.status_code == 200:
        #             m = re.search(pattern, result.content)
        #             passage = json.loads(m.group(1))
        #             if passage:
        #                 memcache.set(params, passage)
        #     except Exception as e:
        #         logging.error(e.message)
        self.write_response(passage)
