var App = angular.module('scripturedIn', [
        'ngMaterial',
        'ngAnimate',
        'ngResource',
        'LocalStorageModule',
        'ui.router',
        'ui.bootstrap',
        'angular-loading-bar',
        'oc.lazyLoad',
        'ngWYSIWYG',
        'md.data.table',
        'ngFileUpload'
    ])
    .constant('USER_ROLES', {
        guest: 'guest',
        pastor: 'pastor',
        user: 'user'
    })
    .constant('APP_CONSTANTS', {
        TIP_NOTE_AUTO_SAVE: 'tip_note_auto_save'
    })
    .service('appService', function () {
        return {
            sidebarToggle: false,
            searchToggle: false,
            layout: 1,
            ver: '1.0.5'
        };
    })
    .config(["$uiViewScrollProvider", function ($uiViewScrollProvider) {
        $uiViewScrollProvider.useAnchorScroll();
    }])
    .run(["$rootScope", "alertService", "util", "authService", "userService", "$state", "$mdToast", "appService", function ($rootScope, alertService, util, authService, userService, $state, $mdToast, appService) {

            $rootScope.authService = authService;
            $rootScope.$state = $state;

            /**
             * Return profile picture for user,
             * if user has profile picture we use that,
             * else we display an avatar based on the gender
             * @param user
             * @returns {*}
             */
            $rootScope.imagePath = function (user) {
                return util.imagePath(user);
            };
            $rootScope.$on('$stateChangeSuccess', function () {
                appService.sidebarToggle.left = false;
            });

            /**
             * Perform state checks.
             *
             * This block runs first before each state is activated,
             * before the resolve block(if any) in the state runs.
             */
            $rootScope.$on('$stateChangeStart', function (event, toState) {


                console.log(toState);
                // if the user is activating the logout state
                // we basically need to log the user out of the client and server
                // and redirect to the login state
                if (toState.url === '/logout') {
                    event.preventDefault();
                    authService.logout();
                    return;
                }

                if (authService.hasSession()) {
                    // if user has an active session (at least on the client
                    // and is trying to access the welcome, login or signup state, we simply redirect
                    // such user to the application home state
                    if (toState.name === 'main') {
                        event.preventDefault();
                        $state.go('base.home');
                        return;
                    } else if (!authService.isAuthorized(toState)) {
                        console.log('go home');
                        event.preventDefault();
                        $state.go('base.home');
                        return;
                    }
                } else {
                    console.log('no session');
                    // use does not have an active session on the client, user can only view the main state
                    // or any other state that allows guest access
                    if (toState.name != 'main' && !authService.isAuthorized(toState)) {
                        event.preventDefault();
                        $state.go('main', {a: 'login'});
                    }
                }

            });
            $rootScope.editorConfig = {
                toolbar: [
                    {
                        name: 'basicStyling',
                        items: ['bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript', '-', 'leftAlign', 'centerAlign', 'rightAlign', 'blockJustify', '-']
                    },
                    {name: 'paragraph', items: ['orderedList', 'unorderedList', 'outdent', 'indent', '-']},
                    {name: 'doers', items: ['removeFormatting', 'undo', 'redo', '-']},
                    {name: 'colors', items: ['fontColor', 'backgroundColor', '-']}
                ]
            };
        }]
    );

(function () {

    var AppController = function ($scope, appService) {

        var self = this;
        self.fabMenu = {
            isOpen: false
        };
        self.appService = appService;

    };
    AppController.$inject = ["$scope", "appService"];
    AppController.prototype.switchLayout = function () {
        this.appService.layout = (this.appService.layout == 1) ? 0 : 1;
    };
    App.controller('appController', AppController);
})();

App.config(["localStorageServiceProvider", function (localStorageServiceProvider) {
        localStorageServiceProvider
            .setPrefix('scripturedin')
            .setStorageCookieDomain(window.location.hostname);
    }])
    .config(["$stateProvider", "$urlRouterProvider", "USER_ROLES", function ($stateProvider, $urlRouterProvider, USER_ROLES) {

        var resolveAuth = function (authService) {
            console.log('resolving auth');
            return authService.resolveAuth();
        };
        resolveAuth.$inject = ["authService"];

        $urlRouterProvider.otherwise('/');
        $stateProvider
            .state('logout', {
                url: '/logout'
            })
            .state('main', {
                url: '/?a',
                templateUrl: 'module/main/main.html',
                controller: 'mainController as mainCtrl',
                data: {
                    role: USER_ROLES.guest
                },
                resolve: {
                    fbSdk: ["$q", function ($q) {
                        var deferred = $q.defer();
                        window.fbAsyncInit = function () {
                            FB.init({
                                appId: '1637149913216948',
                                xfbml: true,
                                version: 'v2.5'
                            });
                            deferred.resolve('done');
                        };

                        (function (d, s, id) {
                            var js, fjs = d.getElementsByTagName(s)[0];
                            if (d.getElementById(id)) {
                                return;
                            }
                            js = d.createElement(s);
                            js.id = id;
                            js.src = "//connect.facebook.net/en_US/sdk.js";
                            fjs.parentNode.insertBefore(js, fjs);
                        }(document, 'script', 'facebook-jssdk'));

                        return deferred.promise;
                    }]
                }
            })

            .state('base', {
                abstract: true,
                templateUrl: 'module/shared/base.html',
                resolve: {
                    auth: resolveAuth
                }
            })
            .state('base.post-signup-profile', {
                url: '/update-profile',
                views: {
                    'content': {
                        templateUrl: 'module/main/update-profile-signup.html',
                        controller: 'mainController as mainCtrl'
                    }
                },
                data: {
                    role: USER_ROLES.user,
                    hideHeader: false,
                    pageTitle: 'Update your profile'
                }
            })
            .state('base.settings', {
                url: '/settings',
                views: {
                    'content': {
                        templateUrl: 'module/main/settings.html',
                        controller: 'mainController as mainCtrl'
                    }
                },
                data: {
                    role: USER_ROLES.user,
                    pageTitle: 'Update your profile'
                }
            })
            .state('base.home', {
                url: '/home',
                views: {
                    'content': {
                        templateUrl: 'module/home/home.html',
                        controller: 'homeController as homeCtrl'
                    }
                },
                data: {
                    role: USER_ROLES.user
                }
            })
            .state('base.sermon-create', {
                url: '/sermon/create?date',
                views: {
                    'content': {
                        templateUrl: 'module/sermon/create.html',
                        controller: 'sermonController as sermonCtrl'
                    }
                },
                resolve: {
                    sermons: function () {
                        return [];
                    },
                    sermon: function () {
                        return {};
                    }
                },
                data: {
                    role: USER_ROLES.pastor,
                    pageTitle: 'Create new Sermon'
                }
            })
            .state('base.sermon-view', {
                url: '/sermon/{id:int}/:option',
                views: {
                    'content': {
                        templateUrl: 'module/sermon/study.html',
                        controller: 'sermonController as sermonCtrl'
                    }
                },
                resolve: {
                    sermon: ["bibleService", "$stateParams", "alertService", "$q", function (bibleService, $stateParams, alertService, $q) {
                        var deferred = $q.defer();
                        bibleService.getSermon($stateParams.id).then(function (resp) {
                            if (resp.data.id) {
                                deferred.resolve(resp.data);
                            } else {
                                alertService.danger('Sermon does not exist <br> Redirecting...', {
                                    align: 'center',
                                    delay: 10000
                                });
                                deferred.reject('bla');

                            }
                        });
                        return deferred.promise;
                    }]
                },
                data: {
                    role: USER_ROLES.user
                }
            })
            .state('base.sermon-browse', {
                url: '/sermon/browse',
                views: {
                    'content': {
                        templateUrl: 'module/sermon/browse.html',
                        controller: 'sermonController as sermonCtrl'
                    }
                },
                resolve: {
                    sermon: function () {
                        return {};
                    },
                    loadPlugin: ["$ocLazyLoad", function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                name: 'css',
                                insertBefore: '#app-level',
                                files: [
                                    'vendors/bower_components/fullcalendar/dist/fullcalendar.min.css',
                                ]
                            },
                            {
                                name: 'vendors',
                                files: [
                                    // 'vendors/bower_components/moment/min/moment.min.js',
                                    'vendors/bower_components/fullcalendar/dist/fullcalendar.min.js'
                                ]
                            }
                        ])
                    }]
                },
                data: {
                    role: USER_ROLES.user,
                    pageTitle: 'Find a sermon'
                }
            })
            .state('base.read', {
                url: '/read',
                views: {
                    'content': {
                        templateUrl: 'module/read/read.html',
                        controller: 'readController as readCtrl'
                    }
                },
                data: {
                    role: USER_ROLES.user
                }
            })
            .state('base.new-note', {
                url: '/note/create',
                views: {
                    'content': {
                        templateUrl: 'module/notes/create.html',
                        controller: 'notesController as notesCtrl'
                    }
                },
                resolve: {
                    note: function () {
                        return {};
                    }
                },
                data: {
                    role: USER_ROLES.user,
                    pageTitle: 'New Note'
                }
            })
            .state('base.notes', {
                url: '/notes',
                views: {
                    'content': {
                        templateUrl: 'module/notes/notes.html',
                        controller: 'notesController as notesCtrl'
                    }
                },
                resolve: {
                    note: function () {
                        return {};
                    }
                },
                 data: {
                    role: USER_ROLES.user,
                    pageTitle: 'Ny Notes'
                }
            })
            .state('base.note', {
                url: '/note/{id:int}',
                views: {
                    'content': {
                        templateUrl: 'module/notes/note.html',
                        controller: 'notesController as notesCtrl'
                    }
                },
                resolve: {
                    note: ["$q", "$stateParams", "userService", function ($q, $stateParams, userService) {
                        var deferred = $q.defer();
                        userService.getNote($stateParams.id).then(function (resp) {
                            deferred.resolve(resp.data);
                        });
                        return deferred.promise;

                    }]
                },
                  data: {
                    role: USER_ROLES.user,
                    pageTitle: 'Sermon Note'
                }
            });
    }]);
(function () {

    var HomeController = function ($scope, alertService, userService, bibleService) {
        var self = this;
        self.scope_ = $scope;
        self.bibleService = bibleService;
        self.userService = userService;
        self.alertService = alertService;
        self.post = {
            content: ''
        };
        self.getFeed();
    };
    HomeController.$inject = ["$scope", "alertService", "userService", "bibleService"];

    HomeController.prototype.getFeed = function () {
        var self = this;
        self.userService.getFeed().then(function (resp) {
            self.feedData = resp.data;
            //console.log(self.feedData);
        });
    };
    HomeController.prototype.newPost = function () {
        var self = this;
        if (_.isEmpty(self.post.content)) {
            return;
        }
        var post = self.bibleService.formatScripturesInText(self.post.content);
        self.userService.savePost({content: post}).then(function (resp) {
            if (resp.data.id) {
                self.post.content = '';
                var post = resp.data;
                //console.log(post);
                self.feedData.feeds.unshift(post);
            }
        });
    };


    App.controller('homeController', HomeController);
})();
(function () {

    var NoteService = function ($interval, userService, alertService) {
        this.interval_ = $interval;
        this.userService = userService;
        this.alertService = alertService;
        this.lastSaved = 0;
    };
    NoteService.$inject = ["$interval", "userService", "alertService"];

    NoteService.prototype.startSaving = function ($scope, note, validate) {
        var self = this;
        self.note = note;
        self.validate = validate;
        $scope.$watch(function () {
                if (self.note) {
                    return self.note.notes;
                }
            },
            function (n, o) {
                if (n != o) {
                    self.lastUpdated = moment().unix();
                    console.log('updated: ' + self.lastUpdated);
                }
            });
        self.saveOnIntervals();
    };

    NoteService.prototype.saveOnIntervals = function () {
        var self = this;
        self.interval_(function () {
                if (self.lastUpdated > self.lastSaved) {
                    var save = true;
                    if (_.isFunction(self.validate)) {
                        save = self.validate(self.note);
                    }
                    if (save) {
                        self.note.saving = true;
                        self.userService.saveNote(self.note).then(function (resp) {
                            console.log('saving note...');
                            self.note.saving = false;
                            var data = resp.data;
                            if (data.id) {
                                self.lastSaved = moment().unix();
                                self.note.id = data.id;
                                self.note.modified_at = data.modified_at;
                            } else {
                                self.alertService.danger('<strong>Sorry!</strong> your notes are not being saved.');
                                console.log('no save');
                            }
                        });
                    }

                } else {
                    console.log('no changes mades since last save');
                }
            },
            5000);
    };
    App.service('noteService', NoteService);
})();
(function () {

    var NotesCtrl = function (userService, bibleService, $scope,
                              $state, note, $q, $scope, noteService,
                              alertService, APP_CONSTANTS) {
        var self = this;
        self.userService = userService;
        self.bibleService = bibleService;
        self.alertService = alertService;
        self.q_ = $q;
        self.note = note;
        self.scope_ = $scope;
        self.noteService = noteService;
        self.APP_CONSTANTS = APP_CONSTANTS;
        self.userConfig = userService.getConfig();
        if ($state.current.name == 'base.notes') {
            self.page = 1;
            self.getNotes();
        }
        if ($state.current.name == 'base.new-note') {
            self.note.scriptures = [];

            self.saveNote();
            /**
             * If user is creating note for the first time, we
             * show a tip so they know that notes are saved automatically
             */
            if (!self.userConfig[self.APP_CONSTANTS.TIP_NOTE_AUTO_SAVE]) {
                swal({
                    title: "<strong>Quick Tip!</strong>",
                    text: "Your notes are saved automatically as you type.",
                    type: "info",
                    html: true,
                    confirmButtonText: 'Got it!'
                }, function () {
                    self.userConfig[self.APP_CONSTANTS.TIP_NOTE_AUTO_SAVE] = true;
                    self.userService.saveConfig(self.userConfig);
                });
            }

        }
    };
    NotesCtrl.$inject = ["userService", "bibleService", "$scope", "$state", "note", "$q", "$scope", "noteService", "alertService", "APP_CONSTANTS"];

    /**
     * Save user's notes
     */
    NotesCtrl.prototype.saveNote = function () {

        var self = this;
        self.noteService.startSaving(self.scope_, self.note, function (note) {
            if (_.isEmpty(note.notes)) return false;
            if (_.isEmpty(self.note.title)) {
                console.log('no title');
                self.missingTitle = true;
                return false
            } else {
                self.missingTitle = false;
                return true;
            }
        });
    };

    /**
     * Called when user selects a sermon from the auto suggest, we set the sermon title, pastor and church.
     * @param sermon
     * @param model
     */
    NotesCtrl.prototype.sermonSelect = function (sermon, model) {
        var self = this;
        self.note.sermon = sermon;
        self.note.title = sermon.title;
        self.note.pastor = sermon.pastor.title + ' ' + sermon.pastor.first_name + ' ' + sermon.pastor.last_name;
        self.note.church = sermon.church.name;
    };

    /**
     * Called when the user selects a pastor from the auto suggest list, we set the pastor id.
     * @param pastor
     */
    NotesCtrl.prototype.pastorSelect = function (pastor) {
        var self = this;
        self.note.pastor_id = pastor.id;
    };

    /**
     * Called when the user selects a church from the auto suggest list, we set the church id
     * @param church
     */
    NotesCtrl.prototype.churchSelect = function (church) {
        var self = this;
        self.note.church_id = church.id;
    };

    /**
     * Called as user types to find suggested churches
     * @param value
     * @returns {*}
     */
    NotesCtrl.prototype.findChurch = function (value) {
        return this.bibleService.suggestChurch(value);
    };

    /**
     * Called as user types to find suggested pastors
     * @param value
     * @returns {*}
     */
    NotesCtrl.prototype.findPastor = function (value) {
        if (value && value.length > 2) {
            var self = this;
            var deferred = self.q_.defer();
            self.userService.findUser(value, 'pastor').then(function (resp) {
                deferred.resolve(resp.data);
            });
            return deferred.promise;
        }
        return [];
    };

    /**
     * Called as user types to find suggested sermons
     * @param value
     * @returns {*}
     */
    NotesCtrl.prototype.findSermon = function (value) {
        if (value && value.length > 2) {
            var self = this;
            var deferred = self.q_.defer();
            self.bibleService.findSermon(value).then(function (resp) {
                var res = resp.data;
                res = res.map(function (s) {
                    s.label = [s.title, '<br> by', s.pastor.title, s.pastor.first_name, s.pastor.last_name.substr(0, 1) + '.',
                        '<br>(' + s.church.name + ')'].join(' ');
                    return s;
                });
                deferred.resolve(resp.data);
            });
            return deferred.promise;
        }
        return [];

    };

    /**
     * Gets all saved notes for current user
     */
    NotesCtrl.prototype.getNotes = function () {
        var self = this;
        self.promise = self.userService.getNotes();
        self.promise.then(function (resp) {
            self.notes = resp.data;
            self.notes.page = self.page;
            //console.log(self.notes);
        })
    };

    /**
     * Called before accepting the scripture text entered by the user, we validate that the text is a valid
     * scripture that we can parse, otherwise the input is rejected
     * @param chip
     * @returns {null}
     */
    NotesCtrl.prototype.onScriptureAdd = function (chip) {
        var self = this;
        if (_.isEmpty(self.bibleService.parseScripture(chip))) {
            return null;
        }
    };

    App.controller('notesController', NotesCtrl);
})();
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
    MainCtrl.$inject = ["$timeout", "$state", "$scope", "userService", "authService", "$uibModal", "$stateParams", "bibleService", "alertService"];

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
        self.authService.facebookLogin(function (user) {
            if (user.signup) {
                self.state_.go('base.post-signup-profile');
            }
        }, function () {
            self.alertService.danger('Login with facebook failed. Please try again.')
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




(function () {

    var SermonController = function ($state, authService, userService, bibleService, alertService, util, $scope,
                                     sermon, $stateParams, $mdDialog, $uibModal) {
        var self = this;
        self.state_ = $state;
        self.scope_ = $scope;
        self.modal_ = $uibModal;
        self.dialog_ = $mdDialog;
        self.authService = authService;
        self.userService = userService;
        self.bibleService = bibleService;
        self.alertService = alertService;
        self.util = util;


        self.user = authService.user;

        //console.log(self.user);
        self.errors = {};
        self.noteStyle = 'point';
        self.privacy = [
            {
                key: 'Public',
                value: 'Everyone',
                info: 'Anyone on ScripturedIn'
            },
            {
                key: 'Members',
                value: 'Church Members',
                info: 'Only my church members'
            }
        ];

        if ($state.current.name == 'base.sermon-browse') {
            self.page = 1;
            self.church = self.user.church;
            self.getSermonByChurch();
            //Create and add Action button with dropdown in Calendar header.
            self.month = 'month';
            if (window.screen.width > 700) {
                self.layout = 'calendar';
                self.switchTo = 'Table';
            } else {
                self.layout = 'table';
                self.switchTo = 'Calendar';
            }

            self.actionMenu = '<ul class="actions actions-alt" id="fc-actions">' +
                '<li class="dropdown" dropdown>' +
                '<a href="" dropdown-toggle><i class="zmdi zmdi-more-vert"></i></a>' +
                '<ul class="dropdown-menu dropdown-menu-right">' +
                '<li class="active">' +
                '<a ng-click="sermonCtrl.switchView()" href="">Switch to Table View</a>' +
                '</li>' +
                '</ul>' +
                '</div>' +
                '</li>';

            self.onEventSelect = function (calEvent, jsEvent, view) {
                $state.go('base.sermon-view', {id: calEvent.id});
            };

            //Open new event modal on selecting a day
            self.onSelect = function (start, end) {
                if (!self.user.is_pastor) return;
                $state.go('base.sermon-create', {date: moment(end).unix()});
            };
        }

        self.date_ = $stateParams.date ? moment.unix($stateParams.date).toDate() : new Date();
        self.date_.setHours(0);
        self.date_.setMinutes(0);

        self.sermon = (!_.isEmpty(sermon)) ? sermon : {
            scriptures: [],
            _dates: [{'date': self.date_}],
            title: '',
            notes: [{content: ''}],
            questions: [{content: ''}],
            privacy: 'Public'
        };

        if ($state.current.name == 'base.sermon-view') {
            //list of comments
            self.sermonComments = [];
            //holder for new comment
            self.sermonComment = {
                user_key: self.user.id,
                comment: ''
            };
            $state.current.data.pageTitle = self.sermon.title;
            self.sermon.scriptures = [];
            self.sermon.scripture.forEach(function (s) {
                self.sermon.scriptures.push(self.bibleService.scriptureToText(s));
            });
            self.sermonNote = {
                user_key: self.user.id,
                sermon_key: self.sermon.id,
                notes: ''
            };

            self.getUserSermonNote();
            self.getSermonComments();
        }
    };
    SermonController.$inject = ["$state", "authService", "userService", "bibleService", "alertService", "util", "$scope", "sermon", "$stateParams", "$mdDialog", "$uibModal"];

    SermonController.prototype.likeSermon = function () {
        this.userService.likeSermon(this.user, this.sermon);
    };
    SermonController.prototype.sermonsCallback_ = function (data) {
        var self = this;
        var sermons = [];
        data.sermons.forEach(function (sermon) {
            sermon.date.forEach(function (period) {
                var sermon_event = angular.copy(sermon);
                sermon_event.start = self.util.toLocalDate(period);
                sermon_event.className = (sermon.cal_color != null) ? sermon.cal_color : 'bgm-cyan';
                sermons.push(sermon_event);
            });
        });
        data.sermons = sermons;
        self.sermons = data;
        console.log(self.sermons);
    };
    SermonController.prototype.getSermonByPastor = function () {
        var self = this;
        if (_.isEmpty(self.pastor_key)) return;
        var cursor = null;
        if (self.sermons && self.sermons.next) {
            cursor = self.sermons.next;
        }
        self.promise = self.bibleService.getPastorSermons(self.pastor_key, cursor).then(function (resp) {
            self.sermonsCallback_(resp.data);
        });

    };
    SermonController.prototype.getSermonByChurch = function () {
        var self = this;
        self.church_key = (_.isEmpty(self.church_key)) ? self.user.church_key : self.church_key;

        if (self.church_key) {
            var cursor = null;
            if (self.sermons && self.sermons.next) {
                cursor = self.sermons.next;
            }
            self.promise = self.bibleService.getChurchSermons(self.church_key, cursor).then(function (resp) {
                self.sermonsCallback_(resp.data);
            });
        } else {
            //user needs to set church
        }
    };
    /**
     * Switch sermon view to table or calendar
     */
    SermonController.prototype.switchView = function (type) {
        var self = this;
        switch (type) {
            case 'calendar':
                self.layout = 'calendar';
                self.switchTo = 'Table';
                break;
            case 'table':
                self.layout = 'table';
                self.switchTo = 'Calendar';
                break;
            default:
                self.layout = (self.layout == 'calendar') ? 'table' : 'calendar';
                self.switchTo = (self.switchTo == 'Table') ? 'Calendar' : 'Table';
        }
    };


    /**
     * Save sermon
     */
    SermonController.prototype.save = function () {
        var self = this;
        self.submitted = true;
        if (self.validateSermon()) {
            self.self.bibleService.saveSermon(self.sermon).then(function (resp) {
                resp = resp.data;
                if (resp.id) {
                    self.alertService.info('Sermon saved');
                    //map scripture object to string
                    resp.scriptures = resp.scripture.map(function (s) {
                        var tmp = s.book + ' ' + s.chapter;
                        if (!_.isEmpty(s.verses)) {
                            tmp += ':' + s.verses.join(',');
                        }
                        return tmp;
                    });
                    //map the date ms to date objects
                    resp._dates = resp.date.map(function (d) {
                        return {date: self.util.toLocalDate(d)};
                    });
                    if (_.isEmpty(resp.questions)) {
                        resp.questions = [{content: ''}];
                    }
                    self.sermon = resp;
                    self.util.log(self.sermon);

                } else if (resp.status == 'error') {
                    self.alertService.danger(resp.message.join('<br>'));
                }

            });
        } else {
            self.alertService.info('Some required fields are missing');
        }
    };

    /**
     * Publish a sermon so it's available to users
     */
    SermonController.prototype.publish = function () {
        var self = this;
        self.submitted = true;
        var colors = [
            'bgm-teal',
            'bgm-red',
            'bgm-pink',
            'bgm-blue',
            'bgm-lime',
            'bgm-green',
            'bgm-cyan',
            'bgm-orange',
            'bgm-purple',
            'bgm-gray',
            'bgm-black'
        ];

        //console.log(self.sermon);
        if (self.validateSermon()) {
            self.sermon.cal_color = _.sample(colors);
            self.bibleService.publishSermon(self.sermon).then(function (resp) {
                resp = resp.data;
                if (resp.id) {
                    swal({
                        title: resp.title + ' has been published.',
                        text: 'Do you want to create another sermon?',
                        type: 'success',
                        showCancelButton: true,
                        cancelButtonText: 'Yes!',
                        confirmButtonColor: '#DD6B55',
                        confirmButtonText: 'No, go to calender!',
                        closeOnConfirm: true
                    }, function (goToCalendar) {
                        if (!goToCalendar) {
                            self.submitted = false;
                            self.sermon = {
                                scriptures: [],
                                _dates: [{'date': self.date_}],
                                title: '',
                                notes: [{content: ''}],
                                questions: [{content: ''}]
                            };
                        } else {
                            self.state_.go('base.sermon-browse')
                        }
                    });

                } else if (resp.status == 'error') {
                    self.alertService.danger(resp.message.join('<br>'));
                }

            });

        }
    };


    SermonController.prototype.addDate = function () {
        var self = this;
        var d = angular.copy(self.date_);
        d.setHours(0);
        d.setMinutes(0);
        self.sermon._dates.push({date: d});
    };

    /**
     * Get comments for the current sermon
     */
    SermonController.prototype.getSermonComments = function () {
        var self = this;
        self.loadingComments = true;
        self.bibleService.getComments(self.sermon.id, 'Sermon').then(function (resp) {
            self.loadingComments = false;
            self.sermonComments = resp.data;
        });
    };


    /**
     * Post a reply to a comment
     * @param c
     */
    SermonController.prototype.postReply = function (c) {
        var self = this;
        var data = {
            comment: c.reply,
            reply_to: c.id
        };
        self.userService.postComment(data, self.sermon.id, 'Sermon').then(function (resp) {
                if (resp.data.id) {
                    c.replies.comments.unshift(resp.data);
                    c.reply = '';
                    c.replies_key.push(resp.data.id);
                    c.reply_count++;
                } else {
                    self.alertService.danger('Failed to post comment, please try again');
                }
            }
        )
    };

    /**
     * Post sermon comment
     */
    SermonController.prototype.postComment = function () {
        var self = this;
        if (!_.isEmpty(self.sermonComment.comment)) {
            self.userService.postComment(self.sermonComment, self.sermon.id, 'Sermon').then(function (resp) {
                    //console.log(resp.data);
                    if (resp.data.id) {
                        self.sermonComments.comments.unshift(resp.data);
                        self.sermonComment.comment = '';
                        self.sermon.comment_count++;
                    } else {
                        self.alertService.danger('Failed to post comment, please try again');
                    }
                }
            )
        }

    };

    /**
     * Function gets called when a new scripture is added. The scripture text is parsed and null is returned
     * if the text isn't a valid scripture to avoid adding it.
     * @param chip
     * @returns {null}
     */
    SermonController.prototype.onScriptureAdd = function (chip) {
        var self = this;
        if (_.isEmpty((self.bibleService.parseScripture(chip)))) {
            return null;
        }
    };

    SermonController.prototype.validateSermon = function () {
        var self = this;
        if (!_.isEmpty(self.sermon.title) && self.sermon.scriptures.length > 0) {

            if (_.isEmpty(self.sermon.note) && _.isEmpty(self.sermon.notes[0].content)) {
                self.selectedTab = 1;
                return false;
            }
            //create scripture objects
            self.sermon.scripture = self.sermon.scriptures.map(function (s) {
                return self.bibleService.parseScripture(s);
            });
            //convert date object1s to utc millisecs
            self.sermon.date = self.sermon._dates.map(function (d) {
                return self.util.toUtcMilliseconds(d.date);
            });
            return true;
        }
        return false;
    };

    /**
     * get user's note for the sermon
     * setup watcher to save user note
     */
    SermonController.prototype.getUserSermonNote = function () {
        var self = this;
        var init = true;
        self.loadNote = true;
        self.userService.getSermonNote(self.user.id, self.sermon.id).then(function (resp) {
            resp = resp.data;
            self.loadNote = false;
            if (!_.isEmpty(resp)) {
                self.sermonNote = resp;
                self.sermonNote.user_key = self.sermonNote.created_by;
            }
            self.watchSermonNoteForUpdate(true)

        });
    };

    /**
     * Set up watcher for sermon note and save to sever on update
     */
    SermonController.prototype.watchSermonNoteForUpdate = function () {
        var self = this;
        self.savingNote = false;
        self.scope_.$watch('sermonCtrl.sermonNote.notes', function (n, o) {
            if (o != n) {
                self.savingNote = true;
                self.userService.saveSermonNote(self.sermonNote).then(function (resp) {
                    self.savingNote = false;
                    if (resp.data.id) {
                        self.sermonNote.id = resp.data.id;
                        self.sermonNote.user_id = resp.data.created_by;
                        self.sermonNote.sermon_id = resp.data.sermon_key;
                        self.sermonNote.modified_at = resp.data.modified_at;
                    }
                    //console.log(self.sermonNote);
                });
            }
        });
    };


    App.controller('sermonController', SermonController);

})
();


(function () {

    var ReadCtrl = function ($location, bibleService, $scope,
                             $mdDialog, userService) {

        var self = this;
        self.location_ = $location;
        self.bibleService = bibleService;
        self.scope_ = $scope;
        self.mdDialog = $mdDialog;
        self.userService = userService;


        self.versions = bibleService.versions();

        self.processParams();
        $scope.$on('$locationChangeSuccess', function (e) {
            self.processParams();
        });


        self.selected = {};

    };
    ReadCtrl.$inject = ["$location", "bibleService", "$scope", "$mdDialog", "userService"];

    ReadCtrl.prototype.processParams = function () {
        var self = this;
        var query = self.location_.search();
        if (query.p) {
            self.scripture = query.p;
        }

    };

    /**
     * Highlight or unhighlight selected row
     * @param verse
     * @param book
     */
    ReadCtrl.prototype.highlight = function (verse, book) {
        var self = this;
        if (!(book in self.selected)) {
            self.selected[book] = {};
        }
        self.selected[book][verse] = !self.selected[book][verse];
    };

    App.controller('readController', ReadCtrl);
})();
(function () {
    var HeaderController = function ($location, bibleService, alertService) {
        var self = this;
        self.location_ = $location;
        self.bibleService = bibleService;
        self.alertService = alertService;
    };
    HeaderController.$inject = ["$location", "bibleService", "alertService"];
    HeaderController.prototype.onSearchKeyPress = function (e) {
        var self = this;
        if (e && e.keyCode == 13) {
            var s = self.bibleService.parseScripture(self.searchTerm);
            if(!_.isEmpty(s)) {
                window.location = '#/read?p=' + self.searchTerm;
            } else {
                self.alertService.info('Please provide a valid bible reference e.g john 3, acts 4:1-5')
            }

        }
    };
    App.controller('headerController', HeaderController);
})();


App.service('alertService', ["$mdToast", function ($mdToast) {
    var self = this;
    var _config = {
        delay: 4000,
        type: 'info'
    };
    self.info = function (message, config) {
        var c = _.merge(_config, config);
        c.type = 'info';
        if (_.isArray(message)) {
            message = message.join('<br>');
        }
        self.notify(message, c);
    };
    self.danger = function (message, config) {
        var c = _.merge(_config, config);
        c.type = 'danger';
        c.delay = 20000;
        if (_.isArray(message)) {
            message = message.join('<br>');
        }
        self.notify(message, c)
    };
    self.notify = function (message, config) {
        $.notifyClose();
        $.notify({
            message: message
        }, {
            // settings
            offset: {
                x: 20,
                y: 100
            },
            type: config.type,
            delay: config.delay
        });

    }
}]);
(function () {
    var AuthService = function ($http, $state, $q, USER_ROLES, localStorageService, alertService) {
        var self = this;
        self.user = {};
        self.http_ = $http;
        self.state_ = $state;
        self.q_ = $q;
        self.USER_ROLES = USER_ROLES;
        self.localStorageService = localStorageService;
        self.alertService = alertService;
    };
    AuthService.$inject = ["$http", "$state", "$q", "USER_ROLES", "localStorageService", "alertService"];


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
        return self.http_.get('/api/user').then(function (resp) {
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
        self.http_.post('/api/logout').then(function (resp) {
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
            FB.getLoginStatus(function (response) {
                if (response.status == 'connected') {

                    FB.api('/me?fields=email,first_name,last_name,picture', function (user) {
                        user.access_token = response.authResponse.accessToken;
                        user.auth = 'facebook';
                        deferred.resolve(user);
                    })
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
        if (typeof FB !== 'undefined') {
            FB.login(function (response) {
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
                        errorCallback()
                    }
                }
            }, {scope: 'public_profile,email'});
        } else {
            console.error('FB SDK missing..')
        }
    };

    /**
     * Create new user with using email credentials
     * @param {Object} data,
     * @param {string} action,
     */
    AuthService.prototype.signup = function (data, successCallback, errorCallback) {
        var self = this;
        self.http_.post('/api/signup', data).then(function (resp) {
            if (resp.data.id) {
                var user = resp.data;
                self.createSession(user);
                if (_.isFunction(successCallback)) {
                    successCallback(user);
                } else {
                    if (!user.church_key) {
                        self.state_.go('base.post-signup-profile');
                    } else {
                        self.state_.go('base.home');
                    }
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
        self.http_.post('/api/login', data).then(function (resp) {
            if (resp.data.id) {
                var user = resp.data;
                self.createSession(user);
                if (_.isFunction(successCallback)) {
                    successCallback(user);
                } else {
                    self.state_.go('base.home');
                }
            } else {
                if (_.isFunction(errorCallback)) {
                    errorCallback(resp.data.message);
                } else {
                    self.alertService.danger('Unsuccessful login attempt. Please try again.')
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

    App.service('authService', AuthService);
})();


/**
 * Created by ebby on 12/28/2015.
 */
App.factory('bibleData', function () {


    var books = {
        "Gen": {
            "name": {
                "eng": "Genesis"
            },
            "names": {
                "eng": [
                    "Genesis",
                    "Ge",
                    "Gen"
                ]
            }
        },
        "Exod": {
            "name": {
                "eng": "Exodus"
            },
            "names": {
                "eng": [
                    "Exodus",
                    "Ex",
                    "Exo"
                ]
            }
        },
        "Lev": {
            "name": {
                "eng": "Leviticus"
            },
            "names": {
                "eng": [
                    "Leviticus",
                    "Le",
                    "Lev"
                ]
            }
        },
        "Num": {
            "name": {
                "eng": "Numbers"
            },
            "names": {
                "eng": [
                    "Numbers",
                    "Nu",
                    "Num"
                ]
            }
        },
        "Deut": {
            "name": {
                "eng": "Deuteronomy"
            },
            "names": {
                "eng": [
                    "Deuteronomy",
                    "Dt",
                    "Deut",
                    "Deu",
                    "De"
                ]
            }
        },
        "Josh": {
            "name": {
                "eng": "Joshua"
            },
            "names": {
                "eng": [
                    "Joshua",
                    "Js",
                    "Jos",
                    "Jos",
                    "Josh"
                ]
            }
        },
        "Judg": {
            "name": {
                "eng": "Judges"
            },
            "names": {
                "eng": [
                    "Judges",
                    "Jg",
                    "Jdg",
                    "Jdgs"
                ]
            }
        },
        "Ruth": {
            "name": {
                "eng": "Ruth"
            },
            "names": {
                "eng": [
                    "Ruth",
                    "Ru",
                    "Rut"
                ]
            }
        },
        "1Sam": {
            "name": {
                "eng": "1 Samuel"
            },
            "names": {
                "eng": [
                    "1 Samuel",
                    "1S",
                    "1 Sam",
                    "1Sam",
                    "1 Sa",
                    "1Sa",
                    "I Samuel",
                    "I Sam",
                    "I Sa"
                ]
            }
        },
        "2Sam": {
            "name": {
                "eng": "2 Samuel"
            },
            "names": {
                "eng": [
                    "2 Samuel",
                    "2S",
                    "2 Sam",
                    "2Sam",
                    "2 Sa",
                    "2Sa",
                    "II Samuel",
                    "II Sam",
                    "II Sa",
                    "IIS"
                ]
            }
        },
        "1Kgs": {
            "name": {
                "eng": "1 Kings"
            },
            "names": {
                "eng": [
                    "1 Kings",
                    "1K",
                    "1 Kin",
                    "1Kin",
                    "1 Ki",
                    "IK",
                    "1Ki",
                    "I Kings",
                    "I Kin",
                    "I Ki"
                ]
            }
        },
        "2Kgs": {
            "name": {
                "eng": "2 Kings"
            },
            "names": {
                "eng": [
                    "2 Kings",
                    "2K",
                    "2 Kin",
                    "2Kin",
                    "2 Ki",
                    "IIK",
                    "2Ki",
                    "II Kings",
                    "II Kin",
                    "II Ki"
                ]
            }
        },
        "1Chr": {
            "names": {
                "eng": [
                    "1 Chronicles",
                    "1Ch",
                    "1 Chr",
                    "1Chr",
                    "1 Ch",
                    "ICh",
                    "I Chronicles",
                    "I Chr",
                    "I Ch"
                ]
            },
            "name": {
                "eng": "1 Chronicles"
            }
        },
        "2Chr": {
            "names": {
                "eng": [
                    "2 Chronicles",
                    "2Ch",
                    "2 Chr",
                    "2 Chr",
                    "2Chr",
                    "2 Ch",
                    "IICh",
                    "II Chronicles",
                    "II Chr",
                    "II Ch"
                ]
            },
            "name": {
                "eng": "2 Chronicles"
            }
        },
        "Ezra": {
            "names": {
                "eng": [
                    "Ezra",
                    "Ezr"
                ]
            },
            "name": {
                "eng": "Ezra"
            }
        },
        "Neh": {
            "names": {
                "eng": [
                    "Nehemiah",
                    "Ne",
                    "Neh",
                    "Neh",
                    "Ne"
                ]
            },
            "name": {
                "eng": "Nehemiah"
            }
        },
        "Esth": {
            "names": {
                "eng": [
                    "Esther",
                    "Es",
                    "Est",
                    "Esth"
                ]
            },
            "name": {
                "eng": "Esther"
            }
        },
        "Job": {
            "names": {
                "eng": [
                    "Job",
                    "Jb",
                    "Job"
                ]
            },
            "name": {
                "eng": "Job"
            }
        },
        "Ps": {
            "names": {
                "eng": [
                    "Psalm",
                    "Ps",
                    "Psa"
                ]
            },
            "name": {
                "eng": "Psalm"
            }
        },
        "Prov": {
            "names": {
                "eng": [
                    "Proverbs",
                    "Pr",
                    "Prov",
                    "Pro"
                ]
            },
            "name": {
                "eng": "Proverbs"
            }
        },
        "Eccl": {
            "names": {
                "eng": [
                    "Ecclesiastes",
                    "Ec",
                    "Ecc",
                    "Qohelet"
                ]
            },
            "name": {
                "eng": "Ecclesiastes"
            }
        },
        "Song": {
            "names": {
                "eng": [
                    "Song of Songs",
                    "So",
                    "Sos",
                    "Song of Solomon",
                    "SOS",
                    "SongOfSongs",
                    "SongofSolomon",
                    "Canticle of Canticles"
                ]
            },
            "name": {
                "eng": "Song of Songs"
            }
        },
        "Isa": {
            "names": {
                "eng": [
                    "Isaiah",
                    "Is",
                    "Isa"
                ]
            },
            "name": {
                "eng": "Isaiah"
            }
        },
        "Jer": {
            "names": {
                "eng": [
                    "Jeremiah",
                    "Je",
                    "Jer"
                ]
            },
            "name": {
                "eng": "Jeremiah"
            }
        },
        "Lam": {
            "names": {
                "eng": [
                    "Lamentations",
                    "La",
                    "Lam",
                    "Lament"
                ]
            },
            "name": {
                "eng": "Lamentations"
            }
        },
        "Ezek": {
            "names": {
                "eng": [
                    "Ezekiel",
                    "Ek",
                    "Ezek",
                    "Eze"
                ]
            },
            "name": {
                "eng": "Ezekiel"
            }
        },
        "Dan": {
            "names": {
                "eng": [
                    "Daniel",
                    "Da",
                    "Dan",
                    "Dl",
                    "Dnl"
                ]
            },
            "name": {
                "eng": "Daniel"
            }
        },
        "Hos": {
            "names": {
                "eng": [
                    "Hosea",
                    "Ho",
                    "Hos"
                ]
            },
            "name": {
                "eng": "Hosea"
            }
        },
        "Joel": {
            "names": {
                "eng": [
                    "Joel",
                    "Jl",
                    "Joel",
                    "Joe"
                ]
            },
            "name": {
                "eng": "Joel"
            }
        },
        "Amos": {
            "names": {
                "eng": [
                    "Amos",
                    "Am",
                    "Amos",
                    "Amo"
                ]
            },
            "name": {
                "eng": "Amos"
            }
        },
        "Obad": {
            "names": {
                "eng": [
                    "Obadiah",
                    "Ob",
                    "Oba",
                    "Obd",
                    "Odbh"
                ]
            },
            "name": {
                "eng": "Obadiah"
            }
        },
        "Jonah": {
            "names": {
                "eng": [
                    "Jonah",
                    "Jh",
                    "Jon",
                    "Jnh"
                ]
            },
            "name": {
                "eng": "Jonah"
            }
        },
        "Mic": {
            "names": {
                "eng": [
                    "Micah",
                    "Mi",
                    "Mic"
                ]
            },
            "name": {
                "eng": "Micah"
            }
        },
        "Nah": {
            "names": {
                "eng": [
                    "Nahum",
                    "Na",
                    "Nah",
                    "Nah",
                    "Na"
                ]
            },
            "name": {
                "eng": "Nahum"
            }
        },
        "Hab": {
            "names": {
                "eng": [
                    "Habakkuk",
                    "Hb",
                    "Hab",
                    "Hk",
                    "Habk"
                ]
            },
            "name": {
                "eng": "Habakkuk"
            }
        },
        "Zeph": {
            "names": {
                "eng": [
                    "Zephaniah",
                    "Zp",
                    "Zep",
                    "Zeph"
                ]
            },
            "name": {
                "eng": "Zephaniah"
            }
        },
        "Hag": {
            "names": {
                "eng": [
                    "Haggai",
                    "Ha",
                    "Hag",
                    "Hagg"
                ]
            },
            "name": {
                "eng": "Haggai"
            }
        },
        "Zech": {
            "names": {
                "eng": [
                    "Zechariah",
                    "Zc",
                    "Zech",
                    "Zec"
                ]
            },
            "name": {
                "eng": "Zechariah"
            }
        },
        "Mal": {
            "names": {
                "eng": [
                    "Malachi",
                    "Ml",
                    "Mal",
                    "Mlc"
                ]
            },
            "name": {
                "eng": "Malachi"
            }
        },
        "Matt": {
            "names": {
                "eng": [
                    "Matthew",
                    "Mt",
                    "Matt",
                    "Mat"
                ]
            },
            "name": {
                "eng": "Matthew"
            }
        },
        "Mark": {
            "names": {
                "eng": [
                    "Mark",
                    "Mk",
                    "Mar",
                    "Mrk"
                ]
            },
            "name": {
                "eng": "Mark"
            }
        },
        "Luke": {
            "names": {
                "eng": [
                    "Luke",
                    "Lk",
                    "Luk",
                    "Lu"
                ]
            },
            "name": {
                "eng": "Luke"
            }
        },
        "John": {
            "names": {
                "eng": [
                    "John",
                    "Jn",
                    "Joh",
                    "Jo"
                ]
            },
            "name": {
                "eng": "John"
            }
        },
        "Acts": {
            "names": {
                "eng": [
                    "Acts",
                    "Ac",
                    "Act"
                ]
            },
            "name": {
                "eng": "Acts"
            }
        },
        "Rom": {
            "names": {
                "eng": [
                    "Romans",
                    "Ro",
                    "Rom",
                    "Rmn",
                    "Rmns"
                ]
            },
            "name": {
                "eng": "Romans"
            }
        },
        "1Cor": {
            "names": {
                "eng": [
                    "1 Corinthians",
                    "1Co",
                    "1 Cor",
                    "1Cor",
                    "ICo",
                    "1 Co",
                    "1Co",
                    "I Corinthians",
                    "I Cor",
                    "I Co"
                ]
            },
            "name": {
                "eng": "1 Corinthians"
            }
        },
        "2Cor": {
            "names": {
                "eng": [
                    "2 Corinthians",
                    "2Co",
                    "2 Cor",
                    "2Cor",
                    "IICo",
                    "2 Co",
                    "2Co",
                    "II Corinthians",
                    "II Cor",
                    "II Co"
                ]
            },
            "name": {
                "eng": "2 Corinthians"
            }
        },
        "Gal": {
            "names": {
                "eng": [
                    "Galatians",
                    "Ga",
                    "Gal",
                    "Gltns"
                ]
            },
            "name": {
                "eng": "Galatians"
            }
        },
        "Eph": {
            "names": {
                "eng": [
                    "Ephesians",
                    "Ep",
                    "Eph",
                    "Ephn"
                ]
            },
            "name": {
                "eng": "Ephesians"
            }
        },
        "Phil": {
            "names": {
                "eng": [
                    "Philippians",
                    "Pp",
                    "Phi",
                    "Phil",
                    "Phi"
                ]
            },
            "name": {
                "eng": "Philippians"
            }
        },
        "Col": {
            "names": {
                "eng": [
                    "Colossians",
                    "Co",
                    "Col",
                    "Colo",
                    "Cln",
                    "Clns"
                ]
            },
            "name": {
                "eng": "Colossians"
            }
        },
        "1Thess": {
            "names": {
                "eng": [
                    "1 Thessalonians",
                    "1Th",
                    "1 Thess",
                    "1Thess",
                    "ITh",
                    "1 Thes",
                    "1Thes",
                    "1 The",
                    "1The",
                    "1 Th",
                    "1Th",
                    "I Thessalonians",
                    "I Thess",
                    "I The",
                    "I Th"
                ]
            },
            "name": {
                "eng": "1 Thessalonians"
            }
        },
        "2Thess": {
            "names": {
                "eng": [
                    "2 Thessalonians",
                    "2Th",
                    "2 Thess",
                    "2 Thess",
                    "2Thess",
                    "IITh",
                    "2 Thes",
                    "2Thes",
                    "2 The",
                    "2The",
                    "2 Th",
                    "2Th",
                    "II Thessalonians",
                    "II Thess",
                    "II The",
                    "II Th"
                ]
            },
            "name": {
                "eng": "2 Thessalonians"
            }
        },
        "1Tim": {
            "names": {
                "eng": [
                    "1 Timothy",
                    "1Ti",
                    "1 Tim",
                    "1Tim",
                    "1 Ti",
                    "ITi",
                    "1Ti",
                    "I Timothy",
                    "I Tim",
                    "I Ti"
                ]
            },
            "name": {
                "eng": "1 Timothy"
            }
        },
        "2Tim": {
            "names": {
                "eng": [
                    "2 Timothy",
                    "2Ti",
                    "2 Tim",
                    "2 Tim",
                    "2Tim",
                    "2 Ti",
                    "IITi",
                    "2Ti",
                    "II Timothy",
                    "II Tim",
                    "II Ti"
                ]
            },
            "name": {
                "eng": "2 Timothy"
            }
        },
        "Titus": {
            "names": {
                "eng": [
                    "Titus",
                    "Ti",
                    "Tit",
                    "Tt",
                    "Ts"
                ]
            },
            "name": {
                "eng": "Titus"
            }
        },
        "Phlm": {
            "names": {
                "eng": [
                    "Philemon",
                    "Pm",
                    "Phile",
                    "Phile",
                    "Philm",
                    "Pm"
                ]
            },
            "name": {
                "eng": "Philemon"
            }
        },
        "Heb": {
            "names": {
                "eng": [
                    "Hebrews",
                    "He",
                    "Heb",
                    "Hw"
                ]
            },
            "name": {
                "eng": "Hebrews"
            }
        },
        "Jas": {
            "names": {
                "eng": [
                    "James",
                    "Jm",
                    "Jam",
                    "Jas",
                    "Ja"
                ]
            },
            "name": {
                "eng": "James"
            }
        },
        "1Pet": {
            "names": {
                "eng": [
                    "1 Peter",
                    "1P",
                    "1 Pet",
                    "1Pet",
                    "IPe",
                    "1P",
                    "I Peter",
                    "I Pet",
                    "I Pe"
                ]
            },
            "name": {
                "eng": "1 Peter"
            }
        },
        "2Pet": {
            "names": {
                "eng": [
                    "2 Peter",
                    "2P",
                    "2 Pet",
                    "2Pet",
                    "2Pe",
                    "IIP",
                    "II Peter",
                    "II Pet",
                    "II Pe"
                ]
            },
            "name": {
                "eng": "2 Peter"
            }
        },
        "1John": {
            "names": {
                "eng": [
                    "1 John",
                    "1J",
                    "1 Jn",
                    "1Jn",
                    "1 Jo",
                    "IJo",
                    "I John",
                    "I Jo",
                    "I Jn"
                ]
            },
            "name": {
                "eng": "1 John"
            }
        },
        "2John": {
            "names": {
                "eng": [
                    "2 John",
                    "2J",
                    "2 Jn",
                    "2Jn",
                    "2 Jo",
                    "IIJo",
                    "II John",
                    "II Jo",
                    "II Jn"
                ]
            },
            "name": {
                "eng": "2 John"
            }
        },
        "3John": {
            "names": {
                "eng": [
                    "3 John",
                    "3J",
                    "3 Jn",
                    "3 Jn",
                    "3Jn",
                    "3 Jo",
                    "IIIJo",
                    "III John",
                    "III Jo",
                    "III Jn"
                ]
            },
            "name": {
                "eng": "3 John"
            }
        },
        "Jude": {
            "names": {
                "eng": [
                    "Jude",
                    "Jude",
                    "Jude"
                ]
            },
            "name": {
                "eng": "Jude"
            }
        },
        "Rev": {
            "names": {
                "eng": [
                    "Revelation",
                    "Re",
                    "Rev",
                    "Rvltn"
                ]
            },
            "name": {
                "eng": "Revelation"
            }
        }
    };
    return {
        'books': books
    };

});

(function () {

    var BibleService = function ($http, util, $q, $uibModal) {
        var BASE_URL = 'https://getbible.net/json?';
        var self = this;
        self.modal_ = $uibModal;
        self.http_ = $http;
        self.util = util;
        self.q_ = $q;
    };
    BibleService.$inject = ["$http", "util", "$q", "$uibModal"];

    BibleService.prototype.validateBook_ = function (book) {
        var re = /^(jeremiah|je|jer|psalm|ps|psa|matthew|mt|matt|mat|obadiah|ob|oba|obad|obd|odbh|philemon|pm|phile|phile|philm|phm|phlm|pm|nehemiah|ne|neh|neh|ne|ezekiel|ek|ezek|eze|ezk|proverbs|pr|prov|pro|1\s?samuel|1s|1\s?sam|1sam|1\s?sa|1sa|i\s?samuel|i\s?sam|i\s?sa|acts|ac|act|joshua|js|jos|jos|josh|james|jm|jam|jas|ja|haggai|ha|hag|hagg|hosea|ho|hos|hebrews|he|heb|hw|deuteronomy|dt|deut|deu|de|ruth|ru|rut|titus|ti|tit|tt|ts|lamentations|la|lam|lament|2\s?samuel|2s|2\s?sam|2sam|2\s?sa|2sa|ii\s?samuel|ii\s?sam|ii\s?sa|iis|2\s?timothy|2ti|2\s?tim|2\s?tim|2tim|2\s?ti|iiti|2ti|ii\s?timothy|ii\s?tim|ii\s?ti|2\s?corinthians|2co|2\s?cor|2cor|iico|2\s?co|2co|ii\s?corinthians|ii\s?cor|ii\s?co|song\s?of\s?songs|so|sos|sng|song|song\s?of\s?solomon|sos|songofsongs|songofsolomon|canticle\s?of\s?canticles|luke|lk|luk|lu|daniel|da|dan|dl|dnl|1\s?corinthians|1co|1\s?cor|1cor|ico|1\s?co|1co|i\s?corinthians|i\s?cor|i\s?co|jonah|jh|jon|jnh|galatians|ga|gal|gltns|job|jb|job|2\s?chronicles|2ch|2\s?chr|2\s?chr|2chr|2\s?ch|iich|ii\s?chronicles|ii\s?chr|ii\s?ch|3\s?john|3j|3\s?jn|3\s?jn|3jn|3\s?jo|iiijo|iii\s?john|iii\s?jo|iii\s?jn|leviticus|le|lev|1\s?peter|1p|1\s?pet|1pet|1pe|ipe|1p|i\s?peter|i\s?pet|i\s?pe|1\s?kings|1k|1\s?kgs|1kgs|1\s?kin|1kin|1\s?ki|ik|1ki|i\s?kings|i\s?kin|i\s?ki|2\s?thessalonians|2th|2\s?thess|2\s?thess|2thess|iith|2\s?thes|2thes|2\s?the|2the|2\s?th|2th|ii\s?thessalonians|ii\s?thess|ii\s?the|ii\s?th|genesis|ge|gen|exodus|ex|exo|colossians|co|col|colo|cln|clns|1\s?john|1j|1\s?jn|1jn|1\s?jo|ijo|i\s?john|i\s?jo|i\s?jn|revelation|re|rev|rvltn|joel|jl|joel|joe|jol|philippians|pp|phi|phil|phi|php|judges|jg|judg|jdg|jdgs|1\s?timothy|1ti|1\s?tim|1tim|1\s?ti|iti|1ti|i\s?timothy|i\s?tim|i\s?ti|jude|jude|jude|2\s?john|2j|2\s?jn|2jn|2\s?jo|iijo|ii\s?john|ii\s?jo|ii\s?jn|micah|mi|mic|habakkuk|hb|hab|hk|habk|john|jn|joh|jo|ephesians|ep|eph|ephn|amos|am|amos|amo|isaiah|is|isa|mark|mk|mar|mrk|ecclesiastes|ec|ecc|qohelet|nahum|na|nah|nah|na|ezra|ezr|romans|ro|rom|rmn|rmns|2\s?kings|2k|2\s?kgs|2kgs|2\s?kin|2kin|2\s?ki|iik|2ki|ii\s?kings|ii\s?kin|ii\s?ki|2\s?peter|2p|2\s?pet|2pet|2pe|iip|ii\s?peter|ii\s?pet|ii\s?pe|esther|es|est|esth|malachi|ml|mal|mlc|numbers|nu|num|zechariah|zc|zech|zec|1\s?thessalonians|1th|1\s?thess|1thess|ith|1\s?thes|1thes|1\s?the|1the|1\s?th|1th|i\s?thessalonians|i\s?thess|i\s?the|i\s?th|1\s?chronicles|1ch|1\s?chr|1chr|1\s?ch|ich|i\s?chronicles|i\s?chr|i\s?ch|zephaniah|zp|zep|zeph)$/;
        var m;

        if ((m = re.exec(book)) !== null) {
            if (m.index === re.lastIndex) {
                re.lastIndex++;
            }
            return m.length > 1;
        }
        return false;
    };

    /**
     * Parse out parts of a scripture string and return an object with the appropriate info
     * e.g John 3:16 => {book: 'John', chapter:3, verses:['16']
     * @param text
     * @returns {{book: string, chapter: number, verses: Array}}
     */
    BibleService.prototype.parseScripture = function scrip(text) {
        var self = this;
        var re = /(jeremiah|je|jer|psalm|ps|psa|matthew|mt|matt|mat|obadiah|ob|oba|obad|obd|odbh|philemon|pm|phile|phile|philm|phm|phlm|pm|nehemiah|ne|neh|neh|ne|ezekiel|ek|ezek|eze|ezk|proverbs|pr|prov|pro|1\s?samuel|1s|1\s?sam|1sam|1\s?sa|1sa|i\s?samuel|i\s?sam|i\s?sa|acts|ac|act|joshua|js|jos|jos|josh|james|jm|jam|jas|ja|haggai|ha|hag|hagg|hosea|ho|hos|hebrews|he|heb|hw|deuteronomy|dt|deut|deu|de|ruth|ru|rut|titus|ti|tit|tt|ts|lamentations|la|lam|lament|2\s?samuel|2s|2\s?sam|2sam|2\s?sa|2sa|ii\s?samuel|ii\s?sam|ii\s?sa|iis|2\s?timothy|2ti|2\s?tim|2\s?tim|2tim|2\s?ti|iiti|2ti|ii\s?timothy|ii\s?tim|ii\s?ti|2\s?corinthians|2co|2\s?cor|2cor|iico|2\s?co|2co|ii\s?corinthians|ii\s?cor|ii\s?co|song\s?of\s?songs|so|sos|sng|song|song\s?of\s?solomon|sos|songofsongs|songofsolomon|canticle\s?of\s?canticles|luke|lk|luk|lu|daniel|da|dan|dl|dnl|1\s?corinthians|1co|1\s?cor|1cor|ico|1\s?co|1co|i\s?corinthians|i\s?cor|i\s?co|jonah|jh|jon|jnh|galatians|ga|gal|gltns|job|jb|job|2\s?chronicles|2ch|2\s?chr|2\s?chr|2chr|2\s?ch|iich|ii\s?chronicles|ii\s?chr|ii\s?ch|3\s?john|3j|3\s?jn|3\s?jn|3jn|3\s?jo|iiijo|iii\s?john|iii\s?jo|iii\s?jn|leviticus|le|lev|1\s?peter|1p|1\s?pet|1pet|1pe|ipe|1p|i\s?peter|i\s?pet|i\s?pe|1\s?kings|1k|1\s?kgs|1kgs|1\s?kin|1kin|1\s?ki|ik|1ki|i\s?kings|i\s?kin|i\s?ki|2\s?thessalonians|2th|2\s?thess|2\s?thess|2thess|iith|2\s?thes|2thes|2\s?the|2the|2\s?th|2th|ii\s?thessalonians|ii\s?thess|ii\s?the|ii\s?th|genesis|ge|gen|exodus|ex|exo|colossians|co|col|colo|cln|clns|1\s?john|1j|1\s?jn|1jn|1\s?jo|ijo|i\s?john|i\s?jo|i\s?jn|revelation|re|rev|rvltn|joel|jl|joel|joe|jol|philippians|pp|phi|phil|phi|php|judges|jg|judg|jdg|jdgs|1\s?timothy|1ti|1\s?tim|1tim|1\s?ti|iti|1ti|i\s?timothy|i\s?tim|i\s?ti|jude|jude|jude|2\s?john|2j|2\s?jn|2jn|2\s?jo|iijo|ii\s?john|ii\s?jo|ii\s?jn|micah|mi|mic|habakkuk|hb|hab|hk|habk|john|jn|joh|jo|ephesians|ep|eph|ephn|amos|am|amos|amo|isaiah|is|isa|mark|mk|mar|mrk|ecclesiastes|ec|ecc|qohelet|nahum|na|nah|nah|na|ezra|ezr|romans|ro|rom|rmn|rmns|2\s?kings|2k|2\s?kgs|2kgs|2\s?kin|2kin|2\s?ki|iik|2ki|ii\s?kings|ii\s?kin|ii\s?ki|2\s?peter|2p|2\s?pet|2pet|2pe|iip|ii\s?peter|ii\s?pet|ii\s?pe|esther|es|est|esth|malachi|ml|mal|mlc|numbers|nu|num|zechariah|zc|zech|zec|1\s?thessalonians|1th|1\s?thess|1thess|ith|1\s?thes|1thes|1\s?the|1the|1\s?th|1th|i\s?thessalonians|i\s?thess|i\s?the|i\s?th|1\s?chronicles|1ch|1\s?chr|1chr|1\s?ch|ich|i\s?chronicles|i\s?chr|i\s?ch|zephaniah|zp|zep|zeph)\.?\s?(\d+):?((?=\d+),?\d+\-\d+|\d+)?/gi;
        var m;
        while ((m = re.exec(text)) !== null) {
            if (m.index === re.lastIndex) {
                re.lastIndex++;
            }

            console.log(m);

            var scripture = {
                book: m[1],
                chapter: m[2],
                translation: 'kjv',
                verses: []
            };

            if (text.indexOf(',') >= 0) {
                re = /:(.*)/gi;
                while ((m = re.exec(text)) !== null) {
                    if (m.index === re.lastIndex) {
                        re.lastIndex++;
                    }
                    var items = m[0].split();
                    var re = /(\d+\-\d+)|(\d+).*/;
                    for (var i = 0; i < items.length; i++) {
                        if ((m = re.exec(items[i])) !== null) {
                            if (m.index === re.lastIndex) {
                                re.lastIndex++;
                            }
                            if (m[1]) {
                                scripture.verses.push(m[1]);
                            } else if (m[2]) {
                                scripture.verses.push(m[2]);
                            }
                        }
                    }
                }
            } else if (m[3]) {
                scripture.verses.push(m[3]);
            }
            //extract the translation
            translation_regex = /(amp|asv|ceb|cevdcus06|cpdv|erv|esv|gnb|gnt|gntd|icb|kjv|kjva|kjva|mev|msg|nabre|nasb|ncv|net|nirv|niv|nkjv|nlt|web|webbe|wmb|wmbbe')/i;
            if ((m = translation_regex.exec(text)) !== null) {
                if (m.index === translation_regex.lastIndex) {
                    translation_regex.lastIndex++;
                }
                if (m.length > 1) {
                    scripture.translation = m[1];
                }
            }

            return scripture;
        }
        return {}
    };

    BibleService.prototype.addChurch = function (data) {
        return this.http_.post('/api/church', data);
    };

    BibleService.prototype.getChurches = function () {
        return this.http_.get('/api/churches');
    };

    BibleService.prototype.scriptureToText = function (scripture) {
        var tmp = scripture.book + ' ' + scripture.chapter;
        if (!_.isEmpty(scripture.verses)) {
            tmp += ':' + scripture.verses.join(',');
        }
        tmp += '(' + scripture.translation + ')';
        return tmp;
    };

    BibleService.prototype.getSermon = function (id) {
        return this.http_.get('/api/sermon/' + id);
    };

    BibleService.prototype.getSermonComments = function (sermonId) {
        return this.http_.get('/api/sermon/' + sermonId + '/comments', {ignoreLoadingBar: true});
    };

    BibleService.prototype.getComments = function (refKey, kind) {
        return this.http_.get('/api/comment/' + refKey + '?k=' + kind, {ignoreLoadingBar: true});
    };

    BibleService.prototype.getPastorSermons = function (pastorId, cursor) {
        if (_.isEmpty(cursor)) {
            return this.http_.get('/api/sermon?pastor_id=' + pastorId);
        } else {
            var params = {
                pastor_id: pastorId,
                cursor: cursor
            };
            return this.http_.get('/api/sermon?' + $.param(params));
        }
    };
    BibleService.prototype.getChurchSermons = function (churchId, cursor) {
        if (_.isEmpty(cursor)) {
            return this.http_.get('/api/sermon?church_id=' + churchId);
        } else {
            var params = {
                church_id: churchId,
                cursor: cursor
            };
            return this.http_.get('/api/sermon?' + $.param(params));
        }
    };

    BibleService.prototype.getPassage = function (scripture) {
        var self = this;
        if (_.isString(scripture)) {
            scripture = self.parseScripture(scripture);
        }
        //console.log(scripture);
        scripture.translation = scripture.translation ? scripture.translation : 'kjv';
        var param = self.util.toQueryString(scripture);
        return this.http_.get('/api/bible?' + param);
    };

    /**
     * Get scripture
     * @param passage
     * @param version
     * @returns {HttpPromise}
     */
    BibleService.prototype.get = function (passage, version) {
        version = version ? version : 'kjv';
        return this.http_.jsonp(BASE_URL + 'callback=JSON_CALLBACK&passage=' + passage + '&v=' + version);
    };

    BibleService.prototype.versions = function () {
        return this.http_.get('/api/bible/versions', {cache: true});
    };

    BibleService.prototype.saveSermon = function (sermon) {
        return this.http_.post('/api/sermon', sermon);
    };

    BibleService.prototype.publishSermon = function (sermon) {
        return this.http_.post('/api/sermon/publish', sermon);
    };

    BibleService.prototype.logSermonView = function (sermonId) {
        return this.http_.post('/api/sermon/' + sermonId + '/log', sermon, {ignoreLoadingBar: true});
    };

    BibleService.prototype.findSermon = function (query) {
        return this.http_.get('/api/sermon/find?query=' + encodeURIComponent(query), {
            cache: true,
            ignoreLoadingBar: true
        });
    };

    BibleService.prototype.findChurch = function (query) {
        return this.http_.get('/api/church/search?query=' + encodeURIComponent(query), {
            cache: true,
            ignoreLoadingBar: true
        });
    };

    BibleService.prototype.suggestChurch = function (value) {
        var self = this;
        if (value && value.length > 2) {

            var deferred = self.q_.defer();
            self.findChurch(value).then(function (resp) {
                deferred.resolve(resp.data);
            });
            return deferred.promise;
        }
        return [];
    };

    BibleService.prototype.changeTranslation = function (scripture, translation) {
        var self = this;
        var scripture = angular.copy(scripture);
        scripture.translation = translation.toLowerCase();
        return self.getPassage(scripture);
    };

    /**
     * Display scripture in a modal popup
     * @param {String} scripture
     */
    var modal;
    BibleService.prototype.showScriptureModal = function (scripture) {
        var self = this;
        return self.modal_.open({
            templateUrl: 'module/component/scripture/scripture-modal.html',
            size: 'lg',
            controller: function ($scope) {
                this.scripture = scripture;
            },
            controllerAs: 'modalCtrl'
        });
    };

    BibleService.prototype.formatScripturesInText = function (text) {
        var re = /(jeremiah|je|jer|psalm|ps|psa|matthew|mt|matt|mat|obadiah|ob|oba|obad|obd|odbh|philemon|pm|phile|phile|philm|phm|phlm|pm|nehemiah|ne|neh|neh|ne|ezekiel|ek|ezek|eze|ezk|proverbs|pr|prov|pro|1\s?samuel|1s|1\s?sam|1sam|1\s?sa|1sa|i\s?samuel|i\s?sam|i\s?sa|acts|ac|act|joshua|js|jos|jos|josh|james|jm|jam|jas|ja|haggai|ha|hag|hagg|hosea|ho|hos|hebrews|he|heb|hw|deuteronomy|dt|deut|deu|de|ruth|ru|rut|titus|ti|tit|tt|ts|lamentations|la|lam|lament|2\s?samuel|2s|2\s?sam|2sam|2\s?sa|2sa|ii\s?samuel|ii\s?sam|ii\s?sa|iis|2\s?timothy|2ti|2\s?tim|2\s?tim|2tim|2\s?ti|iiti|2ti|ii\s?timothy|ii\s?tim|ii\s?ti|2\s?corinthians|2co|2\s?cor|2cor|iico|2\s?co|2co|ii\s?corinthians|ii\s?cor|ii\s?co|song\s?of\s?songs|so|sos|sng|song|song\s?of\s?solomon|sos|songofsongs|songofsolomon|canticle\s?of\s?canticles|luke|lk|luk|lu|daniel|da|dan|dl|dnl|1\s?corinthians|1co|1\s?cor|1cor|ico|1\s?co|1co|i\s?corinthians|i\s?cor|i\s?co|jonah|jh|jon|jnh|galatians|ga|gal|gltns|job|jb|job|2\s?chronicles|2ch|2\s?chr|2\s?chr|2chr|2\s?ch|iich|ii\s?chronicles|ii\s?chr|ii\s?ch|3\s?john|3j|3\s?jn|3\s?jn|3jn|3\s?jo|iiijo|iii\s?john|iii\s?jo|iii\s?jn|leviticus|le|lev|1\s?peter|1p|1\s?pet|1pet|1pe|ipe|1p|i\s?peter|i\s?pet|i\s?pe|1\s?kings|1k|1\s?kgs|1kgs|1\s?kin|1kin|1\s?ki|ik|1ki|i\s?kings|i\s?kin|i\s?ki|2\s?thessalonians|2th|2\s?thess|2\s?thess|2thess|iith|2\s?thes|2thes|2\s?the|2the|2\s?th|2th|ii\s?thessalonians|ii\s?thess|ii\s?the|ii\s?th|genesis|ge|gen|exodus|ex|exo|colossians|co|col|colo|cln|clns|1\s?john|1j|1\s?jn|1jn|1\s?jo|ijo|i\s?john|i\s?jo|i\s?jn|revelation|re|rev|rvltn|joel|jl|joel|joe|jol|philippians|pp|phi|phil|phi|php|judges|jg|judg|jdg|jdgs|1\s?timothy|1ti|1\s?tim|1tim|1\s?ti|iti|1ti|i\s?timothy|i\s?tim|i\s?ti|jude|jude|jude|2\s?john|2j|2\s?jn|2jn|2\s?jo|iijo|ii\s?john|ii\s?jo|ii\s?jn|micah|mi|mic|habakkuk|hb|hab|hk|habk|john|jn|joh|jo|ephesians|ep|eph|ephn|amos|am|amos|amo|isaiah|is|isa|mark|mk|mar|mrk|ecclesiastes|ec|ecc|qohelet|nahum|na|nah|nah|na|ezra|ezr|romans|ro|rom|rmn|rmns|2\s?kings|2k|2\s?kgs|2kgs|2\s?kin|2kin|2\s?ki|iik|2ki|ii\s?kings|ii\s?kin|ii\s?ki|2\s?peter|2p|2\s?pet|2pet|2pe|iip|ii\s?peter|ii\s?pet|ii\s?pe|esther|es|est|esth|malachi|ml|mal|mlc|numbers|nu|num|zechariah|zc|zech|zec|1\s?thessalonians|1th|1\s?thess|1thess|ith|1\s?thes|1thes|1\s?the|1the|1\s?th|1th|i\s?thessalonians|i\s?thess|i\s?the|i\s?th|1\s?chronicles|1ch|1\s?chr|1chr|1\s?ch|ich|i\s?chronicles|i\s?chr|i\s?ch|zephaniah|zp|zep|zeph)\.?\s?\d+:?[\d-\d|\d+]/gi;
        return text.replace(re, function (match) {
            return '<span class="scripture-highlight" show-scripture-on-click="" scripture="\'' + match + '\'">' + match + '</span>';
        });

        //while ((m = re.exec(text)) !== null) {
        //    if (m.index === re.lastIndex) {
        //        re.lastIndex++;
        //    }
        //    // View your result using the m-variable.
        //    // eg m[0] etc.
        //    result.push({
        //        match: m[0],
        //        index: m.index
        //    });
        //}
        return result;
    };
    App.service('bibleService', BibleService);

})();
/**
 * Created by eanjorin on 12/11/15.
 */
App

    .directive('nameTag', function () {
        return {
            restrict: 'E',
            scope: {
                user: '='
            },
            template: '<a href ><span ng-if="user.title">{{user.title}}</span>' +
            '<span> {{user.first_name | sentencecase}}</span>' +
            '<span> {{user.last_name | sentencecase}}</span> </a>'
        }

    })
    .directive('autoSave', ["noteService", function (noteService) {
        return {
            restrict: 'EA',
            scope: {
                note: '='
            },
            link: function (scope) {
                noteService.startSaving(scope, scope.note);
            }
        }
    }])
    .directive('focusCursor', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                //  console.log(element);
                var node = element;
                node.focus();
                //var caret = 0; // insert caret after the 10th character say
                //var range = document.createRange();
                //range.setStart(node, caret);
                //range.setEnd(node, caret);
                //var sel = window.getSelection();
                //console.log(sel);
                //sel.removeAllRanges();
                //sel.addRange(range);
            }
        }

    })
    .directive('bindHtmlCompile', ['$compile', function ($compile) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                scope.$watch(function () {
                    return scope.$eval(attrs.bindHtmlCompile);
                }, function (value) {
                    element.html(value);
                    $compile(element.contents())(scope);
                });
            }
        };
    }])
    .directive('autoSize', function () {
        return {
            restrict: 'A',
            link: function (scope, element) {
                if (element[0]) {
                    autosize(element);
                }
            }
        }
    })
    .directive('scriptureChip', function () {
        return {
            restrict: 'A',
            link: function (scope, element) {
                console.log($(element).find('md-chip'));
                $(element).find('md-chip').on('click', function () {
                    console.log(123);
                });
            }
        }
    })

    .directive('loading', function () {
        return {
            restrict: 'EA',
            scope: {
                loader: '='
            },
            template: '  <div style="text-align: center" ng-if="loader"> ' +
            '<div class="preloader pls-blue"> ' +
            '<svg class="pl-circular" viewBox="25 25 50 50">' +
            '<circle class="plc-path" cx="50" cy="50" r="20"/>' +
            '</svg>' +
            '</div>' +
            '</div>'
        }
    })
    .directive('submitOn', function () {
        return {
            restrict: 'AE',
            link: function (scope, elm, attrs) {
                console.log(attrs.submitOn);
                scope.$on(attrs.submitOn, function () {

                    // We can't trigger submit immediately,
                    // or we get $digest already in progress error :-[ (because ng-submit does an $apply of its own)
                    setTimeout(function () {
                        console.log('submit');
                        elm.trigger('submit');
                    });
                });
            }
        };
    })
    .directive('calAddSermon', ["authService", function (authService) {
        return {
            restrict: 'A',
            link: function (scope, elm, attrs) {
                if (authService.user.is_pastor) {
                    $(elm).on('mouseover', '.fc-day', function (e) {
                        var elem = e.currentTarget;
                        $(elem).append("<span style='padding-top: 10%' class='add-sermon-label'><strong>Click to add sermon</strong></span>");
                    });
                    $(elm).on('mouseleave', '.fc-day', function (e) {
                        var elem = e.currentTarget;
                        $(elem).find('.add-sermon-label').remove();
                    });
                }

            }
        };
    }])
    .directive('calSermonHover', function () {
        return {
            restrict: 'A',
            link: function (scope, elm) {
                $(elm).on('mouseenter', '.fc-day-grid-event', function () {
                    //console.log(123);
                });
            }
        };
    })
    .directive('calendar', ["$compile", function ($compile) {
        return {
            restrict: 'A',
            scope: {
                select: '&',
                actionLinks: '=',
                events: '=',
                eventClick: '='
            },
            link: function (scope, element, attrs) {
                console.log(scope.events);
                //Generate the Calendar
                element.fullCalendar({
                    header: {
                        right: '',
                        center: 'prev, title, next',
                        left: ''
                    },

                    theme: true, //Do not remove this as it ruin the design
                    selectable: true,
                    selectHelper: true,
                    editable: true,

                    //Add Events
                    events: scope.events,

                    //On Day Select
                    select: function (start, end, allDay) {
                        scope.select({
                            start: start,
                            end: end
                        });
                    },
                    eventMouseover: function (calEvent, jsEvent, view) {
                        console.log(arguments);
                    },
                    eventClick: function (calEvent, jsEvent, view) {
                        console.log(arguments);
                        scope.eventClick(calEvent, jsEvent, view);
                    }
                });

                //Add action links in calendar header
                //  element.find('.fc-toolbar').append($compile(scope.actionLinks)(scope));
            }
        }
    }])
    .directive('toggleSubmenu', function () {

        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.click(function () {
                    element.next().slideToggle(200);
                    element.parent().toggleClass('toggled');
                });
            }
        }
    })
    .directive('toggleSidebar', function () {
        return {
            restrict: 'A',
            scope: {
                modelLeft: '=',
                modelRight: '='
            },

            link: function (scope, element, attr) {
                element.on('click', function () {

                    if (element.data('target') === 'mainmenu') {
                        if (scope.modelLeft === false) {
                            scope.$apply(function () {
                                scope.modelLeft = true;
                            })
                        }
                        else {
                            scope.$apply(function () {
                                scope.modelLeft = false;
                            })
                        }
                    }

                    if (element.data('target') === 'chat') {
                        if (scope.modelRight === false) {
                            scope.$apply(function () {
                                scope.modelRight = true;
                            })
                        }
                        else {
                            scope.$apply(function () {
                                scope.modelRight = false;
                            })
                        }

                    }
                })
            }
        }
    });

App
    .directive('mention', function () {
        return {
            restrict: 'A',
            link: function (scope, element) {
                $(element).on('change', function () {
                    console.log(arguments);
                });

            }
        }

    })
    .directive('comment', ["userService", "util", "authService", "alertService", function (userService, util, authService, alertService) {
        return {
            restrict: 'E',
            scope: {
                comment: '='
            },
            link: function (scope, element) {

                scope.util = util;
                scope.user = authService.getUser();

                /**
                 * Like or unlike comment
                 * @param c
                 */
                scope.like = function (c) {
                    var i = c.likes_key.indexOf(authService.user.id);

                    if (i >= 0) {
                        userService.unlikeComment(c.id).then(function (resp) {
                            if (resp.data.status == 'success') {
                                c.like_count -= 1;
                                c.likes_key.splice(i, 1);
                            }
                        });
                        //unlike
                    } else {
                        userService.likeComment(c.id).then(function (resp) {
                            if (resp.data.status == 'success') {
                                c.like_count += 1;
                                c.likes_key.push(authService.user.id);
                            }
                        });
                    }
                };
                //scope.reply = function (user) {
                //    scope.replyTo = {
                //        id: user.id,
                //        name: user.first_name + ' ' + user.last_name
                //    };
                //    scope.showReply = true;
                //
                //};

                /**
                 * Post reply to comment
                 */
                scope.postReply = function () {
                    var comment = scope.comment;
                    var replyElement = $(element).find('.reply-text');
                    var reply = replyElement.html();

                    if (_.isEmpty(reply)) return;

                    var data = {
                        comment: reply,
                        reply_to: comment.id
                    };

                    userService.postComment(data, comment.ref_key, comment.ref_kind)
                        .then(function (resp) {
                                console.log(resp.data);
                                if (resp.data.id) {
                                    comment.replies.comments.unshift(resp.data);
                                    replyElement.html('');
                                    comment.replies_key.push(resp.data.id);
                                    comment.reply_count++;
                                } else {
                                    alertService.danger('Failed to save your reply, please try again.');
                                }
                            }
                        )

                };

            },
            templateUrl: 'module/component/feed/comment.html'
        }
    }])
    .directive('comments', ["userService", "alertService", function (userService, alertService) {
        return {
            restrict: 'E',
            scope: {
                data: '='
            },
            link: function (scope, element) {


                /**
                 * Post a reply to a comment
                 * @param c
                 */
                scope.postReply = function (c) {
                    console.log($(element));
                    console.log($(element).find('.reply-text').html());
                    if (_.isEmpty(c.reply)) return;
                    var data = {
                        comment: c.reply,
                        reply_to: c.id
                    };
                    userService.postComment(data, c.ref_key, c.ref_kind)
                        .then(function (resp) {
                                console.log(resp.data);
                                if (resp.data.id) {
                                    c.replies.comments.unshift(resp.data);
                                    c.reply = '';
                                    c.replies_key.push(resp.data.id);
                                    c.reply_count++;
                                } else {
                                    alertService.danger('Failed to post comment, please try again');
                                }
                            }
                        )

                };
            },
            templateUrl: 'module/component/feed/comments.html'
        }
    }])
    .directive('feed', ["authService", "util", "userService", "$compile", function (authService, util, userService, $compile) {
        return {
            restrict: 'E',
            scope: {
                feed: '='
            },
            link: function (scope, element) {
                var feed = scope.feed;
                feed.showComments = (feed.comment_count > 5) ? false : true;
                scope.util = util;
                scope.user = authService.user;


                scope.postComment = function (comment) {

                    userService.postComment({comment: comment}, feed.id, feed.kind).then(function (resp) {
                            if (resp.data.id) {
                                //feed.comments is an object
                                //with comment array and
                                //next for cursor id
                                feed.comments.comments.unshift(resp.data);
                                feed.newComment_ = '';
                                feed.comment_count++;
                            } else {
                                alertService.danger('Failed to post comment, please try again');
                            }
                        }
                    )


                };
                scope.more = function () {
                    feed.displayText = feed.fullText;
                };

                function formatContent(content) {
                    var l = content.length;
                    if (l > 600) {
                        console.log($compile('<a  href ng-click="test()">more</a>')(scope));
                        return util.trim(content, 600) + '...' + '<a  href ng-click="more()">more</a>';
                    }
                    return content;
                }

                //process display text
                switch (feed.kind) {
                    case 'Sermon':
                        feed.fullText = feed.displayText = '<h3 class="m-t-5 m-b-5"><a href="#/sermon/' + feed.id + '">' + feed.title + '</a></h3> <br>';
                        console.log(feed.displayText);
                        if (_.isEmpty(feed.summary)) {
                            if (!_.isEmpty(feed.note)) {
                                feed.displayText += formatContent(feed.note);
                                feed.fullText += (feed.note);
                            } else {
                                // sermon not in bullet points.
                                var content = '';
                                for (var i = 0; i < feed.notes.length; i++) {
                                    content += feed.notes[i].content;
                                }
                                feed.displayText += formatContent(content);
                                feed.fullText += feed.note;

                            }
                        } else {
                            feed.displayText += formatContent(feed.summary);
                            feed.fullText += feed.summary;
                        }
                        break;
                    case 'Post':
                        feed.displayText = formatContent(feed.content);
                        feed.fullText = feed.content;
                }


                scope.busy = false;

                scope.liked = function () {
                    return feed.likers_key.indexOf(scope.user.id) >= 0;
                    //if (feed.kind == 'Sermon') {
                    //    var i = scope.user.fav_sermon_keys.indexOf(feed.id);
                    //    return i >= 0;
                    //}
                    //return false;
                };
                //handle like or unlike
                scope.like = function () {
                    if (feed.kind == 'Sermon') {
                        userService.likeSermon(scope.user, feed);
                    } else if (feed.kind == 'Post') {
                        userService.likePost(scope.user, feed)
                    }
                };


            },
            templateUrl: function () {
                return 'module/component/feed/feed.html';
            }

        }
    }]);
/**
 * Created by eanjorin on 12/11/15.
 */
App
    .filter('sentencecase', function () {
        return function (input) {
            if (angular.isString(input)) {
                var i = input.split(' ');
                var word = [];
                i.forEach(function (w) {
                    word.push(w.charAt(0).toUpperCase() + w.substring(1, w.length).toLowerCase());
                });
                return word.join(' ');
            }
            return input;
        }
    })
    .filter('formatDate', ["util", function (util) {
        return function (input, format) {
            return util.toLocalFormat(input, format)
        }
    }])
    .filter('fromNow', ["util", function (util) {
        return function (input) {
            return util.toLocalMoment(input).fromNow();
        }
    }]);



(function () {
    App.directive('chipShowModalOnClick', ["bibleService", function (bibleService) {
        return {
            restrict: 'A',
            link: function (scope, element) {
                $(element).on('click', 'md-chip', function (e) {
                    var scripture = angular.element(e.currentTarget).scope().$chip;
                    bibleService.showScriptureModal(scripture);
                });

            }
        }
    }]);
    App.directive('showScriptureOnClick', ["bibleService", function (bibleService) {
            return {
                restrict: 'A',
                scope: {
                    scripture: '='
                },
                link: function (scope, element) {
                    $(element).on('click', function () {
                        bibleService.showScriptureModal(scope.scripture);
                    });
                }
            }
        }])
        .directive('scriptureCard', ["bibleService", function (bibleService) {
            return {
                restrict: 'E',
                scope: {
                    //scripture: '='
                    text: '='
                },
                link: function (scope, element) {

                    //create scripture object from text
                    var scripture = bibleService.parseScripture(scope.text);

                    console.log(scripture);

                    getPassage(scripture);

                    //get the available bible versions
                    bibleService.versions().then(function (resp) {
                        scope.versions = resp.data;
                    });

                    /**
                     * Reload scripture using selected translation
                     * @param trans
                     */
                    scope.changeTranslation = function (trans) {
                        scripture.translation = trans.abbr.toLowerCase();
                        getPassage(scripture);
                    };

                    /**
                     * Load scripture from server
                     * @param {Object} scripture
                     */
                    function getPassage(scripture) {
                        scope.loading = true;
                        bibleService.getPassage(scripture).then(function (resp) {
                            scope.loading = false;
                            scope.scripture = resp.data;
                        });
                    };
                },
                templateUrl: 'module/component/scripture/scripture-card.html'
            };
        }]);
})();

App.directive('toggleSidebar', function () {
    return {
        restrict: 'A',
        scope: {
            modelLeft: '=',
            modelRight: '='
        },

        link: function (scope, element, attr) {
            element.on('click', function () {

                if (element.data('target') === 'mainmenu') {
                    if (scope.modelLeft === false) {
                        scope.$apply(function () {
                            scope.modelLeft = true;
                        })
                    }
                    else {
                        scope.$apply(function () {
                            scope.modelLeft = false;
                        })
                    }
                }

                if (element.data('target') === 'chat') {
                    if (scope.modelRight === false) {
                        scope.$apply(function () {
                            scope.modelRight = true;
                        })
                    }
                    else {
                        scope.$apply(function () {
                            scope.modelRight = false;
                        })
                    }

                }
            });
        }
    }

});
(function () {

    var UserService = function ($http, authService, localStorageService, APP_CONSTANTS) {
        var self = this;
        self.http_ = $http;
        self.storage = localStorageService;
        self.authService = authService;
        self.user = authService.user;
        self.APP_CONSTANTS = APP_CONSTANTS;
    };
    UserService.$inject = ["$http", "authService", "localStorageService", "APP_CONSTANTS"];

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

/**
 * Created by ebby on 12/29/2015.
 */
App.service('util', function () {

    var self = this;

    self.toQueryString = function (obj) {
        if (_.isObject(obj)) {
            var qryString = $.param(obj);
            return qryString.replace(/%5B%5D/g, '');
        }
        return '';
    };

    self.toLocalFormat = function (ms, format) {
        var local = moment.utc(parseInt(ms)).local();
        format = format ? format : 'MM-DD-YYYY';
        return local.format(format);
    };

    self.toUtcMilliseconds = function (date) {
        return moment(date).utc().unix() * 1000;
    };
    self.toLocalDate = function (ms) {
        return self.toLocalMoment(ms).toDate();
    };
    self.toLocalMoment = function (ms) {
        return moment.utc(parseInt(ms)).local();
    };

    self.log = function (obj) {
        console.log(JSON.stringify(obj, null, 2));
    };
    self.imagePath = function (user) {
        if (user.profile_photo) {
            return user.profile_photo;
        } else if (user.gender == 'f') {
            return 'img/female_avatar.svg';
        } else {
            return 'img/male_avatar.svg';
        }
    };

    self.trim = function (text, length) {
        //trim the string to the maximum length
        var trimmedString = text.substr(0, length);
        //re-trim if we are in the middle of a word
        return trimmedString.substr(0, Math.min(trimmedString.length, trimmedString.lastIndexOf(" ")));
    }

});
angular.module("scripturedIn").run(["$templateCache", function($templateCache) {$templateCache.put("module/profile-menu.html","<li class=\"btn-wave\" data-ui-sref-active=\"active\"><a data-ui-sref=\"pages.profile.profile-about\">About</a></li>\r\n<li class=\"btn-wave\" data-ui-sref-active=\"active\"><a data-ui-sref=\"pages.profile.profile-timeline\">Timeline</a></li>\r\n<li class=\"btn-wave\" data-ui-sref-active=\"active\"><a data-ui-sref=\"pages.profile.profile-photos\">Photos</a></li>\r\n<li class=\"btn-wave\" data-ui-sref-active=\"active\"><a data-ui-sref=\"pages.profile.profile-connections\">Connections</a></li>\r\n");
$templateCache.put("module/home/home.html","<div class=\"container c-alt\">\n    <div class=\"row\">\n\n        <div class=\"col-md-10\">\n                    <div class=\"card wall-posting\">\n                <div class=\"card-body card-padding\">\n                    <textarea class=\"wp-text\"\n                              ng-model=\"homeCtrl.post.content\"\n                              data-auto-size placeholder=\"Write Something...\"></textarea>\n\n                    <!--<div class=\"wp-media\" data-ng-if=\"mactrl.wallImage\">-->\n                        <!--Images - Coming soon...-->\n                    <!--</div>-->\n\n                    <!--<div class=\"wp-media\" data-ng-if=\"mactrl.wallVideo\">-->\n                        <!--Video Links - Coming soon...-->\n                    <!--</div>-->\n\n                    <!--<div class=\"wp-media\" data-ng-if=\"mactrl.wallLink\">-->\n                        <!--Links - Coming soon...-->\n                    <!--</div>-->\n                </div>\n\n                <ul class=\"list-unstyled clearfix wpb-actions\">\n                    <!--<li class=\"wpba-attrs\">-->\n                        <!--<ul class=\"list-unstyled list-inline m-l-0 m-t-5\">-->\n                            <!--<li><a data-wpba=\"image\" href=\"\" data-ng-class=\"{ \'active\': mactrl.wallImage }\" data-ng-click=\"mactrl.wallImage = true; mactrl.wallVideo = false; mactrl.wallLink = false\"><i class=\"zmdi zmdi-image\"></i></a></li>-->\n                            <!--<li><a data-wpba=\"video\" href=\"\" data-ng-class=\"{ \'active\': mactrl.wallVideo }\" data-ng-click=\"mactrl.wallVideo= true; mactrl.wallImage = false; mactrl.wallLink = false\"><i class=\"zmdi zmdi-play-circle\"></i></a></li>-->\n                            <!--<li><a data-wpba=\"link\" href=\"\" data-ng-class=\"{ \'active\': mactrl.wallLink }\" data-ng-click=\"mactrl.wallLink = true; mactrl.wallImage = false; mactrl.wallVideo = false\"><i class=\"zmdi zmdi-link\"></i></a></li>-->\n                        <!--</ul>-->\n                    <!--</li>-->\n\n                    <li class=\"pull-right\">\n                        <button ng-click=\"homeCtrl.newPost()\" class=\"btn btn-primary btn-sm\">Post</button>\n                    </li>\n                </ul>\n            </div>\n\n            <div id=\"feeds\" ng-if=\"homeCtrl.feedData\">\n                <feed ng-repeat=\"feed in homeCtrl.feedData.feeds\"\n                      feed=\"feed\"></feed>\n            </div>\n        </div>\n    </div>\n</div>\n");
$templateCache.put("module/main/email-signup-modal.html","<div class=\"modal-header text-center p-0\">\n    Sign up with <a href=\"\">Facebook</a>\n    <div class=\"signup-or-separator\">\n        <span class=\"h6 signup-or-separator--text\">or</span>\n        <hr>\n    </div>\n</div>\n<div class=\"modal-body\">\n    <div class=\"m-t-10 alert alert-danger\" ng-if=\"modalCtrl.error\">\n        <p ng-bind-html=\"modalCtrl.error\"></p>\n    </div>\n    <form name=\"signupForm\" ng-submit=\"modalCtrl.signup(signupForm)\" style=\"padding: 15px\" novalidate>\n        <div class=\"input-group m-b-20\" ng-class=\"{\'has-error\':signupForm.$submitted && signupForm.firstname.$invalid}\">\n            <!--<span class=\"input-group-addon\"><i class=\"zmdi zmdi-account\"></i></span>-->\n\n            <!--<label class=\"control-label\">Input with error</label>-->\n            <div class=\"fg-line\">\n\n                <input id=\"firstname\"\n                       name=\"firstname\"\n                       ng-model=\"modalCtrl.user.first_name\"\n                       type=\"text\"\n                       required\n                       placeholder=\"First name\"\n                       class=\"form-control\">\n            </div>\n        </div>\n        <div class=\"input-group m-b-20\" ng-class=\"{\'has-error\':signupForm.$submitted && signupForm.lastname.$invalid}\">\n            <div class=\"fg-line\">\n                <input id=\"lastname\"\n                       ng-model=\"modalCtrl.user.last_name\"\n                       name=\"lastname\"\n                       placeholder=\"Last name\"\n                       required\n                       type=\"text\"\n                       required\n                       class=\"form-control\">\n            </div>\n        </div>\n\n        <div class=\"input-group m-b-20\" ng-class=\"{\'has-error\':signupForm.$submitted && signupForm.email.$invalid}\">\n            <div class=\"fg-line\">\n                <input type=\"email\"\n                       name=\"email\"\n                       placeholder=\"Email\"\n                       ng-model=\"modalCtrl.user.email\"\n                       required class=\"form-control\"\n                       id=\"email\">\n            </div>\n        </div>\n\n        <div class=\"input-group m-b-20\" ng-class=\"{\'has-error\':signupForm.$submitted && signupForm.password.$invalid}\">\n            <div class=\"fg-line\">\n                <input type=\"password\"\n                       name=\"password\"\n                       placeholder=\"Password\"\n                       ng-model=\"modalCtrl.user.password\"\n                       pattern=\".{6,}\"\n                       title=\"6 characters minimum\"\n                       required class=\"form-control\" id=\"password\">\n                <small ng-if=\"signupForm.$submitted && signupForm.password.$invalid\"\n                       class=\"help-block\">Password should be at least 6 characters</small>\n            </div>\n        </div>\n\n        <div class=\"input-group m-b-20\" style=\"width: 100%\">\n            <button type=\"submit\" class=\"btn btn-block btn-primary waves-effect\">Sign Up</button>\n        </div>\n\n\n        <p>By signing up, I agree to ScripturedIn\'s Terms.</p>\n\n        <hr>\n    </form>\n</div>\n<div class=\"modal-footer\" style=\"text-align: center\">\n    Already a scripturein member? <a href ng-click=\"modalCtrl.login()\">Log in</a>\n</div>\n<!--<div class=\"outer\">-->\n<!--<div class=\"middle\">-->\n<!--<div class=\"inner\">-->\n<!---->\n<!--</div>-->\n<!--</div>-->\n<!--</div>-->\n");
$templateCache.put("module/main/login-modal.html","<!--<div class=\"modal-header\">-->\n<!--<h4 class=\"modal-title\">Modal Title</h4>-->\n<!--</div>-->\n<div class=\"modal-body login-modal\">\n    <div ng-if=\"modalCtrl.main.fbUser\">\n        <p class=\"f-16 c-black\">WELCOME BACK, CONTINUE AS</p>\n        <ul class=\"list-group\">\n            <li class=\"list-group-item\" style=\"cursor: hand\" ng-click=\"modalCtrl.continueWithFacebook()\">\n\n                <img class=\"lv-img m-r-10\" ng-src=\"{{modalCtrl.main.fbUser.picture.data.url}}\"\n                     alt=\"Facebok profile photo\">\n                {{modalCtrl.main.fbUser.first_name}} {{modalCtrl.main.fbUser.last_name}}\n\n            </li>\n\n        </ul>\n        <p class=\"text-center\"><a class=\"c-gray f-13\" href\n                                  ng-click=\"modalCtrl.main.fbUser=null\">Login As Another User</a></p>\n    </div>\n    <div ng-if=\"!modalCtrl.main.fbUser\">\n        <div class=\"social-buttons\">\n            <button\n                    ng-click=\"modalCtrl.loginWithFacebook()\"\n                    class=\"btn btn-default btn-block btn-icon-text btn-facebook waves-effect m-b-10\"><i\n                    class=\"zmdi zmdi-facebook pull-left\"></i>\n                Login with Facebook\n            </button>\n            <!--<button class=\"btn btn-default btn-block btn-icon-text waves-effect m-b-10\"><i class=\"zmdi zmdi-facebook pull-left\"></i> Home</button>-->\n        </div>\n        <div class=\"signup-or-separator m-b-20\">\n            <span class=\"h6 signup-or-separator--text\">or</span>\n            <hr>\n        </div>\n        <div class=\"m-t-10 alert alert-danger\" ng-if=\"modalCtrl.error\">\n            <p ng-bind-html=\"modalCtrl.error\"></p>\n        </div>\n        <form name=\"loginForm\" ng-submit=\"modalCtrl.loginWithEmail(loginForm)\"\n              novalidate\n              style=\"padding: 15px\">\n            <div class=\"input-group m-b-20\"\n                 ng-class=\"{\'has-error\':loginForm.$submitted && loginForm.email.$invalid}\">\n                <!--<span class=\"input-group-addon\"><i class=\"zmdi zmdi-account\"></i></span>-->\n\n                <div class=\"fg-line\">\n                    <input id=\"email\"\n                           name=\"email\"\n                           ng-model=\"modalCtrl.email\"\n                           type=\"email\"\n                           required\n                           placeholder=\"Email Address\"\n                           class=\"form-control\">\n                    <small ng-if=\"loginForm.$submitted && loginForm.email.$invalid\"\n                           class=\"help-block\">Email is required\n                    </small>\n                </div>\n            </div>\n\n            <div class=\"input-group m-b-20\"\n                 ng-class=\"{\'has-error\':loginForm.$submitted && loginForm.password.$invalid}\">\n                <!--<span class=\"input-group-addon\"><i class=\"zmdi zmdi-email\"></i></span>-->\n\n                <div class=\"fg-line\">\n                    <input type=\"password\"\n                           name=\"password\"\n                           placeholder=\"Password\"\n                           ng-model=\"modalCtrl.password\"\n                           required\n                           class=\"form-control\"\n                           id=\"password\">\n                    <small ng-if=\"loginForm.$submitted && loginForm.password.$invalid\"\n                           class=\"help-block\">Password is required\n                    </small>\n                </div>\n            </div>\n\n            <div class=\"input-group\" style=\"width: 100%\">\n                <button type=\"submit\"\n                        class=\"btn btn-lg btn-block btn-primary waves-effect\">Login\n                </button>\n            </div>\n        </form>\n    </div>\n    <hr class=\"m-t-5 m-b-5\">\n</div>\n<div class=\"modal-footer\" style=\"text-align: center\">\n    Don\'t have an account? <a href ng-click=\"modalCtrl.showSignupModal()\">Sign up</a>\n</div>\n<!--<div class=\"outer\">-->\n<!--<div class=\"middle\">-->\n<!--<div class=\"inner\">-->\n<!---->\n<!--</div>-->\n<!--</div>-->\n<!--</div>-->\n");
$templateCache.put("module/main/main.html","<div ng-class=\"{\'sidebar-mask\': appCtrl.sideMenu}\" ng-click=\"appCtrl.sideMenu=false\">\r\n\r\n</div>\r\n\r\n<aside id=\"sidebar\" data-ng-include=\"\'module/main/sidebar-menu.html\'\"\r\n       class=\"menu\"\r\n       ng-class=\"{toggled: appCtrl.sideMenu}\"></aside>\r\n\r\n\r\n<section id=\"content\">\r\n\r\n    <div id=\"top\">\r\n        <div class=\"header\">\r\n            <!--<div class=\"fixed-header\">-->\r\n\r\n\r\n            <div>\r\n                <ul class=\"header-inner\">\r\n\r\n                    <li class=\"menu-trigger\"\r\n                        id=\"menu-trigger\"\r\n                        ng-click=\"appCtrl.sideMenu=true\">\r\n                        <div class=\"line-wrap\">\r\n                            <div class=\"line top\"></div>\r\n                            <div class=\"line center\"></div>\r\n                            <div class=\"line bottom\"></div>\r\n                        </div>\r\n                    </li>\r\n\r\n                    <li class=\"logo\"><a href=\"\">scripturedin</a></li>\r\n                    <li class=\"pull-right hidden-xs\">\r\n                        <ul class=\"top-menu\">\r\n                            <li><a href ng-click=\"mainCtrl.showSignup()\">Sign Up</a></li>\r\n                            <li><a href ng-click=\"mainCtrl.showLogin()\">Login</a></li>\r\n                        </ul>\r\n\r\n                    </li>\r\n                </ul>\r\n\r\n                <div class=\"header-content\">\r\n                    <div class=\"intro-text-bg\">\r\n\r\n                        <h1>Bring The Word to Life.</h1>\r\n                        <p>Read the bible, find sermons, take notes, interact...</p>\r\n                    </div>\r\n                </div>\r\n\r\n            </div>\r\n\r\n        </div>\r\n    </div>\r\n\r\n    <div class=\"info\">\r\n        <div class=\"row\">\r\n            <div class=\"col-sm-4 section\">\r\n                <img src=\"img/search.png\" alt=\"\">\r\n\r\n                <h3>Discover life transforming sermons.</h3>\r\n                <p>Do you remember all your pastor’s sermon last month?\r\n                    How about last year? You\'re not alone.</p>\r\n            </div>\r\n            <div class=\"col-sm-4 section\">\r\n                <img src=\"img/note.png\" alt=\"\">\r\n                <h3>Takes notes in a central place.</h3>\r\n                <p>It\'s good to take notes. How about keeping them safe, organized and accessible forever.</p>\r\n            </div>\r\n            <div class=\"col-sm-4 section\">\r\n                <img src=\"img/social.png\" alt=\"\">\r\n                <h3>Share and gain inspiration.</h3>\r\n                <p>As iron sharpens iron, so one person sharpens and influences another through discussion.</p>\r\n            </div>\r\n        </div>\r\n\r\n\r\n    </div>\r\n\r\n    <footer id=\"footer\">\r\n\r\n        <!--<ul class=\"f-menu\">-->\r\n        <!--<li><a href=\"\">About</a></li>-->\r\n        <!--&lt;!&ndash;<li><a href=\"\">Dashboard</a></li>&ndash;&gt;-->\r\n        <!--&lt;!&ndash;<li><a href=\"\">Reports</a></li>&ndash;&gt;-->\r\n        <!--&lt;!&ndash;<li><a href=\"\">Support</a></li>&ndash;&gt;-->\r\n        <!--<li><a href=\"\">Contact</a></li>-->\r\n        <!--</ul>-->\r\n        &copy; 2015 scripturedin\r\n    </footer>\r\n\r\n</section>");
$templateCache.put("module/main/main_new.html","");
$templateCache.put("module/main/settings.html","<div class=\"container\">\n\n    <div class=\"card\" id=\"profile-main\">\n        <div class=\"pm-overview c-overflow\">\n            <div class=\"pmo-pic\">\n                <div class=\"p-relative\">\n                    <a href=\"\">\n                        <img class=\"img-responsive\" ng-src=\"{{imagePath(authService.user)}}\" alt=\"\">\n                    </a>\n\n\n                    <!--<a href=\"\" class=\"pmop-edit\">-->\n                    <!--<i class=\"zmdi zmdi-camera\"></i> <span class=\"hidden-xs\">Update Profile Picture</span>-->\n                    <!--</a>-->\n                </div>\n\n\n                <!--<div class=\"pmo-stat\">-->\n                <!--<h2 class=\"m-0 c-white\">1562</h2>-->\n                <!--Total Connections-->\n                <!--</div>-->\n            </div>\n\n        </div>\n\n        <div class=\"pm-body clearfix\">\n            <ul class=\"tab-nav tn-justified\">\n                <li class=\"btn-wave active\">\n                    <a href=\"\">Profile</a>\n                </li>\n            </ul>\n\n            <data>\n                <div class=\"pmb-block\">\n                    <div class=\"pmbb-body p-l-30\" data-ng-include=\"\'module/main/user-profile-settings.html\'\">\n                    </div>\n                </div>\n            </data>\n        </div>\n    </div>\n</div>\n");
$templateCache.put("module/main/sidebar-menu.html","<div>\n    <div class=\"sidebar-inner c-overflow\">\n        <ul class=\"main-menu\">\n\n            <li data-ui-sref-active=\"active\">\n                <a data-ui-sref=\"base.home\" data-ng-click=\"mactrl.sidebarStat($event)\">Home</a>\n            </li>\n            <li data-ui-sref-active=\"active\">\n                <a data-ui-sref=\"base.sermon-browse\" data-ng-click=\"appCtrl.sideMenu=false;mainCtrl.showSignup()\">Sign Up</a>\n            </li>\n             <li data-ui-sref-active=\"active\">\n                <a data-ui-sref=\"base.sermon-browse\" data-ng-click=\"appCtrl.sideMenu=false;mainCtrl.showLogin()\">Login</a>\n            </li>\n        </ul>\n    </div>\n\n</div>");
$templateCache.put("module/main/signup-modal.html","<div class=\"modal-body\">\n    <div class=\"social-buttons\">\n        <button class=\"btn btn-default btn-block btn-icon-text btn-facebook waves-effect m-b-10 \"\n                ng-click=\"modalCtrl.signupWithFacebook()\">\n            <i class=\"zmdi zmdi-facebook pull-left\"></i>\n            Sign up with Facebook\n        </button>\n        <!--<button class=\"btn btn-default btn-block btn-icon-text waves-effect m-b-10\"><i class=\"zmdi zmdi-facebook pull-left\"></i> Home</button>-->\n    </div>\n    <div class=\"signup-or-separator m-b-20\">\n        <span class=\"h6 signup-or-separator--text\">or</span>\n        <hr>\n    </div>\n    <button ng-click=\"modalCtrl.showEmailSignupModal()\"\n            class=\"btn btn-default btn-block btn-icon-text waves-effect m-b-20\"><i\n            class=\"zmdi zmdi-email pull-left\"></i>\n        Sign up with Email\n    </button>\n\n    <p>By signing up, I agree to ScripturedIn\'s Terms.</p>\n\n    <hr>\n</div>\n<div class=\"modal-footer\">\n    Already a scripturein member? <a href ng-click=\"modalCtrl.showLoginModal()\">Log in</a>\n</div>\n");
$templateCache.put("module/main/update-profile-signup.html","<div class=\"container\">\n    <div class=\"card\">\n        <div class=\"listview lv-bordered lv-lg\">\n            <div class=\"lv-header-alt clearfix\">\n                <h1 class=\"lvh-label f-20\">Welcome <strong>{{authService.user.first_name}}</strong>, please take\n                    a moment to update\n                    your\n                    profile.</h1>\n            </div>\n            <div class=\"lv-body\" style=\"padding: 20px;\">\n                <div data-ng-include=\"\'module/main/user-profile-settings.html\'\">\n\n                </div>\n            </div>\n        </div>\n    </div>\n</div>\n");
$templateCache.put("module/main/user-profile-settings.html","<div class=\"row\">\n    <div class=\"col-sm-12\">\n        <div class=\"form-group\">\n            <div class=\"row\">\n                <div class=\"col-sm-3\">\n                    <p>Are you a church leader (e.g Pastor)?</p>\n\n                </div>\n                <div class=\"col-sm-8\">\n                    <label class=\"radio radio-inline m-r-20\">\n                        <input type=\"radio\"\n                               ng-model=\"mainCtrl.user.is_pastor\"\n                               name=\"isPastor\"\n                               data-ng-value=\"true\">\n                        <i class=\"input-helper\"></i>\n                        Yes\n                    </label>\n                    <label style=\"margin-left: 0px\" class=\"radio radio-inline m-r-20\">\n                        <input type=\"radio\"\n                               ng-model=\"mainCtrl.user.is_pastor\"\n                               name=\"isPastor\" data-ng-value=\"false\">\n                        <i class=\"input-helper\"></i>\n                        No\n                    </label>\n                    <small ng-if=\"mainCtrl.user.is_pastor\" class=\"help-block\"><i\n                            class=\"zmdi zmdi-info zmdi-hc-fw\"></i>May require verification.\n                    </small>\n                </div>\n            </div>\n        </div>\n        <div class=\"form-group\">\n            <div class=\"row\">\n                <div class=\"col-sm-3\">\n                    <p>Full name</p>\n                </div>\n                <div class=\"col-sm-2\" ng-if=\"mainCtrl.user.is_pastor\">\n                    <div class=\"form-group\">\n                        <div class=\"fg-line\">\n                            <div class=\"select\">\n\n                                <select class=\"form-control\" ng-model=\"mainCtrl.user.title\">\n                                    <option value=\"\">Select title</option>\n                                    <option value=\"Archbishop\">Archbishop</option>\n                                    <option value=\"Apostle\">Apostle</option>\n                                    <option value=\"Bishop\">Bishop</option>\n                                    <option value=\"Deacon\">Deacon</option>\n                                    <option value=\"Elder\">Elder</option>\n                                    <option value=\"Priest\">Priest</option>\n                                    <option value=\"Reverend\">Reverend</option>\n                                    <option value=\"Pastor\" selected>Pastor</option>\n\n                                </select>\n                            </div>\n                        </div>\n                    </div>\n                </div>\n                <div class=\"col-sm-3\">\n                    <div class=\"form-group\">\n                        <div class=\"fg-line\">\n                            <input type=\"text\" ng-model=\"mainCtrl.user.first_name\"\n                                   class=\"form-control\" placeholder=\"first name\">\n                        </div>\n                    </div>\n                </div>\n                <div class=\"col-sm-3\">\n                    <div class=\"form-group\">\n                        <div class=\"fg-line\">\n                            <input type=\"text\" ng-model=\"mainCtrl.user.last_name\"\n                                   class=\"form-control\" placeholder=\"last name\">\n                        </div>\n                    </div>\n                </div>\n            </div>\n        </div>\n        <div class=\"form-group\">\n            <div class=\"row m-b-20\">\n                <div class=\"col-sm-3\">\n                    <p>Primary Church</p>\n                </div>\n                <div class=\"col-sm-8\">\n\n                    <input type=\"text\"\n                           ng-model=\"mainCtrl.user.church\"\n                           placeholder=\"Type the name of your church\"\n                           uib-typeahead=\"c as mainCtrl.churchLabel(c) for c in  mainCtrl.bibleService.suggestChurch($viewValue)\"\n                           typeahead-loading=\"mainCtrl.loadingChurches\"\n                           typeahead-no-results=\"mainCtrl.noResults\" class=\"form-control f-16\">\n                    <i ng-show=\"mainCtrl.loadingChurches\" class=\"glyphicon glyphicon-refresh\"></i>\n\n                    <div ng-if=\"mainCtrl.noResults\" class=\"f-14 c-red\">\n                        <i class=\"glyphicon glyphicon-remove\"></i>\n                        We can\'t find your church. <a href\n                                                      ng-click=\"mainCtrl.newChurch.name=mainCtrl.user.church;\n                                                         mainCtrl.new_church=true;\">Cick to add your church.</a>\n                        <div id=\"new-church\"\n                             ng-if=\"mainCtrl.new_church\"\n                             class=\"m-t-15\">\n                            <form name=\"churchForm\" ng-submit=\"mainCtrl.addChurch(churchForm)\"\n                                  novalidate>\n                                <div class=\"row\">\n                                    <div class=\"col-sm-10\">\n                                        <div class=\"form-group\">\n                                            <md-input-container class=\"md-block m-b-0\">\n                                                <label>Church name</label>\n                                                <input required\n                                                       name=\"churchname\"\n                                                       ng-model=\"mainCtrl.newChurch.name\">\n                                            </md-input-container>\n                                        </div>\n                                        <div class=\"form-group\">\n                                            <input type=\"text\"\n                                                   class=\"form-control input-sm\"\n                                                   ng-model=\"mainCtrl.newChurch.website\"\n                                                   placeholder=\"Website\">\n\n                                        </div>\n                                        <div class=\"form-group\">\n                                            <input type=\"text\"\n                                                   name=\"city\"\n                                                   class=\"form-control input-sm\"\n                                                   ng-model=\"mainCtrl.newChurch.city\"\n                                                   placeholder=\"City\">\n\n                                        </div>\n                                        <div class=\"form-group\">\n                                            <input type=\"text\"\n                                                   name=\"state\"\n                                                   class=\"form-control input-sm\"\n                                                   ng-model=\"mainCtrl.newChurch.state\"\n                                                   placeholder=\"State\">\n                                        </div>\n                                        <div class=\"form-group\">\n                                            <input type=\"text\"\n                                                   name=\"country\"\n                                                   class=\"form-control input-sm\"\n                                                   ng-model=\"mainCtrl.newChurch.country\"\n                                                   placeholder=\"Country\">\n                                        </div>\n                                        <div class=\"form-group\">\n                                            <button type=\"submit\" class=\"btn bgm-lightblue btn-sm waves-effect\">Add\n                                                Church\n                                            </button>\n                                            <button ng-click=\"mainCtrl.new_church=false\"\n                                                    class=\"btn btn-default btn-sm waves-effect\">Close\n                                            </button>\n                                        </div>\n                                    </div>\n                                </div>\n                            </form>\n\n\n                        </div>\n                    </div>\n                    <!--<select chosen-->\n                    <!--data-placeholder=\"Select your church...\"-->\n                    <!--ng-model=\"selected\"-->\n                    <!--ng-options=\"c as c.name + \' (\' +  c.city + \')\' for c in mainCtrl.churches\"-->\n                    <!--class=\"w-100 localytics-chosen\">-->\n                    <!--<option value=\"\"></option>-->\n                    <!--</select>-->\n                </div>\n            </div>\n        </div>\n\n\n        <div class=\"form-group\">\n            <div class=\"row\">\n                <div class=\"col-sm-3\">\n                    <p>Gender</p>\n                </div>\n                <div class=\"col-sm-8\">\n                    <label class=\"radio radio-inline m-r-20\">\n                        <input type=\"radio\"\n                               ng-model=\"mainCtrl.user.gender\"\n                               value=\"m\">\n                        <i class=\"input-helper\"></i>\n                        Male\n                    </label>\n                    <label class=\"radio radio-inline m-r-20\">\n                        <input type=\"radio\"\n                               ng-model=\"mainCtrl.user.gender\"\n                               value=\"f\">\n                        <i class=\"input-helper\"></i>\n                        Female\n                    </label>\n                </div>\n            </div>\n        </div>\n        <div class=\"form-group m-t-20\">\n            <div class=\"row\">\n                <div class=\"col-sm-12\">\n                    <md-button\n                            ng-click=\"mainCtrl.updateProfile()\"\n                            class=\"md-raised c-white bgm-blue m-l-0\">\n                        Save\n                    </md-button>\n                    <md-button\n                            ng-if=\"$state.current.name == \'base.post-signup-profile\'\"\n                            ng-click=\"mainCtrl.updateProfile(true)\"\n                            class=\"md-raised\">\n                        Done\n                    </md-button>\n                </div>\n\n            </div>\n        </div>\n\n    </div>\n\n</div>");
$templateCache.put("module/notes/create.html","<div class=\"container\">\n\n    <!--<div class=\"block-header\">-->\n    <!--<h2>Data Tables-->\n    <!--<small>ng-table is a powerfull AngularJs ready Data Table with tons of customizable options. Read more <a-->\n    <!--target=\"_blank\" href=\"http://ng-table.com/#/\">here</a> for detailed documentation and HowTos...-->\n    <!--</small>-->\n    <!--</h2>-->\n\n    <!--<ul class=\"actions m-t-20 hidden-xs\">-->\n    <!--<li class=\"dropdown\" uib-dropdown>-->\n    <!--<a href=\"\" uib-dropdown-toggle>-->\n    <!--<i class=\"zmdi zmdi-more-vert\"></i>-->\n    <!--</a>-->\n\n    <!--<ul class=\"dropdown-menu dropdown-menu-right\">-->\n    <!--<li>-->\n    <!--<a href=\"\">Privacy Settings</a>-->\n    <!--</li>-->\n    <!--<li>-->\n    <!--<a href=\"\">Account Settings</a>-->\n    <!--</li>-->\n    <!--<li>-->\n    <!--<a href=\"\">Other Settings</a>-->\n    <!--</li>-->\n    <!--</ul>-->\n    <!--</li>-->\n    <!--</ul>-->\n    <!--</div>-->\n\n    <div class=\"card note\">\n        <div class=\"card-header\">\n            <h2>New Note:\n                <strong><span ng-if=\"!notesCtrl.note.sermon\">{{notesCtrl.note.title}}</span>\n                    <a ui-sref=\"base.sermon-view({id: notesCtrl.note.sermon.id})\"\n                       ng-if=\"notesCtrl.note.sermon\">\n                        {{notesCtrl.note.sermon.title}}\n                    </a></strong>\n            </h2>\n        </div>\n\n        <div class=\"card-body p-20\">\n            <div class=\"row\" ng-hide=\"notesCtrl.expandNote\">\n                <div class=\"col-sm-6\">\n                    <div class=\"form-group  m-b-30\" ng-class=\"{\'has-error\': notesCtrl.missingTitle}\">\n                        <div class=\"fg-line\">\n                            <label class=\"fg-label\">Sermon Title</label>\n                            <input type=\"text\"\n                                   ng-model=\"notesCtrl.note.title\"\n                                   placeholder=\"Enter sermon title\"\n                                   uib-typeahead=\"s.label for s in notesCtrl.findSermon($viewValue)\"\n                                   typeahead-loading=\"loadingSermon\"\n                                   typeahead-on-select=\"notesCtrl.sermonSelect($item, $model)\"\n                                   typeahead-no-results=\"noResults\"\n                                   class=\"form-control\">\n\n                        </div>\n                    </div>\n                    <div class=\"form-group  m-b-30\">\n                        <div class=\"fg-line\">\n                            <label class=\"fg-label\">Preacher</label>\n                            <input type=\"text\"\n                                   ng-model=\"notesCtrl.note.pastor\"\n                                   placeholder=\"Enter preacher\'s name\"\n                                   uib-typeahead=\"p.full_name for p in notesCtrl.findPastor($viewValue)\"\n                                   typeahead-loading=\"loadingPastor\"\n                                   typeahead-on-select=\"notesCtrl.pastorSelect($item)\"\n                                   typeahead-no-results=\"noResults\"\n\n                                   class=\"form-control\">\n\n                        </div>\n                    </div>\n                    <div class=\"form-group  m-b-30\">\n                        <div class=\"fg-line\">\n                            <label class=\"fg-label\">Church</label>\n                            <input type=\"text\"\n                                   ng-model=\"notesCtrl.note.church\"\n                                   placeholder=\"Enter church\'s name\"\n                                   uib-typeahead=\"c.name for c in notesCtrl.findChurch($viewValue)\"\n                                   typeahead-loading=\"loadingSermon\"\n                                   typeahead-on-select=\"notesCtrl.churchSelect($item)\"\n                                   typeahead-no-results=\"noResults\"\n                                   class=\"form-control\">\n\n                        </div>\n                    </div>\n\n                    <div class=\"form-group  m-b-30\">\n                        <div class=\"fg-line\">\n                            <label class=\"fg-label\">Main Scripture(s)</label>\n                            <md-chips\n                                    ng-model=\"notesCtrl.note.scriptures\"\n                                    chip-show-modal-on-click\n                                    md-transform-chip=\"notesCtrl.onScriptureAdd($chip)\"\n                                    placeholder=\"Enter a scripture\"\n                                    secondary-placeholder=\"e.g John 3:16\">\n                            </md-chips>\n                            <small style=\"color:#9e9e9e; float: right\" class=\"help-block\">\n                                Type a\n                                scripture\n                                then press enter.\n                            </small>\n\n                        </div>\n\n                    </div>\n\n                </div>\n            </div>\n            <div class=\"row\">\n                <div class=\"col-sm-12\">\n                    <div class=\"note-info\">\n                      <span class=\"text-left f-10 m-r-20\"\n                            ng-if=\"notesCtrl.note.modified_at\"\n                            style=\"height: 20px\">\n                        Last modified: {{notesCtrl.note.modified_at | formatDate:\'MMM D, YYYY [at] h:mm a\'}}\n                      </span>\n                        <span ng-if=\"notesCtrl.missingTitle\"\n                              class=\"c-red\">Please enter a sermon title before typing. <strong>Your notes are not\n                            saved!</strong></span>\n                    <span class=\"text-right f-1-\"\n                          style=\"height: 20px\">\n                        <span ng-show=\"notesCtrl.note.saving\">Saving...</span>\n                    </span>\n                        <div>\n                            <a href ng-click=\"notesCtrl.expandNote=true\"\n                               ng-show=\"!notesCtrl.expandNote\"\n                            >\n                                <md-icon class=\"pull-right\" md-svg-src=\"/img/icons/arrow_upward_black.svg\">\n                                    <md-tooltip class=\"hidden-xs\" md-direction=\"top\">\n                                        Expand note\n                                    </md-tooltip>\n                                </md-icon>\n                            </a>\n                            <a href ng-click=\"notesCtrl.expandNote=false\" ng-show=\"notesCtrl.expandNote\">\n                                <md-icon class=\"pull-right\" md-svg-src=\"/img/icons/arrow_downward_black.svg\">\n                                    <md-tooltip class=\"hidden-xs\" md-direction=\"top\">\n                                    </md-tooltip>\n                                </md-icon>\n                            </a>\n                        </div>\n                    </div>\n                    <wysiwyg-edit class=\"note_editor\"\n                                  config=\"editorConfig\"\n                                  content=\"notesCtrl.note.notes\">\n                        <!--<auto-save note=\"notesCtrl.note\"></auto-save>-->\n                    </wysiwyg-edit>\n                </div>\n\n            </div>\n        </div>\n    </div>\n\n</div>\n\n\n");
$templateCache.put("module/notes/note.html","<div class=\"container\">\n\n    <!--<div class=\"block-header\">-->\n    <!--<h2>Data Tables-->\n    <!--<small>ng-table is a powerfull AngularJs ready Data Table with tons of customizable options. Read more <a-->\n    <!--target=\"_blank\" href=\"http://ng-table.com/#/\">here</a> for detailed documentation and HowTos...-->\n    <!--</small>-->\n    <!--</h2>-->\n\n    <!--<ul class=\"actions m-t-20 hidden-xs\">-->\n    <!--<li class=\"dropdown\" uib-dropdown>-->\n    <!--<a href=\"\" uib-dropdown-toggle>-->\n    <!--<i class=\"zmdi zmdi-more-vert\"></i>-->\n    <!--</a>-->\n\n    <!--<ul class=\"dropdown-menu dropdown-menu-right\">-->\n    <!--<li>-->\n    <!--<a href=\"\">Privacy Settings</a>-->\n    <!--</li>-->\n    <!--<li>-->\n    <!--<a href=\"\">Account Settings</a>-->\n    <!--</li>-->\n    <!--<li>-->\n    <!--<a href=\"\">Other Settings</a>-->\n    <!--</li>-->\n    <!--</ul>-->\n    <!--</li>-->\n    <!--</ul>-->\n    <!--</div>-->\n\n    <div class=\"card note\">\n        <div class=\"card-header\">\n            <h2><a ui-sref=\"base.notes\" class=\"c-gray\">My Notes > </a><span\n                    ng-if=\"!notesCtrl.note.sermon\">{{notesCtrl.note.title}}</span>\n                <a ui-sref=\"base.sermon-view({id: notesCtrl.note.sermon.id})\"\n                   ng-if=\"notesCtrl.note.sermon\">\n                    {{notesCtrl.note.sermon.title}}\n                </a>\n                <small> by\n                    <span ng-if=\"!notesCtrl.note.sermon\">{{notesCtrl.note.pastor}}</span>\n\n                    <name-tag ng-if=\"notesCtrl.note.sermon\"\n                              user=\"notesCtrl.note.sermon.pastor\">\n\n                    </name-tag>\n                </small>\n\n            </h2>\n        </div>\n\n        <div class=\"card-body\">\n            <div class=\"row\">\n                <div class=\"col-sm-12\">\n                      <span class=\"text-left f-10 m-r-20\"\n                            style=\"height: 20px\">\n                        Last modified: {{notesCtrl.note.modified_at | formatDate:\'MMM D, YYYY [at] h:mm a\'}}\n                      </span>\n                    <span class=\"text-right f-1-\"\n                          style=\"height: 20px\">\n                        <strong><span ng-show=\"notesCtrl.note.saving\">Saving...</span></strong>\n                    </span>\n                    <wysiwyg-edit class=\"writenote\"\n                                  config=\"editorConfig\"\n                                  content=\"notesCtrl.note.notes\">\n                        <auto-save note=\"notesCtrl.note\"></auto-save>\n                    </wysiwyg-edit>\n                </div>\n\n            </div>\n        </div>\n    </div>\n\n</div>\n\n\n");
$templateCache.put("module/notes/notes.html","<div class=\"container\">\n\n    <div class=\"card\">\n        <div class=\"card-header\">\n            <h2>My Notes\n                <!--<small>With lease settings enabled.</small>-->\n            </h2>\n        </div>\n\n        <div class=\"card-body\">\n            <p class=\"p-20\" ng-if=\"notesCtrl.notes.total == 0\">\n                You have not created any notes. Click <a ui-sref=\"base.new-note\">here</a> to a create a new note.</p>\n            <md-table-container ng-if=\"notesCtrl.notes.total > 0\">\n\n                <table md-table md-progress=\"notesCtrl.promise\">\n                    <thead md-head>\n                    <tr md-row>\n                        <th md-column><span>Title</span></th>\n                        <th md-column><span>Date Created</span></th>\n                        <th class=\"hidden-xs\" md-column>Preacher</th>\n                        <th class=\"hidden-xs\" md-column>Church</th>\n                        <th md-column></th>\n                    </tr>\n                    </thead>\n                    <tbody md-body>\n                    <tr md-row ng-repeat=\"note in notesCtrl.notes.notes\">\n                        <td md-cell>\n                            <span ng-if=\"!note.sermon\">{{note.title}}</span>\n                            <a ui-sref=\"base.sermon-view({id: note.sermon.id})\" ng-if=\"note.sermon\">\n                                {{note.sermon.title}}\n                            </a>\n                        </td>\n                        <td md-cell=\"\">\n                            {{note.created_at | formatDate}}\n                        </td>\n                        <td class=\"hidden-xs\" md-cell>\n                            <span ng-if=\"!note.sermon && !note.pastor.id\">{{note.pastor}}</span>\n                            <span ng-if=\"!note.sermon && note.pastor.id\">\n                                <name-tag user=\"note.pastor\"></name-tag>\n                            </span>\n                            <a href ng-if=\"note.sermon\">\n                                <span>{{note.sermon.pastor.title}}</span>\n                                <span>{{note.sermon.pastor.first_name | sentencecase}}</span>\n                                <span>{{note.sermon.pastor.last_name | sentencecase}}</span>\n                            </a>\n                        </td>\n                        <td class=\"hidden-xs\" md-cell>\n                            <span ng-if=\"!note.sermon\">{{note.church.name}}</span>\n                            <a href ng-if=\"note.sermon\">\n                                <span>{{note.sermon.church.name}}</span>\n                            </a>\n                        </td>\n                        <td md-cell>\n                            <a ui-sref=\"base.note({id: note.id})\"\n                               class=\"c-black f-20\"><i class=\"zmdi zmdi-open-in-browser zmdi-hc-fw\"></i></a>\n                        </td>\n                    </tr>\n                    </tbody>\n                </table>\n            </md-table-container>\n            <md-table-pagination md-limit=\"notesCtrl.notes.page_size\"\n                                 ng-if=\"notesCtrl.notes.total > 0\"\n                                 md-page=\"notesCtrl.notes.page\"\n                                 md-total=\"{{notesCtrl.notes.total}}\">\n\n            </md-table-pagination>\n\n        </div>\n    </div>\n\n</div>\n\n\n");
$templateCache.put("module/read/ask-comment.modal.html","<md-dialog aria-label=\"Mango (Fruit)\" style=\"max-height: 100%\">\n    <md-toolbar style=\"background-color: #f7f7f7\">\n        <div class=\"md-toolbar-tools\">\n            <h2>Ask for Comments</h2>\n            <span flex></span>\n            <md-button class=\"md-icon-button\" ng-click=\"cancel()\">\n                <md-icon md-svg-src=\"img/icons/ic_close_24px.svg\" aria-label=\"Close dialog\"></md-icon>\n            </md-button>\n        </div>\n    </md-toolbar>\n    <form>\n        <md-dialog-content>\n            <div class=\"md-dialog-content\">\n                <p><label>Selected scripture</label><br/>\n                    John 3:16\n                </p>\n\n                <form submit-on=\"submitReqestForm\" id=\"reqForm\" ng-submit=\"reqCtrl.submitForm()\">\n                    <!--<form submit-on=\"submitRequestEvent\" ng-submit=\"reqCtrl.submitForm()\">-->\n                    <submit-on></submit-on>\n                    <div class=\"form-group fg-line\">\n                        <label for=\"headline\">Headline</label>\n                        <input type=\"headline\" class=\"form-control input-sm\" id=\"headline\"\n                               placeholder=\"Enter email\">\n                    </div>\n                    <div class=\"form-group fg-line\">\n                        <label for=\"context\">What\'s on your mind?</label>\n                        <textarea class=\"form-control input-sm\"\n                                  id=\"context\" placeholder=\"\">\n                            </textarea>\n                    </div>\n                    <div class=\"form-group fg-line\">\n                        <label for=\"context\">Tags (e.g finance, relationship, salvation etc)</label>\n                        <md-chips ng-model=\"reqCtrl.tags\">\n                        </md-chips>\n                    </div>\n                    <div class=\"form-group fg-line\">\n                        <label for=\"context\">Commentators</label>\n                        <textarea class=\"form-control input-sm\" ng-model=\"commentators\"\n                                  id=\"commentators\" placeholder=\"who do you want to comment?\">\n                        </textarea>\n\n                    </div>\n                    <!--<div class=\"form-group fg-line\">-->\n                    <!--<md-chips ng-model=\"tags\">-->\n                    <!--</md-chips>-->\n                    <!--</div>-->\n                    <div class=\"form-group\">\n                        <label style=\"padding: 0px\">Can\'t find who you want to comment?\n                            Invite a friend, pastor or spiritual mentor to comment</label>\n\n                        <div class=\"row\" ng-repeat=\"invite in reqCtrl.request.invites\">\n                            <div class=\"col-xs-3\">\n                                <md-input-container>\n                                    <md-select ng-model=\"invite.type\">\n                                        <md-option value=\"email\">email</md-option>\n                                        <md-option value=\"twitter\">twitter</md-option>\n                                    </md-select>\n                                </md-input-container>\n                            </div>\n                            <div class=\"col-xs-6\">\n                                <div class=\"form-group fg-line\" ng-if=\"invite.type==\'email\'\">\n                                    <label class=\"sr-only\">Email address</label>\n                                    <input ng-model=\"invite.email\"\n                                           type=\"email\" class=\"form-control input-sm\" placeholder=\"Enter email\">\n                                </div>\n                                <div class=\"form-group fg-line\" ng-if=\"invite.type==\'twitter\'\">\n                                    <label class=\"sr-only\">Twitter Handle</label>\n                                    <input ng-model=\"invite.handle\"\n                                           type=\"text\" class=\"form-control input-sm\" placeholder=\"@twitter_handle\">\n                                </div>\n                            </div>\n                            <div class=\"col-xs-3\" style=\"padding-top: 5px;\">\n                                <a style=\"font-size:18px\" href ng-click=\"reqCtrl.newInvite()\">\n                                    <i class=\"zmdi zmdi-plus zmdi-hc-fw\"></i>\n                                </a>\n                                <a ng-if=\"$index > 0\" style=\"font-size:18px\" href\n                                   ng-click=\"reqCtrl.removeInvite($index)\">\n                                    <i class=\"zmdi zmdi-minus zmdi-hc-fw\"></i>\n                                </a>\n                            </div>\n                        </div>\n\n                    </div>\n                </form>\n                <!--</form>-->\n            </div>\n        </md-dialog-content>\n        <md-dialog-actions layout=\"row\">\n            <!--<md-button href=\"http://en.wikipedia.org/wiki/Mango\" target=\"_blank\" md-autofocus>-->\n            <!--More on Wikipedia-->\n            <!--</md-button>-->\n            <span flex></span>\n            <md-button class=\"md-primary\" ng-click=\"reqCtrl.$scope.$broadcast(\'submitReqestForm\')\">\n                Post\n            </md-button>\n            <md-button ng-click=\"answer(\'useful\')\" style=\"margin-right:20px;\">\n                Cancel\n            </md-button>\n        </md-dialog-actions>\n    </form>\n</md-dialog>");
$templateCache.put("module/read/read.html","<section id=\"main\">\n    <section id=\"content\">\n        <div class=\"container\">\n            <scripture-card text=\"readCtrl.scripture\"></scripture-card>\n        </div>\n    </section>\n</section>");
$templateCache.put("module/sermon/browse.html","<div class=\"container\">\n\n    <div class=\"block-header\">\n        <h2 ng-if=\"sermonCtrl.church\">Church: <strong>{{sermonCtrl.church.name}}</strong>  </h2>\n    </div>\n\n    <div class=\"card\">\n        <div class=\"card-header\">\n            <h2>Browse Sermons\n                <small>View published sermons by your church. You can use the\n                    <a href ng-click=\"sermonCtrl.switchView(\'calendar\')\">calendar view</a> to find sermons for a\n                    particular month and year or use the\n                    <a ng-click=\"sermonCtrl.switchView(\'table\')\" href>table view</a> to view all available sermons\n                    at a glance.\n                </small>\n            </h2>\n\n\n            <ul class=\"actions\">\n                <!--<li>-->\n                <!--<a href=\"\">-->\n                <!--<i class=\"zmdi zmdi-trending-up\"></i>-->\n                <!--</a>-->\n                <!--</li>-->\n                <!--<li>-->\n                <!--<a href=\"\">-->\n                <!--<i class=\"zmdi zmdi-check-all\"></i>-->\n                <!--</a>-->\n                <!--</li>-->\n                <li class=\"dropdown\" uib-dropdown>\n                    <a href=\"\" uib-dropdown-toggle>\n                        <i class=\"zmdi zmdi-more-vert\"></i>\n                    </a>\n\n                    <ul class=\"dropdown-menu dropdown-menu-right\">\n                        <!--<li>-->\n                        <!--<a href=\"\">View sermons by Pastor</a>-->\n                        <!--</li>-->\n                        <!--<li>-->\n                        <!--<a href=\"\">View sermons by Church</a>-->\n                        <!--</li>-->\n                        <li>\n                            <a href ng-click=\"sermonCtrl.switchView()\">Switch to {{sermonCtrl.switchTo}} View</a>\n                        </li>\n                        <!--<li>-->\n                        <!--<a href=\"\">Widgets Settings</a>-->\n                        <!--</li>-->\n                    </ul>\n                </li>\n            </ul>\n        </div>\n\n\n        <!--<div class=\"block-header\">-->\n        <!---->\n\n        <!--</div>-->\n        <div class=\"card-body\">\n            <div ng-if=\"sermonCtrl.sermons\">\n                <div id=\"calendar\" data-calendar\n                     ng-if=\"sermonCtrl.layout==\'calendar\'\"\n                     data-cal-add-sermon\n                     data-events=\"sermonCtrl.sermons.sermons\"\n                     data-action-links=\"sermonCtrl.actionMenu\"\n                     data-event-click=\"sermonCtrl.onEventSelect\"\n                     data-select=\"sermonCtrl.onSelect(start, end)\">\n                </div>\n\n            </div>\n            <div id=\"table\" ng-if=\"sermonCtrl.layout==\'table\'\">\n                <md-table-container>\n                    <table md-table md-progress=\"sermonCtrl.promise\">\n                        <thead md-head>\n                        <tr md-row>\n                            <th md-column><span>Date Created</span></th>\n                            <th md-column><span>Title</span></th>\n                            <th md-column><span>Pastor</span></th>\n                            <th class=\"hidden-xs\" md-column><span>Church</span></th>\n                            <th class=\"hidden-xs\" md-column><span>Views</span></th>\n                            <th class=\"hidden-xs\" md-column><span>Likes</span></th>\n                        </tr>\n                        </thead>\n                        <tbody md-body>\n                        <tr md-row ng-repeat=\"sermon in sermonCtrl.sermons.sermons\">\n                            <td md-cell=\"\">\n                                {{sermon.created_at | formatDate}}\n                            </td>\n                            <td md-cell>\n                                <a ui-sref=\"base.sermon-view({id: sermon.id})\">\n                                    {{sermon.title}}\n                                </a>\n                            </td>\n\n                            <td  md-cell>\n                                <name-tag class=\"c-black\" user=\"sermon.pastor\"></name-tag>\n                            </td>\n                            <td class=\"hidden-xs\" md-cell>\n                                <a href>\n                                    <span>{{sermon.church.name}}</span>\n                                </a>\n                            </td>\n                            <td md-cell class=\"hidden-xs\">\n                                {{sermon.view_count}}\n                            </td>\n                            <td md-cell class=\"hidden-xs\">\n                                {{sermon.like_count}}\n                            </td>\n                        </tr>\n                        </tbody>\n                    </table>\n                </md-table-container>\n                <md-table-pagination md-limit=\"sermonCtrl.sermons.page_size\"\n                                     md-page=\"sermonCtrl.page\"\n                                     md-total=\"{{sermonCtrl.sermons.total}}\"\n\n                ></md-table-pagination>\n            </div>\n        </div>\n    </div>\n</div>");
$templateCache.put("module/sermon/comment_popover.html","<div>\n    <div>Vivamus sagittis lacus vel augue laoreet rutrum faucibus.</div>\n    <div class=\"form-group fg-line m-b-0 m-t-20\">\n        <input type=\"text\" class=\"form-control\" placeholder=\"Just put something...\">\n    </div>\n</div>");
$templateCache.put("module/sermon/create.html","<!-- ideas todo\n   show bible in side\n   allow user to specify translation\n    -->\n<div class=\"container\">\n    <div class=\"card\" id=\"sermon\">\n        <form id=\"sermonForm\">\n            <div class=\"listview lv-bordered lv-lg\">\n                <div class=\"lv-header-alt clearfix\">\n                    <h2 class=\"lvh-label\" style=\"font-size: 20px\">New Sermon</h2>\n                    <!--<div class=\"lvh-search\"-->\n                    <!---->\n                    <!--data-ng-click=\"mactrl.listviewSearchStat\">-->\n                    <!--<input type=\"text\" placeholder=\"Start typing...\"-->\n                    <!--class=\"lvhs-input\">-->\n                    <!--<i class=\"lvh-search-close\"-->\n                    <!--data-ng-click=\"mactrl.listviewSearchStat = false\">&times;</i>-->\n                    <!--</div>-->\n                </div>\n                <div class=\"lv-body\" style=\"padding: 20px\">\n                    <div class=\"row m-b-20\">\n                        <div class=\"col-sm-8\">\n                            <h4 class=\"m-b-10\">Sermon Title</h4>\n                            <div class=\"form-group\"\n                                 ng-class=\"{\'has-error\': sermonCtrl.submitted && sermonCtrl.sermon.title.length < 1}\">\n                                <div class=\"fg-line\">\n                                    <input type=\"text\"\n                                           class=\"form-control input-sm\"\n                                           style=\"font-size: 16px\"\n                                           ng-model=\"sermonCtrl.sermon.title\"\n                                           placeholder=\"Sermon Title\">\n                                </div>\n                                <small ng-show=\"sermonCtrl.submitted && sermonCtrl.sermon.title.length < 1\"\n                                       class=\"help-block\">Sermon title cannot be\n                                    empty\n                                </small>\n                            </div>\n                        </div>\n                    </div>\n                    <div class=\"row m-b-20\">\n                        <div class=\"col-sm-8\">\n                            <h4 class=\"m-b-10\">Sermon Date</h4>\n                            <div class=\"row\"\n                                 ng-repeat=\"d in sermonCtrl.sermon._dates\">\n                                <div class=\"col-sm-4\">\n                                    <div class=\"form-group pull-left p-t-25 p-b-0\">\n                                        <p class=\"input-group p-b-0\">\n                                            <input type=\"text\"\n                                                   class=\"form-control\"\n                                                   uib-datepicker-popup=\"yyyy-MM-dd\"\n                                                   ng-model=\"d.date\"\n                                                   is-open=\"status.opened\"\n                                                   close-text=\"Close\"/>\n                                 <span class=\"input-group-btn\">\n                                 <button type=\"button\"\n                                         class=\"btn btn-default\"\n                                         ng-click=\"status.opened=true\"><i\n                                         class=\"glyphicon glyphicon-calendar\"></i>\n                                 </button>\n                                 </span>\n                                        </p>\n                                        <!--<small ng-show=\"sermonCtrl.submitted && sermonCtrl.sermon.title.length < 1\"-->\n                                        <!--class=\"help-block\">Sermon title cannot be empty-->\n                                        <!--</small>-->\n                                    </div>\n                                </div>\n                                <div class=\"col-sm-3\">\n                                    <p class=\"input-group\">\n                                        <uib-timepicker ng-model=\"d.date\"\n                                                        ng-change=\"changed()\"\n                                                        minute-step=\"5\"\n                                                        show-meridian=\"true\"></uib-timepicker>\n                                    </p>\n                                </div>\n                                <div class=\"col-sm-2 p-t-20\">\n                                    <a ng-if=\"$index > 0\" href\n                                       ng-click=\"sermonCtrl.sermon._dates.splice($index, 1)\">\n                                        <i class=\"f-20  p-t-15 zmdi zmdi-close zmdi-hc-fw\"></i>\n                                    </a>\n                                </div>\n                            </div>\n                            <a href data-ng-click=\"sermonCtrl.addDate()\">\n                                Add another date</a>\n                        </div>\n                    </div>\n                    <div class=\"row m-b-20\">\n                        <div class=\"col-sm-8\">\n                            <h4>Main Scriptures</h4>\n                            <div class=\"form-group\"\n                                 ng-class=\"{\'has-error\': sermonCtrl.submitted && sermonCtrl.sermon.scriptures.length < 1}\">\n                                <div class=\"fg-line\">\n                                    <!--<label>Main Scriptures</label>-->\n                                    <md-chips\n                                            ng-model=\"sermonCtrl.sermon.scriptures\"\n                                            chip-show-modal-on-click\n                                            md-transform-chip=\"sermonCtrl.onScriptureAdd($chip)\"\n                                            placeholder=\"Enter a scripture\"\n                                            secondary-placeholder=\"e.g John 3:16\"\n                                    >\n                                    </md-chips>\n                                </div>\n                                <small style=\"color:#9e9e9e; float: right\"\n                                       class=\"help-block\">Type a\n                                    scripture\n                                    then press enter.\n                                </small>\n                                <small ng-show=\"sermonCtrl.submitted && sermonCtrl.sermon.scriptures.length < 1 \"\n                                       class=\"help-block\">This field is required\n                                </small>\n                            </div>\n                        </div>\n                    </div>\n                    <div class=\"row\">\n                        <div class=\"col-sm-12\">\n                            <md-tabs md-dynamic-height md-border-bottom md-selected=\"sermonCtrl.selectedTab\">\n                                <md-tab label=\"Summary\">\n                                    <md-content class=\"md-padding\">\n                                        <p>Provide a short summary or introduction for sermon. This is highly\n                                            recommended but not required.</p>\n                                        <div class=\"row\">\n                                            <div class=\"col-md-12\">\n                                                <wysiwyg-edit\n                                                        class=\"summary\"\n                                                        config=\"editorConfig\"\n                                                        content=\"sermonCtrl.sermon.summary\">\n\n                                                </wysiwyg-edit>\n                                            </div>\n                                        </div>\n\n                                    </md-content>\n                                </md-tab>\n                                <md-tab label=\"Sermon Notes\">\n                                    <md-content class=\"md-padding\">\n\n\n                                        <div class=\"m-b-10\">\n                                            <span>Enter the main sermon notes here.</span>\n                                            <span ng-if=\"sermonCtrl.noteStyle == \'note\'\">\n                                                  <a ng-click=\"sermonCtrl.noteStyle=\'point\'\" href>\n                                                      <strong>Switch to point style</strong>\n                                                  </a>\n                                            <small>(note is a list of specific points)</small>\n                                            </span>\n\n                                             <span ng-if=\"sermonCtrl.noteStyle == \'point\'\">\n                                                  <a ng-click=\"sermonCtrl.noteStyle=\'note\'\"\n                                                     href>\n                                                      <strong>Switch to note style</strong>\n\n                                                  </a>\n                                           <small>(note is free form text)</small>\n                                            </span>\n\n                                        </div>\n\n\n                                        <div class=\"style_point\" ng-if=\"sermonCtrl.noteStyle == \'point\'\">\n                                            <div class=\"row\"\n                                                 ng-repeat=\"note in sermonCtrl.sermon.notes \">\n                                                <div class=\"col-sm-2\"\n                                                     style=\"padding-top: 20px; text-align: center\">\n                                                    <h4>{{$index + 1}}</h4>\n                                                    <a class=\"f-25\" href\n                                                       ng-click=\"sermonCtrl.sermon.notes.push({content:\'\'})\">\n                                                        <i class=\"zmdi zmdi-plus-circle\"></i>\n                                                    </a>\n                                                    <a ng-if=\"$index > 0\" href\n                                                       class=\"c-red f-25\"\n                                                       ng-click=\"sermonCtrl.sermon.notes.splice($index, 1)\">\n                                                        <i class=\"zmdi zmdi-minus-circle\"></i>\n                                                    </a>\n                                                </div>\n                                                <div class=\"col-sm-9\"\n                                                     ng-class=\"{\'has-error\' : sermonCtrl.submitted && note.content.length == 0}\">\n                                                    <div class=\"form-group\">\n                                                        <wysiwyg-edit\n                                                                class=\"point\"\n                                                                config=\"editorConfig\"\n                                                                content=\"note.content\"></wysiwyg-edit>\n                                                    </div>\n                                                    <small ng-if=\"$index == 0 &&\n                                       sermonCtrl.submitted && note.content.length < 1\"\n                                                           class=\"help-block\">At\n                                                        least one sermon note is\n                                                        required\n                                                    </small>\n                                                </div>\n\n                                            </div>\n                                        </div>\n                                        <div class=\"style_note\" ng-if=\"sermonCtrl.noteStyle == \'note\'\">\n                                            <div class=\"row\">\n                                                <div class=\"col-md-12\">\n                                                    <wysiwyg-edit\n                                                            config=\"editorConfig\"\n                                                            content=\"sermonCtrl.sermon.note\"></wysiwyg-edit>\n                                                    <small ng-if=\"sermonCtrl.submitted && sermonCtrl.sermon.note.trim().length == 0\"\n                                                           class=\"help-block\">At\n                                                        least one sermon note is\n                                                        required\n                                                    </small>\n                                                </div>\n                                            </div>\n                                        </div>\n                                    </md-content>\n                                </md-tab>\n                                <md-tab label=\"Sermon Questions\">\n                                    <md-content class=\"md-padding\">\n                                        <p>Enter questions for readers to reflect on. This is highly\n                                            recommended but not required.</p>\n                                        <div class=\"row\"\n                                             ng-repeat=\"question in sermonCtrl.sermon.questions\">\n                                            <div class=\"col-sm-2\" style=\"padding-top: 20px; text-align: center\">\n                                                <h4>{{$index + 1}}</h4>\n                                                <a class=\"f-25\" href\n                                                   ng-click=\"sermonCtrl.sermon.questions.push({content:\'\'})\">\n                                                    <i class=\"zmdi zmdi-plus-circle\"></i>\n                                                </a>\n                                                <a ng-if=\"$index > 0\" href\n                                                   class=\"c-red f-25\"\n                                                   ng-click=\"sermonCtrl.sermon.questions.splice($index, 1)\">\n                                                    <i class=\"zmdi zmdi-minus-circle\"></i>\n                                                </a>\n                                            </div>\n                                            <div class=\"col-sm-9\">\n                                                <div class=\"form-group\">\n                                                    <wysiwyg-edit class=\"point\"\n                                                                  config=\"editorConfig\"\n                                                                  content=\"question.content\"></wysiwyg-edit>\n                                                </div>\n                                            </div>\n                                        </div>\n                                    </md-content>\n                                </md-tab>\n                            </md-tabs>\n                        </div>\n                    </div>\n                    <div class=\"row\">\n                        <div class=\"col-sm-12\">\n                            <div class=\"btn-group dropdown m-r-5\" uib-dropdown>\n                                <button title=\"button\" class=\"btn btn-default btn-sm waves-effect\">\n                                    <span ng-if=\"!sermonCtrl.sermon.privacy\">Who should see this?</span>\n                                    <span ng-if=\"sermonCtrl.sermon.privacy\">{{sermonCtrl.sermon.privacy}}</span>\n                                </button>\n                                <button type=\"button\"\n                                        class=\"btn btn-default dropdown-toggle waves-effect\"\n                                        uib-dropdown-toggle>\n                                    <span class=\"caret\"></span>\n                                    <span class=\"sr-only\">Split button dropdowns</span>\n                                </button>\n                                <ul class=\"dropdown-menu privacy\">\n                                    <li ng-class=\"{selected: sermonCtrl.sermon.privacy==p.key}\"\n                                        data-ng-repeat=\"p in sermonCtrl.privacy\">\n                                        <a ng-click=\"sermonCtrl.sermon.privacy=p.key\"\n                                           href>{{p.value}} <br>\n                                            <strong class=\"m-t-5\">{{p.info\n                                                }}</strong></a>\n                                    </li>\n                                </ul>\n                                </ul>\n                            </div>\n                            <button ng-click=\"sermonCtrl.publish()\" class=\"m-r-5 btn btn-primary waves-effect\">\n                                Publish\n                            </button>\n                            <button ng-click=\"sermonCtrl.save()\" class=\"btn btn-default waves-effect\">\n                                Save\n                            </button>\n                            <!--<md-button-->\n                            <!--ng-click=\"sermonCtrl.publish()\"-->\n                            <!--class=\"md-raised  btn-sm  c-white bgm-blue\">-->\n                            <!--Publish-->\n                            <!--</md-button>-->\n                            <!--<md-button-->\n                            <!--ng-class=\"btn-sm\"-->\n                            <!--ng-click=\"sermonCtrl.save()\"-->\n                            <!--class=\"md-raised\">-->\n                            <!--Save-->\n                            <!--</md-button>-->\n                        </div>\n                    </div>\n                </div>\n        </form>\n    </div>\n</div>\n");
$templateCache.put("module/sermon/new-sermon-modal.html","<!--<div class=\"modal\">-->\n    <!--<div class=\"modal-dialog\">-->\n        <!--<div class=\"modal-content\">-->\n            <!--<div class=\"modal-header\">-->\n                <!--<h4 class=\"modal-title\">Modal title</h4>-->\n            <!--</div>-->\n            <!--<div class=\"modal-body\">-->\n            <!--Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin sodales orci ante, sed ornare eros vestibulum ut. Ut accumsan vitae eros sit amet tristique. Nullam scelerisque nunc enim, non dignissim nibh faucibus ullamcorper. Fusce pulvinar libero vel ligula iaculis ullamcorper. Integer dapibus, mi ac tempor varius, purus nibh mattis erat, vitae porta nunc nisi non tellus. Vivamus mollis ante non massa egestas fringilla. Vestibulum egestas consectetur nunc at ultricies. Morbi quis consectetur nunc.-->\n            <!--</div>-->\n            <!--<div class=\"modal-footer\">-->\n                <!--<button type=\"button\" class=\"btn btn-link\">Save changes</button>-->\n                <!--<button type=\"button\" class=\"btn btn-link\" data-dismiss=\"modal\">Close</button>-->\n            <!--</div>-->\n        <!--</div>-->\n    <!--</div>-->\n<!--</div>-->\n<md-dialog aria-label=\"Mango (Fruit)\"  ng-cloak>\n  <form>\n    <md-toolbar>\n      <div class=\"md-toolbar-tools\">\n        <h2>Mango (Fruit)</h2>\n        <span flex></span>\n        <md-button class=\"md-icon-button\" ng-click=\"cancel()\">\n          <md-icon md-svg-src=\"img/icons/ic_close_24px.svg\" aria-label=\"Close dialog\"></md-icon>\n        </md-button>\n      </div>\n    </md-toolbar>\n    <md-dialog-content>\n      <div class=\"md-dialog-content\">\n        <h2>Using .md-dialog-content class that sets the padding as the spec</h2>\n        <p>\n          The mango is a juicy stone fruit belonging to the genus Mangifera, consisting of numerous tropical fruiting trees, cultivated mostly for edible fruit. The majority of these species are found in nature as wild mangoes. They all belong to the flowering plant family Anacardiaceae. The mango is native to South and Southeast Asia, from where it has been distributed worldwide to become one of the most cultivated fruits in the tropics.\n        </p>\n      </div>\n    </md-dialog-content>\n    <md-dialog-actions layout=\"row\">\n      <md-button href=\"http://en.wikipedia.org/wiki/Mango\" target=\"_blank\" md-autofocus>\n        More on Wikipedia\n      </md-button>\n      <span flex></span>\n      <md-button ng-click=\"answer(\'not useful\')\">\n       Not Useful\n      </md-button>\n      <md-button ng-click=\"answer(\'useful\')\" style=\"margin-right:20px;\">\n        Useful\n      </md-button>\n    </md-dialog-actions>\n  </form>\n</md-dialog>");
$templateCache.put("module/sermon/scripture_modal.html","<md-dialog aria-label=\"Prov 3:4\">\n    <form>\n        <md-toolbar style=\"background-color: #f7f7f7\">\n            <div class=\"md-toolbar-tools\">\n                <h2>{{modalCtrl.scripture.title}} ({{modalCtrl.scripture.version}})</h2>\n                <span flex></span>\n                <md-button class=\"md-icon-button\" ng-click=\"cancel()\">\n                    <md-icon md-svg-src=\"img/icons/ic_close_24px.svg\" aria-label=\"Close dialog\"></md-icon>\n                </md-button>\n            </div>\n        </md-toolbar>\n        <md-dialog-content>\n            <div class=\"card-body\">\n                <!--{{book_info}}-->\n                <div class=\"chapter\">\n\n                    <div class=\"m-b-10 card-header p-l-0 p-b-5\">\n\n                        <!--<h2 class=\"f-20\" >Chapter {{modalCtrl.scripture.chapter}}</h2>-->\n                        <h2>{{modalCtrl.scripture.book}} </h2>\n                        <ul class=\"actions\">\n                            <li class=\"dropdown\" uib-dropdown>\n                                Select Translation\n                                <a href=\"\" uib-dropdown-toggle>\n\n                                    <i class=\"zmdi zmdi-translate\"></i>\n                                    <md-tooltip>Change translation</md-tooltip>\n                                </a>\n\n                                <ul class=\"dropdown-menu dropdown-menu-right translations\"\n                                    style=\"max-height: 400px; overflow-y: scroll\">\n                                    <li ng-class=\"{selected: modalCtrl.scripture.version == v.abbr }\" ng-repeat=\"v in modalCtrl.versions\">\n                                        <a ng-click=\"modalCtrl.changeTranslation(v)\" href\n                                        >{{::v.title}}</a>\n                                    </li>\n                                </ul>\n                            </li>\n                        </ul>\n                    </div>\n\n                    <h3 class=\"title\">Chapter {{modalCtrl.scripture.chapter}}</h3>\n\n                    <div id=\"verses\">\n                        <p id=\"v{{verse}}\" class=\"verse\" ng-class=\"{highlight: readCtrl.selected[book][verse]}\"\n                           ng-repeat=\"v in modalCtrl.scripture.verses\">\n                            <a href=\"\" ng-click=\"readCtrl.highlight(verse, book)\">\n                                <span style=\"margin-right: 15px\">{{v.verse}}:</span></a>\n                            {{v.content}}\n                        </p>\n                    </div>\n\n                </div>\n            </div>\n\n        </md-dialog-content>\n        <md-dialog-actions layout=\"row\">\n            <span flex></span>\n            <md-button ng-click=\"modalCtrl.dialog.hide()\" style=\"margin-right:20px;\">\n                Close\n            </md-button>\n        </md-dialog-actions>\n    </form>\n</md-dialog>\n");
$templateCache.put("module/sermon/study.html","<div class=\"container\">\n    <div class=\"block-header\">\n        <h2>{{::sermonCtrl.sermon.church.name}}</h2>\n    </div>\n    <div class=\"card\" id=\"profile-main\">\n        <div class=\"pm-overview c-overflow\" ng-hide=\"sermonCtrl.maximize\">\n\n            <div class=\"pmo-block pmo-contact hidden-xs\">\n                <h2>Pastor Info</h2>\n                <h5><name-tag user=\"sermonCtrl.sermon.pastor\"></name-tag>\n                </h5>\n                <ul>\n                    <li><i class=\"zmdi zmdi-email\"></i> {{\n                        sermonCtrl.sermon.pastor.email }}\n                    </li>\n                </ul>\n            </div>\n\n            <div class=\"pmo-block  pmo-contact hidden-xs\">\n                <h2>Church Info</h2>\n\n                <h5>{{::sermonCtrl.sermon.church.name | sentencecase}}</h5>\n                <ul>\n                    <li><i class=\"zmdi zmdi-globe\"></i>\n                        <a href=\"{{::sermonCtrl.sermon.church.website}}\"></a>\n                        {{sermonCtrl.sermon.church.website }}\n                    </li>\n                    <li><i class=\"zmdi zmdi-pin\"></i>\n                        <address class=\"m-b-0\">\n                            {{::sermonCtrl.sermon.church.city }}, <br/>\n                            {{::sermonCtrl.sermon.church.state }}, <br/>\n                            {{::sermonCtrl.sermon.church.country }}\n                        </address>\n                    </li>\n                </ul>\n            </div>\n        </div>\n\n        <div class=\"pm-body clearfix\" ng-class=\"{\'p-l-0\': sermonCtrl.maximize} \">\n\n            <div class=\"pmb-block\">\n                <div class=\"pmbb-header\">\n\n                    <h1 class=\"md-display-3 m-b-5\">\n                        {{::sermonCtrl.sermon.title}}</h1>\n\n                    <p class=\"p-l-5\">by <name-tag user=\"sermonCtrl.sermon.pastor\"></name-tag></p>\n\n                    <div class=\"m-b-25\">\n                        <hr>\n                        <ul class=\"list-inline list-unstyled p-l-5 c-black f-15\">\n                            <li>\n                                <span class=\"c-gray\">{{::sermonCtrl.sermon.view_count}} Views </span>\n                            </li>\n                            <li>\n                                <a class=\"like\"\n                                   ng-class=\"{\'c-gray\': sermonCtrl.user.fav_sermon_keys.indexOf(sermonCtrl.sermon.id) < 0,\n                                   \'c-lightblue\': sermonCtrl.user.fav_sermon_keys.indexOf(sermonCtrl.sermon.id) >= 0}\"\n                                   href ng-click=\"sermonCtrl.likeSermon()\">\n                                    <md-tooltip\n                                            ng-if=\" sermonCtrl.user.fav_sermon_keys.indexOf(sermonCtrl.sermon.id) < 0\"\n                                            md-direction=\"down\">\n                                        Like this sermon\n                                    </md-tooltip>\n                                    <md-tooltip md-direction=\"down\"\n                                                ng-if=\"sermonCtrl.user.fav_sermon_keys.indexOf(sermonCtrl.sermon.id) >= 0\">\n                                        Unlike this sermon\n                                    </md-tooltip>\n                                    <i class=\"m-r-5 m-l-5 zmdi zmdi-thumb-up\"></i> <span\n                                        ng-if=\"sermonCtrl.sermon.like_count > 0\">\n                                    {{sermonCtrl.sermon.like_count}}</span>\n                                    <ng-pluralize\n                                            count=\"sermonCtrl.sermon.likes\"\n                                            when=\"{\'0\': \'Like\', \'one\': \'Like\',\'other\': \'{} Like\'}\">\n                                    </ng-pluralize>\n                                </a>\n                            </li>\n                            <li>\n                                <span class=\"c-gray\"\n                                      ng-if=\"sermonCtrl.sermon.comment_count > 0\"><i\n                                        class=\"m-r-5 m-l-5 zmdi zmdi-comments\"></i> {{sermonCtrl.sermon.comment_count}} <ng-pluralize\n                                        count=\"sermonCtrl.sermon.comments\"\n                                        when=\"{\'one\': \'Comment\',\'other\': \'{} Comments\'}\">\n                                </ng-pluralize></span>\n                            </li>\n                        </ul>\n                        <hr>\n                    </div>\n\n\n                    <div>\n                        <h3>Scripture</h3>\n                        <md-chips ng-model=\"sermonCtrl.sermon.scriptures\"\n                                  readonly=\"true\">\n                            <md-chip-template\n                                    show-scripture-on-click\n                                    scripture=\"$chip\">\n                                <md-tooltip>\n                                    Click to read\n                                </md-tooltip>\n                                <a href> <strong>{{$chip}}</strong></a>\n                            </md-chip-template>\n                        </md-chips>\n                    </div>\n\n\n                    <ul class=\"actions hidden-xs\">\n                        <li><a href ng-click=\"sermonCtrl.maximize = !sermonCtrl.maximize;\">\n                            <i class=\"zmdi \"\n                               ng-class=\"{\'zmdi-window-restore\': sermonCtrl.maximize,\n                               \'zmdi-window-maximize\': !sermonCtrl.maximize}\"></i>\n                        </a></li>\n                    </ul>\n                </div>\n            </div>\n            <div class=\"pmbb-body\">\n                <div class=\"pmbb-view\">\n                    <md-tabs md-dynamic-height md-border-bottom>\n                        <md-tab label=\"Summary\" ng-if=\"sermonCtrl.sermon.summary\">\n                            <md-content class=\"md-padding p-l-0 p-r-0\">\n                                <div class=\"p-20\"><p class=\"f-16\" ng-bind-html=\"sermonCtrl.sermon.summary\"></p></div>\n                            </md-content>\n                        </md-tab>\n                        <md-tab label=\"Sermon Notes\">\n                            <md-content class=\"md-padding p-l-0 p-r-0\">\n                                <!--<md-subheader class=\"md-no-sticky\">3 line item, long paragraph (see on mobile)-->\n                                <!--</md-subheader>-->\n\n\n                                <md-list-item\n                                        class=\"md-2-line md-long-text p-l-0 p-r-0\"\n\n                                        ng-repeat=\"note in ::sermonCtrl.sermon.notes\">\n                                    <!--<img ng-src=\"{{todos[0].face}}?25\" class=\"md-avatar\" alt=\"{{todos[0].who}}\"/>-->\n                                    <div class=\"md-list-item-text \">\n                                        <div class=\"row\">\n                                            <div class=\"col-sm-1 text-center\">{{$index +\n                                                1}}\n                                            </div>\n                                            <div class=\"col-sm-10\">\n                                                <p ng-bind-html=\"note.content\"></p>\n                                            </div>\n                                        </div>\n\n                                    </div>\n                                </md-list-item>\n\n                            </md-content>\n                        </md-tab>\n                        <md-tab label=\"Sermon Questions\">\n                            <md-content class=\"md-padding p-l-0 p-r-0\">\n                                <!--<md-subheader class=\"md-no-sticky\">3 line item, long paragraph (see on mobile)-->\n                                <!--</md-subheader>-->\n\n\n                                <md-list-item\n                                        class=\"md-2-line md-long-text p-l-0 p-r-0\"\n                                        ng-repeat=\"q in ::sermonCtrl.sermon.questions\">\n                                    <!--<img ng-src=\"{{todos[0].face}}?25\" class=\"md-avatar\" alt=\"{{todos[0].who}}\"/>-->\n                                    <div class=\"md-list-item-text \">\n                                        <div class=\"row\">\n                                            <div class=\"col-sm-1 text-center\">{{$index +\n                                                1}}\n                                            </div>\n                                            <div class=\"col-sm-10\">\n                                                <p ng-bind-html=\"q.content\">\n                                                </p>\n                                            </div>\n                                        </div>\n\n                                    </div>\n                                </md-list-item>\n\n                            </md-content>\n                        </md-tab>\n                        <md-tab label=\"My Notes\">\n                            <md-content class=\"md-padding\" id=\"study-note\">\n                                <div class=\"text-right f-12\"\n                                     style=\"height: 20px\">\n                                    <span ng-show=\"sermonCtrl.savingNote\">Saving...</span>\n                                </div>\n                                <loading loader=\"sermonCtrl.loadNote\"></loading>\n                                <wysiwyg-edit class=\"writenote\"\n                                              ng-show=\"!sermonCtrl.loadNote\"\n                                              config=\"editorConfig\"\n                                              content=\"sermonCtrl.sermonNote.notes\"></wysiwyg-edit>\n\n                            </md-content>\n                        </md-tab>\n                        <md-tab label=\"Comments\">\n                            <md-content class=\"md-padding\">\n                                <!--- new comment -->\n                                <div class=\"card wall-posting\">\n                                    <div class=\"card-body card-padding\">\n                                            <textarea class=\"wp-text\"\n                                                      data-auto-size\n                                                      ng-model=\"sermonCtrl.sermonComment.comment\"\n                                                      placeholder=\"Write Something...\"></textarea>\n                                    </div>\n\n                                    <ul class=\"list-unstyled clearfix wpb-actions\">\n                                        <!--<li class=\"wpba-attrs\">-->\n                                        <!--<ul class=\"list-unstyled list-inline m-l-0 m-t-5\">-->\n                                        <!--<li><a data-wpba=\"image\" href=\"\"-->\n                                        <!--data-ng-class=\"{ \'active\': mactrl.wallImage }\"-->\n                                        <!--data-ng-click=\"mactrl.wallImage = true; mactrl.wallVideo = false; mactrl.wallLink = false\"><i-->\n                                        <!--class=\"zmdi zmdi-image\"></i></a></li>-->\n                                        <!--<li><a data-wpba=\"video\" href=\"\"-->\n                                        <!--data-ng-class=\"{ \'active\': mactrl.wallVideo }\"-->\n                                        <!--data-ng-click=\"mactrl.wallVideo= true; mactrl.wallImage = false; mactrl.wallLink = false\"><i-->\n                                        <!--class=\"zmdi zmdi-play-circle\"></i></a></li>-->\n                                        <!--<li><a data-wpba=\"link\" href=\"\"-->\n                                        <!--data-ng-class=\"{ \'active\': mactrl.wallLink }\"-->\n                                        <!--data-ng-click=\"mactrl.wallLink = true; mactrl.wallImage = false; mactrl.wallVideo = false\"><i-->\n                                        <!--class=\"zmdi zmdi-link\"></i></a></li>-->\n                                        <!--</ul>-->\n                                        <!--</li>-->\n\n                                        <li class=\"pull-right\">\n                                            <button ng-click=\"sermonCtrl.postComment()\"\n                                                    class=\"btn btn-primary btn-sm\">\n                                                Post\n                                            </button>\n                                        </li>\n                                    </ul>\n                                </div>\n\n                                <comments\n                                        data=\"sermonCtrl.sermonComments\"></comments>\n                            </md-content>\n                        </md-tab>\n                    </md-tabs>\n\n                </div>\n\n            </div>\n        </div>\n\n\n    </div>\n</div>\n");
$templateCache.put("module/shared/base.html","<header ng-hide=\"$state.current.data.hideHeader\"\n        id=\"header\"\n        ng-class=\"{\'search-toggled\': appCtrl.appService.searchToggle}\"\n        ng-controller=\"headerController as headerCtrl\"\n        data-current-skin=\"blue\">\n\n    <ul class=\"header-inner clearfix\">\n        <li id=\"menu-trigger\"\n            ng-click=\"appCtrl.appService.sidebarToggle.left = !appCtrl.appService.sidebarToggle.left\"\n            data-ng-class=\"{ \'open\': appCtrl.appService.sidebarToggle.left === true }\">\n            <div class=\"line-wrap\">\n                <div class=\"line top\"></div>\n                <div class=\"line center\"></div>\n                <div class=\"line bottom\"></div>\n            </div>\n        </li>\n\n        <li class=\"logo hidden-xs\">\n            <a href=\"/#/home\">scripturedIn</a>\n        </li>\n        <li class=\"pull-right\">\n            <ul class=\"top-menu\">\n\n                <li id=\"toggle-width\">\n                    <div class=\"toggle-switch\">\n                        <input id=\"tw-switch\" type=\"checkbox\" hidden=\"hidden\"\n                               ng-checked=\"appCtrl.appService.layout == 1\"\n                               ng-click=\"appCtrl.switchLayout()\">\n                        <label for=\"tw-switch\" class=\"ts-helper\"></label>\n                    </div>\n                </li>\n\n                <li id=\"top-search\" style=\"padding-top: 8px\">\n                    <a href\n                       data-ng-click=\"appCtrl.appService.searchToggle=true;\">\n                        <i   style=\"font-size: 35px\" class=\"tm-icon zmdi zmdi-search\"></i>\n                    </a>\n                </li>\n            </ul>\n        </li>\n    </ul>\n    <!-- when mobile, reduce width and float right -->\n    <div id=\"top-search-wrap\" class=\"center-search\">\n        <div class=\"tsw-inner hidden-xs\" >\n            <input focus type=\"text\"\n                   data-ng-keypress=\"headerCtrl.onSearchKeyPress($event)\"\n                   data-ng-model=\"headerCtrl.searchTerm\"\n                   placeholder=\"Search for bible verse e.g prob 31, john 3:16, mark 5:1-6\"\n                   style=\"padding: 0 10px 0 20px; font-size: 14px\">\n        </div>\n        <div class=\"tsw-inner\" ng-if=\"appCtrl.appService.searchToggle\">\n            <i id=\"top-search-close\" class=\"zmdi zmdi-arrow-left\" data-ng-click=\"appCtrl.appService.searchToggle=false\"></i>\n            <input focus\n                   type=\"text\"\n                   data-ng-keypress=\"headerCtrl.onSearchKeyPress($event)\"\n                   data-ng-model=\"headerCtrl.searchTerm\"\n                   placeholder=\"Look up bible verse e.g john 3:16\">\n        </div>\n    </div>\n\n    <!--<div ng-include=\"\'module/shared/header.html\'\"></div>-->\n</header>\n\n<section id=\"main\">\n    <aside id=\"sidebar\" data-ng-include=\"\'module/shared/sidebar-left.html\'\"\n           data-ng-class=\"{ \'toggled\': appCtrl.appService.sidebarToggle.left === true }\">\n\n    </aside>\n    <section id=\"content\" class=\"main-page-content\" ui-view=\"content\" autoscroll=\'true\'>\n\n    </section>\n</section>\n\n\n<div class=\"fab-menu\">\n    <md-fab-speed-dial md-open=\"appCtrl.fabMenu.isOpen\" md-direction=\"up\" class=\"md-fling\">\n        <md-fab-trigger>\n            <md-button class=\"md-fab md-warn md-button md-ink-ripple\" type=\"button\" aria-label=\"Add...\">\n                <md-icon md-svg-src=\"/img/icons/add.svg\"></md-icon>\n            </md-button>\n        </md-fab-trigger>\n        <md-fab-actions ng-hide=\"!appCtrl.fabMenu.isOpen\">\n            <md-button ng-if=\"authService.user.is_pastor\"\n                       ui-sref=\"base.sermon-create\" class=\"md-fab md-mini md-button md-ink-ripple\"\n                       aria-label=\"New Sermon\">\n                <md-tooltip md-direction=\"left\">\n                    New Sermon\n                </md-tooltip>\n                <md-icon md-svg-src=\"/img/icons/create.svg\"></md-icon>\n            </md-button>\n            <md-button\n                    ui-sref=\"base.new-note\"\n                    class=\"bgm-blue md-fab md-mini md-button md-ink-ripple\"\n                    aria-label=\"New Note\">\n                <md-tooltip md-direction=\"left\">\n                    New Note\n                </md-tooltip>\n                <md-icon md-svg-src=\"/img/icons/note_add.svg\"></md-icon>\n            </md-button>\n            <!--<md-button class=\"md-fab  md-mini md-primary md-button md-ink-ripple\" aria-label=\"Add Group\">-->\n            <!--<md-icon icon=\"/img/icons/add.svg\"></md-icon>-->\n            <!--</md-button>-->\n            <!--<md-button class=\"md-fab md-mini md-primary md-button md-ink-ripple\" aria-label=\"Add Group\">-->\n            <!--<md-icon icon=\"/img/icons/add.svg\"></md-icon>-->\n            <!--</md-button>-->\n        </md-fab-actions>\n    </md-fab-speed-dial>\n</div>\n\n");
$templateCache.put("module/shared/chat.html","<div class=\"chat-search\">\n    <div class=\"fg-line\">\n        <input type=\"text\" class=\"form-control\" placeholder=\"Search People\">\n    </div>\n</div>\n\n<div class=\"listview\">\n    <a class=\"lv-item\" href=\"\">\n        <div class=\"media\">\n            <div class=\"pull-left p-relative\">\n                <img class=\"lv-img-sm\" src=\"img/profile-pics/2.jpg\" alt=\"\">\n                <i class=\"chat-status-busy\"></i>\n            </div>\n            <div class=\"media-body\">\n                <div class=\"lv-title\">Jonathan Morris</div>\n                <small class=\"lv-small\">Available</small>\n            </div>\n        </div>\n    </a>\n\n    <a class=\"lv-item\" href=\"\">\n        <div class=\"media\">\n            <div class=\"pull-left\">\n                <img class=\"lv-img-sm\" src=\"img/profile-pics/1.jpg\" alt=\"\">\n            </div>\n            <div class=\"media-body\">\n                <div class=\"lv-title\">David Belle</div>\n                <small class=\"lv-small\">Last seen 3 hours ago</small>\n            </div>\n        </div>\n    </a>\n\n    <a class=\"lv-item\" href=\"\">\n        <div class=\"media\">\n            <div class=\"pull-left p-relative\">\n                <img class=\"lv-img-sm\" src=\"img/profile-pics/3.jpg\" alt=\"\">\n                <i class=\"chat-status-online\"></i>\n            </div>\n            <div class=\"media-body\">\n                <div class=\"lv-title\">Fredric Mitchell Jr.</div>\n                <small class=\"lv-small\">Availble</small>\n            </div>\n        </div>\n    </a>\n\n    <a class=\"lv-item\" href=\"\">\n        <div class=\"media\">\n            <div class=\"pull-left p-relative\">\n                <img class=\"lv-img-sm\" src=\"img/profile-pics/4.jpg\" alt=\"\">\n                <i class=\"chat-status-online\"></i>\n            </div>\n            <div class=\"media-body\">\n                <div class=\"lv-title\">Glenn Jecobs</div>\n                <small class=\"lv-small\">Availble</small>\n            </div>\n        </div>\n    </a>\n\n    <a class=\"lv-item\" href=\"\">\n        <div class=\"media\">\n            <div class=\"pull-left\">\n                <img class=\"lv-img-sm\" src=\"img/profile-pics/5.jpg\" alt=\"\">\n            </div>\n            <div class=\"media-body\">\n                <div class=\"lv-title\">Bill Phillips</div>\n                <small class=\"lv-small\">Last seen 3 days ago</small>\n            </div>\n        </div>\n    </a>\n\n    <a class=\"lv-item\" href=\"\">\n        <div class=\"media\">\n            <div class=\"pull-left\">\n                <img class=\"lv-img-sm\" src=\"img/profile-pics/6.jpg\" alt=\"\">\n            </div>\n            <div class=\"media-body\">\n                <div class=\"lv-title\">Wendy Mitchell</div>\n                <small class=\"lv-small\">Last seen 2 minutes ago</small>\n            </div>\n        </div>\n    </a>\n    <a class=\"lv-item\" href=\"\">\n        <div class=\"media\">\n            <div class=\"pull-left p-relative\">\n                <img class=\"lv-img-sm\" src=\"img/profile-pics/7.jpg\" alt=\"\">\n                <i class=\"chat-status-busy\"></i>\n            </div>\n            <div class=\"media-body\">\n                <div class=\"lv-title\">Teena Bell Ann</div>\n                <small class=\"lv-small\">Busy</small>\n            </div>\n        </div>\n    </a>\n</div>\n");
$templateCache.put("module/shared/footer.html","<footer id=\"footer\">\r\n     &copy; 2015 scripturedin\r\n\r\n\r\n    <!--<ul class=\"f-menu\">-->\r\n    <!--<li><a href=\"\">Home</a></li>-->\r\n    <!--<li><a href=\"\">Dashboard</a></li>-->\r\n    <!--<li><a href=\"\">Reports</a></li>-->\r\n    <!--<li><a href=\"\">Support</a></li>-->\r\n    <!--<li><a href=\"\">Contact</a></li>-->\r\n    <!--</ul>-->\r\n</footer>");
$templateCache.put("module/shared/header-image-logo.html","<ul class=\"header-inner clearfix\">\r\n    <li id=\"menu-trigger\" data-target=\"mainmenu\" data-toggle-sidebar data-model-left=\"mactrl.sidebarToggle.left\" data-ng-class=\"{ \'open\': mactrl.sidebarToggle.left === true }\">\r\n        <div class=\"line-wrap\">\r\n            <div class=\"line top\"></div>\r\n            <div class=\"line center\"></div>\r\n            <div class=\"line bottom\"></div>\r\n        </div>\r\n    </li>\r\n\r\n    <li class=\"hidden-xs\">\r\n        <a href=\"index.html\" class=\"m-l-10\" data-ng-click=\"mactrl.sidebarStat($event)\"><img src=\"img/demo/logo.png\" alt=\"\"></a>\r\n    </li>\r\n\r\n    <li class=\"pull-right\">\r\n        <ul class=\"top-menu\">\r\n            <li id=\"top-search\" data-ng-click=\"hctrl.openSearch()\">\r\n                <a href=\"\"><span class=\"tm-label\">Search</span></a>\r\n            </li>\r\n\r\n            <li class=\"dropdown\" uib-dropdown>\r\n                <a uib-dropdown-toggle href=\"\">\r\n                    <span class=\"tm-label\">Messages</span>\r\n                </a>\r\n                <div class=\"dropdown-menu dropdown-menu-lg pull-right\">\r\n                    <div class=\"listview\">\r\n                        <div class=\"lv-header\">\r\n                            Messages\r\n                        </div>\r\n                        <div class=\"lv-body\">\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/1.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">David Belle</div>\r\n                                        <small class=\"lv-small\">Cum sociis natoque penatibus et magnis dis parturient montes</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/2.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">Jonathan Morris</div>\r\n                                        <small class=\"lv-small\">Nunc quis diam diamurabitur at dolor elementum, dictum turpis vel</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/3.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">Fredric Mitchell Jr.</div>\r\n                                        <small class=\"lv-small\">Phasellus a ante et est ornare accumsan at vel magnauis blandit turpis at augue ultricies</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/4.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">Glenn Jecobs</div>\r\n                                        <small class=\"lv-small\">Ut vitae lacus sem ellentesque maximus, nunc sit amet varius dignissim, dui est consectetur neque</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/4.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">Bill Phillips</div>\r\n                                        <small class=\"lv-small\">Proin laoreet commodo eros id faucibus. Donec ligula quam, imperdiet vel ante placerat</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                        </div>\r\n                        <a class=\"lv-footer\" href=\"\">View All</a>\r\n                    </div>\r\n                </div>\r\n            </li>\r\n            <li class=\"dropdown hidden-xs\" uib-dropdown>\r\n                <a uib-dropdown-toggle href=\"\">\r\n                    <span class=\"tm-label\">Notification</span>\r\n                </a>\r\n                <div class=\"dropdown-menu dropdown-menu-lg pull-right\">\r\n                    <div class=\"listview\" id=\"notifications\">\r\n                        <div class=\"lv-header\">\r\n                            Notification\r\n\r\n                            <ul class=\"actions\">\r\n                                <li class=\"dropdown\">\r\n                                    <a href=\"\" data-clear=\"notification\">\r\n                                        <i class=\"zmdi zmdi-check-all\"></i>\r\n                                    </a>\r\n                                </li>\r\n                            </ul>\r\n                        </div>\r\n                        <div class=\"lv-body\">\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/1.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">David Belle</div>\r\n                                        <small class=\"lv-small\">Cum sociis natoque penatibus et magnis dis parturient montes</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/2.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">Jonathan Morris</div>\r\n                                        <small class=\"lv-small\">Nunc quis diam diamurabitur at dolor elementum, dictum turpis vel</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/3.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">Fredric Mitchell Jr.</div>\r\n                                        <small class=\"lv-small\">Phasellus a ante et est ornare accumsan at vel magnauis blandit turpis at augue ultricies</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/4.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">Glenn Jecobs</div>\r\n                                        <small class=\"lv-small\">Ut vitae lacus sem ellentesque maximus, nunc sit amet varius dignissim, dui est consectetur neque</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/4.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">Bill Phillips</div>\r\n                                        <small class=\"lv-small\">Proin laoreet commodo eros id faucibus. Donec ligula quam, imperdiet vel ante placerat</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                        </div>\r\n\r\n                        <a class=\"lv-footer\" href=\"\">View Previous</a>\r\n                    </div>\r\n\r\n                </div>\r\n            </li>\r\n            <li class=\"hidden-xs\">\r\n                <a target=\"_blank\" href=\"https://wrapbootstrap.com/theme/superflat-simple-responsive-admin-theme-WB082P91H\">\r\n                    <span class=\"tm-label\">Link</span>\r\n                </a>\r\n            </li>\r\n        </ul>\r\n    </li>\r\n</ul>\r\n\r\n\r\n<!-- Top Search Content -->\r\n<div id=\"top-search-wrap\">\r\n    <div class=\"tsw-inner\">\r\n        <i id=\"top-search-close\" data-ng-click=\"hctrl.closeSearch()\" class=\"zmdi zmdi-arrow-left\"></i>\r\n        <input type=\"text\">\r\n    </div>\r\n</div>\r\n\r\n\r\n");
$templateCache.put("module/shared/header-textual-menu.html","<ul class=\"header-inner clearfix\">\r\n    <li id=\"menu-trigger\" data-target=\"mainmenu\" data-toggle-sidebar data-model-left=\"mactrl.sidebarToggle.left\" data-ng-class=\"{ \'open\': mactrl.sidebarToggle.left === true }\">\r\n        <div class=\"line-wrap\">\r\n            <div class=\"line top\"></div>\r\n            <div class=\"line center\"></div>\r\n            <div class=\"line bottom\"></div>\r\n        </div>\r\n    </li>\r\n\r\n    <li class=\"logo hidden-xs\">\r\n        <a data-ui-sref=\"home\" data-ng-click=\"mactrl.sidebarStat($event)\">Material Admin</a>\r\n    </li>\r\n\r\n    <li class=\"pull-right\">\r\n        <ul class=\"top-menu\">\r\n            <li id=\"top-search\" data-ng-click=\"hctrl.openSearch()\">\r\n                <a href=\"\"><span class=\"tm-label\">Search</span></a>\r\n            </li>\r\n\r\n            <li class=\"dropdown\" uib-dropdown>\r\n                <a uib-dropdown-toggle href=\"\">\r\n                    <span class=\"tm-label\">Messages</span>\r\n                </a>\r\n                <div class=\"dropdown-menu dropdown-menu-lg pull-right\">\r\n                    <div class=\"listview\">\r\n                        <div class=\"lv-header\">\r\n                            Messages\r\n                        </div>\r\n                        <div class=\"lv-body\">\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/1.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">David Belle</div>\r\n                                        <small class=\"lv-small\">Cum sociis natoque penatibus et magnis dis parturient montes</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/2.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">Jonathan Morris</div>\r\n                                        <small class=\"lv-small\">Nunc quis diam diamurabitur at dolor elementum, dictum turpis vel</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/3.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">Fredric Mitchell Jr.</div>\r\n                                        <small class=\"lv-small\">Phasellus a ante et est ornare accumsan at vel magnauis blandit turpis at augue ultricies</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/4.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">Glenn Jecobs</div>\r\n                                        <small class=\"lv-small\">Ut vitae lacus sem ellentesque maximus, nunc sit amet varius dignissim, dui est consectetur neque</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/4.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">Bill Phillips</div>\r\n                                        <small class=\"lv-small\">Proin laoreet commodo eros id faucibus. Donec ligula quam, imperdiet vel ante placerat</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                        </div>\r\n                        <a class=\"lv-footer\" href=\"\">View All</a>\r\n                    </div>\r\n                </div>\r\n            </li>\r\n            <li class=\"dropdown hidden-xs\" uib-dropdown>\r\n                <a uib-dropdown-toggle href=\"\">\r\n                    <span class=\"tm-label\">Notification</span>\r\n                </a>\r\n                <div class=\"dropdown-menu dropdown-menu-lg pull-right\">\r\n                    <div class=\"listview\" id=\"notifications\">\r\n                        <div class=\"lv-header\">\r\n                            Notification\r\n\r\n                            <ul class=\"actions\">\r\n                                <li class=\"dropdown\">\r\n                                    <a href=\"\" data-clear=\"notification\">\r\n                                        <i class=\"zmdi zmdi-check-all\"></i>\r\n                                    </a>\r\n                                </li>\r\n                            </ul>\r\n                        </div>\r\n                        <div class=\"lv-body\">\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/1.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">David Belle</div>\r\n                                        <small class=\"lv-small\">Cum sociis natoque penatibus et magnis dis parturient montes</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/2.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">Jonathan Morris</div>\r\n                                        <small class=\"lv-small\">Nunc quis diam diamurabitur at dolor elementum, dictum turpis vel</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/3.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">Fredric Mitchell Jr.</div>\r\n                                        <small class=\"lv-small\">Phasellus a ante et est ornare accumsan at vel magnauis blandit turpis at augue ultricies</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/4.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">Glenn Jecobs</div>\r\n                                        <small class=\"lv-small\">Ut vitae lacus sem ellentesque maximus, nunc sit amet varius dignissim, dui est consectetur neque</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/4.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">Bill Phillips</div>\r\n                                        <small class=\"lv-small\">Proin laoreet commodo eros id faucibus. Donec ligula quam, imperdiet vel ante placerat</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                        </div>\r\n\r\n                        <a class=\"lv-footer\" href=\"\">View Previous</a>\r\n                    </div>\r\n\r\n                </div>\r\n            </li>\r\n            <li class=\"hidden-xs\">\r\n                <a target=\"_blank\" href=\"https://wrapbootstrap.com/theme/superflat-simple-responsive-admin-theme-WB082P91H\">\r\n                    <span class=\"tm-label\">Link</span>\r\n                </a>\r\n            </li>\r\n        </ul>\r\n    </li>\r\n</ul>\r\n\r\n\r\n<!-- Top Search Content -->\r\n<div id=\"top-search-wrap\">\r\n    <div class=\"tsw-inner\">\r\n        <i id=\"top-search-close\" data-ng-click=\"hctrl.closeSearch()\" class=\"zmdi zmdi-arrow-left\"></i>\r\n        <input type=\"text\">\r\n    </div>\r\n</div>\r\n\r\n\r\n");
$templateCache.put("module/shared/header-top-menu.html","<ul class=\"header-inner clearfix\">\r\n    <li id=\"menu-trigger\" data-trigger=\".ha-menu\" class=\"visible-xs\">\r\n        <div class=\"line-wrap\">\r\n            <div class=\"line top\"></div>\r\n            <div class=\"line center\"></div>\r\n            <div class=\"line bottom\"></div>\r\n        </div>\r\n    </li>\r\n\r\n    <li class=\"logo hidden-xs\">\r\n        <a data-ui-sref=\"home\">Material Admin</a>\r\n    </li>\r\n\r\n    <li class=\"pull-right\">\r\n        <ul class=\"top-menu\">\r\n            <li class=\"dropdown\" uib-dropdown>\r\n                <a uib-dropdown-toggle href=\"\">\r\n                    <i class=\"tmn-counts\">6</i>\r\n                    <i class=\"tm-icon zmdi zmdi-email\"></i>\r\n                </a>\r\n                <div class=\"dropdown-menu dropdown-menu-lg pull-right\">\r\n                    <div class=\"listview\">\r\n                        <div class=\"lv-header\">\r\n                            Messages\r\n                        </div>\r\n                        <div class=\"lv-body\">\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/1.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">David Belle</div>\r\n                                        <small class=\"lv-small\">Cum sociis natoque penatibus et magnis dis parturient montes</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/2.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">Jonathan Morris</div>\r\n                                        <small class=\"lv-small\">Nunc quis diam diamurabitur at dolor elementum, dictum turpis vel</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/3.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">Fredric Mitchell Jr.</div>\r\n                                        <small class=\"lv-small\">Phasellus a ante et est ornare accumsan at vel magnauis blandit turpis at augue ultricies</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/4.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">Glenn Jecobs</div>\r\n                                        <small class=\"lv-small\">Ut vitae lacus sem ellentesque maximus, nunc sit amet varius dignissim, dui est consectetur neque</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/4.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">Bill Phillips</div>\r\n                                        <small class=\"lv-small\">Proin laoreet commodo eros id faucibus. Donec ligula quam, imperdiet vel ante placerat</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                        </div>\r\n                        <a class=\"lv-footer\" href=\"\">View All</a>\r\n                    </div>\r\n                </div>\r\n            </li>\r\n            <li class=\"dropdown\" uib-dropdown>\r\n                <a uib-dropdown-toggle>\r\n                    <i class=\"tmn-counts\">9</i>\r\n                    <i class=\"tm-icon zmdi zmdi-notifications\"></i>\r\n                </a>\r\n                <div class=\"dropdown-menu dropdown-menu-lg pull-right\">\r\n                    <div class=\"listview\" id=\"notifications\">\r\n                        <div class=\"lv-header\">\r\n                            Notification\r\n\r\n                            <ul class=\"actions\">\r\n                                <li class=\"dropdown\">\r\n                                    <a href=\"\" data-clear=\"notification\">\r\n                                        <i class=\"zmdi zmdi-check-all\"></i>\r\n                                    </a>\r\n                                </li>\r\n                            </ul>\r\n                        </div>\r\n                        <div class=\"lv-body\">\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/1.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">David Belle</div>\r\n                                        <small class=\"lv-small\">Cum sociis natoque penatibus et magnis dis parturient montes</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/2.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">Jonathan Morris</div>\r\n                                        <small class=\"lv-small\">Nunc quis diam diamurabitur at dolor elementum, dictum turpis vel</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/3.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">Fredric Mitchell Jr.</div>\r\n                                        <small class=\"lv-small\">Phasellus a ante et est ornare accumsan at vel magnauis blandit turpis at augue ultricies</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/4.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">Glenn Jecobs</div>\r\n                                        <small class=\"lv-small\">Ut vitae lacus sem ellentesque maximus, nunc sit amet varius dignissim, dui est consectetur neque</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/4.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">Bill Phillips</div>\r\n                                        <small class=\"lv-small\">Proin laoreet commodo eros id faucibus. Donec ligula quam, imperdiet vel ante placerat</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                        </div>\r\n\r\n                        <a class=\"lv-footer\" href=\"\">View Previous</a>\r\n                    </div>\r\n\r\n                </div>\r\n            </li>\r\n            <li class=\"dropdown\" uib-dropdown>\r\n                <a uib-dropdown-toggle href=\"\">\r\n                    <i class=\"tmn-counts\">2</i>\r\n                    <i class=\"tm-icon zmdi zmdi-view-list-alt\"></i>\r\n                </a>\r\n                <div class=\"dropdown-menu pull-right dropdown-menu-lg\">\r\n                    <div class=\"listview\">\r\n                        <div class=\"lv-header\">\r\n                            Tasks\r\n                        </div>\r\n                        <div class=\"lv-body\">\r\n                            <div class=\"lv-item\">\r\n                                <div class=\"lv-title m-b-5\">HTML5 Validation Report</div>\r\n\r\n                                <div class=\"progress\">\r\n                                    <div class=\"progress-bar\" role=\"progressbar\" aria-valuenow=\"95\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 95%\">\r\n                                        <span class=\"sr-only\">95% Complete (success)</span>\r\n                                    </div>\r\n                                </div>\r\n                            </div>\r\n                            <div class=\"lv-item\">\r\n                                <div class=\"lv-title m-b-5\">Google Chrome Extension</div>\r\n\r\n                                <div class=\"progress\">\r\n                                    <div class=\"progress-bar progress-bar-success\" role=\"progressbar\" aria-valuenow=\"80\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 80%\">\r\n                                        <span class=\"sr-only\">80% Complete (success)</span>\r\n                                    </div>\r\n                                </div>\r\n                            </div>\r\n                            <div class=\"lv-item\">\r\n                                <div class=\"lv-title m-b-5\">Social Intranet Projects</div>\r\n\r\n                                <div class=\"progress\">\r\n                                    <div class=\"progress-bar progress-bar-info\" role=\"progressbar\" aria-valuenow=\"20\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 20%\">\r\n                                        <span class=\"sr-only\">20% Complete</span>\r\n                                    </div>\r\n                                </div>\r\n                            </div>\r\n                            <div class=\"lv-item\">\r\n                                <div class=\"lv-title m-b-5\">Bootstrap Admin Template</div>\r\n\r\n                                <div class=\"progress\">\r\n                                    <div class=\"progress-bar progress-bar-warning\" role=\"progressbar\" aria-valuenow=\"60\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 60%\">\r\n                                        <span class=\"sr-only\">60% Complete (warning)</span>\r\n                                    </div>\r\n                                </div>\r\n                            </div>\r\n                            <div class=\"lv-item\">\r\n                                <div class=\"lv-title m-b-5\">Youtube Client App</div>\r\n\r\n                                <div class=\"progress\">\r\n                                    <div class=\"progress-bar progress-bar-danger\" role=\"progressbar\" aria-valuenow=\"80\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 80%\">\r\n                                        <span class=\"sr-only\">80% Complete (danger)</span>\r\n                                    </div>\r\n                                </div>\r\n                            </div>\r\n                        </div>\r\n\r\n                        <a class=\"lv-footer\" href=\"\">View All</a>\r\n                    </div>\r\n                </div>\r\n            </li>\r\n            <li class=\"dropdown\" uib-dropdown>\r\n                <a uib-dropdown-toggle href=\"\"><i class=\"tm-icon zmdi zmdi-more-vert\"></i></a>\r\n                <ul class=\"dropdown-menu dm-icon pull-right\">\r\n                    <li class=\"hidden-xs\">\r\n                        <a data-ng-click=\"hctrl.fullScreen()\" href=\"\"><i class=\"zmdi zmdi-fullscreen\"></i> Toggle Fullscreen</a>\r\n                    </li>\r\n                    <li>\r\n                        <a data-ng-click=\"hctrl.clearLocalStorage()\" href=\"\"><i class=\"zmdi zmdi-delete\"></i> Clear Local Storage</a>\r\n                    </li>\r\n                    <li>\r\n                        <a href=\"\"><i class=\"zmdi zmdi-face\"></i> Privacy Settings</a>\r\n                    </li>\r\n                    <li>\r\n                        <a href=\"\"><i class=\"zmdi zmdi-settings\"></i> Other Settings</a>\r\n                    </li>\r\n                </ul>\r\n            </li>\r\n        </ul>\r\n    </li>\r\n</ul>\r\n\r\n<div class=\"search\">\r\n    <div class=\"fg-line\">\r\n        <input type=\"text\" class=\"form-control\" placeholder=\"Search...\">\r\n    </div>\r\n</div>\r\n\r\n<nav class=\"ha-menu\">\r\n    <ul>\r\n        <li class=\"waves-effect\" data-ui-sref-active=\"active\">\r\n            <a data-ui-sref=\"home\" data-ng-click=\"mactrl.sidebarStat($event)\">Home</a>\r\n        </li>\r\n\r\n        <li class=\"dropdown\" uib-dropdown data-ng-class=\"{ \'active\': mactrl.$state.includes(\'headers\') }\">\r\n            <div class=\"waves-effect\" uib-dropdown-toggle>Headers</div>\r\n\r\n            <ul class=\"dropdown-menu\">\r\n                <li data-ui-sref-active=\"active\" ><a data-ui-sref=\"headers.textual-menu\">Textual menu</a></li>\r\n                <li data-ui-sref-active=\"active\" ><a data-ui-sref=\"headers.image-logo\">Image logo</a></li>\r\n                <li data-ui-sref-active=\"active\" ><a data-ui-sref=\"headers.mainmenu-on-top\">Mainmenu on top</a></li>\r\n            </ul>\r\n        </li>\r\n\r\n        <li class=\"waves-effect\" data-ui-sref-active=\"active\">\r\n            <a data-ui-sref=\"typography\">Typography</a>\r\n        </li>\r\n\r\n        <li class=\"dropdown\" uib-dropdown>\r\n            <div class=\"waves-effect\" uib-dropdown-toggle>Widgets</div>\r\n            <ul class=\"dropdown-menu\">\r\n                <li data-ui-sref-active=\"active\"><a data-ui-sref=\"widgets.widget-templates\">Templates</a></li>\r\n                <li data-ui-sref-active=\"active\"><a data-ui-sref=\"widgets.widgets\">Widgets</a></li>\r\n            </ul>\r\n        </li>\r\n\r\n        <li class=\"dropdown\" uib-dropdown>\r\n            <div class=\"waves-effect\" uib-dropdown-toggle>Tables</div>\r\n            <ul class=\"dropdown-menu\">\r\n                <li data-ui-sref-active=\"active\"><a data-ui-sref=\"tables.tables\">Normal Tables</a></li>\r\n                <li data-ui-sref-active=\"active\"><a data-ui-sref=\"tables.data-table\">Data Tables</a></li>\r\n            </ul>\r\n        </li>\r\n\r\n        <li class=\"dropdown\" uib-dropdown>\r\n            <div class=\"waves-effect\" uib-dropdown-toggle>Forms</div>\r\n            <ul class=\"dropdown-menu\">\r\n                <li data-ui-sref-active=\"active\"><a data-ui-sref=\"form.basic-form-elements\">Basic Form Elements</a></li>\r\n                <li data-ui-sref-active=\"active\"><a data-ui-sref=\"form.form-components\">Form Components</a></li>\r\n                <li data-ui-sref-active=\"active\"><a data-ui-sref=\"form.form-examples\">Form Examples</a></li>\r\n                <li data-ui-sref-active=\"active\"><a data-ui-sref=\"form.form-validations\">Form Validation</a></li>\r\n            </ul>\r\n        </li>\r\n        <li class=\"dropdown\" uib-dropdown>\r\n            <div class=\"waves-effect\" uib-dropdown-toggle>User Interface</div>\r\n            <ul class=\"dropdown-menu\">\r\n                <li data-ui-sref-active=\"active\"><a data-ui-sref=\"user-interface.ui-bootstrap\">UI Bootstrap</a></li>\r\n                <li data-ui-sref-active=\"active\"><a data-ui-sref=\"user-interface.colors\">Colors</a></li>\r\n                <li data-ui-sref-active=\"active\"><a data-ui-sref=\"user-interface.animations\">Animations</a></li>\r\n                <li data-ui-sref-active=\"active\"><a data-ui-sref=\"user-interface.box-shadow\">Box Shadow</a></li>\r\n                <li data-ui-sref-active=\"active\"><a data-ui-sref=\"user-interface.buttons\">Buttons</a></li>\r\n                <li data-ui-sref-active=\"active\"><a data-ui-sref=\"user-interface.icons\">Icons</a></li>\r\n                <li data-ui-sref-active=\"active\"><a data-ui-sref=\"user-interface.alerts\">Alerts</a></li>\r\n                <li data-ui-sref-active=\"active\"><a data-ui-sref=\"user-interface.preloaders\">Preloaders</a></li>\r\n                <li data-ui-sref-active=\"active\"><a data-ui-sref=\"user-interface.notifications-dialogs\">Notifications & Dialogs</a></li>\r\n                <li data-ui-sref-active=\"active\"><a data-ui-sref=\"user-interface.media\">Media</a></li>\r\n                <li data-ui-sref-active=\"active\"><a data-ui-sref=\"user-interface.other-components\">Others</a></li>\r\n            </ul>\r\n        </li>\r\n        <li class=\"dropdown\" uib-dropdown>\r\n            <div class=\"waves-effect\" uib-dropdown-toggle>Charts</div>\r\n            <ul class=\"dropdown-menu\">\r\n                <li data-ui-sref-active=\"active\"><a data-ui-sref=\"charts.flot-charts\">Flot Charts</a></li>\r\n                <li data-ui-sref-active=\"active\"><a data-ui-sref=\"charts.other-charts\">Other Charts</a></li>\r\n            </ul>\r\n        </li>\r\n        <li class=\"waves-effect\" data-ui-sref-active=\"active\"><a data-ui-sref=\"calendar\">Calendar</a></li>\r\n    </ul>\r\n</nav>\r\n\r\n<div class=\"skin-switch dropdown hidden-xs\" uib-dropdown>\r\n    <button uib-dropdown-toggle class=\"btn ss-icon\"><i class=\"zmdi zmdi-palette\"></i></button>\r\n    <div class=\"dropdown-menu\">\r\n        <span ng-repeat=\"w in mactrl.skinList\" class=\"ss-skin bgm-{{ w }}\" data-ng-click=\"mactrl.skinSwitch(w)\"></span>\r\n    </div>\r\n</div>\r\n");
$templateCache.put("module/shared/header.html","<ul class=\"header-inner clearfix\">\r\n    <li id=\"menu-trigger\"\r\n        data-target=\"mainmenu\"\r\n        data-toggle-sidebar=\"\"\r\n        data-model-left=\"appCtrl.sidebarToggle.left\"\r\n        data-ng-class=\"{ \'open\': appCtrl.sidebarToggle.left === true }\">\r\n        <div class=\"line-wrap\">\r\n            <div class=\"line top\"></div>\r\n            <div class=\"line center\"></div>\r\n            <div class=\"line bottom\"></div>\r\n        </div>\r\n    </li>\r\n\r\n    <li class=\"logo hidden-xs\">\r\n        <a href=\"/#/home\">scripturedIn</a>\r\n    </li>\r\n\r\n</ul>\r\n\r\n<!-- when mobile, reduce width and float right -->\r\n<div id=\"top-search-wrap\" class=\"hidden-xs\"\r\n     style=\"position: relative; background: none;opacity:1;margin: 0 auto; width: 600px;\">\r\n    <div class=\"tsw-inner\" style=\"max-width: 500px\">\r\n        <!--<i id=\"top-search-close\" class=\"zmdi zmdi-arrow-left\" data-ng-click=\"hctrl.closeSearch()\"></i>-->\r\n        <input focus type=\"text\"\r\n               data-ng-keypress=\"headerCtrl.onSearchKeyPress($event)\"\r\n               data-ng-model=\"headerCtrl.searchTerm\"\r\n               placeholder=\"Search for bible verse e.g john 3:16\"\r\n               style=\"padding: 0 10px 0 20px; font-size: 14px\">\r\n    </div>\r\n</div>\r\n");
$templateCache.put("module/shared/sidebar-left.html","<div class=\"sidebar-inner c-overflow\">\n    <div class=\"profile-menu\">\n        <a href=\"\" toggle-submenu>\n            <div class=\"profile-pic\">\n                <img ng-src=\"{{imagePath(authService.user)}}\" alt=\"\">\n            </div>\n\n            <div class=\"profile-info\">\n                {{authService.user.first_name + \' \' + authService.user.last_name }}\n\n                <i class=\"zmdi zmdi-caret-down\"></i>\n            </div>\n        </a>\n\n        <ul class=\"main-menu\">\n            <!--<li>-->\n            <!--<a data-ui-sref=\"pages.profile.profile-about\" data-ng-click=\"mactrl.sidebarStat($event)\"><i-->\n            <!--class=\"zmdi zmdi-account\"></i> View Profile</a>-->\n            <!--</li>-->\n            <!--<li>-->\n            <!--<a href=\"\"><i class=\"zmdi zmdi-input-antenna\"></i> Privacy Settings</a>-->\n            <!--</li>-->\n            <li>\n                <a ui-sref=\"base.settings\"><i class=\"zmdi zmdi-settings\"></i> Settings</a>\n            </li>\n            <li>\n                <a href=\"#/logout\"><i class=\"zmdi zmdi-time-restore\"></i> Logout</a>\n            </li>\n        </ul>\n    </div>\n\n    <ul class=\"main-menu\">\n\n        <li data-ui-sref-active=\"active\">\n            <a data-ui-sref=\"base.home\"><i class=\"zmdi zmdi-home\"></i>\n                Home</a>\n        </li>\n        <li class=\"sub-menu\" data-ng-class=\"{ \'active toggled\': mactrl.$state.includes(\'headers\') }\">\n            <a href=\"\" toggle-submenu>\n                <i>\n                    <md-icon md-svg-src=\"/img/icons/event_note_black.svg\"></md-icon>\n                </i>Notes\n            </a>\n\n            <ul>\n                <li><a data-ui-sref-active=\"active\"\n                       data-ui-sref=\"base.new-note\">\n                    New Note</a></li>\n                <li><a data-ui-sref-active=\"active\"\n                       data-ui-sref=\"base.notes\">My Notes</a>\n                </li>\n            </ul>\n        </li>\n        <li data-ui-sref-active=\"active\">\n            <a data-ui-sref=\"base.sermon-browse\">\n                <i>\n                    <md-icon md-svg-src=\"/img/icons/speaker_notes_black.svg\"></md-icon>\n                </i> Sermons</a>\n        </li>\n    </ul>\n</div>\n");
$templateCache.put("module/component/alert/toast.html","<md-toast style=\"top:150px\" ng-class=\"{\'toast-danger\': toastCtrl.type ==\'danger\'}\">\n        <span ng-bind-html=\"toastCtrl.message\" flex></span>\n        <md-button ng-click=\"toastCtrl.closeToast()\">\n            Ok\n        </md-button>\n\n</md-toast>");
$templateCache.put("module/component/feed/comment.html","<div class=\"media m-b-10\" id=\"{{comment.id}}\">\n    <a href=\"\" class=\"pull-left\">\n        <img ng-src=\"{{util.imagePath(comment.user)}}\" alt=\"\" class=\"lv-img-sm\">\n    </a>\n\n    <div class=\"media-body\">\n        <a href=\"\" class=\"a-title\"><strong>{{comment.user.first_name}}\n            {{comment.user.last_name}}</strong></a>\n        <small class=\"c-gray m-l-10\">{{comment.created_at | fromNow}}\n        </small>\n        <p class=\"m-t-5 m-b-0\">{{comment.comment}}</p>\n        <p class=\"m-t-10 m-b-0\">\n            <a class=\"m-r-5\"\n               ng-click=\"like(comment)\"\n               href>\n                <span ng-if=\"comment.likes_key.indexOf(user.id) < 0\">Like</span>\n                <span  ng-if=\"comment.likes_key.indexOf(user.id) >= 0\">Unlike</span>\n            </a>\n            <a ng-click=\"showReply = true\" href=>Reply</a>\n        </p>\n        <!-- start replies here -->\n        <div class=\"media\" ng-repeat=\"r in comment.replies.comments\">\n            <a href=\"\" class=\"pull-left\">\n                <img ng-src=\"{{util.imagePath(r.user)}}\" alt=\"\"\n                     class=\"lv-img-sm\">\n            </a>\n\n            <div class=\"media-body\">\n                <a href=\"\" class=\"a-title\"><strong>{{::r.user.first_name}}\n                    {{::r.user.last_name}}</strong></a>\n                <small class=\"c-gray m-l-10\">{{::r.created_at | fromNow}}\n                </small>\n                <p class=\"m-t-5 m-b-0\">{{::r.comment}}</p>\n                <p class=\"m-t-10 m-b-0\">\n                    <a class=\"m-r-5\"\n                       ng-click=\"like(r)\"\n                       href>\n                        <span ng-if=\"r.likes_key.indexOf(user.id) < 0\">Like</span>\n                        <span  ng-if=\"r.likes_key.indexOf(user.id) >= 0\">Unlike</span></a>\n                       <a ng-click=\"$parent.showReply = true\" href=>Reply</a>\n                    <!--<a ng-click=\"reply(r.user)\" href=>Reply</a>-->\n                </p>\n            </div>\n        </div>\n        <!-- end replies-->\n\n        <!-- start reply input -->\n        <div ng-if=\"showReply\" class=\"wcl-form m-t-10\">\n            <div class=\"wc-comment\">\n                <div class=\"wcc-inner m-b-5\">\n                    <div contenteditable=\"true\"\n                         class=\"wcci-text c-black reply-text\"\n                         style=\"height: auto\" focus-cursor\n                         data-text=\"Write a reply...\"\n                         data-placeholder=\"Write a reply...\">\n\n                    </div>\n\n                </div>\n                <button ng-click=\"postReply()\"\n                        class=\"btn btn-sm btn-primary\">Reply\n                </button>\n            </div>\n        </div>\n        <!--end reply input-->\n\n    </div>\n</div>");
$templateCache.put("module/component/feed/comments.html","<loading loader=\"loading\"></loading>\n<div class=\"wall-comment-list\" ng-if=\"data.comments.length >  0\">\n    <!-- Comment Listing -->\n    <div class=\"wcl-list\">\n        <comment comment=\"comment\" ng-repeat=\"comment in data.comments\"></comment>\n    </div>\n</div>\n");
$templateCache.put("module/component/feed/feed.html","<div class=\"card\">\n    <div class=\"card-header\">\n        <div class=\"media\">\n            <div class=\"pull-left\">\n                <img class=\"lv-img\" ng-src=\"{{util.imagePath(feed.user)}}\" alt=\"\">\n            </div>\n\n            <div class=\"media-body m-t-5\">\n                <h2 class=\"f-20\">\n                    <a class=\"c-black\">\n                        <!--{{::feed.title}}-->\n                        <name-tag user=\"feed.user\"></name-tag>\n                    </a>\n                    <small>Posted on {{::feed.created_at |\n                        formatDate:\'Do MMM YYYY [at] h:mm a\'}}\n                    </small>\n                </h2>\n            </div>\n        </div>\n\n\n    </div>\n\n    <div class=\"card-body card-padding\">\n        <p class=\"m-b-15\" bind-html-compile=\"feed.displayText\"></p>\n\n        <ul class=\"wall-attrs clearfix list-inline list-unstyled\">\n            <li class=\"wa-stats\">\n                <span>\n                    <i class=\"zmdi zmdi-comments\"></i>\n                    <span ng-if=\"feed.comment_count > 0\">{{feed.comment_count}}</span>\n                </span>\n                <span>\n                <a ng-click=\"like()\" href ng-class=\"{\'c-gray\': !liked(), \'c-lightblue\': liked() }\">\n                    <i class=\"zmdi zmdi-thumb-up\"></i>\n                    <span ng-if=\"feed.like_count > 0\">{{feed.like_count}}</span>\n                </a>\n                    </span>\n\n            </li>\n            <!--<li class=\"wa-users\">-->\n            <!--<a href=\"\"><img src=\"img/profile-pics/1.jpg\" alt=\"\"></a>-->\n            <!--<a href=\"\"><img src=\"img/profile-pics/2.jpg\" alt=\"\"></a>-->\n            <!--<a href=\"\"><img src=\"img/profile-pics/3.jpg\" alt=\"\"></a>-->\n            <!--<a href=\"\"><img src=\"img/profile-pics/5.jpg\" alt=\"\"></a>-->\n            <!--</li>-->\n        </ul>\n    </div>\n\n\n    <div class=\"wall-comment-list p-t-5 p-b-5\">\n\n        <div class=\"wcl-form m-t-5\">\n            <div class=\"wc-comment\" data-ng-if=\"!feed.commenting\"\n                 data-ng-click=\"feed.commenting = true\">\n                <div class=\"wcc-inner\">\n                    Write Something...\n                </div>\n            </div>\n\n            <div class=\"wc-comment\" data-ng-if=\"feed.commenting\">\n                <div class=\"wcc-inner\">\n                    <textarea class=\"wcci-text c-black\" data-auto-size\n                              ng-model=\"feed.newComment_\" focus-cursor\n                              placeholder=\"Write Something...\">\n                    </textarea>\n                </div>\n\n                <div class=\"m-t-15\">\n                    <button ng-click=\"postComment(feed.newComment_)\"\n                            class=\"btn btn-sm btn-primary\">Post\n                    </button>\n                    <button class=\"btn btn-sm btn-link\"\n                            data-ng-click=\"feed.commenting = false\">Cancel\n                    </button>\n                </div>\n            </div>\n\n        </div>\n        <p ng-if=\"feed.comments.comments.length > 5\" ng-hide=\"feed.showComments\" class=\"m-t-10 m-b-0\"><a href\n                                                                                                         ng-click=\"feed.showComments = true\">View\n            comments</a></p>\n        <p ng-if=\"feed.comments.comments.length > 5\" ng-show=\"feed.showComments\" class=\"m-t-10 m-b-0\"><a href\n                                                                                                         ng-click=\"feed.showComments = false\">Collapse\n            comments</a></p>\n    </div>\n\n    <comments ng-if=\"feed.showComments\" data=\"feed.comments\"></comments>\n</div>\n");
$templateCache.put("module/component/scripture/scripture-card.html","<div class=\"card scripture\">\n    <md-progress-linear md-mode=\"indeterminate\" ng-show=\"loading\"></md-progress-linear>\n    <div ng-show=\"!loading && scripture\">\n        <div class=\"card-header\">\n            <h2 class=\"book\">{{scripture.book}} ({{scripture.version}})</h2>\n\n            <ul class=\"actions\">\n                <!--<li>-->\n                <!--<a href ng-click=\"readCtrl.askForComment($event)\">-->\n                <!--<md-tooltip>Ask for comment</md-tooltip>-->\n                <!--<i class=\"zmdi zmdi-comments\">-->\n                <!--</i>-->\n\n                <!--</a>-->\n                <!--</li>-->\n                <li class=\"dropdown\" uib-dropdown>\n                    <a href=\"\" uib-dropdown-toggle>\n                        <i class=\"zmdi zmdi-translate\"></i>\n                        <md-tooltip>Change translation</md-tooltip>\n                    </a>\n\n                    <ul class=\"dropdown-menu dropdown-menu-right translations\"\n                        style=\"max-height: 400px; overflow-y: scroll\">\n                        <li ng-class=\"{selected: scripture.version == v.abbr }\"\n                            ng-repeat=\"v in versions\">\n                            <a ng-click=\"changeTranslation(v)\" href\n                            >{{::v.title}}</a>\n                        </li>\n                    </ul>\n                </li>\n\n            </ul>\n        </div>\n\n        <div class=\"card-body\">\n            <div class=\"chapter\">\n                <h3 class=\"title\">Chapter {{scripture.chapter}}</h3>\n\n                <div id=\"verses\">\n                    <p id=\"v{{verse}}\" class=\"verse\" ng-class=\"{highlight: readCtrl.selected[book][verse]}\"\n                       ng-repeat=\"v in scripture.verses\">\n                        <a href=\"\" ng-click=\"readCtrl.highlight(verse, book)\">\n                            <span style=\"margin-right: 15px\">{{v.verse}}:</span></a>\n                        {{v.content}}\n                    </p>\n                </div>\n\n            </div>\n        </div>\n    </div>\n\n</div>\n");
$templateCache.put("module/component/scripture/scripture-modal.html","<div class=\"modal-body\">\n    <scripture-card text=\"modalCtrl.scripture\"></scripture-card>\n</div>\n<!--<div class=\"modal-footer\">-->\n   <!---->\n<!--</div>-->\n");}]);