/** Created by CUIJA on 2017-09-27.*/


var puppeteerPkg = require('puppeteer/package.json');
var Downloader = require('puppeteer/utils/ChromiumDownloader');

var ChromiumRevision = puppeteerPkg['puppeteer']['chromium_revision'];
var revisionInfo = Downloader.revisionInfo(Downloader.currentPlatform(), ChromiumRevision);
process.env.CHROMIUM_BIN = revisionInfo.executablePath;

var localJawrFramework = require('../../lib');
var webpackTestConfig = require('./webpack.test.config');
var pathUtil = require('../utils/path.util');

module.exports = function(config) {
  config.set({
    browsers: [
      'ChromiumHeadless'
    ],
    plugins: [
      'karma-chrome-launcher',
      'karma-mocha',
      'karma-spec-reporter',
      'karma-coverage',
      'karma-coverage-istanbul-reporter',
      'karma-sourcemap-loader',
      'karma-sinon-chai',
      'karma-coverage',
      'karma-coverage-istanbul-reporter',
      'karma-webpack',
      localJawrFramework
    ],
    frameworks: [
      'jawr',
      'mocha',
      'sinon-chai'
    ],
    files: [
      pathUtil.resolve('src/test/js/unit/specs') + '/**/*.spec.js'
    ],
    reporters: [
      'spec',
      'coverage-istanbul'
    ],
    preprocessors: {
      '/**/*.spec.js': ['webpack', 'sourcemap']
    },
    logLevel: config.LOG_DEBUG,
    jawr: {
      configLocation: pathUtil.resolve('src/main/resources/jawr/') + 'jawr.properties',
      webappLocation: pathUtil.resolve('src/main/webapp'),
      targetLocation: pathUtil.resolve('src/test/js/build')
    },
    webpack: webpackTestConfig,
    webpackMiddleware: {
      stats: 'errors-only',
      noInfo: true
    },
    coverageIstanbulReporter: {
      dir: pathUtil.resolve('src/test/js/unit') + '/coverage',
      reports: ['html', 'lcovonly', 'text-summary'],
      fixWebpackSourcePaths: true,
      skipFilesWithNoCoverage: true,
      thresholds: {
        emitWarning: false,
        global: {
          statements: 1,
          lines: 1,
          branches: 1,
          functions: 1
        }
      }
    }
  });
};
