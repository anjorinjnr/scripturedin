import template from './wall.html';


class WallController {
    constructor($ngRedux) {
        'ngInject';
        this.store = $ngRedux;
    }
    onInit() {
        // this.unsubscribe = this.store.connect(this.mapStateToThis, )(this);
    }
    onDestroy() {
        this.unsubscribe();
    }

    mapStateToThis(state) {
        return {};
    }
}
export const WallComponent = {
    template,
    controller: WallController
};