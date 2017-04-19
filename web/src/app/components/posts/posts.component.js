import template from './posts.html';

class PostsController {
    constructor($ngRedux, PostsActions) {
        'ngInject';
        this.store = $ngRedux;
        this.PostsActions = PostsActions;
    }

    $onInit() {
        this.unsubscribe = this.store.connect(this.mapStateToThis, this.PostsActions)(this);
        this.getPosts();
    }

    $onDestroy() {
        this.unsubscribe();
    }

    mapStateToThis(state) {
        return {
            posts: state.posts
        };
    }
}

export const PostsComponent = {
    template,
    controller: PostsController
};