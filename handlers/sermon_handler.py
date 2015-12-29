from handlers import base_handler
from handlers.base_handler import user_required

from models import scripturedin as model
from google.appengine.ext import ndb
from service import util


class SermonHandler(base_handler.BaseHandler):

    @user_required
    def publish(self):
        data = self.request_data()
        sermon = model.publish_sermon(data)




