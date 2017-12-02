var _ = require('lodash');
var path = require('path');
var properties = require('properties');


module.exports.normalizeRelativePath = normalizeRelativePath;
module.exports.generateMappingJsContent = generateMappingJsContent;
module.exports.splitAndTrim = splitAndTrim;

module.exports.parseProperties = parseProperties;

/**
 * @param {String} relativePathString
 * @return {String}
 *
 * @example
 *
 * on windows:
 * normalizeRelativePath('..\..\..\..\..\main\webapp\js\vendor\ext\ext-base.js')
 *
 * => '../../../../../main/webapp/js/vendor/ext/ext-base.js'
 *
 * on unix:
 * normalizeRelativePath('../../../../../main/webapp/js/vendor/ext/ext-base.js')
 *
 * => '../../../../../main/webapp/js/vendor/ext/ext-base.js'
 *
 *
 * */
function normalizeRelativePath(relativePathString) {
  return relativePathString.split(path.sep).join('/');
}

/**
 * @param {String} jsMappingPrefix:
 * @param {Array<String>} jsMappingPaths:
 * @param {String} baseRelativeLocation:
 *
 * @return {String} the file content contains require(relativeSourcePath)
 * */
function generateMappingJsContent(jsMappingPrefix, jsMappingPaths, baseRelativeLocation) {
  var jsContent = '';
  _.each(jsMappingPaths, function(jsPath) {
    jsContent = jsContent + generatedRequireSyntax(jsMappingPrefix, jsPath, baseRelativeLocation);
  });
  return jsContent;
}

/**
 * @param {String} jsMappingPrefix: jawrBundle id
 * @param {String} jsPath: js source file absolute path
 * @param {String} baseRelativeLocation: target folder
 *
 * @return {String} the string `require('../../../xxx.js')`
 *
 * @example
 *
 * jsMappingPrefix: '/jsBundles/extJs.js'
 * jsPath: 'path/to/src/main/webapp/js/vendor/ext/ext-base.js',
 * baseRelativeLocation: 'path/to/src/test/js/build'
 *
 *
 * */
function generatedRequireSyntax(jsMappingPrefix, jsPath, baseRelativeLocation) {
  var requirePath = (path.relative(baseRelativeLocation + jsMappingPrefix, jsPath));
  return `require('${normalizeRelativePath(requirePath)}');\n`;
}

/**
 * @param {String} value
 * @return {Array} trimmed split array
 * @example
 *
 * splitAndTrim('extJs, home, i18n')
 * ==> ['extJs','home','i18n']
 *
 *
 * splitAndTrim('/js/vendor/**, /js/home/ui/**')
 * ==> ['/js/vendor/**','/js/home/ui/**']
 * */
function splitAndTrim(value) {
  return _.map(_.split(value, ','), function(item) {
    return _.trim(item);
  });
}

/**
 * @param {String} configLocation
 * @param {Function} callback
 * */
function parseProperties(configLocation, callback) {
  var parseOptions = {
    path: true,
    namespaces: true
  };
  properties.parse(configLocation, parseOptions, function(error, parsedProperties) {
    normalizePropertiesValue(parsedProperties);
    callback(null, parsedProperties);
  });
}

/**
 * @param {Object} properties
 * @return {Object} properties without null value
 * */
function normalizePropertiesValue(properties) {
  if (_.isObject(properties)) {
    for (var key in properties) {
      if (properties.hasOwnProperty(key)) {
        if (_.isNull(properties[key])) {
          properties[key] = '';
        }
        else if (_.isObject(properties[key])) {
          normalizePropertiesValue(properties[key]);
        }
      }
    }
  }
}
