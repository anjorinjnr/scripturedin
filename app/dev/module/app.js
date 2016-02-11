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
            layout: 0,
            ver: '1.0.5'
        };
    })
    .config(function ($uiViewScrollProvider) {
        $uiViewScrollProvider.useAnchorScroll();
    })
    .run(function ($rootScope, alertService, util, authService, userService, $state, $mdToast, appService) {

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
        }
    );
