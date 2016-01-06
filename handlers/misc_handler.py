from handlers import base_handler
from handlers.base_handler import user_required

from models import scripturedin as model
from google.appengine.ext import ndb
from service import util


class MiscHandler(base_handler.BaseHandler):
    def get_churches(self):
        churches = model.get_churches()
        self.write_model(churches)

    @user_required
    def add_church(self):
        data = self.request_data()
        church = model.save_church(data)
        if church:
            self.write_model(church)



