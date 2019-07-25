const assert = require('assert');
const del = require('del');
const fs = require('fs');
const path = require('path');
const sinon = require('sinon');
const beautify = require('..');
const helper = require('./helper');

describe('beautify()', () => {
  beforeEach(() => {
    sinon.spy(process.stdout, 'write');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should ignore null file', (done) => {
    const stream = beautify();
    const vinylFile = helper.createFile('nullFile', null);

    stream.on('error', done);
    stream.on('data', (newFile) => {
      assert.strictEqual(newFile.contents, null);
      assert.strictEqual(newFile.jsbeautify, undefined);
      sinon.assert.notCalled(process.stdout.write);
      done();
    });
    stream.write(vinylFile);
  });

  it('should emit error with stream', (done) => {
    const stream = beautify();
    const vinylFile = {
      isNull() { return false; },
      isStream() { return true; },
    };

    stream.on('error', (err) => {
      assert.strictEqual(err.message, 'Streaming not supported');
      done();
    });
    stream.write(vinylFile);
  });

  it('should print debug messages when \'debug\' options is true', (done) => {
    const filePath = path.join(__dirname, 'fileOptions.json');

    fs.writeFileSync(filePath, '{}');

    const stream = beautify({
      debug: true,
      config: filePath,
    });
    const vinylFile = helper.createFile('file.js', '');
    vinylFile.jsbeautify = {};
    vinylFile.jsbeautify.type = null;
    vinylFile.jsbeautify.beautified = false;

    stream.on('error', done);
    stream.on('data', (newFile) => {
      assert.strictEqual(newFile.contents.toString(), '');
      assert.strictEqual(newFile.jsbeautify.beautified, false);
      assert.strictEqual(newFile.jsbeautify.canBeautify, false);
      assert.strictEqual(newFile.jsbeautify.type, 'js');
      assert(process.stdout.write.getCall(1).args[0].startsWith('File options:'));
      assert(process.stdout.write.getCall(3).args[0].startsWith('Final options:'));
      done();
      del.sync(filePath);
    });
    stream.on('close', () => del.sync(filePath));
    stream.write(vinylFile);
  });

  describe('with default options', () => {
    helper.supportedFiles.forEach((file) => {
      it(`should beautify '${file.name}'`, (done) => {
        const stream = beautify();
        const vinylFile = helper.createFile(file.name, helper.defaultContents[file.type].actual);

        stream.on('error', done);
        stream.on('data', (newFile) => {
          assert.strictEqual(newFile.contents.toString(), helper.defaultContents[file.type].expected);
          assert.strictEqual(newFile.jsbeautify.beautified, true);
          assert.strictEqual(newFile.jsbeautify.canBeautify, false);
          assert.strictEqual(newFile.jsbeautify.type, file.type);
          sinon.assert.notCalled(process.stdout.write);
          done();
        });
        stream.write(vinylFile);
      });
    });

    helper.notSupportedFiles.forEach((file) => {
      it(`should ignore '${file.name}'`, (done) => {
        const stream = beautify();
        const vinylFile = helper.createFile(file.name, helper.defaultContents[file.type].actual);

        stream.on('error', done);
        stream.on('data', (newFile) => {
          assert.strictEqual(newFile.contents.toString(), helper.defaultContents[file.type].actual);
          assert.strictEqual(newFile.jsbeautify.beautified, false);
          assert.strictEqual(newFile.jsbeautify.canBeautify, false);
          assert.strictEqual(newFile.jsbeautify.type, null);
          sinon.assert.notCalled(process.stdout.write);
          done();
        });
        stream.write(vinylFile);
      });
    });
  });

  describe('modifying the \'file_type\' option', () => {
    helper.supportedFiles.concat(helper.notSupportedFiles).forEach((file) => {
      it(`should beautify '${file.name}'`, (done) => {
        const stream = beautify({
          css: {
            file_types: ['.css.erb'],
          },
          html: {
            file_types: ['.html.erb'],
          },
          js: {
            file_types: ['.js.erb'],
          },
        });
        const vinylFile = helper.createFile(file.name, helper.defaultContents[file.type].actual);

        stream.on('error', done);
        stream.on('data', (newFile) => {
          assert.strictEqual(newFile.contents.toString(), helper.defaultContents[file.type].expected);
          assert.strictEqual(newFile.jsbeautify.beautified, true);
          assert.strictEqual(newFile.jsbeautify.canBeautify, false);
          assert.strictEqual(newFile.jsbeautify.type, file.type);
          sinon.assert.notCalled(process.stdout.write);
          done();
        });
        stream.write(vinylFile);
      });
    });
  });

  describe('with custom plugin options', () => {
    helper.supportedFiles.forEach((file) => {
      it(`should beautify '${file.name}'`, (done) => {
        const stream = beautify(helper.customOptions);
        const vinylFile = helper.createFile(file.name, helper.customContents[file.type].actual);

        stream.on('error', done);
        stream.on('data', (newFile) => {
          assert.strictEqual(newFile.contents.toString(), helper.customContents[file.type].expected);
          assert.strictEqual(newFile.jsbeautify.beautified, true);
          assert.strictEqual(newFile.jsbeautify.canBeautify, false);
          assert.strictEqual(newFile.jsbeautify.type, file.type);
          sinon.assert.notCalled(process.stdout.write);
          done();
        });
        stream.write(vinylFile);
      });
    });
  });

  describe('specifying a JSON file with \'config\' option', () => {
    const filePath = path.join(__dirname, 'fileOptions.json');

    before(() => {
      fs.writeFileSync(filePath, JSON.stringify(helper.customOptions));
    });

    after(() => {
      del.sync(filePath);
    });

    helper.supportedFiles.forEach((file) => {
      it(`should beautify '${file.name}'`, (done) => {
        const stream = beautify({ config: filePath });
        const vinylFile = helper.createFile(file.name, helper.customContents[file.type].actual);

        stream.on('error', done);
        stream.on('data', (newFile) => {
          assert.strictEqual(newFile.contents.toString(), helper.customContents[file.type].expected);
          assert.strictEqual(newFile.jsbeautify.beautified, true);
          assert.strictEqual(newFile.jsbeautify.canBeautify, false);
          assert.strictEqual(newFile.jsbeautify.type, file.type);
          sinon.assert.notCalled(process.stdout.write);
          done();
        });
        stream.write(vinylFile);
      });
    });
  });

  describe('specifying a YAML file with \'config\' option', () => {
    const filePath = path.join(__dirname, 'fileOptions.yml');

    before(() => {
      fs.writeFileSync(filePath, 'indent_char: " "\nindent_size: 2\ncss:\n  indent_size: 1\nhtml:\n  indent_char: "\t"\n  indent_size: 1');
    });

    after(() => {
      del.sync(filePath);
    });

    helper.supportedFiles.forEach((file) => {
      it(`should beautify '${file.name}'`, (done) => {
        const stream = beautify({ config: filePath });
        const vinylFile = helper.createFile(file.name, helper.customContents[file.type].actual);

        stream.on('error', done);
        stream.on('data', (newFile) => {
          assert.strictEqual(newFile.contents.toString(), helper.customContents[file.type].expected);
          assert.strictEqual(newFile.jsbeautify.beautified, true);
          assert.strictEqual(newFile.jsbeautify.canBeautify, false);
          assert.strictEqual(newFile.jsbeautify.type, file.type);
          sinon.assert.notCalled(process.stdout.write);
          done();
        });
        stream.write(vinylFile);
      });
    });
  });

  describe('with an autoloaded \'.jsbeautifyrc\' file', () => {
    const filePath = path.join(process.cwd(), '.jsbeautifyrc');

    before(() => {
      fs.writeFileSync(filePath, JSON.stringify(helper.customOptions));
    });

    after(() => {
      del.sync(filePath);
    });

    helper.supportedFiles.forEach((file) => {
      it(`should beautify '${file.name}'`, (done) => {
        const stream = beautify({});
        const vinylFile = helper.createFile(file.name, helper.customContents[file.type].actual);

        stream.on('error', done);
        stream.on('data', (newFile) => {
          assert.strictEqual(newFile.contents.toString(), helper.customContents[file.type].expected);
          assert.strictEqual(newFile.jsbeautify.beautified, true);
          assert.strictEqual(newFile.jsbeautify.canBeautify, false);
          assert.strictEqual(newFile.jsbeautify.type, file.type);
          sinon.assert.notCalled(process.stdout.write);
          done();
        });
        stream.write(vinylFile);
      });
    });
  });
});
