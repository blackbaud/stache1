/// <vs BeforeBuild='default' SolutionOpened='watchandtest' />
/*global module, require */

module.exports = function (grunt) {
    'use strict';

    var fontFiles = ['**/*.eot', '**/*.svg', '**/*.ttf', '**/*.woff'],
        jsHintFiles = ['gruntfile.js', 'js/**/*.js'],
        markdown = require('node-markdown').Markdown,
        neutralLocale = 'en-US',
        skyDistPath = 'dist/',
        skyLocalesPath = 'js/sky/locales/',
        skySrcPath = 'js/sky/src/',
        skyPatternsPath = 'js/sky/patterns/',
        src = [
            '<%= skySrcPath %>*/*.js',
            '<%= skySrcPath %>module.js'
        ];

    function renameDest(dest, src) {
        return '<%= skySrcPath %>' + (src.substring(0, src.lastIndexOf('/')) + '/docs/generatedreadme.md');
    }
    
    grunt.initConfig({
        neutralLocale: neutralLocale,
        skyDistPath: skyDistPath,
        skyLocalesPath: skyLocalesPath,
        skySrcPath: skySrcPath,
        skyPatternsPath: skyPatternsPath,
        skyTemplatesPath: 'js/sky/templates/',
        modules: [],
        ngversion: '1.3.2',
        pkg: '',
        bsversion: '',
        html: '',
        html2js: {
            options: {
                base: 'js/',
                indentString: '    ',
                module: 'sky.templates',
                quoteChar: '\'',
                singleModule: true
            },
            main: {
                src: ['<%= skyTemplatesPath %>**/*.html'],
                dest: '<%= skyTemplatesPath %>templates.js.tmp'
            }
        },
        clean: {
            js: ['<%= skySrcPath %>**/generatedreadme.md']
        },
        jsdoc2md: {
            separateOutputFilePerInput: {
                options: {
                    index: false,
                    "no-gfm": true
                },
                files: [
                    {
                        expand: true,
                        cwd: '<%= skySrcPath %>',
                        src: '*/*.js',
                        dest: '<%= skySrcPath %>',
                        ext: '.md',
                        rename: renameDest
                    }
                ]
            }
        },
        // We used to use grunt-contrib-concat here but the source maps never came out right.  This one works much better.
        concat_sourcemap: {
            options: {
                sourcesContent: true,
                sourceRoot: '../..'
            },
            dist: {
                files: {
                    '<%= skyDistPath %>js/sky.js': src.concat(['<%= skyDistPath %>js/locales/sky-locale-<%= neutralLocale %>.js', '<%= skyTemplatesPath %>templates.js.tmp'])
                }
            }
        },
        uglify: {
            options: {
                // Source map isn't perfect here, but it's serviceable.  Be on the lookout for updates to this task
                // in case it's fixed.
                sourceMap: true,
                sourceMapIn: '<%= skyDistPath %>js/sky.js.map',
                sourceMapIncludeSources: true
            },
            dist: {
                src: ['<%= skyDistPath %>js/sky.js'],
                dest: '<%= skyDistPath %>js/sky.min.js'
            }
        },
        watch: {
            scripts: {
                files: src.concat(['<%= skyLocalesPath %>**/*.*', '<%= skyTemplatesPath %>**/*..html']),
                tasks: ['compilescripts', 'karma:watch:run']
            },
            test: {
                files: ['**/test/*.js'],
                tasks: ['karma:watch:run']
            },
            jshint: {
                files: jsHintFiles,
                tasks: ['lint']
            },
            demo: {
                files: ['<%= skySrcPath %>*/docs/*.js', '<%= skySrcPath %>*/docs/*.html', 'js/sky/misc/demo/**'],
                tasks: ['jsdoc2md', 'demohtml', 'clean']
            },
            patterns: {
                files: ['<%= skyPatternsPath %>**', 'js/sky/misc/patterns/**'],
                tasks: ['patternshtml']
            },
            sass: {
                files: ['**/*.scss'],
                tasks: ['sass:dist']
            }
        },
        sass: {
            dist: {
                options: {
                    style: 'compressed'
                },
                files: {
                    'dist/css/sky.css': 'scss/sky.scss'
                }
            }
        },
        copy: {
            dist: {
                files: [{
                    expand: true,
                    flatten: true,
                    src: fontFiles,
                    cwd: 'scss',
                    dest: 'dist/css/fonts'
                }]
            },
            demohtml: {
                options: {
                    process: grunt.template.process,
                    processContentExclude: fontFiles
                },
                files: [{
                    expand: true,
                    src: ['**/*.html'],
                    cwd: 'js/sky/misc/demo/',
                    dest: 'demo/directives'
                }]
            },
            patternshtml: {
                options: {
                    process: grunt.template.process
                },
                files: [{
                    expand: true,
                    src: ['**/*.html'],
                    cwd: 'js/sky/misc/patterns/',
                    dest: 'demo/patterns'
                }]
            }
        },
        karma: {
            options: {
                configFile: 'karma.conf.js'
            },
            travis: {
                configFile: 'karma.conf-browserstack.js'
            },
            unit: {
                singleRun: true
            },
            watch: {
                background: true
            }
        },
        bump: {
            options: {
                files: ['bower.json'],
                updateConfigs: [],
                commit: true,
                commitMessage: 'Release v%VERSION%',
                commitFiles: ['-a'],
                createTag: true,
                tagName: 'v%VERSION%',
                tagMessage: 'Version %VERSION%',
                push: true,
                pushTo: 'origin',
                gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
                globalReplace: false,
                prereleaseName: false,
                regExp: false
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
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-html2js');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-ngdocs');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-concat-sourcemap');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-bump');
    grunt.loadNpmTasks('grunt-jsdoc-to-markdown');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jscs');

    grunt.registerTask('lint', ['jshint', 'jscs']);
    grunt.registerTask('travis', ['lint', 'karma:travis:start']);
    grunt.registerTask('generatedocs', ['jsdoc2md', 'demohtml', 'clean']);
    grunt.registerTask('compilescripts', ['l10n', 'html2js', 'concat_sourcemap', 'uglify']);
    grunt.registerTask('watchandtest', ['karma:watch:start', 'watch']);
    
    function createDocsTask(docsType, path, docsFolder, ctrlSuffix) {
        return function () {
            var foundModules = {},
                modules;

            function findModule(name) {
                grunt.log.writeln('Searching for module ' + name);

                if (foundModules[name]) {
                    return;
                }

                foundModules[name] = true;

                function breakup(text, separator) {
                    return text.replace(/[A-Z]/g, function (match) {
                        return separator + match;
                    });
                }
                function ucwords(text) {
                    return text.replace(/^([a-z])|\s+([a-z])/g, function ($1) {
                        return $1.toUpperCase();
                    });
                }
                function enquote(str) {
                    return '"' + str + '"';
                }

                var module = {
                    name: name,
                    moduleName: enquote('sky.' + name),
                    displayName: ucwords(breakup(name, ' ')),
                    srcFiles: grunt.file.expand(path + name + '/*.js'),
                    tplFiles: grunt.file.expand('template/' + name + '/*.html'),
                    tpljsFiles: grunt.file.expand('template/' + name + '/*.html.js'),
                    tplModules: grunt.file.expand('template/' + name + '/*.html').map(enquote),
                    //dependencies: dependenciesForModule(name),
                    docs: {
                        md: grunt.file.expand(path + name + docsFolder + '/*.md')
                            .map(grunt.file.read).map(markdown).join('\n'),
                        js: grunt.file.expand(path + name + docsFolder + '/*.js')
                            .map(grunt.file.read).join('\n'),
                        html: grunt.file.expand(path + name + docsFolder + '/*.html')
                            .map(grunt.file.read).join('\n'),
                        tpl: 'doctemplates/' + name + '.html'
                    }
                };

                if (ctrlSuffix) {
                    module.docs.ctrl = ucwords(name) + ctrlSuffix;
                }

                //module.dependencies.forEach(findModule);
                grunt.config('modules', grunt.config('modules').concat(module));
            }

            docsFolder = docsFolder || '';

            grunt.file.expand(
                {
                    filter: 'isDirectory',
                    cwd: '.'
                },
                path + '*'
            ).forEach(function (dir) {
                var parts = dir.split('/');
                findModule(parts[parts.length - 1]);
            });

            modules = grunt.config('modules');

            grunt.log.writeln('Found modules: ' + path + ' ' + modules.length);

            grunt.config(
                'demoModules',
                modules
                    .filter(function (module) {
                        return module.docs.md && module.docs.js && module.docs.html;
                    })
                    .sort(function (a, b) {
                        if (a.name < b.name) {
                            return -1;
                        }
                        if (a.name > b.name) {
                            return 1;
                        }
                        return 0;
                    })
            );

            grunt.task.run('copy:' + docsType + 'html');
        };
    }

    grunt.registerTask('demohtml', 'Build demo HTML', createDocsTask('demo', skySrcPath, '/docs/'));
    grunt.registerTask('patternshtml', 'Build patterns HTML', createDocsTask('patterns', skyPatternsPath, '', 'PatternController'));

    grunt.registerTask('l10n', function () {
        var template = grunt.file.read(skyLocalesPath + 'template.js');

        grunt.file.expand(
            {
                filter: 'isDirectory',
                cwd: '.'
            },
            skyLocalesPath + '*'
        ).forEach(function (dir) {
            var destFile,
                js,
                locale,
                parts = dir.split('/');
            
            locale = parts[parts.length - 1];
            
            js = 'bbResourcesOverrides = ' + grunt.file.read(dir + '/strings.json') + ';';
            js = template.replace('/*LOCALEJSON*/', js);
            
            destFile = skyDistPath + 'js/locales/sky-locale-' + locale + '.js';
            
            grunt.file.write(destFile, js);
            
            grunt.log.writeln('File "' + destFile + '" created.');
        });
    });
};
