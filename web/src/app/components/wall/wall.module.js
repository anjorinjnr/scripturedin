import angular from 'angular';
import uiRouter from 'angular-ui-router';

import { WallComponent } from './wall.component';

export const WallModule = angular
    .module('app.wall', [
        uiRouter,
    ])
    .component('wall', WallComponent)
    .config(($stateProvider, $urlRouterProvider) => {
        'ngInject';
        $stateProvider
            .state('base.wall', {
                url: '/home',
                views: {
                    content: 'wall'
                }
            });
        $urlRouterProvider.otherwise('/');
    })
    .name;