# gulp-jsbeautifier
[![Build Status](https://travis-ci.org/tarunc/gulp-jsbeautifier.png?branch=master)](https://travis-ci.org/tarunc/gulp-jsbeautifier)
[![NPM version](https://badge.fury.io/js/gulp-jsbeautifier.png)](http://badge.fury.io/js/gulp-jsbeautifier)

> Prettify JavaScript, HTML, CSS, and JSON.

[jsbeautifier.org](http://jsbeautifier.org/) for gulp

## Getting Started
Install the module with: `npm install --save-dev gulp-jsbeautifier`

## Usage

```js
var gulp = require('gulp');
var prettify = require('gulp-jsbeautifier');

gulp.task('git-pre-js', function() {
  gulp.src('./src/foo.js', './src/bar.json')
    .pipe(prettify({indentSize: 2, config: '.jsbeautifyrc', mode: 'VERIFY_ONLY'}))
});

gulp.task('format-js', function() {
  gulp.src('./src/foo.js', './src/bar.json')
    .pipe(prettify({indentSize: 2, config: '.jsbeautifyrc', mode: 'VERIFY_AND_WRITE'}))
});

gulp.task('prettify-html', function() {
  gulp.src('./src/foo.html')
    .pipe(prettify({indentSize: 2}))
    .pipe(gulp.folder('./dist/foo.html'))
});

gulp.task('prettify-css', function() {
  gulp.src('./src/foo.css')
    .pipe(prettify({indentSize: 2}))
    .pipe(gulp.folder('./dist/foo.css'))
});
```
Other examples are in the [example folder.](http://github.com/tarunc/gulp-jsbeautifier/tree/master/examples)

See the [js-beautify docs](https://github.com/einars/js-beautify) for options.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality.

## License

(The MIT License)

Copyright (c) 2014 Tarun Chaudhry &lt;tarunc92@gmail.com&gt;

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
