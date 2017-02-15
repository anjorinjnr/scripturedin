import template from './comments.html';

class CommentsController {
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

export const CommentsComponent = {
    template,
    controller: CommentsController
};