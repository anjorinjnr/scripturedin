App.service('authService', function ($http,
                                     $state, $q, USER_ROLES, localStorageService) {
    var self = this;
    self.user = {};


    /**
     * Get current user info from client storage
     * @returns {*}
     */
    self.getUser = function () {
        self.user = !_.isEmpty(self.user) ? self.user : localStorageService.get('user');
        return self.user;
    };

    /**
     * Get current user profile from server
     * @returns {*}
     */
    self.loadCurrentUser = function () {
        return $http.get('/api/user').then(function (resp) {
            if (resp.data.status === 'no active user session') {
                console.log('no session');
                localStorageService.clearAll();
                self.user = {};
                $state.go('main.login');
            } else {
                console.log('setting user');
                localStorageService.set('user', resp.data);
            }
            return resp.data;
        });
    };


    /**
     * Resolve user info for state
     * @returns {*}
     */
    self.resolveAuth = function () {
        var deferred = $q.defer();
        var user = self.getUser();
        //console.log(self.user);
        if (!_.isEmpty(user)) {
            self.loadCurrentUser().then(function () {
                user = self.getUser();
                if (user) {
                    deferred.resolve(user);
                } else {
                    deferred.reject();
                    $state.go('login');
                }
            });
        } else {
            deferred.reject();
            $state.go('login');
        }
        return deferred.promise;
    };

    /**
     * Save user info in client storage
     * @param user
     */
    self.createSession = function (user) {
        localStorageService.set('user', user);
        self.user = user;
    };

    /**
     * Remove current user info from server and client storage
     */
    self.logout = function () {
        $http.post('/api/logout').then(function (resp) {
            if (resp.data.status == 'success') {
                localStorageService.clearAll();
                self.user = {};
                $state.go('main.login');
            }
        });
    };


    /**
     * Perform login with facebook.
     * Send user to fb to authenticate then signup using data from facebook.
     * @param {string} action
     */
    self.facebookLogin = function () {

        if (typeof FB !== 'undefined') {
            FB.login(function (response) {
                //console.log(response);
                if (response.status == 'connected') {
                    FB.api('/me?fields=email,first_name,last_name', function (user) {
                        user.access_token = response.authResponse.accessToken;
                        user.channel = 'facebook';
                        self.signup(user);
                    })
                }
            }, {scope: 'public_profile,email'});
        } else {
            console.error('FB SDK missing..')
        }
    };

    /**
     * Create new user,
     * @param {Object} data,
     * @param {string} action,
     */
    self.signup = function (data, callback) {

        $http.post('/api/signup', data).then(function (resp) {
            if (resp.data.id) {
                var user = resp.data;
                self.createSession(user);
                if (!user.church_key) {
                    $state.go('base.post-signup-profile');
                } else {
                    $state.go('base.home');
                }
            } else {
                if (_.isFunction(callback)) {
                    callback(resp.data);
                }
            }
        });
    };

    /**
     * Return true if there is a current user set
     * otherwise false
     * @returns {boolean}
     */
    self.hasSession = function () {
        //console.log(localStorageService.get('user'));
        return !_.isEmpty(localStorageService.get('user'));
    };


    /**
     * Check if user is authorized to access state.
     * If state role is guest, everyone is authorized
     * if state role is pastor, return true is user is a pastor
     * if state role user and user is logged in return true
     * @param role
     * @returns {*}
     */
    self.isAuthorized = function (role) {
        if (role == USER_ROLES.guest) return true;

        var user = self.user;
        if (_.isEmpty(user)) {
            return false;
        } else if (role == USER_ROLES.pastor) {
            return user.is_pastor;
        } else {
            return true;
        }
    };


    self.checkFbLoginStatus = function () {
        if (typeof FB !== 'undefined') {
            FB.getLoginStatus(function (response) {
                console.log(response);
                //statusChangeCallback(response);
            });
        }

    };

})