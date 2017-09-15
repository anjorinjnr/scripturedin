import angular from 'angular';

import { NavBarActions } from './nav-bar.state';
import { NavBarComponent } from './nav-bar.component';

export const NavBarModule = angular
    .module('app.navbar', [])
    .factory('NavBarActions', NavBarActions)
    .component('navBar', NavBarComponent)
    .name;