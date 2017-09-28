var path = require('path');

var frameworkLogger = require('./logger');

var jawrHandler = require('./jawr.handler');
var jawrGenerator = require('./jawr.generator');
var localGenerator = require('./locale.generator');

var pattern = function(file) {
  return {
    pattern: file,
    included: true,
    served: true,
    watched: false
  };
};

/**
 * @param {Array} files - file pattern
 * @param {Object} jawrOptions - jawrOptions
 * @param {Object} logger - karma logger
 * */
var framework = function(files, jawrOptions, logger) {
  frameworkLogger.initLogger(logger);
  jawrHandler.handle(jawrOptions);
  jawrGenerator.generate(jawrOptions, logger);
};

framework.$inject = ['config.files', 'config.jawr', 'logger'];
module.exports = {'framework:jawr': ['factory', framework]};
