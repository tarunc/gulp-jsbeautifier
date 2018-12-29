const beautify = require('js-beautify');
const colors = require('ansi-colors');
const cosmiconfig = require('cosmiconfig');
const log = require('fancy-log');
const mergeWith = require('lodash.mergewith');
const path = require('path');
const PluginError = require('plugin-error');
const through = require('through2');

const PLUGIN_NAME = 'gulp-jsbeautifier';

/**
 * Merge options from different sources
 * @param  {Object} pluginOptions The gulp-jsbeautifier options
 * @return {Object} The options
 */
function mergeOptions(pluginOptions) {
  const defaultOptions = {
    config: null,
    debug: false,
    css: {
      file_types: ['.css', '.less', '.sass', '.scss'],
    },
    html: {
      file_types: ['.html'],
    },
    js: {
      file_types: ['.js', '.json'],
    },
  };

  // Load 'file options'
  const explorer = cosmiconfig('jsbeautify');
  let explorerResult;

  if (pluginOptions && pluginOptions.config) {
    explorerResult = explorer.loadSync(path.resolve(pluginOptions.config));
  } else {
    explorerResult = explorer.searchSync();
  }

  let fileOptions;
  if (explorerResult) {
    fileOptions = explorerResult.config;
  }

  // Merge options
  const finalOptions = mergeWith({}, defaultOptions, fileOptions, pluginOptions, (objValue, srcValue) => {
    if (Array.isArray(objValue)) {
      return objValue.concat(srcValue);
    }

    return undefined;
  });

  // Show debug messages
  if (finalOptions.debug) {
    if (fileOptions) {
      log(`File options:\n${JSON.stringify(fileOptions, null, 2)}`);
    }

    log(`Final options:\n${JSON.stringify(finalOptions, null, 2)}`);
  }

  // Delete properties not used
  delete finalOptions.config;
  delete finalOptions.debug;

  return finalOptions;
}

/**
 * Beautify files or perform validation
 * @param  {Object} pluginOptions The gulp-jsbeautifier parameter options
 * @param  {boolean} doValidation Specifies whether perform validation only
 * @return {Object} The object stream
 */
function helper(pluginOptions, doValidation) {
  const options = mergeOptions(pluginOptions);

  return through.obj((file, encoding, callback) => {
    let oldContent;
    let newContent;
    let type = null;

    if (file.isNull()) {
      callback(null, file);
      return;
    }

    if (file.isStream()) {
      callback(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
      return;
    }

    // Check if current file should be treated as JavaScript, HTML, CSS or if it should be ignored
    ['js', 'css', 'html'].some((value) => {
      // Check if at least one element in 'file_types' is suffix of file basename
      if (options[value].file_types.some(suffix => path.basename(file.path).endsWith(suffix))) {
        type = value;
        return true;
      }

      return false;
    });

    // Initialize properties for reporter
    file.jsbeautify = {};
    file.jsbeautify.type = type;
    file.jsbeautify.beautified = false;
    file.jsbeautify.canBeautify = false;

    if (type) {
      oldContent = file.contents.toString('utf8');
      newContent = beautify[type](oldContent, options);

      if (oldContent.toString() !== newContent.toString()) {
        if (doValidation) {
          file.jsbeautify.canBeautify = true;
        } else {
          file.contents = Buffer.from(newContent);
          file.jsbeautify.beautified = true;
        }
      }
    }

    callback(null, file);
  });
}

/**
 * Beautify files
 * @param  {Object} options The gulp-jsbeautifier parameter options
 * @return {Object} The object stream with beautified files
 */
const plugin = options => helper(options, false);

/**
 * Perform the validation of files without changing their content
 * @param  {Object} options The gulp-jsbeautifier parameter options
 * @return {Object} The object stream
 */
plugin.validate = options => helper(options, true);

/**
 * Show results of beautification or validation
 * @param  {Object} options The gulp-jsbeautifier reporter options
 * @return {Object} The object stream
 */
plugin.reporter = (options) => {
  let verbosity = 0;
  let errorCount = 0;

  if (typeof options === 'object' && Object.prototype.hasOwnProperty.call(options, 'verbosity')) {
    ({ verbosity } = options);
  }

  return through.obj((file, encoding, callback) => {
    if (file.jsbeautify) {
      if (verbosity >= 1 && file.jsbeautify.type === null) {
        log(`Can not beautify ${colors.cyan(file.relative)}`);
      } else if (verbosity >= 0 && file.jsbeautify.beautified) {
        log(`Beautified ${colors.cyan(file.relative)} [${file.jsbeautify.type}]`);
      } else if (verbosity >= 0 && file.jsbeautify.canBeautify) {
        errorCount += 1;
        log(`Can beautify ${colors.cyan(file.relative)} [${file.jsbeautify.type}]`);
      } else if (verbosity >= 1) {
        log(`Already beautified ${colors.cyan(file.relative)} [${file.jsbeautify.type}]`);
      }
    }

    callback(null, file);
  }, function flush(callback) {
    if (errorCount > 0) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'Validation not passed. Please beautify.'));
    }
    callback();
  });
};

plugin.report = {
  BEAUTIFIED: 0,
  ALL: 1,
};

module.exports = plugin;
