var gulp = require('gulp');
var karma = require('karma');
var sequence = require('gulp-sequence');

var pathUtil = require('./utils/path.util');

var Server = karma.Server;

/**
 * test framework usage example
 * */
gulp.task('sample:unittest', function(done) {
  new Server({
    configFile: pathUtil.resolve('tasks/config') + '/karma.conf.js',
    singleRun: true
  }, done).start();
});

gulp.task('test', sequence(['sample:unittest']));
