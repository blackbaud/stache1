/*jslint node: true, nomen: true, plusplus: true */
'use strict';

module.exports = function (grunt) {
    var jsHintFiles = ['gruntfile.js', 'src/helpers/**/*.js'];

    grunt.config.init({
        concat: {
            options: {
              separator: ';',
              process: function (src, filepath) {
                  if (filepath === 'bower_components/angular-swagger-ui/dist/scripts/swagger-ui.min.js') {
                      src = '(function (angular) {' + src + '}(window.angular));';
                  }
                  return src;
              }
            },
            dist: {
              src: ['bower_components/angular-swagger-ui/dist/scripts/swagger-ui.min.js', 'src/js/stache.min.js'],
              dest: 'src/js/stache.min.js',
            },
        },
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
                        'bower_components/angular-ui-select/dist/select.js'
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
        },
        lessToSass: {
          convert: {
            files: [{
              expand: true,
              cwd: 'bower_components/angular-swagger-ui/dist/less',
              src: ['*.less'],
              ext: '.scss',
              dest: 'src/vendor/swagger-ui'
            }]
          }
        }
    });

    grunt.task.loadNpmTasks('grunt-contrib-copy');
    grunt.task.loadNpmTasks('grunt-contrib-concat');
    grunt.task.loadNpmTasks('grunt-contrib-jshint');
    grunt.task.loadNpmTasks('grunt-contrib-uglify');
    grunt.task.loadNpmTasks('grunt-contrib-watch');
    grunt.task.loadNpmTasks('grunt-jasmine-node-coverage');
    grunt.task.loadNpmTasks('grunt-jscs');
    grunt.task.loadNpmTasks('grunt-less-to-sass');
    grunt.task.loadNpmTasks('grunt-sass');

    grunt.task.registerTask('createselectscss', function () {
        grunt.file.copy('bower_components/angular-ui-select/dist/select.min.css', 'bower_components/angular-ui-select/dist/select.min.scss');
    });

    grunt.task.registerTask('cleanselectscss', function () {
        grunt.file.delete('bower_components/angular-ui-select/dist/select.min.scss');
    });

    grunt.task.registerTask('build', [
        'createselectscss',
        'lessToSass',
        'sass',
        'copy:build',
        'uglify:build',
        'concat',
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
