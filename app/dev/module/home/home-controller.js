(function () {

    var HomeController = function ($scope, alertService, userService, bibleService) {
        var self = this;
        self.scope_ = $scope;
        self.bibleService = bibleService;
        self.userService = userService;
        self.alertService = alertService;
        self.getFeed();
    };

    /**
     * Get scripture
     */
    HomeController.prototype.getFeed = function () {
        var self = this;
        self.userService.getFeed().then(function (resp) {
            self.feedData = resp.data;
        });
    };

    App.controller('homeController', HomeController);
})();
App.controller('homeController', function ($scope, alertService, userService, authService, bibleService) {


});