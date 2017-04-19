// libraries
import "jquery";
import angular from 'angular';
import ngMaterial from 'angular-material';
import ngAnimate from 'angular-animate';
import ngLocalStorage from 'angular-local-storage';
import uiRouter from 'angular-ui-router';
import uiBootstrap from 'angular-ui-bootstrap';
import thunk from 'redux-thunk';
import { combineReducers } from 'redux';
import ngRedux from 'ng-redux';
require('../../node_modules/dynamic-bind-html/dist/dynamic-bind-html');

//let dynamicBindHtml = require('dynamic-bind-html');
//console.log('bb', dynamicBindHtml)
// var dynamicBindHtml = require("exports?dynamicBindHtml!../../.js")
//styles
import './app.less';

// components, modules
import { AppComponent } from './app.component';
import { ComponentsModule } from './components/components.module';
import { CommonModule } from './common/common.module';

//states, actions
import { UserActions } from './app.state';
import { sidebar } from './components/landing-page/side-bar/side-bar.state';
import { navbar } from './common/nav-bar/nav-bar.state';
import { user } from './app.state';
import { facebookUser } from './components/login/login.state';
import { posts } from './components/posts/posts.state';
// import { pageNav } from './common/page-nav/page-nav.state';

//others
import { authHookRun, authLandingPageRun } from './transition.hooks';

const rootReducer = combineReducers({
    sidebar,
    user,
    navbar,
    facebookUser,
    posts
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
        ngMaterial,
        ngAnimate,
        ngRedux,
        'dynamicBindHtml' //'dynamic-bind-html'
        //dynamicBindHtml
    ])
    .config(reduxConfig)
    .config(localStorageConfig)
    .factory('UserActions', UserActions)
    .component('app', AppComponent)
    .run(authHookRun)
    .run(authLandingPageRun)
    .name;