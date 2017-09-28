/** Created by CUIJA on 2017-09-28.*/

var logger = require('./logger');

module.exports.handle = handle;

/**
 * @param {JawrOptions} jawrOptions
 * @return {JawrContext} jawrContext
 * */
function handle(jawrOptions) {
  var log = logger.createLog('jawr.handler');



  return {
    jawrOptions: jawrOptions
  };
}



