from handlers import base_handler
from handlers.base_handler import user_required

from models import scripturedin as model
from google.appengine.datastore.datastore_query import Cursor
from google.appengine.ext import ndb
from service import util
import logging


class SermonHandler(base_handler.BaseHandler):

    @user_required
    def find(self):
        query = self.request.get('query')
        if query:
            sermons = model.find_sermon(query, self.user.key)
            self.write_model(sermons)
        else:
            self.write_response([])

    @user_required
    def like(self, sermon_id):
        try:
            if model.like_sermon(sermon_id, self.user.key.id()):
                self.success_response()
        except Exception as e:
            self.error_response([e.message])

    @user_required
    def log_view(self, sermon_id):
        try:
            if model.log_sermon_view(sermon_id, self.user.key.id()):
                self.success_response()
        except Exception as e:
            self.error_response([e.message])

    @user_required
    def unlike(self, sermon_id):
        try:
            if model.unlike_sermon(sermon_id, self.user.key.id()):
                self.success_response()
        except Exception as e:
            self.error_response([e.message])


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

    @user_required
    def get(self, sermon_id=None):
        if sermon_id:
            sermon = model.get_sermon(sermon_id)
            if sermon:
                if self.user.key not in sermon.viewers_key:
                    sermon.viewers_key.append(self.user.key)
                    sermon.view_count += 1
                    sermon.put()
                self.write_model(sermon, pastor=model.get_user_by_id(sermon.created_by.id()),
                                 church=model.get_church(sermon.church_key.id()))
            else:
                self.error_response('sermon not found')
        else:
            params = self.request.GET
            results = {}
            cursor = params['cursor'] if 'cursor' in params else None
            if 'church_id' in params:
                results = model.get_sermons_by_church(params['church_id'], cursor=cursor)
            elif 'pastor_id' in params:
                results = model.get_sermons_by_pastor(params['pastor_id'], cursor=cursor)

            self.write_model(results)


    @user_required
    def save_note(self):
        data = self.request_data()
        try:
            data['user_key'] = self.user.key.id()
            note = model.save_sermon_note(data)
            self.write_model(note)
        except Exception as e:
            self.error_response([e.message])

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
            model.create_feed(sermon)
            self.write_model(sermon)
            # self.write_model(sermon, pastor=model.get_user_by_id(sermon.pastor_key.id()))
        except Exception as e:
            self.error_response([e.message])
