var path = require('path');

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
  log.info('jawrOptions:', jawrOptions);
  files.unshift(pattern(require.resolve('./jawr.loader')));
};

framework.$inject = ['config.files', 'config.jawr', 'logger'];
module.exports = {'framework:jawr': ['factory', framework]};
