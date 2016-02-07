(function () {

    var ReadCtrl = function ($location, bibleService, $scope,
                             $mdDialog, userService) {

        var self = this;
        self.location_ = $location;
        self.bibleService = bibleService;
        self.scope_ = $scope;
        self.mdDialog = $mdDialog;
        self.userService = userService;


        self.versions = bibleService.versions();

        self.processParams();
        $scope.$on('$locationChangeSuccess', function (e) {
            self.processParams();
        });


        self.selected = {};

    };

    ReadCtrl.prototype.processParams = function () {
        var self = this;
        var query = self.location_.search();
        if (query.p) {
            self.scripture = query.p;
        }

    };

    /**
     * Highlight or unhighlight selected row
     * @param verse
     * @param book
     */
    ReadCtrl.prototype.highlight = function (verse, book) {
        var self = this;
        if (!(book in self.selected)) {
            self.selected[book] = {};
        }
        self.selected[book][verse] = !self.selected[book][verse];
    };

    App.controller('readController', ReadCtrl);
})();