import angular from 'angular';
import uiRouter from 'angular-ui-router';

import { WallComponent } from './wall.component';

import { USER_ROLES } from '../../common/helper';

export const WallModule = angular
    .module('app.wall', [
        uiRouter,
    ])
    .component('wall', WallComponent)
    .config(($stateProvider, $urlRouterProvider) => {
        'ngInject';
        $stateProvider
            .state('wall', {
                parent: 'base',
                url: '/home',
                views: {
                    content: 'wall'
                },
                data: {
                    role: USER_ROLES.user
                }
            });
        $urlRouterProvider.otherwise('/');
    })
    .name;