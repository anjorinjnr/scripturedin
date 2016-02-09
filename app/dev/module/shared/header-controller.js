(function () {
    var HeaderController = function ($location, bibleService, alertService) {
        var self = this;
        self.location_ = $location;
        self.bibleService = bibleService;
        self.alertService = alertService;
    };
    HeaderController.prototype.onSearchKeyPress = function (e) {
        var self = this;
        if (e && e.keyCode == 13) {
            var s = self.bibleService.parseScripture(self.searchTerm);
            if(!_.isEmpty(s)) {
                window.location = '#/read?p=' + self.searchTerm;
            } else {
                self.alertService.info('Please provide a valid bible reference e.g john 3, acts 4:1-5')
            }

        }
    };
    App.controller('headerController', HeaderController);
})();

