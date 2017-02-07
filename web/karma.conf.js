module.exports = function(config) {
  config.set({
    basePath: 'src',
    frameworks: ['jasmine'],
    files: [{
      pattern: 'spec.bundle.js',
      watched: false
    }],
    exclude: [],
    plugins: [
      require("karma-jasmine"),
      require("karma-phantomjs-launcher"),
      require("karma-spec-reporter"),
      require("karma-sourcemap-loader"),
      require("karma-webpack")
    ],
    preprocessors: {
      'spec.bundle.js': ['webpack', 'sourcemap']
    },
    webpack: {
      devtool: 'inline-source-map',
      module: {
        loaders: [{
          test: /\.js/,
          exclude: [ /node_modules/, /dist/],
          loader: 'babel'
        }, {
          test: /\.html/,
          loader: 'raw'
        }, {
          test: /\.css$/,
          loader: 'style!css'
        }]
      }
    },
    webpackServer: {
      noInfo: true // prevent console spamming when running in Karma!
    },
    reporters: ['spec'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['PhantomJS'],
    singleRun: true
  });
};
