var path = require('path');

var jawrGenerator = require('./jawr.generator');

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
 * @param {Object} helper - karma factory function helper
 * */
var framework = function(files, jawrOptions, logger, helper) {
  var log = logger.create('framework.jawr');
  log.info('Load JAWR options:');
  for (var field in jawrOptions) {
    if (jawrOptions.hasOwnProperty(field)) {
      log.info(field + ':', jawrOptions[field]);
    }
  }
  jawrGenerator.generate(jawrOptions, logger, helper);
};

framework.$inject = ['config.files', 'config.jawr', 'logger', 'helper'];
module.exports = {'framework:jawr': ['factory', framework]};
