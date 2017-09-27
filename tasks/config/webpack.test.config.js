/** Created by CUIJA on 2017-09-26.*/

var pathUtil = require('../utils/path.util');
var pkg = require('../../package.json');

module.exports = {
  resolve: {
    extensions: ['.js', '.json'],
    alias: {
      '@': pathUtil.resolve('src/test/js/build')
    }
  },
  output: {
    path: pathUtil.resolve('target'),
    filename: `${pkg.name}.test.js`
  },
  module: {
    rules: [
      {
        enforce: 'post',
        test: /\.js$/,
        include: [
          pathUtil.resolve('src/main/webapp')
        ],
        exclude: [
          /node_modules/,
          /vendor/
        ],
        loader: 'istanbul-instrumenter-loader'
      }
    ]
  }
};
