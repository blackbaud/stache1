/*jslint node: true, nomen: true, plusplus: true */
'use strict';

module.exports = function(grunt) {
  grunt.task.loadTasks('tasks');
  grunt.task.registerTask('default', function() {
    grunt.task.run('stache');
  })
};
