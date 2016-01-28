App.controller('readController', function ($location, bibleService,
                                           $mdDialog, userService) {

    var self = this;
    var query = $location.search();
    self.versions = bibleService.versions();

    $(document.body).bind('mouseup', function (e) {
        var selection;
        if (window.getSelection) {
            selection = window.getSelection();
        } else if (document.selection) {
            selection = document.selection.createRange();
        }
        var selected = selection.toString();
        if (!_.isEmpty(selected)) {
            console.log(e);
            console.log(selection.anchorNode.parentNode.id);
            console.log(selected);
            console.log(selected.split(/v\d+:/));
        }

    });
    $('.verse').select(function () {
        console.log(arguments);
    });
    if (query.p) {
        bibleService.get(query.p).then(function (resp) {
            self.bible = resp.data;
            //console.log(scrip);
            switch (self.bible.type) {
                case 'verse':
                    self.bible.data = _.groupBy(self.bible.book, function (b) {
                        return b.book_name + ' ' + b.chapter_nr;
                    });
                    console.log(self.bible);
            }
        });
    }

    self.selected = {};

    /**
     * Highlight or unhighlight selected row
     * @param verse
     * @param book
     */
    self.highlight = function (verse, book) {
        if (!(book in self.selected)) {
            self.selected[book] = {};
        }
        self.selected[book][verse] = !self.selected[book][verse];
    };

    self.askForComment = function (ev) {
        $mdDialog.show({
            controller: function ($scope, $mdDialog) {
                var self = this;
                self.$scope = $scope;
                self.request = {};
                self.request.tags = [];
                self.request.invites = [
                    {
                        'type': 'email'
                    }
                ];
                self.newInvite = function () {
                    self.request.invites.push({
                        'type': 'email'
                    });
                };
                self.removeInvite = function (i) {
                    self.request.invites.splice(i, 1);
                };
                self.submitForm = function () {
                    console.log($('#reqForm'));
                    console.log(self.request);
                   // $scope.$emit('submitRequestEvent');

                };

            },
            controllerAs: 'reqCtrl',
            templateUrl: '/module/read/ask-comment.modal.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true
        });
    }
});