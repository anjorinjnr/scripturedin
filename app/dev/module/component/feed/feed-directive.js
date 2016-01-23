App
    .directive('feed', function () {
        return {
            restrict: 'E',
            scope: {
                feed: '='
            },
            link: function(scope, element){

            },
            templateUrl: 'module/component/feed/feed.html'
        }

    });