/*jslint node: true, nomen: true, plusplus: true */
'use strict';

module.exports = function (grunt) {
    grunt.config.init({
        sass: {
            options: {
                outputStyle: 'compressed',
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
                        cwd: 'bower_components/zeroclipboard/dist/',
                        dest: 'src/img/',
                        src: 'ZeroClipboard.swf'
                    }
                ]
            }
        },
        uglify: {
            build: {
                files: {
                    'src/js/stache.min.js': [
                        'src/js/libs/easyXDM.min.js',
                        'bower_components/holderjs/holder.min.js',
                        'bower_components/stellar/jquery.stellar.js',
                        'bower_components/angular-sanitize/angular-sanitize.min.js',
                        'src/js/stache-app.js',
                        'src/js/stache-jquery.js',
                        'src/js/libs/jquery.mobile.custom.min.js',
                        'src/js/video.js',
                        'bower_components/zeroclipboard/dist/ZeroClipboard.min.js',
                        'src/js/stache-clipboard.js',
                        'src/js/prism.js'
                    ]
                }
            }
        }
    });

    grunt.task.loadNpmTasks('grunt-sass');
    grunt.task.loadNpmTasks('grunt-contrib-copy');
    grunt.task.loadNpmTasks('grunt-contrib-uglify');

    grunt.task.registerTask('default', 'build');
    grunt.task.registerTask('build', ['sass', 'copy:build', 'uglify:build']);
};
