/**
 * Created by eanjorin on 12/11/15.
 */
App.service('bibleService', function ($http, util, $q) {
    var BASE_URL = 'https://getbible.net/json?';
    var self = this;


    function _validate_book(book) {
        var re = /^(jeremiah|je|jer|psalm|ps|psa|matthew|mt|matt|mat|obadiah|ob|oba|obad|obd|odbh|philemon|pm|phile|phile|philm|phm|phlm|pm|nehemiah|ne|neh|neh|ne|ezekiel|ek|ezek|eze|ezk|proverbs|pr|prov|pro|1\s?samuel|1s|1\s?sam|1sam|1\s?sa|1sa|i\s?samuel|i\s?sam|i\s?sa|acts|ac|act|joshua|js|jos|jos|josh|james|jm|jam|jas|ja|haggai|ha|hag|hagg|hosea|ho|hos|hebrews|he|heb|hw|deuteronomy|dt|deut|deu|de|ruth|ru|rut|titus|ti|tit|tt|ts|lamentations|la|lam|lament|2\s?samuel|2s|2\s?sam|2sam|2\s?sa|2sa|ii\s?samuel|ii\s?sam|ii\s?sa|iis|2\s?timothy|2ti|2\s?tim|2\s?tim|2tim|2\s?ti|iiti|2ti|ii\s?timothy|ii\s?tim|ii\s?ti|2\s?corinthians|2co|2\s?cor|2cor|iico|2\s?co|2co|ii\s?corinthians|ii\s?cor|ii\s?co|song\s?of\s?songs|so|sos|sng|song|song\s?of\s?solomon|sos|songofsongs|songofsolomon|canticle\s?of\s?canticles|luke|lk|luk|lu|daniel|da|dan|dl|dnl|1\s?corinthians|1co|1\s?cor|1cor|ico|1\s?co|1co|i\s?corinthians|i\s?cor|i\s?co|jonah|jh|jon|jnh|galatians|ga|gal|gltns|job|jb|job|2\s?chronicles|2ch|2\s?chr|2\s?chr|2chr|2\s?ch|iich|ii\s?chronicles|ii\s?chr|ii\s?ch|3\s?john|3j|3\s?jn|3\s?jn|3jn|3\s?jo|iiijo|iii\s?john|iii\s?jo|iii\s?jn|leviticus|le|lev|1\s?peter|1p|1\s?pet|1pet|1pe|ipe|1p|i\s?peter|i\s?pet|i\s?pe|1\s?kings|1k|1\s?kgs|1kgs|1\s?kin|1kin|1\s?ki|ik|1ki|i\s?kings|i\s?kin|i\s?ki|2\s?thessalonians|2th|2\s?thess|2\s?thess|2thess|iith|2\s?thes|2thes|2\s?the|2the|2\s?th|2th|ii\s?thessalonians|ii\s?thess|ii\s?the|ii\s?th|genesis|ge|gen|exodus|ex|exo|colossians|co|col|colo|cln|clns|1\s?john|1j|1\s?jn|1jn|1\s?jo|ijo|i\s?john|i\s?jo|i\s?jn|revelation|re|rev|rvltn|joel|jl|joel|joe|jol|philippians|pp|phi|phil|phi|php|judges|jg|judg|jdg|jdgs|1\s?timothy|1ti|1\s?tim|1tim|1\s?ti|iti|1ti|i\s?timothy|i\s?tim|i\s?ti|jude|jude|jude|2\s?john|2j|2\s?jn|2jn|2\s?jo|iijo|ii\s?john|ii\s?jo|ii\s?jn|micah|mi|mic|habakkuk|hb|hab|hk|habk|john|jn|joh|jo|ephesians|ep|eph|ephn|amos|am|amos|amo|isaiah|is|isa|mark|mk|mar|mrk|ecclesiastes|ec|ecc|qohelet|nahum|na|nah|nah|na|ezra|ezr|romans|ro|rom|rmn|rmns|2\s?kings|2k|2\s?kgs|2kgs|2\s?kin|2kin|2\s?ki|iik|2ki|ii\s?kings|ii\s?kin|ii\s?ki|2\s?peter|2p|2\s?pet|2pet|2pe|iip|ii\s?peter|ii\s?pet|ii\s?pe|esther|es|est|esth|malachi|ml|mal|mlc|numbers|nu|num|zechariah|zc|zech|zec|1\s?thessalonians|1th|1\s?thess|1thess|ith|1\s?thes|1thes|1\s?the|1the|1\s?th|1th|i\s?thessalonians|i\s?thess|i\s?the|i\s?th|1\s?chronicles|1ch|1\s?chr|1chr|1\s?ch|ich|i\s?chronicles|i\s?chr|i\s?ch|zephaniah|zp|zep|zeph)$/;
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
     * e.g John 3:16 => {book: 'John', chapter:3, verses:['16']
     * @param str
     * @returns {{book: string, chapter: number, verses: Array}}
     */
    self.parseScripture = function (str) {

        var book_regex = /([1|2]?[\D]+)(\d.*)/;
        var m;
        var book = '', chapter = '', verses = [], translation = 'kjv';

        //run first regex to get book and everything else
        if ((m = book_regex.exec(str)) !== null) {
            if (m.index === book_regex.lastIndex) {
                book_regex.lastIndex++;
            }
        }
        if (_.isArray(m) && m.length > 1) {
            //extract the book
            book = m[1].trim();

            //regex for the chapter number, and everything else
            var chapter_regex = /(\d+):?(.*)/;
            var mm;

            if (m.length > 2 && (mm = chapter_regex.exec(m[2])) !== null) {

                if (chapter_regex.index === chapter_regex.lastIndex) {
                    chapter_regex.lastIndex++;
                }

                //extract chapter
                chapter = parseInt(mm[1]);

                var items = [];
                //split if there are multiple verses
                if (mm[2].indexOf(',') >= 0) {
                    items = mm[2].split(',');
                } else {
                    items.push(mm[2]);
                }
                //regex to extract valid verses numbers
                var verse_regex = /(\d+$)|(\d-\d)|(\d+).*/;
                for (var i = 0; i < items.length; i++) {
                    if ((m = verse_regex.exec(items[i])) !== null) {
                        if (m.index === book_regex.lastIndex) {
                            book_regex.lastIndex++;
                        }
                        if (m[1]) {
                            verses.push(m[1]);
                        } else if (m[2]) {
                            verses.push(m[2]);
                        } else if (m[3]) {
                            verses.push(m[3]);
                        }
                    }
                }

            }
        }
        //extract the translation
        translation_regex = /(amp|asv|ceb|cevdcus06|cpdv|erv|esv|gnb|gnt|gntd|icb|kjv|kjva|kjva|mev|msg|nabre|nasb|ncv|net|nirv|niv|nkjv|nlt|web|webbe|wmb|wmbbe')/;
        if ((m = translation_regex.exec(str.toLowerCase())) !== null) {
            if (m.index === book_regex.lastIndex) {
                book_regex.lastIndex++;
            }
            if (m.length > 1) {
                translation = m[1];
            }
        }

        if (_validate_book(book.toLowerCase())) {
            return {
                book: book,
                chapter: chapter,
                verses: verses,
                translation: translation
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
        tmp += '(' + s.translation + ')';
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

    self.getPassage = function (scripture) {
        if (_.isString(scripture)) {
            scripture = self.parseScripture(scripture);
        }
        //console.log(scripture);
        scripture.translation = scripture.translation ? scripture.translation : 'kjv';
        var param = util.toQueryString(scripture);
        return $http.get('/api/bible?' + param);
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
        return $http.get('/api/bible/versions', {cache: true});
    };

    self.saveSermon = function (sermon) {
        return $http.post('/api/sermon', sermon);
    };

    self.publishSermon = function (sermon) {
        return $http.post('/api/sermon/publish', sermon);
    };

    self.logSermonView = function (sermonId) {
        return $http.post('/api/sermon/' + sermonId + '/log', sermon, {ignoreLoadingBar: true});
    };

    self.findSermon = function (query) {
        return $http.get('/api/sermon/find?query=' + encodeURIComponent(query), {cache: true, ignoreLoadingBar: true});
    };

    self.findChurch = function (query) {
        return $http.get('/api/church/search?query=' + encodeURIComponent(query), {
            cache: true,
            ignoreLoadingBar: true
        });
    };


});