(function () {

    var NotesCtrl = function (userService, bibleService, $scope,
                              $state, note, $q, $scope, noteService,
                              alertService, APP_CONSTANTS) {
        var self = this;
        self.userService = userService;
        self.bibleService = bibleService;
        self.alertService = alertService;
        self.q_ = $q;
        self.note = note;
        self.scope_ = $scope;
        self.noteService = noteService;
        self.APP_CONSTANTS = APP_CONSTANTS;
        self.userConfig = userService.getConfig();
        console.log(note);


        if ($state.current.name == 'base.notes') {
            self.page = 1;
            self.getNotes();
        }

        if (angular.isObject(self.note.pastor)) {
            self.pastorIsUser = true;
        }
        if ($state.current.name === 'base.note.edit') {
            if (angular.isObject(self.note.pastor)) {
                self.note.pastor.full_name = [self.note.pastor.title,
                    self.note.pastor.first_name, self.note.pastor.last_name].join(' ').trim();
            }
            self.startNoteAutosave();
        }

        if ($state.current.name == 'base.new-note') {
            self.note.scriptures = [];
            self.startNoteAutosave();
            /**
             * If user is creating note for the first time, we
             * show a tip so they know that notes are saved automatically
             */
            if (!self.userConfig[self.APP_CONSTANTS.TIP_NOTE_AUTO_SAVE]) {
                swal({
                    title: "<strong>Quick Tip!</strong>",
                    text: "Your notes are saved automatically as you type.",
                    type: "info",
                    html: true,
                    confirmButtonText: 'Got it!'
                }, function () {
                    self.userConfig[self.APP_CONSTANTS.TIP_NOTE_AUTO_SAVE] = true;
                    self.userService.saveConfig(self.userConfig);
                });
            }

        }
    };

    NotesCtrl.prototype.save = function () {
        var self = this;
        if (_.isEmpty(self.note)) {
            return;
        }
        if (_.isEmpty(self.note.title)) {
            self.missingTitle = true;
            return;
        } else {
            self.missingTitle = false;
        }
        self.noteService.saveNote(self.note, function () {
            self.alertService.info('Note saved.')
        });

    };


    /**
     * Save user's notes
     */
    NotesCtrl.prototype.startNoteAutosave = function () {
        var self = this;
        self.noteService.startSaving(self.scope_, self.note, function (note) {
            if (_.isEmpty(note.notes)) return false;
            if (_.isEmpty(note.title)) {
                console.log('no title');
                self.missingTitle = true;
                return false
            } else {
                self.missingTitle = false;
                return true;
            }
        });
    };

    /**
     * Called when user selects a sermon from the auto suggest, we set the sermon title, pastor and church.
     * @param sermon
     * @param model
     */
    NotesCtrl.prototype.sermonSelect = function (sermon, model) {
        var self = this;
        self.note.sermon = sermon;
        self.note.title = sermon.title;
        self.note.pastor = sermon.pastor.title + ' ' + sermon.pastor.first_name + ' ' + sermon.pastor.last_name;
        self.note.church = sermon.church.name;
    };

    /**
     * Called when the user selects a pastor from the auto suggest list, we set the pastor id.
     * @param pastor
     */
    NotesCtrl.prototype.pastorSelect = function (pastor) {
        var self = this;
        self.note.pastor_id = pastor.id;
        self.note.church_id = pastor.church.id;
        self.note.church = pastor.church.name;
    };

    /**
     * Called when the user selects a church from the auto suggest list, we set the church id
     * @param church
     */
    NotesCtrl.prototype.churchSelect = function (church) {
        var self = this;
        self.note.church_id = church.id;
    };

    /**
     * Called as user types to find suggested churches
     * @param value
     * @returns {*}
     */
    NotesCtrl.prototype.findChurch = function (value) {
        return this.bibleService.suggestChurch(value);
    };

    /**
     * Called as user types to find suggested pastors
     * @param value
     * @returns {*}
     */
    NotesCtrl.prototype.findPastor = function (value) {
        if (value && value.length > 2) {
            var self = this;
            var deferred = self.q_.defer();
            self.userService.findUser(value, 'pastor').then(function (resp) {
                deferred.resolve(resp.data);
            });
            return deferred.promise;
        }
        return [];
    };

    /**
     * Called as user types to find suggested sermons
     * @param value
     * @returns {*}
     */
    NotesCtrl.prototype.findSermon = function (value) {
        if (value && value.length > 2) {
            var self = this;
            var deferred = self.q_.defer();
            self.bibleService.findSermon(value).then(function (resp) {
                var res = resp.data;
                res = res.map(function (s) {
                    s.label = [s.title, '<br> by', s.pastor.title, s.pastor.first_name, s.pastor.last_name.substr(0, 1) + '.',
                        '<br>(' + s.church.name + ')'].join(' ');
                    return s;
                });
                deferred.resolve(resp.data);
            });
            return deferred.promise;
        }
        return [];

    };

    /**
     * Gets all saved notes for current user
     */
    NotesCtrl.prototype.getNotes = function () {
        var self = this;
        self.promise = self.userService.getNotes();
        self.promise.then(function (resp) {
            self.notes = resp.data;
            self.notes.page = self.page;
            //console.log(self.notes);
        })
    };

    /**
     * Called before accepting the scripture text entered by the user, we validate that the text is a valid
     * scripture that we can parse, otherwise the input is rejected
     * @param chip
     * @returns {null}
     */
    NotesCtrl.prototype.onScriptureAdd = function (chip) {
        console.log(chip);
        var self = this;
        if (_.isEmpty(self.bibleService.parseScripture(chip))) {
            return null;
        }
    };

    App.controller('notesController', NotesCtrl);
})();