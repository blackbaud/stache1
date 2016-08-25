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
        merge,
        navSearchFiles,
        slog,
        tasks,
        utils,
        yfm;


    assemble = require('assemble');
    cheerio = require('cheerio');
    merge = require('merge');
    slog = require('../src/vendor/stache-log/stache-log')(grunt);
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
            config: {
                paths: {}
            },

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
                },
                layouts: {
                    expand: true,
                    cwd: '<%= stache.config.layouts %>',
                    src: ['**/*.hbs']
                },
                layoutsCustom: {
                    expand: true,
                    cwd: '<%= stache.config.paths.custom %>layouts/',
                    src: ['**/*.hbs']
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
                plugins: [],

                // https://github.com/assemble/assemble/pull/468#issuecomment-38730532
                initializeEngine: function (engine, options)  {
                    var search = "{{\\s*body\\s*}}";
                    engine.bodyRegex = new RegExp(search, 'ig');
                    engine.init(options, {
                        grunt: grunt,
                        assemble: assemble
                    });
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
        availabletasks: {
            tasks: {
                options: {
                    filter: 'include',
                    tasks: [
                        'build',
                        'help',
                        'new',
                        'release',
                        'serve',
                        'version'
                    ]
                }
            }
        },

        bump: {
            options: {
                files: ['package.json'],
                updateConfigs: [],
                commit: true,
                commitMessage: 'Release v%VERSION%',
                commitFiles: ['package.json'],
                createTag: false,
                tagName: 'v%VERSION%',
                tagMessage: 'Version %VERSION%',
                push: true,
                pushTo: 'origin',
                gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
                globalReplace: false,
                prereleaseName: false,
                metadata: '',
                regExp: false
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
            stache: {
                options: {
                    base: [
                        '<%= stache.config.static %>',
                        '<%= stache.config.src %>',
                        '<%= stache.config.build %>'
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
                        dest: '<%= stache.config.build %><%= stache.config.base %>'
                    },
                    {
                        expand: true,
                        cwd: '<%= stache.config.src %>img/',
                        src: '**',
                        dest: '<%= stache.config.build %><%= stache.config.base %>img/'
                    },
                    {
                        expand: true,
                        cwd: '<%= stache.dir %>src/vendor/bb-sky-sass/dist/css/fonts/',
                        src: '*',
                        dest: '<%= stache.config.build %><%= stache.config.base %>css/fonts/'
                    },
                    {
                        expand: true,
                        cwd: '<%= stache.dir %>src/vendor/bb-omnibar-search/',
                        src: '**',
                        dest: '<%= stache.config.build %><%= stache.config.base %>/assets/vendor/bb-omnibar-search/'
                    },
                    {
                        expand: true,
                        cwd: '<%= stache.config.content %>assets',
                        src: '**/*.*',
                        dest: '<%= stache.config.build %><%= stache.config.base %>assets'
                    },
                    {
                        expand: true,
                        cwd: '<%= stache.config.static %>',
                        src: [
                            '**/*.*',
                            '!web.config'
                        ],
                        dest: '<%= stache.config.build %><%= stache.config.base %>'
                    },
                    {
                        src: '<%= stache.config.static %>web.config',
                        dest: '<%= stache.config.build %>web.config'
                    },
                    {
                        expand: true,
                        cwd: '<%= stache.config.src %>css/',
                        src: '*.*',
                        dest: '<%= stache.config.build %><%= stache.config.base %>css/'
                    },
                    {
                        src: '<%= stache.config.src %>js/stache.min.js',
                        dest: '<%= stache.config.build %><%= stache.config.base %>js/stache.min.js'
                    },
                    {
                        src: '<%= stache.config.src %>js/swagger.min.js',
                        dest: '<%= stache.config.build %><%= stache.config.base %>js/swagger.min.js'
                    }
                ]
            }
        },

        // Watch certain files and perform tasks when they change.
        watch: {
            options: {
                livereload: grunt.option('livereload') || '<%= stache.config.livereload %>',
                newerFiles: [
                    '<%= stache.config.content %>**/*.*',
                    '<%= stache.config.static %>**/*.*'
                ]
            },
            core: {
                files: [
                    '<%= stache.config.includes %>**/*.*',
                    '<%= stache.config.data %>*.*',
                    'stache.yml'
                ],
                tasks: [
                    'hook:preStache',
                    'status:serve',
                    'expandFileMappings',
                    'createAutoPages',
                    'createAutoNav',
                    'hook:preAssemble',
                    'assemble',
                    'hook:postAssemble',
                    'copy:build',
                    'hook:postStache'
                ]
            }
        }
    };


    /**
     * Grunt tasks
     */
    tasks = {
        /**
         * Creates pages from jsdoc, sandcastle, and powershell specifications.
         */
        createAutoPages: function () {
            var found,
                pages,
                processStacheCastleSingleNode,
                processStacheCastleMultipleNodes;

            processStacheCastleMultipleNodes = function (page, node, parents) {
                if (node) {
                    if (node.length > 0) {
                        node.forEach(function (v) {
                            processStacheCastleSingleNode(page, v, parents, node);
                        });
                    } else {
                        processStacheCastleSingleNode(page, node, parents);
                    }
                }
            };

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

            pages = grunt.config.get('assemble.custom.options.pages');

            if (pages) {
                found = true;
            } else {
                pages = {};
                found = false;
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
                                slog.warning('Unknown custom page datatype.');
                                break;
                            }
                        }
                    } else {
                        slog('tasks.createAutoPages() - "url" is required for each item in "stache.pages."');
                    }
                });
            }

            // Assemble requires even dummy files to run this task.
            if (found) {
                grunt.config.set('assemble.custom', {
                    options: {
                        pages: pages
                    },
                    files: [{
                        dest: '<%= stache.config.build %><%= stache.config.base %>',
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

            var base,
                contentDir,
                files,
                filesConfig,
                nav_exclude,
                navKey,
                page,
                pages,
                root,
                sandcastleCounter,
                sandcastlePath,
                sorted;

            slog("Building navigation links...Please wait.");

            // User has manually specific nav_links in stache.yml. Let's use that.
            if (grunt.config('stache.config.nav_type') !== 'directory') {
                grunt.config.set('bypassContext', grunt.config.get('stache.config.nav_links'));
                slog("Navigation links set in config.");
                slog.success("Done.");
                return;
            }

            // Set initial values
            sorted = [];
            root = 'bypassContext';
            navKey = '.nav_links';
            sandcastlePath = '';
            sandcastleCounter = 1;
            base = grunt.config.get('stache.config.base');
            contentDir = grunt.config.get('stache.config.content');
            filesConfig = grunt.config.get('stache.globPatterns.content');
            files = grunt.file.expand(filesConfig, filesConfig.src);
            nav_exclude = grunt.config.get('stache.config.nav_exclude') || [];

            // Accommodate custom base
            base = utils.trimTrailingSlash(base);

            // Reset bypassContext
            grunt.config.set(root + navKey, []);

            // Add the pages from the content directory
            if (files) {
                files.forEach(function (file) {
                    var frontMatter;

                    frontMatter = yfm.extractJSON(contentDir + file);

                    if (typeof frontMatter.published === 'undefined' || frontMatter.published !== false) {
                        slog.verbose("Adding nav_link from content/ " + file);
                        sorted.push({
                            abspath: file,
                            rootdir: file.substr(0, file.indexOf('/')),
                            subdir: file.substr(0, file.lastIndexOf('/')),
                            filename: file.substr(file.lastIndexOf('/') + 1),
                            frontmatter: utils.fm.mergePageConfigWithLayout(frontMatter, file),
                            type: 'local'
                        });
                    }
                });
            }

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
                            frontmatter: utils.fm.mergePageConfigWithLayout(pages[page].data, page),
                            type: pages[page].type
                        });
                    }
                }
            }

            // Sorting alphabetically ensures that parents are created first.
            // This is crucial to this process.  We can sort by order below.
            utils.sort(sorted, [{
                key: 'subdir'
            }]);

            // Create the nav_links array.
            if (sorted) {
                sorted.forEach(function (el) {

                    var path = root,
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
                        slog.verbose('Ignoring: ' + item.abspath);
                        item.showInHeader = item.showInFooter = item.showInNav;
                    }

                    // Record this url
                    item.uri = base + (item.uri || (subdir ? ('/' + subdir) : '') + (file === 'index.html' ? '/' : ('/' + file)));
                    grunt.config.set(path, item);
                    navSearchFiles.push(item);

                    slog.verbose('Creating nav_link ' + item.uri);

                });
            }

            // Now we can rearrange each item according to order
            //utils.sortByOrder(root + navKey, true);
            utils.sortNavLinks();

            slog.success("Done.");
        },

        /**
         * Creates and returns an array of static src->dest mappings for files,
         * based on a glob pattern. Grunt Newer cannot use glob patterns, so this
         * is a requirement to watch for recently changed files.
         */
        expandFileMappings: function () {
            var base,
                mappings,
                files,
                filesConfig;

            mappings = [];
            base = grunt.config.get('stache.config.base');
            filesConfig = grunt.config.get('stache.globPatterns.content');
            files = grunt.file.expand(filesConfig, filesConfig.src);

            // Build has trailing slash so remove leading slash from base
            base = utils.trimLeadingSlash(base);

            if (files) {
                files.forEach(function (file) {
                    var destinationFile = '<%= stache.config.build %>' + base + file.substring(0, file.lastIndexOf(".")) + '.html';
                    slog.verbose("Building file map: " + '<%= stache.config.content %>' + file + " --> " + destinationFile);
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
            var tasks,
                temp;

            tasks = [];
            temp = grunt.config.get('stache.hooks.' + name);

            // If any hooks exist, add them to the tasks list and execute them.
            if (temp) {

                // Make sure the task list is an array.
                if (!utils.isArray(temp)) {
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

                // Update the hooks list.
                grunt.config.set('stache.hooks.' + name, tasks);
            }
        },

        /**
         * Prepares the JSON for our search implementation.
         */
        prepareSearch: function () {
            var destinationDir,
                status = grunt.config.get('stache.status'),
                resourceUrl = grunt.config.get('stache.config.omnibarSearch.resourceUrl'),
                searchContentToRemove = grunt.config.get('stache.searchContentToRemove'),
                search = [],
                item,
                file,
                content,
                i,
                j,
                $$;

            function remove(selector) {
                $$(selector).remove();
            }

            if (status === 'build') {
                destinationDir = grunt.config.get('stache.config.build');
            } else {
                destinationDir = status;
            }

            for (i = 0, j = navSearchFiles.length; i < j; i++) {
                if (!navSearchFiles[i].showInSearch) {
                    slog.verbose('Ignoring from search: ' + navSearchFiles[i].uri);
                } else {

                    item = navSearchFiles[i];
                    file = destinationDir + item.uri;

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

            grunt.file.write(destinationDir + resourceUrl, JSON.stringify({ pages: search }, null, ' '));
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
         * Bash command: stache build
         * Runs a series of tasks.
         * Adding the switch statement to get access to any context commands.
         * Not doing anything with the context currently, but we probably will,
         * in the near future.
         */
        stacheBuild: function (context) {
            var tasks = [];

            utils.setupHooks();

            console.log("stacheBuild");
            console.log(context);
            console.log("ENV:", process.env);

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
                    'copy:build',
                    'hook:postStache',
                ];
                break;
            }
            grunt.task.run(tasks);
        },

        /**
         * Bash command: stache help
         * Prints Stache's available commands.
         */
        stacheHelp: function () {
            grunt.task.run([
                'asciify:help',
                'availabletasks'
            ]);
        },

        /**
         * Bash command: stache new
         * This task is registered here in order to show up in the available
         * tasks help screen. (It's defined in the blackbaud-stache-cli package.)
         */
        stacheNew: function () {},

        stacheRelease: function (type) {
            type = type || 'patch';
            slog.muted("Running `stache release " + type + "`...");
            grunt.task.run('bump:' + type);
        },

        /**
         * Bash command: stache serve
         * Runs a series of tasks, issues a local server, and watches for newer
         * files, depending on the type of watch set in the stache.yml file.
         */
        stacheServe: function (context) {
            var tasks,
                watchNewer;

            utils.setupHooks();

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
                'connect:stache'
            ];

            // Set the variable in the config
            grunt.config.set('stache.config.watchNewer', watchNewer);

            // Determine which watch task to execute:
            if (watchNewer) {
                tasks.push('watch:newer');
                slog("Site set to rebuild only those pages that have been changed.");
                slog.muted("(To rebuild all pages when one is changed, type `stache serve:all`)".grey);
            } else {
                tasks.push('watch:all');
                slog("Site set to rebuild all pages when one is changed.");
                slog.muted("(To rebuild only those pages that have been changed, type `stache serve:newer`)".grey);
            }

            // Add the postStache hook:
            tasks.push('hook:postStache');

            // Run the tasks
            grunt.task.run(tasks);
        },

        /**
         * Bash command: stache version
         * Prints the current version of Stache in the console.
         */
        stacheVersion: function () {
            slog('Current stache version: ' + grunt.file.readJSON('node_modules/blackbaud-stache/package.json').version);
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
        },

        /**
         * Rebuilds all pages when any single page is changed.
         */
        watchAll: function () {
            grunt.config.merge({
                watch: {
                    all: {
                        files: defaults.watch.options.newerFiles,
                        tasks: defaults.watch.core.tasks
                    }
                }
            });
            grunt.task.run('watch');
        },

        /**
         * Only rebuilds those pages that have been changed during a serve session.
         */
        watchNewer: function () {
            grunt.config.merge({
                watch: {
                    newer: {
                        options: {
                            spawn: false
                        },
                        files: defaults.watch.options.newerFiles,
                        tasks: [
                            'hook:preStache',
                            'status:serve',
                            'hook:preAssemble',
                            'newer:assemble',
                            'hook:postAssemble',
                            'newer:copy:build',
                            'hook:postStache',
                        ]
                    }
                }
            });
            grunt.task.run('watch');
        }
    };


    /**
     * Utility functions
     */
    utils = {

        /**
         * Converts deprecated hooks to their supported counterparts.
         */
        checkDeprecatedHooks: function () {
            var deprecatedHookNames,
                hooks;

            deprecatedHookNames = [
                'preStacheHooks',
                'postStacheHooks',
                'preAssembleHooks',
                'postAssembleHooks'
            ];
            hooks = grunt.config.get('stache.hooks');

            // Check if any deprecated hook names are registered.
            deprecatedHookNames.forEach(function (deprecatedName) {
                var deprecatedHook,
                    hookName,
                    message;

                deprecatedHook = grunt.config.get('stache.' + deprecatedName);
                hookName = deprecatedName.replace("Hooks", "");

                // Are there any deprecated hooks registered?
                if (deprecatedHook) {

                    message = 'You are referencing the deprecated hook, ' + deprecatedName + '. Consider using `hooks.' + hookName + '`.';
                    slog.warning(message);

                    // The user passed the hooks as an array
                    if (utils.isArray(deprecatedHook)) {
                        deprecatedHook.forEach(function (hook) {
                            hooks[hookName].push(hook);
                        });
                    }

                    // It's just a string
                    else {
                        hooks[hookName].push(deprecatedHook);
                    }
                }
            });

            // Save the hooks.
            grunt.config.set('stache.hooks', hooks);
        },

        /**
         *
         *
         * @param {} []
         */
        checkDeprecatedYAML: function (config) {
            var i,
                keys,
                len;

            keys = [
                {
                    old: 'omnibar_delegation',
                    new: 'omnibar:\n    delegationUri: ' + config.omnibar_delegation,
                    assign: function (val) {
                        config.omnibar.delegationUri = val;
                    }
                },
                {
                    old: 'omnibar_help',
                    new: 'omnibar:\n    enableHelp: ' + config.omnibar_help,
                    assign: function (val) {
                        config.omnibar.enableHelp = val;
                    }
                },
                {
                    old: 'omnibar_link_enabled',
                    new: 'omnibar:\n    enableServiceNameLink: ' + config.omnibar_link_enabled,
                    assign: function (val) {
                        config.omnibar.enableServiceNameLink = val;
                    }
                },
                {
                    old: 'omnibar_search',
                    new: 'omnibar:\n    enableSearch: ' + config.omnibar_search,
                    assign: function (val) {
                        config.omnibar.enableSearch = val;
                    }
                },
                {
                    old: 'omnibar_link',
                    new: 'omnibar:\n    serviceNameLink: ' + config.omnibar_link,
                    assign: function (val) {
                        config.omnibar.serviceNameLink = val;
                    }
                },
                {
                    old: 'omnibar_signin',
                    new: 'omnibar:\n    signInRedirectUrl: ' + config.omnibar_signin,
                    assign: function (val) {
                        config.omnibar.signInRedirectUrl = val;
                    }
                },
                {
                    old: 'omnibar_signout',
                    new: 'omnibar:\n    signOutRedirectUrl: ' + config.omnibar_signout,
                    assign: function (val) {
                        config.omnibar.signOutRedirectUrl = val;
                    }
                },
                {
                    old: 'omnibar_title',
                    new: 'omnibar:\n    serviceName: ' + config.omnibar_title,
                    assign: function (val) {
                        config.omnibar.serviceName = val;
                    }
                }
            ];
            len = keys.length;

            for (i = 0; i < len; ++i) {
                if (config[keys[i].old]) {
                    slog.warning("The YAML variable `" + keys[i].old + "` is no longer supported! Use:\n------\n[stache.yml] \n" + keys[i].new + "\n------\n\n");
                    keys[i].assign.call(keys[i], config[keys[i].old]);
                }
            }
        },

        /**
         *
         *
         * @param {} []
         */
        createTitle: function (name, separator, isBreadcrumbs) {
            var output = '',
                parts = name.indexOf('/') > -1 ? name.split('/') : [name];

            if (!isBreadcrumbs) {
                parts = parts.slice(-1);
            }

            parts.forEach(function (el) {
                output += el[0].toUpperCase() + el.slice(1) + separator;
            });
            output = output.slice(0, 0 - separator.length);

            return output;
        },

        /**
         * Merges local and global Stache YAML files into stache.config.
         */
        getMergedStacheYaml: function () {
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
                            slog('Importing config file ' + file);
                            localConfig = merge.recursive(true, localConfig, grunt.file.readYAML(file));
                        } else {
                            slog.warning('Error importing config file ' + file);
                        }
                    });

                }

                // Only one file specified.
                else if (grunt.file.exists(configFileString)) {
                    slog('Importing config file ' + configFileString);
                    localConfig = grunt.file.readYAML(configFileString);
                }

                // The file does not exist.
                else {
                    grunt.log.error("The config file " + configFileString + " does not exist!");
                }
            }

            // Expand default local Stache YAML file into workable object, if it exists.
            else if (grunt.file.exists(stache.pathConfig)) {
                slog.muted('Defaulting to config file ' + stache.pathConfig);
                localConfig = grunt.file.readYAML(stache.pathConfig);
            }

            // Expand global Stache YAML file into workable object.
            if (grunt.file.exists(stache.dir + stache.pathConfig)) {
                stacheConfig = grunt.file.readYAML(stache.dir + stache.pathConfig);
            }

            // Merge global and local Stache config objects.
            stache.config = merge.recursive(true, stacheConfig, localConfig);
            return stache.config;
        },

        /**
         *
         *
         * @param {} []
         */
        isArray: function (arr) {
            return (arr.pop && arr.push);
        },

        /**
         * Sets global Stache config.
         */
        setStacheConfig: function (config) {
            utils.checkDeprecatedYAML(config);
            grunt.config.set('stache.config', config);
        },

        /**
         * Validates the format of hooks that were added to defaults.stache, or by third-parties.
         * This method also catches deprecated hooks from previous versions.
         */
        setupHooks: function () {
            var hook,
                hooks,
                message;

            hooks = grunt.config.get('stache.hooks');

            // Make sure the task list is an array.
            if (hooks) {
                for (hook in hooks) {
                    if (hooks.hasOwnProperty(hook)) {
                        if (!utils.isArray(hooks[hook])) {
                            message = 'The hooks in "' + hook + '" should be listed in an array format (for example, `[\'task1\', \'task2\', \'task3\']`).';
                            slog.warning(message);
                            hooks[hook] = [hooks[hook]];
                        }
                    }
                }
                grunt.config.set('stache.hooks', hooks);
            }

            // Add any deprecated hooks, if necessary.
            utils.checkDeprecatedHooks();
        },

        /**
         *
         *
         * @param {} []
         */
        slugify: function (title) {
            if (typeof title === 'string') {
                title = title
                    .toLowerCase()
                    .replace(/ /g, '-')
                    .replace(/[^\w-]+/g, '');
            }
            return title;
        },

        /**
         * Adds unique ID's to headings.
         *
         * @param {} []
         */
        slugifyHeaders: function (html) {
            var $html;

            $html = cheerio(html);

            // Require all heading tags to have id attribute
            cheerio('h1, h2, h3, h4, h5, h6', $html).each(function () {
                var $elem,
                    id;

                $elem = cheerio(this);
                id = $elem.attr('id');

                if (typeof id === 'undefined' || id === '') {
                    $elem.attr('id', utils.slugify($elem.text()));
                }
            });

            return cheerio.html($html);
        },

        /**
         * Sorts an array of objects.
         *
         * @param [array] arr - The array to sort
         * @param [array] rules - An array of objects to define the 'key' to sort the array by, the 'defaultValue' if the key doesn't exist, and the 'direction' to sort by ('asc' is default).
         */
        sort: function (arr, rules) {
            var ruleDefault;

            ruleDefault = {
                key: 'order',
                defaultValue: '',
                direction: 'asc'
            };

            arr.sort(function (a, b) {
                var i,
                    len,
                    rule,
                    valueA,
                    valueB;

                len = rules.length;

                for (i = 0; i < len; ++i) {

                    rule = merge(true, ruleDefault, rules[i]);

                    valueA = a[rule.key] || rule.defaultValue;
                    valueB = b[rule.key] || rule.defaultValue;

                    if (valueA !== valueB) {
                        break;
                    }
                }

                if (valueA < valueB) {
                    return (rule.direction === 'asc') ? -1 : 1;
                } else if (valueA > valueB) {
                    return (rule.direction === 'asc') ? 1 : -1;
                } else {
                    return 0;
                }
            });
        },

        /**
         * Sorts nav_links by the YFM properties 'sortKey' and 'sortDirection'.
         */
        sortNavLinks: function () {

            var navLinks;

            navLinks = grunt.config.get('bypassContext.nav_links');

            function doSort(links, rules) {

                utils.sort(links, rules);

                links.forEach(function (link) {

                    if (link.sortKey && link.nav_links) {
                        switch (link.sortKey) {

                        case 'order':
                            rules = [{
                                key: 'order',
                                defaultValue: 100
                            }, {
                                key: 'name'
                            }];
                            break;

                        case 'uri':
                            rules = [{
                                key: link.sortKey,
                                direction: 'desc'
                            }, {
                                key: 'order',
                                defaultValue: 100
                            }];
                            break;

                        default:
                            rules = [{
                                key: link.sortKey
                            }, {
                                key: 'order',
                                defaultValue: 100
                            }];
                            break;
                        }

                        doSort(link.nav_links, rules);
                    }
                });
            }

            // Top-level is always sorted by order, then by name.
            doSort(navLinks, [{
                key: 'order',
                defaultValue: 100
            }, {
                key: 'name'
            }]);

            // Save the results.
            grunt.config.set('bypassContext.nav_links', navLinks);

        },

        /**
         * Remove leading slash
         */
        trimLeadingSlash: function (str) {
            return str ? str.replace(/^\//, '') : str;
        },

        /**
         * Remove trailing Slash
         */
        trimTrailingSlash: function (str) {
            return str ? str.replace(/\/$/, '') : str;
        }
    };


    /**
     *
     */
    function FrontMatterService() {
        var defaultLayoutName,
            frontMatterFields,
            layoutsConfig,
            layoutsConfigCustom,
            layoutsFrontMatter,
            stacheYaml;

        /**
         * Returns an object representing all layouts' front matter properties.
         */
        function getLayoutsFrontMatter() {
            var frontMatter,
                layoutFiles,
                layoutFilesCustom;

            frontMatter = {};

            // Get files for layouts.
            layoutFiles = grunt.file.expand(layoutsConfig, layoutsConfig.src);
            layoutFilesCustom = grunt.file.expand(layoutsConfigCustom, layoutsConfigCustom.src);

            // Merge front matter from default layouts.
            layoutFiles.forEach(function (layout) {
                frontMatter[layout.replace('.hbs', '')] = merge.recursive(true, stacheYaml, yfm.extractJSON(layoutsConfig.cwd + layout));
            });

            // Merge front matter from custom layouts.
            layoutFilesCustom.forEach(function (layout) {
                frontMatter[layout.replace('.hbs', '')] = merge.recursive(true, stacheYaml, yfm.extractJSON(layoutsConfigCustom.cwd + layout));
            });

            return frontMatter;
        }

        // The file stache.yml stores the default, global properties for the project.
        stacheYaml = utils.getMergedStacheYaml();

        // Get file configurations for layouts.
        layoutsConfig = grunt.config.get('stache.globPatterns.layouts');
        layoutsConfigCustom = grunt.config.get('stache.globPatterns.layoutsCustom');

        // Get an array of objects representing all layouts' front matter.
        layoutsFrontMatter = getLayoutsFrontMatter();

        // Get the default layout name.
        defaultLayoutName = grunt.config.get('assemble.options.layout');
        if (layoutsFrontMatter[defaultLayoutName] === undefined) {
            slog.warning("A default layout was not found. It is recommended that you specify a default layout in `assemble.options.layout`.");
            return;
        }

        // These fields should be merged from the page-level into the layout-level.
        frontMatterFields = [
            'sortKey',
            'sortDirection'
        ];

        return {

            /**
             * Merges specific fields from a page's front matter with its respective layout front matter.
             */
            mergePageConfigWithLayout: function (frontMatter, identifier) {
                var layoutFrontMatter;

                if (!frontMatter.layout) {
                    slog.warning("[createAutoPages][" + identifier + "] Failed to find page's layout from front matter: " + JSON.stringify(frontMatter));
                    frontMatter.layout = defaultLayoutName;
                }

                // If this layout is custom, we need to strip out a few things.
                frontMatter.layout = frontMatter.layout.split('../').join('').replace(layoutsConfigCustom.cwd, '');
                layoutFrontMatter = layoutsFrontMatter[frontMatter.layout];

                frontMatterFields.forEach(function (field) {
                    if (frontMatter[field]) {
                        if (layoutFrontMatter && layoutFrontMatter[field]) {
                            frontMatter[field] = merge(true, layoutFrontMatter[field], frontMatter[field]);
                        }
                    } else {
                        frontMatter[field] = layoutFrontMatter[field];
                    }
                });

                return frontMatter;
            }
        };
    }


    /**
     * Initializer
     */
    (function () {
        var cwd,
            modules,
            stacheModulesDirectory;

        modules = [
            'assemble',
            'grunt-asciify',
            'grunt-available-tasks',
            'grunt-bump',
            'grunt-contrib-clean',
            'grunt-contrib-connect',
            'grunt-contrib-copy',
            'grunt-contrib-watch',
            'grunt-newer'
        ];

        // Merge options and defaults for the entire project.
        grunt.config.merge(defaults);

        // Merge local and global stache.yml config.
        utils.setStacheConfig(utils.getMergedStacheYaml());
        utils.fm = new FrontMatterService();

        cwd = process.cwd();
        stacheModulesDirectory = grunt.config.get('stache.dir') + 'node_modules/';

        /**
         * Load Dependencies.
         */
        modules.forEach(function (module) {

            // Has the module already been installed by the parent?
            switch (grunt.file.isDir(cwd + '/node_modules/' + module)) {
            case false:

                // Module wasn't found on the parent, so let's look in Stache's root.
                if (grunt.file.isDir(stacheModulesDirectory + module)) {
                    grunt.file.setBase(grunt.config.get('stache.dir'));
                    grunt.loadNpmTasks(module);
                    grunt.file.setBase(cwd);
                } else {
                    slog.fatal("The module \"" + module + "\" was not found!\n============\nAttempt the following:\n1)  Delete the node_modules folder\n2)  Type `npm cache clear`\n3)  Type `npm install`\n4)  Type `stache serve`\n\nIf Stache fails to serve, contact Stache support.");
                }
                break;

            case true:
                // Module found in the parent directory. Load it!
                grunt.loadNpmTasks(module);
                break;
            }
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
        grunt.registerTask('watch:newer', tasks.watchNewer);
        grunt.registerTask('watch:all', tasks.watchAll);

        /**
         * Public Tasks
         * These tasks will be made available to end users of Stache.
         */
        grunt.registerTask('stache', tasks.stache);
        grunt.registerTask('build', 'Build the documentation', tasks.stacheBuild);
        grunt.registerTask('help', 'Display available Stache commands', tasks.stacheHelp);
        grunt.registerTask('new', 'Create a new site using the Stache boilerplate', tasks.stacheNew);
        grunt.registerTask('release', 'Bump the version number in package.json; commit to origin.', tasks.stacheRelease);
        grunt.registerTask('serve', 'Serve the documentation', tasks.stacheServe);
        grunt.registerTask('version', 'Display the currently installed version of Stache', tasks.stacheVersion);
    }());


    // Expose certain things for testing purposes.
    return {
        tasks: tasks,
        utils: utils
    };
};
