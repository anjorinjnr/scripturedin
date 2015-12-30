/**
 * Created by eanjorin on 12/14/15.
 */

App.controller('sermonController', function (bibleService, alertService, util) {
    var self = this;

    self.sermon = {
        scriptures: [],
        _dates: [{'date': new Date()}],
        title: '',
        notes: [
            {
                content: ''
            }
        ],
        questions: [
            {
                content: ''
            }
        ]
    };
    self.errors = {};

    self.scriptureSelect = function (e) {
        console.log(arguments)
    };

    self.onScriptureAdd = function (chip) {
        if (_.isEmpty((bibleService.parseScripture(chip)))) {
            return null;
        }
    };

    self._validateSermon = function () {
        if (!_.isEmpty(self.sermon.title) && self.sermon.scriptures.length > 0
            && !_.isEmpty(self.sermon.notes[0].content)) {
            //create scripture objects
            self.sermon.scripture = self.sermon.scriptures.map(function (s) {
                return bibleService.parseScripture(s);
            });
            //convert date object1s to string repr
            self.sermon.date = self.sermon._dates.map(function (d) {
                return moment(d.date).format('YYYY/MM/DD');
            });
            return true;
        }
        return false;
    };
    self.save = function () {

        self.submitted = true;
        if (self._validateSermon()) {
            bibleService.saveSermon(self.sermon).then(function (resp) {
                resp = resp.data;
                if (resp.id) {
                    alertService.info('Sermon saved');
                    //map scripture object to string
                    resp.scriptures = resp.scripture.map(function (s) {
                        var tmp = s.book + ' ' + s.chapter;
                        if (!_.isEmpty(s.verses)) {
                            tmp += ':' + s.verses.join(',');
                        }
                        return tmp;
                    });
                    //map the date ms to date objects
                    resp._dates = resp.date.map(function (d) {
                        return {date: util.toLocalDate(d)};
                    });
                    if (_.isEmpty(resp.questions)) {
                        resp.questions = [{content: ''}];
                    }
                    self.sermon = resp;
                    util.log(self.sermon);

                } else if (resp.status == 'error') {
                    alertService.danger(resp.message.join('<br>'));
                }

            });
        } else {
            console.log('failed')
        }
    };
    /**
     * Publish a sermon so it's available to users
     */
    self.publish = function () {
        self.submitted = true;
        //console.log(self.sermon);
        if (!_.isEmpty(self.sermon.title) && self.sermon.scriptures.length > 0
            && !_.isEmpty(self.sermon.notes[0].content)) {
            self.sermon.scripture = self.sermon.scriptures.map(function (s) {
                return bibleService.parseScripture(s);
            });
            console.log(self.sermon);

        }
    }
});