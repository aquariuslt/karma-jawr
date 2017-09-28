/** Created by CUIJA on 2017-09-28.*/

var _ = require('lodash');
var loggerInstance = null;

function initLogger(logger) {
  loggerInstance = logger;
}

function createLog(loggerName) {
  if (_.isEmpty(loggerInstance) || _.isNull(loggerInstance)) {
    return console;
  }
  return loggerInstance.create(loggerName);
}

module.exports.initLogger = initLogger;
module.exports.createLog = createLog;
