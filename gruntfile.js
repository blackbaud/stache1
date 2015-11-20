/*jslint node: true, nomen: true, plusplus: true */
'use strict';

module.exports = function (grunt) {
    var jsHintFiles = ['gruntfile.js', 'src/helpers/**/*.js'];

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
        },
        jasmine_node: {
            all: {
                options: {
                    specFolders: ['src/helpers'],
                    extensions: 'js',
                    specNameMatcher: 'spec'
                },
                src: ['src/helpers/helpers.js']
            }
        },
        jshint: {
            options: {
                jshintrc: true
            },
            all: jsHintFiles
        },
        jscs: {
            options: {
                config: '.jscsrc'
            },
            all: jsHintFiles
        },
        watch: {
            scripts: {
                files: ['src/helpers/**/*.js'],
                tasks: ['jasmine_node', 'jshint', 'jscs']
            }
        }
    });

    grunt.task.loadNpmTasks('grunt-contrib-copy');
    grunt.task.loadNpmTasks('grunt-contrib-jshint');
    grunt.task.loadNpmTasks('grunt-contrib-uglify');
    grunt.task.loadNpmTasks('grunt-contrib-watch');
    grunt.task.loadNpmTasks('grunt-jasmine-node-coverage');
    grunt.task.loadNpmTasks('grunt-jscs');
    grunt.task.loadNpmTasks('grunt-sass');

    grunt.task.registerTask('build', [
        'sass',
        'copy:build',
        'uglify:build'
    ]);
    grunt.task.registerTask('test', [
        'jscs',
        'jasmine_node'
    ]);
    grunt.task.registerTask('default', 'build');
};
