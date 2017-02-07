import angular from 'angular';
import uiRouter from 'angular-ui-router';

import { LandingPageComponent } from './landing-page.component';
import { SideBarModule } from './side-bar/side-bar.module';
import { initFacebookSDK } from './../../common/helper';

export const LandingPageModule = angular
    .module('app.landing', [
        uiRouter,
        SideBarModule
    ])
    .component('landingPage', LandingPageComponent)
    .config(($stateProvider, $urlRouterProvider) => {
        'ngInject';
        $stateProvider
            .state('landing', {
                url: '/',
                component: 'landingPage',
                resolve: {
                    facebookSDK: initFacebookSDK
                }
            });
        $urlRouterProvider.otherwise('/');
    })
    .name;