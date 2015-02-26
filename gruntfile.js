/**
* Grunt configuration file.
* Bobby Earl, 2015-01-27
*
* TODO
*   - Copy fonts from _sass/Sky/fonts/ into assets/fonts/.
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

module.exports = function (grunt) { 
  
  console.log('HOW?!?!?!?!!?!?!');

  // Blackbaud Namespace
  var NS = 'blackbaud_';
  
  // Necessary since we are actually running in the root project folder.
  // There's probably a clever grunt / node way to find this value in case it changes.
  var dir = 'node_modules/blackbaud-stache/';
  
  // Original reference to the header logging function.
  var header = grunt.log.header;
  
  try {
    require('time-grunt')(grunt);
    require('jit-grunt')(grunt, {
      useminPrepare: 'grunt-usemin'
    })({
      pluginsRoot: dir + 'node_modules/'
    });
  } catch (err) {
    grunt.fail.fatal('You must run npm install before using Blackbaud Stache.');
    return;
  }
  
  grunt.registerTask('stache', 'The entry point for all stache tasks.', function() {
    
    console.log(this);
    
    var options = this.options({
      
      // Configuration files (exist here so they can be overridden)
      stacheDir: dir,

      // Reads our configuration files
      pkg: grunt.file.readJSON(dir + 'package.json'),
      bower: grunt.file.readJSON(dir + '.bowerrc'),
      site: grunt.file.readYAML(dir + 'stache.config.yml'),

      // Used to determine file locations, build or serve
      // This means when a user calls build or serve, the assembled files
      // will go into app-build or app-serve.
      status: 'serve',

      // Displays our title all fancy-like
      asciify: {
        stache: {
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
          assets: '<%= stache.config.app_assets_build %>',
          data: '<%= stache.config.app_data %>**/*.*',
          helpers: ['<%= stache.config.app_helpers %>**/*.js'],
          partials: ['<%= stache.config.app_partials %>**/*.hbs'],
          layoutdir: '<%= stache.config.app_layouts %>',
          layoutext: '.hbs',
          layout: 'base',
          pkg: '<%= pkg %>',

          // Make some data always available
          //operations: grunt.file.readJSON('app-src/assets/data/operations.json'),
          site: '<%= site %>',
          status: '<%= status %>',
          draft: '<%= draft %>'

        },
        site: {
          options: {},
          files: [
            {
              expand: true,
              cwd: '<%= stache.config.app_content %>',
              dest: '<%= stache.config.app_build %>',
              src: ['**/*.*']
            }
          ]
        }
      },

      // Cleans the specified folder before serve/build
      clean: {
        build: {
          src: ['<%= stache.config.app_build %>']
        }
      },

      // Creates a server
      connect: {
        dev: {
          options: {
            base: [
              '<%= stache.config.app_build %>',
              '<%= stache.config.app_src %>'
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
              cwd: '<%= stache.config.app_assets_src %>img/',
              src: '**',
              dest: '<%= stache.config.app_assets_build %>img/'
            },
            {
              expand: true,
              cwd: '<%= stache.config.app_nuget %>Blackbaud.SkyUI.Sass/Content/Content/Styles/Sky/Bootstrap/fonts/',
              src: '*',
              dest: '<%= stache.config.app_assets_build %>fonts/'
            },
            {
              expand: true,
              cwd: '<%= stache.config.app_nuget %>Blackbaud.SkyUI.Sass/Content/Content/Styles/Sky/FontAwesome/fonts/',
              src: '*',
              dest: '<%= stache.config.app_assets_build %>fonts/'
            },
            {
              expand: true,
              cwd: '<%= stache.config.app_nuget %>Blackbaud.SkyUI.Sass/Content/Content/Styles/Sky/fonts/',
              src: '*',
              dest: '<%= stache.config.app_assets_build %>fonts/'
            }
          ]
        }
      },

      cssmin: {
        target: {
          files: [{
            expand: true,
            cwd: '<%= stache.config.app_assets_build %>',
            src: ['*.css', '!*.min.css'],
            dest: '<%= stache.config.app_assets_build %>',
            ext: '.min.css'
          }]
        }
      },

      // Adds timestamp to the assets
      filerev: {
        site: {
          files: [{
            src: [
              '<%= stache.config.app_assets_build %>/css/*.css',
              '<%= stache.config.app_assets_build %>/js/*.js'
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
                grunt.file.write('<%= stache.config.app_data %>operations.json', JSON.stringify(body.value));
              }
            }
          }
        }
      },

      nugetter: {
        skyui: {
          options: {
            server: 'http://tfs-sym.blackbaud.com:81/nuget/',
            dest: '<%= stache.config.app_assets_src %>nuget/%(id)s',
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
            '<%= stache.config.app_nuget %>Blackbaud.SkyUI.Sass/Content/Content/Styles/'
          ]
        },
        build: {
          files: [{
            expand: true,
            cwd: '<%= stache.config.app_sass %>',
            src: ['*.scss'],
            dest: '<%= stache.config.app_css %>',
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
        html: '<%= stache.config.app_build %>index.html',
        options: {
          assetsDirs: ['<%= stache.config.app_assets_src %>'],
          dest: '<%= stache.config.app_build %>',
          root: '<%= stache.config.app_src %>'
        }
      },

      usemin: {
        html: '<%= stache.config.app_build %>/**/*.html'
      },

      // When serving, watch for file changes
      watch: {
        content: {
          files: [
            '<%= stache.config.app_content %>**/*.*',
            '<%= stache.config.app_assets_src %>**/*.*',
            'stache.config.yml'
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
            '<%= stache.config.app_assets_src %>sass/**/*.*'
          ],
          tasks: [
            'sass'
          ],
          options: {
            livereload: true
          }
        }
      }
    });
    
  });
  
  // Internal task - sets current build/serve status
  grunt.registerTask('status', function (status) {
    grunt.config('status', status);
  });

  // Internal task - showing welcome message and available tasks
  grunt.registerTask('welcome', function () {

    var msg = 'Listed below are available grunt commands in version %s:',
      tasks = [],
      task,
      i = 0,
      j;
    
    grunt.log.writeln(msg.green.bold, grunt.config('pkg.version'));
    grunt.log.writeln('');
    
    // Filter BB tasks.  Saving to array to sort them by name.
    for (task in grunt.task._tasks) {
      if (grunt.task._tasks.hasOwnProperty(task) && task.indexOf(NS) === 0) {
        tasks.push(task);
      }
    }

    // Display our tasks
    j = tasks.length;
    for (i; i < j; i++) {
      grunt.log.writeln(tasks[i].bold);
      grunt.log.writeln(grunt.task._tasks[tasks[i]].info);
      grunt.log.writeln('');
    }
  });
  
  // Internal task to control header logging
  grunt.registerTask('header', function(toggle) {
    grunt.log.header = toggle == 'true' ? header : function() {};
  });
  
  grunt.registerTask(
    NS + 'serve',
    'Serve the documentation',
    [
      'status:serve',
      'clean',
      'copy',
      'assemble',
      'sass',
      'connect',
      'watch'
    ]
  );
  
  grunt.registerTask(
    NS + 'build',
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
    NS + 'update',
    'Updates ALL external dependencies. (SkyUI, Azure, Bower, NPM)',
    [
      'shell:npm-install',
      'shell:bower-install',
      NS + 'skyui-nuget',
      NS + 'portal-get-operations'
    ]
  );

  grunt.registerTask(
    NS + 'portal-get-operations',
    'Downloads the list of operations for the default (or specified) API.',
    'http:portal-get-operations'
  );
  
  grunt.registerTask(
    NS + 'skyui-tfs-clone',
    'Clones the latest version of SkyUI from TFS',
    'shell:skyui-tfs-clone'
  );
  
  grunt.registerTask(
    NS + 'skyui-tfs-fetch',
    'Fetches the latest version of SkyUI from TFS',
    'shell:skyui-tfs-fetch'
  );
  
  grunt.registerTask(
    NS + 'skyui-nuget',
    'Fetches the latest version of SkyUI from the INTERNAL NuGet Server',
    'nugetter'
  );
  
  // Display help message
  grunt.registerTask(NS + 'help', 'Display this help message.', [
    'header:false',
    'asciify:stache',
    'welcome',
    'header:true'
  ]);
  
  // This can be overwritten in individual project gruntfile.js
  //grunt.registerTask('default', NS + 'help');
  grunt.registerTask('default', function() {
    console.log('running default task inside blackbaud-stache.');
  });
  
};
