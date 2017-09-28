var _ = require('lodash');
var glob = require('glob');
var mkdirp = require('mkdirp');
var fs = require('fs');
var path = require('path');
var properties = require('properties');




function normalizeRelativePath(relativePathString) {
  return relativePathString.split(path.sep).join('/');
}
