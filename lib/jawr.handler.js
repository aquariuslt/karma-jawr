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
    then(constructJawrJsBundles).
    then(constructJawrCssBundles).
    then(filterMessageBundles).
    then(constructFlattenMessageBundles).
    then(constructFlattenJawrJsBundles).
    then(constructFlattenJawrCssBundles).
    then(combineFlattenBundles).
    then(handleGlobalBundles).
    then(generateFlattenMappingHashFlag).
    then(generateFlattenMappingFiles).
    catch();
}

var initJawrContext = function(jawrOptions) {
  log.debug('Init jawrContext');
  return new Promise(function(resolve) {
    resolve({
      jawrOptions: jawrOptions,

      // set default flags
      skipGenerate: false
    });
  });
};

/**
 * @param {JawrContext} jawrContext
 * @return {Promise.<JawrContext>}
 * */
var parseJawrProperties = function(jawrContext) {
  log.debug('Parse jawr.properties');
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
var constructJawrJsBundles = function(jawrContext) {
  log.debug('Construct jawr bundles');
  return new Promise(function(resolve) {
    jawrContext.jsBundles = jawrContext.jawrProperties.jawr.js.bundle;
    resolve(jawrContext);
  });
};

/**
 * Construct css bundles object. css object suppose to be optional so use undefined check
 * @param {JawrContext} jawrContext
 * @return {Promise.<JawrContext>}
 * */
var constructJawrCssBundles = function(jawrContext) {
  log.debug('Construct css bundles');
  return new Promise(function(resolve) {
    if (!_.isUndefined(_.get(jawrContext.jawrProperties, 'jawr.css.bundle'))) {
      jawrContext.cssBundles = jawrContext.jawrProperties.jawr.css.bundle;
    }
    resolve(jawrContext);
  });
};

/**
 * @param {JawrContext} jawrContext
 * @return {Promise.<JawrContext>}
 * */
var filterMessageBundles = function(jawrContext) {
  log.debug('Filter jawr message bundles');
  return new Promise(function(resolve) {
    var messageBundleMappingSyntaxPrefix = 'messages:';

    var jawrBundles = jawrContext.jsBundles;
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

    jawrContext.jsBundles = jawrBundles;
    jawrContext.messageBundles = messageBundles;

    resolve(jawrContext);
  });
};

/**
 * @param {JawrContext} jawrContext
 * @return {Promise.<JawrContext>}
 * */
var constructFlattenJawrJsBundles = function(jawrContext) {
  log.debug('Construct flatten jawr bundles');

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
    else {
      flattenChildKeys.push(bundleKey);
    }
    return calculateFlattenPaths(flattenChildKeys, bundleMappings, webappLocation);
  };

  var calculateNonCompositeChildKeys = function(bundleKey, bundleKeyCurrentMappings, bundleMappings) {
    if (bundleMappings[bundleKey] && bundleMappings[bundleKey].composite === true) {
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
      if (!_.isUndefined(bundleMappings[flattenChildKey])) {
        var mappingArray = helpers.splitAndTrim(bundleMappings[flattenChildKey].mappings);
        var mappingPatterns = mappingArray.map(function(patternSuffix) {
          return webappLocation + patternSuffix;
        });


        /**
         * @see https://j-a-w-r.github.io/docs/custom_bundles.html
         * There are three ways to map resources:
         * - Directly by resource path: simply type the relative path to the resource, starting at the root of the WAR file, as in: ‘/js/foo.js’.  (unix path pattern supported)
         * - By directory, non-recurring: add the path to a directory and every resource under it will be added to the bundle, as in: ‘/js/’.       (special handler at here)
         * - By directory, recurring: same as before but adding ‘**’ at the end. This will add every resource under the specified directory and any directory below it. For example: ‘/js/**’. (unix path pattern supported)
         * */
        _.each(mappingPatterns, function(mappingPattern) {
          let mappingPathPattern = mappingPattern;
          if (_.endsWith(mappingPattern,'/')){
            mappingPathPattern = mappingPathPattern + '*';
          }

          flattenPaths = flattenPaths.concat(glob.sync(mappingPathPattern, globOptions));
        });
      }
    });

    return _.filter(_.uniq(flattenPaths), function(pathString) {
      return isFile(pathString);
    });
  };

  // TODO: support more filter mode by jawr official document
  var needFilter = function(bundle) {
    if (!_.isUndefined(bundle)) return bundle['debugonly'] === true;
    return false;
  };

  /**
   * @param {String} flattenPath
   * @return {Boolean}
   * */
  var isFile = function(flattenPath) {
    var FILE_EXTENSION_FLAG = '.';
    return flattenPath.indexOf(FILE_EXTENSION_FLAG) > -1;
  };

  var initJsFlattenBundleMappings = function(flattenBundleMappings, bundleMappings, bundleNames) {
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
    var jawrJsBundleFlattenMappings = {};

    var registeredJsBundleNames = helpers.splitAndTrim(jawrContext.jawrProperties.jawr.js.bundle.names);

    initJsFlattenBundleMappings(jawrJsBundleFlattenMappings, jawrContext.jsBundles, registeredJsBundleNames);
    calculateFlattenMappings(jawrJsBundleFlattenMappings, jawrContext.jsBundles, webappLocation);

    jawrContext.jsBundleFlattenMappings = jawrJsBundleFlattenMappings;

    resolve(jawrContext);
  });
};

/**
 * @param {JawrContext} jawrContext
 * @return {Promise.<JawrContext>}
 * */
var constructFlattenJawrCssBundles = function(jawrContext) {
  log.debug('Construct flatten message bundles');

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
    else {
      flattenChildKeys.push(bundleKey);
    }
    return calculateFlattenPaths(flattenChildKeys, bundleMappings, webappLocation);
  };

  var calculateNonCompositeChildKeys = function(bundleKey, bundleKeyCurrentMappings, bundleMappings) {
    if (bundleMappings[bundleKey] && bundleMappings[bundleKey].composite === true) {
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
      if (!_.isUndefined(bundleMappings[flattenChildKey])) {
        var mappingArray = helpers.splitAndTrim(bundleMappings[flattenChildKey].mappings);
        var mappingPatterns = mappingArray.map(function(patternSuffix) {
          return webappLocation + patternSuffix;
        });

        _.each(mappingPatterns, function(mappingPattern) {
          flattenPaths = flattenPaths.concat(glob.sync(mappingPattern, globOptions));
        });
      }
    });

    return _.uniq(flattenPaths);
  };

  var needFilter = function(cssBundle) {
    if (!_.isUndefined(cssBundle)) return cssBundle['debugonly'] === true;
    return false;
  };

  var initCssFlattenBundleMappings = function(flattenBundleMappings, cssBundleMappings, bundleNames) {
    _.each(bundleNames, function(bundleName) {
      if (cssBundleMappings[bundleName]) {
        flattenBundleMappings[bundleName] = {
          id: cssBundleMappings[bundleName].id,
          mappings: []
        };
      }
    });
  };

  return new Promise(function(resolve) {
    if (!_.isUndefined(jawrContext.cssBundles)) {
      var jawrOptions = jawrContext.jawrOptions;
      var webappLocation = jawrOptions.webappLocation;
      var jawrCssBundleFlattenMappings = {};

      var registeredCssBundleNames = helpers.splitAndTrim(jawrContext.jawrProperties.jawr.css.bundle.names);

      initCssFlattenBundleMappings(jawrCssBundleFlattenMappings, jawrContext.cssBundles, registeredCssBundleNames);
      calculateFlattenMappings(jawrCssBundleFlattenMappings, jawrContext.cssBundles, webappLocation);

      jawrContext.cssBundleFlattenMappings = jawrCssBundleFlattenMappings;
    }
    resolve(jawrContext);
  });
};

/**
 * @param {JawrContext} jawrContext
 * @return {Promise.<JawrContext>}
 * */
var constructFlattenMessageBundles = function(jawrContext) {
  log.debug('Construct flatten message bundles');

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
var combineFlattenBundles = function(jawrContext) {
  log.debug('Combine jawr js and messages bundles');

  return new Promise(function(resolve) {

    var jawrBundleFlattenMappings = jawrContext.jsBundleFlattenMappings;
    var messageFlattenMappings = jawrContext.messageBundleFlattenMappings;
    var cssBundleFlattenMappings = jawrContext.cssBundleFlattenMappings;

    _.each(_.keys(messageFlattenMappings), function(messageFlattenKey) {
      jawrBundleFlattenMappings[messageFlattenKey] = messageFlattenMappings[messageFlattenKey];
    });

    _.each(_.keys(cssBundleFlattenMappings), function(cssFlattenKey) {
      jawrBundleFlattenMappings[cssFlattenKey] = cssBundleFlattenMappings[cssFlattenKey];
    });

    jawrContext.jsBundleFlattenMappings = jawrBundleFlattenMappings;
    resolve(jawrContext);
  });
};

/**
 * @param {JawrContext} jawrContext
 * @return {Promise.<JawrContext>}
 * */
var handleGlobalBundles = function(jawrContext) {
  log.debug('Handle global bundles');
  return new Promise(function(resolve) {
    var jawrBundleFlattenMappings = jawrContext.jsBundleFlattenMappings;

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

    jawrContext.jsBundleFlattenMappings = jawrBundleFlattenMappings;

    resolve(jawrContext);
  });
};

/**
 * Avoid re-generate index files when all flatten mapping path is the same as last time.
 * @param {JawrContext} jawrContext
 * @return {Promise.<JawrContext>}
 * */
var generateFlattenMappingHashFlag = function(jawrContext) {
  log.info('Checking Last Generated Files Hash');

  var LAST_GEN_MAPPINGS_FILENAME = '.last-mappings.json';

  /**
   * @param {String} lastGenerateMappingFilePath
   * @return {JawrJsBundleFlattenMappings|undefined} lastGenerateMappingFileContent
   * */
  var getLastGenerateMappings = function(lastGenerateMappingFilePath) {
    log.debug('Checking file exists:', lastGenerateMappingFilePath);

    if (fs.existsSync(lastGenerateMappingFilePath)) {
      return require(lastGenerateMappingFilePath);
    }
    else {
      return undefined;
    }
  };

  /**
   * @param {String} targetFilePath
   * @param {JawrJsBundleFlattenMappings} jsBundleFlattenMappings
   * */
  var generateCurrentFlattenMappingFlag = function (targetFilePath, jsBundleFlattenMappings) {
    log.debug('Generate Mappings Snapshot File');
    fs.writeFileSync(targetFilePath, JSON.stringify(jsBundleFlattenMappings));
  };

  return new Promise(function(resolve) {
    var jawrOptions = jawrContext.jawrOptions;
    var targetLocation = jawrOptions.targetLocation;
    var lastGenerateFileLocation = targetLocation + '/' + LAST_GEN_MAPPINGS_FILENAME;
    var lastGenerateMappings = getLastGenerateMappings(lastGenerateFileLocation);
    if (!_.isUndefined(lastGenerateMappings) && !_.isEmpty(lastGenerateMappings)) {
      log.info('Last Generated Hash File exists. Comparing...');
      if (_.isEqual(JSON.stringify(lastGenerateMappings), JSON.stringify(jawrContext.jsBundleFlattenMappings))) {
        jawrContext.skipGenerate = true;
      }
    }
    if (!jawrContext.skipGenerate) {
      generateCurrentFlattenMappingFlag(lastGenerateFileLocation, jawrContext.jsBundleFlattenMappings);
    }

    resolve(jawrContext);
  });
};

/**
 * @param {JawrContext} jawrContext
 * @return {Promise.<JawrContext>}
 * */
var generateFlattenMappingFiles = function(jawrContext) {

  if (jawrContext.skipGenerate) {
    return new Promise(function (resolve) {
      log.info('Skip Generating');
      resolve(jawrContext);
    });
  }

  var generateFolders = function(jawrBundleFlattenMappings, targetLocation) {
    _.each(_.keys(jawrBundleFlattenMappings), function(bundleKey) {
      var id = jawrBundleFlattenMappings[bundleKey]['id'];
      var generatedFolderPath = targetLocation + id;
      jawrBundleFlattenMappings[bundleKey]['root'] = generatedFolderPath;
      mkdirp.sync(generatedFolderPath);
    });
  };

  var generateMappingIndex = function(jawrBundleFlattenMappings, targetLocation) {
    log.info('Generate FlattenMapping Files');
    log.info('Generating jawr mapping index.js');
    _.each(_.keys(jawrBundleFlattenMappings), function(bundleKey) {
      var indexJsPath = jawrBundleFlattenMappings[bundleKey]['root'] + '/index.js';
      log.debug('Generating:', indexJsPath);
      var indexJsContent = helpers.generateMappingJsContent(jawrBundleFlattenMappings[bundleKey].id, jawrBundleFlattenMappings[bundleKey].mappings, targetLocation);
      fs.writeFileSync(indexJsPath, indexJsContent);
    });
  };

  return new Promise(function(resolve) {
    var targetLocation = jawrContext.jawrOptions.targetLocation;
    var jawrBundleFlattenMappings = jawrContext.jsBundleFlattenMappings;

    if (!jawrContext.skipGenerate) {
      generateFolders(jawrBundleFlattenMappings, targetLocation);
      generateMappingIndex(jawrBundleFlattenMappings, targetLocation);
    }
    resolve(jawrContext);
  });
};



