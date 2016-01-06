App.controller('mainController', function ($timeout, $state, $scope, growlService, userService,
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

})



