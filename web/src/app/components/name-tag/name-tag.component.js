import angular from 'angular';

import template from './name-tag.html';
export const NameTagComponent = {
    template,
    bindings: {
        user: '<'
    }
};

export const NameTagModule = angular.module('app.nametag', [])
    .component('nameTag', NameTagComponent).name;