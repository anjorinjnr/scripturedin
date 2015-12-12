/**
 * Created by eanjorin on 12/11/15.
 */
App.directive('focus', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            element.focus();
        }
    }

});