from handlers import base_handler

from models import scripturedin as model
from google.appengine.ext import ndb
import json
from bs4 import BeautifulSoup

class TaskHandler(base_handler.BaseHandler):

    def persist_note_data(self):
        pass

    def run(self):
        soup = BeautifulSoup(open('../app/bible.html'), 'html.parser')
        verses =  soup.find_all('div', 'p')
        i = 1
        for v in verses:
            verse_ =  v.find('span', 'verse v%s' % i)
            content = []
            for c in verse_.find_all(class_='content'):
                content.append(c.string)
            vv = {
                 'verse': verse_.find('span', 'label').string,
                 'content': "".join(content)
                }
            i += 1
            print vv

        # with open('../data/bible.com/abbrv.lookup.json') as f:
        #     index = json.load(f)
        #     print index

    def versions(self):
        data = {}
        list = []
        with open('../data/bible.com.versions.json') as f:
            versions = json.load(f)
            for v in versions:
                ver = {
                    'id': v['id'],
                    'title': v['title'],
                    'abbr': v['abbr'],
                    'lang': v['language_name']
                }
                data[v['abbr'].lower()] = (ver)
                list.append(ver)
        print json.dumps(data)
        print json.dumps(list)

    def build_map(self, path='data/bible.com.books.json'):
        books_map = {}
        bible_com_map = {}
        with open(path) as f:
            books = json.load(f)
            for list  in books:
                for item in list:
                    if 'text' in item and item['text']:
                        books_map[item['abbreviation'].lower()] = item['human']
                        bible_com_map[item['abbreviation'].lower()] = {
                            'key': item['usfm'].lower(),
                            'name': item['human']
                        }
        #print json.dumps(bible_com_map)

        book_lookup = {}
        regex = []
        with open('../data/book.names.json') as f:
            books = json.load(f)
            i = 0

            for (k, v) in books.iteritems():
                key = None
                for name in v['names']['eng']:
                    name = name.lower()
                    if not key and  name in books_map:
                        i += 1
                        key = name
                    regex.append(name.replace(' ', '\\s?'))

                if not key:
                    print k
                for name in v['names']['eng']:
                    name = name.lower()
                    book_lookup[name] = key
        print len(books), i
        print '|'.join(regex)
        print json.dumps(book_lookup)

    #self.write_response(books_map)



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



if __name__ == '__main__':
    t = TaskHandler()
    t.run()
    #t.versions()
    #t.build_map('../data/bible.com.books.json')
