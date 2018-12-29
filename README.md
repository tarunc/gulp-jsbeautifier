# gulp-jsbeautifier

[![Build Status](https://travis-ci.org/tarunc/gulp-jsbeautifier.svg?branch=master)](https://travis-ci.org/tarunc/gulp-jsbeautifier)
[![npm version](https://badge.fury.io/js/gulp-jsbeautifier.svg)](https://badge.fury.io/js/gulp-jsbeautifier)
[![Coverage Status](https://coveralls.io/repos/github/tarunc/gulp-jsbeautifier/badge.svg?branch=master)](https://coveralls.io/github/tarunc/gulp-jsbeautifier?branch=master)
[![Code Climate](https://codeclimate.com/github/tarunc/gulp-jsbeautifier/badges/gpa.svg)](https://codeclimate.com/github/tarunc/gulp-jsbeautifier)
[![Dependency Status](https://david-dm.org/tarunc/gulp-jsbeautifier.svg)](https://david-dm.org/tarunc/gulp-jsbeautifier)
[![devDependency Status](https://david-dm.org/tarunc/gulp-jsbeautifier/dev-status.svg)](https://david-dm.org/tarunc/gulp-jsbeautifier#info=devDependencies)

> Beautifier for JavaScript, JSON, HTML and CSS.\
[js-beautify](https://beautifier.io/) for gulp.

## Install

```sh
npm install --save-dev gulp-jsbeautifier
```

## Basic Usage

```javascript
const gulp = require('gulp');
const beautify = require('gulp-jsbeautifier');

gulp.task('beautify', () =>
  gulp.src(['./*.css', './*.html', './*.js'])
    .pipe(beautify())
    .pipe(gulp.dest('./dist'))
);
```

## Options

All options are optional.

### Plugin options

#### `css`, `html`, `js`

Type: `Object`\
Default value: `{ file_types: [...] }`

Contains specific _[beautifier options](#beautifier-options)_ for CSS, HTML and JavaScript.

* **`file_types`**\
  Type: `Array`\
  Default value for `css`: `['.css', '.less', '.sass', '.scss']`\
  Default value for `html`: `['.html']`\
  Default value for `js`: `['.js', '.json']`

  Specifies which files should be treated as CSS, HTML or JavaScript.

```javascript
// In addition to the default file_types, the '.eslintrc' file is also considered as JavaScript.
gulp.task('beautify', () =>
  gulp.src(['./*.js', './*.json', './.eslintrc'])
    .pipe(beautify({
      js: {
        file_types: ['.eslintrc']
      }
    }))
    .pipe(gulp.dest('./dist'))
);
```

#### `config`

Type: `String`  
Default value: `null`

If you provide a path to a configuration file, the options defined in it will be loaded.\
Otherwise, a configuration file will be automatically searched as explained in [cosmiconfig docs](https://github.com/davidtheclark/cosmiconfig#cosmiconfig).

The configuration file must be a valid JSON or YAML and can contain all the options of this documentation except `config` (it will be ignored).

```javascript
// Use options loaded from './config/jsbeautify.json'.
gulp.task('beautify', () =>
  gulp.src('./*.js')
    .pipe(beautify({
      config: './config/jsbeautify.json'
    }))
    .pipe(gulp.dest('./dist'))
);

// Use options automatically loaded from './jsbeautifyrc'.
gulp.task('beautify', () =>
  gulp.src('./*.js')
    .pipe(beautify())
    .pipe(gulp.dest('./dist'))
);
```

#### `debug`

Type: `Boolean`\
Default value: `false`

If `true` lists the options loaded from the configuration file and the final ones.\
if you encounter any problems with the options try to enable it and use the [reporter](#reporter).

```javascript
// Shows debug messages.
gulp.task('beautify', () =>
  gulp.src(['./*.css', './*.html', './*.js'])
    .pipe(beautify({
      debug: true
    }))
    .pipe(gulp.dest('./dist'))
);
```

### Beautifier options

The _beautifier options_ are the same underscored options used by js-beautify and use the same setting inheritance.\
See the [js-beautify docs](https://github.com/beautify-web/js-beautify) for a list of them.

```javascript
// The indentation is 4 spaces for CSS and HTML, it's 1 tab for JavaScript.
gulp.task('beautify', () =>
  gulp.src(['./*.css', './*.html', './*.js'])
    .pipe(beautify({
      indent_size: 4,
      js: {
        indent_char: '\t',
        indent_size: 1
      }
    }))
    .pipe(gulp.dest('./dist'))
);
```

The options provided as a parameter in gulp will be merged with those in the configuration file.\
The merge order is: default values, configuration file, parameters.\
Subsequent options overwrite the previous ones.

```javascript
// 'config.json'
// 4 spaces indentation for CSS and HTML.
// 1 tab indentation for JavaScript.
{
  "indent_char": " ",
  "indent_size": 4,
  "js": {
    "indent_char": "\t",
    "indent_size": 1
  }
}

// Overwrite the indentation defined in 'config.json' with 2 tab for CSS and HTML.
// JavaScript files continue to mantain 1 tab indentation.
gulp.task('beautify', () =>
  gulp.src(['./*.css', './*.html', './*.js'])
    .pipe(beautify({
      config: './config.json',
      indent_char: '\t',
      indent_size: 2
    }))
    .pipe(gulp.dest('./dist'))
);

// Options resulting after merge (only the relevant parts).
{
    "indent_char": "\t",
    "indent_size": 2,
    "js": {
      "indent_char": "\t",
      "indent_size": 1
    }
}
```

## Validate

Checks if it is possible to beautify some files.\
The reporter is responsible for displaying the validate results and will emit an error before
the stream ends if a file could be beautified.

```javascript
var gulp = require('gulp');
var beautify = require('gulp-jsbeautifier');

gulp.task('beautify', () =>
  gulp.src(['./*.css', './*.html', './*.js'])
    .pipe(beautify.validate())
    .pipe(beautify.reporter())
);
```

## Reporter

Lists files that have been beautified, those already beautified, and those that can not be beautified.\
If the [validate](#validate) feature is used, the reporter lists files that can be beautified and emits an error before the stream ends if such a file was detected.

```javascript
var gulp = require('gulp');
var beautify = require('gulp-jsbeautifier');

gulp.task('beautify', () =>
  gulp.src(['./*.css', './*.html', './*.js'])
    .pipe(beautify())
    .pipe(beautify.reporter())
    .pipe(gulp.dest('./dist'))
);
```

### Reporter options

#### `verbosity`

Type: `number`\
Default value: `beautify.report.BEAUTIFIED`\
Other values: `beautify.report.ALL`

With _BEAUTIFIED_ value, the reporter lists only beautified files (or those that can be beautified in the case of validate).  
With _ALL_ value, the reporter also lists the other files.

```javascript
var gulp = require('gulp');
var beautify = require('gulp-jsbeautifier');

gulp.task('beautify', () =>
  gulp.src(['./*.css', './*.html', './*.js'])
    .pipe(beautify())
    .pipe(beautify.reporter({
      verbosity: beautify.report.ALL
    }))
    .pipe(gulp.dest('./dist'))
);
```

## License

`gulp-jsbeautifier` is released under the [MIT License](./LICENSE.md).
