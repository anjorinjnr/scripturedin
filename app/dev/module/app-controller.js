App.controller('appController', function ($scope, sidebarToggle) {

    var self = this;
    self.fabMenu = {
        isOpen: false
    };

    //$('.main-page-content').on('click', function (ev) {
    //    //console.log($(ev.target)[0]);
    //    //if ($(ev.target)[0].id == 'menu-trigger') {
    //    //    return;
    //    //}
    //    console.log($(ev.target));
    //    if (self.sidebarToggle.left) {
    //        console.log('hide');
    //        self.sidebarToggle.left = false;
    //        $scope.$digest();
    //    }
    //
    //});

    self.sidebarToggle = sidebarToggle;

    //Close sidebar on click
    self.sidebarStat = function (event) {

        if (!angular.element(event.target).parent().hasClass('active')) {
            self.sidebarToggle.left = false;

        }
    };

    self.ver = '0.1';

});