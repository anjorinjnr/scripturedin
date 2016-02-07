/**
 * Created by ebby on 12/29/2015.
 */
App.service('util', function () {

    var self = this;

    self.toQueryString = function (obj) {
        if (_.isObject(obj)) {
            var qryString = $.param(obj);
            return qryString.replace(/%5B%5D/g, '');
        }
        return '';
    };

    self.toLocalFormat = function (ms, format) {
        var local = moment.utc(parseInt(ms)).local();
        format = format ? format : 'MM-DD-YYYY';
        return local.format(format);
    };

    self.toUtcMilliseconds = function (date) {
        return moment(date).utc().unix() * 1000;
    };
    self.toLocalDate = function (ms) {
        return self.toLocalMoment(ms).toDate();
    };
    self.toLocalMoment = function (ms) {
        return moment.utc(parseInt(ms)).local();
    };

    self.log = function (obj) {
        console.log(JSON.stringify(obj, null, 2));
    };
    self.imagePath = function (user) {
        if (user.profile_photo) {
            return user.profile_photo;
        } else if (user.gender == 'f') {
            return 'img/female_avatar.svg';
        } else {
            return 'img/male_avatar.svg';
        }
    };

});