import { ContentComponent } from './content.component';

export const ContentModule = angular
    .module('app.content', [])
    .component('content', ContentComponent)
    .name;