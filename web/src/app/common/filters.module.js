import angular from 'angular';

import { toLocalFormat, toLocalMoment } from './helper';

const formatDate = () => {
    return (input, format) => toLocalFormat(input, format);
};

const fromNow = () => {
    return (input) => toLocalMoment(input).fromNow();
};
const sentencecase = () => {
    //obtained from https://gist.github.com/jeffjohnson9046/9789876
    return (input) => {
        var smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|vs?\.?|via)$/i;

        input = input.toLowerCase();
        return input.replace(/[A-Za-z0-9\u00C0-\u00FF]+[^\s-]*/g, (match, index, title) => {
            if (index > 0 && index + match.length !== title.length &&
                match.search(smallWords) > -1 && title.charAt(index - 2) !== ":" &&
                (title.charAt(index + match.length) !== '-' || title.charAt(index - 1) === '-') &&
                title.charAt(index - 1).search(/[^\s-]/) < 0) {
                return match.toLowerCase();
            }
            if (match.substr(1).search(/[A-Z]|\../) > -1) {
                return match;
            }
            return match.charAt(0).toUpperCase() + match.substr(1);
        });
    };
};

export const FiltersModule = angular
    .module('app.filters', [])
    .filter('formatDate', formatDate)
    .filter('fromNow', fromNow)
    .filter('sentencecase', sentencecase)
    .name;