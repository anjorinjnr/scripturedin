/**
 * Created by eanjorin on 12/10/15.
 */
App.service('userService', function ($http) {


    this.signUp = function (user) {
        return $http.post('/api/signup', user);
    };

    this.updateProfile = function (user) {
        return $http.post('/api/user/profile', user);
    };

    this.requestComment = function (request) {
        return $http.post('/api/request');

    };

    this.publishSermon = function (sermon) {
        return $http.post('/api/sermon/publish');
    };

    this.saveSermon = function (sermon) {
        return $http.post('/api/sermon');
    };
});