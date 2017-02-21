var beautify = require('../');
var expect = require('chai').expect;
var gutil = require('gulp-util');
var path = require('path');
var sinon = require('sinon');

function newVinyl(filename, contents) {
  var base = path.join(__dirname, 'fixtures');
  var filePath = path.join(base, filename);

  return new gutil.File({
    cwd: __dirname,
    base: base,
    path: filePath,
    contents: contents
  });
}

describe('prettify.validate()', function () {
  beforeEach(function () {
    sinon.spy(console, 'log');
  });

  afterEach(function () {
    console.log.restore();
  });

  describe('with the default options', function () {
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
    };

    var files = [{
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

    files.forEach(function (file) {
      it('should not edit the content of \'' + file.name + '\'', function (done) {
        var stream = beautify.validate();
        var vinylFile = newVinyl(file.name, new Buffer(file.contents.fixture));

        stream.on('error', done);
        stream.on('data', function (newFile) {
          expect(newFile).to.exist;
          expect(newFile.path).to.exist;
          expect(newFile.path.toString()).to.equal(path.join(__dirname, 'fixtures', file.name));
          expect(newFile.relative).to.exist;
          expect(newFile.relative.toString()).to.equal(file.name);
          expect(newFile.contents).to.exist;
          expect(newFile.contents.toString()).to.equal(file.contents.fixture);
          expect(newFile.jsbeautify).to.exist;
          expect(newFile.jsbeautify.beautified).to.exist;
          expect(newFile.jsbeautify.beautified).to.be.false;
          expect(newFile.jsbeautify.canBeautify).to.exist;
          expect(newFile.jsbeautify.canBeautify).to.be.true;
          expect(newFile.jsbeautify.type).to.exist;
          expect(newFile.jsbeautify.type).to.equal(file.type);
          expect(console.log.called).to.be.false;
          done();
        });
        stream.write(vinylFile);
      });
    });
    files.forEach(function (file) {
      it('should not edit the content of \'' + file.name + '\'', function (done) {
        var stream = beautify.validate();
        var vinylFile = newVinyl(file.name, new Buffer(file.contents.expected));

        stream.on('error', done);
        stream.on('data', function (newFile) {
          expect(newFile).to.exist;
          expect(newFile.path).to.exist;
          expect(newFile.path.toString()).to.equal(path.join(__dirname, 'fixtures', file.name));
          expect(newFile.relative).to.exist;
          expect(newFile.relative.toString()).to.equal(file.name);
          expect(newFile.contents).to.exist;
          expect(newFile.contents.toString()).to.equal(file.contents.expected);
          expect(newFile.jsbeautify).to.exist;
          expect(newFile.jsbeautify.beautified).to.exist;
          expect(newFile.jsbeautify.beautified).to.be.false;
          expect(newFile.jsbeautify.canBeautify).to.exist;
          expect(newFile.jsbeautify.canBeautify).to.be.false;
          expect(newFile.jsbeautify.type).to.exist;
          expect(newFile.jsbeautify.type).to.equal(file.type);
          expect(console.log.called).to.be.false;
          done();
        });
        stream.write(vinylFile);
      });
    });
  });
});
