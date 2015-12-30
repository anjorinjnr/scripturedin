/**
 * Created by eanjorin on 12/11/15.
 */
App.service('bibleService', function ($http, $q) {
    var BASE_URL = 'https://getbible.net/json?';
    var self = this;

    var VERSIONS = {
        'kjv': 'King James Version',
        'akjv': 'KJV Easy Read',
        'asv': 'American Standard Version',
        'amp': 'Amplified Version',
        'basicenglish': 'Basic English Bible',
        'darby': 'Darby',
        'nasb': 'New American Standard',
        'ylt': 'Young\'s Literal Translation',
        'web': 'World English Bible',
        'wb': 'Webster\'s Bible'
    };

    function _validate_book(book) {
        var re = /^(genesis|ge|gen|exodus|ex|exo|leviticus|le|lev|numbers|nu|num|deuteronomy|dt|deut|deu|de|joshua|js|jos|jos|josh|judges|jg|jdg|jdgs|ruth|ru|rut|1\s?samuel|1s|1\s?sam|1sam|1\s?sa|1sa|i\s?samuel|i\s?sam|i\s?sa|2\s?samuel|2s|2\s?sam|2sam|2\s?sa|2sa|ii\s?samuel|ii\s?sam|ii\s?sa|iis|1\s?kings|1k|1\s?kin|1kin|1\s?ki|ik|1ki|i\s?kings|i\s?kin|i\s?ki|2\s?kings|2k|2\s?kin|2kin|2\s?ki|iik|2ki|ii\s?kings|ii\s?kin|ii\s?ki|1\s?chronicles|1ch|1\s?chr|1chr|1\s?ch|ich|i\s?chronicles|i\s?chr|i\s?ch|2\s?chronicles|2ch|2\s?chr|2\s?chr|2chr|2\s?ch|iich|ii\s?chronicles|ii\s?chr|ii\s?ch|ezra|ezr|nehemiah|ne|neh|neh|ne|esther|es|est|esth|job|jb|job|psalm|ps|psa|proverbs|pr|prov|pro|ecclesiastes|ec|ecc|qohelet|song\s?of songs|so|sos|song\s?of solomon|sos|songofsongs|songofsolomon|canticle\s?of canticles|isaiah|is|isa|jeremiah|je|jer|lamentations|la|lam|lament|ezekiel|ek|ezek|eze|daniel|da|dan|dl|dnl|hosea|ho|hos|joel|jl|joel|joe|amos|am|amos|amo|obadiah|ob|oba|obd|odbh|jonah|jh|jon|jnh|micah|mi|mic|nahum|na|nah|nah|na|habakkuk|hb|hab|hk|habk|zephaniah|zp|zep|zeph|haggai|ha|hag|hagg|zechariah|zc|zech|zec|malachi|ml|mal|mlc|matthew|mt|matt|mat|mark|mk|mar|mrk|luke|lk|luk|lu|john|jn|joh|jo|acts|ac|act|romans|ro|rom|rmn|rmns|1\s?corinthians|1co|1\s?cor|1cor|ico|1\s?co|1co|i\s?corinthians|i\s?cor|i\s?co|2\s?corinthians|2co|2\s?cor|2cor|iico|2\s?co|2co|ii\s?corinthians|ii\s?cor|ii\s?co|galatians|ga|gal|gltns|ephesians|ep|eph|ephn|philippians|pp|phi|phil|phi|colossians|co|col|colo|cln|clns|1\s?thessalonians|1th|1\s?thess|1thess|ith|1\s?thes|1thes|1\s?the|1the|1\s?th|1th|i\s?thessalonians|i\s?thess|i\s?the|i\s?th|2\s?thessalonians|2th|2\s?thess|2\s?thess|2thess|iith|2\s?thes|2thes|2\s?the|2the|2\s?th|2th|ii\s?thessalonians|ii\s?thess|ii\s?the|ii\s?th|1\s?timothy|1ti|1\s?tim|1tim|1\s?ti|iti|1ti|i\s?timothy|i\s?tim|i\s?ti|2\s?timothy|2ti|2\s?tim|2\s?tim|2tim|2\s?ti|iiti|2ti|ii\s?timothy|ii\s?tim|ii\s?ti|titus|ti|tit|tt|ts|philemon|pm|phile|phile|philm|pm|hebrews|he|heb|hw|james|jm|jam|jas|ja|1\s?peter|1p|1\s?pet|1pet|ipe|1p|i\s?peter|i\s?pet|i\s?pe|2\s?peter|2p|2\s?pet|2pet|2pe|iip|ii\s?peter|ii\s?pet|ii\s?pe|1\s?john|1j|1\s?jn|1jn|1\s?jo|ijo|i\s?john|i\s?jo|i\s?jn|2\s?john|2j|2\s?jn|2jn|2\s?jo|iijo|ii\s?john|ii\s?jo|ii\s?jn|3\s?john|3j|3\s?jn|3\s?jn|3jn|3\s?jo|iiijo|iii\s?john|iii\s?jo|iii\s?jn|jude|jude|jude|revelation|re|rev|rvltn)$/;
        var m;

        if ((m = re.exec(book)) !== null) {
            if (m.index === re.lastIndex) {
                re.lastIndex++;
            }
            return m.length > 1;
        }
        return false;
    }

    /**
     * Parse out parts of a scripture string and return an object with the appropriate info
     * e.g John 3:!6 => {book: 'John', chapter:3, verses:['16']
     * @param str
     * @returns {{book: string, chapter: number, verses: Array}}
     */
    self.parseScripture = function scrip(str) {
        var re = /([1|2]?[\D]+)(\d.*)/;
        var m;

        if ((m = re.exec(str)) !== null) {
            if (m.index === re.lastIndex) {
                re.lastIndex++;
            }
        }
        if (m.length > 1) {
            var book = m[1].trim();
            var chapter = '', verses = [];
            var ch_re = /(\d+):?(.*)/;
            var mm;

            if (m.length > 2 && (mm = ch_re.exec(m[2])) !== null) {
                if (ch_re.index === ch_re.lastIndex) {
                    ch_re.lastIndex++;
                }
                if (mm.length > 1) {
                    chapter = parseInt(mm[1]);
                }
                if (mm.length > 2) {
                    //console.log(mm[2]);
                    var _verses = mm[2].split(',');
                    if (_verses[0].trim() != '') {
                        verses = _verses
                    }
                }
            }
        }
        if (_validate_book(book.toLowerCase())) {
            return {
                book: book,
                chapter: chapter,
                verses: verses
            }
        } else {
            return {};
        }

    };
    self.addChurch = function (data) {
        return $http.post('/api/church', data);
    };
    self.getChurches = function () {
        return $http.get('/api/churches');
    };

    self.get = function (passage, version) {
        version = version ? version : 'kjv';
        return $http.jsonp(BASE_URL + 'callback=JSON_CALLBACK&passage=' + passage + '&v=' + version);
        // var def = $q.defer();
        // def.resolve({ data: {
        //     "book": [
        //         {
        //             "book_ref": "Ac",
        //             "book_name": "Acts",
        //             "book_nr": "44",
        //             "chapter_nr": "3",
        //             "chapter": {
        //                 "4": {
        //                     "verse_nr": "4",
        //                     "verse": "And Peter, fastening his eyes upon him with John, said, Look on us."
        //                 },
        //                 "5": {
        //                     "verse_nr": 5,
        //                     "verse": "And he gave heed unto them, expecting to receive something of them."
        //                 },
        //                 "6": {
        //                     "verse_nr": 6,
        //                     "verse": "Then Peter said, Silver and gold have I none; but such as I have give I thee: In the name of Jesus Christ of Nazareth rise up and walk."
        //                 },
        //                 "7": {
        //                     "verse_nr": 7,
        //                     "verse": "And he took him by the right hand, and lifted him up: and immediately his feet and ankle bones received strength."
        //                 },
        //                 "8": {
        //                     "verse_nr": 8,
        //                     "verse": "And he leaping up stood, and walked, and entered with them into the temple, walking, and leaping, and praising God."
        //                 },
        //                 "9": {
        //                     "verse_nr": 9,
        //                     "verse": "And all the people saw him walking and praising God:"
        //                 },
        //                 "10": {
        //                     "verse_nr": 10,
        //                     "verse": "And they knew that it was he which sat for alms at the Beautiful gate of the temple: and they were filled with wonder and amazement at that which had happened unto him."
        //                 },
        //                 "11": {
        //                     "verse_nr": 11,
        //                     "verse": "And as the lame man which was healed held Peter and John, all the people ran together unto them in the porch that is called Solomon's, greatly wondering."
        //                 },
        //                 "12": {
        //                     "verse_nr": 12,
        //                     "verse": "And when Peter saw it, he answered unto the people, Ye men of Israel, why marvel ye at this? or why look ye so earnestly on us, as though by our own power or holiness we had made this man to walk?"
        //                 },
        //                 "13": {
        //                     "verse_nr": 13,
        //                     "verse": "The God of Abraham, and of Isaac, and of Jacob, the God of our fathers, hath glorified his Son Jesus; whom ye delivered up, and denied him in the presence of Pilate, when he was determined to let him go."
        //                 },
        //                 "14": {
        //                     "verse_nr": 14,
        //                     "verse": "But ye denied the Holy One and the Just, and desired a murderer to be granted unto you;"
        //                 },
        //                 "15": {
        //                     "verse_nr": 15,
        //                     "verse": "And killed the Prince of life, whom God hath raised from the dead; whereof we are witnesses."
        //                 },
        //                 "16": {
        //                     "verse_nr": 16,
        //                     "verse": "And his name through faith in his name hath made this man strong, whom ye see and know: yea, the faith which is by him hath given him this perfect soundness in the presence of you all."
        //                 },
        //                 "17": {
        //                     "verse_nr": 17,
        //                     "verse": "And now, brethren, I wot that through ignorance ye did it, as did also your rulers."
        //                 }
        //             }
        //         },
        //         {
        //             "book_ref": "Ac",
        //             "book_name": "Acts",
        //             "book_nr": "44",
        //             "chapter_nr": "2",
        //             "chapter": {
        //                 "1": {
        //                     "verse_nr": "1",
        //                     "verse": "And when the day of Pentecost was fully come, they were all with one accord in one place."
        //                 }
        //             }
        //         }
        //     ],
        //     "direction": "LTR",
        //     "type": "verse",
        //     "version": "kjv"
        // }});
        // return def.promise;
    };

    self.versions = function () {
        return VERSIONS;
    };

    self.saveSermon = function (sermon) {
        return $http.post('/api/sermon', sermon);
    };

    self.publishSermon = function (sermon) {
        return $http.post('/api/sermon/publish', sermon);
    };


});