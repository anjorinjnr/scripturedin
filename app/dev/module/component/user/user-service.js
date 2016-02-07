(function () {

    var UserService = function ($http, authService) {
        var self = this;
        self.http_ = $http;
        self.authService = authService;
        self.user = authService.user;
    };

    UserService.prototype.signUp = function (user) {
        return this.http_.post('/api/signup', user);
    };

    UserService.prototype.updateProfile = function (user) {
        return this.http_.post('/api/user/profile', user);
    };

    UserService.prototype.requestComment = function (request) {
        return this.http_.post('/api/request');
    };

    /**
     * Get user (sermon) notes
     * @returns {HttpPromise}
     */
    UserService.prototype.getNotes = function () {
        return this.http_.get('/api/user/notes');
    };

    /**
     * Save user {sermon} notes
     * @returns {HttpPromise}
     */
    UserService.prototype.saveNote = function (data) {
        return this.http_.post('/api/user/note', data);
    };

    /**
     * Get a note from the server
     * @param noteId
     * @returns {HttpPromise}
     */
    UserService.prototype.getNote = function (noteId) {
        return this.http_.get('api/note/' + noteId);
    };

    UserService.prototype.publishSermon = function (sermon) {
        return this.http_.post('/api/sermon/publish');
    };

    UserService.prototype.saveSermon = function (sermon) {
        return this.http_.post('/api/sermon');
    };

    UserService.prototype.postComment = function (comment, refKey, kind) {
        return this.http_.post('/api/comment/' + refKey + '?k=' + kind, comment, {ignoreLoadingBar: true});
    };
    UserService.prototype.getSermonNote = function (userId, sermonId) {
        return this.http_.get('/api/user/' + userId + '/sermon/' + sermonId + '/note', {ignoreLoadingBar: true});
    };

    UserService.prototype.saveSermonNote = function (note) {
        return this.http_.post('/api/sermon/note', note, {ignoreLoadingBar: true});
    };

    UserService.prototype.likeComment = function (commentId) {
        return this.http_.post('/api/comment/' + commentId + '/like', {}, {ignoreLoadingBar: true});
    };
    UserService.prototype.unlikeComment = function (commentId) {
        return this.http_.post('/api/comment/' + commentId + '/unlike', {}, {ignoreLoadingBar: true});
    };

    UserService.prototype.likeSermon_ = function (sermonId) {
        return this.http_.post('/api/sermon/' + sermonId + '/like', {}, {ignoreLoadingBar: true});
    };
    UserService.prototype.unlikeSermon_ = function (sermonId) {
        return this.http_.post('/api/sermon/' + sermonId + '/unlike', {}, {ignoreLoadingBar: true});
    };

    /**
     * Like or unlike sermon
     * @param user
     * @param sermon
     */
    UserService.prototype.likeSermon = function (user, sermon) {
        var self = this;
        if (self.busy) return;
        if (_.isUndefined(user['fav_sermon_keys'])) {
            user.fav_sermon_keys = [];
        }

        var i = user.fav_sermon_keys.indexOf(sermon.id);
        if (i >= 0) {
            self.busy = true;
            self.unlikeSermon_(sermon.id).then(function (resp) {
                self.busy = false;
                if (resp.data.status == 'success') {
                    sermon.like_count -= 1;
                    user.fav_sermon_keys.splice(i, 1);
                }
            });
            //unlike
        } else {
            self.busy = true;
            self.likeSermon_(sermon.id).then(function (resp) {
                self.busy = false;
                if (resp.data.status == 'success') {
                    sermon.like_count += 1;
                    user.fav_sermon_keys.push(sermon.id);
                }
            });
        }
    };


    /**
     * Get post feeds for the user
     * @param {Number} userId
     */
    UserService.prototype.getFeed = function (lastTime, cursor) {
        var params = [];
        if (lastTime) {
            params.push['last_time=' + lastTime];
        }
        if (cursor) {
            params.push['cursor=' + cursor];
        }
        return this.http_.get('/api/feeds?' + params.join('&'),
            {ignoreLoadingBar: true});
    };

    UserService.prototype.findUser = function (query, type) {
        var param = {
            query: query,
            type: (type == undefined) ? '' : type
        };
        return this.http_.get('/api/user/search?' + $.param(param), {cache: true, ignoreLoadingBar: true});
    };


    App.service('userService', UserService);
})
();
