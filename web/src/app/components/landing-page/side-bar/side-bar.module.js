import angular from 'angular';

import { SideBarActions } from './side-bar.state';
import { SideBarComponent } from './side-bar.component';

export const SideBarModule = angular
    .module('app.landing.sidebar', [])
    .factory('SideBarActions', SideBarActions)
    .component('sideBar', SideBarComponent)
    .name;