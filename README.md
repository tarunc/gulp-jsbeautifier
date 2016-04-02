# gulp-jsbeautifier
[![Build Status](https://travis-ci.org/tarunc/gulp-jsbeautifier.png?branch=master)](https://travis-ci.org/tarunc/gulp-jsbeautifier)
[![NPM version](https://badge.fury.io/js/gulp-jsbeautifier.png)](http://badge.fury.io/js/gulp-jsbeautifier)
[![Coverage Status](https://coveralls.io/repos/tarunc/gulp-jsbeautifier/badge.png)](https://coveralls.io/r/tarunc/gulp-jsbeautifier)
[![Code Climate](https://codeclimate.com/github/tarunc/gulp-jsbeautifier.png)](https://codeclimate.com/github/tarunc/gulp-jsbeautifier)
[![Dependencies](https://david-dm.org/tarunc/gulp-jsbeautifier.png)](https://david-dm.org/tarunc/gulp-jsbeautifier)
[![devDependency Status](https://david-dm.org/tarunc/gulp-jsbeautifier/dev-status.png)](https://david-dm.org/tarunc/gulp-jsbeautifier#info=devDependencies)

> Prettify JavaScript, JSON, HTML and CSS.  
[jsbeautifier.org](http://jsbeautifier.org/) for gulp.

## Install
```sh
npm install --save-dev gulp-jsbeautifier
```

## Basic Usage
```javascript
var gulp = require('gulp');
var prettify = require('gulp-jsbeautifier');

gulp.task('prettify', function() {
  gulp.src(['./*.css', './*.html', './*.js'])
    .pipe(prettify())
    .pipe(gulp.dest('./dist'));
});
```

## Options
All options are optional.

### Plugin options
#### `css`, `html`, `js`
Type: `Object`  
Default value: `{ file_types: [...] }`

Contains specific "[beautifier options](#beautifier-options)"  for CSS, HTML and JavaScript.

* **`file_types`**  
  Type: `Array`  
  Default value for `css`: `['.css', '.less', '.sass', '.scss']`  
  Default value for `html`: `['.html']`  
  Default value for `js`: `['.js', '.json']`

  Specifies which files should be treated as CSS, HTML or JavaScript.

```javascript
// Specifies that ONLY '*.js' and '.bowerrc' files should be treated as JavaScript.
gulp.task('prettify', function() {
  gulp.src(['./*.js', './*.json', './.bowerrc'])
    .pipe(prettify({
      js: {
        file_types: ['.js', '.bowerrc']
      }
    }))
    .pipe(gulp.dest('./'));
});
```

#### `config`
Type: `String`  
Default value: `null`

If a file is specified, the options defined in it will be loaded.  
Otherwise, gulp-jsbeautifier will looking for a `.jsbeautifyrc` file in [this places](https://www.npmjs.com/package/rc#standards) and if found, load its options.

The file specified and the `.jsbeautifyrc` file must be a valid JSON and can contain all the options of this documentation except `config` and `debug`.

```javascript
// Use options specified in './config/jsbeautify.json'.
gulp.task('prettify', function() {
  gulp.src('./*.js')
    .pipe(prettify({
      config: './config/jsbeautify.json'
    }))
    .pipe(gulp.dest('./dist'));
});

// Looking for a '.jsbeautifyrc' file and if found, use its options.
gulp.task('prettify', function() {
  gulp.src('./*.js')
    .pipe(prettify())
    .pipe(gulp.dest('./dist'));
});
```

#### `debug`
Type: `Boolean`  
Default value: `false`

If `false` shows no debug messages.   
If `true` shows useful debug messages.   
If you have difficulty, try setting this to `true` and use the [reporter](#reporter).

```javascript
// Shows debug messages.
gulp.task('prettify', function() {
  gulp.src(['./*.css', './*.html', './*.js'])
    .pipe(prettify({
      debug: true
    }))
    .pipe(gulp.dest('./dist'));
});
```

### Beautifier options
The "beautifier options" are the same underscored options used by js-beautify.  
See the [js-beautify docs](https://github.com/beautify-web/js-beautify) for a list of them.

All "beautifier options" placed in the root, are applied to CSS, HTML and JavaScript, unless there are no specific ones.

```javascript
// The indentation is 4 for CSS and HTML instead is 2 for JavaScript.
gulp.task('prettify', function() {
  gulp.src(['./*.css', './*.html', './*.js'])
    .pipe(prettify({
      indent_level: 4,
      js: {
        indent_level: 2
      }
    }))
    .pipe(gulp.dest('./dist'));
});
```

The options given through parameters in gulp are merged with those given through files.  
The merge order is: default values, configuration file, parameters.  
Subsequent options overwrite the previous ones.

```javascript
// 'config.json'
// 4 spaces indentation for CSS and HTML.
// 2 spaces indentation for JavaScript.
{
  "indent_size": 4,
  "indent_char": ' ',
  // other options
  "js": {
    // other options
    "indent_size": 2
  }
}

// Overwrite the indentation specified in 'config.json' with
// one tab indentation for all CSS, HTML and JavaScript.
// All other options in 'config.json' are maintained.
gulp.task('prettify', function() {
  gulp.src('./*.css', './*.html', './*.js')
    .pipe(prettify({
      config: './config.json',
      indent_char: '\t',
      indent_size: 1
    }))
    .pipe(gulp.dest('./'));
});
```
## Reporter
Lists files that have been beautified, those already beautified and those that cannot be beautified.

```javascript
var gulp = require('gulp');
var prettify = require('gulp-jsbeautifier');

gulp.task('prettify', function() {
  gulp.src(['./*.css', './*.html', './*.js'])
    .pipe(prettify())
    .pipe(prettify.reporter())
    .pipe(gulp.dest('./'));
});
```

## Other
Older options `mode` and `showDiff` are deprecated.  
Their functions are made available by [gulp-diff](https://www.npmjs.com/package/gulp-diff).

```javascript
var gulp = require('gulp');
var prettify = require('gulp-jsbeautifier');
var diff = require('gulp-diff');

// This is the equivalent of older "mode: 'VERIFY_ONLY'" with "showDiff: true".
// The task will fail if at least one file can be beautified.
gulp.task('git-pre-commit', function() {
  gulp.src(['./dist/*.js'])
    .pipe(prettify())
    .pipe(diff())
    .pipe(diff.reporter({
      quiet: false,  // if 'true', is the equivalent of "showDiff: false"
      fail: true
    }));
});
```

## License

(The MIT License)

Copyright (c) 2015-2016 Tarun Chaudhry &lt;opensource@chaudhry.co&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
