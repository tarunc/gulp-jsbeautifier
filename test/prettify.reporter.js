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
};

describe('prettify.reporter()', function () {
  beforeEach(function () {
    sinon.spy(console, 'log');
  });

  afterEach(function () {
    console.log.restore();
  });

  it('should ignore file when file.isNull()', function (done) {
    var stream = beautify.reporter();
    var vinylFile = newVinyl('nullfile', null);

    stream.on('error', done);
    stream.on('data', function (newFile) {
      expect(newFile).to.exist;
      expect(newFile.path).to.exist;
      expect(newFile.path.toString()).to.equal(path.join(__dirname, 'fixtures', 'nullfile'));
      expect(newFile.relative).to.exist;
      expect(newFile.relative.toString()).to.equal('nullfile');
      expect(newFile.contents).to.be.null;
      expect(newFile.jsbeautify).to.be.undefined;
      done();
    });
    stream.write(vinylFile);
  });

  it('should emit error when file.isStream()', function (done) {
    var stream = beautify.reporter();
    var vinylFile = {
      isNull: function () {
        return false;
      },
      isStream: function () {
        return true;
      }
    };

    stream.on('error', function (err) {
      expect(err.message).to.exist;
      expect(err.message).to.equal('Streaming not supported');
      done();
    });
    stream.write(vinylFile);
  });

  it('should report which files have been beautified.', function (done) {
    var stream = beautify.reporter();
    var vinylFile = newVinyl('file.js', new Buffer(''));
    vinylFile.jsbeautify = {};
    vinylFile.jsbeautify.type = 'js';
    vinylFile.jsbeautify.beautified = true;

    stream.on('error', done);
    stream.on('data', function (newFile) {
      expect(console.log.calledOnce).to.be.true;
      expect(console.log.calledWithExactly('Beautified ' + gutil.colors.cyan('file.js') + ' [js]')).to.be.true;
      done();
    });
    stream.write(vinylFile);
  });

  it('should report which files are already beautified.', function (done) {
    var stream = beautify.reporter();
    var vinylFile = newVinyl('file.js', new Buffer(''));
    vinylFile.jsbeautify = {};
    vinylFile.jsbeautify.type = 'js';
    vinylFile.jsbeautify.beautified = false;

    stream.on('error', done);
    stream.on('data', function (newFile) {
      expect(console.log.calledOnce).to.be.true;
      expect(console.log.calledWithExactly('Already beautified ' + gutil.colors.cyan('file.js') + ' [js]')).to.be.true;
      done();
    });
    stream.write(vinylFile);
  });

  it('should report which files can not be beautified.', function (done) {
    var stream = beautify.reporter();
    var vinylFile = newVinyl('file.js', new Buffer(''));
    vinylFile.jsbeautify = {};
    vinylFile.jsbeautify.type = null;
    vinylFile.jsbeautify.beautified = true;

    stream.on('error', done);
    stream.on('data', function (newFile) {
      expect(console.log.calledOnce).to.be.true;
      expect(console.log.calledWithExactly('Cannot beautify ' + gutil.colors.cyan('file.js'))).to.be.true;
      done();
    });
    stream.write(vinylFile);
  });
});
