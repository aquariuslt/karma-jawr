/** Created by CUIJA on 2017-09-28.*/
var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var glob = require('glob');
var mkdirp = require('mkdirp');

var helpers = require('./helpers');

var localeGenerator = require('./locale.generator');

var logger = require('./logger');
var log = null;

module.exports.handle = handle;

/**
 * @param {JawrOptions} jawrOptions
 * @return {JawrContext} jawrContext
 * */
function handle(jawrOptions) {
  log = logger.createLog('jawr.handler');

  initJawrContext(jawrOptions).
    then(parseJawrProperties).
    then(constructJawrBundles).
    then(filterMessageBundles).
    then(constructFlattenMessageBundles).
    then(constructFlattenJawrBundles).
    then(combineJsAndMessageBundles).
    then(handleGlobalBundles).
    then(generateFlattenMappingFiles).
    catch();
}

var initJawrContext = function(jawrOptions) {
  log.info('Init jawrContext');
  return new Promise(function(resolve) {
    resolve({
      jawrOptions: jawrOptions
    });
  });
};

/**
 * @param {JawrContext} jawrContext
 * @return {Promise.<JawrContext>}
 * */
var parseJawrProperties = function(jawrContext) {
  log.info('Parse jawr.properties');
  var configLocation = jawrContext.jawrOptions.configLocation;
  return new Promise(function(resolve) {
    helpers.parseProperties(configLocation, function(error, jawrProperties) {
      jawrContext.jawrProperties = jawrProperties;
      resolve(jawrContext);
    });
  });
};
/**
 * @param {JawrContext} jawrContext
 * @return {Promise.<JawrContext>}
 * */
var constructJawrBundles = function(jawrContext) {
  log.info('Construct jawr bundles');
  return new Promise(function(resolve) {
    jawrContext.jawrBundles = jawrContext.jawrProperties.jawr.js.bundle;
    resolve(jawrContext);
  });
};

/**
 * @param {JawrContext} jawrContext
 * @return {Promise.<JawrContext>}
 * */
var filterMessageBundles = function(jawrContext) {
  log.info('Filter jawr message bundles');
  return new Promise(function(resolve) {
    var messageBundleMappingSyntaxPrefix = 'messages:';

    var jawrBundles = jawrContext.jawrBundles;
    var messageBundles = {};

    _.each(_.keys(jawrBundles), function(bundleKey) {
      var bundle = jawrBundles[bundleKey];
      if (!_.isUndefined(bundle.mappings) &&
        (bundle.mappings.indexOf(messageBundleMappingSyntaxPrefix) > -1)) {
        messageBundles[bundleKey] = bundle;
      }
    });

    _.each(_.keys(messageBundles), function(bundleKey) {
      delete jawrBundles[bundleKey];
    });

    jawrContext.jawrBundles = jawrBundles;
    jawrContext.messageBundles = messageBundles;

    resolve(jawrContext);
  });
};

/**
 * @param {JawrContext} jawrContext
 * @return {Promise.<JawrContext>}
 * */
var constructFlattenJawrBundles = function(jawrContext) {
  log.info('Construct flatten jawr bundles');

  var globOptions = {
    nodir: true,
    nonull: true
  };

  var calculateFlattenMappings = function(flattenBundleMappings, bundleMappings, webappLocation) {
    _.each(_.keys(flattenBundleMappings), function(bundledRootKey) {
      flattenBundleMappings[bundledRootKey].mappings = flattenBundleMappings[bundledRootKey].mappings.concat(
        calculateFlattenChilds(bundledRootKey, bundleMappings, webappLocation));
    });
  };

  var calculateFlattenChilds = function(bundleKey, bundleMappings, webappLocation) {
    var flattenChildKeys = [];
    if (bundleMappings[bundleKey].composite === true) {
      calculateNonCompositeChildKeys(bundleKey, flattenChildKeys, bundleMappings);
    }
    return calculateFlattenPaths(flattenChildKeys, bundleMappings, webappLocation);
  };

  var calculateNonCompositeChildKeys = function(bundleKey, bundleKeyCurrentMappings, bundleMappings) {
    if (bundleMappings[bundleKey].composite === true) {
      var childKeys = helpers.splitAndTrim(bundleMappings[bundleKey].child.names);
      _.each(childKeys, function(childKey) {
        calculateNonCompositeChildKeys(childKey, bundleKeyCurrentMappings, bundleMappings);
      });
    }
    else {
      if (!needFilter(bundleMappings[bundleKey])) {
        bundleKeyCurrentMappings.push(bundleKey);
      }
    }
  };

  var calculateFlattenPaths = function(flattenChildKeys, bundleMappings, webappLocation) {
    var flattenPaths = [];
    _.each(flattenChildKeys, function(flattenChildKey) {
      var mappingArray = helpers.splitAndTrim(bundleMappings[flattenChildKey].mappings);
      var mappingPatterns = mappingArray.map(function(patternSuffix) {
        return webappLocation + patternSuffix;
      });

      _.each(mappingPatterns, function(mappingPattern) {
        flattenPaths = flattenPaths.concat(glob.sync(mappingPattern, globOptions));
      });
    });

    return _.uniq(flattenPaths);
  };

  // TODO: support more filter mode by jawr official document
  var needFilter = function(bundle) {
    return bundle['debugonly'] === true;
  };

  var initFlattenBundleMappings = function(flattenBundleMappings, bundleMappings, bundleNames) {
    _.each(bundleNames, function(bundleName) {
      if (bundleMappings[bundleName]) {
        flattenBundleMappings[bundleName] = {
          id: bundleMappings[bundleName].id,
          mappings: []
        };
      }
    });
  };

  return new Promise(function(resolve) {
    var jawrOptions = jawrContext.jawrOptions;
    var webappLocation = jawrOptions.webappLocation;
    var jawrBundleFlattenMappings = {};

    var registeredBundleNames = helpers.splitAndTrim(jawrContext.jawrProperties.jawr.js.bundle.names);

    initFlattenBundleMappings(jawrBundleFlattenMappings, jawrContext.jawrBundles, registeredBundleNames);
    calculateFlattenMappings(jawrBundleFlattenMappings, jawrContext.jawrBundles, webappLocation);

    jawrContext.jawrBundleFlattenMappings = jawrBundleFlattenMappings;

    resolve(jawrContext);
  });
};

/**
 * @param {JawrContext} jawrContext
 * @return {Promise.<JawrContext>}
 * */
var constructFlattenMessageBundles = function(jawrContext) {
  log.info('Construct flatten message bundles');

  /**
   * @param {String} localeConfigLocation
   * @param {String} mappingString: single messages syntax string, like 'messages:(i18n.i18n)'
   * @return {Object} absolute path for locale properties files
   *
   * @example
   *
   * locateMessageSyntaxMapping
   * */
  var locateMessageSyntaxMapping = function(localeConfigLocation, mappingString) {
    var MESSAGE_RESOURCE_PATH = 'messages:';
    var MESSAGE_RESOURCE_SEPARATOR = '.';
    var LOCAL_EXTENSION_NAME = '.properties';

    var messageResource = mappingString.substring(MESSAGE_RESOURCE_PATH.length);

    var globalNamespace = messageResource.substring(messageResource.indexOf('(') + 1, messageResource.indexOf(')'));
    var suffix = messageResource.substring(0, messageResource.indexOf('('));

    var localePropertiesSuffixFilePath = (_.split(suffix, MESSAGE_RESOURCE_SEPARATOR)).join(path.sep) + LOCAL_EXTENSION_NAME;
    var localePropertiesPath = path.resolve(localeConfigLocation, localePropertiesSuffixFilePath);

    return {
      location: localePropertiesPath,
      namespace: globalNamespace
    };
  };
  /**
   * @param {String} localeConfigLocation
   * @param {String} mappingsString
   * @return {Array<Object>} absolute path for locale properties files
   * */
  var locateMessageSyntaxMappings = function(localeConfigLocation, mappingsString) {
    var mappingSyntaxArray = helpers.splitAndTrim(mappingsString);
    return _.map(mappingSyntaxArray, function(mappingString) {
      return locateMessageSyntaxMapping(localeConfigLocation, mappingString);
    });
  };

  /**
   * @param {String} targetLocation
   * @param {Array<JawrLocaleMessageProperties>} messageMappingPropertiesList
   * @return {Promise.<String>} return jawrMessageGenerator.js absolute path
   * */
  var generateLocaleMessageFileList = function(targetLocation, messageMappingPropertiesList) {
    return Promise.all(_.map(messageMappingPropertiesList, function(messageMappingProperties) {
      return generateLocaleMessageFile(targetLocation, messageMappingProperties);
    }));
  };

  /**
   * @param {String} targetLocation
   * @param {JawrLocaleMessageProperties} messageMappingProperties
   * @return {String} return the message generator file absolute path
   * */
  var generateLocaleMessageFile = function(targetLocation, messageMappingProperties) {
    return localeGenerator.generateLocaleMessageFile(targetLocation, messageMappingProperties.location, messageMappingProperties.namespace);
  };

  var generateLocaleMessageFileTask = function(messageFlattenBundles, messageBundleKey, targetLocation) {
    return new Promise(function(resolve) {
      generateLocaleMessageFileList(targetLocation, messageFlattenBundles[messageBundleKey].mappings).
        then(function(generatedFileAbsolutePathList) {
          if (_.isUndefined(messageFlattenBundles[messageBundleKey].generators)) {
            messageFlattenBundles[messageBundleKey].generators = [];
          }
          messageFlattenBundles[messageBundleKey].generators = generatedFileAbsolutePathList;
          resolve(generatedFileAbsolutePathList);
        });
    });
  };

  return new Promise(function(resolve) {
    var jawrOptions = jawrContext.jawrOptions;
    var messageBundles = jawrContext.messageBundles;
    var localeConfigLocation = jawrOptions.localeConfigLocation || jawrOptions.webappLocation;
    var targetLocation = jawrOptions.targetLocation;

    var messageFlattenBundles = {};

    // 1.locate locale properties file absolute path
    // 2.read properties file content
    // 3.generate message generator file content
    // 4.write to targetLocation
    _.each(_.keys(messageBundles), function(messageBundleKey) {
      var mappingsString = messageBundles[messageBundleKey].mappings;
      var messageMappingPropertiesList = locateMessageSyntaxMappings(localeConfigLocation, mappingsString);

      messageFlattenBundles[messageBundleKey] = messageBundles[messageBundleKey];
      messageFlattenBundles[messageBundleKey].mappings = messageMappingPropertiesList;
    });

    //var generatedLocaleMessagePathList = generateLocaleMessageFileList(targetLocation, messageMappingPropertiesList);

    var generateMessageFileTasks = [];
    _.each(_.keys(messageFlattenBundles), function(messageBundleKey) {
      generateMessageFileTasks.push(generateLocaleMessageFileTask(messageFlattenBundles, messageBundleKey, targetLocation));
    });

    Promise.all(generateMessageFileTasks).then(function(generatedFilePathList) {
      var flattenFileList = _.uniq(_.flatten(generatedFilePathList));
      _.each(_.keys(messageFlattenBundles), function(bundleKey) {
        messageFlattenBundles[bundleKey].mappings = flattenFileList;
      });
      jawrContext.messageBundleFlattenMappings = messageFlattenBundles;
      resolve(jawrContext);
    });

  });
};

/**
 * @param {JawrContext} jawrContext
 * @return {Promise.<JawrContext>}
 * */
var combineJsAndMessageBundles = function(jawrContext) {
  log.info('Combine jawr js and messages bundles');

  return new Promise(function(resolve) {

    var jawrBundleFlattenMappings = jawrContext.jawrBundleFlattenMappings;
    var messageFlattenMappings = jawrContext.messageBundleFlattenMappings;

    _.each(_.keys(messageFlattenMappings), function(messageFlattenKey) {
      jawrBundleFlattenMappings[messageFlattenKey] = messageFlattenMappings[messageFlattenKey];
    });

    jawrContext.jawrBundleFlattenMappings = jawrBundleFlattenMappings;
    resolve(jawrContext);
  });
};

/**
 * @param {JawrContext} jawrContext
 * @return {Promise.<JawrContext>}
 * */
var handleGlobalBundles = function(jawrContext) {
  log.info('Handle global bundles');
  return new Promise(function(resolve) {
    var jawrBundleFlattenMappings = jawrContext.jawrBundleFlattenMappings;

    var globalBundleKeys = [];
    _.each(_.keys(jawrBundleFlattenMappings), function(bundleKey) {
      if (jawrBundleFlattenMappings[bundleKey].global === true) {
        globalBundleKeys.push(bundleKey);
      }
    });

    _.each(_.keys(jawrBundleFlattenMappings), function(bundleKey) {
      _.each(globalBundleKeys, function(globalBundleKey) {
        jawrBundleFlattenMappings[bundleKey].mappings =
          jawrBundleFlattenMappings[bundleKey].mappings.concat(jawrBundleFlattenMappings[globalBundleKey].mappings);
      });
      jawrBundleFlattenMappings[bundleKey].mappings = _.uniq(jawrBundleFlattenMappings[bundleKey].mappings);
    });

    jawrContext.jawrBundleFlattenMappings = jawrBundleFlattenMappings;

    resolve(jawrContext);
  });
};

/**
 * @param {JawrContext} jawrContext
 * @return {Promise.<JawrContext>}
 * */
var generateFlattenMappingFiles = function(jawrContext) {
  log.info('Generate FlattenMapping Files');

  var generateFolders = function(jawrBundleFlattenMappings, targetLocation) {
    _.each(_.keys(jawrBundleFlattenMappings), function(bundleKey) {
      var id = jawrBundleFlattenMappings[bundleKey]['id'];
      var generatedFolderPath = targetLocation + id;
      jawrBundleFlattenMappings[bundleKey]['root'] = generatedFolderPath;
      mkdirp.sync(generatedFolderPath);
    });
  };

  var generateMappingIndex = function(jawrBundleFlattenMappings, targetLocation) {
    log.info('Generating jawr mapping index.js');
    _.each(_.keys(jawrBundleFlattenMappings), function(bundleKey) {
      var indexJsPath = jawrBundleFlattenMappings[bundleKey]['root'] + '/index.js';
      log.info('Generating:', indexJsPath);
      var indexJsContent = helpers.generateMappingJsContent(jawrBundleFlattenMappings[bundleKey].id, jawrBundleFlattenMappings[bundleKey].mappings, targetLocation);
      fs.writeFileSync(indexJsPath, indexJsContent);
    });
  };

  return new Promise(function(resolve) {
    var targetLocation = jawrContext.jawrOptions.targetLocation;
    var jawrBundleFlattenMappings = jawrContext.jawrBundleFlattenMappings;

    generateFolders(jawrBundleFlattenMappings, targetLocation);
    generateMappingIndex(jawrBundleFlattenMappings, targetLocation);
    resolve(jawrContext);
  });
};



