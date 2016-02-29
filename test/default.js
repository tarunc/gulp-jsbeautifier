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
  contents: contents.css
}, {
  name: 'file.html',
  contents: contents.html
}, {
  name: 'file.js',
  contents: contents.js
}];

var files2 = [{
  name: 'file.css.erb',
  contents: contents.css
}, {
  name: 'file.html.erb',
  contents: contents.html
}, {
  name: 'file.js.erb',
  contents: contents.js
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

describe('With the default options', function() {
  files1.forEach(function(file) {
    it('should beautify \'' + file.name + '\'', function(done) {
      var stream = beautify();
      var vinylFile = newVinyl(file.name, new Buffer(file.contents.fixture));

      stream.on('error', done);
      stream.on('data', function(newFile) {
        should.exist(newFile);
        should.exist(newFile.path);
        should.exist(newFile.relative);
        should.exist(newFile.contents);
        should.equal(newFile.path, path.join(__dirname, 'fixtures', file.name));
        should.equal(newFile.relative, file.name);
        should.equal(newFile.contents.toString(), file.contents.expected);
        done();
      });
      stream.write(vinylFile);
    });
  });

  files2.forEach(function(file) {
    it('should not beautify \'' + file.name + '\'', function(done) {
      var stream = beautify();
      var vinylFile = newVinyl(file.name, new Buffer(file.contents.fixture));

      stream.on('error', done);
      stream.on('data', function(newFile) {
        should.exist(newFile);
        should.exist(newFile.path);
        should.exist(newFile.relative);
        should.exist(newFile.contents);
        should.equal(newFile.path, path.join(__dirname, 'fixtures', file.name));
        should.equal(newFile.relative, file.name);
        should.equal(newFile.contents.toString(), file.contents.fixture);
        done();
      });
      stream.write(vinylFile);
    });
  });
});
