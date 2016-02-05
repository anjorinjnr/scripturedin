App.controller('headerController', function ($timeout, $location, $scope) {

    var self = this;

    self.onSearchKeyPress = function (e) {
        //console.log(self.searchTerm);
        if (e && e.keyCode == 13) {
            //console.log('emit');
            //$scope.$emit('search', {query: self.searchTerm});
            $location.url('/read?p=' + self.searchTerm);
        }
    };

});
