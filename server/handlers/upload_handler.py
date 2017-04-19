from models import scripturedin as model
from base_handler import BaseHandler
# from google.appengine.ext import blobstore

# import cloudstorage as gcs
# from google.cloud import storage
from google.appengine.api import images

import webapp2
import logging


class UploadHandler(BaseHandler):
  def post(self):
    logging.info('handling postzz: %s', self.request.get('id'))
    user = model.get_user_by_id(self.request.get('id'))
    avatar = self.request.get('file')
    user.avatar = avatar
    user.put()
    logging.info(user)

  def get_image(self, user_id):
    user = model.get_user_by_id(user_id)
    if user.avatar:
      self.response.headers['Content-Type'] = 'image/png'
      self.response.out.write(user.avatar)
    else:
      self.response.out.write('No image')


ROUTES = [
  webapp2.Route(
    '/api/upload',
    handler=UploadHandler,
    methods=['POST']
  ),
  webapp2.Route(
    '/api/<user_id:\d+>/avatar',
    handler=UploadHandler,
    handler_method='get_image',
    methods=['GET']
  )
]
