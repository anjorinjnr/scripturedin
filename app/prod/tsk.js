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
        'localytics.directives'
        //'nouislider'
        //'ngTable'
    ])
    .constant('USER_ROLES', {
        guest: 'guest',
        pastor: 'pastor',
        user: 'user',
    })
    .run(["$rootScope", "authService", "$state", "$mdToast", function ($rootScope, authService, $state, $mdToast) {
            {
                //var toast =
                $rootScope.$on('alert', function (e, message, duration) {
                    console.log( $mdToast.simple());
                    var duration = duration ? duration : 4000;
                   // $mdToast.showSimple(message);
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent(message)
                            .position('top right')
                            .hideDelay(duration)
                    );


                });

                $rootScope.authService = authService;
                $rootScope.$state = $state;

                console.log($state);
                /**
                 * Perform state checks
                 */
                $rootScope.$on('$stateChangeStart', function (event, toState) {

                    console.log(toState);
                    // console.log(toState.resolve.auth());
                    if (toState.url === '/logout') {
                        console.log('logout');
                        event.preventDefault();
                        authService.logout();
                        return;
                    }
                    if (authService.hasSession()) {
                        if (toState.url === '/' || toState.url === 'login') {
                            event.preventDefault();
                            $state.go('base.home');
                        }
                    } else if (toState.data && !authService.isAuthorized(toState.data.role)) {
                        event.preventDefault();
                        $state.go('main.login');

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
                        {name: 'colors', items: ['fontColor', 'backgroundColor', '-']},
                        //{name: 'links', items: ['image', 'hr', 'symbols', 'link', 'unlink', '-']},
                        //{ name: 'tools', items: ['print', '-'] },
                        //{name: 'styling', items: ['font', 'size', 'format']},
                    ]
                };
            }
        }]
    );

App.controller('appController', function () {

    this.fabMenu = {
        isOpen: false
    };

    this.ver = '0.1';

});
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
                        templateUrl: 'module/main/signup-profile.html',
                        controller: 'mainController as mainCtrl'
                    }
                },
                resolve: {
                    auth: resolveAuth
                },
                data: {
                    role: USER_ROLES.user,
                    hideHeader: true,
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

                data: {
                    role: USER_ROLES.user
                }
            })
            .state('base.sermon-create', {
                url: '/sermon/create',
                views: {
                    'content': {
                        templateUrl: 'module/sermon/create.html',
                        controller: 'sermonController as sermonCtrl'
                    }
                },
                data: {
                    role: USER_ROLES.pastor,
                    pageTitle: 'Create new Sermon'
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
            });
    }]);


App

    // =========================================================================
    // Header Messages and Notifications list Data
    // =========================================================================

    .service('messageService', ['$resource', function($resource){
        this.getMessage = function(img, user, text) {
            var gmList = $resource("data/messages-notifications.json");
            
            return gmList.get({
                img: img,
                user: user,
                text: text
            });
        }
    }])
    

    // =========================================================================
    // Best Selling Widget Data (Home Page)
    // =========================================================================

    .service('bestsellingService', ['$resource', function($resource){
        this.getBestselling = function(img, name, range) {
            var gbList = $resource("data/best-selling.json");
            
            return gbList.get({
                img: img,
                name: name,
                range: range,
            });
        }
    }])

    
    // =========================================================================
    // Todo List Widget Data
    // =========================================================================

    .service('todoService', ['$resource', function($resource){
        this.getTodo = function(todo) {
            var todoList = $resource("data/todo.json");
            
            return todoList.get({
                todo: todo
            });
        }
    }])


    // =========================================================================
    // Recent Items Widget Data
    // =========================================================================
    
    .service('recentitemService', ['$resource', function($resource){
        this.getRecentitem = function(id, name, price) {
            var recentitemList = $resource("data/recent-items.json");
            
            return recentitemList.get ({
                id: id,
                name: name,
                price: price
            })
        }
    }])


    // =========================================================================
    // Recent Posts Widget Data
    // =========================================================================
    
    .service('recentpostService', ['$resource', function($resource){
        this.getRecentpost = function(img, user, text) {
            var recentpostList = $resource("data/messages-notifications.json");
            
            return recentpostList.get ({
                img: img,
                user: user,
                text: text
            })
        }
    }])
    
    // =========================================================================
    // Data Table
    // =========================================================================
    
    .service('tableService', [function(){
        this.data = [
            {
                "id": 10238,
                "name": "Marc Barnes",
                "email": "marc.barnes54@example.com",
                "username": "MarcBarnes",
                "contact": "(382)-122-5003"
            },
            {   
                "id": 10243,
                "name": "Glen Curtis",
                "email": "glen.curtis11@example.com",
                "username": "GlenCurtis",
                "contact": "(477)-981-4948"
            },
            {
                "id": 10248,
                "name": "Beverly Gonzalez",
                "email": "beverly.gonzalez54@example.com",
                "username": "BeverlyGonzalez",
                "contact": "(832)-255-5161"
            },
            {
                "id": 10253,
                "name": "Yvonne Chavez",
                "email": "yvonne.chavez@example.com",
                "username": "YvonneChavez",
                "contact": "(477)-446-3715"
            },
            {
                "id": 10234,
                "name": "Melinda Mitchelle",
                "email": "melinda@example.com",
                "username": "MelindaMitchelle",
                "contact": "(813)-716-4996"
                
            },
            {
                "id": 10239,
                "name": "Shannon Bradley",
                "email": "shannon.bradley42@example.com",
                "username": "ShannonBradley",
                "contact": "(774)-291-9928"
            },
            {
                "id": 10244,
                "name": "Virgil Kim",
                "email": "virgil.kim81@example.com",
                "username": "VirgilKim",
                "contact": "(219)-181-7898"
            },
            {
                "id": 10249,
                "name": "Letitia Robertson",
                "email": "letitia.rober@example.com",
                "username": "Letitia Robertson",
                "contact": "(647)-209-4589"
            },
            {
                "id": 10237,
                "name": "Claude King",
                "email": "claude.king22@example.com",
                "username": "ClaudeKing",
                "contact": "(657)-988-8701"
            },
            {
                "id": 10242,
                "name": "Roland Craig",
                "email": "roland.craig47@example.com",
                "username": "RolandCraig",
                "contact": "(932)-935-9471"
            },
            {
                "id": 10247,
                "name": "Colleen Parker",
                "email": "colleen.parker38@example.com",
                "username": "ColleenParker",
                "contact": "(857)-459-2792"
            },
            {
                "id": 10252,
                "name": "Leah Jensen",
                "email": "leah.jensen27@example.com",
                "username": "LeahJensen",
                "contact": "(861)-275-4686"
            },
            {
                "id": 10236,
                "name": "Harold Martinez",
                "email": "martinez67@example.com",
                "username": "HaroldMartinez",
                "contact": "(836)-634-9133"
            },
            {
                "id": 10241,
                "name": "Keith Lowe",
                "email": "keith.lowe96@example.com",
                "username": "KeithLowe",
                "contact": "(778)-787-3100"
            },
            {
                "id": 10246,
                "name": "Charles Walker",
                "email": "charles.walker90@example.com",
                "username": "CharlesWalker",
                "contact": "(486)-440-4716"
            },
            {
                "id": 10251,
                "name": "Lillie Curtis",
                "email": "lillie.curtis12@example.com",
                "username": "LillieCurtis",
                "contact": "(342)-510-2258"
            },
            {
                "id": 10235,
                "name": "Genesis Reynolds",
                "email": "genesis@example.com",
                "username": "GenesisReynolds",
                "contact": "(339)-375-1858"
            },
            {
                "id": 10240,
                "name": "Oscar Palmer",
                "email": "oscar.palmer24@example.com",
                "username": "OscarPalmer",
                "contact": "(544)-270-9912"
            },
            {
                "id": 10245,
                "name": "Lena Bishop",
                "email": "Lena Bishop",
                "username": "LenaBishop",
                "contact": "(177)-521-1556"
            },
            {
                "id": 10250,
                "name": "Kent Nguyen",
                "email": "kent.nguyen34@example.com",
                "username": "KentNguyen",
                "contact": "(506)-533-6801"
            }
        ];
    }])


    // =========================================================================
    // Malihu Scroll - Custom Scroll bars
    // =========================================================================
    .service('scrollService', function() {
        var ss = {};
        ss.malihuScroll = function scrollBar(selector, theme, mousewheelaxis) {
            $(selector).mCustomScrollbar({
                theme: theme,
                scrollInertia: 100,
                axis:'yx',
                mouseWheel: {
                    enable: true,
                    axis: mousewheelaxis,
                    preventDefault: true
                }
            });
        }
        
        return ss;
    })


    //==============================================
    // BOOTSTRAP GROWL
    //==============================================

    .service('growlService', function(){
        var gs = {};
        gs.growl = function(message, type) {
            $.growl({
                message: message
            },{
                type: type,
                allow_dismiss: false,
                label: 'Cancel',
                className: 'btn-xs btn-inverse',
                placement: {
                    from: 'top',
                    align: 'right'
                },
                delay: 2500,
                animate: {
                        enter: 'animated bounceIn',
                        exit: 'animated bounceOut'
                },
                offset: {
                    x: 20,
                    y: 85
                }
            });
        }
        
        return gs;
    })

/**
 * Created by eanjorin on 12/10/15.
 */
App.controller('homeController', ["$rootScope", "userService", "bibleService", function ($rootScope, userService, bibleService) {

    var self = this;

    console.log(11);

    /*
     listen to search event
     */
    $rootScope.$on('search', function (ev, b) {
        self.getScripture(b.query)
    });

    /**
     * Get scripture
     */
    self.getScripture = function (query) {
        bibleService.get(query).then(function (resp) {
            console.log(resp.data);
        });

    }
}]);
App.controller('mainController', ["$timeout", "$state", "$scope", "growlService", "userService", "authService", "bibleService", function ($timeout, $state, $scope, growlService, userService,
                                           authService, bibleService) {
    //Welcome Message
    //growlService.growl('Welcome back Mallinda!', 'inverse')

    var self = this;
    self.scope = $scope;
    self.user = authService.getUser();
    self.newChurch = {};
    self.updateProfile = function () {
        self.user.church_id = self.user.church.id;
        //console.log(self.profile);
        userService.updateProfile(self.user).then(function (resp) {
            if (resp.data.id) {
                self.user = resp.data;
                authService.createSession(self.user);
                $scope.$emit('alert', 'Changes saved');
                //$state.go('base.home');
            } else {
                $scope.$emit('alert', 'Failed to save changes.');

            }
        });


    };
    //if login or signup
    authService.checkFbLoginStatus();

    //if post signup profile
    /**
     * Provide auto complete for church select input
     * @param val
     * @returns {Array}
     */
    self.getChurch = function (val) {
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

    /**
     * Get list of saved churches from server
     */
    // console.log($state);
    if ($state.current.name == 'base.post-signup-profile') {
        self.churches = bibleService.getChurches().then(function (resp) {
            self.churches = _.sortBy(resp.data, 'name');
            var church = _.find(self.churches, {'id': self.user.church_key})
           self.user.church = church;
        });

    }


    self.fbLogin = function (action) {
        authService.facebookLogin(action);
    };

    this.signUp = function (form) {
        console.log(form);
    };


    /**
     * Create church in server
     * Add to church list on client
     * and set new church as the selected church
     */
    self.addChurch = function () {
        if (!_.isUndefined(self.newChurch.name)) {
            bibleService.addChurch(self.newChurch).then(function (resp) {
                self.newChurch = {};
                if (resp.data.id) {
                    var ch = resp.data;
                    self.churches.push(ch);
                    self.profile.church = ch;
                    $scope.newChurch = $scope.noResults = false;

                }
            });
        }
    };

    // Detact Mobile Browser
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        angular.element('html').addClass('ismobile');
    }


    // By default template has a boxed layout
    this.layoutType = localStorage.getItem('ma-layout-status');

    // For Mainmenu Active Class
    this.$state = $state;

    //Close sidebar on click
    this.sidebarStat = function (event) {
        if (!angular.element(event.target).parent().hasClass('active')) {
            this.sidebarToggle.left = false;
        }
    }

    //Listview Search (Check listview pages)
    this.listviewSearchStat = false;

    this.lvSearch = function () {
        this.listviewSearchStat = true;
    }

    //Listview menu toggle in small screens
    this.lvMenuStat = false;

    //Blog
    this.wallCommenting = [];

    this.wallImage = false;
    this.wallVideo = false;
    this.wallLink = false;

    //Skin Switch
    this.currentSkin = 'blue';

    this.skinList = [
        'lightblue',
        'bluegray',
        'cyan',
        'teal',
        'green',
        'orange',
        'blue',
        'purple'
    ]

    this.skinSwitch = function (color) {
        this.currentSkin = color;
    }

}])




App.controller('readController', ["$location", "bibleService", "$mdDialog", "userService", function ($location, bibleService,
                                           $mdDialog, userService) {

    var self = this;
    var query = $location.search();
    self.versions = bibleService.versions();

    $(document.body).bind('mouseup', function (e) {
        var selection;
        if (window.getSelection) {
            selection = window.getSelection();
        } else if (document.selection) {
            selection = document.selection.createRange();
        }
        var selected = selection.toString();
        if (!_.isEmpty(selected)) {
            console.log(e);
            console.log(selection.anchorNode.parentNode.id);
            console.log(selected);
            console.log(selected.split(/v\d+:/));
        }

    });
    $('.verse').select(function () {
        console.log(arguments);
    });
    if (query.p) {
        bibleService.get(query.p).then(function (resp) {
            self.bible = resp.data;
            //console.log(scrip);
            switch (self.bible.type) {
                case 'verse':
                    self.bible.data = _.groupBy(self.bible.book, function (b) {
                        return b.book_name + ' ' + b.chapter_nr;
                    });
                    console.log(self.bible);
            }
        });
    }

    self.selected = {};

    /**
     * Highlight or unhighlight selected row
     * @param verse
     * @param book
     */
    self.highlight = function (verse, book) {
        if (!(book in self.selected)) {
            self.selected[book] = {};
        }
        self.selected[book][verse] = !self.selected[book][verse];
    };

    self.askForComment = function (ev) {
        $mdDialog.show({
            controller: ["$scope", "$mdDialog", function ($scope, $mdDialog) {
                var self = this;
                self.$scope = $scope;
                self.request = {};
                self.request.tags = [];
                self.request.invites = [
                    {
                        'type': 'email'
                    }
                ];
                self.newInvite = function () {
                    self.request.invites.push({
                        'type': 'email'
                    });
                };
                self.removeInvite = function (i) {
                    self.request.invites.splice(i, 1);
                };
                self.submitForm = function () {
                    console.log($('#reqForm'));
                    console.log(self.request);
                   // $scope.$emit('submitRequestEvent');

                };

            }],
            controllerAs: 'reqCtrl',
            templateUrl: '/module/read/ask-comment.modal.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true
        });
    }
}]);
/**
 * Created by eanjorin on 12/14/15.
 */
App.controller('sermonController', ["$location", "bibleService", "$mdDialog", "userService", function ($location, bibleService,
                                             $mdDialog, userService) {
    var self = this;

    self.sermon = {
        scriptures: [],
        dates: [{'date': ''}],
        title: '',
        notes: [
            {
                content: ''
            }
        ],
        questions: [
            {
                content: ''
            }
        ]
    };
    self.errors = {};
    self.publish = function () {
        self.submitted = true;
        console.log(self.sermon);
        if (!_.isEmpty(self.sermon.title) && self.sermon.scriptures.length > 0
            && !_.isEmpty(self.sermon.notes[0].content)) {
            console.log(self.sermon);

        }
    }
}]);
App.controller('headerController', ["$timeout", "$location", "messageService", "$scope", function($timeout, $location, messageService, $scope){

    var self = this;

    self.onSearchKeyPress = function(e) {
        //console.log(self.searchTerm);
        if (e && e.keyCode == 13) {
            //console.log('emit');
            //$scope.$emit('search', {query: self.searchTerm});
            $location.url('/read?p=' + self.searchTerm);
        }
    };

        // By default Sidbars are hidden in boxed layout and in wide layout only the right sidebar is hidden.
        this.sidebarToggle = {
            left: false,
            right: false
        };

        // Get messages and notification for header
        this.img = messageService.img;
        this.user = messageService.user;
        this.user = messageService.text;

        this.messageResult = messageService.getMessage(this.img, this.user, this.text);


        //Clear Notification
        this.clearNotification = function($event) {
            $event.preventDefault();

            var x = angular.element($event.target).closest('.listview');
            var y = x.find('.lv-item');
            var z = y.size();

            angular.element($event.target).parent().fadeOut();

            x.find('.list-group').prepend('<i class="grid-loading hide-it"></i>');
            x.find('.grid-loading').fadeIn(1500);
            var w = 0;

            y.each(function(){
                var z = $(this);
                $timeout(function(){
                    z.addClass('animated fadeOutRightBig').delay(1000).queue(function(){
                        z.remove();
                    });
                }, w+=150);
            })

            $timeout(function(){
                angular.element('#notifications').addClass('empty');
            }, (z*150)+200);
        }

        // Clear Local Storage
        this.clearLocalStorage = function() {

            //Get confirmation, if confirmed clear the localStorage
            swal({
                title: "Are you sure?",
                text: "All your saved localStorage values will be removed",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#F44336",
                confirmButtonText: "Yes, delete it!",
                closeOnConfirm: false
            }, function(){
                localStorage.clear();
                swal("Done!", "localStorage is cleared", "success");
            });

        }

        //Fullscreen View
        this.fullScreen = function() {
            //Launch
            function launchIntoFullscreen(element) {
                if(element.requestFullscreen) {
                    element.requestFullscreen();
                } else if(element.mozRequestFullScreen) {
                    element.mozRequestFullScreen();
                } else if(element.webkitRequestFullscreen) {
                    element.webkitRequestFullscreen();
                } else if(element.msRequestFullscreen) {
                    element.msRequestFullscreen();
                }
            }

            //Exit
            function exitFullscreen() {
                if(document.exitFullscreen) {
                    document.exitFullscreen();
                } else if(document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if(document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                }
            }

            if (exitFullscreen()) {
                launchIntoFullscreen(document.documentElement);
            }
            else {
                launchIntoFullscreen(document.documentElement);
            }
        }

    }]);

App.service('authService', ["$http", "$state", "$q", "USER_ROLES", "localStorageService", function ($http,
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
        console.log(self.user);
        if (!_.isEmpty(user)) {
            deferred.resolve(user);
        } else {
            self.loadCurrentUser().then(function () {
                user = self.getUser();
                if (user) {
                    deferred.resolve(user);
                } else {
                    deferred.reject();
                    $state.go('login');
                }
            });
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
     * Create new user,
     * @param data
     */
    self.signup = function (data, action) {

        $http.post('/api/signup', data).then(function (resp) {
            if (resp.data.id) {
                self.createSession(resp.data);
                if (action == 'signup') {
                    $state.go('base.post-signup-profile');
                } else {
                    $state.go('base.home');
                }
            } else {

            }

        })
    };

    /**
     * Return true if there is a current user set
     * otherwise false
     * @returns {boolean}
     */
    self.hasSession = function () {
        console.log(localStorageService.get('user'));
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

        user = $rootScope.user;
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

    self.facebookLogin = function (action) {

        if (typeof FB !== 'undefined') {
            FB.login(function (response) {
                //console.log(response);
                if (response.status == 'connected') {
                    FB.api('/me?fields=email,first_name,last_name', function (user) {
                        user.access_token = response.authResponse.accessToken;
                        user.channel = 'facebook';
                        self.signup(user, action);
                    })
                }
            }, {scope: 'public_profile,email'});
        } else {
            console.error('FB SDK missing..')
        }
    }
}])
;
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

/**
 * Created by eanjorin on 12/11/15.
 */
App.service('bibleService', ["$http", "$q", "bibleData", function ($http, $q, bibleData) {
    var BASE_URL = 'https://getbible.net/json?';
    var self = this;


    var VERSIONS = {
        'kjv': 'King James Version',
        'akjv': 'KJV Easy Read',
        'asv': 'American Standard Version',
        'amp': 'Amplified Version',
        'basicenglish': 'Basic English Bible',
        'darby': 'Darby',
        'nasb': 'New American Standard',
        'ylt': 'Young\'s Literal Translation',
        'web': 'World English Bible',
        'wb': 'Webster\'s Bible'
    };

    self.parseScripture = function scrip(str) {
        var re = /([1|2]?[\D]+)(\d.*)/;
        var m;

        if ((m = re.exec(str)) !== null) {
            if (m.index === re.lastIndex) {
                re.lastIndex++;
            }
        }
        if (m.length > 1) {
            var book = m[1];
            var chapter, verses;
            var ch_re = /(\d+):?(.*)/;
            var mm;

            if (m.length > 2 && (mm = ch_re.exec(str)) !== null) {
                if (ch_re.index === ch_re.lastIndex) {
                    ch_re.lastIndex++;
                }
                if (mm.length > 1) {
                    chapter = mm[1];
                }
                if (mm.length > 2) {
                    verses = mm[2].split(',');
                }
            }
        }
        return  {
            book: book,
            chapter: chapter,
            verses: verses
        }
    };
    self.addChurch = function (data) {
        return $http.post('/api/church', data);
    };
    self.getChurches = function () {
        return $http.get('/api/churches');
    };

    self.get = function (passage, version) {
        version = version ? version : 'kjv';
        return $http.jsonp(BASE_URL + 'callback=JSON_CALLBACK&passage=' + passage + '&v=' + version);
        // var def = $q.defer();
        // def.resolve({ data: {
        //     "book": [
        //         {
        //             "book_ref": "Ac",
        //             "book_name": "Acts",
        //             "book_nr": "44",
        //             "chapter_nr": "3",
        //             "chapter": {
        //                 "4": {
        //                     "verse_nr": "4",
        //                     "verse": "And Peter, fastening his eyes upon him with John, said, Look on us."
        //                 },
        //                 "5": {
        //                     "verse_nr": 5,
        //                     "verse": "And he gave heed unto them, expecting to receive something of them."
        //                 },
        //                 "6": {
        //                     "verse_nr": 6,
        //                     "verse": "Then Peter said, Silver and gold have I none; but such as I have give I thee: In the name of Jesus Christ of Nazareth rise up and walk."
        //                 },
        //                 "7": {
        //                     "verse_nr": 7,
        //                     "verse": "And he took him by the right hand, and lifted him up: and immediately his feet and ankle bones received strength."
        //                 },
        //                 "8": {
        //                     "verse_nr": 8,
        //                     "verse": "And he leaping up stood, and walked, and entered with them into the temple, walking, and leaping, and praising God."
        //                 },
        //                 "9": {
        //                     "verse_nr": 9,
        //                     "verse": "And all the people saw him walking and praising God:"
        //                 },
        //                 "10": {
        //                     "verse_nr": 10,
        //                     "verse": "And they knew that it was he which sat for alms at the Beautiful gate of the temple: and they were filled with wonder and amazement at that which had happened unto him."
        //                 },
        //                 "11": {
        //                     "verse_nr": 11,
        //                     "verse": "And as the lame man which was healed held Peter and John, all the people ran together unto them in the porch that is called Solomon's, greatly wondering."
        //                 },
        //                 "12": {
        //                     "verse_nr": 12,
        //                     "verse": "And when Peter saw it, he answered unto the people, Ye men of Israel, why marvel ye at this? or why look ye so earnestly on us, as though by our own power or holiness we had made this man to walk?"
        //                 },
        //                 "13": {
        //                     "verse_nr": 13,
        //                     "verse": "The God of Abraham, and of Isaac, and of Jacob, the God of our fathers, hath glorified his Son Jesus; whom ye delivered up, and denied him in the presence of Pilate, when he was determined to let him go."
        //                 },
        //                 "14": {
        //                     "verse_nr": 14,
        //                     "verse": "But ye denied the Holy One and the Just, and desired a murderer to be granted unto you;"
        //                 },
        //                 "15": {
        //                     "verse_nr": 15,
        //                     "verse": "And killed the Prince of life, whom God hath raised from the dead; whereof we are witnesses."
        //                 },
        //                 "16": {
        //                     "verse_nr": 16,
        //                     "verse": "And his name through faith in his name hath made this man strong, whom ye see and know: yea, the faith which is by him hath given him this perfect soundness in the presence of you all."
        //                 },
        //                 "17": {
        //                     "verse_nr": 17,
        //                     "verse": "And now, brethren, I wot that through ignorance ye did it, as did also your rulers."
        //                 }
        //             }
        //         },
        //         {
        //             "book_ref": "Ac",
        //             "book_name": "Acts",
        //             "book_nr": "44",
        //             "chapter_nr": "2",
        //             "chapter": {
        //                 "1": {
        //                     "verse_nr": "1",
        //                     "verse": "And when the day of Pentecost was fully come, they were all with one accord in one place."
        //                 }
        //             }
        //         }
        //     ],
        //     "direction": "LTR",
        //     "type": "verse",
        //     "version": "kjv"
        // }});
        // return def.promise;
    };

    self.versions = function () {
        return VERSIONS;
    }


}]);
/**
 * Created by eanjorin on 12/11/15.
 */
App
    .directive('focus', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                element.focus();
            }
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
    });
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
            })
        }
    }

});
/**
 * Created by eanjorin on 12/10/15.
 */
App.service('userService', ["$http", function ($http) {


    this.signUp = function (user) {
        return $http.post('/api/signup', user);
    };

    this.updateProfile = function (user) {
        return $http.post('/api/user/profile', user);
    };

    this.requestComment = function (request) {
        return $http.post('/api/request');

    };

    this.publishSermon = function (sermon) {
        return $http.post('/api/sermon/publish');
    };

    this.saveSermon = function (sermon) {
        return $http.post('/api/sermon');
    };
}]);