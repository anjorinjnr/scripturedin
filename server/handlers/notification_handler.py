from models import scripturedin as model
from base_handler import BaseHandler

from service.validator import Validator
from service import email_service

import webapp2
import logging
import traceback

# if user isnt valid 
# send email to all users 

class NotificationHandler(BaseHandler):

  def notify(self):
        """Stores notification to be displayed to users """
        try:
            data = self.request_data()

            validator = Validator({'user_id': 'required', 
                                  'type': 'required',
                                  },data,{'user_id': 'User ID is required', 'type' : 'Notification Type is required'})
                                  
            send_email = False
            if validator.is_valid():
                notification_settings = self._get_user_notification_settings(data['user_id'])
                if data['type'] in notification_settings and notification_settings[data['type']] == 1:
                      send_email = True       
            else:
                self.error_response(validator.errors)
                return False

          
            notification_types = ["POST_REPLY", "NEW_POST", "POST_LIKE", "MENTION", "NEW_SERMON", "GENERAL"]
            if data['type'] not in notification_types:
                self.error_response("Notification type not valid")
                return False

            typeValidator = self._get_validator(data['type'], data)

            if not typeValidator.is_valid(): 
                self.error_response(typeValidator.errors)
                return False

            if data['type'] == "GENERAL" and not data["message"]:
                self.error_response("Message is required for notification type GENERAL")
                return False
            else: 
                message = self._construct_notification_message(data["type"], data)
            
            action_url = ""
            if "action_url" in data:
                action_url = data["action_url"]

            model.save_notification(data["user_id"], data['type'], action_url, message, data)
          
            if send_email:
                self._send_notification_email(data["user_id"], message, action_url, data)
           
        except Exception as e:
            logging.error(e)
            self.error_response('Unable to save notification.')
            traceback.print_exc()


  def mark_notification_as_read(self):
      model.mark_notification_as_read(id)
      self.success_response()

    
  def _get_validator(self, notification_type, data):

      validator = Validator({}, data, {})

      if notification_type == "POST_REPLY": 
          validator = Validator({'actor_id': 'required', 
                                  'post_id': 'required',
                                  },data,{'actor_id': 'Actor ID is required', 'post_id' : 'Post ID is required'})

      if notification_type == "NEW_POST": 
          validator = Validator({'post_id': 'required',
                                  },data,{'post_id' : 'Post ID is required'})

      if notification_type == "POST_LIKE":
          validator = Validator({'actor_id': 'required', 
                                  'post_id': 'required',
                                  },data,{'actor_id': 'Actor ID is required', 'post_id' : 'Post ID is required'})

      if notification_type == "MENTION":
          validator = Validator({'actor_id': 'required', 
                                  'post_id': 'required',
                                  },data,{'actor_id': 'Actor ID is required', 'post_id' : 'Post ID is required'})

      if notification_type == "NEW_SERMON":
          validator = Validator({'sermon_id': 'required',
                                  },data,{'sermon_id' : 'Sermon ID is required'})

      return validator

       
  def _construct_notification_message(self, notification_type, data): 
      if "post_id" in data: 
          post = model.get_post(data["post_id"])
        
      if "user_id" in data: 
          user = model.get_user_by_id(data["user_id"])

      if "actor_id" in data: 
          actor = model.get_user_by_id(data["actor_id"])

      message = ""

      if "sermon_id" in data:
          sermon = model.get_sermon(data["sermon_id"])

      if notification_type == "POST_REPLY": 
          message = "[] just replied to your post"

      if notification_type == "NEW_POST": 
          message = "[] just created a new post"

      if notification_type == "POST_LIKE":
          message = "[] liked your post"

      if notification_type == "MENTION":
          message = "[] mentioned you"

      if notification_type == "NEW_SERMON":
          message = "[] posted a new sermon"

      return message


  def _send_notification_email(self, user_id, message, action_url, data): 
      if not data["type"] == "GENERAL":
          user = model.get_user_by_id(user_id)
          if user: 
            email_service.send_notification(user, message, action_url)

      
  def _get_user_notification_settings(self, user_id):
      result = model.get_user_notification_settings(user_id)
      settings = []
      if result: 
        for row in result: 
            setting[row.notification_type] = row.value
      return settings


