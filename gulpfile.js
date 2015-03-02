
// Require dependencies.
var gulp          = require('gulp');
var rework        = require('gulp-rework');
var reworkNpm     = require('rework-npm');
var reworkVars    = require('rework-vars');
var reworkMedia   = require('rework-custom-media');
var reworkCalc    = require('rework-calc');
var reworkColors  = require('rework-plugin-colors');
var reworkInherit = require('rework-inherit');
var cssAutoprefix = require('gulp-autoprefixer');
var cssMinify     = require('gulp-minify-css');
var rename        = require('gulp-rename');
var cp            = require('child_process');
var browserSync   = require('browser-sync');

// Paths
var paths = {
  homepage:           'index.html'
  , layouts:          '_layouts/*.html'
  , posts:            '_posts/*'
  , style:            '_css/styles.css'
  , styles:           '_css/**/*.css'
  , styleMin:         'styles.min.css'
  , stylesStagingDir: 'css'
  , stylesDistDir:    '_site/css'
}

// css prefix options
var cssPrefixOptions = {}

// browser-sync
gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: "./_site"
    }
  });
});

// build site with Jekyll
gulp.task('jekyll-build', function () {
  return cp.spawn('jekyll', ['build'])//, {stdio: 'inherit'})
    .on('exit', browserSync.reload);
});

// build css
gulp.task('css-build', function() {
  return gulp.src(paths.style)
    .pipe(rework(
      reworkNpm()
      , reworkVars()
      , reworkMedia()
      , reworkCalc // don't need ()
      , reworkColors()
      , reworkInherit()
    ))
    .pipe(cssAutoprefix(cssPrefixOptions))
    .pipe(gulp.dest(paths.stylesStagingDir))
    .pipe(gulp.dest(paths.stylesDistDir))
    .pipe(cssMinify())
    .pipe(rename(paths.styleMin))
    .pipe(gulp.dest(paths.stylesStagingDir))
    .pipe(gulp.dest(paths.stylesDistDir))
    .pipe(browserSync.reload({stream:true}));
});

// combine builds
gulp.task('build', ['css-build', 'jekyll-build']);

// watch for changes
gulp.task('watch', function () {
  gulp.watch(paths.styles, ['css-build']);
  gulp.watch([paths.homepage, paths.layouts, paths.posts], ['jekyll-build']);
});

// let's get started
gulp.task('default', ['build', 'watch', 'browser-sync']);
