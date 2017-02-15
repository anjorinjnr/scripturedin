import angular from 'angular';

import { toLocalFormat, toLocalMoment } from './helper';

const formatDate = () => {
    return (input, format) => toLocalFormat(input, format);
};

const fromNow = () => {
    return (input) => toLocalMoment(input).fromNow();
};


export const FiltersModule = angular
    .module('app.filters', [])
    .filter('formatDate', formatDate)
    .filter('fromNow', fromNow)
    .name;