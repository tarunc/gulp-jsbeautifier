/*
 * gulp-jsbeautifier
 * https://github.com/tarunc/gulp-jsbeautifier
 * Copyright (c) 2015-2016 Tarun Chaudhry
 * Licensed under the MIT license.
 */

'use strict';

var _ = require('lodash');
var beautify = require('js-beautify');
var fs = require('fs');
var gutil = require('gulp-util');
var path = require('path');
var through = require('through2');
var log = gutil.log;
var PluginError = gutil.PluginError;

var PLUGIN_NAME = 'gulp-jsbeautifier';

function debug(string, show) {
  if (show === true) {
    log(string);
  }
}

function setup(options) {
  var cfg = {
    defaults: {
      config: null,
      debug: false,
      css: {
        file_types: ['.css', '.less', '.sass', '.scss']
      },
      html: {
        file_types: ['.html']
      },
      js: {
        file_types: ['.js', '.json']
      }
    },
    file: {},
    params: {},
    final: {}
  };

  var property;

  // Load 'parameters options'
  _.assign(cfg.params, options);

  // Load 'file options'
  if (cfg.params.config) {
    // Load the configuration file.
    _.assign(cfg.file, JSON.parse(fs.readFileSync(path.resolve(cfg.params.config))));

    debug('Configuration file loaded: ' + JSON.stringify(cfg.params.config), cfg.params.debug);
  } else {
    // Search and load the '.jsbeautifyrc' file
    require('rc')('jsbeautify', cfg.file);

    if (cfg.file.configs) {
      debug('Configuration files loaded:\n' + JSON.stringify(cfg.file.configs, null, 2), cfg.params.debug);
    }

    // Delete properties added by 'rc'
    delete cfg.file._;
    delete cfg.file.configs;
  }

  // Delete properties not used
  delete cfg.file.debug;
  delete cfg.file.config;

  // Merge 'plugin options'
  _.assign(cfg.final, cfg.defaults, cfg.file, cfg.params);

  // Merge 'beautifier options'
  ['css', 'html', 'js'].forEach(function (type) {
    cfg.final[type] = _.assign({}, cfg.defaults[type], cfg.file, cfg.file[type], cfg.params, cfg.params[type]);
  });

  // Delete 'plugin options' from 'beautifier options'
  ['css', 'html', 'js'].forEach(function (type) {
    for (property in cfg.defaults) {
      delete cfg.final[type][property];
    }
  });

  // Delete 'beautifier options' from 'plugin options'
  for (property in cfg.final) {
    if (!cfg.defaults.hasOwnProperty(property)) {
      delete cfg.final[property];
    }
  }

  debug('Configuration used:\n' + JSON.stringify(cfg.final, null, 2), cfg.params.debug);

  return cfg.final;
}

function prettify(options) {
  var config = setup(options);

  return through.obj(function (file, encoding, callback) {
    var oldContent;
    var newContent;
    var type = null;

    if (file.isNull()) {
      callback(null, file);
      return;
    }

    if (file.isStream()) {
      callback(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
      return;
    }

    // Check if current file should be treated as JavaScript, HTML, CSS or if it should be ignored
    ['js', 'css', 'html'].some(function (value) {
      // Check if at least one element in 'file_types' is suffix of file basename
      if (config[value].file_types.some(function (suffix) {
        return _.endsWith(path.basename(file.path), suffix);
      })) {
        type = value;
        return true;
      }

      return false;
    });

    // Initialize properties for reporter
    file.jsbeautify = {};
    file.jsbeautify.type = type;
    file.jsbeautify.beautified = false;

    if (type) {
      oldContent = file.contents.toString('utf8');
      newContent = beautify[type](oldContent, config[type]);

      if (oldContent.toString() !== newContent.toString()) {
        file.contents = new Buffer(newContent);
        file.jsbeautify.beautified = true;
      }
    }

    callback(null, file);
  });
}

function reporter() {
  return through.obj(function (file, encoding, callback) {
    if (file.jsbeautify) {
      if (file.jsbeautify.type === null) {
        log('Cannot beautify ' + gutil.colors.cyan(file.relative));
      } else {
        if (file.jsbeautify.beautified === true) {
          log('Beautified ' + gutil.colors.cyan(file.relative) + ' [' + file.jsbeautify.type + ']');
        } else {
          log('Already beautified ' + gutil.colors.cyan(file.relative) + ' [' + file.jsbeautify.type + ']');
        }
      }
    }

    callback(null, file);
  });
}

// Exporting the plugin functions
module.exports = prettify;
module.exports.reporter = reporter;
