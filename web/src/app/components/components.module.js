import angular from 'angular';

import { LandingPageModule } from './landing-page/landing-page.module';
import { LoginModule } from './login/login.module';
import { WallModule } from './wall/wall.module';
import { CommentsModule } from './comments/comments.module';
import { PostsModule } from './posts/posts.module';

export const ComponentsModule = angular
    .module('app.components', [
        LandingPageModule,
        LoginModule,
        WallModule,
        CommentsModule,
        PostsModule
    ])
    .name;