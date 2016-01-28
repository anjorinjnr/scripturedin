from handlers import base_handler
from handlers.base_handler import user_required

from models import scripturedin as model
from google.appengine.ext import ndb
from service import util
from google.appengine.api import memcache

class MiscHandler(base_handler.BaseHandler):
    def get_churches(self):
        churches = memcache.get('churches')
        if churches is None:
            churches = model.get_churches()
            if churches:
                memcache.set('churches', churches)
        self.write_model(churches)

    @user_required
    def add_church(self):
        data = self.request_data()
        church = model.save_church(data)
        if church:
            self.write_model(church)



