import webapp2

from handlers.bible_handler import BibleHandler
from handlers.comment_handler import CommentHandler
from handlers.feed_handler import FeedHandler
from handlers.misc_handler import MiscHandler
from handlers.request_handler import RequestHandler
from handlers.sermon_handler import SermonHandler
from handlers.task_handler import TaskHandler
from handlers.user_handler import UserHandler
from handlers.notification_handler import NotificationHandler
from handlers import upload_handler

route = webapp2.Route
ROUTES = [

    # /user/* routes
    route(r'/api/user',
          handler=UserHandler,
          handler_method='current_user',
          methods=['GET']),
    route(r'/api/user/profile',
          handler=UserHandler,
          handler_method='update_profile',
          methods=['POST']),
    route(r'/api/user/<user_id:\d+>/sermon/<sermon_id:\d+>/note',
          handler=SermonHandler,
          handler_method='get_sermon_note',
          methods=['GET']),
    route(r'/api/user/notes',
          handler=UserHandler,
          handler_method='get_notes',
          methods=['GET']),
    route(r'/api/user/note',
          handler=UserHandler,
          handler_method='post_note',
          methods=['POST']),
    route(r'/api/user/search',
          handler=UserHandler,
          handler_method='search',
          methods=['GET']),
    route(r'/api/user/post',
          handler=UserHandler,
          handler_method='save_post',
          methods=['POST']),
    route(r'/api/user/post/<post_id:\d+>/like',
          handler=UserHandler,
          handler_method='like_post',
          methods=['POST']),
    route(r'/api/user/post/<post_id:\d+>/unlike',
          handler=UserHandler,
          handler_method='unlike_post',
          methods=['POST']),
    route(r'/api/post/<post_id:\d+>',
          handler=UserHandler,
          handler_method='delete_post',
          methods=['DELETE']),

    route(r'/api/note/<note_id:\d+>',
          handler=UserHandler,
          handler_method='get_note',
          methods=['GET']),
    route(r'/api/note/<note_id:\d+>',
          handler=UserHandler,
          handler_method='delete_note',
          methods=['DELETE']),

    route(r'/api/requests',
          handler=RequestHandler,
          handler_method='get_requests',
          methods=['GET']),
    route(r'/api/login',
          handler=UserHandler,
          handler_method='login',
          methods=['POST']),
    route(r'/api/logout',
          handler=UserHandler,
          handler_method='logout',
          methods=['POST']),

    route(r'/api/signup',
          handler=UserHandler,
          handler_method='signup',
          methods=['POST']),

      route(r'/api/passwordreset',
          handler=UserHandler,
          handler_method='passwordreset',
          methods=['POST']), 

       route(r'/api/notify',
          handler=NotificationHandler,
          handler_method='notify',
          methods=['POST']), 

      route(r'/api/user/notification',
          handler=UserHandler,
          handler_method='get_notifications',
          methods=['GET']), 


      route(r'/api/notification/read',
          handler=NotificationHandler,
          handler_method='mark_notification_as_read',
          methods=['GET']), 

      route(r'/api/user/notification_setting',
          handler=UserHandler,
          handler_method='update_notification_setting',
          methods=['POST']), 

    # /church routes
    route(r'/api/churches',
          handler=MiscHandler,
          handler_method='get_churches',
          methods=['GET']),
    route(r'/api/church/search',
          handler=MiscHandler,
          handler_method='find_church',
          methods=['GET']),
    route(r'/api/church',
          handler=MiscHandler,
          handler_method='add_church',
          methods=['POST']),

    # /sermon/*  routes
    route(r'/api/sermon',
          handler=SermonHandler,
          handler_method='save',
          methods=['POST']),
    route(r'/api/sermon/find',
          handler=SermonHandler,
          handler_method='find',
          methods=['GET']),
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

    # /feed routes
    (r'/api/feeds', FeedHandler),
    # /bible routes
    (r'/api/bible', BibleHandler),
    route(r'/api/bible/versions',
          handler=BibleHandler,
          handler_method='get_versions',
          methods=['GET']),

    # tasks,
    route(r'/api/task',
          handler=TaskHandler,
          handler_method='queue_task',
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

ROUTES += upload_handler.ROUTES

TASK_ROUTES = [
    webapp2.Route(r'/_tasks/load_churches',
                  handler=TaskHandler,
                  handler_method='task_load_churches',
                  methods=['POST']),
    webapp2.Route(r'/_tasks/index_churches',
                  handler=TaskHandler,
                  handler_method='task_index_churches',
                  methods=['POST']),

]
