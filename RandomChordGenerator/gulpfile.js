/// <binding ProjectOpened='watch, default' />
var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var notify = require("gulp-notify");
var sass = require('gulp-sass');

var styleSheets = 'assets/sass/';
var styleSheetsDist = 'assets/css/';

gulp.task('browserify', function() {
    console.log('Starting browserify...');
    
    return browserify('./app/main.js').bundle()

        .on('error', function (err) {
            console.log(err.message);

            notify.onError(function (error) {
                return error.message;
            });

            this.emit('end');
        })

        // Desired filename
        .pipe(source('bundle.js'))

        // Output the file
        .pipe(gulp.dest('scripts/'))
        .pipe(notify("Js bundle complete"));
});


gulp.task('sass', function () {
    console.log('Starting sass...');

    return gulp.src(styleSheets + 'site.scss')
        .pipe(sass({
            outputStyle: 'compressed'
        }))
        .on("error",
            function(err) {
                console.log('Error!!!');

                notify.onError(function(error) {
                    return error.message;
                });
            })
        .pipe(gulp.dest(styleSheetsDist))
        .pipe(notify({ message: "Stylesheets Compiled", title: "Stylesheets" }));
});

gulp.task('default', ['sass', 'browserify']);

gulp.task('watch', function() {
    gulp.watch(['app/**/*.js', 'assets/**/*.scss', 'assets/**/*.js', '!gulpfile.js', '!scripts/bundle.js'], ['default']);
});