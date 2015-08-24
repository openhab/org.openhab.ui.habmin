var gulp      = require('gulp'),
    concat    = require('gulp-concat'),
    uglify    = require('gulp-uglify'),
    rename    = require('gulp-rename');


gulp.task('process-scripts', function() {
    return gulp.src('./src/**/*.js')
        .pipe(concat('angular-screenfull.js'))
        .pipe(gulp.dest('./dist/'))
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./dist/'));

});


gulp.task('watch', function() {
    gulp.watch('./src/**/*.js', ['process-scripts']);

});


gulp.task('default', ['process-scripts','watch']);