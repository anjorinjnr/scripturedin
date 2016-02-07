App.controller('appController', function ($scope, sidebarToggle) {

    var self = this;
    self.fabMenu = {
        isOpen: false
    };

    self.sidebarToggle = sidebarToggle;

    //Close sidebar on click
    self.sidebarStat = function (event) {

        if (!angular.element(event.target).parent().hasClass('active')) {
            self.sidebarToggle.left = false;

        }
    };

    self.ver = '1.0';

});