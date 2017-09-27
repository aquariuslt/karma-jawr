var _ = require('lodash');
var glob = require('glob');
var properties = require('properties');

/**
 * JAWR require syntax folder generator
 * @param {Object} jawrOptions
 * @param {Object} logger
 * @param {Object} helper
 * */
var generate = function(jawrOptions, logger, helper) {
  var log = logger.create('jawr.generator');

  var configLocation = '';
  var webappLocation = '';
  var targetLocation = '';

  var jawrProperties = null;
  var flattenBundleMap = {};

  /**
   * validate jawrOptions for
   * */
  function validateOptions() {
    log.info('Validating jawr options');
    if (_.isUndefined(jawrOptions['configLocation'])) {
      log.error('Please provide jawr.properties absolute path in configLocation.');
    }
    else {
      configLocation = jawrOptions['configLocation'];
    }
    if (_.isUndefined(jawrOptions['webappLocation'])) {
      log.error('Please provide webapp folder for located jawr.properties webapp root.');
    }
    else {
      webappLocation = jawrOptions['webappLocation'];
    }
    if (_.isUndefined(jawrOptions['targetLocation'])) {
      log.error('Please provide target location for generated jawrOptions');
    }
    else {
      targetLocation = jawrOptions['targetLocation'];
    }
  }

  /**
   * parse jawr.properties and convert to resources mapping
   * */
  function parseJawrProperties() {
    log.info('Parsing jawr.properties');
    properties.parse(configLocation, {
      path: true,
      namespaces: true
    }, function(error, parsedProperties) {
      jawrProperties = parsedProperties;

      var registeredJsBundles = getRegisteredJsBundles(jawrProperties);
      var jsBundleMappings = getJsBundleMappings(jawrProperties);

      initBundleMappings(flattenBundleMap, registeredJsBundles, jsBundleMappings);
      calculateFlattenMappings(flattenBundleMap, jsBundleMappings, webappLocation);
    });
  }

  function generatedFolders() {

  }

  function generateMappingIndex() {

  }

  /**
   * main function
   * */
  validateOptions();
  parseJawrProperties();
  generatedFolders();
  generateMappingIndex();
};

module.exports.generate = generate;

/* jawr.properties helper functions */

/**
 * @return {Array} bundled ids array
 * */
function getRegisteredJsBundles(jawrProperties) {
  var registeredJsBundlesString = jawrProperties['jawr']['js']['bundle']['names'];
  var registeredJsBundlesArray = _.split(registeredJsBundlesString, ',');
  return trimArray(registeredJsBundlesArray);
}

function trimArray(array) {
  return _.map(array, function(item) {
    return _.trim(item);
  });
}

function getJsBundleMappings(jawrProperties) {
  return jawrProperties['jawr']['js']['bundle'];
}

function initBundleMappings(bundleMap, bundleNames, bundleMappings) {
  _.each(bundleNames, function(bundleName) {
    bundleMap[bundleName] = {
      id: bundleMappings[bundleName].id,
      mappings: []
    };
  });
}

function calculateFlattenMappings(flattenBundleMap, bundleMappings, webappLocation) {
  _.each(_.keys(flattenBundleMap), function(bundledRootKey) {

    flattenBundleMap[bundledRootKey].mappings = flattenBundleMap[bundledRootKey].mappings.concat(
      calculateFlattenChilds(bundledRootKey, bundleMappings, webappLocation));
  });
  console.log(flattenBundleMap);
}

/**
 * @return {Array} return absolute path arrays
 * */
function calculateFlattenChilds(bundledRootKey, bundleMappings, webappLocation) {
  var flattenChildKeys = [];
  if (bundleMappings[bundledRootKey]['composite'] === true) {
    calculateNonCompositeChildKeys(bundledRootKey, flattenChildKeys, bundleMappings);
  }
  return calculateFlattenPaths(flattenChildKeys, bundleMappings, webappLocation);
}

function calculateNonCompositeChildKeys(bundleKey, bundleKeyCurrentMappings, bundleMappings) {
  if (bundleMappings[bundleKey]['composite'] === true) {
    var childsKeys = trimArray(_.split(bundleMappings[bundleKey]['child']['names'], ','));
    _.each(childsKeys, function(childKey) {
      calculateNonCompositeChildKeys(childKey, bundleKeyCurrentMappings, bundleMappings);
    });
  }
  else {
    if (!checkNeedFiltered(bundleMappings[bundleKey])) {
      bundleKeyCurrentMappings.push(bundleKey);
    }
  }
}

function checkNeedFiltered(bundle) {
  return bundle['debugonly'] === true;
}

function calculateFlattenPaths(flattenChildKeys, bundleMappings, webappLocation) {
  var flattenPaths = [];
  _.each(flattenChildKeys, function(flattenChildKey) {
    var mappingArray = trimArray(_.split(bundleMappings[flattenChildKey]['mappings'], ','));
    var mappingPatterns = mappingArray.map(function(patternSuffix) {
      return webappLocation + patternSuffix;
    });

    _.each(mappingPatterns, function(mappingPattern) {
      flattenPaths = flattenPaths.concat(glob.sync(mappingPattern, {
        nodir: true,
        nonull: true
      }));
    });

  });
  return _.uniq(flattenPaths);
}
