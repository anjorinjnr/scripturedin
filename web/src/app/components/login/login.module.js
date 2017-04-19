import angular from 'angular';

import { LoginComponent } from './login.component';
import { LoginActions } from './login.state';

export const LoginModule = angular
    .module('app.login', [])
    .factory('LoginActions', LoginActions)
    .component('login', LoginComponent)
    .name;