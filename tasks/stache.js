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
var merge = require('merge');
var yfm = require('assemble-yaml');
var cheerio = require('cheerio');

module.exports = function (grunt) {

  // Original reference to the header logging function.
  // Disabling grunt header unless verbose is enabled
  var header = grunt.log.header;
  grunt.log.header = function() {};

  // Default configuration
  var defaults = {

    stache: {

      // Necessary since we are actually running in the root project folder.
      // There's probably a clever grunt / node way to find this value in case it changes.
      dir: 'node_modules/blackbaud-stache/',

      // Used to determine file locations, build or serve
      // This means when a user calls build or serve, the assembled files
      // will go into app-build or app-serve.
      status: 'serve',

      // Configuration file paths
      cli: grunt.option('cli'),
      pathConfig: 'stache.yml',
      pathPackage: 'package.json',
      pathBower: '.bowerrc',
      package: '',
      config: '',
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
        helpers: ['helper-moment', '<%= stache.config.helpers %>**/*.js'],
        partials: ['<%= stache.config.partials %>**/*.hbs'],
        layoutdir: '<%= stache.config.layouts %>',
        layoutext: '.hbs',
        layout: 'layout-container',
        stache: '<%= stache %>'
      },
      custom: {},
      stache: {
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
            'update'
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
            cwd: '<%= stache.dir %><%= stache.bower %>bb-sky-sass/Bootstrap/fonts/',
            src: '*',
            dest: '<%= stache.config.build %>fonts/'
          },
          {
            expand: true,
            cwd: '<%= stache.dir %><%= stache.bower %>bb-sky-sass/FontAwesome/fonts/',
            src: '*',
            dest: '<%= stache.config.build %>fonts/'
          },
          {
            expand: true,
            cwd: '<%= stache.dir %><%= stache.bower %>octicons/octicons/',
            src: [
              '*.eot',
              '*.svg',
              '*.ttf',
              '*.woff'
            ],
            dest: '<%= stache.config.build %>fonts/'
          },
          {
            expand: true,
            cwd: '<%= stache.dir %><%= stache.bower %>bb-sky-sass/fonts/',
            src: '*',
            dest: '<%= stache.config.build %>fonts/'
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
          }
        ]
      }
    },

    cssmin: {
      target: {
        files: [{
          expand: true,
          cwd: '<%= stache.config.build %>',
          src: ['*.css', '!*.min.css'],
          dest: '<%= stache.config.build %>',
          ext: '.min.css'
        }]
      }
    },

    // Adds timestamp to the assets
    filerev: {
      site: {
        files: [{
          src: [
            '<%= stache.config.build %>/css/*.css',
            '<%= stache.config.build %>/js/*.js'
          ]
        }]
      }
    },

    sass: {
      options: {
        includePaths: [
          '<%= stache.dir %><%= stache.bower %>'
        ]
      },
      build: {
        files: [{
          expand: true,
          cwd: '<%= stache.config.sass %>',
          src: ['*.scss'],
          dest: '<%= stache.config.css %>',
          ext: '.css'
        }]
      }
    },

    // Tasks to clone and fetch the latest SkyUI from TFS.
    shell: {
      'update': {
        command: 'npm update && npm install blackbaud-stache-cli -g'
      }
    },

    // Needed to allow angular apps
    uglify: {
      options: {
        mangle: false
      }
    },

    useminPrepare: {
      html: '<%= stache.config.build %>index.html',
      options: {
        assetsDirs: ['<%= stache.config.src %>'],
        dest: '<%= stache.config.build %>',
        root: '<%= stache.config.src %>'
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
          '<%= stache.config.src %>**/*.*',
          '<%= stache.config.static %>**/*.*',
          'stache.yml'
        ],
        tasks: [
          'createAutoNav',
          'assemble',
          'copy:build'
        ]
      },
      sass: {
        files: [
          '<%= stache.config.src %>sass/**/*.*'
        ],
        tasks: [
          'sass'
        ]
      }
    }
  };

  /**
  ****************************************************************
  * PRIVATE METHODS
  ****************************************************************
  **/

  function createTitle(name, separator, isBreadcrumbs) {
    var output = '';
    var parts = name.indexOf('/') > -1 ? name.split('/') : [name];

    if (!isBreadcrumbs) {
      parts = parts.slice(-1);
    }

    parts.forEach(function (el, idx) {
      output += el[0].toUpperCase() + el.slice(1) + separator;
    });
    output = output.slice(0, 0 - separator.length);

    return output;
  }

  function sort(arr, sortAscending, prop, propDefault) {
    arr.sort(function (a, b) {
      var ap = a[prop] || propDefault;
      var bp = b[prop] || propDefault;
      
      if (ap < bp) {
        return sortAscending ? -1 : 1;
      } else if (ap > bp) {
        return sortAscending ? 1 : -1;
      } else {
        return 0;
      }
    });
  }

  function sortRecursive(key, sortAscending) {
    var nav_links = grunt.config.get(key);
    var blog = grunt.config.get('stache.config.blog');
    
    sort(nav_links, sortAscending, (sortAscending ? 'order' : 'uri'), 100);
    grunt.config.set(key, nav_links);

    nav_links.forEach(function (el, idx) {
      if (el.nav_links) {
        if (el.abspath && el.abspath.indexOf(blog) > -1) {
          sortAscending = false;
        }
        sortRecursive(key + '.' + idx + '.nav_links', sortAscending)
      }
    });
  }

  /**
  ****************************************************************
  * PRIVATE TASKS
  ****************************************************************
  **/

  // Internal task - sets current build/serve status
  grunt.registerTask('status', function (status) {
    grunt.config('stache.status', status);
  });

  // Internal task to control header logging
  grunt.registerTask('header', function(toggle) {
    grunt.log.header = toggle == 'true' ? header : function() {};
  });

  // Creates nav to mirror directory structure
  grunt.registerTask('createAutoNav', function() {

    if (grunt.config('stache.config.nav_type') !== 'directory') {
      return;
    }

    var sorted = [];
    var root = 'stache.config';
    var navKey = '.nav_links';
    var navKeySearch ='.nav_search';

    grunt.config.set(root + navKey, []);
    grunt.config.set(root + navKeySearch, []);
    grunt.file.recurse(grunt.config(root + '.content'), function (abspath, rootdir, subdir, filename) {
      var fm = yfm.extractJSON(abspath);
      
      var show = true;
      if (typeof fm.published !== 'undefined' && fm.published === false) {
        show = false;
      }
      
      if (abspath && abspath.indexOf('.DS_Store') > -1) {
        show = false;
      }
      
      if (show) {
        sorted.push({
          abspath: abspath,
          rootdir: rootdir,
          subdir: subdir,
          filename: filename,
          frontmatter: fm,
        });
      }
    });

    // Sort alphabetically ensures that parents are created first.
    // This is crucial to this process.  We can sort by order below.
    sort(sorted, true, 'subdir', '');

    sorted.forEach(function (el, idx) {

      var path = root;
      var rootdir = el.rootdir;
      var subdir = el.subdir;
      var filename = el.filename;
      var separator = grunt.config.get('stache.config.nav_title_separator') || ' ';
      var home = grunt.config.get('stache.config.nav_title_home') || 'home';
      var file = filename.replace('.md', '.html').replace('.hbs', '.html');
      var item = el.frontmatter;

      // A few programmitcally created front-matter variables
      item.showInNav = typeof item.showInNav !== 'undefined' ? item.showInNav : true;
      item.showInHeader = typeof item.showInHeader !== 'undefined' ? item.showInHeader : true;
      item.showInFooter = typeof item.showInFooter !== 'undefined' ? item.showInFooter : true;
      item.breadcrumbs = item.breadcrumbs || (subdir ? createTitle(subdir, separator, true) : home);
      item.name = item.name || (subdir ? createTitle(subdir, separator, false) : home);
      item.abspath = el.abspath;

      // User hasn't specifically told us to ignore this page, let's look in the stache.yml array of nav_exclude
      if (item.showInNav) {
        grunt.config.get('stache.config.nav_exclude').forEach(function (f) {
          if (item.abspath.indexOf(f) > -1) {
            item.showInNav = false;
            return;
          }
        });
      }

      // Nested directories
      if (subdir) {

        // Split the subdir into its different directories
        var subdirParts = subdir.split('/');
        for (var i = 0, j = subdirParts.length; i < j; i++) {

          var index = 0;
          path += navKey;

          // Is the current path already an array?
          var pathCurrent = grunt.config.get(path);

          // It is an array, let's try to find the index for our current subDirPart
          if (grunt.util.kindOf(pathCurrent) === 'array') {

            var found = false;

            for (var m = 0, n = pathCurrent.length; m < n; m++) {
              var pathCurrentItem = grunt.config.get(path + '.' + m);
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
            path += '.0';
          }

        }

      } else {
        path += navKey;
        path += '.' + grunt.config.get(path).length;
      }

      // Show in nav superceeds showInHeader and showInFooter
      if (!item.showInNav) {
        grunt.verbose.writeln('Ignoring: ' + item.abspath);
        item.showInHeader = item.showInFooter = item.showInNav;
      }

      // Record this url
      item.uri = item.uri || (subdir ? ('/' + subdir) : '') + (file === 'index.html' ? '/' : ('/' + file));
      grunt.config.set(path, item);
      grunt.config.set(root + navKeySearch + '.' + idx, item);

    });

    // Now we can rearrange each item according to order
    sortRecursive(root + navKey, true);
  });

  // Prepare the JSON for our search implementation
  grunt.registerTask('prepareSearch', function() {
    var status = grunt.config.get('stache.status');
    var files = grunt.config.get('stache.config.nav_search');
    var search = [];

    if (files && files.length) {
      for (var i = 0, j = files.length; i < j; i++) {
        if (files[i].showInNav) {

          var item = files[i];
          var file = status + item.uri;
          if (grunt.file.isDir(file)) {
            file += 'index.html';
          }

          var html = grunt.file.read(file, 'utf8');
          var content = cheerio('.content', html);
          if (content.length === 0) {
            content = cheerio('body', html);
          }

          item.text = content.text().replace(/\s{2,}/g, ' ');
          search.push(item);
        }
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
      'status:build',
      'clean',
      'createAutoNav',
      'assemble:stache',
      'assemble:custom',
      'prepareSearch',
      'sass',
      'useminPrepare',
      'concat:generated',
      'cssmin:generated',
      'uglify:generated',
      'usemin',
      'copy:build'
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
    function() {}
  );

  // This method is registered here in order to show up in the available tasks help screen.
  // It's defined in the blackbaud-stache-cli package though.
  grunt.registerTask(
    'prepare',
    'Installs npm packages.',
    function() {}
  );

  grunt.registerTask(
    'serve',
    'Serve the documentation',
    [
      'status:serve',
      'clean',
      'copy:build',
      'createAutoNav',
      'assemble:stache',
      'assemble:custom',
      'prepareSearch',
      'sass',
      'connect',
      'watch'
    ]
  );

  grunt.registerTask(
    'update',
    'Update current npm packages and blackcbaud-stache-cli globally',
    [
      'shell:update'
    ]
  );

  grunt.registerTask('stache', function(optionalTask) {
    var task = optionalTask || 'help';
    if (grunt.task._tasks[task]) {
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

  var localConfig = {};
  var stacheConfig = {};

  // Read local files
  if (grunt.file.exists(defaults.stache.pathConfig)) {
    localConfig = grunt.file.readYAML(defaults.stache.pathConfig);
  }
  if (grunt.file.exists(defaults.stache.pathPackage)) {
    defaults.stache.package = grunt.file.readJSON(defaults.stache.pathPackage);
  }

  // Read stache files
  if (grunt.file.exists(defaults.stache.dir + defaults.stache.pathConfig)) {
    stacheConfig = grunt.file.readYAML(defaults.stache.dir + defaults.stache.pathConfig);
  }
  if (grunt.file.exists(defaults.stache.dir + defaults.stache.pathBower)) {
    defaults.stache.bower = grunt.file.readJSON(defaults.stache.dir + defaults.stache.pathBower).directory;
  }

  defaults.stache.config = merge(stacheConfig, localConfig);
  grunt.config.merge(defaults);

  // Dynamically load our modules
  require('jit-grunt')(grunt, {
    usemin: 'grunt-usemin',
    useminPrepare: 'grunt-usemin',
    availabletasks: 'grunt-available-tasks'
  })({
    pluginsRoot: defaults.stache.dir + 'node_modules/'
  });

};
