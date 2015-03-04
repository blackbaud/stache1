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
        layout: 'layout-base',
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
            src: ['**/*.md','**/*.hbs']
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
