/**
 * Created by ebby on 12/29/2015.
 */
var App = angular.module('scripturedIn',
    [
        'ui.bootstrap'
    ])
    .constant('USER_ROLES', {
        guest: 'guest',
        pastor: 'pastor',
        user: 'user'
    });
