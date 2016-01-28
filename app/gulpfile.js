var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    del = require('del'),
    ngAnnotate = require('gulp-ng-annotate'),
    minifyCss = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    templateCache = require('gulp-angular-templatecache'),
    vendor = require('./dev/vendor.json');


var paths = {
    html: 'dev/module/**/*.html',
    styles: [
        'dev/css/app.min.1.css',
        'dev/css/app.min.2.css',
        'dev/css/scripturedin.css'
    ],
    scripts: [
        'dev/module/app.js',
        'dev/module/**/*.js'
    ]
};

//clear prod dir
gulp.task('clean', function () {
    return del(['prod/**/*', '!prod/index.html', 'prod/img/**/*']);
});

gulp.task('vendor-css', function () {
    return gulp.src(vendor.css.prod)
        .pipe(concat('vendor.css'))
        .pipe(gulp.dest('prod'))
        .pipe(minifyCss({
            keepSpecialComments: 0
        }))
        .pipe(rename({extname: '.min.css'}))
        .pipe(gulp.dest('prod'));
});
gulp.task('vendor-js', function () {
    return gulp.src(vendor.js.prod)
        .pipe(concat('vendor.js'))
        .pipe(rename({extname: '.min.js'}))
        .pipe(gulp.dest('prod'));
});

gulp.task('copy-assets', function () {
    return gulp.src(['dev/img/**', 'dev/fonts/**', 'dev/media/**',
            'dev/data/**','dev/vendors/bower_components/material-design-iconic-font/dist/fonts'], {base: 'dev'})
        .pipe(gulp.dest('prod'));
});
gulp.task('styles', function () {
    return gulp.src(paths.styles)
        .pipe(gulp.dest('prod'));
});
//concat and minify app js
gulp.task('concat-js', ['templates'], function () {
    return gulp.src(paths.scripts)
        .pipe(concat('app.js'))
        .pipe(ngAnnotate({add: true}))
        .pipe(gulp.dest('prod'));

});
gulp.task('scripts', ['concat-js'], function () {
    return gulp.src(['prod/app.js', 'prod/templates.js'])
        .pipe(concat('app.js'))
        .pipe(gulp.dest('prod'))
        .pipe(uglify())
        .pipe(rename({extname: '.min.js'}))
        .pipe(gulp.dest('prod'));

});

// cache html files
gulp.task('templates', function () {
    return gulp.src(paths.html)
        .pipe(templateCache({module: 'scripturedIn', root: 'module/'}))
        .pipe(gulp.dest('prod'));
});
gulp.task('default', ['clean', 'vendor-css', 'styles', 'vendor-js', 'scripts', 'copy-assets']);