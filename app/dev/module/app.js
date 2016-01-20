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
        //'localytics.directives'
        //'nouislider'
        //'ngTable'
    ])
    .constant('USER_ROLES', {
        guest: 'guest',
        pastor: 'pastor',
        user: 'user'
    })
    .run(function ($rootScope, authService, $state, $mdToast) {
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
        }
    );
