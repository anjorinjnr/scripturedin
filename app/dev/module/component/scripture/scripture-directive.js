App.directive('scripture', function (bibleService) {
    return {
        restrict: 'E',
        scope: {
            //scripture: '='
            text: '='
        },
        link: function (scope, element) {

            //create scripture object from text
            var scripture = bibleService.parseScripture(scope.text);
            console.log(scripture);

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
                    scope.loading = false;1
                    scope.scripture = resp.data;
                });
            };

            //     self.askForComment = function (ev) {
            //$mdDialog.show({
            //    controller: function ($scope, $mdDialog) {
            //        var self = this;
            //        self.$scope = $scope;
            //        self.request = {};
            //        self.request.tags = [];
            //        self.request.invites = [
            //            {
            //                'type': 'email'
            //            }
            //        ];
            //        self.newInvite = function () {
            //            self.request.invites.push({
            //                'type': 'email'
            //            });
            //        };
            //        self.removeInvite = function (i) {
            //            self.request.invites.splice(i, 1);
            //        };
            //        self.submitForm = function () {
            //            console.log($('#reqForm'));
            //            console.log(self.request);
            //            // $scope.$emit('submitRequestEvent');
            //
            //        };
            //
            //    },
            //    controllerAs: 'reqCtrl',
            //    templateUrl: '/module/read/ask-comment.modal.html',
            //    parent: angular.element(document.body),
            //    targetEvent: ev,
            //    clickOutsideToClose: true
            //});
            //}
            /**/
        },
        templateUrl: 'module/component/scripture/scripture-card.html'
    }
});