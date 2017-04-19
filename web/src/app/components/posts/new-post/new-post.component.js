import template from './new-post.html';

export class NewPostController {
    constructor($ngRedux) {
        'ngInject';
        this.store = $ngRedux;
    }
    onInit() {
        this.unsubscribe = this.store.connect(this.mapStateToThis, {})(this);
    }
    onDestroy() {
        this.unsubscribe();
    }

    mapStateToThis(state) {
        return {};
    }
}

export const NewPostComponent = {
    template,
    controller: NewPostController
};