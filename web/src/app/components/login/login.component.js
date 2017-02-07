import template from './login.html';

class LoginController {
    constructor($ngRedux, LoginActions, authService) {
        'ngInject';
        this.store = $ngRedux;
        this.authService = authService;
        this.LoginActions = LoginActions;
    }
    $onInit() {
        this.unsubscribe = this.store.connect(this.mapStateToThis, this.LoginActions)(this);
    }
    $onDestroy() {
        this.unsubscribe();
    }

    loginWithFacebook() {
        const user = Object.assign({}, this.facebookUser, { auth: 'facebook' });
        this.authService.login(user).then();

    }
    mapStateToThis(state) {
        return {
            facebookUser: state.facebookUser
        };
    }
}




export const LoginComponent = {
    template,
    controller: LoginController
};