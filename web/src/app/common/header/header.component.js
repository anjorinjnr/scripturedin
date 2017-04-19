import template from './header.html';

class HeaderController {
    constructor(NavBarActions, $ngRedux) {
        'ngInject';
        this.NavBarActions = NavBarActions;
        this.store = $ngRedux;
    }
    $onInit() {
        console.log(this.NavBarActions);
        this.unsubscribe = this.store.connect(this.mapStateToThis, this.NavBarActions)(this);
    }
    $onDestroy() {
        this.unsubscribe();
    }

    mapStateToThis(state) {
        return {
            navbar: state.navbar
        };
    }
    toggleNavBar() {

        if (this.navbar.open) {
            this.closeNavBar();
        } else {
            this.openNavBar();
        }
    }
}

export const HeaderComponent = {
    template,
    controller: HeaderController
};