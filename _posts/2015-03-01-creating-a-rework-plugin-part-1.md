---
layout: post
title: Creating a Rework Plugin, Part 1
date: 2015-03-01
keywords: rework
published: true
---

### What is rework?

[Rework] (https://github.com/reworkcss/rework) is a CSS preprocessor [initiated] (http://tjholowaychuk.tumblr.com/post/44267035203/modular-css-preprocessing-with-rework) by TJ Holowaychuk. It is written in javascript and runs on [node] (http://nodejs.org). It's super fast, simple or complex, depending on your needs, and easy to extend to accomodate all sorts of CSS processing. Via node's package manager [npm](https://www.npmjs.com/search?q=rework) a variety of Rework plugins are available for color manipulation, variable assignments, selector inheritance, etc.

The core idea behind Rework is simply to take some CSS, manipulate it, then create some new CSS. Because of this other preprocessors, like [SASS] () or [LESS] (), play nice with Rework. In other words, you can take SASS generated CSS and run it through Rework for additional processing.

### Abstract Syntax Tree (AST)

Pulling back the curtain at bit, the basic concept is to feed Rework a string of CSS, which it transforms into a nicely organized data structure called an [abstract syntax tree (AST)] (http://en.wikipedia.org/wiki/Abstract_syntax_tree). This AST is then successively handed off to the plugins you've select to work some magic. Once the plugins have done their job, the AST is then reconstructed into a new string of CSS and voila. An example implementation looks something like this:

```js

var fs          = require('fs');
var rework      = require('rework');
var fakePlugin1 = require('rework-fake-plugin-1');
var fakePlugin2 = require('rework-fake-plugin-2');

var inputCss    = fs.readFileSync('path/to.css', 'utf8');

var newCss = rework(inputCss)
  .use(fakePlugin1()) // the 'use' method is how plugins are invoked
  .use(fakePlugin2())
  .toString();

fs.writeFileSync('path/to/new.css', newCss);

```

Seems simple enough. You pass `rework` your CSS and then call each plugin with the `use` method, and finally string it back together using `.toString()`. As said above, Rework hands each plugin an AST, not the CSS string, so to understand what each plugin is actually doing we need to get an understanding of the AST.

OK, so what the hell is an AST? In short, and for our purposes here, it is a structured representation of a CSS string that can be easily traversed and manipulated. To see what this looks like let's jump right in and create a plugin that will log the AST to the terminal.

```javascript
var rework = include('Rework');
var inputCss = '.special-text { color: red; }';

// a super simple Rework plugin
function printAST() {
  return function(ast) {
    console.log(JSON.stringify(ast, null, 2));
  }
}

rework(inputCss).use(printAST());
```

Tada, we created a Rework plugin called `printAST`. This is what it console.logged:

```json
{  
   "rules":[  
      {  
         "type":"rule",
         "selectors":[  
            ".special-text"
         ],
         "declarations":[  
            {  
               "type":"declaration",
               "property":"color",
               "value":"red",
               "position":{  
                  "start":{  
                     "line":2,
                     "column":3
                  },
                  "end":{  
                     "line":2,
                     "column":13
                  }
               }
            }
         ],
         "position":{  
            "start":{  
               "line":1,
               "column":1
            },
            "end":{  
               "line":3,
               "column":2
            }
         }
      }
   ]
}

```

The simple css `.special-text { color: red; }` has been converted into something a bit more robot-friendly. The `.special-text` selector (along with the its corresponding delcarations) is now nicely tucked way inside the first `rule` in AST's `rules` property.

Under the hood, Rework is using [css] (https://github.com/reworkcss/css) to parse the CSS and build the AST. Check out the github repo for documentation.

### A basic plugin

Let's create something a bit more useful, that actually changes the CSS. Suppose we've written a new CSS framework, called "Rework-It!", that we want to use alongside some legacy CSS. To avoid any conflicting rules we want to namespace all our selectors in the new framework. For example, if we have a selector like `.button`, we want to namespace it like so `.rework-it-button`. Instead of going back to the source and manually adding this namespace, let's create a Rework plugin to do this as part of our build process.

```javascript
function namespaceReworkIt() {
  return function(ast) {
    ast.rules = ast.rules.map(function(rule) {
      if (!rule.selectors) { return rule; }
      rule.selectors = rule.selectors.map(function(selector) {
        return selector.replace(/\./g,'.rework-it-');
      });
      return rule;
    });
  }
}
```
Rework's `use` method expects a function, which it will pass the AST and the `Rework` instance. So our `namespaceReworkIt` plugin returns a function that accepts the `ast` argument. We don't need the `Rework` instance for this example.

Our plugin recreates the `ast`'s `rules` property. It goes through each `rule` and mutates the `selectors`, replacing `.` with `.rework-it-`. That is all it takes!

This is just a simple and half-backed example. But it does demonstrate how easy it is to create a plugin and start hacking away at your CSS.

For more useful plugins visit [npmjs.com] (https://www.npmjs.com/search?q=rework).
