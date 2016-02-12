import unittest

import mock
from google.appengine.ext import testbed
import json
from google.appengine.api import memcache

from service import bible_service


class BibleServiceTestCase(unittest.TestCase):
    def setUp(self):
        self.testbed = testbed.Testbed()
        self.testbed.activate()
        self.testbed.init_memcache_stub()
        self.testbed.init_datastore_v3_stub()
        self.maxDiff = None

    @mock.patch('google.appengine.api.urlfetch.fetch')
    def test_get_passage_mixed(self, mock_fetch):
        self.maxDiff = None
        mock_resp = mock.Mock()
        mock_resp.status_code = 200
        mock_resp.content = json.dumps({
            "reader_chapter": "3",
            "reader_version": "KJV",
            "reader_html": "There was a man of the Pharisees, named Nicodemus, a ruler of the Jews:",
            "to_path": "/bible/1/jhn.3.1.kjv",
            "reader_book": "John 3",
            "human": "John 3:1"
        })
        mock_resp_2 = mock.Mock()
        mock_resp_2.status_code = 200
        mock_resp_2.content = json.dumps({
            "reader_chapter": "3",
            "reader_version": "KJV",
            "reader_html": "The same came to Jesus by night, and said unto him, Rabbi, we know that thou art a teacher "
                           "come from God: for no man can do these miracles that thou doest, except God be with him.",
            "to_path": "/bible/1/jhn.3.2.kjv",
            "reader_book": "John 3",
            "human": "John 3:2"
        })
        mock_resp_3 = mock.Mock()
        mock_resp_3.status_code = 200
        mock_resp_3.content = json.dumps({
            "reader_chapter": "3",
            "reader_version": "KJV",
            "reader_html": "   For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
            "to_path": "/bible/1/jhn.3.16.kjv",
            "reader_book": "John 3:",
            "human": "John 3:16"
        })
        mock_fetch.side_effect = [mock_resp_3, mock_resp, mock_resp_2]
        resp = bible_service.get_passage('john', 3, ['1-2', 16])
        calls = [mock.call('https://www.bible.com/bible/1/jhn.3.1.json'),
                 mock.call('https://www.bible.com/bible/1/jhn.3.2.json'),
                 mock.call('https://www.bible.com/bible/1/jhn.3.16.json')]
        mock_fetch.assert_has_calls(calls)
        self.assertEquals({'chapter': 3,
                           'verses': [
                               {'content': 'There was a man of the Pharisees, named Nicodemus, a ruler of the Jews:',
                                'verse': 1
                                },
                               {'content': 'The same came to Jesus by night, and said unto him, Rabbi, we know that '
                                           'thou art a teacher come from God: for no man can do these miracles that '
                                           'thou doest, except God be with him.',
                                'verse': 2
                                },
                               {'content': 'For God so loved the world, that he gave his only begotten Son, '
                                           'that whosoever believeth in him should not perish, '
                                           'but have everlasting life.',
                                'verse': 16
                                }
                           ],
                           'book': 'John',
                           'version': 'KJV',
                           'title': 'John 3:1-2,16'}, resp)

    @mock.patch('google.appengine.api.urlfetch.fetch')
    def test_get_passage_range(self, mock_fetch):
        mock_resp = mock.Mock()
        mock_resp.status_code = 200
        mock_resp.content = json.dumps({
            "reader_chapter": "3",
            "reader_version": "KJV",
            "reader_html": "There was a man of the Pharisees, named Nicodemus, a ruler of the Jews:",
            "to_path": "/bible/1/jhn.3.1.kjv",
            "reader_book": "John 3",
            "human": "John 3:1"
        })
        mock_resp_2 = mock.Mock()
        mock_resp_2.status_code = 200
        mock_resp_2.content = json.dumps({
            "reader_chapter": "3",
            "reader_version": "KJV",
            "reader_html": "The same came to Jesus by night, and said unto him, Rabbi, we know that thou art a teacher "
                           "come from God: for no man can do these miracles that thou doest, except God be with him.",
            "to_path": "/bible/1/jhn.3.2.kjv",
            "reader_book": "John 3",
            "human": "John 3:2"
        })
        mock_fetch.side_effect = [mock_resp, mock_resp_2]
        resp = bible_service.get_passage('john', 3, ['1-2'])
        calls = [mock.call('https://www.bible.com/bible/1/jhn.3.1.json'),
                 mock.call('https://www.bible.com/bible/1/jhn.3.2.json')]
        mock_fetch.assert_has_calls(calls)
        self.assertEquals({'chapter': 3,
                           'verses': [
                               {'content': 'There was a man of the Pharisees, named Nicodemus, a ruler of the Jews:',
                                'verse': 1
                                },
                               {'content': 'The same came to Jesus by night, and said unto him, Rabbi, we know that '
                                           'thou art a teacher come from God: for no man can do these miracles that '
                                           'thou doest, except God be with him.',
                                'verse': 2
                                }
                           ],
                           'book': 'John',
                           'version': 'KJV',
                           'title': 'John 3:1-2'}, resp)

    @mock.patch('google.appengine.api.urlfetch.fetch')
    def test_get_passage_single_verse(self, mock_fetch):
        mock_resp = mock.Mock()
        mock_resp.status_code = 200
        mock_resp.content = json.dumps({
            "reader_chapter": "3",
            "reader_version": "KJV",
            "reader_html": "   For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
            "to_path": "/bible/1/jhn.3.16.kjv",
            "reader_book": "John 3:",
            "human": "John 3:16"
        })
        mock_fetch.return_value = mock_resp
        resp = bible_service.get_passage('john', 3, [16])
        mock_fetch.assert_called_once_with('https://www.bible.com/bible/1/jhn.3.16.json')
        self.assertEquals({'chapter': 3,
                           'verses': [
                               {'content': 'For God so loved the world, that he gave his only begotten Son, '
                                           'that whosoever believeth in him should not perish, '
                                           'but have everlasting life.',
                                'verse': 16
                                }
                           ],
                           'book': 'John',
                           'version': 'KJV',
                           'title': 'John 3:16'}, resp)

    @mock.patch('google.appengine.api.urlfetch.fetch')
    def test_get_passage_full_chapter(self, mock_fetch):
        mock_resp = mock.Mock()
        mock_resp.status_code = 200
        mock_resp.content = json.dumps({
            "reader_chapter": "117",
            "reader_version": "KJV",
            "reader_html": "<div class=\"version vid1 iso6393eng\" data-vid=\"1\" data-iso6393=\"eng\">\n    <div class=\"book bkPSA\">\n        <div class=\"chapter ch117\" data-usfm=\"PSA.117\">\n            <div class=\"label\">117</div><div class=\"p\"><span class=\"content\">  </span><span class=\"verse v1\" data-usfm=\"PSA.117.1\"><span class=\"label\">1</span><span class=\"content\">O praise the </span><span class=\"nd\"><span class=\"content\">Lord</span></span><span class=\"content\">, all ye nations: praise him, all ye people.</span></span></div><div class=\"p\"><span class=\"verse v1\" data-usfm=\"PSA.117.1\"><span class=\"content\">  </span></span><span class=\"verse v2\" data-usfm=\"PSA.117.2\"><span class=\"label\">2</span><span class=\"content\">For his merciful kindness is great toward us: and the truth of the </span><span class=\"nd\"><span class=\"content\">Lord</span></span><span class=\"content\"> endureth for ever. Praise ye the </span><span class=\"nd\"><span class=\"content\">Lord</span></span><span class=\"content\">.</span></span></div>\n        </div>\n    </div>\n</div>",
            "to_path": "/bible/1/psa.117.kjv",
            "reader_book": "Psalms",
            "human": "Psalms 117"
        })

        mock_fetch.return_value = mock_resp
        resp = bible_service.get_passage('psalm', 117, [])
        mock_fetch.assert_called_once_with('https://www.bible.com/bible/1/psa.117.json')
        self.assertEquals({'chapter': 117,
                           'verses': [
                               {
                                   'content': 'O praise the Lord, all ye nations: praise him, all ye people.',
                                   'verse': '1'
                                },
                               {
                                   'content': 'For his merciful kindness is great toward us: and the truth of the Lord endureth for ever. Praise ye the Lord.',
                                   'verse': '2'
                               }
                           ],
                           'book': 'Psalms',
                           'version': 'KJV',
                           'title': 'Psalms 117'},
                          resp)

    def test_extract_verses(self):
        with open('tests/niv.html', 'r') as f:
            niv_html = f.read()
            expected = bible_service.extract_verses_(niv_html)
            # print json.dumps(expected)
            with open('tests/niv.json', 'r') as f1:
                actual = json.loads(f1.read())
                self.assertEqual(expected, actual)

        html = """
        <div class="version vid1 iso6393eng" data-vid="1" data-iso6393="eng">
        <div class="book bkCOL">
            <div class="chapter ch1" data-usfm="COL.1">
                <div class="label">1</div>
                <div class="p">
                    <span class="content"> </span>
                    <span class="verse v1" data-usfm="COL.1.1">
                        <span class="label">1</span>
                        <span class="content">Paul, an apostle of Jesus Christ by the will of God, and Timothy our brother,</span>
                    </span>
                </div>
                <div class="p">
                    <span class="verse v1" data-usfm="COL.1.1">
                        <span class="content"> </span>
                    </span>
                    <span class="verse v2" data-usfm="COL.1.2"><span class="label">2</span><span class="content">To the saints and faithful brethren in Christ which are at Colosse: Grace be unto you, and peace, from God our Father and the Lord Jesus Christ.</span></span>
                </div>
                <div class="p"><span class="verse v2" data-usfm="COL.1.2"><span class="content"> </span></span><span
                        class="verse v3" data-usfm="COL.1.3"><span class="label">3</span><span class="content">We give thanks to God and the Father of our Lord Jesus Christ, praying always for you,</span></span>
                </div>
            </div>
          </div>
        <div>
         """
        resp = bible_service.extract_verses_(html)
        self.assertEquals([
            {'verse': '1', 'content': 'Paul, an apostle of Jesus Christ by the will of God, and Timothy our brother,'},
            {'verse': '2',
             'content': 'To the saints and faithful brethren in Christ which are at Colosse: Grace be unto you, and peace, from God our Father and the Lord Jesus Christ.'},
            {'verse': '3',
             'content': 'We give thanks to God and the Father of our Lord Jesus Christ, praying always for you,'}
        ], resp)

        html = """
            <div class="version vid1 iso6393eng" data-vid="1" data-iso6393="eng">
               <div class="book bkPSA">
                  <div class="chapter ch117" data-usfm="PSA.117">
                     <div class="label">117</div>
                     <div class="p">
                         <span class="content"> </span>
                         <span class="verse v1" data-usfm="PSA.117.1">
                             <span class="label">1</span>
                             <span class="content">O praise the </span>
                             <span class="nd">
                                 <span class="content">Lord</span>
                             </span>
                             <span class="content">, all ye nations: praise him, all ye people.</span>
                         </span>
                     </div>
                     <div class="p"><span class="verse v1" data-usfm="PSA.117.1"><span class="content"> </span></span><span
                        class="verse v2" data-usfm="PSA.117.2"><span class="label">2</span><span class="content">For his merciful kindness is great toward us: and the truth of the </span><span
                        class="nd"><span class="content">Lord</span></span><span class="content"> endureth for ever. Praise ye the </span><span
                        class="nd"><span class="content">Lord</span></span><span class="content">.</span></span></div>
                  </div>
               </div>
            </div>
        """
        resp = bible_service.extract_verses_(html)
        self.assertEquals([
            {'verse': '1', 'content': 'O praise the Lord, all ye nations: praise him, all ye people.'},
            {'verse': '2',
             'content': 'For his merciful kindness is great toward us: and the truth of the Lord endureth for ever. Praise ye the Lord.'}
        ], resp)

    def test_bible_com_version_id_lookup(self):
        data = """
        {
          "gw": {
            "lang": "English",
            "id": 70,
            "abbr": "GW",
            "title": "GOD'S WORD Translation"
          }
        }
        """
        mocked_open_function = mock.mock_open(read_data=data)
        with mock.patch("__builtin__.open", mocked_open_function):
            res = bible_service.bible_com_version_id_lookup('gw')
            mocked_open_function.assert_called_once_with('data/bible.com/versions.lookup.json')
            self.assertEquals(70, res)
            self.assertEquals(memcache.get('bible.com.version.lookup'), json.loads(data))

    def test_bible_com_key_lookup(self):
        data = """
        {
          "2 kgs": {
            "name": "2 Kings",
            "key": "2ki"
          },
          "1 pet": {
            "name": "1 Peter",
            "key": "1pe"
          }
        }
        """
        mocked_open_function = mock.mock_open(read_data=data)
        with mock.patch("__builtin__.open", mocked_open_function):
            res = bible_service.bible_com_key_lookup('1 pet')
            mocked_open_function.assert_called_once_with('data/bible.com/book.key.lookup.json')
            self.assertEquals('1pe', res)
            self.assertEquals(memcache.get('bible.com.key.lookup'), json.loads(data))
            res = bible_service.bible_com_key_lookup('2 KGS')
            mocked_open_function.assert_called_once_with('data/bible.com/book.key.lookup.json')
            self.assertEquals('2ki', res)

    def test_bible_com_name_lookup(self):
        data = """
        {
          "2 kgs": {
            "name": "2 Kings",
            "key": "2ki"
          },
          "1 pet": {
            "name": "1 Peter",
            "key": "1pe"
          }
        }
        """
        mocked_open_function = mock.mock_open(read_data=data)
        with mock.patch("__builtin__.open", mocked_open_function):
            res = bible_service.bible_com_name_lookup('1 pet')
            mocked_open_function.assert_called_once_with('data/bible.com/book.key.lookup.json')
            self.assertEquals('1 Peter', res)
            self.assertEquals(memcache.get('bible.com.key.lookup'), json.loads(data))
            res = bible_service.bible_com_name_lookup('2 KGS')
            mocked_open_function.assert_called_once_with('data/bible.com/book.key.lookup.json')
            self.assertEquals('2 Kings', res)

    def test_abbreviation_lookup(self):
        data = '{ "col": "col",  "colossians": "col" }'
        mocked_open_function = mock.mock_open(read_data=data)
        with mock.patch("__builtin__.open", mocked_open_function):
            res = bible_service.abbreviation_lookup('colossians')
            mocked_open_function.assert_called_once_with('data/bible.com/abbrv.lookup.json')
            self.assertEquals('col', res)
            self.assertEquals(memcache.get('bible.com.abbrv.lookup'), json.loads(data))


if __name__ == '__main__':
    unittest.main()
