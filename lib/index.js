var path = require('path');

var jawrGenerator = require('./jawr.generator');
var jawrHandler = require('./jawr.handler');
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
  var log = logger.create('framework.jawr');
  log.info('Load JAWR options:');
  for (var field in jawrOptions) {
    if (jawrOptions.hasOwnProperty(field)) {
      log.debug(field + ':', jawrOptions[field]);
    }
  }



  jawrGenerator.generate(jawrOptions, logger);
};

framework.$inject = ['config.files', 'config.jawr', 'logger'];
module.exports = {'framework:jawr': ['factory', framework]};
