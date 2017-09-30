/** Created by CUIJA on 2017-09-28.*/

var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var helpers = require('./helpers');

var logger = require('./logger');
var log = null;

var INJECT_FUNCTION_NAME = 'compileTemplate';

module.exports.generateLocaleMessageFile = generateLocaleMessageFile;

/**
 * @param {String} targetLocation
 * @param {String} propertiesFileLocation
 * @param {String} namespace
 * @return {Promise.<String>} generated file absolute file name
 * */
function generateLocaleMessageFile(targetLocation, propertiesFileLocation, namespace) {
  log = logger.createLog('locale.generator');

  return new Promise(function(resolve) {
    helpers.parseProperties(propertiesFileLocation, function(error, localeMessageProperties) {

      var localeMessageGeneratorJsContent = '';

      localeMessageGeneratorJsContent += (replaceTemplate.toString() + '\n');
      localeMessageGeneratorJsContent += (compileTemplate.toString() + '\n');
      localeMessageGeneratorJsContent += injectGlobalNameSpaceAndFunction(namespace, localeMessageProperties);
      localeMessageGeneratorJsContent = injectClosureAdHoc(localeMessageGeneratorJsContent);

      var localeMessageGeneratorFilePath = path.resolve(targetLocation) + '/' + path.basename(propertiesFileLocation) + '.js';

      mkdirp.sync(targetLocation);
      fs.writeFileSync(localeMessageGeneratorFilePath, localeMessageGeneratorJsContent);

      resolve(path.resolve(localeMessageGeneratorFilePath));
    });
  });
}

function getAllStringValue(object, stringValueArray) {
  for (var field in object) {
    if (_.isString(object[field])) {
      stringValueArray.push(object[field]);
    }
    else if (_.isObject(object[field])) {
      getAllStringValue(object[field], stringValueArray);
    }
  }
}

/**
 * @param {String} globalNamespace: the namespace set in window level
 * @param {Object} localeProperty: the object for localeProperty
 * @return {String} javascript injectable string
 * */
function injectGlobalNameSpaceAndFunction(globalNamespace, localeProperty) {
  var propertyContentString = JSON.stringify(localeProperty);

  var stringValues = [];
  getAllStringValue(localeProperty, stringValues);

  _.each(stringValues, function(uniqueString) {
    var valueBundledString = `"${uniqueString}"`;
    var injectedFunctionString = `${INJECT_FUNCTION_NAME}(${valueBundledString})`;
    propertyContentString = _.replace(propertyContentString, valueBundledString, injectedFunctionString);
  });

  return `window.${globalNamespace}=(` + propertyContentString + `)`;
}

/**
 * is there a better way for injecting auto-e
 * */
function injectClosureAdHoc(originalContent) {
  return `
    (function(){
      ` + originalContent + `
    })();
  `;
}

/* ==== Generator Private Function ====*/
/**
 * function p from jawr_generator.js
 * */

function replaceTemplate(val, args) {
  for (var x = 0; x < args.length; x++) {
    val = val.replace('{' + x + '}', args[x]);
  }
  return val;
}

/**
 * function r from jawr_generator.js
 * */
function compileTemplate() {
  var val = arguments[0];
  var ret;
  if (val.indexOf('{0}') !== -1) {
    ret = function() {
      return replaceTemplate(val, arguments);
    };
  }
  else {
    ret = function() {
      return val;
    };
  }
  for (var x = 1; x < arguments.length; x++) {
    for (var a in arguments[x])
      ret[a] = arguments[x][a];
  }
  return ret;
}
