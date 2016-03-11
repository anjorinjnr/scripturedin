angular.module(MODULE_NAME)
    .directive('focusMe', function ($timeout) {
        return {
            link: function (scope, element, attrs) {
                console.log(1234);
                $timeout(function () {
                    console.log(element);
                    element[0].focus();
                });
            }
        };
    })
    .directive('nameTag', function () {
        return {
            restrict: 'E',
            scope: {
                user: '='
            },
            template: '<a href ><span ng-if="user.title">{{user.title}}</span>' +
            '<span> {{user.first_name | sentencecase}}</span>' +
            '<span> {{user.last_name | sentencecase}}</span> </a>'
        };
    })
    .directive('autoSave', function (noteService) {
        return {
            restrict: 'EA',
            scope: {
                note: '='
            },
            link: function (scope) {
                noteService.startSaving(scope, scope.note);
            }
        };
    });
