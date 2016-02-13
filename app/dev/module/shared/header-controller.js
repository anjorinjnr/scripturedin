(function () {
    var HeaderController = function (bibleService, alertService, $state) {
        var self = this;
        self.bibleService = bibleService;
        self.alertService = alertService;
        self.state_ = $state;
    };
    HeaderController.prototype.onSearchKeyPress = function (e) {
        var self = this;
        if (e && e.keyCode === 13) {
            var s = self.bibleService.parseScripture(self.searchTerm);
            if (!_.isEmpty(s)) {
                window.location = '#/read?p=' + self.searchTerm;
            } else {
                if (self.bibleService.findBook(self.searchTerm)) {
                    self.state_.go('base.bible.book', {book: self.searchTerm})
                } else {
                    self.alertService.info('Please provide a valid bible reference e.g john 3, acts 4:1-5');
                }
            }
        }
    };
    App.controller('headerController', HeaderController);
})();

