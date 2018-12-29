const assert = require('assert');
const sinon = require('sinon');
const beautify = require('../');
const helper = require('./helper');

describe('validate()', () => {
  beforeEach(() => {
    sinon.spy(process.stdout, 'write');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('with the default options', () => {
    helper.supportedFiles.forEach((file) => {
      it(`should not edit the content of not beautified'${file.name}'`, (done) => {
        const stream = beautify.validate();
        const vinylFile = helper.createFile(file.name, helper.defaultContents[file.type].actual);

        stream.on('error', done);
        stream.on('data', (newFile) => {
          assert.strictEqual(newFile.contents.toString(), helper.defaultContents[file.type].actual);
          assert.strictEqual(newFile.jsbeautify.beautified, false);
          assert.strictEqual(newFile.jsbeautify.canBeautify, true);
          assert.strictEqual(newFile.jsbeautify.type, file.type);
          sinon.assert.notCalled(process.stdout.write);
          done();
        });
        stream.write(vinylFile);
      });
    });

    helper.supportedFiles.forEach((file) => {
      it(`should not edit the content of beautified'${file.name}'`, (done) => {
        const stream = beautify.validate();
        const vinylFile = helper.createFile(file.name, helper.defaultContents[file.type].expected);

        stream.on('error', done);
        stream.on('data', (newFile) => {
          assert.strictEqual(newFile.contents.toString(), helper.defaultContents[file.type].expected);
          assert.strictEqual(newFile.jsbeautify.beautified, false);
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
