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
App.controller('sermonController', ["$location", "bibleService", "alertService", "$mdDialog", "userService", function ($location, bibleService, alertService,
                                             $mdDialog, userService) {
    var self = this;

    self.sermon = {
        scriptures: [],
        _dates: [{'date': new Date()}],
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

    self.test = function(){
        return 2;
    }

    self.scriptureSelect = function (e) {
        console.log(arguments)
    };

    self.onScriptureAdd = function (chip) {
        if (_.isEmpty((bibleService.parseScripture(chip)))) {
            return null;
        }
    };

    self._validateSermon = function () {
        if (!_.isEmpty(self.sermon.title) && self.sermon.scriptures.length > 0
            && !_.isEmpty(self.sermon.notes[0].content)) {
            //create scripture objects
            self.sermon.scripture = self.sermon.scriptures.map(function (s) {
                return bibleService.parseScripture(s);
            });
            //convert date objects to string repr
            self.date = self.sermon._dates.map(function (d) {
                return moment(d).format('YYYY/MM/DD');
            });
            return true;
        }
        return false;
    };
    self.save = function () {
        self.submitted = true;
        if (self._validateSermon()) {
            bibleService.saveSermon(self.sermon).then(function (resp) {
                resp = resp.data;
                if (resp.id) {
                    alertService.info('Sermon saved');
                    //map the date string to date objects
                    resp._dates = resp.date.map(function (d) {
                        var date = resp.date.split('/');
                        return new Date(date[0], date[1], date[2]);
                    });
                    self.sermon = resp;
                    console.log(sermon);
                } else if (resp.status == 'error') {
                    alertService.danger(resp.message.join('<br>'));
                }

            });
        }
    };
    /**
     * Publish a sermon so it's available to users
     */
    self.publish = function () {
        self.submitted = true;
        //console.log(self.sermon);
        if (!_.isEmpty(self.sermon.title) && self.sermon.scriptures.length > 0
            && !_.isEmpty(self.sermon.notes[0].content)) {
            self.sermon.scripture = self.sermon.scriptures.map(function (s) {
                return bibleService.parseScripture(s);
            });
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

App.service('alertService', function () {
    var self = this;

    var config = {
        enter: 'animated fadeIn',
        exit: '',
        from: 'top',
        align: 'right',
        delay: 4000,
        icon: ''
    };
    self.info = function (message) {
        notify(message, 'inverse')
    };
    self.danger = function (message) {
        notify(message, 'danger')
    };
    function notify(message, type) {
        $.growl({
            icon: config.icon,
            title: '',
            message: message,
            url: ''
        }, {
            element: 'body',
            type: type,
            allow_dismiss: true,
            placement: {
                from: config.from,
                align: config.align
            },
            offset: {
                x: 20,
                y: 85
            },
            spacing: 10,
            z_index: 1031,
            delay: config.delay,
            timer: 1000,
            url_target: '_blank',
            mouse_over: false,
            animate: {
                enter: config.enter,
                exit: config.exit
            },
            icon_type: 'class',
            template: '<div data-growl="container" class="alert" role="alert">' +
            '<button type="button" class="close" data-growl="dismiss">' +
            '<span aria-hidden="true">&times;</span>' +
            '<span class="sr-only">Close</span>' +
            '</button>' +
            '<span data-growl="icon"></span>' +
            '<span data-growl="title"></span>' +
            '<span data-growl="message"></span>' +
            '<a href="#" data-growl="url"></a>' +
            '</div>'
        });
    }
});
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

    function _validate_book(book) {
        var re = /^(genesis|ge|gen|exodus|ex|exo|leviticus|le|lev|numbers|nu|num|deuteronomy|dt|deut|deu|de|joshua|js|jos|jos|josh|judges|jg|jdg|jdgs|ruth|ru|rut|1\s?samuel|1s|1\s?sam|1sam|1\s?sa|1sa|i\s?samuel|i\s?sam|i\s?sa|2\s?samuel|2s|2\s?sam|2sam|2\s?sa|2sa|ii\s?samuel|ii\s?sam|ii\s?sa|iis|1\s?kings|1k|1\s?kin|1kin|1\s?ki|ik|1ki|i\s?kings|i\s?kin|i\s?ki|2\s?kings|2k|2\s?kin|2kin|2\s?ki|iik|2ki|ii\s?kings|ii\s?kin|ii\s?ki|1\s?chronicles|1ch|1\s?chr|1chr|1\s?ch|ich|i\s?chronicles|i\s?chr|i\s?ch|2\s?chronicles|2ch|2\s?chr|2\s?chr|2chr|2\s?ch|iich|ii\s?chronicles|ii\s?chr|ii\s?ch|ezra|ezr|nehemiah|ne|neh|neh|ne|esther|es|est|esth|job|jb|job|psalm|ps|psa|proverbs|pr|prov|pro|ecclesiastes|ec|ecc|qohelet|song\s?of songs|so|sos|song\s?of solomon|sos|songofsongs|songofsolomon|canticle\s?of canticles|isaiah|is|isa|jeremiah|je|jer|lamentations|la|lam|lament|ezekiel|ek|ezek|eze|daniel|da|dan|dl|dnl|hosea|ho|hos|joel|jl|joel|joe|amos|am|amos|amo|obadiah|ob|oba|obd|odbh|jonah|jh|jon|jnh|micah|mi|mic|nahum|na|nah|nah|na|habakkuk|hb|hab|hk|habk|zephaniah|zp|zep|zeph|haggai|ha|hag|hagg|zechariah|zc|zech|zec|malachi|ml|mal|mlc|matthew|mt|matt|mat|mark|mk|mar|mrk|luke|lk|luk|lu|john|jn|joh|jo|acts|ac|act|romans|ro|rom|rmn|rmns|1\s?corinthians|1co|1\s?cor|1cor|ico|1\s?co|1co|i\s?corinthians|i\s?cor|i\s?co|2\s?corinthians|2co|2\s?cor|2cor|iico|2\s?co|2co|ii\s?corinthians|ii\s?cor|ii\s?co|galatians|ga|gal|gltns|ephesians|ep|eph|ephn|philippians|pp|phi|phil|phi|colossians|co|col|colo|cln|clns|1\s?thessalonians|1th|1\s?thess|1thess|ith|1\s?thes|1thes|1\s?the|1the|1\s?th|1th|i\s?thessalonians|i\s?thess|i\s?the|i\s?th|2\s?thessalonians|2th|2\s?thess|2\s?thess|2thess|iith|2\s?thes|2thes|2\s?the|2the|2\s?th|2th|ii\s?thessalonians|ii\s?thess|ii\s?the|ii\s?th|1\s?timothy|1ti|1\s?tim|1tim|1\s?ti|iti|1ti|i\s?timothy|i\s?tim|i\s?ti|2\s?timothy|2ti|2\s?tim|2\s?tim|2tim|2\s?ti|iiti|2ti|ii\s?timothy|ii\s?tim|ii\s?ti|titus|ti|tit|tt|ts|philemon|pm|phile|phile|philm|pm|hebrews|he|heb|hw|james|jm|jam|jas|ja|1\s?peter|1p|1\s?pet|1pet|ipe|1p|i\s?peter|i\s?pet|i\s?pe|2\s?peter|2p|2\s?pet|2pet|2pe|iip|ii\s?peter|ii\s?pet|ii\s?pe|1\s?john|1j|1\s?jn|1jn|1\s?jo|ijo|i\s?john|i\s?jo|i\s?jn|2\s?john|2j|2\s?jn|2jn|2\s?jo|iijo|ii\s?john|ii\s?jo|ii\s?jn|3\s?john|3j|3\s?jn|3\s?jn|3jn|3\s?jo|iiijo|iii\s?john|iii\s?jo|iii\s?jn|jude|jude|jude|revelation|re|rev|rvltn)$/;
        var m;

        if ((m = re.exec(book)) !== null) {
            if (m.index === re.lastIndex) {
                re.lastIndex++;
            }
            return m.length > 1;
        }
        return false;
    }

    /**
     * Parse out parts of a scripture string and return an object with the appropriate info
     * e.g John 3:!6 => {book: 'John', chapter:3, verses:['16']
     * @param str
     * @returns {{book: string, chapter: number, verses: Array}}
     */
    self.parseScripture = function scrip(str) {
        var re = /([1|2]?[\D]+)(\d.*)/;
        var m;

        if ((m = re.exec(str)) !== null) {
            if (m.index === re.lastIndex) {
                re.lastIndex++;
            }
        }
        if (m.length > 1) {
            var book = m[1].trim();
            var chapter = '', verses = [];
            var ch_re = /(\d+):?(.*)/;
            var mm;

            if (m.length > 2 && (mm = ch_re.exec(m[2])) !== null) {
                if (ch_re.index === ch_re.lastIndex) {
                    ch_re.lastIndex++;
                }
                if (mm.length > 1) {
                    chapter = parseInt(mm[1]);
                }
                if (mm.length > 2) {
                    //console.log(mm[2]);
                    var _verses = mm[2].split(',');
                    if (_verses[0].trim() != '') {
                        verses = _verses
                    }
                }
            }
        }
        if (_validate_book(book.toLowerCase())) {
            return {
                book: book,
                chapter: chapter,
                verses: verses
            }
        } else {
            return {};
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
    };

    self.saveSermon = function (sermon) {
        return $http.post('/api/sermon', sermon);
    };

    self.publishSermon = function (sermon) {
        return $http.post('/api/sermon/publish', sermon);
    };


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
    .directive('growlDemo', function(){
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                function notify(from, align, icon, type, animIn, animOut){
                    console.log(arguments);
                    $.growl({
                        icon: icon,
                        title: ' Bootstrap Growl ',
                        message: 'Turning standard Bootstrap alerts into awesome notifications',
                         url: 'http://google.com'
                    },{
                            element: 'body',
                            type: type,
                            allow_dismiss: true,
                            placement: {
                                    from: from,
                                    align: align
                            },
                            offset: {
                                x: 20,
                                y: 85
                            },
                            spacing: 10,
                            z_index: 1031,
                            delay: 2500,
                            timer: 1000,
                            url_target: '_blank',
                            mouse_over: false,
                            animate: {
                                    enter: animIn,
                                    exit: animOut
                            },
                            icon_type: 'class',
                            template: '<div data-growl="container" class="alert" role="alert">' +
                                            '<button type="button" class="close" data-growl="dismiss">' +
                                                '<span aria-hidden="true">&times;</span>' +
                                                '<span class="sr-only">Close</span>' +
                                            '</button>' +
                                            '<span data-growl="icon"></span>' +
                                            '<span data-growl="title"></span>' +
                                            '<span data-growl="message"></span>' +
                                            '<a href="#" data-growl="url"></a>' +
                                        '</div>'
                    });
                }

                element.on('click', function(e){
                    e.preventDefault();

                    var nFrom = attrs.from;
                    var nAlign = attrs.align;
                    var nIcons = attrs.icon;
                    var nType = attrs.type;
                    var nAnimIn = attrs.animationIn;
                    var nAnimOut = attrs.animationOut;

                    notify(nFrom, nAlign, nIcons, nType, nAnimIn, nAnimOut);

                })


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
angular.module("tskApp").run(["$templateCache", function($templateCache) {$templateCache.put("module/profile-menu.html","<li class=\"btn-wave\" data-ui-sref-active=\"active\"><a data-ui-sref=\"pages.profile.profile-about\">About</a></li>\r\n<li class=\"btn-wave\" data-ui-sref-active=\"active\"><a data-ui-sref=\"pages.profile.profile-timeline\">Timeline</a></li>\r\n<li class=\"btn-wave\" data-ui-sref-active=\"active\"><a data-ui-sref=\"pages.profile.profile-photos\">Photos</a></li>\r\n<li class=\"btn-wave\" data-ui-sref-active=\"active\"><a data-ui-sref=\"pages.profile.profile-connections\">Connections</a></li>\r\n");
$templateCache.put("module/home/home.html","<section id=\"main\">\n    <aside id=\"sidebar\" data-ng-include=\"\'module/shared/sidebar-left.html\'\"\n           data-ng-class=\"{ \'toggled\': mainCtrl.sidebarToggle.left === true }\"></aside>\n\n    <aside id=\"chat\" data-ng-include=\"\'module/shared/chat.html\'\"\n           data-ng-class=\"{ \'toggled\': mainCtrl.sidebarToggle.right === true }\"></aside>\n\n    <section id=\"content\">\n\n        <div class=\"container\">\n            <div class=\"block-header\">\n                <h2>Dashboard</h2>\n\n                <ul class=\"actions\">\n                    <li>\n                        <a href=\"\">\n                            <i class=\"zmdi zmdi-trending-up\"></i>\n                        </a>\n                    </li>\n                    <li>\n                        <a href=\"\">\n                            <i class=\"zmdi zmdi-check-all\"></i>\n                        </a>\n                    </li>\n                    <li class=\"dropdown\" uib-dropdown>\n                        <a href=\"\" uib-dropdown-toggle>\n                            <i class=\"zmdi zmdi-more-vert\"></i>\n                        </a>\n\n                        <ul class=\"dropdown-menu dropdown-menu-right\">\n                            <li>\n                                <a href=\"\">Refresh</a>\n                            </li>\n                            <li>\n                                <a href=\"\">Manage Widgets</a>\n                            </li>\n                            <li>\n                                <a href=\"\">Widgets Settings</a>\n                            </li>\n                        </ul>\n                    </li>\n                </ul>\n\n            </div>\n\n            <div class=\"card\">\n                <div class=\"card-header\">\n                    <h2>Sales Statistics\n                        <small>Vestibulum purus quam scelerisque, mollis nonummy metus</small>\n                    </h2>\n\n                    <ul class=\"actions\">\n                        <li>\n                            <a href=\"\">\n                                <i class=\"zmdi zmdi-refresh-alt\"></i>\n                            </a>\n                        </li>\n                        <li>\n                            <a href=\"\">\n                                <i class=\"zmdi zmdi-download\"></i>\n                            </a>\n                        </li>\n                        <li class=\"dropdown\" uib-dropdown>\n                            <a href=\"\" uib-dropdown-toggle>\n                                <i class=\"zmdi zmdi-more-vert\"></i>\n                            </a>\n\n                            <ul class=\"dropdown-menu dropdown-menu-right\">\n                                <li>\n                                    <a href=\"\">Change Date Range</a>\n                                </li>\n                                <li>\n                                    <a href=\"\">Change Graph Type</a>\n                                </li>\n                                <li>\n                                    <a href=\"\">Other Settings</a>\n                                </li>\n                            </ul>\n                        </li>\n                    </ul>\n                </div>\n\n                <div class=\"card-body\">\n                    <div class=\"chart-edge\">\n                        <div class=\"flot-chart\" data-curvedline-chart></div>\n                    </div>\n                </div>\n            </div>\n            <div class=\"card\">\n                <div class=\"card-header\">\n                    <h2>Sales Statistics\n                        <small>Vestibulum purus quam scelerisque, mollis nonummy metus</small>\n                    </h2>\n\n                    <ul class=\"actions\">\n                        <li>\n                            <a href=\"\">\n                                <i class=\"zmdi zmdi-refresh-alt\"></i>\n                            </a>\n                        </li>\n                        <li>\n                            <a href=\"\">\n                                <i class=\"zmdi zmdi-download\"></i>\n                            </a>\n                        </li>\n                        <li class=\"dropdown\" uib-dropdown>\n                            <a href=\"\" uib-dropdown-toggle>\n                                <i class=\"zmdi zmdi-more-vert\"></i>\n                            </a>\n\n                            <ul class=\"dropdown-menu dropdown-menu-right\">\n                                <li>\n                                    <a href=\"\">Change Date Range</a>\n                                </li>\n                                <li>\n                                    <a href=\"\">Change Graph Type</a>\n                                </li>\n                                <li>\n                                    <a href=\"\">Other Settings</a>\n                                </li>\n                            </ul>\n                        </li>\n                    </ul>\n                </div>\n\n                <div class=\"card-body\">\n                    <div class=\"chart-edge\">\n                        <div class=\"flot-chart\" data-curvedline-chart></div>\n                    </div>\n                </div>\n            </div>\n            <div class=\"card\">\n                <div class=\"card-header\">\n                    <h2>Sales Statistics\n                        <small>Vestibulum purus quam scelerisque, mollis nonummy metus</small>\n                    </h2>\n\n                    <ul class=\"actions\">\n                        <li>\n                            <a href=\"\">\n                                <i class=\"zmdi zmdi-refresh-alt\"></i>\n                            </a>\n                        </li>\n                        <li>\n                            <a href=\"\">\n                                <i class=\"zmdi zmdi-download\"></i>\n                            </a>\n                        </li>\n                        <li class=\"dropdown\" uib-dropdown>\n                            <a href=\"\" uib-dropdown-toggle>\n                                <i class=\"zmdi zmdi-more-vert\"></i>\n                            </a>\n\n                            <ul class=\"dropdown-menu dropdown-menu-right\">\n                                <li>\n                                    <a href=\"\">Change Date Range</a>\n                                </li>\n                                <li>\n                                    <a href=\"\">Change Graph Type</a>\n                                </li>\n                                <li>\n                                    <a href=\"\">Other Settings</a>\n                                </li>\n                            </ul>\n                        </li>\n                    </ul>\n                </div>\n\n                <div class=\"card-body\">\n                    <div class=\"chart-edge\">\n                        <div class=\"flot-chart\" data-curvedline-chart></div>\n                    </div>\n                </div>\n            </div>\n\n\n        </div>\n    </section>\n</section>");
$templateCache.put("module/main/main.html","<section id=\"content\">\r\n\r\n\r\n    <div class=\"container\">\r\n\r\n        <div id=\"login-signup-reset\">\r\n            <div class=\"col-sm-6\" style=\"margin-bottom: 70px\">\r\n                <!--<h2>ScripturedIn</h2>-->\r\n                <!--login -->\r\n                <div ng-if=\"$state.current.name == \'main\' || $state.current.name == \'main.login\'\">\r\n\r\n                    <div class=\"lc-block toggled\" id=\"login\">\r\n                        <div class=\"input-group m-b-20\">\r\n                            <span class=\"input-group-addon\"><i class=\"zmdi zmdi-account\"></i></span>\r\n\r\n                            <div class=\"fg-line\">\r\n                                <input type=\"text\" class=\"form-control\" placeholder=\"Username\">\r\n                            </div>\r\n                        </div>\r\n\r\n                        <div class=\"input-group m-b-20\">\r\n                            <span class=\"input-group-addon\"><i class=\"zmdi zmdi-male\"></i></span>\r\n\r\n                            <div class=\"fg-line\">\r\n                                <input type=\"password\" class=\"form-control\" placeholder=\"Password\">\r\n                            </div>\r\n                        </div>\r\n\r\n                        <div class=\"clearfix\"></div>\r\n\r\n\r\n                        <a href=\"\" class=\"btn btn-login btn-danger btn-float\"><i\r\n                                class=\"zmdi zmdi-arrow-forward\"></i></a>\r\n\r\n                        <p class=\"text-center\"> or login with</p>\r\n                        <ul class=\"social-login\">\r\n                            <li>\r\n                                <!--<div class=\"g-signin2\" data-onsuccess=\"onSignIn\"></div>-->\r\n                                <a href><img src=\"img/social/googleplus-128.png\" alt=\"Google+ Login\"></a>\r\n\r\n                            </li>\r\n                            <li>\r\n                                <a href ng-click=\"mainCtrl.fbLogin()\">\r\n                                    <img src=\"img/social/facebook-128.png\" alt=\"Facebook Login\">\r\n                                </a>\r\n                            </li>\r\n                        </ul>\r\n\r\n                        <p class=\"m-t-10 text-center\">Not a member? <a ui-sref=\"main.signup\">Join Now</a></p>\r\n                    </div>\r\n                </div>\r\n                <div ng-if=\"$state.current.name == \'main.signup\'\"\r\n                     class=\"lc-block toggled\" id=\"sign-up\">\r\n                    <h2 style=\"margin-left: 20px; margin-bottom: 30px\"> Sign Up for ScripturedIn</h2>\r\n\r\n                    <form name=\"signUpForm\" ng-submit=\"mainCtrl.signUp(signUpForm)\" style=\"padding: 15px\">\r\n                        <div class=\"input-group m-b-20\">\r\n                            <!--<span class=\"input-group-addon\"><i class=\"zmdi zmdi-account\"></i></span>-->\r\n\r\n                            <div class=\"fg-line\">\r\n                                <label class=\"control-label\" for=\"firstname\">First Name</label>\r\n                                <input id=\"firstname\" ng-model=\"mainCtrl.user.first_name\" type=\"text\" required\r\n                                       class=\"form-control\">\r\n                            </div>\r\n                        </div>\r\n                        <div class=\"input-group m-b-20\">\r\n                            <!--<span class=\"input-group-addon\"><i class=\"zmdi zmdi-account\"></i></span>-->\r\n\r\n                            <div class=\"fg-line\">\r\n                                <label class=\"control-label\" for=\"lastname\">Last Name</label>\r\n                                <input id=\"lastname\" ng-model=\"mainCtrl.user.last_name\"\r\n                                       type=\"text\" required class=\"form-control\">\r\n                            </div>\r\n                        </div>\r\n\r\n                        <div class=\"input-group m-b-20\">\r\n                            <!--<span class=\"input-group-addon\"><i class=\"zmdi zmdi-email\"></i></span>-->\r\n\r\n                            <div class=\"fg-line\">\r\n                                <label class=\"control-label\" for=\"email\">Email</label>\r\n                                <input type=\"email\"\r\n                                       ng-model=\"mainCtrl.user.last_name\"\r\n                                       required class=\"form-control\" id=\"email\">\r\n                            </div>\r\n                        </div>\r\n\r\n                        <div class=\"input-group m-b-20\" style=\"width: 100%\">\r\n                            <button class=\"btn btn-block btn-primary waves-effect\">Sign Up</button>\r\n                        </div>\r\n\r\n                        <p class=\"text-center\"> or sign up with</p>\r\n                        <ul class=\"social-login\">\r\n                            <li>\r\n                                <!--<div class=\"g-signin2\" data-onsuccess=\"onSignIn\"></div>-->\r\n                                <a href><img src=\"img/social/googleplus-128.png\" alt=\"Google+ Login\"></a>\r\n\r\n                            </li>\r\n                            <li>\r\n                                <a ng-click=\"mainCtrl.fbLogin(\'signup\')\" href>\r\n                                    <img src=\"img/social/facebook-128.png\" alt=\"Facebook Login\">\r\n                                </a>\r\n                            </li>\r\n                        </ul>\r\n\r\n                        <p class=\"m-t-10 text-center\">Already have an account, <a ui-sref=\"main.login\">Sign In</a></p>\r\n                    </form>\r\n\r\n\r\n                </div>\r\n            </div>\r\n            <div class=\"col-sm-6\">\r\n                <h2>Image and stuff here</h2>\r\n            </div>\r\n\r\n        </div>\r\n\r\n\r\n    </div>\r\n\r\n</section>");
$templateCache.put("module/main/signup-profile.html","<section id=\"main\">\n\n    <section id=\"content\">\n\n        <div class=\"container\">\n\n\n            <div class=\"card\">\n                <div class=\"listview lv-bordered lv-lg\">\n                    <div class=\"lv-header-alt clearfix\">\n                        <h1 class=\"lvh-label\">Welcome {{authService.user.first_name}}, please take a moment to update your\n                            profile.</h1>\n\n                        <!--<ul class=\"lv-actions actions\">-->\n                            <!--<li>-->\n                                <!--<a href=\"\" data-ng-click=\"mactrl.listviewSearchStat = true\">-->\n                                    <!--<i class=\"zmdi zmdi-search\"></i>-->\n                                <!--</a>-->\n                            <!--</li>-->\n\n                        <!--</ul>-->\n                    </div>\n\n                    <div class=\"lv-body\" style=\"padding: 20px;\">\n                        <div class=\"row\">\n                            <div class=\"col-sm-12\">\n                                <form id=\"profile\" name=\"profile\">\n                                    <div class=\"form-group\">\n                                        <div class=\"row m-b-20\">\n                                            <div class=\"col-sm-3\">\n                                                <p>Select your church</p>\n                                            </div>\n                                            <div class=\"col-sm-8\">\n                                                <input type=\"text\" ng-model=\"mainCtrl.user.church\"\n                                                       placeholder=\"Type the name of your church\"\n                                                       uib-typeahead=\"c as c.name + \' (\' +  c.city + \')\' for c in  mainCtrl.getChurch($viewValue)\"\n                                                       typeahead-loading=\"loadingChurches\"\n                                                       typeahead-no-results=\"noResults\" class=\"form-control f-16\">\n                                                <i ng-show=\"loadingChurches\" class=\"glyphicon glyphicon-refresh\"></i>\n\n                                                <div ng-show=\"noResults\" class=\"f-14 c-red\">\n                                                    <i class=\"glyphicon glyphicon-remove\"></i> No church found,\n                                                    click <a href ng-click=\"newChurch=true;\">here</a> to add church</a>\n\n                                                    <div ng-if=\"newChurch\" id=\"new-church\" class=\"m-t-15\">\n                                                        <form name=\"churchForm\" id=\"churchForm\">\n                                                            <div class=\"row\">\n                                                                <div class=\"col-sm-8\">\n                                                                    <md-input-container class=\"md-block\">\n                                                                        <label>Church name</label>\n                                                                        <input required\n                                                                               name=\"churchname\"\n                                                                               ng-model=\"mainCtrl.newChurch.name\">\n\n                                                                        <div ng-if=\"mainCtrl.newChurch.name.length < 1\"\n                                                                             ng-messages=\"churchForm.churchname.$error\">\n                                                                            <div ng-message=\"required\">This is\n                                                                                required.\n                                                                            </div>\n                                                                        </div>\n                                                                    </md-input-container>\n                                                                </div>\n                                                            </div>\n                                                            <div class=\"row\">\n                                                                <div class=\"col-sm-8\">\n                                                                    <div class=\"form-group\">\n                                                                        <input type=\"text\"\n                                                                               class=\"form-control input-sm\"\n                                                                               ng-model=\"mainCtrl.newChurch.website\"\n                                                                               placeholder=\"Website\">\n\n                                                                    </div>\n\n                                                                </div>\n                                                            </div>\n                                                            <div class=\"row\">\n                                                                <div class=\"col-sm-8\">\n                                                                    <div class=\"form-group\">\n                                                                        <input type=\"text\"\n                                                                               name=\"city\"\n                                                                               class=\"form-control input-sm\"\n                                                                               ng-model=\"mainCtrl.newChurch.city\"\n                                                                               placeholder=\"City\">\n\n                                                                    </div>\n\n                                                                </div>\n                                                            </div>\n                                                            <div class=\"row\">\n                                                                <div class=\"col-sm-8\">\n                                                                    <div class=\"form-group\">\n                                                                        <input type=\"text\"\n                                                                               name=\"state\"\n                                                                               class=\"form-control input-sm\"\n                                                                               ng-model=\"mainCtrl.newChurch.state\"\n                                                                               placeholder=\"State\">\n\n\n                                                                    </div>\n\n                                                                </div>\n                                                            </div>\n                                                            <div class=\"row\">\n                                                                <div class=\"col-sm-8\">\n                                                                    <div class=\"form-group\">\n                                                                        <input type=\"text\"\n                                                                               name=\"country\"\n                                                                               class=\"form-control input-sm\"\n                                                                               ng-model=\"mainCtrl.newChurch.country\"\n                                                                               placeholder=\"Country\">\n\n                                                                    </div>\n\n                                                                </div>\n                                                            </div>\n                                                            <div class=\"row\">\n                                                                <div class=\"col-sm-8\">\n                                                                    <div class=\"form-group\">\n                                                                        <md-button\n                                                                                ng-click=\"mainCtrl.addChurch(churchForm)\"\n                                                                                class=\"md-raised c-white bgm-lightblue\">\n                                                                            Add Church\n                                                                        </md-button>\n                                                                        <md-button type=\"button\" class=\"md-raised\">\n                                                                            Close\n                                                                        </md-button>\n                                                                    </div>\n\n                                                                </div>\n                                                            </div>\n                                                        </form>\n\n\n                                                    </div>\n                                                </div>\n                                                <!--<select chosen-->\n                                                <!--data-placeholder=\"Select your church...\"-->\n                                                <!--ng-model=\"selected\"-->\n                                                <!--ng-options=\"c as c.name + \' (\' +  c.city + \')\' for c in mainCtrl.churches\"-->\n                                                <!--class=\"w-100 localytics-chosen\">-->\n                                                <!--<option value=\"\"></option>-->\n                                                <!--</select>-->\n                                            </div>\n                                        </div>\n                                    </div>\n                                    <div class=\"form-group\">\n                                        <div class=\"row\">\n                                            <div class=\"col-sm-3\">\n                                                <p>Are you a pastor?</p>\n\n                                            </div>\n                                            <div class=\"col-sm-8\">\n                                                <label class=\"radio radio-inline m-r-20\">\n                                                    <input type=\"radio\" ng-model=\"mainCtrl.user.is_pastor\"\n                                                           name=\"isPastor\" data-ng-value=\"true\">\n                                                    <i class=\"input-helper\"></i>\n                                                    Yes\n                                                </label>\n                                                <label style=\"margin-left: 0px\" class=\"radio radio-inline m-r-20\">\n                                                    <input type=\"radio\"\n                                                           ng-model=\"mainCtrl.user.is_pastor\"\n                                                           name=\"isPastor\" data-ng-value=\"false\">\n                                                    <i class=\"input-helper\"></i>\n                                                    No\n                                                </label>\n                                            </div>\n                                        </div>\n                                    </div>\n\n                                    <div class=\"form-group\">\n                                        <div class=\"row\">\n                                            <div class=\"col-sm-3\">\n                                                <p>Gender</p>\n                                            </div>\n                                            <div class=\"col-sm-8\">\n                                                <label class=\"radio radio-inline m-r-20\">\n                                                    <input type=\"radio\"\n                                                           ng-model=\"mainCtrl.user.gender\"\n                                                           name=\"gender\" value=\"m\">\n                                                    <i class=\"input-helper\"></i>\n                                                    Male\n                                                </label>\n                                                <label class=\"radio radio-inline m-r-20\">\n\n                                                    <input type=\"radio\"\n                                                           ng-model=\"mainCtrl.user.gender\"\n                                                           name=\"gender\" value=\"f\">\n                                                    <i class=\"input-helper\"></i>\n                                                    Female\n                                                </label>\n                                            </div>\n                                        </div>\n                                    </div>\n                                    <div class=\"form-group\">\n                                        <div class=\"row\">\n                                            <div class=\"col-sm-12\">\n                                                <md-button\n                                                        ng-click=\"mainCtrl.updateProfile()\"\n                                                        class=\"md-raised c-white bgm-blue\">\n                                                    Save\n                                                </md-button>\n                                                <md-button\n                                                        ng-click=\"$state.go(\'base.home\')\"\n                                                        class=\"md-raised\">\n                                                    Skip\n                                                </md-button>\n                                            </div>\n\n                                        </div>\n                                    </div>\n\n                                </form>\n                            </div>\n\n                        </div>\n\n                    </div>\n                </div>\n            </div>\n        </div>\n    </section>\n</section>");
$templateCache.put("module/read/ask-comment.modal.html","<md-dialog aria-label=\"Mango (Fruit)\" style=\"max-height: 100%\">\n    <md-toolbar style=\"background-color: #f7f7f7\">\n        <div class=\"md-toolbar-tools\">\n            <h2>Ask for Comments</h2>\n            <span flex></span>\n            <md-button class=\"md-icon-button\" ng-click=\"cancel()\">\n                <md-icon md-svg-src=\"img/icons/ic_close_24px.svg\" aria-label=\"Close dialog\"></md-icon>\n            </md-button>\n        </div>\n    </md-toolbar>\n    <form>\n        <md-dialog-content>\n            <div class=\"md-dialog-content\">\n                <p><label>Selected scripture</label><br/>\n                    John 3:16\n                </p>\n\n                <form submit-on=\"submitReqestForm\" id=\"reqForm\" ng-submit=\"reqCtrl.submitForm()\">\n                    <!--<form submit-on=\"submitRequestEvent\" ng-submit=\"reqCtrl.submitForm()\">-->\n                    <submit-on></submit-on>\n                    <div class=\"form-group fg-line\">\n                        <label for=\"headline\">Headline</label>\n                        <input type=\"headline\" class=\"form-control input-sm\" id=\"headline\"\n                               placeholder=\"Enter email\">\n                    </div>\n                    <div class=\"form-group fg-line\">\n                        <label for=\"context\">What\'s on your mind?</label>\n                        <textarea class=\"form-control input-sm\"\n                                  id=\"context\" placeholder=\"\">\n                            </textarea>\n                    </div>\n                    <div class=\"form-group fg-line\">\n                        <label for=\"context\">Tags (e.g finance, relationship, salvation etc)</label>\n                        <md-chips ng-model=\"reqCtrl.tags\">\n                        </md-chips>\n                    </div>\n                    <div class=\"form-group fg-line\">\n                        <label for=\"context\">Commentators</label>\n                        <textarea class=\"form-control input-sm\" ng-model=\"commentators\"\n                                  id=\"commentators\" placeholder=\"who do you want to comment?\">\n                        </textarea>\n\n                    </div>\n                    <!--<div class=\"form-group fg-line\">-->\n                    <!--<md-chips ng-model=\"tags\">-->\n                    <!--</md-chips>-->\n                    <!--</div>-->\n                    <div class=\"form-group\">\n                        <label style=\"padding: 0px\">Can\'t find who you want to comment?\n                            Invite a friend, pastor or spiritual mentor to comment</label>\n\n                        <div class=\"row\" ng-repeat=\"invite in reqCtrl.request.invites\">\n                            <div class=\"col-xs-3\">\n                                <md-input-container>\n                                    <md-select ng-model=\"invite.type\">\n                                        <md-option value=\"email\">email</md-option>\n                                        <md-option value=\"twitter\">twitter</md-option>\n                                    </md-select>\n                                </md-input-container>\n                            </div>\n                            <div class=\"col-xs-6\">\n                                <div class=\"form-group fg-line\" ng-if=\"invite.type==\'email\'\">\n                                    <label class=\"sr-only\">Email address</label>\n                                    <input ng-model=\"invite.email\"\n                                           type=\"email\" class=\"form-control input-sm\" placeholder=\"Enter email\">\n                                </div>\n                                <div class=\"form-group fg-line\" ng-if=\"invite.type==\'twitter\'\">\n                                    <label class=\"sr-only\">Twitter Handle</label>\n                                    <input ng-model=\"invite.handle\"\n                                           type=\"text\" class=\"form-control input-sm\" placeholder=\"@twitter_handle\">\n                                </div>\n                            </div>\n                            <div class=\"col-xs-3\" style=\"padding-top: 5px;\">\n                                <a style=\"font-size:18px\" href ng-click=\"reqCtrl.newInvite()\">\n                                    <i class=\"zmdi zmdi-plus zmdi-hc-fw\"></i>\n                                </a>\n                                <a ng-if=\"$index > 0\" style=\"font-size:18px\" href\n                                   ng-click=\"reqCtrl.removeInvite($index)\">\n                                    <i class=\"zmdi zmdi-minus zmdi-hc-fw\"></i>\n                                </a>\n                            </div>\n                        </div>\n\n                    </div>\n                </form>\n                <!--</form>-->\n            </div>\n        </md-dialog-content>\n        <md-dialog-actions layout=\"row\">\n            <!--<md-button href=\"http://en.wikipedia.org/wiki/Mango\" target=\"_blank\" md-autofocus>-->\n            <!--More on Wikipedia-->\n            <!--</md-button>-->\n            <span flex></span>\n            <md-button class=\"md-primary\" ng-click=\"reqCtrl.$scope.$broadcast(\'submitReqestForm\')\">\n                Post\n            </md-button>\n            <md-button ng-click=\"answer(\'useful\')\" style=\"margin-right:20px;\">\n                Cancel\n            </md-button>\n        </md-dialog-actions>\n    </form>\n</md-dialog>");
$templateCache.put("module/read/read.html","<section id=\"main\">\n\n    <section id=\"content\">\n\n        <div class=\"container\">\n\n            <!--{{readCtrl.bible.data}}-->\n            <div class=\"card\" style=\"margin-top: 20px;\" ng-repeat=\"(book, book_info) in readCtrl.bible.data\">\n                <div class=\"card-header\">\n                    <h2 class=\"book\">{{book}}</h2>\n\n                    <ul class=\"actions\">\n                        <li>\n                            <a href ng-click=\"readCtrl.askForComment($event)\">\n                                <md-tooltip>Ask for comment</md-tooltip>\n                                <i class=\"zmdi zmdi-comments\">\n                                </i>\n\n                            </a>\n                        </li>\n                        <li class=\"dropdown\" uib-dropdown>\n                            <a href=\"\" uib-dropdown-toggle>\n                                <i class=\"zmdi zmdi-translate\"></i>\n                                <md-tooltip>Change translation</md-tooltip>\n                            </a>\n\n                            <ul class=\"dropdown-menu dropdown-menu-right\">\n                                <li ng-repeat=\"(key, ver) in readCtrl.versions\">\n                                    <a href=\"\">{{::ver}}</a>\n                                </li>\n                            </ul>\n                        </li>\n                        <li class=\"dropdown\" uib-dropdown>\n                            <a href=\"\" uib-dropdown-toggle>\n                                <i class=\"zmdi zmdi-more-vert\"></i>\n                            </a>\n\n                            <ul class=\"dropdown-menu dropdown-menu-right\">\n                                <li>\n                                    <a href=\"\">Add Chapter to Favorites</a>\n                                </li>\n                                <li>\n                                    <a href=\"\">Add Selected to Favorites</a>\n                                </li>\n                            </ul>\n                        </li>\n                    </ul>\n                </div>\n\n                <div class=\"card-body\">\n                    <!--{{book_info}}-->\n                    <div class=\"chapter\">\n                        <!--<h5>Chapter {{chapter.chapter_nr}}</h5>-->\n\n                        <!--<div  uib-tooltip-classes=\"\" class=\"in\"-->\n                        <!--popover-popup=\"\" title=\"Popover Title\"-->\n                        <!--content=\"Vivamus sagittis lacus vel augue laoreet rutrum faucibus.\" placement=\"top\"-->\n                        <!--popup-class=\"\" animation=\"animation\" is-open=\"isOpen\" origin-scope=\"origScope\"-->\n                        <!--style=\"visibility: visible; display: block; top: 229px; left: 471px;\"-->\n                        <!--class=\"ng-isolate-scope top fade popover in\">-->\n                        <!--<div class=\"arrow\"></div>-->\n\n                        <!--<div class=\"popover-inner\">-->\n                        <!--<h3 class=\"popover-title ng-binding ng-scope\">Popover Title</h3>-->\n                        <!--<div class=\"popover-content ng-binding\">Vivamus sagittis lacus vel-->\n                        <!--augue laoreet rutrum faucibus.-->\n                        <!--</div>-->\n                        <!--</div>-->\n                        <!--</div>-->\n\n                        <div id=\"verses\">\n                            <p id=\"v{{verse}}\" class=\"verse\" ng-class=\"{highlight: readCtrl.selected[book][verse]}\"\n                               ng-repeat=\"(verse, verse_info) in book_info[0].chapter\">\n                                <a href=\"\" ng-click=\"readCtrl.highlight(verse, book)\"><span style=\"margin-right: 15px\">v{{verse}}:</span></a>\n                                {{verse_info.verse}}\n                            </p>\n                        </div>\n\n                    </div>\n                </div>\n            </div>\n\n        </div>\n    </section>\n</section>");
$templateCache.put("module/sermon/create.html","<section id=\"main\">\n\n    <!-- ideas todo\n     show bible in side\n     allow user to specify translation\n      -->\n    <section id=\"content\">\n\n        <div class=\"container\">\n            <div class=\"card\" id=\"sermon\">\n                <form id=\"sermonForm\">\n                    <div class=\"listview lv-bordered lv-lg\">\n                        <div class=\"lv-header-alt clearfix\">\n                            <h2 class=\"lvh-label hidden-xs\">New Sermon</h2>\n                            <div class=\"lvh-search\" data-ng-if=\"mactrl.listviewSearchStat\"\n                                 data-ng-click=\"mactrl.listviewSearchStat\">\n                                <input type=\"text\" placeholder=\"Start typing...\" class=\"lvhs-input\">\n\n                                <i class=\"lvh-search-close\"\n                                   data-ng-click=\"mactrl.listviewSearchStat = false\">&times;</i>\n                            </div>\n                        </div>\n\n                        <div class=\"lv-body\" style=\"padding: 20px\">\n                            <div class=\"row m-b-20\">\n                                <div class=\"col-sm-8\">\n                                    <h4 class=\"m-b-10\">Sermon Title</h4>\n                                    <div class=\"form-group\"\n                                         ng-class=\"{\'has-error\': sermonCtrl.submitted && sermonCtrl.sermon.title.length < 1}\">\n                                        <div class=\"fg-line\">\n                                            <input type=\"text\" class=\"form-control input-sm\"\n                                                   style=\"font-size: 16px\"\n                                                   ng-model=\"sermonCtrl.sermon.title\"\n                                                   placeholder=\"Sermon Title\">\n                                        </div>\n                                        <small ng-show=\"sermonCtrl.submitted && sermonCtrl.sermon.title.length < 1\"\n                                               class=\"help-block\">Sermon title cannot be empty\n                                        </small>\n                                    </div>\n\n                                </div>\n                            </div>\n                            <div class=\"row m-b-20\">\n                                <div class=\"col-sm-8\">\n                                    <h4 class=\"m-b-10\">Sermon Date</h4>\n                                    <div class=\"row\" ng-repeat=\"d in sermonCtrl.sermon._dates\">\n                                        <div class=\"col-sm-6\">\n                                            <div class=\"form-group pull-left \">\n                                                <div class=\"fg-line\">\n                                                    <md-datepicker ng-model=\"d.date\"\n                                                                   md-placeholder=\"Enter date\"></md-datepicker>\n                                                </div>\n                                                <!--<small ng-show=\"sermonCtrl.submitted && sermonCtrl.sermon.title.length < 1\"-->\n                                                       <!--class=\"help-block\">Sermon title cannot be empty-->\n                                                <!--</small>-->\n                                            </div>\n\n                                             <a ng-if=\"$index > 0\" href ng-click=\"sermonCtrl.sermon._dates.splice($index, 1)\">\n                                                            <i class=\"f-18 p-l-10 p-t-15 zmdi zmdi-close zmdi-hc-fw\"></i>\n                                                        </a>\n                                        </div>\n\n                                    </div>\n                                        <a href data-ng-click=\"sermonCtrl.sermon._dates.push({\'date\': \'\'})\">\n                                                    add another date</a>\n                                </div>\n                            </div>\n                            <div class=\"row m-b-20\">\n                                <div class=\"col-sm-8\">\n                                    <h4>Main Scriptures</h4>\n                                    <div class=\"form-group\"\n                                         ng-class=\"{\'has-error\': sermonCtrl.submitted && sermonCtrl.sermon.scriptures.length < 1}\">\n                                        <div class=\"fg-line\">\n                                            <!--<label>Main Scriptures</label>-->\n                                            <md-chips ng-model=\"sermonCtrl.sermon.scriptures\"\n                                                      md-on-select=\"sermonCtrl.scriptureSelect($chip)\"\n                                                      md-transform-chip=\"sermonCtrl.onScriptureAdd($chip)\"\n                                                      placeholder=\"Enter a scripture\"\n                                                      secondary-placeholder=\"e.g John 3:16\"\n\n                                            >\n                                            </md-chips>\n                                        </div>\n                                        <small style=\"color:#9e9e9e; float: right\" class=\"help-block\">Type a\n                                            scripture\n                                            then press enter.\n                                        </small>\n                                        <small ng-show=\"sermonCtrl.submitted && sermonCtrl.sermon.scriptures.length < 1 \"\n                                               class=\"help-block\">This field is required\n                                        </small>\n                                    </div>\n\n                                </div>\n                            </div>\n                            <div class=\"row\">\n                                <div class=\"col-sm-12\">\n                                    <md-tabs md-dynamic-height md-border-bottom>\n                                        <md-tab label=\"Sermon Notes\">\n                                            <md-content class=\"md-padding\">\n                                                <div class=\"row\" ng-repeat=\"note in sermonCtrl.sermon.notes \">\n                                                    <div class=\"col-sm-1\"\n                                                         style=\"padding-top: 20px; text-align: center\">\n                                                        <h4>{{$index + 1}}</h4>\n                                                    </div>\n                                                    <div class=\"col-sm-8\"\n                                                         ng-class=\"{\'has-error\' : sermonCtrl.submitted && note.content.length == 0}\">\n                                                        <div class=\"form-group\">\n                                                            <wysiwyg-edit config=\"editorConfig\"\n                                                                          content=\"note.content\"></wysiwyg-edit>\n                                                        </div>\n                                                        <small ng-if=\"$index == 0 &&\n                                                        sermonCtrl.submitted && note.content.length < 1\"\n                                                               class=\"help-block\">At least one sermon note is\n                                                            required\n                                                        </small>\n                                                    </div>\n                                                    <div class=\"col-sm-2\" style=\"padding-top: 20px\">\n\n                                                        <a style=\"font-size:30px\" href\n                                                           ng-click=\"sermonCtrl.sermon.notes.push({content:\'\'})\">\n                                                            <i class=\"zmdi zmdi-plus zmdi-hc-fw\"></i>\n                                                        </a>\n                                                        <a ng-if=\"$index > 0\" style=\"font-size:30px\" href\n                                                           ng-click=\"sermonCtrl.sermon.notes.splice($index, 1)\">\n                                                            <i class=\"zmdi zmdi-minus zmdi-hc-fw\"></i>\n                                                        </a>\n\n                                                    </div>\n                                                </div>\n                                            </md-content>\n                                        </md-tab>\n                                        <md-tab label=\"Sermon Questions\">\n                                            <md-content class=\"md-padding\">\n                                                <div class=\"row\"\n                                                     ng-repeat=\"question in sermonCtrl.sermon.questions\">\n                                                    <div class=\"col-sm-1\"\n                                                         style=\"padding-top: 20px; text-align: center\">\n                                                        <h4>{{$index + 1}}</h4>\n                                                    </div>\n                                                    <div class=\"col-sm-8\">\n                                                        <div class=\"form-group\">\n                                                            <wysiwyg-edit config=\"editorConfig\"\n                                                                          content=\"question.content\"></wysiwyg-edit>\n                                                        </div>\n                                                    </div>\n                                                    <div class=\"col-sm-2\" style=\"padding-top: 20px\">\n\n                                                        <a style=\"font-size:30px\" href\n                                                           ng-click=\"sermonCtrl.sermon.questions.push({content:\'\'})\">\n                                                            <i class=\"zmdi zmdi-plus zmdi-hc-fw\"></i>\n                                                        </a>\n                                                        <a ng-if=\"$index > 0\" style=\"font-size:30px\" href\n                                                           ng-click=\"sermonCtrl.sermon.questions.splice($index, 1)\">\n                                                            <i class=\"zmdi zmdi-minus zmdi-hc-fw\"></i>\n                                                        </a>\n\n                                                    </div>\n                                                </div>\n                                            </md-content>\n                                        </md-tab>\n                                    </md-tabs>\n                                </div>\n                            </div>\n\n                            <div class=\"row\">\n                                <div class=\"col-sm-12\">\n                                    <md-button\n                                            ng-click=\"sermonCtrl.publish()\"\n                                            class=\"md-raised c-white bgm-blue\">\n                                        Publish\n                                    </md-button>\n                                    <md-button\n                                             ng-click=\"sermonCtrl.save()\"\n                                            class=\"md-raised\">\n                                        Save\n                                    </md-button>\n                                    <a href=\"\" class=\"btn btn-danger\" data-growl-demo data-type=\"danger\">Danger</a>\n                                </div>\n\n                            </div>\n                        </div>\n                    </div>\n                </form>\n            </div>\n\n        </div>\n\n    </section>\n</section>");
$templateCache.put("module/shared/base.html","<header ng-hide=\"$state.current.data.hideHeader\" autoscroll=\"true\"\n        id=\"header\" ng-include=\"\'module/shared/header.html\'\" ng-controller=\"headerController as headerCtrl\"\n        data-current-skin=\"blue\" style=\"height: 70px\">\n\n</header>\n\n<div class=\"main-content\" ui-view=\"content\">\n\n</div>\n<div class=\"fab-menu\">\n    <md-fab-speed-dial md-open=\"appCtrl.fabMenu.isOpen\" md-direction=\"up\" class=\"md-fling\">\n        <md-fab-trigger>\n            <md-button class=\"md-fab md-warn md-button md-ink-ripple\" type=\"button\" aria-label=\"Add...\">\n                <md-icon md-svg-src=\"/img/icons/add.svg\"></md-icon>\n            </md-button>\n        </md-fab-trigger>\n        <md-fab-actions ng-hide=\"!appCtrl.fabMenu.isOpen\">\n            <md-button ng-if=\"authService.user.is_pastor\"\n                       ui-sref=\"base.sermon-create\" class=\"md-fab md-mini md-button md-ink-ripple\" aria-label=\"Add User\">\n                <md-tooltip md-direction=\"left\">\n                    New Sermon\n                </md-tooltip>\n                <md-icon md-svg-src=\"/img/icons/create.svg\"></md-icon>\n            </md-button>\n            <!--<md-button class=\"md-fab  md-mini md-primary md-button md-ink-ripple\" aria-label=\"Add Group\">-->\n            <!--<md-icon icon=\"/img/icons/add.svg\"></md-icon>-->\n            <!--</md-button>-->\n            <!--<md-button class=\"md-fab md-mini md-primary md-button md-ink-ripple\" aria-label=\"Add Group\">-->\n            <!--<md-icon icon=\"/img/icons/add.svg\"></md-icon>-->\n            <!--</md-button>-->\n        </md-fab-actions>\n    </md-fab-speed-dial>\n</div>\n\n<footer id=\"footer\">\n    Copyright &copy; 2015 scripturedin\n\n    <ul class=\"f-menu\">\n        <li><a href=\"\">Home</a></li>\n        <li><a href=\"\">Dashboard</a></li>\n        <li><a href=\"\">Reports</a></li>\n        <li><a href=\"\">Support</a></li>\n        <li><a href=\"\">Contact</a></li>\n    </ul>\n</footer>");
$templateCache.put("module/shared/chat.html","<div class=\"chat-search\">\n    <div class=\"fg-line\">\n        <input type=\"text\" class=\"form-control\" placeholder=\"Search People\">\n    </div>\n</div>\n\n<div class=\"listview\">\n    <a class=\"lv-item\" href=\"\">\n        <div class=\"media\">\n            <div class=\"pull-left p-relative\">\n                <img class=\"lv-img-sm\" src=\"img/profile-pics/2.jpg\" alt=\"\">\n                <i class=\"chat-status-busy\"></i>\n            </div>\n            <div class=\"media-body\">\n                <div class=\"lv-title\">Jonathan Morris</div>\n                <small class=\"lv-small\">Available</small>\n            </div>\n        </div>\n    </a>\n\n    <a class=\"lv-item\" href=\"\">\n        <div class=\"media\">\n            <div class=\"pull-left\">\n                <img class=\"lv-img-sm\" src=\"img/profile-pics/1.jpg\" alt=\"\">\n            </div>\n            <div class=\"media-body\">\n                <div class=\"lv-title\">David Belle</div>\n                <small class=\"lv-small\">Last seen 3 hours ago</small>\n            </div>\n        </div>\n    </a>\n\n    <a class=\"lv-item\" href=\"\">\n        <div class=\"media\">\n            <div class=\"pull-left p-relative\">\n                <img class=\"lv-img-sm\" src=\"img/profile-pics/3.jpg\" alt=\"\">\n                <i class=\"chat-status-online\"></i>\n            </div>\n            <div class=\"media-body\">\n                <div class=\"lv-title\">Fredric Mitchell Jr.</div>\n                <small class=\"lv-small\">Availble</small>\n            </div>\n        </div>\n    </a>\n\n    <a class=\"lv-item\" href=\"\">\n        <div class=\"media\">\n            <div class=\"pull-left p-relative\">\n                <img class=\"lv-img-sm\" src=\"img/profile-pics/4.jpg\" alt=\"\">\n                <i class=\"chat-status-online\"></i>\n            </div>\n            <div class=\"media-body\">\n                <div class=\"lv-title\">Glenn Jecobs</div>\n                <small class=\"lv-small\">Availble</small>\n            </div>\n        </div>\n    </a>\n\n    <a class=\"lv-item\" href=\"\">\n        <div class=\"media\">\n            <div class=\"pull-left\">\n                <img class=\"lv-img-sm\" src=\"img/profile-pics/5.jpg\" alt=\"\">\n            </div>\n            <div class=\"media-body\">\n                <div class=\"lv-title\">Bill Phillips</div>\n                <small class=\"lv-small\">Last seen 3 days ago</small>\n            </div>\n        </div>\n    </a>\n\n    <a class=\"lv-item\" href=\"\">\n        <div class=\"media\">\n            <div class=\"pull-left\">\n                <img class=\"lv-img-sm\" src=\"img/profile-pics/6.jpg\" alt=\"\">\n            </div>\n            <div class=\"media-body\">\n                <div class=\"lv-title\">Wendy Mitchell</div>\n                <small class=\"lv-small\">Last seen 2 minutes ago</small>\n            </div>\n        </div>\n    </a>\n    <a class=\"lv-item\" href=\"\">\n        <div class=\"media\">\n            <div class=\"pull-left p-relative\">\n                <img class=\"lv-img-sm\" src=\"img/profile-pics/7.jpg\" alt=\"\">\n                <i class=\"chat-status-busy\"></i>\n            </div>\n            <div class=\"media-body\">\n                <div class=\"lv-title\">Teena Bell Ann</div>\n                <small class=\"lv-small\">Busy</small>\n            </div>\n        </div>\n    </a>\n</div>\n");
$templateCache.put("module/shared/footer.html","<footer id=\"footer\">\r\n    Copyright &copy; 2015 scripturedin ...\r\n\r\n\r\n    <ul class=\"f-menu\">\r\n        <li><a href=\"\">Home</a></li>\r\n        <li><a href=\"\">Dashboard</a></li>\r\n        <li><a href=\"\">Reports</a></li>\r\n        <li><a href=\"\">Support</a></li>\r\n        <li><a href=\"\">Contact</a></li>\r\n    </ul>\r\n</footer>");
$templateCache.put("module/shared/header-image-logo.html","<ul class=\"header-inner clearfix\">\r\n    <li id=\"menu-trigger\" data-target=\"mainmenu\" data-toggle-sidebar data-model-left=\"mactrl.sidebarToggle.left\" data-ng-class=\"{ \'open\': mactrl.sidebarToggle.left === true }\">\r\n        <div class=\"line-wrap\">\r\n            <div class=\"line top\"></div>\r\n            <div class=\"line center\"></div>\r\n            <div class=\"line bottom\"></div>\r\n        </div>\r\n    </li>\r\n\r\n    <li class=\"hidden-xs\">\r\n        <a href=\"index.html\" class=\"m-l-10\" data-ng-click=\"mactrl.sidebarStat($event)\"><img src=\"img/demo/logo.png\" alt=\"\"></a>\r\n    </li>\r\n\r\n    <li class=\"pull-right\">\r\n        <ul class=\"top-menu\">\r\n            <li id=\"top-search\" data-ng-click=\"hctrl.openSearch()\">\r\n                <a href=\"\"><span class=\"tm-label\">Search</span></a>\r\n            </li>\r\n\r\n            <li class=\"dropdown\" uib-dropdown>\r\n                <a uib-dropdown-toggle href=\"\">\r\n                    <span class=\"tm-label\">Messages</span>\r\n                </a>\r\n                <div class=\"dropdown-menu dropdown-menu-lg pull-right\">\r\n                    <div class=\"listview\">\r\n                        <div class=\"lv-header\">\r\n                            Messages\r\n                        </div>\r\n                        <div class=\"lv-body\">\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/1.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">David Belle</div>\r\n                                        <small class=\"lv-small\">Cum sociis natoque penatibus et magnis dis parturient montes</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/2.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">Jonathan Morris</div>\r\n                                        <small class=\"lv-small\">Nunc quis diam diamurabitur at dolor elementum, dictum turpis vel</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/3.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">Fredric Mitchell Jr.</div>\r\n                                        <small class=\"lv-small\">Phasellus a ante et est ornare accumsan at vel magnauis blandit turpis at augue ultricies</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/4.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">Glenn Jecobs</div>\r\n                                        <small class=\"lv-small\">Ut vitae lacus sem ellentesque maximus, nunc sit amet varius dignissim, dui est consectetur neque</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/4.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">Bill Phillips</div>\r\n                                        <small class=\"lv-small\">Proin laoreet commodo eros id faucibus. Donec ligula quam, imperdiet vel ante placerat</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                        </div>\r\n                        <a class=\"lv-footer\" href=\"\">View All</a>\r\n                    </div>\r\n                </div>\r\n            </li>\r\n            <li class=\"dropdown hidden-xs\" uib-dropdown>\r\n                <a uib-dropdown-toggle href=\"\">\r\n                    <span class=\"tm-label\">Notification</span>\r\n                </a>\r\n                <div class=\"dropdown-menu dropdown-menu-lg pull-right\">\r\n                    <div class=\"listview\" id=\"notifications\">\r\n                        <div class=\"lv-header\">\r\n                            Notification\r\n\r\n                            <ul class=\"actions\">\r\n                                <li class=\"dropdown\">\r\n                                    <a href=\"\" data-clear=\"notification\">\r\n                                        <i class=\"zmdi zmdi-check-all\"></i>\r\n                                    </a>\r\n                                </li>\r\n                            </ul>\r\n                        </div>\r\n                        <div class=\"lv-body\">\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/1.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">David Belle</div>\r\n                                        <small class=\"lv-small\">Cum sociis natoque penatibus et magnis dis parturient montes</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/2.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">Jonathan Morris</div>\r\n                                        <small class=\"lv-small\">Nunc quis diam diamurabitur at dolor elementum, dictum turpis vel</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/3.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">Fredric Mitchell Jr.</div>\r\n                                        <small class=\"lv-small\">Phasellus a ante et est ornare accumsan at vel magnauis blandit turpis at augue ultricies</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/4.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">Glenn Jecobs</div>\r\n                                        <small class=\"lv-small\">Ut vitae lacus sem ellentesque maximus, nunc sit amet varius dignissim, dui est consectetur neque</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/4.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">Bill Phillips</div>\r\n                                        <small class=\"lv-small\">Proin laoreet commodo eros id faucibus. Donec ligula quam, imperdiet vel ante placerat</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                        </div>\r\n\r\n                        <a class=\"lv-footer\" href=\"\">View Previous</a>\r\n                    </div>\r\n\r\n                </div>\r\n            </li>\r\n            <li class=\"hidden-xs\">\r\n                <a target=\"_blank\" href=\"https://wrapbootstrap.com/theme/superflat-simple-responsive-admin-theme-WB082P91H\">\r\n                    <span class=\"tm-label\">Link</span>\r\n                </a>\r\n            </li>\r\n        </ul>\r\n    </li>\r\n</ul>\r\n\r\n\r\n<!-- Top Search Content -->\r\n<div id=\"top-search-wrap\">\r\n    <div class=\"tsw-inner\">\r\n        <i id=\"top-search-close\" data-ng-click=\"hctrl.closeSearch()\" class=\"zmdi zmdi-arrow-left\"></i>\r\n        <input type=\"text\">\r\n    </div>\r\n</div>\r\n\r\n\r\n");
$templateCache.put("module/shared/header-textual-menu.html","<ul class=\"header-inner clearfix\">\r\n    <li id=\"menu-trigger\" data-target=\"mainmenu\" data-toggle-sidebar data-model-left=\"mactrl.sidebarToggle.left\" data-ng-class=\"{ \'open\': mactrl.sidebarToggle.left === true }\">\r\n        <div class=\"line-wrap\">\r\n            <div class=\"line top\"></div>\r\n            <div class=\"line center\"></div>\r\n            <div class=\"line bottom\"></div>\r\n        </div>\r\n    </li>\r\n\r\n    <li class=\"logo hidden-xs\">\r\n        <a data-ui-sref=\"home\" data-ng-click=\"mactrl.sidebarStat($event)\">Material Admin</a>\r\n    </li>\r\n\r\n    <li class=\"pull-right\">\r\n        <ul class=\"top-menu\">\r\n            <li id=\"top-search\" data-ng-click=\"hctrl.openSearch()\">\r\n                <a href=\"\"><span class=\"tm-label\">Search</span></a>\r\n            </li>\r\n\r\n            <li class=\"dropdown\" uib-dropdown>\r\n                <a uib-dropdown-toggle href=\"\">\r\n                    <span class=\"tm-label\">Messages</span>\r\n                </a>\r\n                <div class=\"dropdown-menu dropdown-menu-lg pull-right\">\r\n                    <div class=\"listview\">\r\n                        <div class=\"lv-header\">\r\n                            Messages\r\n                        </div>\r\n                        <div class=\"lv-body\">\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/1.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">David Belle</div>\r\n                                        <small class=\"lv-small\">Cum sociis natoque penatibus et magnis dis parturient montes</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/2.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">Jonathan Morris</div>\r\n                                        <small class=\"lv-small\">Nunc quis diam diamurabitur at dolor elementum, dictum turpis vel</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/3.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">Fredric Mitchell Jr.</div>\r\n                                        <small class=\"lv-small\">Phasellus a ante et est ornare accumsan at vel magnauis blandit turpis at augue ultricies</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/4.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">Glenn Jecobs</div>\r\n                                        <small class=\"lv-small\">Ut vitae lacus sem ellentesque maximus, nunc sit amet varius dignissim, dui est consectetur neque</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/4.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">Bill Phillips</div>\r\n                                        <small class=\"lv-small\">Proin laoreet commodo eros id faucibus. Donec ligula quam, imperdiet vel ante placerat</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                        </div>\r\n                        <a class=\"lv-footer\" href=\"\">View All</a>\r\n                    </div>\r\n                </div>\r\n            </li>\r\n            <li class=\"dropdown hidden-xs\" uib-dropdown>\r\n                <a uib-dropdown-toggle href=\"\">\r\n                    <span class=\"tm-label\">Notification</span>\r\n                </a>\r\n                <div class=\"dropdown-menu dropdown-menu-lg pull-right\">\r\n                    <div class=\"listview\" id=\"notifications\">\r\n                        <div class=\"lv-header\">\r\n                            Notification\r\n\r\n                            <ul class=\"actions\">\r\n                                <li class=\"dropdown\">\r\n                                    <a href=\"\" data-clear=\"notification\">\r\n                                        <i class=\"zmdi zmdi-check-all\"></i>\r\n                                    </a>\r\n                                </li>\r\n                            </ul>\r\n                        </div>\r\n                        <div class=\"lv-body\">\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/1.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">David Belle</div>\r\n                                        <small class=\"lv-small\">Cum sociis natoque penatibus et magnis dis parturient montes</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/2.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">Jonathan Morris</div>\r\n                                        <small class=\"lv-small\">Nunc quis diam diamurabitur at dolor elementum, dictum turpis vel</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/3.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">Fredric Mitchell Jr.</div>\r\n                                        <small class=\"lv-small\">Phasellus a ante et est ornare accumsan at vel magnauis blandit turpis at augue ultricies</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/4.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">Glenn Jecobs</div>\r\n                                        <small class=\"lv-small\">Ut vitae lacus sem ellentesque maximus, nunc sit amet varius dignissim, dui est consectetur neque</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/4.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">Bill Phillips</div>\r\n                                        <small class=\"lv-small\">Proin laoreet commodo eros id faucibus. Donec ligula quam, imperdiet vel ante placerat</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                        </div>\r\n\r\n                        <a class=\"lv-footer\" href=\"\">View Previous</a>\r\n                    </div>\r\n\r\n                </div>\r\n            </li>\r\n            <li class=\"hidden-xs\">\r\n                <a target=\"_blank\" href=\"https://wrapbootstrap.com/theme/superflat-simple-responsive-admin-theme-WB082P91H\">\r\n                    <span class=\"tm-label\">Link</span>\r\n                </a>\r\n            </li>\r\n        </ul>\r\n    </li>\r\n</ul>\r\n\r\n\r\n<!-- Top Search Content -->\r\n<div id=\"top-search-wrap\">\r\n    <div class=\"tsw-inner\">\r\n        <i id=\"top-search-close\" data-ng-click=\"hctrl.closeSearch()\" class=\"zmdi zmdi-arrow-left\"></i>\r\n        <input type=\"text\">\r\n    </div>\r\n</div>\r\n\r\n\r\n");
$templateCache.put("module/shared/header-top-menu.html","<ul class=\"header-inner clearfix\">\r\n    <li id=\"menu-trigger\" data-trigger=\".ha-menu\" class=\"visible-xs\">\r\n        <div class=\"line-wrap\">\r\n            <div class=\"line top\"></div>\r\n            <div class=\"line center\"></div>\r\n            <div class=\"line bottom\"></div>\r\n        </div>\r\n    </li>\r\n\r\n    <li class=\"logo hidden-xs\">\r\n        <a data-ui-sref=\"home\">Material Admin</a>\r\n    </li>\r\n\r\n    <li class=\"pull-right\">\r\n        <ul class=\"top-menu\">\r\n            <li class=\"dropdown\" uib-dropdown>\r\n                <a uib-dropdown-toggle href=\"\">\r\n                    <i class=\"tmn-counts\">6</i>\r\n                    <i class=\"tm-icon zmdi zmdi-email\"></i>\r\n                </a>\r\n                <div class=\"dropdown-menu dropdown-menu-lg pull-right\">\r\n                    <div class=\"listview\">\r\n                        <div class=\"lv-header\">\r\n                            Messages\r\n                        </div>\r\n                        <div class=\"lv-body\">\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/1.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">David Belle</div>\r\n                                        <small class=\"lv-small\">Cum sociis natoque penatibus et magnis dis parturient montes</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/2.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">Jonathan Morris</div>\r\n                                        <small class=\"lv-small\">Nunc quis diam diamurabitur at dolor elementum, dictum turpis vel</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/3.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">Fredric Mitchell Jr.</div>\r\n                                        <small class=\"lv-small\">Phasellus a ante et est ornare accumsan at vel magnauis blandit turpis at augue ultricies</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/4.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">Glenn Jecobs</div>\r\n                                        <small class=\"lv-small\">Ut vitae lacus sem ellentesque maximus, nunc sit amet varius dignissim, dui est consectetur neque</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/4.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">Bill Phillips</div>\r\n                                        <small class=\"lv-small\">Proin laoreet commodo eros id faucibus. Donec ligula quam, imperdiet vel ante placerat</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                        </div>\r\n                        <a class=\"lv-footer\" href=\"\">View All</a>\r\n                    </div>\r\n                </div>\r\n            </li>\r\n            <li class=\"dropdown\" uib-dropdown>\r\n                <a uib-dropdown-toggle>\r\n                    <i class=\"tmn-counts\">9</i>\r\n                    <i class=\"tm-icon zmdi zmdi-notifications\"></i>\r\n                </a>\r\n                <div class=\"dropdown-menu dropdown-menu-lg pull-right\">\r\n                    <div class=\"listview\" id=\"notifications\">\r\n                        <div class=\"lv-header\">\r\n                            Notification\r\n\r\n                            <ul class=\"actions\">\r\n                                <li class=\"dropdown\">\r\n                                    <a href=\"\" data-clear=\"notification\">\r\n                                        <i class=\"zmdi zmdi-check-all\"></i>\r\n                                    </a>\r\n                                </li>\r\n                            </ul>\r\n                        </div>\r\n                        <div class=\"lv-body\">\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/1.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">David Belle</div>\r\n                                        <small class=\"lv-small\">Cum sociis natoque penatibus et magnis dis parturient montes</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/2.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">Jonathan Morris</div>\r\n                                        <small class=\"lv-small\">Nunc quis diam diamurabitur at dolor elementum, dictum turpis vel</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/3.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">Fredric Mitchell Jr.</div>\r\n                                        <small class=\"lv-small\">Phasellus a ante et est ornare accumsan at vel magnauis blandit turpis at augue ultricies</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/4.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">Glenn Jecobs</div>\r\n                                        <small class=\"lv-small\">Ut vitae lacus sem ellentesque maximus, nunc sit amet varius dignissim, dui est consectetur neque</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                            <a class=\"lv-item\" href=\"\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" src=\"img/profile-pics/4.jpg\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">Bill Phillips</div>\r\n                                        <small class=\"lv-small\">Proin laoreet commodo eros id faucibus. Donec ligula quam, imperdiet vel ante placerat</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                        </div>\r\n\r\n                        <a class=\"lv-footer\" href=\"\">View Previous</a>\r\n                    </div>\r\n\r\n                </div>\r\n            </li>\r\n            <li class=\"dropdown\" uib-dropdown>\r\n                <a uib-dropdown-toggle href=\"\">\r\n                    <i class=\"tmn-counts\">2</i>\r\n                    <i class=\"tm-icon zmdi zmdi-view-list-alt\"></i>\r\n                </a>\r\n                <div class=\"dropdown-menu pull-right dropdown-menu-lg\">\r\n                    <div class=\"listview\">\r\n                        <div class=\"lv-header\">\r\n                            Tasks\r\n                        </div>\r\n                        <div class=\"lv-body\">\r\n                            <div class=\"lv-item\">\r\n                                <div class=\"lv-title m-b-5\">HTML5 Validation Report</div>\r\n\r\n                                <div class=\"progress\">\r\n                                    <div class=\"progress-bar\" role=\"progressbar\" aria-valuenow=\"95\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 95%\">\r\n                                        <span class=\"sr-only\">95% Complete (success)</span>\r\n                                    </div>\r\n                                </div>\r\n                            </div>\r\n                            <div class=\"lv-item\">\r\n                                <div class=\"lv-title m-b-5\">Google Chrome Extension</div>\r\n\r\n                                <div class=\"progress\">\r\n                                    <div class=\"progress-bar progress-bar-success\" role=\"progressbar\" aria-valuenow=\"80\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 80%\">\r\n                                        <span class=\"sr-only\">80% Complete (success)</span>\r\n                                    </div>\r\n                                </div>\r\n                            </div>\r\n                            <div class=\"lv-item\">\r\n                                <div class=\"lv-title m-b-5\">Social Intranet Projects</div>\r\n\r\n                                <div class=\"progress\">\r\n                                    <div class=\"progress-bar progress-bar-info\" role=\"progressbar\" aria-valuenow=\"20\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 20%\">\r\n                                        <span class=\"sr-only\">20% Complete</span>\r\n                                    </div>\r\n                                </div>\r\n                            </div>\r\n                            <div class=\"lv-item\">\r\n                                <div class=\"lv-title m-b-5\">Bootstrap Admin Template</div>\r\n\r\n                                <div class=\"progress\">\r\n                                    <div class=\"progress-bar progress-bar-warning\" role=\"progressbar\" aria-valuenow=\"60\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 60%\">\r\n                                        <span class=\"sr-only\">60% Complete (warning)</span>\r\n                                    </div>\r\n                                </div>\r\n                            </div>\r\n                            <div class=\"lv-item\">\r\n                                <div class=\"lv-title m-b-5\">Youtube Client App</div>\r\n\r\n                                <div class=\"progress\">\r\n                                    <div class=\"progress-bar progress-bar-danger\" role=\"progressbar\" aria-valuenow=\"80\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 80%\">\r\n                                        <span class=\"sr-only\">80% Complete (danger)</span>\r\n                                    </div>\r\n                                </div>\r\n                            </div>\r\n                        </div>\r\n\r\n                        <a class=\"lv-footer\" href=\"\">View All</a>\r\n                    </div>\r\n                </div>\r\n            </li>\r\n            <li class=\"dropdown\" uib-dropdown>\r\n                <a uib-dropdown-toggle href=\"\"><i class=\"tm-icon zmdi zmdi-more-vert\"></i></a>\r\n                <ul class=\"dropdown-menu dm-icon pull-right\">\r\n                    <li class=\"hidden-xs\">\r\n                        <a data-ng-click=\"hctrl.fullScreen()\" href=\"\"><i class=\"zmdi zmdi-fullscreen\"></i> Toggle Fullscreen</a>\r\n                    </li>\r\n                    <li>\r\n                        <a data-ng-click=\"hctrl.clearLocalStorage()\" href=\"\"><i class=\"zmdi zmdi-delete\"></i> Clear Local Storage</a>\r\n                    </li>\r\n                    <li>\r\n                        <a href=\"\"><i class=\"zmdi zmdi-face\"></i> Privacy Settings</a>\r\n                    </li>\r\n                    <li>\r\n                        <a href=\"\"><i class=\"zmdi zmdi-settings\"></i> Other Settings</a>\r\n                    </li>\r\n                </ul>\r\n            </li>\r\n        </ul>\r\n    </li>\r\n</ul>\r\n\r\n<div class=\"search\">\r\n    <div class=\"fg-line\">\r\n        <input type=\"text\" class=\"form-control\" placeholder=\"Search...\">\r\n    </div>\r\n</div>\r\n\r\n<nav class=\"ha-menu\">\r\n    <ul>\r\n        <li class=\"waves-effect\" data-ui-sref-active=\"active\">\r\n            <a data-ui-sref=\"home\" data-ng-click=\"mactrl.sidebarStat($event)\">Home</a>\r\n        </li>\r\n\r\n        <li class=\"dropdown\" uib-dropdown data-ng-class=\"{ \'active\': mactrl.$state.includes(\'headers\') }\">\r\n            <div class=\"waves-effect\" uib-dropdown-toggle>Headers</div>\r\n\r\n            <ul class=\"dropdown-menu\">\r\n                <li data-ui-sref-active=\"active\" ><a data-ui-sref=\"headers.textual-menu\">Textual menu</a></li>\r\n                <li data-ui-sref-active=\"active\" ><a data-ui-sref=\"headers.image-logo\">Image logo</a></li>\r\n                <li data-ui-sref-active=\"active\" ><a data-ui-sref=\"headers.mainmenu-on-top\">Mainmenu on top</a></li>\r\n            </ul>\r\n        </li>\r\n\r\n        <li class=\"waves-effect\" data-ui-sref-active=\"active\">\r\n            <a data-ui-sref=\"typography\">Typography</a>\r\n        </li>\r\n\r\n        <li class=\"dropdown\" uib-dropdown>\r\n            <div class=\"waves-effect\" uib-dropdown-toggle>Widgets</div>\r\n            <ul class=\"dropdown-menu\">\r\n                <li data-ui-sref-active=\"active\"><a data-ui-sref=\"widgets.widget-templates\">Templates</a></li>\r\n                <li data-ui-sref-active=\"active\"><a data-ui-sref=\"widgets.widgets\">Widgets</a></li>\r\n            </ul>\r\n        </li>\r\n\r\n        <li class=\"dropdown\" uib-dropdown>\r\n            <div class=\"waves-effect\" uib-dropdown-toggle>Tables</div>\r\n            <ul class=\"dropdown-menu\">\r\n                <li data-ui-sref-active=\"active\"><a data-ui-sref=\"tables.tables\">Normal Tables</a></li>\r\n                <li data-ui-sref-active=\"active\"><a data-ui-sref=\"tables.data-table\">Data Tables</a></li>\r\n            </ul>\r\n        </li>\r\n\r\n        <li class=\"dropdown\" uib-dropdown>\r\n            <div class=\"waves-effect\" uib-dropdown-toggle>Forms</div>\r\n            <ul class=\"dropdown-menu\">\r\n                <li data-ui-sref-active=\"active\"><a data-ui-sref=\"form.basic-form-elements\">Basic Form Elements</a></li>\r\n                <li data-ui-sref-active=\"active\"><a data-ui-sref=\"form.form-components\">Form Components</a></li>\r\n                <li data-ui-sref-active=\"active\"><a data-ui-sref=\"form.form-examples\">Form Examples</a></li>\r\n                <li data-ui-sref-active=\"active\"><a data-ui-sref=\"form.form-validations\">Form Validation</a></li>\r\n            </ul>\r\n        </li>\r\n        <li class=\"dropdown\" uib-dropdown>\r\n            <div class=\"waves-effect\" uib-dropdown-toggle>User Interface</div>\r\n            <ul class=\"dropdown-menu\">\r\n                <li data-ui-sref-active=\"active\"><a data-ui-sref=\"user-interface.ui-bootstrap\">UI Bootstrap</a></li>\r\n                <li data-ui-sref-active=\"active\"><a data-ui-sref=\"user-interface.colors\">Colors</a></li>\r\n                <li data-ui-sref-active=\"active\"><a data-ui-sref=\"user-interface.animations\">Animations</a></li>\r\n                <li data-ui-sref-active=\"active\"><a data-ui-sref=\"user-interface.box-shadow\">Box Shadow</a></li>\r\n                <li data-ui-sref-active=\"active\"><a data-ui-sref=\"user-interface.buttons\">Buttons</a></li>\r\n                <li data-ui-sref-active=\"active\"><a data-ui-sref=\"user-interface.icons\">Icons</a></li>\r\n                <li data-ui-sref-active=\"active\"><a data-ui-sref=\"user-interface.alerts\">Alerts</a></li>\r\n                <li data-ui-sref-active=\"active\"><a data-ui-sref=\"user-interface.preloaders\">Preloaders</a></li>\r\n                <li data-ui-sref-active=\"active\"><a data-ui-sref=\"user-interface.notifications-dialogs\">Notifications & Dialogs</a></li>\r\n                <li data-ui-sref-active=\"active\"><a data-ui-sref=\"user-interface.media\">Media</a></li>\r\n                <li data-ui-sref-active=\"active\"><a data-ui-sref=\"user-interface.other-components\">Others</a></li>\r\n            </ul>\r\n        </li>\r\n        <li class=\"dropdown\" uib-dropdown>\r\n            <div class=\"waves-effect\" uib-dropdown-toggle>Charts</div>\r\n            <ul class=\"dropdown-menu\">\r\n                <li data-ui-sref-active=\"active\"><a data-ui-sref=\"charts.flot-charts\">Flot Charts</a></li>\r\n                <li data-ui-sref-active=\"active\"><a data-ui-sref=\"charts.other-charts\">Other Charts</a></li>\r\n            </ul>\r\n        </li>\r\n        <li class=\"waves-effect\" data-ui-sref-active=\"active\"><a data-ui-sref=\"calendar\">Calendar</a></li>\r\n    </ul>\r\n</nav>\r\n\r\n<div class=\"skin-switch dropdown hidden-xs\" uib-dropdown>\r\n    <button uib-dropdown-toggle class=\"btn ss-icon\"><i class=\"zmdi zmdi-palette\"></i></button>\r\n    <div class=\"dropdown-menu\">\r\n        <span ng-repeat=\"w in mactrl.skinList\" class=\"ss-skin bgm-{{ w }}\" data-ng-click=\"mactrl.skinSwitch(w)\"></span>\r\n    </div>\r\n</div>\r\n");
$templateCache.put("module/shared/header.html","<ul class=\"header-inner clearfix\">\r\n    <li id=\"menu-trigger\" data-target=\"mainmenu\"\r\n        data-toggle-sidebar\r\n        data-model-left=\"mactrl.sidebarToggle.left\"\r\n        data-ng-class=\"{ \'open\': mactrl.sidebarToggle.left === true }\">\r\n        <div class=\"line-wrap\">\r\n            <div class=\"line top\"></div>\r\n            <div class=\"line center\"></div>\r\n            <div class=\"line bottom\"></div>\r\n        </div>\r\n    </li>\r\n\r\n    <li class=\"logo hidden-xs\">\r\n        <a href=\"/#/home\">scripturedIn</a>\r\n    </li>\r\n\r\n\r\n    <li class=\"pull-right\">\r\n        <ul class=\"top-menu\">\r\n\r\n            <!--<li id=\"toggle-width\">-->\r\n                <!--<div class=\"toggle-switch\">-->\r\n                    <!--<input id=\"tw-switch\" type=\"checkbox\" hidden=\"hidden\" data-change-layout=\"mactrl.layoutType\">-->\r\n                    <!--<label for=\"tw-switch\" class=\"ts-helper\"></label>-->\r\n                <!--</div>-->\r\n            <!--</li>-->\r\n\r\n            <!--<li id=\"top-search\">-->\r\n            <!--<a href=\"\" data-ng-click=\"hctrl.openSearch()\"><i class=\"tm-icon zmdi zmdi-search\"></i></a>-->\r\n            <!--</li>-->\r\n            <!--<li class=\"dropdown\" uib-dropdown>-->\r\n                <!--<a uib-dropdown-toggle href=\"\">-->\r\n                    <!--<i class=\"tm-icon zmdi zmdi-email\"></i>-->\r\n                    <!--<i class=\"tmn-counts\">6</i>-->\r\n                <!--</a>-->\r\n\r\n                <!--<div class=\"dropdown-menu dropdown-menu-lg stop-propagate pull-right\">-->\r\n                    <!--<div class=\"listview\">-->\r\n                        <!--<div class=\"lv-header\">-->\r\n                            <!--Messages-->\r\n                        <!--</div>-->\r\n                        <!--<div class=\"lv-body\">-->\r\n                            <!--<a class=\"lv-item\" ng-href=\"\" ng-repeat=\"w in hctrl.messageResult.list\">-->\r\n                                <!--<div class=\"media\">-->\r\n                                    <!--<div class=\"pull-left\">-->\r\n                                        <!--<img class=\"lv-img-sm\" ng-src=\"img/profile-pics/{{ w.img }}\" alt=\"\">-->\r\n                                    <!--</div>-->\r\n                                    <!--<div class=\"media-body\">-->\r\n                                        <!--<div class=\"lv-title\">{{ w.user }}</div>-->\r\n                                        <!--<small class=\"lv-small\">{{ w.text }}</small>-->\r\n                                    <!--</div>-->\r\n                                <!--</div>-->\r\n                            <!--</a>-->\r\n                        <!--</div>-->\r\n\r\n                        <!--<div class=\"clearfix\"></div>-->\r\n\r\n                        <!--<a class=\"lv-footer\" href=\"\">View All</a>-->\r\n                    <!--</div>-->\r\n                <!--</div>-->\r\n            <!--</li>-->\r\n            <li class=\"dropdown\" uib-dropdown>\r\n                <a uib-dropdown-toggle href=\"\">\r\n                    <i class=\"tm-icon zmdi zmdi-notifications\"></i>\r\n                    <i class=\"tmn-counts\">9</i>\r\n                </a>\r\n\r\n                <div class=\"dropdown-menu dropdown-menu-lg stop-propagate pull-right\">\r\n                    <div class=\"listview\" id=\"notifications\">\r\n                        <div class=\"lv-header\">\r\n                            Notification\r\n\r\n                            <ul class=\"actions\">\r\n                                <li>\r\n                                    <a href=\"\" data-ng-click=\"hctrl.clearNotification($event)\">\r\n                                        <i class=\"zmdi zmdi-check-all\"></i>\r\n                                    </a>\r\n                                </li>\r\n                            </ul>\r\n                        </div>\r\n                        <div class=\"lv-body\">\r\n                            <a class=\"lv-item\" ng-href=\"\" ng-repeat=\"w in hctrl.messageResult.list\">\r\n                                <div class=\"media\">\r\n                                    <div class=\"pull-left\">\r\n                                        <img class=\"lv-img-sm\" ng-src=\"img/profile-pics/{{ w.img }}\" alt=\"\">\r\n                                    </div>\r\n                                    <div class=\"media-body\">\r\n                                        <div class=\"lv-title\">{{ w.user }}</div>\r\n                                        <small class=\"lv-small\">{{ w.text }}</small>\r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                        </div>\r\n\r\n                        <div class=\"clearfix\"></div>\r\n\r\n                        <a class=\"lv-footer\" href=\"\">View Previous</a>\r\n                    </div>\r\n\r\n                </div>\r\n            </li>\r\n            <li class=\"dropdown hidden-xs\" uib-dropdown>\r\n                <a uib-dropdown-toggle href=\"\">\r\n                    <i class=\"tm-icon zmdi zmdi-view-list-alt\"></i>\r\n                    <i class=\"tmn-counts\">2</i>\r\n                </a>\r\n\r\n                <div class=\"dropdown-menu pull-right dropdown-menu-lg\">\r\n                    <div class=\"listview\">\r\n                        <div class=\"lv-header\">\r\n                            Tasks\r\n                        </div>\r\n                        <div class=\"lv-body\">\r\n                            <div class=\"lv-item\">\r\n                                <div class=\"lv-title m-b-5\">HTML5 Validation Report</div>\r\n\r\n                                <div class=\"progress\">\r\n                                    <div class=\"progress-bar\" role=\"progressbar\" aria-valuenow=\"95\"\r\n                                         aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 95%\">\r\n                                        <span class=\"sr-only\">95% Complete (success)</span>\r\n                                    </div>\r\n                                </div>\r\n                            </div>\r\n                            <div class=\"lv-item\">\r\n                                <div class=\"lv-title m-b-5\">Google Chrome Extension</div>\r\n\r\n                                <div class=\"progress\">\r\n                                    <div class=\"progress-bar progress-bar-success\" role=\"progressbar\"\r\n                                         aria-valuenow=\"80\" aria-valuemin=\"0\" aria-valuemax=\"100\"\r\n                                         style=\"width: 80%\">\r\n                                        <span class=\"sr-only\">80% Complete (success)</span>\r\n                                    </div>\r\n                                </div>\r\n                            </div>\r\n                            <div class=\"lv-item\">\r\n                                <div class=\"lv-title m-b-5\">Social Intranet Projects</div>\r\n\r\n                                <div class=\"progress\">\r\n                                    <div class=\"progress-bar progress-bar-info\" role=\"progressbar\"\r\n                                         aria-valuenow=\"20\" aria-valuemin=\"0\" aria-valuemax=\"100\"\r\n                                         style=\"width: 20%\">\r\n                                        <span class=\"sr-only\">20% Complete</span>\r\n                                    </div>\r\n                                </div>\r\n                            </div>\r\n                            <div class=\"lv-item\">\r\n                                <div class=\"lv-title m-b-5\">Bootstrap Admin Template</div>\r\n\r\n                                <div class=\"progress\">\r\n                                    <div class=\"progress-bar progress-bar-warning\" role=\"progressbar\"\r\n                                         aria-valuenow=\"60\" aria-valuemin=\"0\" aria-valuemax=\"100\"\r\n                                         style=\"width: 60%\">\r\n                                        <span class=\"sr-only\">60% Complete (warning)</span>\r\n                                    </div>\r\n                                </div>\r\n                            </div>\r\n                            <div class=\"lv-item\">\r\n                                <div class=\"lv-title m-b-5\">Youtube Client App</div>\r\n\r\n                                <div class=\"progress\">\r\n                                    <div class=\"progress-bar progress-bar-danger\" role=\"progressbar\"\r\n                                         aria-valuenow=\"80\" aria-valuemin=\"0\" aria-valuemax=\"100\"\r\n                                         style=\"width: 80%\">\r\n                                        <span class=\"sr-only\">80% Complete (danger)</span>\r\n                                    </div>\r\n                                </div>\r\n                            </div>\r\n                        </div>\r\n\r\n                        <div class=\"clearfix\"></div>\r\n\r\n                        <a class=\"lv-footer\" href=\"\">View All</a>\r\n                    </div>\r\n                </div>\r\n            </li>\r\n            <li class=\"dropdown\" uib-dropdown>\r\n                <a uib-dropdown-toggle href=\"\">\r\n                    <i class=\"tm-icon zmdi zmdi-more-vert\"></i>\r\n                </a>\r\n                <ul class=\"dropdown-menu dm-icon pull-right\">\r\n                    <li class=\"skin-switch hidden-xs\">\r\n                            <span ng-repeat=\"w in mactrl.skinList | limitTo : 6\" class=\"ss-skin bgm-{{ w }}\"\r\n                                  data-ng-click=\"mactrl.skinSwitch(w)\"></span>\r\n                    </li>\r\n                    <li class=\"divider hidden-xs\"></li>\r\n                    <li class=\"hidden-xs\">\r\n                        <a data-ng-click=\"hctrl.fullScreen()\" href=\"\"><i class=\"zmdi zmdi-fullscreen\"></i> Toggle\r\n                            Fullscreen</a>\r\n                    </li>\r\n                    <li>\r\n                        <a data-ng-click=\"hctrl.clearLocalStorage()\" href=\"\"><i class=\"zmdi zmdi-delete\"></i> Clear\r\n                            Local Storage</a>\r\n                    </li>\r\n                    <li>\r\n                        <a href=\"\"><i class=\"zmdi zmdi-face\"></i> Privacy Settings</a>\r\n                    </li>\r\n                    <li>\r\n                        <a href=\"\"><i class=\"zmdi zmdi-settings\"></i> Other Settings</a>\r\n                    </li>\r\n                </ul>\r\n            </li>\r\n            <li class=\"hidden-xs\" data-target=\"chat\" data-toggle-sidebar\r\n                data-model-right=\"mactrl.sidebarToggle.right\"\r\n                data-ng-class=\"{ \'open\': mactrl.sidebarToggle.right === true }\">\r\n                <a href=\"\"><i class=\"tm-icon zmdi zmdi-comment-alt-text\"></i></a>\r\n            </li>\r\n        </ul>\r\n    </li>\r\n</ul>\r\n\r\n<!-- when mobile, reduce width and float right -->\r\n<div id=\"top-search-wrap\" style=\"position: relative; background: none;opacity:1;margin: 0 auto; width: 600px;\">\r\n    <div class=\"tsw-inner\" style=\"max-width: 500px\">\r\n        <!--<i id=\"top-search-close\" class=\"zmdi zmdi-arrow-left\" data-ng-click=\"hctrl.closeSearch()\"></i>-->\r\n        <input focus type=\"text\"\r\n               data-ng-keypress=\"headerCtrl.onSearchKeyPress($event)\"\r\n               data-ng-model=\"headerCtrl.searchTerm\"\r\n               placeholder=\"Search for bible verse e.g john 3:16\"\r\n               style=\"padding: 0 10px 0 20px; font-size: 14px\">\r\n    </div>\r\n</div>\r\n");
$templateCache.put("module/shared/sidebar-left.html","<div class=\"sidebar-inner c-overflow\">    \n    <div class=\"profile-menu\">\n        <a href=\"\" toggle-submenu>\n            <div class=\"profile-pic\">\n                <img src=\"img/profile-pics/1.jpg\" alt=\"\">\n            </div>\n\n            <div class=\"profile-info\">\n                Malinda Hollaway\n\n                <i class=\"zmdi zmdi-caret-down\"></i>\n            </div>\n        </a>\n\n        <ul class=\"main-menu\">\n            <li>\n                <a data-ui-sref=\"pages.profile.profile-about\" data-ng-click=\"mactrl.sidebarStat($event)\"><i class=\"zmdi zmdi-account\"></i> View Profile</a>\n            </li>\n            <li>\n                <a href=\"\"><i class=\"zmdi zmdi-input-antenna\"></i> Privacy Settings</a>\n            </li>\n            <li>\n                <a href=\"\"><i class=\"zmdi zmdi-settings\"></i> Settings</a>\n            </li>\n            <li>\n                <a href=\"\"><i class=\"zmdi zmdi-time-restore\"></i> Logout</a>\n            </li>\n        </ul>\n    </div>\n\n    <ul class=\"main-menu\">\n        \n        <li data-ui-sref-active=\"active\">\n            <a data-ui-sref=\"home\" data-ng-click=\"mactrl.sidebarStat($event)\"><i class=\"zmdi zmdi-home\"></i> Home</a>\n        </li>\n        <li class=\"sub-menu\" data-ng-class=\"{ \'active toggled\': mactrl.$state.includes(\'headers\') }\">\n            <a href=\"\" toggle-submenu><i class=\"zmdi zmdi-view-compact\"></i> Headers</a>\n\n            <ul>\n                <li><a data-ui-sref-active=\"active\" data-ui-sref=\"headers.textual-menu\" data-ng-click=\"mactrl.sidebarStat($event)\">Textual menu</a></li>\n                <li><a data-ui-sref-active=\"active\" data-ui-sref=\"headers.image-logo\" data-ng-click=\"mactrl.sidebarStat($event)\">Image logo</a></li>\n                <li><a data-ui-sref-active=\"active\" data-ui-sref=\"headers.mainmenu-on-top\" data-ng-click=\"mactrl.sidebarStat($event)\">Mainmenu on top</a></li>\n            </ul>\n        </li>\n        <li data-ui-sref-active=\"active\">\n            <a data-ui-sref=\"typography\" data-ng-click=\"mactrl.sidebarStat($event)\"><i class=\"zmdi zmdi-format-underlined\"></i> Typography</a>\n        </li>\n        <li class=\"sub-menu\" data-ng-class=\"{ \'active toggled\': mactrl.$state.includes(\'widgets\') }\">\n            <a href=\"\" toggle-submenu><i class=\"zmdi zmdi-widgets\"></i> Widgets</a>\n\n            <ul>\n                <li><a data-ui-sref-active=\"active\" data-ui-sref=\"widgets.widget-templates\" data-ng-click=\"mactrl.sidebarStat($event)\">Templates</a></li>\n                <li><a data-ui-sref-active=\"active\" data-ui-sref=\"widgets.widgets\" data-ng-click=\"mactrl.sidebarStat($event)\">Widgets</a></li>\n            </ul>\n        </li>\n        \n        <li class=\"sub-menu\" data-ng-class=\"{ \'active toggled\': mactrl.$state.includes(\'tables\') }\">\n            <a href=\"\" toggle-submenu><i class=\"zmdi zmdi-view-list\"></i> Tables</a>\n\n            <ul>\n                <li><a data-ui-sref-active=\"active\" data-ui-sref=\"tables.tables\" data-ng-click=\"mactrl.sidebarStat($event)\">Tables</a></li>\n                <li><a data-ui-sref-active=\"active\" data-ui-sref=\"tables.data-table\" data-ng-click=\"mactrl.sidebarStat($event)\">Data Tables</a></li>\n            </ul>\n        </li>\n        \n        <li class=\"sub-menu\" data-ng-class=\"{ \'active toggled\': mactrl.$state.includes(\'form\') }\">\n            <a href=\"\" toggle-submenu><i class=\"zmdi zmdi-collection-text\"></i> Forms</a>\n\n            <ul>\n                <li><a data-ui-sref-active=\"active\" data-ui-sref=\"form.basic-form-elements\" data-ng-click=\"mactrl.sidebarStat($event)\">Basic Form Elements</a></li>\n                <li><a data-ui-sref-active=\"active\" data-ui-sref=\"form.form-components\" data-ng-click=\"mactrl.sidebarStat($event)\">Form Components</a></li>\n                <li><a data-ui-sref-active=\"active\" data-ui-sref=\"form.form-examples\" data-ng-click=\"mactrl.sidebarStat($event)\">Form Examples</a></li>\n                <li><a data-ui-sref-active=\"active\" data-ui-sref=\"form.form-validations\" data-ng-click=\"mactrl.sidebarStat($event)\">Form Validation</a></li>\n            </ul>\n        </li>\n\n        <li class=\"sub-menu\" data-ng-class=\"{ \'active toggled\': mactrl.$state.includes(\'user-interface\') }\">\n            <a href=\"\" toggle-submenu><i class=\"zmdi zmdi-swap-alt\"></i>User Interface</a>\n            <ul>\n                <li><a data-ui-sref-active=\"active\" data-ui-sref=\"user-interface.ui-bootstrap\" data-ng-click=\"mactrl.sidebarStat($event)\">UI Bootstrap</a></li>\n                <li><a data-ui-sref-active=\"active\" data-ui-sref=\"user-interface.colors\" data-ng-click=\"mactrl.sidebarStat($event)\">Colors</a></li>\n                <li><a data-ui-sref-active=\"active\" data-ui-sref=\"user-interface.animations\" data-ng-click=\"mactrl.sidebarStat($event)\">Animations</a></li>\n                <li><a data-ui-sref-active=\"active\" data-ui-sref=\"user-interface.box-shadow\" data-ng-click=\"mactrl.sidebarStat($event)\">Box Shadow</a></li>\n                <li><a data-ui-sref-active=\"active\" data-ui-sref=\"user-interface.buttons\" data-ng-click=\"mactrl.sidebarStat($event)\">Buttons</a></li>\n                <li><a data-ui-sref-active=\"active\" data-ui-sref=\"user-interface.icons\" data-ng-click=\"mactrl.sidebarStat($event)\">Icons</a></li>\n                <li><a data-ui-sref-active=\"active\" data-ui-sref=\"user-interface.alerts\" data-ng-click=\"mactrl.sidebarStat($event)\">Alerts</a></li>\n                <li><a data-ui-sref-active=\"active\" data-ui-sref=\"user-interface.preloaders\" data-ng-click=\"mactrl.sidebarStat($event)\">Preloaders</a></li>\n                <li><a data-ui-sref-active=\"active\" data-ui-sref=\"user-interface.notifications-dialogs\" data-ng-click=\"mactrl.sidebarStat($event)\">Notifications & Dialogs</a></li>\n                <li><a data-ui-sref-active=\"active\" data-ui-sref=\"user-interface.media\" data-ng-click=\"mactrl.sidebarStat($event)\">Media</a></li>\n                <li><a data-ui-sref-active=\"active\" data-ui-sref=\"user-interface.other-components\" data-ng-click=\"mactrl.sidebarStat($event)\">Others</a></li>\n            </ul>\n        </li>\n        <li class=\"sub-menu\" data-ng-class=\"{ \'active toggled\': mactrl.$state.includes(\'charts\') }\">\n            <a href=\"\" toggle-submenu><i class=\"zmdi zmdi-trending-up\"></i>Charts</a>\n            <ul>\n                <li><a data-ui-sref-active=\"active\" data-ui-sref=\"charts.flot-charts\" data-ng-click=\"mactrl.sidebarStat($event)\">Flot Charts</a></li>\n                <li><a data-ui-sref-active=\"active\" data-ui-sref=\"charts.other-charts\" data-ng-click=\"mactrl.sidebarStat($event)\">Other Charts</a></li>\n            </ul>\n        </li>\n\n        <li data-ui-sref-active=\"active\">\n            <a data-ui-sref=\"calendar\" data-ng-click=\"mactrl.sidebarStat($event)\"><i class=\"zmdi zmdi-calendar\"></i> Calendar</a>\n        </li>\n        \n        <li class=\"sub-menu\" data-ng-class=\"{ \'active toggled\': mactrl.$state.includes(\'photo-gallery\') }\">\n            <a href=\"\" toggle-submenu><i class=\"zmdi zmdi-image\"></i>Photo Gallery</a>\n            <ul>\n                <li><a data-ui-sref-active=\"active\" data-ui-sref=\"photo-gallery.photos\" data-ng-click=\"mactrl.sidebarStat($event)\">Default</a></li>\n                <li><a data-ui-sref-active=\"active\" data-ui-sref=\"photo-gallery.timeline\" data-ng-click=\"mactrl.sidebarStat($event)\">Timeline</a></li>\n            </ul>\n        </li>\n\n        \n        <li data-ui-sref-active=\"active\">\n            <a data-ui-sref=\"generic-classes\" data-ng-click=\"mactrl.sidebarStat($event)\"><i class=\"zmdi zmdi-layers\"></i> Generic Classes</a>\n        </li>\n\n        <li class=\"sub-menu\" data-ng-class=\"{ \'active toggled\': mactrl.$state.includes(\'pages\') }\">\n            <a href=\"\" toggle-submenu><i class=\"zmdi zmdi-collection-item\"></i> Sample Pages</a>\n            <ul>\n                <li><a data-ui-sref-active=\"active\" data-ui-sref=\"pages.profile.profile-about\" data-ng-click=\"mactrl.sidebarStat($event)\">Profile</a></li>\n                <li><a data-ui-sref-active=\"active\" data-ui-sref=\"pages.listview\" data-ng-click=\"mactrl.sidebarStat($event)\">List View</a></li>\n                <li><a data-ui-sref-active=\"active\" data-ui-sref=\"pages.messages\" data-ng-click=\"mactrl.sidebarStat($event)\">Messages</a></li>\n                <li><a data-ui-sref-active=\"active\" data-ui-sref=\"pages.pricing-table\" data-ng-click=\"mactrl.sidebarStat($event)\">Pricing Table</a></li>\n                <li><a data-ui-sref-active=\"active\" data-ui-sref=\"pages.contacts\" data-ng-click=\"mactrl.sidebarStat($event)\">Contacts</a></li>\n                <li><a data-ui-sref-active=\"active\" data-ui-sref=\"pages.invoice\" data-ng-click=\"mactrl.sidebarStat($event)\">Invoice</a></li>\n                <li><a data-ui-sref-active=\"active\" data-ui-sref=\"pages.wall\" data-ng-click=\"mactrl.sidebarStat($event)\">Wall</a></li>\n                <li><a href=\"login.html\">Login and Sign Up</a></li>\n                <li><a href=\"lockscreen.html\">Lockscreen</a></li>\n                <li><a href=\"404.html\">Error 404</a></li>\n            </ul>\n        </li>\n        <li class=\"sub-menu\">\n            <a href=\"\" toggle-submenu><i class=\"zmdi zmdi-menu\"></i> 3 Level Menu</a>\n\n            <ul>\n                <li><a href=\"\">Level 2 link</a></li>\n                <li><a href=\"\">Another level 2 Link</a></li>\n                <li class=\"sub-menu\">\n                    <a href=\"\" toggle-submenu>I have children too</a>\n\n                    <ul>\n                        <li><a href=\"\">Level 3 link</a></li>\n                        <li><a href=\"\">Another Level 3 link</a></li>\n                        <li><a href=\"\">Third one</a></li>\n                    </ul>\n                </li>\n                <li><a href=\"\">One more 2</a></li>\n            </ul>\n        </li>\n        <li>\n            <a href=\"https://wrapbootstrap.com/theme/material-admin-responsive-angularjs-WB011H985\"><i class=\"zmdi zmdi-money\"></i> Buy this template</a>\n        </li>\n    </ul>\n</div>\n");}]);