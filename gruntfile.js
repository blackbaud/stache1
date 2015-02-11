/**
* Grunt configuration file.
* Bobby Earl, 2015-01-27
*
* TODO
*   Copy fonts from _sass/Sky/fonts/ into assets/fonts/.
*   Implement grunt-filerev when performing blackbaud:build.
*
* NOTES
*   There is a current bug where 'local echo' can't be disabled when running the skyui-tfs-clone task.
*   This means a user's password will be visible.  More investigation into the problem is necessary.
**/

'use strict';
module.exports = function(grunt) {
  
  // Blackbaud Namespace
  var NS = 'blackbaud:',
      tasks = [
        'assemble',
        'grunt-asciify',
        'grunt-contrib-clean',
        'grunt-contrib-concat',
        'grunt-contrib-connect',
        'grunt-contrib-cssmin',
        'grunt-contrib-sass',
        'grunt-contrib-uglify',
        'grunt-contrib-watch',
        'grunt-filerev',
        'grunt-newer',
        'grunt-nugetter',
        'grunt-shell',
        'grunt-usemin'
      ];
  
  // Load the required node modules
  tasks.forEach(grunt.loadNpmTasks);
  
  // Disable grunt headers
  grunt.log.header = function() {} 

  // Initialize our configuration
  // For my sanity, please alphabetize any tasks after pkg and site.
  grunt.initConfig({
    
    // Reads our configuration files
    pkg: grunt.file.readJSON('package.json'),
    site: grunt.file.readYAML('_config.yml'),
    nav: grunt.file.readYAML('app-src/assets/data/nav.yml'),
    
    // Displays our title all fancy-like
    asciify: {
      one: {
        text: 'Blackbaud',
        options: {
          font: 'cybermedium',
          log: true
        }
      },
      two: {
        text: 'Documentation',
        options: {
          font: 'cybermedium',
          log: true
        }
      },
      three: {
        text: 'Builder ',
        options: {
          font: 'cybermedium',
          log: true
        }
      },
    },
    
    // Static site gen
    assemble: {
      options: {
        assets: '<%= site.app_build %>assets/',        
        data: '<%= site.app_data %>*.*',
		helpers: ['<%= site.app_helpers %>**/*.js'],
        partials: ['<%= site.app_partials %>**/*.*'],
        layoutdir: '<%= site.app_layouts %>',
        layout: 'base.hbs',
        pkg: '<%= pkg %>'
      },
      site: {
        options: {},
        files: [
          {
            expand: true,
            cwd: '<%= site.app_content %>',
            dest: '<%= site.app_build %>',
            src: ['**/*.hbs']
          }
        ]
      }
    },
    
    // Cleans the dist folder before serve/build
    clean: {
      build: {
        src: ['<%= site.app_build %>']
      }
    },
    
    // Creates a server
    connect: {
      dev: {
        options: {
          base: [
            '<%= site.app_build %>',
            '<%= site.app_src %>'
          ],
          livereload: true,
          port: 4000 
        }
      }
    },
    
    // Adds timestamp to the assets
    filerev: {
      site: {
        files: [{
          src: [
            '<%= site.app_assets %>/css/*.css',
            '<%= site.app_assets %>/js/*.js'
          ]
        }]
      }
    },
    
    // Downloads the latest metadata for a package and finds the download url.
    http: {
      'portal-get-operations': {
        options: {
          url: '<%= site.portal-api %>/apis/54c136c272126c0990e57438/operations',
          qs: '<%= site.portal-qs %>',
          headers: {
            
          },
          
          // Instead of being able to use dest, I'm having to remove '{ value: [...]}'
          // This caused errors in assemble.
          json: true,
          callback: function(error, response, body) {
            if (error) {
              grunt.log.writeln(error);
            } else {
              grunt.file.write('<%= site.app_data %>operations.json', JSON.stringify(body.value)); 
            }
          }
        }
      }
    },
    
    nugetter: {
      options: {
        server: 'http://tfs-sym.blackbaud.com:81/nuget/',
        packages: [
          {
            id: 'Blackbaud.SkyUI.Mixins',
            dest: '<%= site.app_assets %>%(id)'
          }
        ]
      }
    },
    
    // Tasks to clone and fetch the latest SkyUI from TFS.
    shell: {
      'skyui-tfs-clone': {
        command: 'git tf clone <%= site.tfs %> <%= site.skyTfsRemote %> <%= site.skyTfsLocal %>'
      },
      'skyui-tfs-fetch': {
        command: 'git fetch <%= site.skyLocal %>'
      },
      'bower-install': {
        command: 'bower install'
      },
      'npm-install': {
        command: 'npm install'
      }
    },
    
    useminPrepare: {
      html: '<%= site.app_build %>index.html',
      options: {
        assetsDirs: ['<%= site.app_assets %>'],
        dest: '<%= site.app_assets %>',
        root: '<%= site.app_src %>'
      }
    },
    
    usemin: {
      html: '<%= site.app_build %>index.html'
    },
    
    // When serving, watch for file changes
    watch: {
      serve: {
        files: ['<%= site.app_content %>**/*.*'],
        tasks: ['assemble'],
        options: {
          livereload: true
        }
      }
    }
  });
  
  // Current showing help message as default task
  grunt.registerTask('welcome', function() {

    var msg = 'Listed below are available grunt commands in version %s:';
    grunt.log.writeln(msg.green.bold, grunt.config('pkg.version'));
    grunt.log.writeln('');
    
    // Filter BB tasks.  Saving to array to sort them by name.
    var tasks = [];
    for ( var task in grunt.task._tasks) {
      if (task.indexOf(NS) == 0) {
        tasks.push(task);
      }
    }
    
    // Sorting the tasks by name
    //tasks.sort();
    
    // Display our tasks
    for (var i = 0, j = tasks.length; i < j; i++) {
      grunt.log.writeln(tasks[i].bold);
      grunt.log.writeln(grunt.task._tasks[tasks[i]].info);
      grunt.log.writeln('');
    }
  });
  
  grunt.registerTask(
    NS + 'serve', 
    'Serve the documentation', 
    [
      'newer:assemble',
      'connect', 
      'watch'
    ]
  );
  
  grunt.registerTask(
    NS + 'build', 
    'Build the documentation', 
    [
      'clean',
      'assemble',
      'useminPrepare',
      'concat:generated',
      'cssmin:generated',
      'uglify:generated',
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
      NS + 'portal-get-operations',
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
  
  // Display help message as default task
  grunt.registerTask('default', [
    'asciify:one', 
    'asciify:two', 
    'asciify:three', 
    'welcome'
  ]);
  
};