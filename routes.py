import webapp2

from handlers.auth_handler import AuthHandler
from handlers.misc_handler import MiscHandler
from handlers.request_handler import RequestHandler
from handlers.task_handler import TaskHandler
from handlers.user_handler import UserHandler

route = webapp2.Route
ROUTES = [
    route(r'/api/requests',
          handler=RequestHandler,
          handler_method='get_requests',
          methods=['GET']),
    route(r'/api/login',
          handler=AuthHandler,
          handler_method='login',
          methods=['POST']),
    route(r'/api/logout',
          handler=AuthHandler,
          handler_method='logout',
          methods=['POST']),
    route(r'/api/user',
          handler=UserHandler,
          handler_method='current_user',
          methods=['GET']),
    route(r'/api/user/profile',
          handler=UserHandler,
          handler_method='update_profile',
          methods=['POST']),
    route(r'/api/signup',
          handler=UserHandler,
          handler_method='signup',
          methods=['POST']),
    route(r'/api/task/load-church',
          handler=TaskHandler,
          handler_method='load_church',
          methods=['POST']),
    route(r'/api/churches',
          handler=MiscHandler,
          handler_method='get_churches',
          methods=['GET']),
    route(r'/api/church',
          handler=MiscHandler,
          handler_method='add_church',
          methods=['POST']),

]
