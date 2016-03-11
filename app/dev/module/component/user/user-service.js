(function () {

    var UserService = function ($http, authService, localStorageService, APP_CONSTANTS) {
        var self = this;
        self.http_ = $http;
        self.storage = localStorageService;
        self.authService = authService;
        self.user = authService.user;
        self.APP_CONSTANTS = APP_CONSTANTS;
    };

    UserService.prototype.saveConfig = function (conf) {
        this.storage.set('_user_config', conf);
    };

    UserService.prototype.savePost = function (data) {
        return this.http_.post('/api/user/post', data, {ignoreLoadingBar: true});
    };

    UserService.prototype.getConfig = function () {
        var self = this;
        var config = self.storage.get('_user_config');
        if (config == null) {
            var tip_note_auto_save = self.APP_CONSTANTS.TIP_NOTE_AUTO_SAVE;
            config = {
                tip_note_auto_save: false
            };
            self.saveConfig(config);
        }
        return config;
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
        return this.http_.post('/api/user/note', data, {ignoreLoadingBar: true});
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
    UserService.prototype.likePost_ = function (postId) {
        return this.http_.post('/api/user/post/' + postId + '/like', {}, {ignoreLoadingBar: true});
    };
    UserService.prototype.unlikePost_ = function (postId) {
        return this.http_.post('/api/user/post/' + postId + '/unlike', {}, {ignoreLoadingBar: true});
    };

    UserService.prototype.likeSermon_ = function (sermonId) {
        return this.http_.post('/api/sermon/' + sermonId + '/like', {}, {ignoreLoadingBar: true});
    };
    UserService.prototype.unlikeSermon_ = function (sermonId) {
        return this.http_.post('/api/sermon/' + sermonId + '/unlike', {}, {ignoreLoadingBar: true});
    };

    UserService.prototype.deletePost = function (postId) {
        return this.http_.delete('/api/post/' + postId, {ignoreLoadingBar: true});
    };
    UserService.prototype.deleteNote = function (noteId) {
        return this.http_.delete('/api/note/' + noteId, {ignoreLoadingBar: true});
    };
    UserService.prototype.likePost = function (user, post) {
        var self = this;
        var i = post.likers_key.indexOf(user.id);
        if (i >= 0) {
            //unlike
            self.unlikePost_(post.id).then(function (resp) {
                if (resp.data.status == 'success') {
                    post.likers_key.splice(i, 1);
                    post.like_count--;
                }
            });
        } else {
            //like
            self.likePost_(post.id).then(function (resp) {
                if (resp.data.status == 'success') {
                    post.likers_key.push(user.id);
                    post.like_count++;
                }
            });
        }
    };
    /**
     * Like or unlike sermon
     * @param user
     * @param sermon
     */
    UserService.prototype.likeSermon = function (user, sermon) {
        var self = this;
        if (self.busy) return;

        var i = sermon.likers_key.indexOf(user.id);
        if (i >= 0) {
            //unlike
            self.busy = true;
            self.unlikeSermon_(sermon.id).then(function (resp) {
                self.busy = false;
                if (resp.data.status == 'success') {
                    sermon.like_count--;
                    user.fav_sermon_keys.splice(user.fav_sermon_keys.indexOf(sermon.id), 1);
                    sermon.likers_key.splice(i, 1);
                }
            });
        } else {
            //like
            self.busy = true;
            self.likeSermon_(sermon.id).then(function (resp) {
                self.busy = false;
                if (resp.data.status == 'success') {
                    sermon.like_count++;
                    user.fav_sermon_keys.push(sermon.id);
                    sermon.likers_key.push(user.id);
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
