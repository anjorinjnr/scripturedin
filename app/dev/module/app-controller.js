(function () {

    var AppController = function ($scope, appService) {

        var self = this;
        self.fabMenu = {
            isOpen: false
        };
        self.appService = appService;

    };
    AppController.prototype.switchLayout = function () {
        this.appService.layout = (this.appService.layout == 1) ? 0 : 1;
    };
    App.controller('appController', AppController);
})();
