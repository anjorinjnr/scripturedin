import template from './nav-bar.html';

class NavBarController {
    constructor(NavBarActions, $ngRedux) {
        'ngInject';
        this.store = $ngRedux;
        this.NavBarActions = NavBarActions;
    }

    $onInit() {
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
}

export const NavBarComponent = {
    template,
    controller: NavBarController
};