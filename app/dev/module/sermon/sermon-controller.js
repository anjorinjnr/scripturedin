/**
 * Created by eanjorin on 12/14/15.
 */

App.controller('sermonController', function ($state, authService, userService, bibleService,
                                             alertService, util, sermons, $scope,
                                             sermon, $stateParams, $uibModal) {
        var self = this;

        self.scriptureSelect = function (e) {

        };


        /**
         * Set up watcher for sermon note and save to sever on update
         */
        self._watchSermonNoteForUpdate = function () {
            self.savingNote = false;
            $scope.$watch('sermonCtrl.sermonNote.notes', function (n, o) {
                if (o != n) {
                    self.savingNote = true;
                    userService.saveSermonNote(self.sermonNote).then(function (resp) {
                        self.savingNote = false;
                        if (resp.data.id) {
                            self.sermonNote.id = resp.data.id;
                            self.sermonNote.user_id = resp.data.created_by;
                            self.sermonNote.sermon_id = resp.data.sermon_key;
                            self.sermonNote.modified_at = resp.data.modified_at;
                        }
                        //console.log(self.sermonNote);
                    });
                }
            });
        };
        /**
         * get user's note for the sermon
         * setup watcher to save user note
         */
        self.getUserSermonNote = function () {

            var init = true;
            self.loadNote = true;
            userService.getSermonNote(self.user.id, self.sermon.id).then(function (resp) {
                resp = resp.data;
                self.loadNote = false;
                if (!_.isEmpty(resp)) {
                    self.sermonNote = resp;
                    self.sermonNote.user_key = self.sermonNote.created_by;
                }
                self._watchSermonNoteForUpdate(true)

            });
        };

        /**
         * Function gets called when a new scripture is added. The scripture text is parsed and null is returned
         * if the text isn't a valid scripture to avoid adding it.
         * @param chip
         * @returns {null}
         */
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
                //convert date object1s to utc millisecs
                self.sermon.date = self.sermon._dates.map(function (d) {
                    return util.toUtcMilliseconds(d.date);
                });
                return true;
            }
            return false;
        };


        /**
         * Get comments for the current sermon
         */
        self.getSermonComments = function () {
            self.laodingComments = true;
            bibleService.getComments(self.sermon.id, 'Sermon').then(function (resp) {
                self.laodingComments = false;
                self.sermonComments = resp.data;
                console.log(self.sermonComments);
            });
        };


        self.postReply = function (c) {
            var data = {
                comment: c.reply,
                reply_to: c.id
            };
            userService.postComment(data, self.sermon.id, 'Sermon').then(function (resp) {
                    console.log(resp.data);
                    if (resp.data.id) {
                        c.replies.comments.unshift(resp.data);
                        c.reply = '';
                    } else {
                        alertService.danger('Failed to post comment, please try again');
                    }
                }
            )

        };

        /**
         * Post sermon comment
         */
        self.postComment = function () {
            if (!_.isEmpty(self.sermonComment.comment)) {
                userService.postComment(self.sermonComment, self.sermon.id, 'Sermon').then(function (resp) {
                        console.log(resp.data);
                        if (resp.data.id) {
                            self.sermonComments.comments.unshift(resp.data);
                            self.sermonComment.comment = '';
                        } else {
                            alertService.danger('Failed to post comment, please try again');
                        }
                    }
                )
            }

        };
        /**
         * Save sermon
         */
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
            var colors = [
                'bgm-teal',
                'bgm-red',
                'bgm-pink',
                'bgm-blue',
                'bgm-lime',
                'bgm-green',
                'bgm-cyan',
                'bgm-orange',
                'bgm-purple',
                'bgm-gray',
                'bgm-black'
            ];

            //console.log(self.sermon);
            if (self._validateSermon()) {
                self.sermon.cal_color = _.sample(colors);
                bibleService.publishSermon(self.sermon).then(function (resp) {
                    resp = resp.data;
                    if (resp.id) {

                        swal({
                            title: resp.title + ' has been published.',
                            text: 'Do you want to create another sermon?',
                            type: 'success',
                            showCancelButton: true,
                            cancelButtonText: 'Yes!',
                            confirmButtonColor: '#DD6B55',
                            confirmButtonText: 'No, go to calender!',
                            closeOnConfirm: true,
                        }, function (goToCalendar) {
                            if (!goToCalendar) {
                                self.submitted = false;
                                self.sermon = {
                                    scriptures: [],
                                    _dates: [{'date': self.date_}],
                                    title: '',
                                    notes: [{content: ''}],
                                    questions: [{content: ''}]
                                };
                            } else {
                                $state.go('base.sermon-browse')
                            }
                        });

                    } else if (resp.status == 'error') {
                        alertService.danger(resp.message.join('<br>'));
                    }

                });

            }
        };


        self.addDate = function () {
            var d = angular.copy(self.date_);
            d.setHours(0);
            d.setMinutes(0);
            self.sermon._dates.push({date: d});
        };

        self.user = authService.user;
        self.errors = {};

        if ($state.current.name == 'base.sermon-browse') {
            self.sermons = sermons;

            //Create and add Action button with dropdown in Calendar header.
            self.month = 'month';

            self.actionMenu = '<ul class="actions actions-alt" id="fc-actions">' +
                '<li class="dropdown" dropdown>' +
                '<a href="" dropdown-toggle><i class="zmdi zmdi-more-vert"></i></a>' +
                '<ul class="dropdown-menu dropdown-menu-right">' +
                '<li class="active">' +
                '<a data-calendar-view="month" href="">Month View</a>' +
                '</li>' +
                '<li>' +
                '<a data-calendar-view="basicWeek" href="">Week View</a>' +
                '</li>' +
                '<li>' +
                '<a data-calendar-view="agendaWeek" href="">Agenda Week View</a>' +
                '</li>' +
                '<li>' +
                '<a data-calendar-view="basicDay" href="">Day View</a>' +
                '</li>' +
                '<li>' +
                '<a data-calendar-view="agendaDay" href="">Agenda Day View</a>' +
                '</li>' +
                '</ul>' +
                '</div>' +
                '</li>';

            self.onEventSelect = function (calEvent, jsEvent, view) {
                $state.go('base.sermon-study', {id: calEvent.id});
            };

            //Open new event modal on selecting a day
            self.onSelect = function (start, end) {
                if (!self.user.is_pastor) return;
                $state.go('base.sermon-create', {date: moment(end).unix()});
            };
        }

        //console.log($stateParams);
        self.date_ = $stateParams.date ? moment.unix($stateParams.date).toDate() : new Date();
        self.date_.setHours(0);
        self.date_.setMinutes(0);

        self.sermon = (!_.isEmpty(sermon)) ? sermon : {
            scriptures: [],
            _dates: [{'date': self.date_}],
            title: '',
            notes: [{content: ''}],
            questions: [{content: ''}]
        };

        if ($state.current.name == 'base.sermon-study') {
            self.sermonComments = [];
            self.sermonComment = {
                user_key: self.user.id,
                comment: ''
            };
            $state.current.data.pageTitle = self.sermon.title;
            self.sermon.scriptures = [];
            self.sermon.scripture.forEach(function (s) {
                self.sermon.scriptures.push(bibleService.scriptureToText(s));
            });
            self.sermonNote = {
                user_key: self.user.id,
                sermon_key: self.sermon.id,
                notes: ''
            };

            self.getUserSermonNote();
            self.getSermonComments();

        }
        //console.log(self.sermon);


    }
);