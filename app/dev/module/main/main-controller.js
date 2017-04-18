(function () {

    var MainCtrl = function ($timeout, $state, $scope, userService,
                             authService, $uibModal, $stateParams,
                             bibleService, alertService, $location, Upload) {
        var self = this;
        self.scope_ = $scope;
        self.state_ = $state;
        self.modal_ = $uibModal;
        self.user = authService.getUser();
        //console.log(self.user.gender);
        self.name = 'main';
        self.newChurch = {};
        self.userService = userService;
        self.authService = authService;
        self.alertService = alertService;
        self.bibleService = bibleService;
        self.uploader = Upload;

        self.getUserNotificationSettings();
        var password_reset_token = $location.search().reset_token; 
        if(password_reset_token){
            self.showPasswordChange(password_reset_token);
        }
        
        

        self.upload = upload;

        if ($state.$current.name == 'main') {
            // check if there is an active user session
            if (!self.authService.hasSession()) {
                // no active user session, check if user is logged in to facebook
                //  and connected to the app
                self.authService.checkFbLoginStatus().then(function (resp) {
                    if (!_.isEmpty(resp)) {
                        //user is logged in to facebook, prompt user to login to app
                        self.fbUser = resp;
                        self.showLogin();
                    } else if ($stateParams.a == 'login') {
                        self.showLogin();
                    } else if ($stateParams.a == 'signup') {
                        self.showSignup();
                    }
                });
            }
        }

        function upload(file) {
            var uploadUrl = '/api/upload?type=profile&id=' + self.user.id;
            console.log(uploadUrl);
            self.uploader.upload({
                url: uploadUrl,
                data: {file: file}
            }).then(function (resp) {
                console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
            }, function (resp) {
                console.log('Error status: ' + resp.status);
            }, function (evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
            });

        }



    };

    MainCtrl.prototype.loginFacebookUser = function () {
        var self = this;
        self.fbUser.auth = 'facebook';
        self.authService.login(self.fbUser);
    };

    /**
     * Starts the facebook login/signup process.
     */
    MainCtrl.prototype.loginWithFacebook = function (signup) {
        var self = this;
        self.authService.facebookLogin(function (user) {
            if (user.signup) {
                self.state_.go('base.post-signup-profile');
            } else {
                self.state_.go('base.home');
            }
        }, function () {
            self.alertService.danger('Login with facebook failed. Please try again.')
        });
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


    MainCtrl.prototype.showLogin = function () {
        console.log('login modal');
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
                        console.log('close modal..')
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

                    self.showPasswordResetModal = function () {
                        modalInstance.close();
                        ctrl.showPasswordReset();
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



    /**
     * Display the profile password change modal.
     */
    MainCtrl.prototype.showProfilePasswordChange = function () {
        var self = this;

        function modal(ctrl) {
            var modalInstance = self.modal_.open({
                templateUrl: 'module/main/profile-password-change-modal.html',
                controller: function () {
                    var self = this;

                    this.showLoginModal = function () {
                        modalInstance.close();
                        ctrl.showLogin();
                    };

                      this.changePassword = function (form) {
                        
                        if (form.$valid && !_.isEmpty(self.currentPassword) && !_.isEmpty(self.newPassword)
                            && !_.isEmpty(self.confirmPassword) ) {
                            
                            ctrl.authService.changeProfilePassword(self.currentPassword, self.newPassword, self.confirmPassword, 
                                function (resp) {
                                    
                                    if (resp.data.status == 'success') {
                                        self.error = "";
                                        ctrl.alertService.info('Password Change Successful.');
                                    }else{
                                        self.error = resp.data.message;
                                    }
                                    
                                }, function (error) {
                                    self.error = error;
                                });
                        } 
                    };
                },
                controllerAs: 'modalCtrl',
                size: 'profile-password-change'
            });
        };
        modal(self)
    };



    /**
     * Display the change password modal.
     */
    MainCtrl.prototype.showPasswordReset = function () {
        var self = this;

        function modal(ctrl) {
            var modalInstance = self.modal_.open({
                templateUrl: 'module/main/password-reset-modal.html',
                controller: function () {
                    var self = this;

                    this.showLoginModal = function () {
                        modalInstance.close();
                        ctrl.showLogin();
                    };

                     //attempt to log user in with email
                    this.sendPasswordResetEmail = function (form) {
                        
                        if (form.$valid && !_.isEmpty(self.email)) {
                            
                            ctrl.authService.sendPasswordResetEmail(self.email,
                                function (resp) {
                                    console.log(resp);
                                    if (resp.data.status == 'success') {
                                        self.error = "";
                                        //self.success = "We sent a password reset email to your inbox.";
                                        ctrl.alertService.info('We sent a password reset email to your inbox.');
                                        modalInstance.close();
                                    }else{
                                        self.error = resp.data.message;
                                    }
                                    
                                }, function (error) {
                                    self.error = error;
                                });
                        } 
                    };
                },
                controllerAs: 'modalCtrl',
                size: 'password-reset'
            });
        };
        modal(self)
    };


     /**
     * Display the password change modal.
     */
    MainCtrl.prototype.showPasswordChange = function (token) {
        var self = this;
        self.token = token;
        
        function modal(ctrl) {
            var modalInstance = self.modal_.open({
                templateUrl: 'module/main/password-change-modal.html',
                controller: function () {
                    
                    var self = this;
                    this.showLoginModal = function () {
                        modalInstance.close();
                        ctrl.showLogin();
                    };

                    this.changePassword = function (form) {
                        
                        if (form.$valid && !_.isEmpty(self.email) && !_.isEmpty(self.password) ) {
                            
                            ctrl.authService.changePassword(self.email, self.password, token, 
                                function (resp) {
                                    
                                    if (resp.data.status == 'success') {
                                        self.error = "";
                                        //self.success = "Password change successful.";
                                        ctrl.alertService.info('Password Change Successful.');
                                        self.showLoginModal();
                                    }else{
                                        self.error = resp.data.message;
                                    }
                                    
                                }, function (error) {
                                    self.error = error;
                                });
                        } 
                    };
                },
                controllerAs: 'modalCtrl',
                size: 'password-change'
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


    MainCtrl.prototype.updateNotificationSetting = function (notification_type, value) {
        var self = this;
        value = (value) ? 1 : 0;
        self.userService.saveNotificationSetting(notification_type, value).then(function (resp) {
                self.alertService.info('Notification setting successfully updated.');
        });
    };

    MainCtrl.prototype.getUserNotificationSettings = function(){
        var self = this;
        self.emailNotification = {
            "mention" : false,
            "post_reply" : false,
            "new_post" : false, 
            "post_like" : false, 
            "new_sermon" : false
        }

       
        self.userService.getNotificationSettings().then(function (resp) {
            checked_notifications = resp.data; 
            
            if( checked_notifications.indexOf("MENTION") > -1 ){
                self.emailNotification.mention = true;
            }

            if( checked_notifications.indexOf("POST_REPLY") > -1 ){
                self.emailNotification.post_reply = true;
            } 

            if( checked_notifications.indexOf("POST_LIKE") > -1 ){
                self.emailNotification.post_like = true;
            } 

            if( checked_notifications.indexOf("NEW_SERMON") > -1 ){
                self.emailNotification.new_sermon  = true;
            } 

            if( checked_notifications.indexOf("NEW_POST") > -1 ){
                self.emailNotification.new_post = true;
            } 
        });    
          
    };

    App.controller('mainController', MainCtrl);
})();



