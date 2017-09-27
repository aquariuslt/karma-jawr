/** Created by CUIJA on 2017-09-27.*/


var puppeteerPkg = require('puppeteer/package.json');
var Downloader = require('puppeteer/utils/ChromiumDownloader');

var ChromiumRevision = puppeteerPkg['puppeteer']['chromium_revision'];
var revisionInfo = Downloader.revisionInfo(Downloader.currentPlatform(), ChromiumRevision);
process.env.CHROMIUM_BIN = revisionInfo.executablePath;

var localJawrFramework = require('../../lib');
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
      localJawrFramework
    ],
    frameworks: [
      'jawr',
      'mocha'
    ],
    files: [
      pathUtil.resolve('src/test/js/unit/specs') + '/**/*.spec.js'
    ],
    reporters: [
      'spec'
    ],
    jawr: {
      configLocation: pathUtil.resolve('src/main/webapp/jawr/') + 'jawr.properties',
      webappLocation: pathUtil.resolve('src/main/webapp/'),
      targetLocation: pathUtil.resolve('src/test/js/build')
    }
  });
};
