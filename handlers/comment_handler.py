from handlers import base_handler
from handlers.base_handler import user_required

from models import scripturedin as model
from google.appengine.datastore.datastore_query import Cursor
from google.appengine.ext import ndb
from service import util
import logging


class CommentHandler(base_handler.BaseHandler):
    @user_required
    def get(self, ref_key):
        logging.info(ref_key)
        try:
            cors = Cursor(urlsafe=self.request.get('cursor')) if self.request.get('cursor') else None
            comments = model.get_comments(self.request.get('k').strip(), ref_key, cors)
            self.write_model(comments)
        except Exception as e:
            logging.info(e)
            self.error_response([e.message])

    @user_required
    def like(self, id):
        try:
            if model.like_comment(id, self.user.key.id()):
                self.success_response()
        except Exception as e:
            self.error_response([e.message])

    @user_required
    def unlike(self, id):
        try:
            if model.unlike_comment(id, self.user.key.id()):
                self.success_response()
        except Exception as e:
            self.error_response([e.message])

    @user_required
    def post(self, ref_key):
        data = self.request_data()
        try:
            data['user_key'] = self.user.key
            data['ref_key'] = ndb.Key(self.request.get('k').strip(), int(ref_key))
            comment = model.save_comment(data)
            self.write_model(comment, user=model.get_user_by_id(comment.created_by.id()))
        except Exception as e:
            self.error_response([e.message])
