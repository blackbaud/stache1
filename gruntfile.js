/*jslint node: true, nomen: true, plusplus: true */
'use strict';

module.exports = function (grunt) {
    grunt.config.init({
        sass: {
            options: {
                includePaths: [
                    'bower_components/'
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
        },
        copy: {
            build: {
                files: [
                    {
                        expand: true,
                        cwd: 'bower_components',
                        dest: 'src/vendor/',
                        src: 'bb-sky-sass/dist/css/fonts/*.*'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components',
                        dest: 'src/vendor/',
                        src: 'bb-sky-sass/dist/css/libs.css'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/',
                        dest: 'src/vendor/',
                        src: 'bb-sky-sass/dist/css/sky.css'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/',
                        dest: 'src/vendor/',
                        src: 'bb-sky-sass/dist/js/libs.js'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/',
                        dest: 'src/vendor/',
                        src: 'bb-sky-sass/dist/js/sky.js'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/',
                        dest: 'src/vendor/',
                        src: 'holderjs/holder.min.js'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/',
                        dest: 'src/vendor/',
                        src: 'stellar/jquery.stellar.js'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/',
                        dest: 'src/vendor/',
                        src: 'angular-sanitize/angular-sanitize.min.js'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/zeroclipboard/dist/',
                        dest: 'src/js/libs/',
                        src: [
                            'ZeroClipboard.min.js',
                            'ZeroClipboard.swf'
                        ]
                    }
                ]
            }
        }
    });

    grunt.task.loadNpmTasks('grunt-sass');
    grunt.task.loadNpmTasks('grunt-contrib-copy');

    grunt.task.registerTask('default', 'build');
    grunt.task.registerTask('build', ['sass', 'copy:build']);
};
