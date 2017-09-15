import angular from 'angular';

import { LandingPageModule } from './landing-page/landing-page.module';
import { LoginModule } from './login/login.module';
import { WallModule } from './wall/wall.module';
import { CommentsModule } from './comments/comments.module';
import { PostsModule } from './posts/posts.module';
import { BibleModule } from './bible/bible.module';
import { NameTagModule } from './name-tag/name-tag.component';
import { SermonModule } from './sermon/sermon.module';

export const ComponentsModule = angular
    .module('app.components', [
        BibleModule,
        CommentsModule,
        LandingPageModule,
        LoginModule,
        NameTagModule,
        PostsModule,
        SermonModule,
        WallModule
    ])
    .name;