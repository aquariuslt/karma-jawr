var JAWR_CONFIG_TYPES = {
  PROPERTIES: 'properties',
  SPRINGCONTEXT: 'spring-context'
};

function createJawrLoader(jawrOptions) {
  var options = jawrOptions || {};

  window.jawrLoader = {
    type: options.type || JAWR_CONFIG_TYPES.PROPERTIES
  };
}

createJawrLoader();
