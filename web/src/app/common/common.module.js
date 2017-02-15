import angular from 'angular';

import { HeaderModule } from './header/header.module';
import { NavBarModule } from './nav-bar/nav-bar.module';
import { ContentModule } from './content/content.module';
import { AuthService } from './auth.service';
import { FiltersModule } from './filters.module';

import { isEmpty } from 'lodash';

export const CommonModule = angular
    .module('app.common', [
        HeaderModule,
        NavBarModule,
        ContentModule,
        FiltersModule
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
            `
        };
        $stateProvider.state('base', baseState);
    })
    .name;