---
layout: post
title: "Creating a Rework Plugin, Part 2"
date: {}
keywords: rework
published: false
---

Continuing from a [previous post] (2015/03/01/creating-a-rework-plugin-part-1.html) that covered the basics of [Rework] (https://github.com/reworkcss/rework) and how plugins manipulate CSS using an AST, this post will take the next step and create a new plugin, package it up, and publish it to [npm] (http://npmjs.com).

### Quick review

Rework is a CSS preprocessor. You give it a string of CSS, call whatever plugins you want to manipulate this CSS, and finally recreate a new CSS string.

Perhaps "preprocessor" is the wrong word. It comes before the final CSS, but after its input. Maybe Rework is better labeled simply a CSS "processor".

### Plugin basics

Each plugin is called with Rework's `use` method. Looking at Rework's source, we can see how this works:

```js
Rework.prototype.use = function(fn){
  fn(this.obj.stylesheet, this);
  return this;
};
```

So basically a plugin is just a simple function which Rework calls, passing `this.obj.stylesheet` (which is just the `stylesheet` propoerty of the full AST representation of the input CSS), and the Rework instance itself (i.e. `this`).

An example would look something like:

```js

var newCss = rework('.special-text { color: red; }')
  .use(fakePlugin1)
  .use(fakePlugin2(args))
  .toString();

```

Straighforward, right? But why does the the first plugin, `fakePlugin1` look a bit different from the second, `fakePlugin2(args)`. Bacially, `fakePlugin2` is a closure, which is to say, a function that returns a function. Rework is written in javascript, so no surprise we would find closures.

This is difference is not entirely trivial. If you try to use a closure-style plugin without the '()', it will not work. Most Rework plugins (annecodally at least) are closures, and thus require the parens.

### Packaging our plugin

Though it's possible to define our plugin as just another function, it makes more sense to package it up as a stand-alone module, which can easily be reused, tested, and distributed. Let's create a new plugin, 'rework-blink', that recreates the blink tag, to show how this works.

We're going to need an package.json manifest file, easily created using `npm init`.

We'll need the css module, so let's download it and add it t our package.json file:

```bash
npm install css --save-dev
```

Our index.js file, where the actual plugin code will live, will look like this:

```js
var css = require('css');
var blinkCss = '@keyframes blinky {  50% { opacity: 0; } }';

function blink() {
  return function(ast) {
    // create and add the AST css for the blink keyframe
    ast.rules = ast.rules.concat(css.parse(blinkCss).stylesheet.rules);
    // replace the "blink: it;" css declaration
    ast.rules = ast.rules.map(function(rule){
      if(!rule.declarations) { return rule; }
      rule.declarations = rule.declarations.map(function(declaration) {
        if(declaration.property === 'blink' && declaration.value === 'it') {
          declaration.property = 'animation';
          declaration.value = 'blinky 1.5s step-end infinite';
        }
        return declaration;
      });
      return rule;
    });
  }
}
```

Ok, now we can write a CSS rule like `.blink { blink: it; }` to create a blink effect.


### Test with travis

### Share with npm


### Helpful links