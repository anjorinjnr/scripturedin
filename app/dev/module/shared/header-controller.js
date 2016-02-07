(function () {
    var HeaderController = function ($location) {
        var self = this;
        self.location_ = $location;
    };
    HeaderController.prototype.onSearchKeyPress = function (e) {
        var self = this;
        if (e && e.keyCode == 13) {
            $location.url('/read?p=' + self.searchTerm);
        }
    };
    App.controller('headerController', HeaderController);
})();

