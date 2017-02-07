export class AuthService {

    constructor(UserActions, $ngRedux, $q) {
        'ngInject';
        this.store = $ngRedux;
        this.UserActions = UserActions;
        this.$q = $q;
        this.unsubscribe = this.store.connect(this.mapStateToThis, this.UserActions)(this);
    }

    currentUser() {
        return this.user;

    }

    checkFacebookLogin() {
        const deferred = this.$q.defer();
        if (typeof FB !== 'undefined') {
            FB.getLoginStatus(response => {
                if (response.status == 'connected') {
                    FB.api('/me?fields=email,first_name,last_name,picture', user => {
                        user.access_token = response.authResponse.accessToken;
                        user.auth = 'facebook';
                        deferred.resolve(user);
                    })
                } else {
                    deferred.resolve('user is not connected');
                }
            });

        } else {
            console.log('fb...');

            deferred.reject('FB SDK is missing.');
        }
        return deferred.promise;
    }

    mapStateToThis(state) {
        return {
            user: state.user
        };
    }

}