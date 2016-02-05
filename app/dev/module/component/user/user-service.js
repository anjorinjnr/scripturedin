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

    /**
     * Get user (sermon) notes
     * @returns {HttpPromise}
     */
    self.getNotes = function () {
        return $http.get('/api/user/notes');
    };

    /**
     * Save user {sermon} notes
     * @returns {HttpPromise}
     */
    self.saveNote = function (data) {
        return $http.post('/api/user/note', data);
    };

    /**
     * Get a note from the server
     * @param noteId
     * @returns {HttpPromise}
     */
    self.getNote = function (noteId) {
        return $http.get('api/note/' + noteId);
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

    /**
     * Get post feeds for the user
     * @param {Number} userId
     */
    self.getFeed = function (lastTime, cursor) {
        var params = [];
        if (lastTime) {
            params.push['last_time=' + lastTime];
        }
        if (cursor) {
            params.push['cursor=' + cursor];
        }
        return $http.get('/api/feeds?' + params.join('&'),
            {ignoreLoadingBar: true});
    };

    self.findUser = function (query, type) {
        var param = {
            query: query,
            type: (type == undefined) ? '' : type
        };
        return $http.get('/api/user/search?' + $.param(param), {cache: true, ignoreLoadingBar: true});
    }
});