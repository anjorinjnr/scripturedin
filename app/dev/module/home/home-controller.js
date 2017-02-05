(function () {

    var HomeController = function ($scope, alertService, userService, bibleService) {
        var self = this;
        self.scope_ = $scope;
        self.bibleService = bibleService;
        self.userService = userService;
        self.alertService = alertService;
        self.post = {
            content: ''
        };
        self.getFeed();
    };

    HomeController.prototype.getFeed = function () {
        var self = this;
        self.userService.getFeed().then(function (resp) {
            self.feedData = resp.data;
            console.log(self.feedData);
        });
    };
    HomeController.prototype.newPost = function () {
        var self = this;
        if (_.isEmpty(self.post.content)) {
            return;
        }
        var post = self.bibleService.formatScripturesInText(self.post.content);
        self.userService.savePost({content: post}).then(function (resp) {
            if (resp.data.id) {
                self.post.content = '';
                var post = resp.data;
                //console.log(post);
                self.feedData.feeds.unshift(post);
            }
        });
    };


    App.controller('homeController', HomeController);
})();