import template from './landing-page.html';
import { isEmpty } from 'lodash';


class LandingPageController {
    constructor(SideBarActions, LoginActions, authService, $uibModal, $ngRedux) {
        'ngInject';
        this.store = $ngRedux;
        this.modal = $uibModal;
        this.SideBarActions = SideBarActions;
        this.LoginActions = LoginActions;
        this.authService = authService;

    }

    $onInit() {
        const actions = Object.assign({}, this.SideBarActions, this.LoginActions);
        this.unsubscribe = this.store.connect(this.mapStateToThis, actions)(this);
        this.authService.getUser().then(() => {
            if (isEmpty(this.authService.user.data)) {
                this.authService.checkFacebookLogin().then(user => {
                        this.setFacebookUser(user);
                        this.login();
                    },
                    error => {
                        console.log(error);
                    });
            }
        });
    }

    $onDestroy() {
        this.unsubscribe();
    }

    login() {
        this.modal.open({
            component: 'login',
            size: 'login'
        });

    }
    mapStateToThis(state) {
        return {
            sidebar: state.sidebar
        };
    }
}

export const LandingPageComponent = {
    template,
    controller: LandingPageController
};