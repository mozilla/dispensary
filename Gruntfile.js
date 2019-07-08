module.exports = function(grunt) {

  // load all grunt tasks matching the ['grunt-*', '@*/grunt-*'] patterns
  require('load-grunt-tasks')(grunt);

  var configs = require('load-grunt-configs')(grunt, {
    config: {
      src: 'tasks/*.js',
    },
  });

  grunt.initConfig(configs);

  grunt.registerTask('start', [
    'webpack:buildwatch',
  ]);

  grunt.registerTask('build', [
    'webpack:build',
  ]);

  grunt.registerTask('test', [
    'clean',
    'webpack:test',
    'mochaTest',
    'eslint',
    'jscs',
  ]);

};
