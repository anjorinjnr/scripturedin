(function () {
    var HeaderController = function (bibleService, alertService, notificationService, $state, $interval) {
        var self = this;
        self.bibleService = bibleService;
        self.alertService = alertService;
        self.notificationService = notificationService;
        self.state_ = $state;
        
        self.notifications = [];

        self.getNotifications();
        var getNotifications = function(){
            self.getNotifications();
        }
        $interval(getNotifications, 300000);

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

    /**
     * Gets all notifications for current user
     */
    HeaderController.prototype.getNotifications = function () {
        var self = this;
        self.promise = self.notificationService.getNotifications();
        self.promise.then(function (resp) {
            self.notifications = resp.data;
            console.log("Got notifications of size " + self.notifications.length);
        })
    };


    App.controller('headerController', HeaderController);
})();

