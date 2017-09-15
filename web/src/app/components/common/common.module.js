import angular from 'angular';

import quill from 'quill';
import ngQuill from 'ng-quill';


import { HeaderModule } from './header/header.module';
import { NavBarModule } from './nav-bar/nav-bar.module';
import { ContentModule } from './content/content.module';

import { FiltersModule } from './filters.module';
import { FabMenuModule } from './fabmenu/fabmenu.module';

import { ServicesModule } from './services/services.module';
import { DirectivesModue } from './directives/directives.module';

import { isEmpty } from 'lodash';

export const CommonModule = angular
    .module('app.common', [
        'ngQuill',
        HeaderModule,
        NavBarModule,
        ContentModule,
        DirectivesModue,
        FiltersModule,
        FabMenuModule,
        ServicesModule
    ])

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