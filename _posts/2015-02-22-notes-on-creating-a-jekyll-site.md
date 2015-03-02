---
layout: post
title: "Notes on Creating a Jekyll Site with Gulp and Rework"
date: 2015-02-22
keywords: jekyll gulp rework
---

We'll need to install [Jekyll] (http://jekyllrb.com/docs/installation/) and [node (and npm)] (http://nodejs.org/download/).

### Directory scaffolding

We need a basic folder structure for Jekyll. Could run `jekyll new` to set this up but instead let's create the directories manually.  We'll need a `_posts` directory to hold our content and a `_layouts` directory for html templates. Instead of having a `css` directory like the Jekyll default, we'll use `_css` to hold our development css files and then use our build process to create the `css` directory, which Jekyll will then copy to the production site. We also need some basic files to get started: `_config.yml`, `_layouts/defaults.html`, `_layouts/post.html`, `_css/styles.css`.  We'll put all of these into a local directory called `blog`.

```bash
mkdir blog && cd blog
mkdir _posts _layouts _css
touch _config.yml index.html _layouts/default.html _layouts/post.html _css/styles.css
```

### npm and Gulp basic set up

We'll use node's package manager [npm] (https://www.npmjs.com) to handle dependencies, so we need to set up a package.json manifest file. The easiest way is to:

```bash
npm init
```

We'll use Gulp for our task runner so let's create a basic gulpfile:

```bash
touch gulpfile.js
```

And we need to install Gulp and add it to our manifest:

```bash
npm install gulp --save-dev
```

### Gulp tasks

##### jekyll-build

Now let's flesh out our gulpfile. We need Gulp to compile our css, build our Jekyll site, and sync up the browser so we can watch for changes. We'll create the following tasks to do the trick: `jekyll-build`, `css-build`, `browser-sync`. We'll also create a `build` task that calls these three, a `watch` task to listen to file changes and call appropriate tasks, and finally the standard `default` task to kick things off.

We want the `jekyll-build` task to work Jekyll's magic and build the site (`_site`). Normally we would simply type `jekyll build` in the terminal, so in our gulpfile we need to execute this same command. We can use a node's `child_process` module for this. The task itself will looks like:

```javascript
var cp = require('child_process');

gulp.task('jekyll-build', function () {
  return cp.spawn('jekyll', ['build']).on('exit', browserSync.reload);
});
```

This will spawn a new process to execute `jekyll build`, and on the `exit` event call the `browserSync.reload` function, which we'll talk about in a second.

##### css-build

We want to do a few things with our css:

* compile and minify our custom css files
* autoprefix to make things work
* use Rework, because it's cool

Let's download some Gulp plugins for autoprefixing, css minification, and file renaming.

```bash
npm install gulp-autoprefixer gulp-minify-css gulp-rename --save-dev
```

To use Rework with Gulp we want the `gulp-rework` plugin and a few basic Rework plugins

```bash

npm install gulp-rework --save-dev
npm install rework-npm --save-dev # for loading npm and local files with @import
npm install rework-vars --save-dev # for css variables
npm install rework-custom-media --save-dev # for defining media queries
npm install rework-calc --save-dev # css calc()
npm install rework-plugin-colors --save-dev # color functions
npm install rework-inherit --save-dev # for inheritance of css rules
```

Let's pause for a moment to include all of the dependencies we'll need in our gulpfile.

```javascript
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
```

Ok, the plan is to have one primary css file `_css/styles.css` that has our basic rules and `@import`'s whatever else we need. So our Gulp task will read from this file and the pipe it to our Rework plugins to handle importing, variables, media queries, etc. And then onto autoprefixing and minification. We'll place these compiled css files in the `css` directory so Jekyll can use it for its build process.  We will also inject them into the `_site/css` directory. This will allow us to make changes to the css and not have to wait for a full Jekyll build to see the results in the browser. All together now:

```javascript
gulp.task('css-build', function() {
  return gulp.src('_css/styles.css')
    .pipe(rework(
      reworkNpm()
      , reworkVars()
      , reworkMedia()
      , reworkCalc // don't need ()
      , reworkColors()
      , reworkInherit()
    ))
    .pipe(cssPrefix({}))
    .pipe(gulp.dest('css'))
    .pipe(gulp.dest('_site/css'))
    .pipe(cssMinify())
    .pipe(rename('styles.min.css'))
    .pipe(gulp.dest('css'))
    .pipe(gulp.dest('_site/css'))
    .pipe(browserSync.reload({stream:true}));
});

```

##### browser-sync

Let's not forget the Gulp task to sync up our browsers:

```javascript
var browserSync   = require('browser-sync'); // mentioned earlier

gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: "./_site"
    }
  });
});
```

We can also use the `browserSync.reload({ stream: true })` method to easily fire a browser sync in another task, as in the `css-build` task defined above.

##### build, watch, and default

To complete our gulpfile, we'll add a few more tasks.

Shortcut to execute the `build-jekyll` and `build-css` tasks:

```javascript
gulp.task('build', ['css-build', 'jekyll-build']);
```

Task to listen for changes in our css, posts, or layouts:

```javascript
gulp.task('watch', function () {
  gulp.watch('_css/**/*.css', ['css-build']);
  gulp.watch(['index.html', '_posts/*.md', '_layouts/*.html'], ['jekyll-build']);
});

```

And finally our default task to kick things off:

```javascript
gulp.task('default', ['build', 'watch', 'browser-sync']);
```

### Templates

Using our gulpfile we can automate building our jekyll site and compiling our css, but we still need a few key components like our html templates and main `index.html` file.

Without going into too much detail, we'll set up our baseline template at `_layouts/default.html`. This will have the the doctype declaration, `html`, `head`, and `body` tags, and a placeholder for content. The `_layouts/post.html` will use the default layout and add info specific to each post like the title, date, and content.  Finally, the `index.html` file will also use the default layout and have a listing of all the post titles.

That's it.

### config file

We need to add some info to the `_config.yml` file we created at the beginning. We'll keep this simple and just have the following info:

```yaml
name: <this should be the name of the blog>
description: <a description, which will fill in some metadata>
author: <also for the metadata>

highlighter: pygments
exclude: ["node_modules", "gulpfile.js", "package.json", 'README.md']
```

### For the source

[For the source] (https://github.com/jacoblane/jekyll-baseline)
