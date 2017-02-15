import template from './landing-page.html';
import { isEmpty } from 'lodash';

import searchImg from '../../../assets/img/search.png';
import noteImg from '../../../assets/img/note.png';
import socialImg from '../../../assets/img/social.png';


class LandingPageController {
    constructor(SideBarActions, LoginActions, authService, $uibModal, $ngRedux, $state) {
        'ngInject';
        this.store = $ngRedux;
        this.modal = $uibModal;
        this.SideBarActions = SideBarActions;
        this.LoginActions = LoginActions;
        this.authService = authService;
        this.router = $state;

    }

    $onInit() {

        this.searchImg = searchImg;
        this.noteImg = noteImg;
        this.socialImg = socialImg;

        const actions = Object.assign({}, this.SideBarActions, this.LoginActions);
        this.unsubscribe = this.store.connect(this.mapStateToThis, actions)(this);
        this.authService.getUser().then(() => {
            if (isEmpty(this.authService.currentUser())) {
                this.authService.checkFacebookLogin().then(user => {
                        if (user !== 'user is not connected') {
                            this.setFacebookUser(user);
                            this.login();
                        }
                    },
                    error => {
                        console.log('no fb user', error);
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