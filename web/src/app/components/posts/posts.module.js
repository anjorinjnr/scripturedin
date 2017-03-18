import { PostModule } from './post/post.component';
import { NewPostModule } from './new-post/new-post.module';

import { PostsComponent } from './posts.component';
import { PostsActions } from './posts.state';


export const PostsModule = angular
    .module('app.posts', [
        PostModule,
        NewPostModule
    ])
    .factory('PostsActions', PostsActions)
    .component('posts', PostsComponent)
    .name;