/**
 * Wrapper for the $http service.
 * This is required so we can resolve the right base rule based on the environment, dev or prod
 * @param $http
 * @param env
 * @constructor
 */
var DataService = function ($http, API_HOST) {
    this.http_ = $http;
    this.baseurl = API_HOST;
};

DataService.prototype.get = function (path) {
    return this.http_.get(this.baseurl + path);
};

DataService.prototype.post = function (path, data) {
    return this.http_.post(this.baseurl + path, data);
};

angular.module(MODULE_NAME).service('dataService', DataService);