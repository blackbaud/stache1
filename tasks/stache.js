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
'use strict';

// For merging our YAML files
var merge = require('merge'),
    yfm = require('assemble-yaml'),
    cheerio = require('cheerio'),
    assemble = require('assemble');

module.exports = function (grunt) {

    // No reason to pass files used for search around in grunt.config
    var navSearchFiles = [],
        header = grunt.log.header,
        localConfig = {},
        stacheConfig = {},
        optionConfig = grunt.option('config') || '',
        optionConfigArray,
        defaults,
        tasks;

    // Original reference to the header logging function.
    // Disabling grunt header unless verbose is enabled
    grunt.log.header = function () {};

    // Default configuration
    defaults = {

        stache: {

            // Necessary since we are actually running in the root project folder.
            // There's probably a clever grunt / node way to find this value in case it changes.
            dir: 'node_modules/blackbaud-stache/',

            // Used to determine file locations, build or serve
            // This means when a user calls build or serve, the assembled files
            // will go into build or serve folder.
            status: '',

            // Configuration file paths
            cli: grunt.option('cli'),
            pathConfig: 'stache.yml',
            pathPackage: 'package.json',
            package: '',
            config: '',

            // Imports to automatically generate pages from
            pages: [],
            preStacheHooks: '',
            postStacheHooks: '',
            preAssembleHooks: '',
            postAssembleHooks: '',
            postHandlebarsHooks: [
                slugifyHeaders
            ],
            searchContentToRemove: [
                '.bb-navbar',
                '.nav-sidebar',
                '.footer-site',
                'script'
            ]
        },

        // Displays our title all fancy-like
        asciify: {
            help: {
                text: 'Blackbaud STACHE',
                options: {
                    font: 'cybermedium',
                    log: true
                }
            }
        },

        // Static site gen
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
            custom: {},
            default: {
                options: {},
                files: [
                    {
                        expand: true,
                        cwd: '<%= stache.config.content %>',
                        dest: '<%= stache.config.build %>',
                        src: [
                            '**/*.md',
                            '**/*.hbs',
                            '**/*.html'
                        ]
                    }
                ]
            }
        },

        // Listing our available tasks
        availabletasks: {
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

        // Cleans the specified folder before serve/build
        clean: {
            build: {
                src: ['<%= stache.config.build %>']
            }
        },

        // Creates a server
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

        htmlmin: {
            build: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true,
                    removeEmptyAttributes: true,
                    removeCommentsFromCDATA: true,
                    removeRedundantAttributes: true,
                    collapseBooleanAttributes: true
                },
                files: [
                    {
                        expand: true,
                        cwd: '<%= stache.config.build %>',
                        src: '**/*.html',
                        dest: '<%= stache.config.build %>'
                    }
                ]
            }
        },

        // Mangling causes AngularJS issues.
        // Please be careful turning this back on.
        uglify: {
            options: {
                mangle: false
            }
        },

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

        // When serving, watch for file changes
        watch: {
            options: {
                livereload: grunt.option('livereload') || '<%= stache.config.livereload %>'
            },
            stache: {
                files: [
                    '<%= stache.config.content %>**/*.*',
                    '<%= stache.config.static %>**/*.*',
                    '<%= stache.config.includes %>**/*.*',
                    'stache.yml'
                ],
                tasks: [
                    'status:serve',
                    'createAutoPages',
                    'createAutoNav',
                    'assembleHooks:pre',
                    'assemble',
                    'assembleHooks:post',
                    'copy:build'
                ]
            }
        }
    };

    tasks = {
        createAutoNav: function () {

            var sorted,
                root,
                navKey,
                content,
                filesConfig,
                files,
                pages,
                page,
                nav_exclude,
                sandcastlePath,
                sandcastleCounter;

            // User has manually specific nav_links in stache.yml
            if (grunt.config('stache.config.nav_type') !== 'directory') {
                grunt.config.set('bypassContext', grunt.config.get('stache.config.nav_links'));
                return;
            }

            sorted = [];
            root = 'bypassContext';
            navKey = '.nav_links';
            content = grunt.config.get('stache.config.content');
            filesConfig = grunt.config.get('assemble.default.files.0');
            files = grunt.file.expand(filesConfig, filesConfig.src);

            grunt.config.set(root + navKey, []);

            files.forEach(function (file) {
                var fm = yfm.extractJSON(content + file);
                if (typeof fm.published === 'undefined' || fm.published !== false) {
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

            // Add any dynamically created pages here.
            pages = grunt.config.get('assemble.custom.options.pages');
            if (pages) {
                for (page in pages) {
                    if (pages.hasOwnProperty(page)) {
                        sorted.push({
                            abspath: page,
                            rootdir: page.substr(0, page.indexOf('/')),
                            subdir: page.substr(0, page.lastIndexOf('/')),
                            filename: page.substr(page.lastIndexOf('/') + 1),
                            frontmatter: pages[page].data,
                            type: pages[page].type
                        });
                    }
                }
            }

            // Sort alphabetically ensures that parents are created first.
            // This is crucial to this process.  We can sort by order below.
            sort(sorted, true, 'subdir', '');

            nav_exclude = grunt.config.get('stache.config.nav_exclude') || [];
            sandcastlePath = '';
            sandcastleCounter = 1;

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
                item.breadcrumbs = item.breadcrumbs || (subdir ? createTitle(subdir, separator, true) : home);
                item.name = grunt.config.process(item.name || (subdir ? createTitle(subdir, separator, false) : home));
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

                grunt.log.writeln('Created nav_link ' + item.uri);

            });

            // Now we can rearrange each item according to order
            sortRecursive(root + navKey, true);
        }
    };

    /**
    ****************************************************************
    * PRIVATE METHODS
    ****************************************************************
    **/

    function slugifyHeaders(html) {
        var $html = cheerio(html);

        // Require all heading tags to have id attribute
        cheerio('h1, h2, h3, h4, h5, h6', $html).each(function () {
            var el = cheerio(this),
                id = el.attr('id'),
                after;
            if (typeof id === 'undefined' || id === '') {
                el.attr('id', slugify(el.text()));
            }
        });

        return cheerio.html($html);
    }

    function slugify(title) {
        if (typeof title === 'string') {
            title = title
                .toLowerCase()
                .replace(/ /g, '-')
                .replace(/[^\w-]+/g, '');
        }
        return title;
    }

    function createTitle(name, separator, isBreadcrumbs) {
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
    }

    function sort(arr, sortAscending, prop, propDefault, propIfEqual) {
        arr.sort(function (a, b) {
            var ap = a[prop] || propDefault,
                bp = b[prop] || propDefault;

            if (ap === bp && typeof propIfEqual !== 'undefined' && propIfEqual !== '') {
                ap = a[propIfEqual];
                bp = b[propIfEqual];
            }

            return sortInner(ap, bp, sortAscending);
        });
    }

    function sortInner(a, b, sortAscending) {
        if (a < b) {
            return sortAscending ? -1 : 1;
        } else if (a > b) {
            return sortAscending ? 1 : -1;
        } else {
            return 0;
        }
    }

    function sortRecursive(key, sortAscending) {
        var nav_links = grunt.config.get(key);
        sort(nav_links, sortAscending, (sortAscending ? 'order' : 'uri'), 100, 'name');
        grunt.config.set(key, nav_links);
        nav_links.forEach(function (el, idx) {
            if (el.nav_links) {
                sortRecursive(key + '.' + idx + '.nav_links', sortAscending);
            }
        });
    }

    /**
    ****************************************************************
    * PRIVATE TASKS
    ****************************************************************
    **/

    // Internal task - sets current build/serve status
    // Doesn't overwrite previous status (allows for external builds)
    grunt.registerTask('status', function (status) {
        var key = 'stache.status';
        if (grunt.config.get(key) === '') {
            grunt.config.set(key, status);
        }
    });

    // Internal task to control header logging
    grunt.registerTask('header', function (toggle) {
        grunt.log.header = (toggle.toString() === 'true') ? header : function () {};
    });

    // Creates pages from jsdoc and sandcastle
    grunt.registerTask('createAutoPages', function () {
        var pages = {},
            found = false,
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
            },
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

        // Assemble requires even dummy files to run this task
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
    });

    // Creates nav to mirror directory structure
    grunt.registerTask('createAutoNav', tasks.createAutoNav);

    // Looks for preStacheHooks and postStacheHooks in config
    grunt.registerTask('stacheHooks', function (context) {
        var hooks = grunt.config.get('stache.' + context + 'StacheHooks');
        if (hooks) {
            grunt.task.run(hooks);
        }
    });

    // Looks for preAssembleHooks and postAssembleHooks in config
    grunt.registerTask('assembleHooks', function (context) {
        var hooks = grunt.config.get('stache.' + context + 'AssembleHooks');
        if (hooks) {
            grunt.task.run(hooks);
        }
    });

    // Prepare the JSON for our search implementation
    grunt.registerTask('prepareSearch', function () {
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
                grunt.log.writeln('Ignoring from search: ' + navSearchFiles[i].uri);
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
    });

    /**
    ****************************************************************
    * PUBLIC TASKS
    ****************************************************************
    **/

    grunt.registerTask(
        'build',
        'Build the documentation',
        [
            'stacheHooks:pre',
            'status:build',
            'clean',
            'createAutoPages',
            'createAutoNav',
            'assembleHooks:pre',
            'assemble',
            'assembleHooks:post',
            'prepareSearch',
            'useminPrepare',
            'concat:generated',
            'uglify:generated',
            'usemin',
            //'htmlmin:build',
            'copy:build',
            'stacheHooks:post'
        ]
    );

    grunt.registerTask(
        'help',
        'Display this help message.',
        [
            'asciify:help',
            'availabletasks'
        ]
    );

    // This method is registered here in order to show up in the available tasks help screen.
    // It's defined in the blackbaud-stache-cli package though.
    grunt.registerTask(
        'new',
        'Create a new site using the STACHE boilerplate.',
        function () {}
    );

    grunt.registerTask(
        'serve',
        'Serve the documentation',
        [
            'stacheHooks:pre',
            'status:serve',
            'clean',
            'copy:build',
            'createAutoPages',
            'createAutoNav',
            'assembleHooks:pre',
            'assemble',
            'assembleHooks:post',
            'prepareSearch',
            'connect',
            'watch',
            'stacheHooks:post'
        ]
    );

    grunt.registerTask(
        'version',
        'Display the current installed stache version.',
        function () {
            grunt.log.writeln('Current stache version: ' + grunt.file.readJSON('node_modules/blackbaud-stache/package.json').version);
        }
    );

    grunt.registerTask('stache', function (optionalTask) {
        var key = '_tasks',
            task = optionalTask || 'help';
        if (grunt.task[key][task]) {
            grunt.task.run(task);
        } else {
            grunt.fail.fatal('Unknown command requested: ' + task);
        }
    });

    /**
    ****************************************************************
    * CONSTRUCTOR
    ****************************************************************
    **/

    // Read local files
    if (optionConfig !== '') {

        // Multiple config files specified
        if (optionConfig.indexOf(',') > -1) {
            optionConfigArray = optionConfig.split(',');
            optionConfigArray.forEach(function (file) {
                if (grunt.file.exists(file)) {
                    grunt.log.writeln('Importing config file ' + file);
                    localConfig = merge(localConfig, grunt.file.readYAML(file));
                } else {
                    grunt.log.writeln('Error importing config file ' + file);
                }
            });
        } else if (grunt.file.exists(optionConfig)) {
            grunt.log.writeln('Importing config file ' + optionConfig);
            localConfig = grunt.file.readYAML(optionConfig);
        }

    // Read default local file, if it exists
    } else if (grunt.file.exists(defaults.stache.pathConfig)) {
        grunt.log.writeln('Defaulting to config file ' + defaults.stache.pathConfig);
        localConfig = grunt.file.readYAML(defaults.stache.pathConfig);
    }

    // Add package info to stache
    if (grunt.file.exists(defaults.stache.pathPackage)) {
        defaults.stache.package = grunt.file.readJSON(defaults.stache.pathPackage);
    }

    // Read stache files
    if (grunt.file.exists(defaults.stache.dir + defaults.stache.pathConfig)) {
        stacheConfig = grunt.file.readYAML(defaults.stache.dir + defaults.stache.pathConfig);
    }

    defaults.stache.config = merge(stacheConfig, localConfig);
    grunt.config.merge(defaults);

    // Dynamically load our modules
    require('jit-grunt')(grunt, {
        usemin: 'grunt-usemin',
        useminPrepare: 'grunt-usemin',
        availabletasks: 'grunt-available-tasks',
        'sass-blackbaud': 'grunt-sass'
    })({
        pluginsRoot: defaults.stache.dir + 'node_modules/'
    });

    return {
        tasks: tasks
    };

};
