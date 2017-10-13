
var frameworkLogger = require('./logger');

var jawrHandler = require('./jawr.handler');


/**
 * @param {Array} files: file pattern
 * @param {JawrOptions} jawrOptions: jawrOptions
 * @param {Object} logger: karma logger
 * */
var framework = function(files, jawrOptions, logger) {
  frameworkLogger.initLogger(logger);
  jawrHandler.handle(jawrOptions);
};

framework.$inject = ['config.files', 'config.jawr', 'logger'];
module.exports = {'framework:jawr': ['factory', framework]};
