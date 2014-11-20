// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var jshint = require('gulp-jshint');
var closure = require('gulp-closure-compiler');

var appName = "tabata";

// Lint
gulp.task('lint', function() {
    return gulp.src('src/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('check', function(){
    // Perform type checking, etc. with closure compiler
    gulp.src('build/' + appName + '.js')
        .pipe(closure({
            compilerPath: '/usr/share/java/closure-compiler/closure-compiler.jar',
            fileName: appName + '.min.js',
            compilerFlags: {
                warning_level: 'VERBOSE',
                summary_detail_level: 1
            }
        }))
});

// Compress/minify
gulp.task('compress', function(){
    gulp.src('build/' + appName + '.js')
        .pipe(closure({
            compilerPath: '/usr/share/java/closure-compiler/closure-compiler.jar',
            fileName: appName + '.min.js',
            compilerFlags: {
                warning_level: 'QUIET',
                compilation_level: 'SIMPLE_OPTIMIZATIONS'
            }
        }))
        .pipe(gulp.dest('build'));
});

// Default Task
gulp.task('default', ['lint', 'watch']);
gulp.task('watch', function() {
    gulp.watch('src/**/*.{js,html}', ['lint', 'browserify']);
});
gulp.task('compile', ['compress']);
gulp.task('check', ['lint', 'check']);
