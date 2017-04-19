import angular from 'angular';
import uiRouter from 'angular-ui-router';

import { USER_ROLES } from '../../common/helper';
import { BibleBrowserComponent } from './browser/browser.component';
import { BibleReaderComponent } from './reader/reader.component';

export const BibleModule = angular
    .module('app.bible', [uiRouter])
    .component('bibleBrowser', BibleBrowserComponent)
    .component('bibleReader', BibleReaderComponent)
    .config(($stateProvider, $urlRouterProvider) => {
        'ngInject';
        $stateProvider
            .state('bible', {
                parent: 'base',
                url: '/bible',
                views: {
                    content: 'bibleBrowser'
                },
                data: {
                    role: USER_ROLES.user
                }
            })
            .state('chapter', {
                parent: 'bible',
                url: '/:book',
                views: {
                    content: 'bibleBrowser'
                },
                data: {
                    role: USER_ROLES.user
                }
            })
            .state('read', {
                parent: 'bible',
                url: '/read?p',
                views: {
                    'content@base': 'bibleReader'
                },
                resolve: {
                    scriptureText: $stateParams => $stateParams.p
                },
                data: {
                    role: USER_ROLES.user
                }
            });

        $urlRouterProvider.otherwise('/');
    })
    .name;