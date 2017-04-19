from handlers import base_handler

class RequestHandler(base_handler.BaseHandler):
    def get_requests(self):
        return self.success_response()
