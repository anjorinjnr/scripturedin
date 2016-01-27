/**
 * Created by eanjorin on 12/10/15.
 */
App.controller('homeController', function ($rootScope, userService, authService, bibleService) {

    var self = this;

       console.log(authService.user);
    /*
     listen to search event
     */
    $rootScope.$on('search', function (ev, b) {
        self.getScripture(b.query)
    });

    /**
     * Get scripture
     */
    self.getScripture = function (query) {
        bibleService.get(query).then(function (resp) {
            console.log(resp.data);
        });
    };

    self.getFeed = function () {
        userService.getFeed().then(function (resp) {
           self.feedData = resp.data;
        });
    };

    self.getFeed();
});