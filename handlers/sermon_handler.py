from handlers import base_handler
from handlers.base_handler import user_required

from models import scripturedin as model
from google.appengine.datastore.datastore_query import Cursor
from google.appengine.ext import ndb
from service import util
import logging


class SermonHandler(base_handler.BaseHandler):
    @user_required
    def save(self):
        data = self.request_data()
        try:
            sermon = model.save_sermon(self.user.key.id(), data)
            # sermon.pastor = model.get_user_by_id(sermon.pastor_key.id())
            self.write_model(sermon)
            # self.write_model(sermon, pastor=model.get_user_by_id(sermon.pastor_key.id()))
        except Exception as e:
            self.error_response([e.message])

    def get(self, sermon_id=None):
        if sermon_id:
            sermon = model.get_sermon(sermon_id)
            if sermon:
                self.write_model(sermon, pastor=model.get_user_by_id(sermon.pastor_key.id()),
                                 church=model.get_church(sermon.church_key.id()))
            else:
                self.error_response('sermon not found')
        else:
            params = self.request.GET
            sermons = []
            if 'church_id' in params:
                sermons = model.get_sermons_by_church(params['church_id'])
            self.write_model(sermons)

    @user_required
    def get_comments(self, sermon_id):
        try:
            cors = Cursor(urlsafe=self.request.get('cursor')) if self.request.get('cursor') else None
            res = model.get_sermon_comments(sermon_id, cors)
            data = []
            for c in res['comments']:
                data.append(util.model_to_dict(c,
                                               replies=model.get_comment_replies(c.key.id()),
                                               user=model.get_user_by_id(c.created_by.id())))
            self.write_response(data)
        except Exception as e:
            self.error_response([e.message])

    @user_required
    def save_note(self):
        data = self.request_data()
        try:
            data['user_key'] = self.user.key.id()
            note = model.save_sermon_note(data)
            self.write_model(note)
        except Exception as e:
            self.error_response([e.message])

    # @user_required
    # def add_sermon_comment(self, user_id, sermon_id):
    #     data = self.request_data()
    #     try:
    #         data['user_key'] = user_id
    #         data['ref_key'] = ndb.Key(self.request.get('kind').strip(), 'ref_key')
    #         comment = model.save_comment(data)
    #         self.write_model(comment, user=model.get_user_by_id(comment.created_by.id()))
    #     except Exception as e:
    #         self.error_response([e.message])

    @user_required
    def get_sermon_note(self, user_id, sermon_id):
        try:
            note = model.get_sermon_note(user_id, sermon_id)
            if note:
                self.write_model(note)
            else:
                self.write_response({})
        except Exception as e:
            self.error_response([e.message])

    @user_required
    def publish(self):
        data = self.request_data()
        try:
            sermon = model.publish_sermon(self.user.key.id(), data)
            self.write_model(sermon)
            # self.write_model(sermon, pastor=model.get_user_by_id(sermon.pastor_key.id()))
        except Exception as e:
            self.error_response([e.message])
