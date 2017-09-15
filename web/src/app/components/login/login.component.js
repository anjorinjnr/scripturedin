import template from './login.html';

class LoginController {
    constructor($ngRedux, LoginActions, authService, $state, alertService) {
        'ngInject';
        this.store = $ngRedux;
        this.router = $state;
        this.authService = authService;
        this.LoginActions = LoginActions;
        this.alert = alertService;
    }
    $onInit() {
        this.unsubscribe = this.store.connect(this.mapStateToThis, this.LoginActions)(this);
    }
    $onDestroy() {
        this.unsubscribe();
    }

    loginWithFacebook() {
        const user = Object.assign({}, this.facebookUser, { auth: 'facebook' });
        this.authService.login(user).then(() => {
            this.close();
            if (this.authService.user.signup) {
                this.router.go('post-signup-profile');
            } else {
                this.router.go('wall');
            }
        }, error => {
            this.alert.error(error);
            console.log('login failed', error);
        });
    }
    mapStateToThis(state) {
        return {
            facebookUser: state.facebookUser
        };
    }
}




export const LoginComponent = {
    template,
    bindings: {
        close: '&'
    },
    controller: LoginController
};