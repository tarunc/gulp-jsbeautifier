var beautify = require('../');
var gutil = require('gulp-util');
var path = require('path');
var should = require('should');

var contents = {
  css: {
    fixture: '#foo.bar{height:100px;width:100px;}',
    expected: '#foo.bar {\n    height: 100px;\n    width: 100px;\n}'
  },
  html: {
    fixture: '<!DOCTYPE html><html><head><title></title></head><body></body></html>',
    expected: '<!DOCTYPE html>\n<html>\n\n<head>\n    <title></title>\n</head>\n\n<body></body>\n\n</html>'
  },
  js: {
    fixture: 'var foo={bar:1,baz:2};',
    expected: 'var foo = {\n    bar: 1,\n    baz: 2\n};'
  }
}

var files1 = [{
  name: 'file.css',
  contents: contents.css,
  type: 'css'
}, {
  name: 'file.html',
  contents: contents.html,
  type: 'html'
}, {
  name: 'file.js',
  contents: contents.js,
  type: 'js'
}];

var files2 = [{
  name: 'file.css.erb',
  contents: contents.css,
  type: 'css'
}, {
  name: 'file.html.erb',
  contents: contents.html,
  type: 'html'
}, {
  name: 'file.js.erb',
  contents: contents.js,
  type: 'js'
}];

function newVinyl(filename, contents) {
  var base = path.join(__dirname, 'fixtures');
  var filePath = path.join(base, filename);

  return new gutil.File({
    cwd: __dirname,
    base: base,
    path: filePath,
    contents: contents
  });
};

describe('Test reporter', function() {
  files1.forEach(function(file) {
    it('should report \'Beautified\' for \'' + file.name + '\'', function(done) {
      var stream = beautify();
      var vinylFile = newVinyl(file.name, new Buffer(file.contents.fixture));

      stream.on('error', done);
      stream.on('data', function(newFile) {
        should.exist(newFile);
        should.exist(newFile.path);
        should.exist(newFile.relative);
        should.exist(newFile.contents);
        should.exist(newFile.jsbeautify.beautified);
        should.exist(newFile.jsbeautify.type);
        should.equal(newFile.path, path.join(__dirname, 'fixtures', file.name));
        should.equal(newFile.relative, file.name);
        should.equal(newFile.contents.toString(), file.contents.expected);
        should.equal(newFile.jsbeautify.beautified, true);
        should.equal(newFile.jsbeautify.type, file.type);
        done();
      });
      stream.write(vinylFile);
    });
  });

  files1.forEach(function(file) {
    it('should report \'Equal\' for \'' + file.name + '\'', function(done) {
      var stream = beautify();
      var vinylFile = newVinyl(file.name, new Buffer(file.contents.expected));

      stream.on('error', done);
      stream.on('data', function(newFile) {
        should.exist(newFile);
        should.exist(newFile.path);
        should.exist(newFile.relative);
        should.exist(newFile.contents);
        should.exist(newFile.jsbeautify.beautified);
        should.exist(newFile.jsbeautify.type);
        should.equal(newFile.path, path.join(__dirname, 'fixtures', file.name));
        should.equal(newFile.relative, file.name);
        should.equal(newFile.contents.toString(), file.contents.expected);
        should.equal(newFile.jsbeautify.beautified, false);
        should.equal(newFile.jsbeautify.type, file.type);
        done();
      });
      stream.write(vinylFile);
    });
  });

  files2.forEach(function(file) {
    it('should report \'File type not specified\' for \'' + file.name + '\'', function(done) {
      var stream = beautify();
      var vinylFile = newVinyl(file.name, new Buffer(file.contents.fixture));

      stream.on('error', done);
      stream.on('data', function(newFile) {
        should.exist(newFile);
        should.exist(newFile.path);
        should.exist(newFile.relative);
        should.exist(newFile.contents);
        should.exist(newFile.jsbeautify.beautified);
        should.equal(newFile.path, path.join(__dirname, 'fixtures', file.name));
        should.equal(newFile.relative, file.name);
        should.equal(newFile.contents.toString(), file.contents.fixture);
        should.equal(newFile.jsbeautify.beautified, false);
        should.equal(newFile.jsbeautify.type, null);
        done();
      });
      stream.write(vinylFile);
    });
  });
});
