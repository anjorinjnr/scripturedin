from handlers import base_handler

from models import scripturedin as model
from google.appengine.ext import ndb

class TaskHandler(base_handler.BaseHandler):

    def persist_note_data(self):
        pass

    def load_church(self):
        churches = []
        with open('data/churches.csv') as f:
             lines =  f.readlines()
             for line in lines:
                 items = line.split(',')
                 website = items[0]
                 name = items[1]
                 city = items[4]
                 state = items[5]
                 denom = items[7]
                 churches.append(model.Church(
                     name=name,
                     website=website,
                     country='US',
                     state=state,
                     city=city,
                     denom=denom
                 ))
        ndb.put_multi(churches)



