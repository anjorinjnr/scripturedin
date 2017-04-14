(function () {

    var NotificationService = function ($http) {
        var self = this;
        self.http_ = $http;
        this.getNotifications();
    };

    NotificationService.prototype.getNotifications = function () {
        return this.http_.get('/api/user/notifications');
    };
   
    App.service('notificationService', NotificationService);

})();