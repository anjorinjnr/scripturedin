/**
 * Created by ebby on 12/29/2015.
 */
App.service('util', function () {

    var self = this;

    self.toLocalFormat = function (ms, format) {
        var local = moment.utc(parseInt(ms)).local();
        format = format ? format : 'MM-DD-YYYY';
        return local.format(format);
    };

    self.toLocalDate = function (ms) {
        return moment.utc(parseInt(ms)).local().toDate();
    };

    self.log = function(obj){
        console.log(JSON.stringify(obj, null, 2));
    }

});