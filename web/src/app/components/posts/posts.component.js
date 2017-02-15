import template from './posts.html';

class PostsController {
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

export const PostsComponent = {
    template,
    controller: PostsController
};