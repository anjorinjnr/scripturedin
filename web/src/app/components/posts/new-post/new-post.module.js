import angular from 'angular';

import { NewPostComponent } from './new-post.component';

export const NewPostModule = angular
    .module('app.new-post', [])
    .component('newPost', NewPostComponent)
    .name;