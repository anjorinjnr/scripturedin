App.config(function (localStorageServiceProvider) {
        localStorageServiceProvider
            .setPrefix('scripturedin')
            .setStorageCookieDomain(window.location.hostname);
    })
    .config(function ($stateProvider, $urlRouterProvider, USER_ROLES) {

        var resolveAuth = function (authService) {
            console.log('resolving auth');
            return authService.resolveAuth();
        };

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
                    fbSdk: function ($q) {
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
                    }
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
                url: '/sermon/{id:int}',
                views: {
                    'content': {
                        templateUrl: 'module/sermon/study.html',
                        controller: 'sermonController as sermonCtrl'
                    }
                },
                resolve: {
                    sermon: function (bibleService, $stateParams, alertService, $q) {
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
                    }
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
                    loadPlugin: function ($ocLazyLoad) {
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
                    }
                },
                data: {
                    role: USER_ROLES.user,
                    pageTitle: 'Find a sermon'
                }
            })
            .state('base.read', {
                url: '/read?p',
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
            .state('base.notification', {
                url: '/notification',
                views: {
                    'content': {
                        templateUrl: 'module/notification/notifications.html',
                        controller: 'notificationController as notificationCtrl'
                    }
                },
                data: {
                    role: USER_ROLES.user
                }
            })
            .state('base.bible', {
                url: '/bible',
                views: {
                    'content': {
                        templateUrl: 'module/read/bible.html',
                        controller: 'readController as readCtrl'
                    }
                },
                data: {
                    role: USER_ROLES.user
                }
            })
            .state('base.bible.book', {
                url: '/:book',
                views: {
                    'content@base': {
                        templateUrl: 'module/read/chapter.html',
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
                    note: function ($q, $stateParams, userService) {
                        var deferred = $q.defer();
                        userService.getNote($stateParams.id).then(function (resp) {
                            deferred.resolve(resp.data);
                        });
                        return deferred.promise;
                    }
                },
                data: {
                    role: USER_ROLES.user,
                    pageTitle: 'Sermon Note'
                }
            })
            .state('base.note.edit', {
                url: '/edit',
                views: {
                    'content@base': {
                        templateUrl: 'module/notes/create.html',
                        controller: 'notesController as notesCtrl'
                    }
                },
                resolve: {
                    note: function ($q, $stateParams, userService) {
                        var deferred = $q.defer();
                        userService.getNote($stateParams.id).then(function (resp) {
                            deferred.resolve(resp.data);
                        });
                        return deferred.promise;
                    }
                },
                data: {
                    role: USER_ROLES.user,
                    pageTitle: 'Edit Note'
                }
            })
    });