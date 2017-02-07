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
}