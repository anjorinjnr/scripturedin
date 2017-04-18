(function () {

    var NotificationService = function ($http) {
        var self = this;
        self.http_ = $http;
        this.getNotifications();
    };

    NotificationService.prototype.getNotifications = function () {
        return this.http_.get('/api/user/notifications', {}, {ignoreLoadingBar: true});
    };
   
    App.service('notificationService', NotificationService);

})();