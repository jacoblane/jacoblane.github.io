---
layout: post
title: Creating a Rework Plugin, Part 2
date: 2015-03-04
keywords: rework
published: false
---

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
