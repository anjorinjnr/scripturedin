(function () {

    var NotificationCtrl = function ($location, notificationService, $scope, $state, $stateParams, userService) {

        var self = this;
        self.location_ = $location;
        self.notificationService = notificationService;
        self.scope_ = $scope;
        self.userService = userService;
        self.stateParams_ = $stateParams;
        self.state_ = $state;
        
        self.notifications = [];
        self.getNotifications();
    };

   
    
    /**
     * Gets all notifications for current user
     */
     NotificationCtrl.prototype.getNotifications = function () {
        var self = this;
        self.promise = self.notificationService.getNotifications();
        self.promise.then(function (resp) {
            self.notifications = resp.data;
            //console.log("Got notifications of size " + self.notifications.length);
        })
    };

    App.controller('notificationController', NotificationCtrl);
})();