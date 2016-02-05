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
                url: '/',
                templateUrl: 'module/main/main.html',
                controller: 'mainController as mainCtrl',
                data: {
                    role: USER_ROLES.guest
                }
            })
            .state('main.signup', {
                url: 'signup'
            })
            .state('main.login', {
                url: 'login'
            })
            .state('base.post-signup-profile', {
                url: '/update-profile',
                views: {
                    'content': {
                        templateUrl: 'module/main/update-profile-signup.html',
                        controller: 'mainController as mainCtrl'
                    }
                },
                resolve: {
                    auth: resolveAuth
                },
                data: {
                    role: USER_ROLES.user,
                    hideHeader: false,
                    pageTitle: 'Update your profile'
                }
            })
            .state('base', {
                abstract: true,
                templateUrl: 'module/shared/base.html',
                resolve: {
                    auth: resolveAuth
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
                resolve: {
                    auth: resolveAuth
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
                    auth: resolveAuth,
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
                    sermons: function () {
                        return [];
                    },
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
                    sermons: function (bibleService, authService, util, $q) {
                        var deferred = $q.defer();
                        var events = [];
                        if (authService.user.church_key) {
                            bibleService.getChurchSermons(authService.user.church_key).then(function (resp) {
                                //util.log(resp.data);
                                var sermons = resp.data;
                                sermons.forEach(function (s) {
                                    s.date.forEach(function (d) {
                                        var event = angular.copy(s);
                                        event.start = util.toLocalDate(d);
                                        event.className = 'bgm-cyan';
                                        events.push(event);
                                        //console.log(events);
                                    });

                                });
                                deferred.resolve(events);
                            });
                        } else {
                            deferred.resolve([]);
                        }

                        return deferred.promise;
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
                url: '/read',
                views: {
                    'content': {
                        templateUrl: 'module/read/read.html',
                        controller: 'readController as readCtrl'
                    }

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
                }
            });
    });