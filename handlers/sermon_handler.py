from handlers import base_handler
from handlers.base_handler import user_required

from models import scripturedin as model
from google.appengine.ext import ndb
from service import util


class SermonHandler(base_handler.BaseHandler):
    @user_required
    def save(self):
        data = self.request_data()
        try:
            sermon = model.save_sermon(self.user.key.id(), data)
            # sermon.pastor = model.get_user_by_id(sermon.pastor_key.id())
            self.write_model(sermon, pastor=model.get_user_by_id(sermon.pastor_key.id()))
        except Exception as e:
            self.error_response([e.message])

    def publish(self):
        data = self.request_data()
        try:
            sermon = model.publish_sermon(self.user.key.id(), data)
            self.write_model(sermon, pastor=model.get_user_by_id(sermon.pastor_key.id()))
        except Exception as e:
            self.error_response([e.message])
