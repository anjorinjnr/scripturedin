App.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');
    $stateProvider
        .state('main', {
            url: '/',
            templateUrl: 'module/main/main.html',
            controller: 'mainController as mainCtrl'
            //views: {
            //
            //    'content': {
            //        templateUrl: 'module/main/main.html',
            //        controller: 'mainController as mainCtrl'
            //    },
            //    'footer': {
            //        templateUrl: ''
            //    }
            //}
        })
        .state('base', {
            abstract: true,
            templateUrl: 'module/shared/base.html'
        })
        .state('base.home', {
            url: '/home',
            views: {
                'content': {
                    templateUrl: 'module/home/home.html',
                    controller: 'homeController as homeCtrl'
                }

            }
        });
});

