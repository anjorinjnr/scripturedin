import { isString } from 'lodash';

import { books } from '../data/bible-books';
import { helper } from '../helper';

export class BibleService {

    constructor($http, $q, $state) {
        this.http_ = $http;
        this.q_ = $q;
        this.state_ = $state;
        this.swal = {};
    }


    // var BibleService($http, util, $q, $state, $uibModal, bibleBooks) {
    //     var BASE_URL = 'https://getbible.net/json?';
    //     var self = this;
    //     self.modal_ = $uibModal;
    //     self.http_ = $http;
    //     self.util = util;
    //     self.q_ = $q;
    //     self.state_ = $state;
    //     self.books = bibleBooks;
    // };

    validateBook_(book) {
        let re = /^(jeremiah|je|jer|psalm|psalms|ps|psa|matthew|mt|matt|mat|obadiah|ob|oba|obad|obd|odbh|philemon|pm|phile|phile|philm|phm|phlm|pm|nehemiah|ne|neh|neh|ne|ezekiel|ek|ezek|eze|ezk|proverbs|pr|prov|prob|pro|1\s?samuel|1s|1\s?sam|1sam|1\s?sa|1sa|i\s?samuel|i\s?sam|i\s?sa|acts|ac|act|joshua|js|jos|jos|josh|james|jm|jam|jas|ja|haggai|ha|hag|hagg|hosea|ho|hos|hebrews|he|heb|hw|deuteronomy|dt|deut|deu|de|ruth|ru|rut|titus|ti|tit|tt|ts|lamentations|la|lam|lament|2\s?samuel|2s|2\s?sam|2sam|2\s?sa|2sa|ii\s?samuel|ii\s?sam|ii\s?sa|iis|2\s?timothy|2ti|2\s?tim|2\s?tim|2tim|2\s?ti|iiti|2ti|ii\s?timothy|ii\s?tim|ii\s?ti|2\s?corinthians|2co|2\s?cor|2cor|iico|2\s?co|2co|ii\s?corinthians|ii\s?cor|ii\s?co|song\s?of\s?songs|so|sos|sng|song|song\s?of\s?solomon|sos|songofsongs|songofsolomon|canticle\s?of\s?canticles|luke|lk|luk|lu|daniel|da|dan|dl|dnl|1\s?corinthians|1co|1\s?cor|1cor|ico|1\s?co|1co|i\s?corinthians|i\s?cor|i\s?co|jonah|jh|jon|jnh|galatians|ga|gal|gltns|job|jb|job|2\s?chronicles|2ch|2\s?chr|2\s?chr|2chr|2\s?ch|iich|ii\s?chronicles|ii\s?chr|ii\s?ch|3\s?john|3j|3\s?jn|3\s?jn|3jn|3\s?jo|iiijo|iii\s?john|iii\s?jo|iii\s?jn|leviticus|le|lev|1\s?peter|1p|1\s?pet|1pet|1pe|ipe|1p|i\s?peter|i\s?pet|i\s?pe|1\s?kings|1k|1\s?kgs|1kgs|1\s?kin|1kin|1\s?ki|ik|1ki|i\s?kings|i\s?kin|i\s?ki|2\s?thessalonians|2th|2\s?thess|2\s?thess|2thess|iith|2\s?thes|2thes|2\s?the|2the|2\s?th|2th|ii\s?thessalonians|ii\s?thess|ii\s?the|ii\s?th|genesis|ge|gen|exodus|ex|exo|colossians|co|col|colo|cln|clns|1\s?john|1j|1\s?jn|1jn|1\s?jo|ijo|i\s?john|i\s?jo|i\s?jn|revelation|re|rev|rvltn|joel|jl|joel|joe|jol|philippians|pp|phi|phil|phi|php|judges|jg|judg|jdg|jdgs|1\s?timothy|1ti|1\s?tim|1tim|1\s?ti|iti|1ti|i\s?timothy|i\s?tim|i\s?ti|jude|jude|jude|2\s?john|2j|2\s?jn|2jn|2\s?jo|iijo|ii\s?john|ii\s?jo|ii\s?jn|micah|mi|mic|habakkuk|hb|hab|hk|habk|john|jn|joh|jo|ephesians|ep|eph|ephn|amos|am|amos|amo|isaiah|is|isa|mark|mk|mar|mrk|ecclesiastes|ec|ecc|qohelet|nahum|na|nah|nah|na|ezra|ezr|romans|ro|rom|rmn|rmns|2\s?kings|2k|2\s?kgs|2kgs|2\s?kin|2kin|2\s?ki|iik|2ki|ii\s?kings|ii\s?kin|ii\s?ki|2\s?peter|2p|2\s?pet|2pet|2pe|iip|ii\s?peter|ii\s?pet|ii\s?pe|esther|es|est|esth|malachi|ml|mal|mlc|numbers|nu|num|zechariah|zc|zech|zec|1\s?thessalonians|1th|1\s?thess|1thess|ith|1\s?thes|1thes|1\s?the|1the|1\s?th|1th|i\s?thessalonians|i\s?thess|i\s?the|i\s?th|1\s?chronicles|1ch|1\s?chr|1chr|1\s?ch|ich|i\s?chronicles|i\s?chr|i\s?ch|zephaniah|zp|zep|zeph)$/i;
        let m;
        if ((m = re.exec(book)) !== null) {
            if (m.index === re.lastIndex) {
                re.lastIndex++;
            }
            return m.length > 1;
        }
        return false;
    };

    /**
     * Parse out parts of a scripture string and return an object with the appropriate info
     * e.g John 3:16 => {book: 'John', chapter:3, verses:['16']
     * @param text
     * @returns {{book: string, chapter: number, verses: Array}}
     */
    parseScripture(text) {
        let re = /^(jeremiah|je|jer|psalm|psalms|ps|psa|matthew|mt|matt|mat|obadiah|ob|oba|obad|obd|odbh|philemon|pm|phile|phile|philm|phm|phlm|pm|nehemiah|ne|neh|neh|ne|ezekiel|ek|ezek|eze|ezk|proverbs|pr|prov|prob|pro|1\s?samuel|1s|1\s?sam|1sam|1\s?sa|1sa|i\s?samuel|i\s?sam|i\s?sa|acts|ac|act|joshua|js|jos|jos|josh|james|jm|jam|jas|ja|haggai|ha|hag|hagg|hosea|ho|hos|hebrews|he|heb|hw|deuteronomy|dt|deut|deu|de|ruth|ru|rut|titus|ti|tit|tt|ts|lamentations|la|lam|lament|2\s?samuel|2s|2\s?sam|2sam|2\s?sa|2sa|ii\s?samuel|ii\s?sam|ii\s?sa|iis|2\s?timothy|2ti|2\s?tim|2\s?tim|2tim|2\s?ti|iiti|2ti|ii\s?timothy|ii\s?tim|ii\s?ti|2\s?corinthians|2co|2\s?cor|2cor|iico|2\s?co|2co|ii\s?corinthians|ii\s?cor|ii\s?co|song\s?of\s?songs|so|sos|sng|song|song\s?of\s?solomon|sos|songofsongs|songofsolomon|canticle\s?of\s?canticles|luke|lk|luk|lu|daniel|da|dan|dl|dnl|1\s?corinthians|1co|1\s?cor|1cor|ico|1\s?co|1co|i\s?corinthians|i\s?cor|i\s?co|jonah|jh|jon|jnh|galatians|ga|gal|gltns|job|jb|job|2\s?chronicles|2ch|2\s?chr|2\s?chr|2chr|2\s?ch|iich|ii\s?chronicles|ii\s?chr|ii\s?ch|3\s?john|3j|3\s?jn|3\s?jn|3jn|3\s?jo|iiijo|iii\s?john|iii\s?jo|iii\s?jn|leviticus|le|lev|1\s?peter|1p|1\s?pet|1pet|1pe|ipe|1p|i\s?peter|i\s?pet|i\s?pe|1\s?kings|1k|1\s?kgs|1kgs|1\s?kin|1kin|1\s?ki|ik|1ki|i\s?kings|i\s?kin|i\s?ki|2\s?thessalonians|2th|2\s?thess|2\s?thess|2thess|iith|2\s?thes|2thes|2\s?the|2the|2\s?th|2th|ii\s?thessalonians|ii\s?thess|ii\s?the|ii\s?th|genesis|ge|gen|exodus|ex|exo|colossians|co|col|colo|cln|clns|1\s?john|1j|1\s?jn|1jn|1\s?jo|ijo|i\s?john|i\s?jo|i\s?jn|revelation|re|rev|rvltn|joel|jl|joel|joe|jol|philippians|pp|phi|phil|phi|php|judges|jg|judg|jdg|jdgs|1\s?timothy|1ti|1\s?tim|1tim|1\s?ti|iti|1ti|i\s?timothy|i\s?tim|i\s?ti|jude|jude|jude|2\s?john|2j|2\s?jn|2jn|2\s?jo|iijo|ii\s?john|ii\s?jo|ii\s?jn|micah|mi|mic|habakkuk|hb|hab|hk|habk|john|jn|joh|jo|ephesians|ep|eph|ephn|amos|am|amos|amo|isaiah|is|isa|mark|mk|mar|mrk|ecclesiastes|ec|ecc|qohelet|nahum|na|nah|nah|na|ezra|ezr|romans|ro|rom|rmn|rmns|2\s?kings|2k|2\s?kgs|2kgs|2\s?kin|2kin|2\s?ki|iik|2ki|ii\s?kings|ii\s?kin|ii\s?ki|2\s?peter|2p|2\s?pet|2pet|2pe|iip|ii\s?peter|ii\s?pet|ii\s?pe|esther|es|est|esth|malachi|ml|mal|mlc|numbers|nu|num|zechariah|zc|zech|zec|1\s?thessalonians|1th|1\s?thess|1thess|ith|1\s?thes|1thes|1\s?the|1the|1\s?th|1th|i\s?thessalonians|i\s?thess|i\s?the|i\s?th|1\s?chronicles|1ch|1\s?chr|1chr|1\s?ch|ich|i\s?chronicles|i\s?chr|i\s?ch|zephaniah|zp|zep|zeph)\.?\s?(\d+):?((?=\d+),?\d+\-\d+|\d+)?/gi;
        let m;
        while ((m = re.exec(text)) !== null) {
            if (m.index === re.lastIndex) {
                re.lastIndex++;
            }
            let scripture = {
                book: m[1],
                chapter: m[2],
                translation: 'kjv',
                verses: []
            };

            if (text.indexOf(',') >= 0) {
                re = /:(.*)/gi;
                while ((m = re.exec(text)) !== null) {
                    if (m.index === re.lastIndex) {
                        re.lastIndex++;
                    }
                    let items = m[0].split();
                    re = /(\d+\-\d+)|(\d+).*/;
                    for (let i = 0; i < items.length; i++) {
                        if ((m = re.exec(items[i])) !== null) {
                            if (m.index === re.lastIndex) {
                                re.lastIndex++;
                            }
                            if (m[1]) {
                                scripture.verses.push(m[1]);
                            } else if (m[2]) {
                                scripture.verses.push(m[2]);
                            }
                        }
                    }
                }
            } else if (m[3]) {
                scripture.verses.push(m[3]);
            }
            //extract the translation
            let translation_regex = /(amp|asv|ceb|cevdcus06|cpdv|erv|esv|gnb|gnt|gntd|icb|kjv|kjva|kjva|mev|msg|nabre|nasb|ncv|net|nirv|niv|nkjv|nlt|web|webbe|wmb|wmbbe)/i;
            if ((m = translation_regex.exec(text)) !== null) {
                if (m.index === translation_regex.lastIndex) {
                    translation_regex.lastIndex++;
                }
                if (m.length > 1) {
                    scripture.translation = m[1];
                }
            }
            let book = this.findBook(scripture.book);
            return scripture;
        }
        return {}
    };

    addChurch(data) {
        return this.http_.post('/api/church', data);
    };

    getChurches() {
        return this.http_.get('/api/churches');
    };

    scriptureToText(scripture) {
        let tmp = scripture.book + ' ' + scripture.chapter;
        if (!_.isEmpty(scripture.verses)) {
            tmp += ':' + scripture.verses.join(',');
        }
        tmp += '(' + scripture.translation + ')';
        return tmp;
    };

    getSermon(id) {
        return this.http_.get('/api/sermon/' + id);
    };

    getSermonComments(sermonId) {
        return this.http_.get('/api/sermon/' + sermonId + '/comments', { ignoreLoadingBar: true });
    };

    getComments(refKey, kind) {
        return this.http_.get('/api/comment/' + refKey + '?k=' + kind, { ignoreLoadingBar: true });
    };

    getPastorSermons(pastorId, cursor) {
        if (_.isEmpty(cursor)) {
            return this.http_.get('/api/sermon?pastor_id=' + pastorId);
        } else {
            var params = {
                pastor_id: pastorId,
                cursor: cursor
            };
            return this.http_.get('/api/sermon?' + $.param(params));
        }
    };

    getChurchSermons(churchId, cursor) {
        if (_.isEmpty(cursor)) {
            return this.http_.get('/api/sermon?church_id=' + churchId);
        } else {
            var params = {
                church_id: churchId,
                cursor: cursor
            };
            return this.http_.get('/api/sermon?' + $.param(params));
        }
    };

    getPassage(scripture) {
        if (isString(scripture)) {
            scripture = this.parseScripture(scripture);
        }
        //console.log(scripture);
        scripture.translation = scripture.translation ? scripture.translation : 'kjv';
        let param = helper.toQueryString(scripture);
        return this.http_.get('/api/bible?' + param).then(function(resp) {
            return resp;
        }, function(error) {
            swal({
                title: "<strong>Something isn't right!</strong>",
                text: "We are unable to find your bible reference, please ensure you typed the passage correctly.",
                type: "info",
                html: true,
                confirmButtonText: 'Open the  bible!'
            }, function() {
                this.state_.go('base.bible');
            });
        });
    };

    /**
     * Get scripture
     * @param passage
     * @param version
     * @returns {HttpPromise}
     */
    get(passage, version) {
        version = version ? version : 'kjv';
        return this.http_.jsonp(BASE_URL + 'callback=JSON_CALLBACK&passage=' + passage + '&v=' + version);
    };

    versions() {
        return this.http_.get('/api/bible/versions', { cache: true });
    };

    saveSermon(sermon) {
        return this.http_.post('/api/sermon', sermon);
    };

    publishSermon(sermon) {
        return this.http_.post('/api/sermon/publish', sermon);
    };

    logSermonView(sermonId) {
        return this.http_.post('/api/sermon/' + sermonId + '/log', sermon, { ignoreLoadingBar: true });
    };

    findSermon(query) {
        return this.http_.get('/api/sermon/find?query=' + encodeURIComponent(query), {
            cache: true,
            ignoreLoadingBar: true
        });
    };

    findChurch(query) {
        return this.http_.get('/api/church/search?query=' + encodeURIComponent(query), {
            cache: true,
            ignoreLoadingBar: true
        });
    };

    suggestChurch(value) {
        if (value && value.length > 2) {
            let deferred = this.q_.defer();
            this.findChurch(value).then(function(resp) {
                deferred.resolve(resp.data);
            });
            return deferred.promise;
        }
        return [];
    };

    changeTranslation(scripture, translation) {
        scripture = angular.copy(scripture);
        scripture.translation = translation.toLowerCase();
        return this.getPassage(scripture);
    };

    /**
     * Display scripture in a modal popup
     * @param {String} scripture
     */
    showScriptureModal(scripture) {
        return this.modal_.open({
            templateUrl: 'module/component/scripture/scripture-modal.html',
            size: 'lg',
            controller: ['$uibModalInstance', function($uibModalInstance) {
                this.close = () => $uibModalInstance.close();
                this.scripture = scripture;
            }],
            controllerAs: 'modalCtrl'
        });
    };

    formatScripturesInText(text) {
        const re = /(jeremiah|je|jer|psalm|psalms|ps|psa|matthew|mt|matt|mat|obadiah|ob|oba|obad|obd|odbh|philemon|pm|phile|phile|philm|phm|phlm|pm|nehemiah|ne|neh|neh|ne|ezekiel|ek|ezek|eze|ezk|proverbs|pr|prov|prob|pro|1\s?samuel|1s|1\s?sam|1sam|1\s?sa|1sa|i\s?samuel|i\s?sam|i\s?sa|acts|ac|act|joshua|js|jos|jos|josh|james|jm|jam|jas|ja|haggai|ha|hag|hagg|hosea|ho|hos|hebrews|he|heb|hw|deuteronomy|dt|deut|deu|de|ruth|ru|rut|titus|ti|tit|tt|ts|lamentations|la|lam|lament|2\s?samuel|2s|2\s?sam|2sam|2\s?sa|2sa|ii\s?samuel|ii\s?sam|ii\s?sa|iis|2\s?timothy|2ti|2\s?tim|2\s?tim|2tim|2\s?ti|iiti|2ti|ii\s?timothy|ii\s?tim|ii\s?ti|2\s?corinthians|2co|2\s?cor|2cor|iico|2\s?co|2co|ii\s?corinthians|ii\s?cor|ii\s?co|song\s?of\s?songs|so|sos|sng|song|song\s?of\s?solomon|sos|songofsongs|songofsolomon|canticle\s?of\s?canticles|luke|lk|luk|lu|daniel|da|dan|dl|dnl|1\s?corinthians|1co|1\s?cor|1cor|ico|1\s?co|1co|i\s?corinthians|i\s?cor|i\s?co|jonah|jh|jon|jnh|galatians|ga|gal|gltns|job|jb|job|2\s?chronicles|2ch|2\s?chr|2\s?chr|2chr|2\s?ch|iich|ii\s?chronicles|ii\s?chr|ii\s?ch|3\s?john|3j|3\s?jn|3\s?jn|3jn|3\s?jo|iiijo|iii\s?john|iii\s?jo|iii\s?jn|leviticus|le|lev|1\s?peter|1p|1\s?pet|1pet|1pe|ipe|1p|i\s?peter|i\s?pet|i\s?pe|1\s?kings|1k|1\s?kgs|1kgs|1\s?kin|1kin|1\s?ki|ik|1ki|i\s?kings|i\s?kin|i\s?ki|2\s?thessalonians|2th|2\s?thess|2\s?thess|2thess|iith|2\s?thes|2thes|2\s?the|2the|2\s?th|2th|ii\s?thessalonians|ii\s?thess|ii\s?the|ii\s?th|genesis|ge|gen|exodus|ex|exo|colossians|co|col|colo|cln|clns|1\s?john|1j|1\s?jn|1jn|1\s?jo|ijo|i\s?john|i\s?jo|i\s?jn|revelation|re|rev|rvltn|joel|jl|joel|joe|jol|philippians|pp|phi|phil|phi|php|judges|jg|judg|jdg|jdgs|1\s?timothy|1ti|1\s?tim|1tim|1\s?ti|iti|1ti|i\s?timothy|i\s?tim|i\s?ti|jude|jude|jude|2\s?john|2j|2\s?jn|2jn|2\s?jo|iijo|ii\s?john|ii\s?jo|ii\s?jn|micah|mi|mic|habakkuk|hb|hab|hk|habk|john|jn|joh|jo|ephesians|ep|eph|ephn|amos|am|amos|amo|isaiah|is|isa|mark|mk|mar|mrk|ecclesiastes|ec|ecc|qohelet|nahum|na|nah|nah|na|ezra|ezr|romans|ro|rom|rmn|rmns|2\s?kings|2k|2\s?kgs|2kgs|2\s?kin|2kin|2\s?ki|iik|2ki|ii\s?kings|ii\s?kin|ii\s?ki|2\s?peter|2p|2\s?pet|2pet|2pe|iip|ii\s?peter|ii\s?pet|ii\s?pe|esther|es|est|esth|malachi|ml|mal|mlc|numbers|nu|num|zechariah|zc|zech|zec|1\s?thessalonians|1th|1\s?thess|1thess|ith|1\s?thes|1thes|1\s?the|1the|1\s?th|1th|i\s?thessalonians|i\s?thess|i\s?the|i\s?th|1\s?chronicles|1ch|1\s?chr|1chr|1\s?ch|ich|i\s?chronicles|i\s?chr|i\s?ch|zephaniah|zp|zep|zeph)\.?\s?\d+:?(\d+\-\d+|\d+)\s?\(?(amp|asv|ceb|cevdcus06|cpdv|erv|esv|gnb|gnt|gntd|icb|kjv|kjva|kjva|mev|msg|nabre|nasb|ncv|net|nirv|niv|nkjv|nlt|web|webbe|wmb|wmbbe)?\)?/gi;
        return text.replace(re, function(match) {
            console.log(match);
            return '<span class="scripture-highlight" show-scripture-on-click="" scripture="\'' + match + '\'">' + match + '</span>';
        });
    };

    /**
     * Find book in the bible
     * @param {String} str
     */
    findBook(str) {
        str = str.toLowerCase();
        return books.ALL.find(book => {
            return book.human.toLowerCase() == str || book.usfm.toLowerCase() == str;
        });
    };
}