import angular from 'angular';

import { HeaderModule } from './header/header.module';
import { NavBarModule } from './nav-bar/nav-bar.module';
import { ContentModule } from './content/content.module';
import { AuthService } from './auth.service';

import { isEmpty } from 'lodash';

export const CommonModule = angular
    .module('app.common', [
        HeaderModule,
        NavBarModule,
        ContentModule
    ])
    .service('authService', AuthService)
    .config(($stateProvider, $urlRouterProvider) => {
        'ngInject';
        const baseState = {
            abstract: true,
            template: `
              <header></header>
              <content></content>
              <footer></footer>
            `,
            resolve: {
                auth: (authService, $q, $state) => {
                    'ngInject';
                    let deferred = $q.defer();
                    authService.getUser().then(() => {
                        if (authService.user.data) {
                            deferred.resolve('user is logged in');
                        } else {
                            deferred.reject('no logged in user');
                            $state.go('landing');
                        }
                    });
                    return deferred.promise;
                }
            }
        };
        $stateProvider.state('base', baseState);
    })
    .name;