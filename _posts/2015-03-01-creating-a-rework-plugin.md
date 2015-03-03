---
layout: post
title: Creating a Rework Plugin
date: 2015-03-01
keywords: rework
published: false
---

### What is rework?

[Rework] (https://github.com/reworkcss/rework) is a CSS preprocessor [initiated] (http://tjholowaychuk.tumblr.com/post/44267035203/modular-css-preprocessing-with-rework) by TJ Holowaychuk. It can be used along side other preprocessors like SASS and LESS or on its own. The benefits of using Rework over another preprocessor include: speed, its pretty darn quick; flexibility/modularity, you can use only the modules you want, or create a new one if you need; and it works with plain old CSS, meaning no need to learn another language.

### Abstract Syntax Tree (AST)

Basically Rework takes an input CSS string and turns it into an [abstract syntax tree (AST)] (http://en.wikipedia.org/wiki/Abstract_syntax_tree) which is given to a series of plugins. Each plugin works some magic on this AST and then hands back the AST for the next plugin. Once each plugin has done its work, the AST is reconstructed into CSS and voila, rainbows and ponies.

So what the hell is an AST? In short, and for our purposes here, it is structured representation of a CSS string that can easily traversed and manipulated.

Let's take this one step at a time. Rework uses node, so assuming we have both of these available, this simple code will start to give us a sense of how this works.

```javascript
var rework = include('Rework');
var inputCss = '.special-text { color: red; }';

var outputCss = rework(inputCss) // this transforms our css into an AST
  .toString(); // this transforms it back to CSS

// we didn't actually hand the AST to any plugins
// so input and output are the same
// except for a bit of formatting
console.log(outputCss);

```

Now let's jump right in and create a plugin that will help us get a better understanding of the AST.

```javascript
var rework = include('Rework');
var inputCss = '.special-text { color: red; }';
var outputCss;

// a super simple Rework plugin
function printAST() {
  return function(ast) {
    console.log(JSON.stringify(ast, null, 2));
  }
}

outputCss = rework(inputCss)
  .use(printAST()) // plugins are passed in through the 'use' method
  .toString();
```

Tada, we created a Rework plugin called `printAST`. All it does is print the AST to the terminal, which in this case looks like:

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

A plugin can traverse this AST and make changes. This new AST is then handed off to the next plugin in line. Let's create another simple plugin that actually makes some changes...

### A basic plugin

Let's say we've written a new CSS framework, called "Rework-It!", that we want to use alongside some legacy CSS. To avoid any conflicting rules we want to namespace all our selectors in the new framework. For example, if we have a selector like `.button`, we want to namespace it like so `.rework-it-button`. Instead of going back to the source and manually adding this namespace, let's create a Rework plugin to do this as part of our build process.

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

Our plugin goes through each rule and mutates the selectors replacing `.` with `.rework-it-`. There are a bunch of available plugins at [npmjs.com] (https://www.npmjs.com/search?q=rework).

### Packaging our plugin

Though it's possible to define our plugin as just another function, it makes more sense to package it up as a stand-alone module, which can easily be reused, tested, and distributed. For our package we'll need a few files, package.json (which is easily created using `npm init`), and index.js (where our code will live).


### Test with travis

### Share with npm


### Helpful links
