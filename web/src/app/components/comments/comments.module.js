import { CommentModule } from './comment/comment.component';
import { CommentsComponent } from './comments.component';

export const CommentsModule = angular
    .module('app.comments', [
        CommentModule
    ])
    .component('comments', CommentsComponent)
    .name;