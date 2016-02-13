(function () {

    var AppController = function ($scope, appService, bibleService) {

        var self = this;
        self.fabMenu = {
            isOpen: false
        };
        self.appService = appService;
        self.books = bibleService.books.ALL;
    };
    AppController.prototype.switchLayout = function () {
        this.appService.layout = (this.appService.layout == 1) ? 0 : 1;
    };
    App.controller('appController', AppController);
})();
