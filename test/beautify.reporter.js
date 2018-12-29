const assert = require('assert');
const colors = require('ansi-colors');
const sinon = require('sinon');
const beautify = require('../');
const helper = require('./helper');

describe('reporter()', () => {
  beforeEach(() => {
    sinon.spy(process.stdout, 'write');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should not report anything if beautify() has not been called', (done) => {
    const stream = beautify.reporter();
    const vinylFile = helper.createFile('file.js', '');

    stream.on('error', done);
    stream.on('data', (newFile) => {
      assert.strictEqual(newFile.contents.toString(), '');
      assert.strictEqual(newFile.jsbeautify, undefined);
      assert(process.stdout.write.notCalled);
      done();
    });
    stream.write(vinylFile);
  });

  it('should report which files have been beautified with log verbosity set to ALL.', (done) => {
    const stream = beautify.reporter({
      verbosity: beautify.report.ALL,
    });
    const vinylFile = helper.createFile('file.js', '');
    vinylFile.jsbeautify = {
      beautified: true,
      canBeautify: false,
      type: 'js',
    };

    stream.on('error', done);
    stream.on('data', (newFile) => {
      assert.strictEqual(newFile.contents.toString(), '');
      assert.strictEqual(newFile.jsbeautify.beautified, true);
      assert.strictEqual(newFile.jsbeautify.canBeautify, false);
      assert.strictEqual(newFile.jsbeautify.type, 'js');
      assert.strictEqual(process.stdout.write.getCall(1).args[0], `Beautified ${colors.cyan('file.js')} [js]\n`);
      done();
    });
    stream.write(vinylFile);
  });

  it('should report which files have been beautified without specify log verbosity', (done) => {
    const stream = beautify.reporter();
    const vinylFile = helper.createFile('file.js', '');
    vinylFile.jsbeautify = {
      beautified: true,
      canBeautify: false,
      type: 'js',
    };

    stream.on('error', done);
    stream.on('data', (newFile) => {
      assert.strictEqual(newFile.contents.toString(), '');
      assert.strictEqual(newFile.jsbeautify.beautified, true);
      assert.strictEqual(newFile.jsbeautify.canBeautify, false);
      assert.strictEqual(newFile.jsbeautify.type, 'js');
      assert.strictEqual(process.stdout.write.getCall(1).args[0], `Beautified ${colors.cyan('file.js')} [js]\n`);
      done();
    });
    stream.write(vinylFile);
  });

  it('should report which files are already beautified with log verbosity set to ALL', (done) => {
    const stream = beautify.reporter({
      verbosity: beautify.report.ALL,
    });
    const vinylFile = helper.createFile('file.js', '');
    vinylFile.jsbeautify = {
      beautified: false,
      canBeautify: false,
      type: 'js',
    };

    stream.on('error', done);
    stream.on('data', (newFile) => {
      assert.strictEqual(newFile.contents.toString(), '');
      assert.strictEqual(newFile.jsbeautify.beautified, false);
      assert.strictEqual(newFile.jsbeautify.canBeautify, false);
      assert.strictEqual(newFile.jsbeautify.type, 'js');
      assert.strictEqual(process.stdout.write.getCall(1).args[0], `Already beautified ${colors.cyan('file.js')} [js]\n`);
      done();
    });
    stream.write(vinylFile);
  });

  it('should not report which files are already beautified without specify log verbosity', (done) => {
    const stream = beautify.reporter();
    const vinylFile = helper.createFile('file.js', '');
    vinylFile.jsbeautify = {
      beautified: false,
      canBeautify: false,
      type: 'js',
    };

    stream.on('error', done);
    stream.on('data', (newFile) => {
      assert.strictEqual(newFile.contents.toString(), '');
      assert.strictEqual(newFile.jsbeautify.beautified, false);
      assert.strictEqual(newFile.jsbeautify.canBeautify, false);
      assert.strictEqual(newFile.jsbeautify.type, 'js');
      sinon.assert.notCalled(process.stdout.write);
      done();
    });
    stream.write(vinylFile);
  });

  it('should report which files can be beautified with log verbosity set to ALL', (done) => {
    const stream = beautify.reporter({
      verbosity: beautify.report.ALL,
    });
    const vinylFile = helper.createFile('file.js', '');
    vinylFile.jsbeautify = {
      beautified: false,
      canBeautify: true,
      type: 'js',
    };

    stream.on('error', done);
    stream.on('data', (newFile) => {
      assert.strictEqual(newFile.contents.toString(), '');
      assert.strictEqual(newFile.jsbeautify.beautified, false);
      assert.strictEqual(newFile.jsbeautify.canBeautify, true);
      assert.strictEqual(newFile.jsbeautify.type, 'js');
      assert.strictEqual(process.stdout.write.getCall(1).args[0], `Can beautify ${colors.cyan('file.js')} [js]\n`);
      done();
    });
    stream.write(vinylFile);
  });

  it('should report which files can be beautified without specify log verbosity', (done) => {
    const stream = beautify.reporter();
    const vinylFile = helper.createFile('file.js', '');
    vinylFile.jsbeautify = {
      beautified: false,
      canBeautify: true,
      type: 'js',
    };

    stream.on('error', done);
    stream.on('data', (newFile) => {
      assert.strictEqual(newFile.contents.toString(), '');
      assert.strictEqual(newFile.jsbeautify.beautified, false);
      assert.strictEqual(newFile.jsbeautify.canBeautify, true);
      assert.strictEqual(newFile.jsbeautify.type, 'js');
      assert.strictEqual(process.stdout.write.getCall(1).args[0], `Can beautify ${colors.cyan('file.js')} [js]\n`);
      done();
    });
    stream.write(vinylFile);
  });

  // TODO
  it('should emit an error if a file can be beautified', (done) => {
    const stream = beautify.reporter();
    const vinylFile = helper.createFile('file.js', '');
    vinylFile.jsbeautify = {
      beautified: false,
      canBeautify: true,
      type: 'js',
    };

    stream.on('data', (newFile) => {
      assert.strictEqual(newFile.contents.toString(), '');
      assert.strictEqual(newFile.jsbeautify.beautified, false);
      assert.strictEqual(newFile.jsbeautify.canBeautify, true);
      assert.strictEqual(newFile.jsbeautify.type, 'js');
      done();
    });

    stream.write(vinylFile);
  });

  it('should report which files can not be beautified with log verbosity set to ALL', (done) => {
    const stream = beautify.reporter({
      verbosity: beautify.report.ALL,
    });
    const vinylFile = helper.createFile('file.js', '');
    vinylFile.jsbeautify = {
      beautified: false,
      canBeautify: false,
      type: null,
    };

    stream.on('error', done);
    stream.on('data', (newFile) => {
      assert.strictEqual(newFile.contents.toString(), '');
      assert.strictEqual(newFile.jsbeautify.beautified, false);
      assert.strictEqual(newFile.jsbeautify.canBeautify, false);
      assert.strictEqual(newFile.jsbeautify.type, null);
      assert.strictEqual(process.stdout.write.getCall(1).args[0], `Can not beautify ${colors.cyan('file.js')}\n`);
      done();
    });
    stream.write(vinylFile);
  });

  it('should not report which files can not be beautified without specify log verbosity', (done) => {
    const stream = beautify.reporter();
    const vinylFile = helper.createFile('file.js', '');
    vinylFile.jsbeautify = {
      beautified: false,
      canBeautify: false,
      type: null,
    };

    stream.on('error', done);
    stream.on('data', (newFile) => {
      assert.strictEqual(newFile.contents.toString(), '');
      assert.strictEqual(newFile.jsbeautify.beautified, false);
      assert.strictEqual(newFile.jsbeautify.canBeautify, false);
      assert.strictEqual(newFile.jsbeautify.type, null);
      sinon.assert.notCalled(process.stdout.write);
      done();
    });
    stream.write(vinylFile);
  });
});
