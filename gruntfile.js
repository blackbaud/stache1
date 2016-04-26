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
                        'src/vendor/bb-omnibar-search/js/bb-omnibar-search.js',
                        'src/vendor/bb-omnibar-search/js/bb-omnibar-search.templates.js',
                        'src/js/stache-app.js',
                        'src/js/stache-jquery.js',
                        'src/js/libs/jquery.mobile.custom.min.js',
                        'src/js/video.js',
                        'bower_components/zeroclipboard/dist/ZeroClipboard.min.js',
                        'src/js/stache-clipboard.js',
                        'src/js/prism.js',
                        'bower_components/angular-ui-select/dist/select.js',
                        'bower_components/angular-swagger-ui/dist/swagger-ui.min.js'
                    ]
                }
            }
        },
        jasmine_node: {
            all: {
                options: {
                    specFolders: ['tests'],
                    extensions: 'js',
                    specNameMatcher: 'spec'
                },
                src: ['tasks/stache.js', 'src/helpers/helpers.js']
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

    grunt.task.registerTask('createselectscss', function () {
        grunt.file.copy('bower_components/angular-ui-select/dist/select.min.css', 'bower_components/angular-ui-select/dist/select.min.scss');
    });

    grunt.task.registerTask('cleanselectscss', function () {
        grunt.file.delete('bower_components/angular-ui-select/dist/select.min.scss');
    });

    grunt.task.registerTask('build', [
        'createselectscss',
        'sass',
        'copy:build',
        'uglify:build',
        'cleanselectscss'
    ]);
    grunt.task.registerTask('test', [
        'jscs',
        'jshint',
        'build',
        'jasmine_node'
    ]);
    grunt.task.registerTask('default', 'build');
};
