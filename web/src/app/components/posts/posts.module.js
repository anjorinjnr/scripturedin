import { PostModule } from './post/post.component';
import { NewPostModule } from './new-post/new-post.module';

import { PostsComponent } from './posts.component';


export const PostsModule = angular
    .module('app.posts', [
        PostModule,
        NewPostModule
    ])
    .component('posts', PostsComponent)
    .name;