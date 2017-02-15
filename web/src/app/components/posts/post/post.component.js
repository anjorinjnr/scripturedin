import template from './post.html';

class PostController {
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

export const PostComponent = {
    template,
    controller: PostController
};


export const PostModule = angular
    .module('app.post', [])
    .component('post', PostComponent)
    .name;