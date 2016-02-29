var beautify = require('../');
var gutil = require('gulp-util');
var path = require('path');
var should = require('should');

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

describe('Test stream and null contents', function() {
  it('should ignore file when contents isNull()', function(done) {
    var stream = beautify();
    var vinylFile = newVinyl('nullFile.js', null);

    stream.on('error', done);
    stream.on('data', function(newFile) {
      should.exist(newFile);
      should.exist(newFile.path);
      should.exist(newFile.relative);
      should.equal(newFile.path, path.join(__dirname, 'fixtures', 'nullFile.js'));
      should.equal(newFile.relative, 'nullFile.js');
      should.not.exist(newFile.contents);
      should.not.exist(newFile.jsbeautify);
      done();
    });
    stream.write(vinylFile);
  });

  it('should emit error when contents isStream()', function(done) {
    var stream = beautify();
    var vinylFile = {
      'isNull': function() {
        return false;
      },
      'isStream': function() {
        return true;
      }
    };

    stream.on('error', function(err) {
      err.message.should.equal('Streaming not supported');
      done();
    });
    stream.write(vinylFile);
  });
});
