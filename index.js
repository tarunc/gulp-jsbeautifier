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

function prettify(options) {
  options = options || {};

  function debug(string) {
    if (options.debug === true) {
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

    // Load 'params' options
    _.assign(cfg.params, options);

    // Load 'file' options
    try {
      if (cfg.params.config) {
        // Load the configuration file.
        _.assign(cfg.file, JSON.parse(fs.readFileSync(path.resolve(cfg.params.config))));

        debug("Configuration file loaded: " + JSON.stringify(cfg.params.config));
      } else {
        // Search and load the '.jsbeautifyrc' file
        require('rc')('jsbeautify', cfg.file);

        if (cfg.file.configs) {
          debug("Configuration files loaded:\n" + JSON.stringify(cfg.file.configs, null, 2));
        }

        // Delete properties added by 'rc'
        delete cfg.file._;
        delete cfg.file.configs;
      }
    } catch (err) {
      throw new PluginError(PLUGIN_NAME, err, {
        showStack: true
      });
    }

    // Delete properties not used
    delete cfg.file.debug;
    delete cfg.file.config;

    // Merge plugin options
    _.assign(cfg.final, cfg.defaults, cfg.file, cfg.params);

    // Merge beautifier options
    cfg.final.css = _.assign({}, cfg.defaults.css, cfg.file, cfg.file.css, cfg.params, cfg.params.css);
    cfg.final.html = _.assign({}, cfg.defaults.html, cfg.file, cfg.file.html, cfg.params, cfg.params.html);
    cfg.final.js = _.assign({}, cfg.defaults.js, cfg.file, cfg.file.js, cfg.params, cfg.params.js);

    // Delete plugin options from beautifier options
    for (var property in cfg.defaults) {
      delete cfg.final.css[property];
      delete cfg.final.html[property];
      delete cfg.final.js[property];
    }

    // Delete beautifier options from plugin options
    for (var property in cfg.final) {
      if (!(property in cfg.defaults))
        delete cfg.final[property];
    }

    return cfg.final;
  }

  var config = setup(options);
  debug("Configuration used:\n" + JSON.stringify(config, null, 2));

  return through.obj(function(file, encoding, callback) {

    if (file.isNull()) {
      callback(null, file);
      return;
    }

    if (file.isStream()) {
      callback(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
      return;
    }

    var oldContent = file.contents.toString('utf8');
    var type = null;

    // Check if the file should be treated as JavaScript, HTML or CSS
    ['js', 'css', 'html'].some(function(value) {
      if (config[value].file_types.some(function(ext) {
          return _.endsWith(file.basename, ext);
        })) {
        type = value;
        return true;
      }
    });

    // Initialize properties for reporter
    file.jsbeautify = {};
    file.jsbeautify.type = type;
    file.jsbeautify.beautified = false;

    if (type) {
      var newContent = beautify[type](oldContent, config[type]);

      file.contents = new Buffer(newContent);

      if (oldContent.toString() !== newContent.toString()) {
        file.jsbeautify.beautified = true;
      }
    }

    callback(null, file);
  });
}

function reporter() {
  return through.obj(function(file, encoding, callback) {
    if (file.hasOwnProperty('jsbeautify')) {
      if (file.jsbeautify.type === null) {
        log('File type not specified for', gutil.colors.cyan(file.relative));
      } else if (file.jsbeautify.beautified === true) {
        log('Beautified', gutil.colors.cyan(file.relative), '[' + file.jsbeautify.type + ']');
      } else {
        log('Already beautified', gutil.colors.cyan(file.relative), '[' + file.jsbeautify.type + ']');
      }
    }

    callback(null, file);
  });
};

// Exporting the plugin functions
module.exports = prettify;
module.exports.reporter = reporter;
