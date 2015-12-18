/**
* Grunt configuration file.
* Bobby Earl, 2015-01-27
*
* TODO
*   - Implement grunt-filerev when performing blackbaud:build.
*   - Work on error codes when serving.  Maybe not even necessary since it's just local.
*       If we do it, it needs to handle relative asset linking outside of Assemble.
*       Inspiration: https://github.com/gruntjs/grunt-contrib-connect/issues/30
**/

/*jslint node: true, nomen: true, plusplus: true */
module.exports = function (grunt) {
    'use strict';

    var assemble,
        cheerio,
        defaults,
        header,
        jit,
        merge,
        navSearchFiles,
        tasks,
        utils,
        yfm;

    assemble = require('assemble');
    cheerio = require('cheerio');
    jit = require('jit-grunt');
    merge = require('merge');
    yfm = require('assemble-yaml');

    // No reason to pass files used for search around in grunt.config
    navSearchFiles = [];

    // Original reference to the header logging function.
    // Disabling grunt header unless verbose is enabled
    header = grunt.log.header;
    grunt.log.header = function () {};

    /**
     * Grunt config defaults
     */
    defaults = {

        // Holds the project's global (and local) configurations.
        stache: {

            // Stores all YAML configuration properties (extends global Stache YAML).
            config: {},

            // The relative path to the Stache NPM package.
            // (Necessary since we are actually running in the root project folder.)
            dir: 'node_modules/blackbaud-stache/',

            // Filters receive and return data, and should contain valid functions.
            filters: {
                preHandlebars: [],
                postHandlebars: [
                    function (data) {
                        return utils.slugifyHeaders(data);
                    }
                ]
            },

            // Used by the expandFileMappings task to create static file maps.
            globPatterns: {
                content: {
                    expand: true,
                    cwd: '<%= stache.config.content %>',
                    dest: '<%= stache.config.build %>',
                    src: [
                        '**/*.md',
                        '**/*.hbs',
                        '**/*.html'
                    ]
                }
            },

            // Any Grunt tasks we wish to run at certain times in the build process
            // should be added here.
            hooks: {
                preStache: [],
                postStache: [],
                preAssemble: [],
                postAssemble: []
            },

            // Manually provide an array of pages to build.
            pages: [],

            // Path to local configuration file.
            pathConfig: 'stache.yml',

            // An array of selectors to remove from searched page's DOM content.
            searchContentToRemove: [
                '.bb-navbar',
                '.nav-sidebar',
                '.footer-site',
                'script'
            ],

            // Used to determine file locations, build or serve.
            // This means when a user calls build or serve, the assembled files
            // will go into build or serve folder.
            status: ''
        },

        // Takes the 'grunt help' title and converts it into fun ASCII art.
        asciify: {
            help: {
                text: 'Blackbaud STACHE',
                options: {
                    font: 'cybermedium',
                    log: true
                }
            }
        },

        // Static site generator.
        assemble: {
            options: {
                assets: '<%= stache.config.build %>',
                data: '<%= stache.config.data %>**/*.*',
                helpers: ['helper-moment', '<%= stache.config.helpers %>helpers.js'],
                partials: ['<%= stache.config.partials %>**/*.hbs'],
                layoutdir: '<%= stache.config.layouts %>',
                layoutext: '.hbs',
                layout: 'layout-container',
                stache: '<%= stache %>',

                // https://github.com/assemble/assemble/pull/468#issuecomment-38730532
                initializeEngine: function (engine, options)  {
                    var search = "{{\\s*body\\s*}}";
                    engine.bodyRegex = new RegExp(search, 'ig');
                    engine.init(options, { grunt: grunt, assemble: assemble });
                },

                getBypassContext: function () {
                    return grunt.config.get('bypassContext');
                }
            },
            site: {
                options: {},
                files: []
            },
            custom: {}
        },

        // Listing our available tasks
        availableTasks: {
            tasks: {
                options: {
                    filter: 'include',
                    tasks: [
                        'build',
                        'help',
                        'new',
                        'prepare',
                        'publish',
                        'serve',
                        'version'
                    ]
                }
            }
        },

        // Cleans the specified folder before serve/build.
        clean: {
            build: {
                src: ['<%= stache.config.build %>']
            }
        },

        // Creates a local server.
        connect: {
            dev: {
                options: {
                    base: [
                        '<%= stache.config.build %>',
                        '<%= stache.config.src %>',
                        '<%= stache.config.content %>',
                        '<%= stache.config.static %>'
                    ],
                    livereload: grunt.option('livereload') || '<%= stache.config.livereload %>',
                    port: grunt.option('port') || '<%= stache.config.port %>'
                }
            }
        },

        // Copies files from the source directory, into production.
        copy: {
            build: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= stache.config.src %>',
                        src: 'views/*.*',
                        dest: '<%= stache.config.build %>'
                    },
                    {
                        expand: true,
                        cwd: '<%= stache.config.src %>img/',
                        src: '**',
                        dest: '<%= stache.config.build %>img/'
                    },
                    {
                        expand: true,
                        cwd: '<%= stache.dir %>src/vendor/bb-sky-sass/dist/css/fonts/',
                        src: '*',
                        dest: '<%= stache.config.build %>css/fonts/'
                    },
                    {
                        expand: true,
                        cwd: '<%= stache.config.content %>assets',
                        src: '**/*.*',
                        dest: '<%= stache.config.build %>assets'
                    },
                    {
                        expand: true,
                        cwd: '<%= stache.config.static %>',
                        src: '**/*.*',
                        dest: '<%= stache.config.build %>'
                    },
                    {
                        expand: true,
                        cwd: '<%= stache.config.src %>css/',
                        src: '*.*',
                        dest: '<%= stache.config.build %>css/'
                    },
                    {
                        src: '<%= stache.config.src %>js/stache.min.js',
                        dest: '<%= stache.config.build %>js/stache.min.js'
                    },
                    {
                        src: '<%= stache.config.src %>js/azure.js',
                        dest: '<%= stache.config.build %>js/azure.js'
                    }
                ]
            }
        },

        // Mangling causes AngularJS issues. (Please be careful turning this back on.)
        uglify: {
            options: {
                mangle: false
            }
        },

        // Replaces un-optimized references to assets with their optimized versions.
        useminPrepare: {
            html: '<%= stache.config.build %>index.html',
            options: {
                assetsDirs: [
                    '<%= stache.config.src %>'
                ],
                dest: '<%= stache.config.build %>',
                root: [
                    '<%= stache.config.src %>',
                    '<%= stache.config.static %>'
                ],
                flow: {
                    steps: {
                        js: ['concat', 'uglify'],
                        css: ['concat']
                    },
                    post: {}
                }
            }
        },
        usemin: {
            html: '<%= stache.config.build %>**/*.html'
        },

        // When serving, watch for changes.
        watch: (function () {
            var core,
                pages;

            core = {
                files: [
                    '<%= stache.config.includes %>**/*.*',
                    'stache.yml'
                ],
                tasks: [
                    'status:serve',
                    'expandFileMappings',
                    'createAutoPages',
                    'createAutoNav',
                    'hook:preAssemble',
                    'assemble',
                    'hook:postAssemble',
                    'copy:build'
                ]
            };
            pages = {
                files: [
                    '<%= stache.config.content %>**/*.*',
                    '<%= stache.config.static %>**/*.*'
                ],
                tasks: [
                    'status:serve',
                    'expandFileMappings',
                    'createAutoNav',
                    'hook:preAssemble',
                    'newer:assemble',
                    'hook:postAssemble',
                    'copy:build'
                ]
            };

            return {
                options: {
                    livereload: grunt.option('livereload') || '<%= stache.config.livereload %>'
                },
                all: {
                    files: (function (arr) {
                        arr.push.apply(pages.files);
                        arr.push.apply(core.files);
                        return arr;
                    }([])),
                    tasks: core.tasks
                },
                core: core,
                pages: pages
            };
        }())
    };

    /**
     * Grunt tasks
     */
    tasks = {
        /**
         * Creates pages from jsdoc and sandcastle specifications.
         */
        createAutoPages: function () {
            var found,
                pages,
                processStacheCastleSingleNode,
                processStacheCastleMultipleNodes;

            pages = {};
            found = false;

            processStacheCastleSingleNode = function (page, node, parents, siblings) {
                var parentsToSend,
                    siblingsToSend;

                // Create the page for assemble to make
                node.layout = 'layout-' + page.type;
                node.parents = parents;

                // Only add siblings if there are no more children (mirros Sandcastle output)
                if (!node.HelpTOCNode && siblings) {
                    siblingsToSend = [];
                    siblings.forEach(function (sibling) {
                        siblingsToSend.push({
                            Title: sibling.Title,
                            Url: sibling.Url
                        });
                    });
                    node.siblings = siblingsToSend;
                }

                // Assemble expects the index to the where the page would exist
                pages[node.Url.replace('.htm', '/index.md').replace('html/', page.dest)] = {
                    type: page.type,
                    data: node
                };

                // Recursively keep looking for pages
                if (node.HelpTOCNode) {
                    parentsToSend = parents.slice(0);
                    parentsToSend.push({
                        Title: node.Title,
                        Url: node.Url
                    });
                    processStacheCastleMultipleNodes(page, node.HelpTOCNode, parentsToSend);
                }
            };

            processStacheCastleMultipleNodes = function (page, node, parents) {
                if (node) {
                    if (node.length > 0) {
                        node.forEach(function (v, idx) {
                            processStacheCastleSingleNode(page, v, parents, node);
                        });
                    } else {
                        processStacheCastleSingleNode(page, node, parents);
                    }
                }
            };

            grunt.config.get('stache.pages').forEach(function (page) {
                var json,
                    i,
                    j;

                if (page.url) {
                    if (grunt.file.exists(page.url)) {
                        found = true;
                        json = grunt.file.readJSON(page.url);
                        switch (page.type) {
                            case 'jsdoc':
                                for (i = 0, j = json.length; i < j; i++) {
                                    json[i].layout = 'layout-' + page.type;
                                    pages[page.dest + json[i].key + '/index.md'] = {
                                        data: json[i]
                                    };
                                }
                            break;
                            case 'sandcastle':
                                processStacheCastleMultipleNodes(page, json.HelpTOC.HelpTOCNode, []);
                            break;
                            case 'powershell':
                                json = json.cmdlet;
                                for (i = 0, j = json.length; i < j; i++) {
                                    json[i].layout = 'layout-' + page.type;
                                    pages[page.dest + json[i].name + '/index.md'] = {
                                        data: json[i]
                                    };
                                }
                            break;
                            default:
                                grunt.log.writeln('Unknown custom page datatype.');
                            break;
                        }
                    }
                } else {
                    grunt.log.error('"url" is required for each item in "stache.pages."');
                }
            });

            // Assemble requires even dummy files to run this task.
            if (found) {
                grunt.config.set('assemble.custom', {
                    options: {
                        pages: pages
                    },
                    files: [{
                        dest: '<%= stache.config.build %>',
                        src: 'noop'
                    }]
                });
            }
        },

        /**
         * Creates an object named 'nav_links' representative of all pages and
         * their hierarchies. This object is widely used by the Handlebars engine
         * when building navigation patterns.
         */
        createAutoNav: function () {

            var contentDir,
                files,
                filesConfig,
                nav_exclude,
                navKey,
                pages,
                root,
                sandcastleCounter,
                sandcastlePath,
                sorted;

            // User has manually specific nav_links in stache.yml. Let's use that.
            if (grunt.config('stache.config.nav_type') !== 'directory') {
                grunt.config.set('bypassContext', grunt.config.get('stache.config.nav_links'));
                return;
            }

            // Set initial values
            sorted = [];
            root = 'bypassContext';
            navKey = '.nav_links';
            sandcastlePath = '';
            sandcastleCounter = 1;
            contentDir = grunt.config.get('stache.config.content');
            filesConfig = grunt.config.get('stache.globPatterns.content');
            files = grunt.file.expand(filesConfig, filesConfig.src);
            nav_exclude = grunt.config.get('stache.config.nav_exclude') || [];

            // Reset bypassContext
            grunt.config.set(root + navKey, []);

            // Add the pages from the content directory
            if (files) {
                files.forEach(function (file) {
                    var fm = yfm.extractJSON(contentDir + file);
                    if (typeof fm.published === 'undefined' || fm.published !== false) {
                        grunt.verbose.writeln("Adding nav_link from content/ " + file);
                        sorted.push({
                            abspath: file,
                            rootdir: file.substr(0, file.indexOf('/')),
                            subdir: file.substr(0, file.lastIndexOf('/')),
                            filename: file.substr(file.lastIndexOf('/') + 1),
                            frontmatter: fm,
                            type: 'local'
                        });
                    }
                });
            }

            // Add any dynamically created pages here.
            pages = grunt.config.get('assemble.custom.options.pages');
            if (pages && pages.length) {
                pages.forEach(function (page) {
                    sorted.push({
                        abspath: page,
                        rootdir: page.substr(0, page.indexOf('/')),
                        subdir: page.substr(0, page.lastIndexOf('/')),
                        filename: page.substr(page.lastIndexOf('/') + 1),
                        frontmatter: pages[page].data,
                        type: pages[page].type
                    });
                });
            }

            // Sorting alphabetically ensures that parents are created first.
            // This is crucial to this process.  We can sort by order below.
            utils.sort(sorted, true, 'subdir', '');

            // Create the nav_links array.
            if (sorted) {
                sorted.forEach(function (el, idx) {

                    var path = root,
                        rootdir = el.rootdir,
                        subdir = el.subdir,
                        filename = el.filename,
                        separator = grunt.config.get('stache.config.nav_title_separator') || ' ',
                        home = grunt.config.get('stache.config.nav_title_home') || 'home',
                        file = filename.replace('.md', '.html').replace('.hbs', '.html'),
                        item = el.frontmatter,
                        subdirParts,
                        pathCurrent,
                        pathCurrentItem,
                        found,
                        index,
                        i,
                        j,
                        m,
                        n;

                    // A few programmatically created front-matter variables
                    item.showInNav = typeof item.showInNav !== 'undefined' ? item.showInNav : true;
                    item.showInHeader = typeof item.showInHeader !== 'undefined' ? item.showInHeader : true;
                    item.showInFooter = typeof item.showInFooter !== 'undefined' ? item.showInFooter : true;
                    item.showInSearch = typeof item.showInSearch !== 'undefined' ? item.showInSearch : true;
                    item.breadcrumbs = item.breadcrumbs || (subdir ? utils.createTitle(subdir, separator, true) : home);
                    item.name = grunt.config.process(item.name || (subdir ? utils.createTitle(subdir, separator, false) : home));
                    item.abspath = el.abspath;

                    // User hasn't specifically told us to ignore this page, let's look in the stache.yml array of nav_exclude
                    if (item.showInNav) {
                        nav_exclude.forEach(function (f) {
                            if (item.abspath.indexOf(f) > -1) {
                                item.showInNav = false;
                                return;
                            }
                        });
                    }

                    // Sandcastle is a strange case as we need to confirm it's subdir exists the first time,
                    // Then we can just add it to the array.  IF we don't do this, things get very slow!
                    if (el.type === 'sandcastle' && sandcastlePath !== '') {
                        path = sandcastlePath + '.' + (sandcastleCounter++);
                    } else {

                        // Nested directories
                        if (subdir) {

                            // Split the subdir into its different directories
                            subdirParts = subdir.split('/');
                            for (i = 0, j = subdirParts.length; i < j; i++) {
                                index = 0;
                                path += navKey;

                                // Is the current path already an array?
                                pathCurrent = grunt.config.get(path);

                                // It is an array, let's try to find the index for our current subDirPart
                                if (grunt.util.kindOf(pathCurrent) === 'array') {
                                    found = false;

                                    for (m = 0, n = pathCurrent.length; m < n; m++) {
                                        pathCurrentItem = grunt.config.get(path + '.' + m);
                                        if (pathCurrentItem.uri && pathCurrentItem.uri.indexOf('/' + subdirParts[i] + '/') > -1) {
                                            found = true;
                                            index = m;
                                            break;
                                        }
                                    }

                                    // Our array has previous items but no match was found, let's add a new item
                                    if (pathCurrent.length > 0 && !found) {
                                        index = pathCurrent.length;
                                    }

                                    path += '.' + index;

                                // It's not an array, which means we need to create the links property
                                } else {
                                    grunt.config.set(path, []);

                                    // Catch the path for the first sandcastle file we hit
                                    if (el.type === 'sandcastle' && sandcastlePath === '') {
                                        sandcastlePath = path;
                                    }

                                    path += '.0';
                                }

                            }

                        } else {
                            path += navKey;
                            path += '.' + grunt.config.get(path).length;
                        }
                    }

                    // Show in nav superceeds showInHeader and showInFooter
                    if (!item.showInNav) {
                        grunt.verbose.writeln('Ignoring: ' + item.abspath);
                        item.showInHeader = item.showInFooter = item.showInNav;
                    }

                    // Record this url
                    item.uri = item.uri || (subdir ? ('/' + subdir) : '') + (file === 'index.html' ? '/' : ('/' + file));
                    grunt.config.set(path, item);
                    navSearchFiles.push(item);

                    grunt.verbose.writeln('Created nav_link ' + item.uri);

                });
            }

            // Now we can rearrange each item according to order
            utils.sortByOrder(root + navKey, true);
        },

        /**
         * Creates and returns an array of static src->dest mappings for files,
         * based on a glob pattern. Grunt Newer cannot use glob patterns, so this
         * is a requirement to watch for recently changed files.
         */
        expandFileMappings: function () {
            var mappings,
                files,
                filesConfig;

            mappings = [];
            filesConfig = grunt.config.get('stache.globPatterns.content');
            files = grunt.file.expand(filesConfig, filesConfig.src);

            if (files) {
                files.forEach(function (file) {
                    var destinationFile = '<%= stache.config.build %>' + file.substring(0, file.lastIndexOf(".")) + '.html';
                    grunt.verbose.writeln("Built File Map: " + '<%= stache.config.content %>' + file + " --> " + destinationFile);
                    mappings.push({
                        src: '<%= stache.config.content %>' + file,
                        dest: destinationFile
                    });
                });
            }

            grunt.config.set('assemble.site.files', mappings);

            return mappings;
        },

        /**
         * Internal task to control header logging.
         *
         * @param [boolean] toggle
         */
        header: function (toggle) {
            grunt.log.header = (toggle.toString() === 'true') ? header : function () {};
        },

        /**
         * Executes a list of registered Grunt tasks at a certain time in the build
         * process. For example, to execute a task before pages are assembled, you would
         * first add the task's name to stache.hooks.preAssemble. Then, you would run
         * the task 'hook:preAssemble'.
         *
         * @param [string] name - the name of the hook to execute
         */
        hook: function (name) {
            var depreciatedHooks,
                tasks,
                temp;

            tasks = [];
            temp = grunt.config.get('stache.hooks.' + name);
            depreciatedHooks = [
                'preStacheHooks',
                'postStacheHooks',
                'preAssembleHooks',
                'postAssembleHooks'
            ];

            // Check if any depreciated hook names are registered.
            depreciatedHooks.forEach(function (name) {
                var hooks = grunt.config.get('stache.' + name);

                // Are there any depreciated hooks registered?
                if (hooks) {

                    // The user passed the hooks as an array
                    if (hooks.push && hooks.pop) {
                        hooks.forEach(function (hook) {
                            temp.push(hook);
                        });
                    }

                    // It's just a string
                    else {
                        temp.push(hooks);
                    }
                }
            });

            // If any hooks exist, add them to the tasks list and execute them.
            if (temp) {

                // Make sure the task list is an array.
                if (!temp.push && !temp.pop) {
                    temp = [temp];
                }

                // Only add the hooks if they reference actual tasks.
                temp.forEach(function (task) {
                    if (grunt.task.exists(task)) {
                        tasks.push(task);
                    }
                });

                // Run the hooks!
                if (tasks.length) {
                    grunt.task.run(tasks);
                }
            }
        },

        /**
         * Prepares the JSON for our search implementation.
         */
        prepareSearch: function () {
            var status = grunt.config.get('stache.status'),
                searchContentToRemove = grunt.config.get('stache.searchContentToRemove'),
                search = [],
                item,
                file,
                html,
                content,
                i,
                j,
                $$;

            function remove(selector) {
                $$(selector).remove();
            }

            for (i = 0, j = navSearchFiles.length; i < j; i++) {
                if (!navSearchFiles[i].showInSearch) {
                    grunt.verbose.writeln('Ignoring from search: ' + navSearchFiles[i].uri);
                } else {

                    item = navSearchFiles[i];
                    file = status + item.uri;

                    if (grunt.file.isDir(file)) {
                        file += 'index.html';
                    }

                    $$ = cheerio.load(grunt.file.read(file, 'utf8'));

                    // Nav links just clutter everything up
                    if (grunt.util.kindOf(searchContentToRemove) === 'array') {
                        searchContentToRemove.forEach(remove);
                    }

                    // Try specifically reading the content div
                    // Default to body if a content div doesn't exist
                    content = $$('.content');
                    if (content.length === 0) {
                        content = $$('body');
                    }

                    // Trim the text
                    item.text = content.text().replace(/\s{2,}/g, ' ');

                    // Save the result
                    search.push(item);
                }
            }

            grunt.file.write(status + '/content.json', JSON.stringify({ pages: search }, null, ' '));
        },

        /**
         * Masks 'grunt' command with 'stache'.
         */
        stache: function (optionalTask) {
            var key = '_tasks',
                task = optionalTask || 'help';
            if (grunt.task[key][task]) {
                grunt.task.run(task);
            } else {
                grunt.fail.fatal('Unknown command requested: ' + task);
            }
        },

        /**
         * Runs a series of tasks.
         * Adding the switch statement to get access to any context commands.
         * Not doing anything with the context currently, but we probably will,
         * in the near future.
         */
        stacheBuild: function (context) {
            var tasks = [];
            switch (context) {
                default:
                    tasks = [
                        'hook:preStache',
                        'status:build',
                        'expandFileMappings',
                        'clean:build',
                        'createAutoPages',
                        'createAutoNav',
                        'hook:preAssemble',
                        'assemble',
                        'hook:postAssemble',
                        'prepareSearch',
                        'useminPrepare',
                        'concat:generated',
                        'uglify:generated',
                        'usemin',
                        'copy:build',
                        'hook:postStache',
                    ];
                break;
            }
            grunt.task.run(tasks);
        },

        /**
         * Runs a series of tasks, issues a local server, and watches for newer
         * files, depending on the type of watch set in the stache.yml file.
         */
        stacheServe: function (context) {
            var tasks,
                watchNewer;

            // Only update the watchNewer property if it is explicitly set in bash.
            // Otherwise, we'll use the value set in the stache.yml config (see default, below).
            switch (context) {
                case 'newer':
                    watchNewer = true;
                break;
                case 'all':
                    watchNewer = false;
                break;
                default:
                    watchNewer = grunt.config.get('stache.config.watchNewer');
                break;
            }

            // Default serve tasks:
            tasks = [
                'hook:preStache',
                'status:serve',
                'expandFileMappings',
                'clean:build',
                'copy:build',
                'createAutoPages',
                'createAutoNav',
                'hook:preAssemble',
                'assemble',
                'hook:postAssemble',
                'prepareSearch',
                'connect'
            ];

            // Set the variable in the config
            grunt.config.set('stache.config.watchNewer', watchNewer);

            // Determine which watch task to execute:
            if (watchNewer) {
                tasks.push('watch:pages');
                tasks.push('watch:core');
                grunt.log.writeln("Stache is set to rebuild only those pages that have changed. (To rebuild the entire site, type `stache serve:all`.)");
            } else {
                tasks.push('watch:all');
                grunt.log.writeln("Stache is set to rebuild the entire site when content files change. (To rebuild only those pages that have changed, type `stache serve:newer`.)");
            }

            // Add the postStache hook:
            tasks.push('hook:postStache');

            // Run the tasks
            grunt.task.run(tasks);
        },

        /**
         * Sets current build/serve status.
         * Doesn't overwrite previous status (allows for external builds).
         *
         * @param [string] status - build or serve
         */
        status: function (status) {
            var key = 'stache.status';
            if (grunt.config.get(key) === '') {
                grunt.config.set(key, status);
            }
        }
    };

    /**
     * Utility functions
     */
    utils = {
        createTitle: function (name, separator, isBreadcrumbs) {
            var output = '',
                parts = name.indexOf('/') > -1 ? name.split('/') : [name];

            if (!isBreadcrumbs) {
                parts = parts.slice(-1);
            }

            parts.forEach(function (el, idx) {
                output += el[0].toUpperCase() + el.slice(1) + separator;
            });
            output = output.slice(0, 0 - separator.length);

            return output;
        },

        /**
         * Merges local and global Stache YAML files into stache.config.
         */
        extendStacheConfig: function () {
            var configFileString,
                localConfig,
                stache,
                stacheConfig;

            configFileString = grunt.option('config') || '';
            localConfig = {};
            stacheConfig = {};
            stache = grunt.config.get('stache');

            // Expand local Stache YAML files into workable object, if they exist.
            // (These files may have been supplied via '--config=my-config.yml'.)
            if (configFileString !== '') {

                // Multiple config files specified.
                if (configFileString.indexOf(',') > -1) {
                    configFileString.split(',').forEach(function (file) {
                        file = file.trim();
                        if (grunt.file.exists(file)) {
                            grunt.log.writeln('Importing config file ' + file);
                            localConfig = merge(localConfig, grunt.file.readYAML(file));
                        } else {
                            grunt.log.writeln('Error importing config file ' + file);
                        }
                    });

                }

                // Only one file specified.
                else if (grunt.file.exists(configFileString)) {
                    grunt.log.writeln('Importing config file ' + configFileString);
                    localConfig = grunt.file.readYAML(configFileString);
                }

                // The file does not exist.
                else {
                    grunt.log.error("The config file " + configFileString + " does not exist!");
                }
            }

            // Expand default local Stache YAML file into workable object, if it exists.
            else if (grunt.file.exists(stache.pathConfig)) {
                grunt.log.writeln('Defaulting to config file ' + stache.pathConfig);
                localConfig = grunt.file.readYAML(stache.pathConfig);
            }

            // Expand global Stache YAML file into workable object.
            if (grunt.file.exists(stache.dir + stache.pathConfig)) {
                stacheConfig = grunt.file.readYAML(stache.dir + stache.pathConfig);
            }

            // Merge global and local Stache config objects.
            stache.config = merge(stacheConfig, localConfig);
            grunt.config.set('stache.config', stache.config);
            return stache.config;
        },

        slugify: function (title) {
            if (typeof title === 'string') {
                title = title
                    .toLowerCase()
                    .replace(/ /g, '-')
                    .replace(/[^\w-]+/g, '');
            }
            return title;
        },

        slugifyHeaders: function (html) {
            var $html = cheerio(html);

            // Require all heading tags to have id attribute
            cheerio('h1, h2, h3, h4, h5, h6', $html).each(function () {
                var el = cheerio(this),
                    id = el.attr('id'),
                    after;
                if (typeof id === 'undefined' || id === '') {
                    el.attr('id', utils.slugify(el.text()));
                }
            });

            return cheerio.html($html);
        },

        /**
         * Sorts an array of objects.
         *
         * @param [array] arr - The array to sort
         * @param [boolean] sortAscending - Sort asc or dec
         * @param [string] prop - The field to sort by
         * @param [string] propDefault - The field to sort by if prop doesn't exist
         * @param [string] propIfEqual - The field to sort by if the compared values are equal (e.g., if 1 === 1, compare against another field)
         */
        sort: function (arr, sortAscending, prop, propDefault, propIfEqual) {
            arr.sort(function (a, b) {
                var ap = a[prop] || propDefault,
                    bp = b[prop] || propDefault;

                if (ap === bp && typeof propIfEqual !== 'undefined' && propIfEqual !== '') {
                    ap = a[propIfEqual];
                    bp = b[propIfEqual];
                }

                return utils.sortInner(ap, bp, sortAscending);
            });
        },

        sortInner: function (a, b, sortAscending) {
            if (a < b) {
                return sortAscending ? -1 : 1;
            } else if (a > b) {
                return sortAscending ? 1 : -1;
            } else {
                return 0;
            }
        },

        /**
         * Sorts nav_links by the YFM property 'order'.
         *
         * @param [string] key - The grunt config key that references an array of nav_links
         * @param [boolean] sortAscending - Sort asc or desc
         */
        sortByOrder: function (key, sortAscending) {
            var nav_links = grunt.config.get(key);
            utils.sort(nav_links, sortAscending, (sortAscending ? 'order' : 'uri'), 100, 'name');
            grunt.config.set(key, nav_links);
            nav_links.forEach(function (el, idx) {
                if (el.nav_links) {
                    utils.sortByOrder(key + '.' + idx + '.nav_links', sortAscending);
                }
            });
        }
    };

    // Merge options and defaults for the entire project.
    grunt.config.merge(defaults);

    // Merge local and global stache.yml config.
    utils.extendStacheConfig();

    // Dynamically load any NPM modules (some require static mappings).
    jit(grunt, {
        usemin: 'grunt-usemin',
        useminPrepare: 'grunt-usemin',
        availableTasks: 'grunt-available-tasks',
        'sass-blackbaud': 'grunt-sass'
    })({
        pluginsRoot: grunt.config.get('stache.dir') + 'node_modules/'
    });

    /**
     * Private Tasks
     * These tasks will be used by stache, but not available for end-user consumption.
     */
    grunt.registerTask('createAutoPages', tasks.createAutoPages);
    grunt.registerTask('createAutoNav', tasks.createAutoNav);
    grunt.registerTask('expandFileMappings', tasks.expandFileMappings);
    grunt.registerTask('header', tasks.header);
    grunt.registerTask('hook', tasks.hook);
    grunt.registerTask('prepareSearch', tasks.prepareSearch);
    grunt.registerTask('status', tasks.status);

    /**
     * Public Tasks
     * These tasks will be made available to end users of Stache.
     */

    // Bash command: stache [task]
    grunt.registerTask(
        'stache',
        tasks.stache
    );

    // Bash command: stache build
    grunt.registerTask(
        'build',
        'Build the documentation',
        tasks.stacheBuild
    );

    // Bash command: stache help
    grunt.registerTask(
        'help',
        'Display this help message.',
        [
            'asciify:help',
            'availableTasks'
        ]
    );

    /**
     * Bash command: stache new
     * This task is registered here in order to show up in the available
     * tasks help screen. (It's defined in the blackbaud-stache-cli package.)
     */
    grunt.registerTask(
        'new',
        'Create a new site using the STACHE boilerplate.',
        function () {}
    );

    // Bash command: stache serve
    grunt.registerTask(
        'serve',
        'Serve the documentation',
        tasks.stacheServe
    );

    // Bash command: stache version
    grunt.registerTask(
        'version',
        'Display the current installed stache version.',
        function () {
            grunt.log.writeln('Current stache version: ' + grunt.file.readJSON('node_modules/blackbaud-stache/package.json').version);
        }
    );

    // Expose certain things for testing purposes.
    return {
        tasks: tasks,
        utils: utils
    };
};
