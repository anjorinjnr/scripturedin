/**
 * Created by eanjorin on 12/10/15.
 */
App.service('userService', function($http) {


    this.signUp = function(user){
        return $http.post('/api/signup', user);
    }
});