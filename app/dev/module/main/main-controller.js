(function () {

    var MainCtrl = function ($timeout, $state, $scope, userService,
                             authService, $uibModal, $stateParams,
                             bibleService, alertService) {
        var self = this;
        self.scope_ = $scope;
        self.state_ = $state;
        self.modal_ = $uibModal;
        self.user = authService.getUser();
        //console.log(self.user.gender);
        self.newChurch = {};
        self.userService = userService;
        self.authService = authService;
        self.alertService = alertService;
        self.bibleService = bibleService;


        if ($state.$current.name == 'main') {

            self.authService.checkFbLoginStatus().then(function (resp) {
                if (!_.isEmpty(resp)) {
                    self.fbUser = resp;
                    self.showLogin();
                }
            });

            if ($stateParams.a == 'login') {
                self.showLogin();
            } else if ($stateParams.a == 'signup') {
                self.showSignup();
            }
        }


    };

    MainCtrl.prototype.loginFacebookUser = function () {
        var self = this;
        self.fbUser.auth = 'facebook';
        self.authService.login(self.fbUser);
    };

    /**
     * Save changes to user profile.
     * If saveAndDone is true, redirect to home page after save.
     * @param saveAndDone
     */
    MainCtrl.prototype.updateProfile = function (saveAndDone) {
        var self = this;
        if (_.isObject(self.user.church)) {
            self.user.church_key = self.user.church.id;
        }

        //console.log(self.profile);
        self.userService.updateProfile(self.user).then(function (resp) {
            if (resp.data.id) {
                self.user = resp.data;
                if (saveAndDone) {
                    self.state_.go('base.home');
                } else {
                    self.alertService.info('Profile updated');
                }
            } else {
                self.alertService.danger('Changes not saved, please try again.');
            }
        });
    };

    /**
     * Provide auto complete for church select input
     * @param val
     * @returns {Array}
     */
    MainCtrl.prototype.getChurch = function (val) {
        var self = this;
        var match = [];
        if (val && val.length >= 2) {
            val = val.toLowerCase();
            self.churches.forEach(function (c) {
                if (c.name.toLowerCase().indexOf(val) >= 0) {
                    match.push(c);
                }
            });
        }
        return match;
    };

    MainCtrl.prototype.showEmailSignup = function () {
        var self = this;
        var ctrl = self;
        var modalInstance = self.modal_.open({
            templateUrl: 'module/main/email-signup-modal.html',
            controller: function () {
                var self = this;
                self.login = function () {
                    modalInstance.close();
                    ctrl.showLogin();
                };
                self.signup = function (form) {
                    if (form.$valid) {
                        ctrl.authService.signup(self.user,
                            function (user) {
                                modalInstance.close();
                                if (!user.church_key) {
                                    ctrl.state_.go('base.post-signup-profile');
                                } else {
                                    ctrl.state_.go('base.home');
                                }
                            }, function (data) {
                                self.error = data.message;
                            }
                        );
                    }
                };
            },
            controllerAs: 'modalCtrl',
            size: 'signup'
        });
    };

    /**
     * Starts the facebook login/signup process.
     */
    MainCtrl.prototype.loginWithFacebook = function (signup) {
        var self = this;
        this.authService.facebookLogin(function () {
            if (signup) {
                self.state_.go('base.post-signup-profile');
            }

        }, function () {
            self.alertService.danget('Login with facebook failed. Please try again.')
        });
    };

    MainCtrl.prototype.showLogin = function () {
        var self = this;

        function modalInstances(ctrl) {
            var modalInstance = self.modal_.open({
                animation: true,
                templateUrl: 'module/main/login-modal.html',
                controller: function () {
                    var self = this;
                    self.main = ctrl;

                    //facebook user conneced but not logged,
                    //login user in.
                    self.continueWithFacebook = function () {
                        modalInstance.close();
                        self.main.loginFacebookUser();
                    };

                    self.loginWithFacebook = function () {
                        modalInstance.close();
                        self.main.loginWithFacebook(false);
                    };
                    self.showSignupModal = function () {
                        modalInstance.close();
                        ctrl.showSignup();
                    };

                    //attempt to log user in with email
                    self.loginWithEmail = function (form) {
                        if (form.$valid && !_.isEmpty(self.email) && !_.isEmpty(self.password)) {
                            ctrl.authService.emailLogin(self.email, self.password,
                                function (user) {
                                    modalInstance.close();
                                    ctrl.state_.go('base.home');
                                }, function (error) {
                                    self.error = error;

                                });
                        }
                    };
                },
                controllerAs: 'modalCtrl',
                size: 'login',
                backdrop: true,
                keyboard: true

            });
        };
        modalInstances(self)

    };


    /**
     * Display the signup modal.
     * The signup modal allows a user to login using facebook or email.
     * The user can also launch the login modal from here.
     * If the user wants to login via email, we display the emailsignup modal.
     * If the user wants to login to fb, we intiate the fb login workflow
     */
    MainCtrl.prototype.showSignup = function () {
        var self = this;

        function modal(ctrl) {
            var modalInstance = self.modal_.open({
                templateUrl: 'module/main/signup-modal.html',
                controller: function () {
                    this.showLoginModal = function () {
                        modalInstance.close();
                        ctrl.showLogin();
                    };

                    this.signupWithFacebook = function () {
                        modalInstance.close();
                        ctrl.loginWithFacebook(true);

                    };
                    this.showEmailSignupModal = function () {
                        modalInstance.close();
                        ctrl.showEmailSignup();
                    };
                },
                controllerAs: 'modalCtrl',
                size: 'signup'
            });
        };
        modal(self)
    };


    MainCtrl.prototype.churchLabel = function (c) {
        if (!_.isObject(c)) return;
        if (_.isEmpty(c.city)) {
            return c.name;
        } else {
            return c.name + ' (' + c.city + ')';
        }
    };
    /**
     * Create church in server and set the church as the user's
     * selected church
     */
    MainCtrl.prototype.addChurch = function (form) {
        var self = this;
        if (form.$valid) {
            self.bibleService.addChurch(self.newChurch).then(function (resp) {
                var church = resp.data;
                if (church.id) {
                    self.newChurch = {}; //reset
                    self.user.church = church;
                    self.new_church = false;
                    self.noResults = false;
                } else {
                    self.alertService.info('Unable to add sermon, try again.');
                }
            });
        }
    };

    App.controller('mainController', MainCtrl);
})();



