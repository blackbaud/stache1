/*jslint node: true, nomen: true, plusplus: true */
'use strict';

module.exports = function (grunt) {
    grunt.config.init({
        sass: {
            options: {
                includePaths: [
                    'src/vendor/'
                ]
            },
            build: {
                files: [{
                    expand: true,
                    cwd: 'src/sass',
                    src: ['*.scss'],
                    dest: 'src/css',
                    ext: '.css'
                }]
            }
        }
    });
    grunt.task.loadNpmTasks('grunt-sass');
    grunt.task.registerTask('default', ['sass']);
};
