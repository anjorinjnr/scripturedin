from handlers import base_handler
from models import scripturedin as model
from handlers.base_handler import user_required
import  logging

class FeedHandler(base_handler.BaseHandler):
    @user_required
    def get(self):
        """Returns feeds for the requesting user.

        Args:
            cursor: Optional query param, if specified gets feeds from this
            point
            last_time: Optional query param, if specified gets feeds created
            after this time
        """
        cursor = self.request.get('cursor', default_value=None)
        last_time = self.request.get('last_time', default_value=None)
        user_id = self.user.key.id()
        feed = model.get_feed(user_id, cursor=cursor, last_time=last_time)
        # self.write_response(feed)
        self.write_model(feed)

