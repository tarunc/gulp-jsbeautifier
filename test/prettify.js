var beautify = require('../');
var del = require('del');
var expect = require('chai').expect;
var fs = require('fs');
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

describe('prettify()', function () {
  beforeEach(function () {
    sinon.spy(console, 'log');
  });

  afterEach(function () {
    console.log.restore();
  });

  it('should ignore file when file.isNull()', function (done) {
    var stream = beautify();
    var vinylFile = newVinyl('nullFile', null);

    stream.on('error', done);
    stream.on('data', function (newFile) {
      expect(newFile).to.exist;
      expect(newFile.path).to.exist;
      expect(newFile.path.toString()).to.equal(path.join(__dirname, 'fixtures', 'nullFile'));
      expect(newFile.relative).to.exist;
      expect(newFile.relative.toString()).to.equal('nullFile');
      expect(newFile.contents).to.be.null;
      expect(newFile.jsbeautify).to.be.undefined;
      expect(console.log.called).to.be.false;
      done();
    });
    stream.write(vinylFile);
  });

  it('should emit error when file.isStream()', function (done) {
    var stream = beautify();
    var vinylFile = {
      'isNull': function () {
        return false;
      },
      'isStream': function () {
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

  it('should show debug messages when \'debug\' options is true', function (done) {
    var stream = beautify({
      debug: true
    });
    var vinylFile = newVinyl('file.js', new Buffer(''));
    vinylFile.jsbeautify = {};
    vinylFile.jsbeautify.type = null;
    vinylFile.jsbeautify.beautified = false;

    stream.on('error', done);
    stream.on('data', function (newFile) {
      expect(newFile).to.exist;
      expect(newFile.path).to.exist;
      expect(newFile.path.toString()).to.equal(path.join(__dirname, 'fixtures', 'file.js'));
      expect(newFile.relative).to.exist;
      expect(newFile.relative.toString()).to.equal('file.js');
      expect(newFile.contents).to.exist;
      expect(newFile.contents.toString()).to.equal('');
      expect(newFile.jsbeautify).to.exist;
      expect(newFile.jsbeautify.type).to.equal('js');
      expect(newFile.jsbeautify.beautified).to.exist;
      expect(newFile.jsbeautify.beautified).to.be.false;
      expect(console.log.called).to.be.true;
      done();
    });
    stream.write(vinylFile);
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

    files1.forEach(function (file) {
      it('should beautify \'' + file.name + '\'', function (done) {
        var stream = beautify();
        var vinylFile = newVinyl(file.name, new Buffer(file.contents.fixture));

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
          expect(newFile.jsbeautify.beautified).to.be.true;
          expect(newFile.jsbeautify.type).to.exist;
          expect(newFile.jsbeautify.type).to.equal(file.type);
          expect(console.log.called).to.be.false;
          done();
        });
        stream.write(vinylFile);
      });
    });

    files2.forEach(function (file) {
      it('should not beautify \'' + file.name + '\'', function (done) {
        var stream = beautify();
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
          expect(newFile.jsbeautify.beautified).to.exist;
          expect(newFile.jsbeautify.beautified).to.be.false;
          expect(newFile.jsbeautify.type).to.be.null;
          expect(console.log.called).to.be.false;
          done();
        });
        stream.write(vinylFile);
      });
    });
  });

  describe('specifying a file with \'config\' option', function () {
    var configFile = {
      path: path.join(__dirname, 'config.json'),
      contents: {
        indent_size: 2,
        css: {
          indent_size: 3
        }
      }
    }

    var options = {
      config: configFile.path
    };

    var contents = {
      css: {
        fixture: '#foo.bar{height:100px;width:100px;}',
        expected: '#foo.bar {\n   height: 100px;\n   width: 100px;\n}'
      },
      html: {
        fixture: '<!DOCTYPE html><html><head><title></title></head><body></body></html>',
        expected: '<!DOCTYPE html>\n<html>\n\n<head>\n  <title></title>\n</head>\n\n<body></body>\n\n</html>'
      },
      js: {
        fixture: 'var foo={bar:1,baz:2};',
        expected: 'var foo = {\n  bar: 1,\n  baz: 2\n};'
      }
    }

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

    before(function () {
      fs.writeFileSync(configFile.path, JSON.stringify(configFile.contents));
    });

    after(function () {
      del(configFile.path);
    });

    files.forEach(function (file) {
      it('should beautify \'' + file.name + '\'', function (done) {
        var stream = beautify(options);
        var vinylFile = newVinyl(file.name, new Buffer(file.contents.fixture));

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
          expect(newFile.jsbeautify.beautified).to.be.true;
          expect(newFile.jsbeautify.type).to.exist;
          expect(newFile.jsbeautify.type).to.equal(file.type);
          expect(console.log.called).to.be.false;
          done();
        });
        stream.write(vinylFile);
      });
    });
  });

  describe('automatically loading the \'.jsbeautifyrc\' file', function () {
    var configFile = {
      path: path.join('.jsbeautifyrc'),
      contents: {
        indent_size: 1,
        css: {
          indent_size: 5
        }
      }
    }

    var options = {
      indent_size: 1,
      css: {
        indent_size: 5
      }
    };

    var contents = {
      css: {
        fixture: '#foo.bar{height:100px;width:100px;}',
        expected: '#foo.bar {\n     height: 100px;\n     width: 100px;\n}'
      },
      html: {
        fixture: '<!DOCTYPE html><html><head><title></title></head><body></body></html>',
        expected: '<!DOCTYPE html>\n<html>\n\n<head>\n <title></title>\n</head>\n\n<body></body>\n\n</html>'
      },
      js: {
        fixture: 'var foo={bar:1,baz:2};',
        expected: 'var foo = {\n bar: 1,\n baz: 2\n};'
      }
    }

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

    before(function () {
      fs.writeFileSync(configFile.path, JSON.stringify(configFile.contents));
    });

    after(function () {
      del(configFile.path);
    });

    files.forEach(function (file) {
      it('should beautify \'' + file.name + '\'', function (done) {
        var stream = beautify();
        var vinylFile = newVinyl(file.name, new Buffer(file.contents.fixture));

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
          expect(newFile.jsbeautify.beautified).to.be.true;
          expect(newFile.jsbeautify.type).to.exist;
          expect(newFile.jsbeautify.type).to.equal(file.type);
          expect(console.log.called).to.be.false;
          done();
        });
        stream.write(vinylFile);
      });
    });
  });

  describe('changing the \'file_type\' option', function () {
    var options = {
      css: {
        file_types: ['.css.erb']
      },
      html: {
        file_types: ['.html.erb']
      },
      js: {
        file_types: ['.js.erb']
      }
    };

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

    files1.forEach(function (file) {
      it('should not beautify \'' + file.name + '\'', function (done) {
        var stream = beautify(options);
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
          expect(newFile.jsbeautify.type).to.be.null;
          expect(console.log.called).to.be.false;
          done();
        });
        stream.write(vinylFile);
      });
    });

    files2.forEach(function (file) {
      it('should beautify \'' + file.name + '\'', function (done) {
        var stream = beautify(options);
        var vinylFile = newVinyl(file.name, new Buffer(file.contents.fixture));

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
          expect(newFile.jsbeautify.beautified).to.be.true;
          expect(newFile.jsbeautify.type).to.exist;
          expect(newFile.jsbeautify.type).to.equal(file.type);
          expect(console.log.called).to.be.false;
          done();
        });
        stream.write(vinylFile);
      });
    });
  });

  describe('overwriting the \'config file options\' with \'parameters options\'', function () {
    var configFile = {
      path: path.join(__dirname, 'config.json'),
      contents: {
        indent_size: 1,
        css: {
          indent_size: 2
        }
      }
    }

    var options = {
      config: configFile.path,
      css: {
        indent_size: 3
      }
    };

    var contents = {
      css: {
        fixture: '#foo.bar{height:100px;width:100px;}',
        expected: '#foo.bar {\n   height: 100px;\n   width: 100px;\n}'
      },
      html: {
        fixture: '<!DOCTYPE html><html><head><title></title></head><body></body></html>',
        expected: '<!DOCTYPE html>\n<html>\n\n<head>\n <title></title>\n</head>\n\n<body></body>\n\n</html>'
      },
      js: {
        fixture: 'var foo={bar:1,baz:2};',
        expected: 'var foo = {\n bar: 1,\n baz: 2\n};'
      }
    }

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

    before(function () {
      fs.writeFileSync(configFile.path, JSON.stringify(configFile.contents));
    });

    after(function () {
      del(configFile.path);
    });

    files.forEach(function (file) {
      it('should beautify \'' + file.name + '\'', function (done) {
        var stream = beautify(options);
        var vinylFile = newVinyl(file.name, new Buffer(file.contents.fixture));

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
          expect(newFile.jsbeautify.beautified).to.be.true;
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
