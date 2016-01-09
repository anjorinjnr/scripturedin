/**
 * Created by eanjorin on 12/10/15.
 */
App.service('userService', function ($http) {

    var self = this;

    self.signUp = function (user) {
        return $http.post('/api/signup', user);
    };

    self.updateProfile = function (user) {
        return $http.post('/api/user/profile', user);
    };

    self.requestComment = function (request) {
        return $http.post('/api/request');

    };

    self.publishSermon = function (sermon) {
        return $http.post('/api/sermon/publish');
    };

    self.saveSermon = function (sermon) {
        return $http.post('/api/sermon');
    };

    self.postComment = function (comment, refKey, kind) {
        return $http.post('/api/comment/' + refKey + '?k=' + kind, comment, {ignoreLoadingBar: true});
    };
    self.getSermonNote = function (userId, sermonId) {
        return $http.get('/api/user/' + userId + '/sermon/' + sermonId + '/note', {ignoreLoadingBar: true});
    };

    self.saveSermonNote = function (note) {
        return $http.post('/api/sermon/note', note, {ignoreLoadingBar: true});
    };

    self.likeComment = function (commentId) {
        return $http.post('/api/comment/' + commentId + '/like', {}, {ignoreLoadingBar: true});
    };
    self.unlikeComment = function (commentId) {
        return $http.post('/api/comment/' + commentId + '/unlike', {}, {ignoreLoadingBar: true});
    };
    self.likeSermon = function (sermonId) {
        return $http.post('/api/sermon/' + sermonId + '/like', {}, {ignoreLoadingBar: true});
    };
    self.unlikeSermon = function (sermonId) {
        return $http.post('/api/sermon/' + sermonId + '/unlike', {}, {ignoreLoadingBar: true});
    };
});