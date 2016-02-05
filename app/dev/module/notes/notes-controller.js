/**
 * Created by eanjorin on 2/4/16.
 */
(function () {

    var NotesCtrl = function (userService, bibleService, $state, note, $q, $scope, alertService) {
        var self = this;
        self.userService = userService;
        self.bibleService = bibleService;
        self.alertService = alertService;
        self.q_ = $q;
        self.note = note;


        if ($state.current.name == 'base.notes') {
            self.page = 1;
            self.getNotes();
        }
        if ($state.current.name == 'base.new-note') {
            $scope.$watch('notesCtrl.note.notes', function (n) {
                self.saveNote();
            })
        }
    };

    NotesCtrl.prototype.saveNote = function () {
        var self = this;
        if (_.isEmpty(self.note.notes)) return;

        if (_.isEmpty(self.note.title)) {
            self.missingTitle = true;
            self.alertService.danger('Please enter a sermon title before typing.' +
                ' <strong>Your notes are not saved!</strong>');
            return;
        } else {
            self.missingTitle = false;
        }
        self.note.saving = true;
        self.userService.saveNote(self.note).then(function (resp) {
            self.note.saving = false;
            if (resp.data.id) {
                self.note.id = resp.data.id;
                scope.note.modified_at = resp.data.modified_at;
            }
        });
    };
    NotesCtrl.prototype.sermonSelect = function (sermon, model) {
        var self = this;
        self.note.sermon = sermon;
        self.note.title = sermon.title;
        self.note.pastor = sermon.pastor.title + ' ' + sermon.pastor.first_name + ' ' + sermon.pastor.last_name;
        self.note.church = sermon.church.name;
    };
    NotesCtrl.prototype.pastorSelect = function (pastor) {
        var self = this;
        self.note.pastor_id = pastor.id;
    };
    NotesCtrl.prototype.churchSelect = function (church) {
        var self = this;
        self.note.church_id = church.id;
    };

    NotesCtrl.prototype.findChurch = function (value) {
        if (value && value.length > 2) {
            var self = this;
            var deferred = self.q_.defer();
            self.bibleService.findChurch(value).then(function (resp) {
                deferred.resolve(resp.data);
            });
            return deferred.promise;
        }
        return [];
    };
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
                console.log(resp.data);
            });
            return deferred.promise;
        }
        return [];

    };
    NotesCtrl.prototype.getNotes = function () {
        var self = this;
        self.promise = self.userService.getNotes();
        self.promise.then(function (resp) {
            self.notes = resp.data;
            self.notes.page = self.page;
            console.log(self.notes);
        })
    };

    NotesCtrl.prototype.openNote = function (note) {
        console.log(note);
    };

    App.controller('notesController', NotesCtrl);
})();