/**
* Grunt configuration file.
* Bobby Earl, 2015-01-27
*
* TODO
*   - Implement grunt-filerev when performing blackbaud:build.
*   - Work on error codes when serving.  Maybe not even necessary since it's just local.
*       If we do it, it needs to handle relative asset linking outside of Assemble.
*       Inspiration: https://github.com/gruntjs/grunt-contrib-connect/issues/30
*
* NOTES
*   There is a current bug where 'local echo' can't be disabled when running the skyui-tfs-clone task.
*   This means a user's password will be visible.  More investigation into the problem is necessary.
**/

/*jslint node: true, nomen: true, plusplus: true */
'use strict';

// For merging our YAML files
var merge = require('merge');
var yfm = require('assemble-yaml');

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
        helpers: ['<%= stache.config.helpers %>**/*.js'],
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
              '**/.html'
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
            '<%= stache.config.content %>'
          ],
          livereload: true,
          port: 4000
        }
      }
    },

    copy: {
      build: {
        files: [
          {
            expand: true,
            cwd: '<%= stache.config.src %>img/',
            src: '**',
            dest: '<%= stache.config.build %>img/'
          },
          {
            expand: true,
            cwd: '<%= stache.config.nuget %>Blackbaud.SkyUI.Sass/Content/Content/Styles/Sky/Bootstrap/fonts/',
            src: '*',
            dest: '<%= stache.config.build %>fonts/'
          },
          {
            expand: true,
            cwd: '<%= stache.config.nuget %>Blackbaud.SkyUI.Sass/Content/Content/Styles/Sky/FontAwesome/fonts/',
            src: '*',
            dest: '<%= stache.config.build %>fonts/'
          },
          {
            expand: true,
            cwd: '<%= stache.config.nuget %>Blackbaud.SkyUI.Sass/Content/Content/Styles/Sky/fonts/',
            src: '*',
            dest: '<%= stache.config.build %>fonts/'
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

    // Downloads the latest metadata for a package and finds the download url.
    http: {
      'portal-get-operations': {
        options: {
          url: '<%= stache.config.portal_api %>apis/54c136c272126c0990e57438/operations',
          qs: '<%= stache.config.portal_qs %>',
          headers: {
            'authorization': '<%= stache.config.portal_header.authorization %>'
          },

          // Instead of being able to use dest, I'm having to remove '{ value: [...]}'
          // This caused errors in assemble.
          json: true,
          callback: function (error, response, body) {
            if (error) {
              grunt.log.writeln(error);
            } else {
              grunt.file.write('<%= stache.config.data %>operations.json', JSON.stringify(body.value));
            }
          }
        }
      }
    },

    nugetter: {
      skyui: {
        options: {
          server: 'http://tfs-sym.blackbaud.com:81/nuget/',
          dest: '<%= stache.config.src %>nuget/%(id)s',
          packages: [
            {
              id: 'Blackbaud.SkyUI.Sass'
            },
            {
              id: 'Blackbaud.SkyUI.Scripts'
            }
          ]
        }
      }
    },

    sass: {
      options: {
        includePaths: [
          '<%= stache.config.nuget %>Blackbaud.SkyUI.Sass/Content/Content/Styles/'
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
      'skyui-tfs-clone': {
        command: 'git tf clone <%= stache.config.tfs %> <%= stache.config.skyTfsRemote %> <%= stache.config.skyTfsLocal %>'
      },
      'skyui-tfs-fetch': {
        command: 'git fetch <%= stache.config.skyLocal %>'
      },
      'bower-install': {
        command: 'bower install'
      },
      'npm-install': {
        command: 'npm install'
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
      html: '<%= stache.config.build %>/**/*.html'
    },

    // When serving, watch for file changes
    watch: {
      stache: {
        files: [
          '<%= stache.config.content %>**/*.*',
          '<%= stache.config.src %>**/*.*',
          'stache.yml'
        ],
        tasks: [
          'createAutoNav',
          'assemble'
        ],
        options: {
          livereload: true
        }
      },
      sass: {
        files: [
          '<%= stache.config.src %>sass/**/*.*'
        ],
        tasks: [
          'sass'
        ],
        options: {
          livereload: true
        }
      }
    }
  };
  
  /**
  ****************************************************************
  * PRIVATE METHODS
  ****************************************************************
  **/
  
  function createTitle(name) {
    var output = '';
    var parts = name.indexOf('/') > -1 ? name.split('/') : [name];
    parts.forEach(function (el, idx) {
      output += el[0].toUpperCase() + el.slice(1) + ' ';
    });
    return output;
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
    
    grunt.config.set(root + '.nav_links', []);
    grunt.file.recurse(grunt.config(root + '.content'), function (abspath, rootdir, subdir, filename) {
      sorted.push({
        abspath: abspath,
        rootdir: rootdir,
        subdir: subdir,
        filename: filename
      }); 
    });
    
    sorted.sort(function (a, b) {
      var subdirA = a.subdir || '';
      var subdirB = b.subdir || '';
      
      if (subdirA < subdirB) {
        return -1;
      } else if (subdirA > subdirB) {
        return 1;
      } else {
        return 0;
      }
    });
    
    sorted.forEach(function (el, idx) {
     
      var path = root;
      var abspath = el.abspath;
      var rootdir = el.rootdir;
      var subdir = el.subdir;
      var filename = el.filename;
      var raw = yfm.extract(abspath);
      var title = raw.title || subdir ? createTitle(subdir) : grunt.config('stache.config.nav_title_home');
      var file = filename.replace('.md', '.html').replace('.hbs', '.html');
      
      // Nested directories
      if (subdir) {
        
        // Split the subdir into its different directories
        var subdirParts = subdir.split('/');
        for (var i = 0, j = subdirParts.length; i < j; i++) {
          
          var index = 0;
          path += '.nav_links';
          
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
        path += '.nav_links';
        path += '.' + grunt.config.get(path).length;
      }

      // Record this url
      grunt.config.set(path, {
        name: title,
        uri: (subdir ? ('/' + subdir) : '') + (file === 'index.html' ? '/' : file)
      });
      
    });
    
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
      'assemble',
      //'sass',
      'useminPrepare',
      'concat:generated',
      'cssmin:generated',
      'uglify:generated',
      'copy:build',
      //'filerev',
      'usemin'
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
  
  grunt.registerTask(
    'new',
    'Create a new site using the STACHE boilerplate.',
    function(dir) {
      /* PLACEHOLDER */
    }
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
      'sass',
      'connect',
      'watch'
    ]
  );
  
  grunt.registerTask(
    'update',
    'Updates ALL external dependencies. (SkyUI, Azure, Bower, NPM)',
    [
      'shell:npm-install',
      'shell:bower-install',
      'skyui-nuget',
      'portal-get-operations'
    ]
  );

  // NEEDS TO ME MIGRATED TO ASSEMBLE
  grunt.registerTask(
    'portal-get-operations',
    'Downloads the list of operations for the default (or specified) API.',
    'http:portal-get-operations'
  );
  
  // MADE GENERIC AND IMPLEMENTED IN ASSEMBLE ('plugin?')
  grunt.registerTask(
    'skyui-tfs-clone',
    'Clones the latest version of SkyUI from TFS',
    'shell:skyui-tfs-clone'
  );
  
  // MADE GENERIC AND IMPLEMENTED IN ASSEMBLE ('plugin?')
  grunt.registerTask(
    'skyui-tfs-fetch',
    'Fetches the latest version of SkyUI from TFS',
    'shell:skyui-tfs-fetch'
  );
  
  // NEEDS TO BE MIGRATED TO ASSEMBLE (Already created grunt-nuggetter plugin)
  grunt.registerTask(
    'skyui-nuget',
    'Fetches the latest version of SkyUI from the INTERNAL NuGet Server',
    'nugetter'
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
  
  if (grunt.file.exists(defaults.stache.pathConfig)) {
    localConfig = grunt.file.readYAML(defaults.stache.pathConfig);
  }
  
  if (grunt.file.exists(defaults.stache.dir + defaults.stache.pathConfig)) {
    stacheConfig = grunt.file.readYAML(defaults.stache.dir + defaults.stache.pathConfig);
  }

  if (grunt.file.exists(defaults.stache.pathPackage)) {
    defaults.stache.package = grunt.file.readJSON(defaults.stache.pathPackage);
  }
  
  defaults.stache.config = merge(stacheConfig, localConfig);
  grunt.config.merge(defaults);

  // Dynamically load our modules
  require('jit-grunt')(grunt, {
    useminPrepare: 'grunt-usemin',
    availabletasks: 'grunt-available-tasks'
  })({
    pluginsRoot: defaults.stache.dir + 'node_modules/'
  });

};
