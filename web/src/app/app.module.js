import angular from 'angular';
// import ngMaterial from 'angular-material';
// import ngAnimate from 'angular-animate';
import ngLocalStorage from 'angular-local-storage';
import uiRouter from 'angular-ui-router';
import uiBootstrap from 'angular-ui-bootstrap';

import { AppComponent } from './app.component';
import { ComponentsModule } from './components/components.module';

import { CommonModule } from './common/common.module';
import './app.less';

import { UserActions } from './app.state';

import { sidebar } from './components/landing-page/side-bar/side-bar.state';

import { navbar } from './common/nav-bar/nav-bar.state';

import { user } from './app.state';

import { facebookUser } from './components/login/login.state';

import { authHookRun, authLandingPageRun } from './transition.hooks';

// import { pageNav } from './common/page-nav/page-nav.state';

import thunk from 'redux-thunk';
import { combineReducers } from 'redux';
import ngRedux from 'ng-redux';

const rootReducer = combineReducers({
    sidebar,
    user,
    navbar,
    facebookUser
});

const reduxConfig = $ngReduxProvider => {
    'ngInject';
    $ngReduxProvider.createStoreWith(rootReducer, [thunk]);
};

const localStorageConfig = localStorageServiceProvider => {
    'ngInject';
    localStorageServiceProvider
        .setPrefix('scripturedin')
        .setStorageCookieDomain(window.location.hostname);
};

export const AppModule = angular
    .module('app', [
        ComponentsModule,
        CommonModule,
        uiRouter,
        uiBootstrap,
        ngLocalStorage,
        // ngMaterial
        // ngAnimate
        ngRedux
    ])
    .config(reduxConfig)
    .config(localStorageConfig)
    .factory('UserActions', UserActions)
    .component('app', AppComponent)
    .run(authHookRun)
    .run(authLandingPageRun)
    .name;