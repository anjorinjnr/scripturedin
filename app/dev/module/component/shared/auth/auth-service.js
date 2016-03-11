var AuthService = function (dataService, $state, $q, USER_ROLES, localStorageService) {
    var self = this;
    self.user = {};
    //self.http_ = $http;
    self.dataService = dataService;
    self.state_ = $state;
    self.q_ = $q;
    self.USER_ROLES = USER_ROLES;
    self.localStorageService = localStorageService;
};


AuthService.prototype.FB = function () {
    //self.FB = typeof FB !== 'undefined' ? FB : facebookConnectPlugin;
    if (typeof FB !== 'undefined') {
        return FB;
    } else {
        return facebookConnectPlugin;
    }
};
/**
 * Get current user saved on client
 * @returns {*}
 */
AuthService.prototype.getUser = function () {
    var self = this;
    self.user = !_.isEmpty(self.user) ? self.user : self.localStorageService.get('user');
    return self.user;
};

/**
 * Get current user profile from server,
 * if no active session on server, redirect to login
 * otherwise we save user info on client
 * @returns {*}
 */
AuthService.prototype.loadCurrentUser = function () {
    var self = this;
    return self.dataService.get('/user').then(function (resp) {
        if (resp.data.status === 'no active user session') {
            console.log('no session');
            self.localStorageService.clearAll();
            self.user = {};
            self.state_.go('main', {a: 'login'});
        } else {
            console.log('setting user');
            self.localStorageService.set('user', resp.data);
            self.user = resp.data;
        }
        return resp.data;
    });
};

/**
 * Check if there is an active session.
 * Basically we trust the active session on the server.
 * @returns {*}
 */
AuthService.prototype.resolveAuth = function () {
    var self = this;
    var deferred = self.q_.defer();
    var user = self.getUser();
    if (!_.isEmpty(user)) {
        self.loadCurrentUser().then(function () {
            user = self.getUser();
            if (user) {
                deferred.resolve(user);
            } else {
                deferred.reject();
                self.state_.go('main');
            }
        });
    } else {
        deferred.reject();
        console.log('no user');
        self.state_.go('main');
    }
    return deferred.promise;
};


/**
 * Save user info in client storage
 * @param user
 */
AuthService.prototype.createSession = function (user) {
    this.localStorageService.set('user', user);
    this.user = user;
};


/**
 * Remove current user info from server and client storage
 */
AuthService.prototype.logout = function () {
    var self = this;
    self.dataService.post('/logout').then(function (resp) {
        if (resp.data.status == 'success') {
            self.localStorageService.remove('user');
            self.user = {};
            window.location = '/';
        }
    });
};

/**
 * Check if user is currently logged into facebook and connect to the app
 * @returns {*}
 */
AuthService.prototype.checkFbLoginStatus = function () {
    var self = this;
    var deferred = self.q_.defer();
    if (typeof FB !== 'undefined') {
        self.FB.getLoginStatus(function (response) {
            if (response.status == 'connected') {

                self.FB.api('/me?fields=email,first_name,last_name,picture', function (user) {
                    user.access_token = response.authResponse.accessToken;
                    user.auth = 'facebook';
                    deferred.resolve(user);
                });
            } else {
                deferred.resolve({});
            }

        });
    } else {
        deferred.resolve({});
        console.error('FB SDK missing..');
    }
    return deferred.promise;
};

/**
 * Attemp to log user in with email and password
 * @param {String} email
 * @param {String} password
 * @param {Function} successCallback
 * @param {Function} errorCallback
 */
AuthService.prototype.emailLogin = function (email, password, successCallback, errorCallback) {
    var self = this;
    var data = {email: email, password: password, auth: 'email'};
    self.login(data, successCallback, errorCallback);
};


/**
 * Perform login/signup with facebook.
 * Send user to fb to authenticate then login/signup using data from facebook.
 * @param {string} action
 */
AuthService.prototype.facebookLogin = function (successCallback, errorCallback) {
    var self = this;
    var FB = self.FB();

    var onFacebookLoginSuccess = function (response) {
        if (response.status == 'connected') {
            //get user's basic info
            FB.api('/me?fields=email,first_name,last_name,picture', function (user) {
                user.access_token = response.authResponse.accessToken;
                user.auth = 'facebook';
                //get user's large profile picture
                FB.api('/' + user.id + '/picture?type=large', function (picture) {
                    user.profile_photo = picture.data.url;
                    self.login(user, successCallback, errorCallback);
                });

            });
        } else {
            if (_.isFunction(errorCallback)) {
                errorCallback();
            }
        }
    };
    if (PLATFORM === 'mobile') {
        FB.login(['email', 'public_profile'], onFacebookLoginSuccess, function (er) {
            console.log(er);
        });
    } else {
        FB.login(onFacebookLoginSuccess, {scope: 'public_profile,email'});
    }


};

/**
 * Create new user with using email credentials
 * @param {Object} data,
 * @param {string} action,
 */
AuthService.prototype.signup = function (data, successCallback, errorCallback) {
    var self = this;
    self.dataService.post('/signup', data).then(function (resp) {
        if (resp.data.id) {
            var user = resp.data;
            self.createSession(user);
            if (_.isFunction(successCallback)) {
                successCallback(user);
            }
        } else {
            if (_.isFunction(errorCallback)) {
                errorCallback(resp.data);
            }
        }
    });
};

/**
 * Login user into the app.
 * @param data
 * @param successCallback
 * @param errorCallback
 */
AuthService.prototype.login = function (data, successCallback, errorCallback) {
    var self = this;
    self.dataService.post('/login', data).then(function (resp) {
        if (resp.data.id) {
            var user = resp.data;
            self.createSession(user);
            if (_.isFunction(successCallback)) {
                successCallback(user);
            }
        } else {
            if (_.isFunction(errorCallback)) {
                errorCallback(resp.data.message);
            }
        }
    });
};


/**
 * Return true if there is a current user set
 * otherwise false
 * @returns {boolean}
 */
AuthService.prototype.hasSession = function () {
    return !_.isEmpty(this.localStorageService.get('user'));
};


/**
 * Check if user is authorized to access state.
 * If state role is guest, everyone is authorized
 * if state role is pastor, return true is user is a pastor
 * if state role user and user is logged in return true
 * @param role
 * @returns {*}
 */
AuthService.prototype.isAuthorized = function (state) {
    var self = this;
    var role = self.USER_ROLES.guest;

    if (state.data && state.data.role) {
        role = state.data.role;
    }

    console.log('role ' + role);
    if (role == self.USER_ROLES.guest) return true;

    var user = self.getUser();
    if (_.isEmpty(user)) {
        return false;
    } else if (role == self.USER_ROLES.pastor) {
        return user.is_pastor;
    } else {
        return true;
    }
};

angular.module(MODULE_NAME).service('authService', AuthService);

