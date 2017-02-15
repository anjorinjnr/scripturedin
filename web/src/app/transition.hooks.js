import { USER_ROLES, canAccessState } from './common/helper';
import { isEmpty } from 'lodash';

/**
 * Ensure user is authenticated and has the required role for the
 * requested state.
 */
export function authHookRun($transitions, authService) {
    'ngInject';
    const match = {
        to: (state) => state.data && state.data.role !== USER_ROLES.guest
    };

    const callback = (transition) => {
        const $state = transition.router.stateService;
        return authService.getUser().then(() => {
            const user = authService.currentUser();
            if (isEmpty(user)) {
                // no user, redirect to welcome page
                return $state.target('landing');
            }
            if (!canAccessState(user, transition.targetState())) {
                // user can't access the requested state, 
                // redirect to home page
                return $state.target('wall');
            } else {
                return Promise.resolve('allow');
            }
        });
    };

    $transitions.onBefore(match, callback, { priority: 10 });
};

/**
 * Redirect an authenticated user requesting the landing page to the 
 * user's home page.
 */
export function authLandingPageRun($transitions, authService) {
    'ngInject';
    $transitions.onBefore({ to: 'landing' }, (transition) => {
        const $state = transition.router.stateService;
        return authService.getUser().then(() => {
            const user = authService.currentUser();
            if (!isEmpty(user)) {
                // user is logged, redirect to home page
                return $state.target('wall');
            }
        });
    }, { priority: 10 });
};