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
    self.parseScripture = function (str) {
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

    self.scriptureToText = function (s) {
        var tmp = s.book + ' ' + s.chapter;
        if (!_.isEmpty(s.verses)) {
            tmp += ':' + s.verses.join(',');
        }
        return tmp;
    };

    self.getSermon = function (id) {
        return $http.get('/api/sermon/' + id);
    };

    self.getSermonComments = function (sermonId) {
        return $http.get('/api/sermon/' + sermonId + '/comments', {ignoreLoadingBar: true});
    };

    self.getComments = function (refKey, kind) {
        return $http.get('/api/comment/' + refKey + '?k=' + kind, {ignoreLoadingBar: true});
    };

    self.getChurchSermons = function (churchId) {
        return $http.get('/api/sermon?church_id=' + churchId);

    };
    /**
     * Get scripture
     * @param passage
     * @param version
     * @returns {HttpPromise}
     */
    self.get = function (passage, version) {
        version = version ? version : 'kjv';
        return $http.jsonp(BASE_URL + 'callback=JSON_CALLBACK&passage=' + passage + '&v=' + version);
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