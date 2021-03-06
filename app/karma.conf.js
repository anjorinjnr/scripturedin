// Karma configuration
// Generated on Mon Dec 28 2015 23:46:56 GMT-0500 (Eastern Standard Time)

module.exports = function (config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',

        client: {
            captureConsole: true,
            mocha: {
                bail: true
            }
        },

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],


        // list of files / patterns to load in the browser
        files: [
            'dev/vendors/bower_components/angular/angular.min.js',
            'dev/vendors/bower_components/angular-mocks/angular-mocks.js',
            'dev/vendors/bower_components/angular-ui-router/release/angular-ui-router.min.js',
            'dev/vendors/bower_components/moment/min/moment.min.js',
            'dev/vendors/bower_components/lodash/lodash.min.js',
            'tests/*.js',
            'tests/test_app.js',
            //'dev/module/**/*.js',
            'dev/module/component/alert/alert-service.js',
            'dev/module/component/auth/auth-service.js',
            'dev/module/component/bible/bible-service.js',
            'dev/module/component/util/util.js',
            'dev/module/sermon/sermon-controller.js'
        ],


        // list of files to exclude
        exclude: [],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {},


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress'],


        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['Chrome'],


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity
    })
}
