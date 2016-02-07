(function () {
    App.directive('chipShowModalOnClick', function (bibleService) {
        return {
            restrict: 'A',
            link: function (scope, element) {
                $(element).on('click', 'md-chip', function (e) {
                    var scripture = angular.element(e.currentTarget).scope().$chip;
                    bibleService.showScriptureModal(scripture);
                });

            }
        }
    });
    App.directive('showScriptureOnClick', function (bibleService) {
            return {
                restrict: 'A',
                scope: {
                    scripture: '='
                },
                link: function (scope, element) {
                    $(element).on('click', function () {
                        bibleService.showScriptureModal(scope.scripture);
                    });
                }
            }
        })
        .directive('scripture', function (bibleService) {
            return {
                restrict: 'E',
                scope: {
                    //scripture: '='
                    text: '='
                },
                link: function (scope, element) {

                    //create scripture object from text
                    var scripture = bibleService.parseScripture(scope.text);

                    //console.log(scripture);

                    getPassage(scripture);

                    //get the available bible versions
                    bibleService.versions().then(function (resp) {
                        scope.versions = resp.data;
                    });

                    /**
                     * Reload scripture using selected translation
                     * @param trans
                     */
                    scope.changeTranslation = function (trans) {
                        scripture.translation = trans.abbr.toLowerCase();
                        getPassage(scripture);
                    };

                    /**
                     * Load scripture from server
                     * @param {Object} scripture
                     */
                    function getPassage(scripture) {
                        scope.loading = true;
                        bibleService.getPassage(scripture).then(function (resp) {
                            scope.loading = false;
                            scope.scripture = resp.data;
                        });
                    };
                },
                templateUrl: 'module/component/scripture/scripture-card.html'
            };
        });
})();
