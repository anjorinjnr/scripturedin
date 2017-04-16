from models import scripturedin as model

from service.validator import Validator
from service import email_service

import webapp2
import logging
import traceback

# if user isnt valid 
# send email to all users 

def notify(data):
    """Stores notification to be displayed to users """
    try:
        validator = Validator({'user_id': 'required', 
                                  'type': 'required',
                                  },data,{'user_id': 'User ID is required', 'type' : 'Notification Type is required'})
                                  
        send_email = False
        if validator.is_valid():
            notification_settings = _get_user_notification_settings(data['user_id'])
            if data['type'] in notification_settings and notification_settings[data['type']] == 1:
                    send_email = True       
        else:
            return False, validator.errors

          
        notification_types = ["POST_REPLY", "NEW_POST", "POST_LIKE", "MENTION", "NEW_SERMON", "GENERAL"]
        if data['type'] not in notification_types:
            return False, "Notification type not valid"

        typeValidator = _get_validator(data['type'], data)

        if not typeValidator.is_valid(): 
            return False, typeValidator.errors

        if data['type'] == "GENERAL" and not "message" in data:
            return False, "Message is required for notification type GENERAL"
            
        action_url = ""
        if "action_url" in data:
            action_url = data["action_url"]
            
        post = None
        if "post_id" in data: 
            post = model.get_post(data["post_id"])
            if not post: 
                return False, "Post not found"

        user = None
        if "user_id" in data: 
            user = model.get_user_by_id(data["user_id"])
            if not user: 
                return False, "User not found"

        actor = None
        if "actor_id" in data: 
            actor = model.get_user_by_id(data["actor_id"])
            if not actor: 
                return False, "Actor not found"

        sermon = None
        if "sermon_id" in data:
            sermon = model.get_sermon(data["sermon_id"])
            if not sermon: 
                return False, "Sermon not found"

        if not data['type'] == "GENERAL":
            message = _construct_notification_message(data["type"], post, user, actor, sermon)
        else:
            message = data["message"]
            

        if data['type'] == "NEW_POST":
            action_url = "/home/#/"+data["post_id"]
            church_members = model.get_church_members(user.church_key)
            for church_member in church_members: 
                model.save_notification(church_member.key, data['type'], action_url, message, data)
        elif data['type'] == "POST_LIKE":
            action_url = "/home/#/"+data["post_id"]
            model.save_notification(post.created_by, data['type'], action_url, message, data)
        elif data['type'] == "GENERAL":
            users = model.get_users()
            for user in users: 
                model.save_notification(user.key, data['type'], action_url, message, data)
          
        if send_email:
            _send_notification_email(data["user_id"], message, action_url, data)

        return True
           
    except Exception as e:
        logging.error(e)
        return False, 'Unable to save notification.'
        traceback.print_exc()


    
def _get_validator(notification_type, data):

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

       
def _construct_notification_message(notification_type, post, user, actor, sermon):
    message = ""

    if notification_type == "POST_REPLY": 
        message = user.get_full_name() + " just replied to your post"

    if notification_type == "NEW_POST": 
        message = user.get_full_name() + " just created a new post"

    if notification_type == "POST_LIKE":
        message = user.get_full_name() + " liked your post"

    if notification_type == "MENTION":
        message = user.get_full_name() + " mentioned you"

    if notification_type == "NEW_SERMON":
        message = user.get_full_name() + " posted a new sermon"

    return message


def _send_notification_email(user_id, message, action_url, data): 
    if not data["type"] == "GENERAL":
        user = model.get_user_by_id(user_id)
        if user: 
            email_service.send_notification(user, message, action_url)

      
def _get_user_notification_settings(user_id):
    result = model.get_user_notification_settings(user_id)
    settings = []
     # if result: 
     #   for row in result: 
     #       settings[row.notification_type] = 1; #row.value
    return settings


