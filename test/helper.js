const path = require('path');
const Vinyl = require('vinyl');

exports.createFile = (filename, contents) => {
  const base = path.join(__dirname, 'fixtures');
  const filePath = path.join(base, filename);

  const file = new Vinyl({
    cwd: __dirname,
    path: filePath,
    base,
    contents: typeof contents === 'string' ? Buffer.from(contents) : contents,
  });

  return file;
};

exports.defaultContents = {
  css: {
    actual: '#foo.bar{height:100px;width:100px;}',
    expected: '#foo.bar {\n    height: 100px;\n    width: 100px;\n}',
  },
  html: {
    actual: '<!DOCTYPE html><html><head><title></title></head><body></body></html>',
    expected: '<!DOCTYPE html>\n<html>\n\n<head>\n    <title></title>\n</head>\n\n<body></body>\n\n</html>',
  },
  js: {
    actual: 'var foo={bar:1,baz:2};',
    expected: 'var foo = {\n    bar: 1,\n    baz: 2\n};',
  },
};

exports.customContents = {
  css: {
    actual: '#foo.bar{height:100px;width:100px;}',
    expected: '#foo.bar {\n\theight: 100px;\n\twidth: 100px;\n}',
  },
  html: {
    actual: '<!DOCTYPE html><html><head><title></title></head><body></body></html>',
    expected: '<!DOCTYPE html>\n<html>\n\n<head>\n\t\t<title></title>\n</head>\n\n<body></body>\n\n</html>',
  },
  js: {
    actual: 'var foo={bar:1,baz:2};',
    expected: 'var foo = {\n\t\tbar: 1,\n\t\tbaz: 2\n};',
  },
};

exports.customOptions = {
  indent_char: '\t',
  indent_size: 2,
  css: {
    indent_size: 1,
  },
};

exports.supportedFiles = [{
  name: 'file.css',
  type: 'css',
}, {
  name: 'file.html',
  type: 'html',
}, {
  name: 'file.js',
  type: 'js',
}];

exports.notSupportedFiles = [{
  name: 'file.css.erb',
  type: 'css',
}, {
  name: 'file.html.erb',
  type: 'html',
}, {
  name: 'file.js.erb',
  type: 'js',
}];
