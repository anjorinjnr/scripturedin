/**
 * Created by eanjorin on 12/11/15.
 */
App
    .filter('sentencecase', function () {
        return function (input) {
            if (angular.isString(input)) {
                var i = input.split(' ');
                var word = [];
                i.forEach(function (w) {
                    word.push(w.charAt(0).toUpperCase() + w.substring(1, w.length).toLowerCase());
                });
                return word.join(' ');
            }
            return input;
        }
    })
    .filter('formatDate', function (util) {
        return function (input, format) {
            return util.toLocalFormat(input, format)
        }
    })
    .filter('ago', function (util) {
        return function (input) {
            return util.toLocalMoment(input).duration()
        }
    });
;

