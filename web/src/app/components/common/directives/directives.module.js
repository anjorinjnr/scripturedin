import angular from 'angular';

import { ShowScriptureOnChipClickDirective } from './show-scripture-on-chip-click';

import { calendarDirective } from './calendar';

console.log(ShowScriptureOnChipClickDirective);

export const DirectivesModue = angular
    .module('app.directives', [])
    .directive('showScriptureOnChipClick', ShowScriptureOnChipClickDirective)
    .directive('calendar', calendarDirective)
    .name