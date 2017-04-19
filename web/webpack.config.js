var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var proxy;
try {
    proxy = require('./proxy');
} catch (e) {
    console.info('ATTN: You might be missing a proxy.js file. Your API request might not work \n\n');
}



var config = {
    contexts: __dirname + '/src',
    entry: './src/app/index.js',
    output: {
        path: __dirname + '/dist',
        filename: 'bundle.js'
    },
    plugins: [
        new webpack.ProvidePlugin({
            jQuery: 'jquery',
            $: 'jquery',
            jquery: 'jquery'
        }),
        new ExtractTextPlugin('app.css'),
        new HtmlWebpackPlugin({
            template: 'src/index.html'
        })
    ],
    devtool: 'source-map',
    resolve: {
        extensions: ['', '.js', '.ts']
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader') },
            { test: /\.less$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader!less-loader') },
            { test: /jquery\.js$/, loader: 'expose?jquery' },
            {
                test: /\.js$/,
                loader: 'ng-annotate!babel',
                exclude: /node_modules/
            },
            { test: /.ts$/, loader: 'awesome-typescript-loader' },
            { test: /\.html$/, loader: 'raw', exclude: /node_modules/ },
            { test: /\.png$/, loader: "url?limit=100000" },
            { test: /\.jpg$/, loader: "file" },
            // {test: /\.svg/, loader: "svg-url-loader"},
            { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url?limit=10000&mimetype=application/font-woff' },
            { test: /\.(ttf|eot|otf|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'file' }
        ]
    },
    devServer: {
        proxy: {
            '**': proxy ? proxy.url : ''
        }
    }
};

if (process.env.NODE_ENV == 'production') {
    config.plugins.push(new webpack.optimize.UglifyJsPlugin({ compress: { warnings: false } }));
}

module.exports = config;