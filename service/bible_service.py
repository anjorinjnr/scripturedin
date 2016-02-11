
from google.appengine.api import memcache
import json
from google.appengine.api import urlfetch
import logging
import sys
sys.path.insert(0, 'lib')
from bs4 import BeautifulSoup

BIBLE_COM_BASE_URL = 'https://www.bible.com/bible'
#format: version/book.chapter.verse
def fetch_(version, book, chapter, verse=None):
    if verse:
        url = '{base}/{version}/{book}.{chapter}.{verse}.json'.format(base=BIBLE_COM_BASE_URL,
                                                                      version=version,
                                                                      book=book,
                                                                      chapter=chapter,
                                                                      verse=verse)
    else:
         url = '{base}/{version}/{book}.{chapter}.json'.format(base=BIBLE_COM_BASE_URL,
                                                               version=version,
                                                               book=book,
                                                               chapter=chapter,
                                                               verse=verse)
    data = memcache.get(url)
    if data is not None:
        logging.info('cache hit:  %s', url)
        return data
    else:
        try:
            logging.info('fetching %s', url)
            result = urlfetch.fetch(url)
            if result.status_code == 200:
                data = json.loads(result.content)
                memcache.set(url, data)
                return data
        except Exception as e:
            logging.error(e.message)


def extract_verses_(chapter_html):
    soup = BeautifulSoup(chapter_html, 'html.parser')
    verses_p =  soup.find_all('div', 'p')
    i = 1
    verses = []
    for v in verses_p:
        verse_span =  v.find('span', 'verse v%s' % i)
        content = []
        for c in verse_span.find_all(class_='content'):
            content.append(c.string)
        verse = {
            'verse': int(verse_span.find('span', 'label').string),
            'content': ''.join(content)
        }
        verses.append(verse)
        i += 1
    return verses


def get_passage(book, chapter, verses, translation='kjv'):
    verses = [str(v) for v in verses]
    abbrv = abbreviation_lookup(book)
    version = bible_com_version_id_lookup(translation)
    book = bible_com_key_lookup(abbrv)
    passages = []
    if not verses:
        passage = fetch_(version, book, chapter)
        return {
            'chapter': chapter,
            'book': bible_com_name_lookup(abbrv),
            'title': passage['human'],
            'verses': extract_verses_(passage['reader_html']),
            'version': passage['reader_version']
        }
    else:
        #print verses
        for verse in verses:
            if '-' in verse and len(verse) > 2:
                v = verse.split('-')
                start = int(v[0])
                end =  int(v[1])
                while start <= end:
                    passages.append(fetch_(version, book, chapter, start))
                    start += 1
            elif int(verse) > 0:
                passages.append(fetch_(version, book, chapter, verse))

        passage = {}
        p_verses = []
        for p in passages:
            if not passage:
                passage['chapter'] = int(p['reader_chapter'])
                passage['book'] = str(bible_com_name_lookup(abbrv))
                passage['title'] = '%s %s:%s' % (passage['book'], passage['chapter'], ','.join(verses))
                passage['version'] = str(p['reader_version'])
            verse = p['human'].split(':')[1]
            p_verses.append({
                'verse': int(verse),
                'content': u''.join((p['reader_html'])).encode('utf-8').strip()
            })
        passage['verses'] = sorted(p_verses, key=lambda k: k['verse'])
        return passage


def bible_com_version_id_lookup(translation):
    key = 'bible.com.version.lookup'
    index = memcache.get(key)
    if not index:
        with open('data/bible.com/versions.lookup.json') as f:
            index = json.load(f)
            memcache.set(key, index)

    lower = translation.lower()
    if lower in index:
        return index[lower]['id']

def bible_key_lookup_():
    key = 'bible.com.key.lookup'
    index = memcache.get(key)
    if not index:
        with open('data/bible.com/book.key.lookup.json') as f:
            index = json.load(f)
            memcache.set(key, index)
    return index

def bible_com_key_lookup(abbrv):
    index = bible_key_lookup_()
    lower = abbrv.lower()
    if lower in index:
        return index[lower]['key']

def bible_com_name_lookup(abbrv):
    index = bible_key_lookup_()
    lower = abbrv.lower()
    if lower in index:
        return index[lower]['name']

def abbreviation_lookup(book):
    key = 'bible.com.abbrv.lookup'
    index = memcache.get(key)
    if not index:
        with open('data/bible.com/abbrv.lookup.json') as f:
            index = json.load(f)
            memcache.set(key, index)

    lower = book.lower()
    if lower in index:
        return index[lower]

def versions():
    key = 'bible.com.versions'
    vers = memcache.get(key)
    if vers is None:
        with open('data/bible.com/versions.json') as f:
            vers = json.load(f)
            memcache.set(key, vers)
    return vers
