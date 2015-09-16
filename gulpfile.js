var gulp = require('gulp');
var gutil = require('gulp-util');
var notify = require("gulp-notify");
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var minifyCss = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');
var livereload = require('gulp-livereload');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var GulpSSH = require('gulp-ssh');

var config = require('./gulp-config.json');

var gulpSSH = new GulpSSH({
  ignoreErrors: false,
  sshConfig: config
})

gulp.task('deploy', function () {
  return gulp.src(['./**/*', '!**/node_modules/**', '!./*.js*', '!./scripts', '!./scss'])
    .pipe(gulpSSH.dest('/home/jakeninness/public_html/cuba-cameras/'))
})


gulp.task('default', 
	['build-css',
	'minify-css',
	'build-js'
	]

);

gulp.task('build-css', function() {
  return gulp.src([
      'bower_components/magnific-popup/dist/magnific-popup.css',
      'scss/main.scss'
    ])
    .pipe(sourcemaps.init())
      .pipe(sass()
        .on('error', function(err) {
          notify({title: "Sass Error"}).write(err);
          this.emit('end');
        })
      )
      .pipe(autoprefixer({
        browsers: ['last 2 versions', '> 2% in NZ', 'Explorer >= 9']  
      }))
    .pipe(concat('main.css'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('css'));
});

gulp.task('minify-css', function() {
  return gulp.src('css/*.css')
  	.pipe(sourcemaps.init())
    .pipe(minifyCss({compatibility: 'ie8'}))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('css-min'));
});

gulp.task('build-js', function() {
    return gulp.src([
      'bower_components/jquery/dist/jquery.min.js',
      'bower_components/magnific-popup/dist/jquery.magnific-popup.min.js',
      'scripts/**/*.js'
    ])
    .pipe(sourcemaps.init())
      //only uglify if gulp is ran with '--type production'
      .pipe(gutil.env.type === 'production' ? uglify() : gutil.noop()) 
      .pipe(concat('app.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('js'));
});


gulp.task('watch', ['build-css', 'build-js'], function() {
  gulp.watch("scss/**/*.scss", ['build-css'])
    .on('change', function(event) {
      gutil.log('File ' + gutil.colors.magenta(event.path) + ' was ' + event.type + '...');
    });
  gulp.watch("scripts/**/*.js", ['build-js'])
    .on('change', function(event) {
      gutil.log('File ' + gutil.colors.magenta(event.path) + ' was ' + event.type + '...');
    });
})
