from google.appengine.ext.webapp import blobstore_handlers
from models import scripturedin as model
from base_handler import BaseHandler
from google.appengine.ext import blobstore

class UploadHandler(blobstore_handlers.BlobstoreUploadHandler):
    def post(self):
        base_handler = BaseHandler()
        try:
            upload = self.get_uploads()[0]
            file_info = None
            for name, fieldStorage in self.request.POST.items():
                if isinstance(fieldStorage, unicode):
                    continue
                file_info = blobstore.parse_file_info(fieldStorage)

            photo = model.File(created_by=base_handler.user.key, file_typ='picture')
            file_info.file_path = file_info.gs_object_name[3:]
            #user_photo.put()
            #self.
        except:
            self.error(500)
