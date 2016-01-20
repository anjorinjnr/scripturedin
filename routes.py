import webapp2

from handlers.auth_handler import AuthHandler
from handlers.bible_handler import BibleHandler
from handlers.comment_handler import CommentHandler
from handlers.misc_handler import MiscHandler
from handlers.request_handler import RequestHandler
from handlers.sermon_handler import SermonHandler
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
    route(r'/api/churches',
          handler=MiscHandler,
          handler_method='get_churches',
          methods=['GET']),
    route(r'/api/church',
          handler=MiscHandler,
          handler_method='add_church',
          methods=['POST']),
    route(r'/api/sermon',
          handler=SermonHandler,
          handler_method='save',
          methods=['POST']),
    route(r'/api/sermon',
          handler=SermonHandler,
          handler_method='get',
          methods=['GET']),
    route(r'/api/sermon/<sermon_id:\d+>',
          handler=SermonHandler,
          handler_method='get',
          methods=['GET']),
    route(r'/api/sermon/publish',
          handler=SermonHandler,
          handler_method='publish',
          methods=['POST']),
    route(r'/api/sermon/<sermon_id:\d+>/comments',
          handler=SermonHandler,
          handler_method='get_comments',
          methods=['GET']),
    route(r'/api/sermon/note',
          handler=SermonHandler,
          handler_method='save_note',
          methods=['POST']),
    route(r'/api/user/<user_id:\d+>/sermon/<sermon_id:\d+>/note',
          handler=SermonHandler,
          handler_method='get_sermon_note',
          methods=['GET']),
    route(r'/api/comment/<ref_key:\d+>',
          handler=CommentHandler,
          handler_method='post',
          methods=['POST']),
    route(r'/api/comment/<ref_key:\d+>',
          handler=CommentHandler,
          handler_method='get',
          methods=['GET']),
    route(r'/api/comment/<id:\d+>/like',
          handler=CommentHandler,
          handler_method='like',
          methods=['POST']),
    route(r'/api/comment/<id:\d+>/unlike',
          handler=CommentHandler,
          handler_method='unlike',
          methods=['POST']),
    route(r'/api/sermon/<sermon_id:\d+>/like',
          handler=SermonHandler,
          handler_method='like',
          methods=['POST']),
    route(r'/api/sermon/<sermon_id:\d+>/log',
          handler=SermonHandler,
          handler_method='log_view',
          methods=['POST']),
    route(r'/api/sermon/<sermon_id:\d+>/unlike',
          handler=SermonHandler,
          handler_method='unlike',
          methods=['POST']),

    (r'/api/bible', BibleHandler),
    # tasks,
    route(r'/api/task/load-church',
          handler=TaskHandler,
          handler_method='load_church',
          methods=['POST']),
    route(r'/api/task/books',
          handler=TaskHandler,
          handler_method='build_map',
          methods=['GET']),
    # cron tasks
    route(r'/tasks/persist-datastore',
          handler=TaskHandler,
          handler_method='persist_note_data',
          methods=['GET']),

]
