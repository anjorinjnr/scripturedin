import template from './side-bar.html';

class SideBarController {
    constructor(SideBarActions, $ngRedux) {
        'ngInject';
        this.store = $ngRedux;
        this.SideBarActions = SideBarActions;
    }

    $onInit() {
        this.unsubscribe = this.store.connect(this.mapStateToThis, this.SideBarActions)(this);

    }

    $onDestroy() {
        this.unsubscribe();
    }

    mapStateToThis(state) {
        return {
            sidebar: state.sidebar
        };
    }
}

export const SideBarComponent = {
    template,
    controller: SideBarController
};