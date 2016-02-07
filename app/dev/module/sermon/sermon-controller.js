(function () {

    var SermonController = function ($state, authService, userService, bibleService, alertService, util, $scope,
                                     sermon, $stateParams, $mdDialog, $uibModal) {
        var self = this;
        self.state_ = $state;
        self.scope_ = $scope;
        self.modal_ = $uibModal;
        self.dialog_ = $mdDialog;
        self.authService = authService;
        self.userService = userService;
        self.bibleService = bibleService;
        self.alertService = alertService;
        self.util = util;


        self.user = authService.user;

        //console.log(self.user);
        self.errors = {};
        self.noteStyle = 'point';
        self.privacy = [
            {
                key: 'Public',
                value: 'Everyone',
                info: 'Anyone on ScripturedIn'
            },
            {
                key: 'Members',
                value: 'Church Members',
                info: 'Only my church members'
            }
        ];

        if ($state.current.name == 'base.sermon-browse') {
            self.page = 1;
            self.church = self.user.church;
            self.getSermonByChurch();
            //Create and add Action button with dropdown in Calendar header.
            self.month = 'month';
            if (window.screen.width > 700) {
                self.layout = 'calendar';
                self.switchTo = 'Table';
            } else {
                self.layout = 'table';
                self.switchTo = 'Calendar';
            }

            self.actionMenu = '<ul class="actions actions-alt" id="fc-actions">' +
                '<li class="dropdown" dropdown>' +
                '<a href="" dropdown-toggle><i class="zmdi zmdi-more-vert"></i></a>' +
                '<ul class="dropdown-menu dropdown-menu-right">' +
                '<li class="active">' +
                '<a ng-click="sermonCtrl.switchView()" href="">Switch to Table View</a>' +
                '</li>' +
                '</ul>' +
                '</div>' +
                '</li>';

            self.onEventSelect = function (calEvent, jsEvent, view) {
                $state.go('base.sermon-view', {id: calEvent.id});
            };

            //Open new event modal on selecting a day
            self.onSelect = function (start, end) {
                if (!self.user.is_pastor) return;
                $state.go('base.sermon-create', {date: moment(end).unix()});
            };
        }

        self.date_ = $stateParams.date ? moment.unix($stateParams.date).toDate() : new Date();
        self.date_.setHours(0);
        self.date_.setMinutes(0);

        self.sermon = (!_.isEmpty(sermon)) ? sermon : {
            scriptures: [],
            _dates: [{'date': self.date_}],
            title: '',
            notes: [{content: ''}],
            questions: [{content: ''}],
            privacy: 'Public'
        };

        if ($state.current.name == 'base.sermon-view') {
            //list of comments
            self.sermonComments = [];
            //holder for new comment
            self.sermonComment = {
                user_key: self.user.id,
                comment: ''
            };
            $state.current.data.pageTitle = self.sermon.title;
            self.sermon.scriptures = [];
            self.sermon.scripture.forEach(function (s) {
                self.sermon.scriptures.push(self.bibleService.scriptureToText(s));
            });
            self.sermonNote = {
                user_key: self.user.id,
                sermon_key: self.sermon.id,
                notes: ''
            };

            self.getUserSermonNote();
            self.getSermonComments();
        }
    };

    SermonController.prototype.likeSermon = function () {
        this.userService.likeSermon(this.user, this.sermon);
    };
    SermonController.prototype.sermonsCallback_ = function (data) {
        var self = this;
        var sermons = [];
        data.sermons.forEach(function (sermon) {
            sermon.date.forEach(function (period) {
                var sermon_event = angular.copy(sermon);
                sermon_event.start = self.util.toLocalDate(period);
                sermon_event.className = (sermon.cal_color != null) ? sermon.cal_color : 'bgm-cyan';
                sermons.push(sermon_event);
            });
        });
        data.sermons = sermons;
        self.sermons = data;
        console.log(self.sermons);
    };
    SermonController.prototype.getSermonByPastor = function () {
        var self = this;
        if (_.isEmpty(self.pastor_key)) return;
        var cursor = null;
        if (self.sermons && self.sermons.next) {
            cursor = self.sermons.next;
        }
        self.promise = self.bibleService.getPastorSermons(self.pastor_key, cursor).then(function (resp) {
            self.sermonsCallback_(resp.data);
        });

    };
    SermonController.prototype.getSermonByChurch = function () {
        var self = this;
        self.church_key = (_.isEmpty(self.church_key)) ? self.user.church_key : self.church_key;

        if (self.church_key) {
            var cursor = null;
            if (self.sermons && self.sermons.next) {
                cursor = self.sermons.next;
            }
            self.promise = self.bibleService.getChurchSermons(self.church_key, cursor).then(function (resp) {
                self.sermonsCallback_(resp.data);
            });
        } else {
            //user needs to set church
        }
    };
    /**
     * Switch sermon view to table or calendar
     */
    SermonController.prototype.switchView = function (type) {
        var self = this;
        switch (type) {
            case 'calendar':
                self.layout = 'calendar';
                self.switchTo = 'Table';
                break;
            case 'table':
                self.layout = 'table';
                self.switchTo = 'Calendar';
                break;
            default:
                self.layout = (self.layout == 'calendar') ? 'table' : 'calendar';
                self.switchTo = (self.switchTo == 'Table') ? 'Calendar' : 'Table';
        }
    };


    /**
     * Save sermon
     */
    SermonController.prototype.save = function () {
        var self = this;
        self.submitted = true;
        if (self.validateSermon()) {
            self.self.bibleService.saveSermon(self.sermon).then(function (resp) {
                resp = resp.data;
                if (resp.id) {
                    self.alertService.info('Sermon saved');
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
                        return {date: self.util.toLocalDate(d)};
                    });
                    if (_.isEmpty(resp.questions)) {
                        resp.questions = [{content: ''}];
                    }
                    self.sermon = resp;
                    self.util.log(self.sermon);

                } else if (resp.status == 'error') {
                    self.alertService.danger(resp.message.join('<br>'));
                }

            });
        } else {
            self.alertService.info('Some required fields are missing');
        }
    };

    /**
     * Publish a sermon so it's available to users
     */
    SermonController.prototype.publish = function () {
        var self = this;
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
        if (self.validateSermon()) {
            self.sermon.cal_color = _.sample(colors);
            self.bibleService.publishSermon(self.sermon).then(function (resp) {
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
                        closeOnConfirm: true
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
                            self.state_.go('base.sermon-browse')
                        }
                    });

                } else if (resp.status == 'error') {
                    self.alertService.danger(resp.message.join('<br>'));
                }

            });

        }
    };


    SermonController.prototype.addDate = function () {
        var self = this;
        var d = angular.copy(self.date_);
        d.setHours(0);
        d.setMinutes(0);
        self.sermon._dates.push({date: d});
    };

    /**
     * Get comments for the current sermon
     */
    SermonController.prototype.getSermonComments = function () {
        var self = this;
        self.loadingComments = true;
        self.bibleService.getComments(self.sermon.id, 'Sermon').then(function (resp) {
            self.loadingComments = false;
            self.sermonComments = resp.data;
        });
    };


    /**
     * Post a reply to a comment
     * @param c
     */
    SermonController.prototype.postReply = function (c) {
        var self = this;
        var data = {
            comment: c.reply,
            reply_to: c.id
        };
        self.userService.postComment(data, self.sermon.id, 'Sermon').then(function (resp) {
                if (resp.data.id) {
                    c.replies.comments.unshift(resp.data);
                    c.reply = '';
                    c.replies_key.push(resp.data.id);
                    c.reply_count++;
                } else {
                    self.alertService.danger('Failed to post comment, please try again');
                }
            }
        )
    };

    /**
     * Post sermon comment
     */
    SermonController.prototype.postComment = function () {
        var self = this;
        if (!_.isEmpty(self.sermonComment.comment)) {
            self.userService.postComment(self.sermonComment, self.sermon.id, 'Sermon').then(function (resp) {
                    //console.log(resp.data);
                    if (resp.data.id) {
                        self.sermonComments.comments.unshift(resp.data);
                        self.sermonComment.comment = '';
                        self.sermon.comment_count++;
                    } else {
                        self.alertService.danger('Failed to post comment, please try again');
                    }
                }
            )
        }

    };

    /**
     * Function gets called when a new scripture is added. The scripture text is parsed and null is returned
     * if the text isn't a valid scripture to avoid adding it.
     * @param chip
     * @returns {null}
     */
    SermonController.prototype.onScriptureAdd = function (chip) {
        var self = this;
        if (_.isEmpty((self.bibleService.parseScripture(chip)))) {
            return null;
        }
    };

    SermonController.prototype.validateSermon = function () {
        var self = this;
        if (!_.isEmpty(self.sermon.title) && self.sermon.scriptures.length > 0) {

            if (_.isEmpty(self.sermon.note) && _.isEmpty(self.sermon.notes[0].content)) {
                self.selectedTab = 1;
                return false;
            }
            //create scripture objects
            self.sermon.scripture = self.sermon.scriptures.map(function (s) {
                return self.bibleService.parseScripture(s);
            });
            //convert date object1s to utc millisecs
            self.sermon.date = self.sermon._dates.map(function (d) {
                return self.util.toUtcMilliseconds(d.date);
            });
            return true;
        }
        return false;
    };

    /**
     * get user's note for the sermon
     * setup watcher to save user note
     */
    SermonController.prototype.getUserSermonNote = function () {
        var self = this;
        var init = true;
        self.loadNote = true;
        self.userService.getSermonNote(self.user.id, self.sermon.id).then(function (resp) {
            resp = resp.data;
            self.loadNote = false;
            if (!_.isEmpty(resp)) {
                self.sermonNote = resp;
                self.sermonNote.user_key = self.sermonNote.created_by;
            }
            self.watchSermonNoteForUpdate(true)

        });
    };

    /**
     * Set up watcher for sermon note and save to sever on update
     */
    SermonController.prototype.watchSermonNoteForUpdate = function () {
        var self = this;
        self.savingNote = false;
        self.scope_.$watch('sermonCtrl.sermonNote.notes', function (n, o) {
            if (o != n) {
                self.savingNote = true;
                self.userService.saveSermonNote(self.sermonNote).then(function (resp) {
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


    App.controller('sermonController', SermonController);

})
();

