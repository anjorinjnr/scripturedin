(function () {

    var ReadCtrl = function ($location, bibleService, $scope, $state, $stateParams, userService) {

        var self = this;
        self.location_ = $location;
        self.bibleService = bibleService;
        self.scope_ = $scope;
        self.userService = userService;
        self.books = bibleService.books.ALL;
        self.stateParams_ = $stateParams;
        self.state_ = $state;
        self.versions = bibleService.versions();

        if ($state.current.name == 'base.read') {
            //get the passage in the query params, validate and load scripture
            self.processParams();
            //listen to url change event
            $scope.$on('$locationChangeSuccess', function (e) {
                self.processParams();
            });
            self.selected = {};
        }
        if ($state.current.name == 'base.bible') {
            self.booksOt = bibleService.books.OT;
            self.booksNt = bibleService.books.NT;
            $scope.$watch('readCtrl.filter', function (v) {
                if (v) {
                    var match = _.filter(self.books, function (book) {
                        return book.human.toLowerCase().indexOf(v) >= 0;
                    });
                    var chunkSize = Math.max(10, Math.ceil(match.length / 3));
                    self.filtered = _.chunk(match, chunkSize);
                }
            });
        }
        if ($state.current.name == 'base.bible.book') {
            self.book = self.bibleService.findBook($stateParams.book);
            if (!self.book) {
                self.invalidRefGoToBible();
            }
        }

    };

    /**
     * If bible reference is invalid, display alert and redirect user to browse the bible
     */
    ReadCtrl.prototype.invalidRefGoToBible = function () {
        var self = this;
        swal({
            title: "<strong>Oops!</strong>",
            text: "It seems you mistyped the book",
            type: "info",
            html: true,
            confirmButtonText: 'Go the Bible'
        }, function () {
            self.state_.go('base.bible');
        });

    };

    /**
     * Process query param.
     * The query param is expected to be a bible reference, we check if it's a valid scripture, and if it is
     * we display the passage.
     * If it's not, we check if we can identify the book and redirect the user to the view to select the chapter.
     */
    ReadCtrl.prototype.processParams = function () {
        var self = this;
        var passage = self.stateParams_.p;
        if (!_.isEmpty(self.bibleService.parseScripture(passage))) {
            self.scripture = passage;
        } else {
            var book = self.bibleService.findBook(passage);
            if (book) {
                self.state_.go('base.bible.book', {book: passage});
            } else {
                self.invalidRefGoToBible();
            }
        }
    };

    /**
     * Highlight or unhighlight selected row
     * @param verse
     * @param book
     */
    ReadCtrl.prototype.highlight = function (verse, book) {
        var self = this;
        if (!(book in self.selected)) {
            self.selected[book] = {};
        }
        self.selected[book][verse] = !self.selected[book][verse];
    };

    App.controller('readController', ReadCtrl);
})();