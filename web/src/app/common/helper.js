import { isEmpty } from 'lodash';
import moment from 'moment';



export const USER_ROLES = {
    guest: 'guest',
    pastor: 'pastor',
    user: 'user',
    admin: 'admin'
};

export const toLocalFormat = (ms, format) => {
    const local = moment.utc(parseInt(ms)).local();
    format = format ? format : 'MM-DD-YYYY';
    return local.format(format);
};

export const toUtcMilliseconds = data => {
    return moment(date).utc().unix() * 1000;
}
export const toLocalDate = ms => {
    return self.toLocalMoment(ms).toDate();
};
export const toLocalMoment = ms => {
    return moment.utc(parseInt(ms)).local();
};
export const trim = (text, length) => {
    //trim the string to the maximum length
    const trimmedString = text.substr(0, length);
    //re-trim if we are in the middle of a word
    return trimmedString.substr(0, Math.min(trimmedString.length, trimmedString.lastIndexOf(" ")));
}
export const initFacebookSDK = ($q) => {
    'ngInject';

    const deferred = $q.defer();
    window.fbAsyncInit = function() {
        FB.init({
            appId: '1637149913216948',
            xfbml: true,
            version: 'v2.5'
        });
        deferred.resolve('done');
    };

    (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {
            return;
        }
        js = d.createElement(s);
        js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

    return deferred.promise;
};

export const canAccessState = (user, state) => {
    const role = state.data && state.data.role ? state.data.role :
        USER_ROLES.guest

    if (role == USER_ROLES.guest) return true;

    if (isEmpty(user)) return false;

    if (role == USER_ROLES.pastor && user.is_pastor) return true;

    return true;
};