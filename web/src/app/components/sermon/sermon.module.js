import angular from 'angular';
import uiRouter from 'angular-ui-router';

import { NewSermonComponent } from './new-sermon/new-sermon.component';

import { FindSermonComponent } from './find-sermon/find-sermon.component';

import { USER_ROLES } from '../../common/helper';

export const SermonModule = angular
    .module('app.sermon', [
        uiRouter,
    ])
    .component('newSermon', NewSermonComponent)
    .component('findSermon', FindSermonComponent)
    .config(($stateProvider, $urlRouterProvider) => {
        'ngInject';
        $stateProvider
            .state('new-sermon', {
                parent: 'base',
                url: '/sermon/new',
                views: {
                    content: 'newSermon'
                },
                data: {
                    role: USER_ROLES.pastor
                }
            })
            .state('find-sermon', {
                parent: 'base',
                url: '/sermon/find',
                views: {
                    content: 'findSermon'
                },
                data: {
                    role: USER_ROLES.user
                }
            });;
        $urlRouterProvider.otherwise('/');
    })
    .name;