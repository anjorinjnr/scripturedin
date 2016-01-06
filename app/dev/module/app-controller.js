App.controller('appController', function () {

    var self = this;
    self.fabMenu = {
        isOpen: false
    };

    self.sidebarToggle = {
        left: false,
        right: false
    };

    //Close sidebar on click
    self.sidebarStat = function (event) {

        if (!angular.element(event.target).parent().hasClass('active')) {
            self.sidebarToggle.left = false;

        }
    };

    self.ver = '0.1';

});