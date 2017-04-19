import template from './comment.html';

class CommentController {
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

export const CommentComponent = {
    template,
    controller: CommentController
};


export const CommentModule = angular
    .module('app.comment', [])
    .component('comment', CommentComponent)
    .name;