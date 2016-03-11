(function () {

    var NoteService = function ($interval, $timeout, userService, alertService) {
        this.interval_ = $interval;
        this.userService = userService;
        this.alertService = alertService;
        this.timeout_ = $timeout;
        this.lastSaved = 0;
    };

    /**
     * Setup watch for a note object and auto save every 5 secs when the note is updated
     * @param $scope
     * @param note
     * @param validate
     */
    NoteService.prototype.startSaving = function ($scope, note, validate) {
        var self = this;
        self.note = note;
        self.validate = validate;
        $scope.$watch(function () {
                if (self.note) {
                    return self.note.notes;
                }
            },
            function (n, o) {
                if (n != o) {
                    self.lastUpdated = moment().unix();
                    console.log('updated: ' + self.lastUpdated);
                }
            });
        self.saveOnIntervals();
    };

    /**
     * Save note on server.
     * @param note
     * @param callback
     */
    NoteService.prototype.saveNote = function (note, callback) {
        var self = this;
        note.saving = true;
        self.userService.saveNote(note).then(function (resp) {
            self.timeout_(function () {
                note.saving = false;
            }, 1000);

            var data = resp.data;
            if (data.id) {
                self.lastSaved = moment().unix();
                note.id = data.id;
                note.modified_at = data.modified_at;
                if (_.isFunction(callback)) {
                    callback();
                }
            } else {
                self.alertService.danger('<strong>Sorry!</strong> something went wrong trying to save your note.');
            }
        }, function () {
            self.alertService.danger('<strong>Sorry!</strong> something went wrong trying to save your note.');
        });
    };

    /**
     * Save note every 5 secs, if note was updated.
     */
    NoteService.prototype.saveOnIntervals = function () {
        var self = this;
        self.interval_(function () {
                if (self.lastUpdated > self.lastSaved) {
                    var save = true;
                    if (_.isFunction(self.validate)) {
                        save = self.validate(self.note);
                    }
                    if (save) {
                        self.saveNote(self.note);
                    }
                } else {
                    console.log('no changes mads since last save');
                }
            },
            5000);
    };
    App.service('noteService', NoteService);
})();