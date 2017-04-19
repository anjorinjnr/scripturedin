import angular from 'angular';

import { FabMenuComponent } from './fabmenu.component';

export const FabMenuModule = angular
    .module('app.fabmenu', [])
    .component('fabMenu', FabMenuComponent)
    .name;