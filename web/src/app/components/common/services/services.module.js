import angular from 'angular';

import { AuthService } from './auth.service';
import { AlertService } from './alert.service';
import { BibleService } from './bible.service';



export const ServicesModule = angular.module('app.services', [])
    .service('authService', AuthService)
    .service('alertService', AlertService)
    .service('bibleService', BibleService)
    .name;