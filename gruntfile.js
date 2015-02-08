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
module.exports = function(grunt) {
  'use strict';
  
  // Blackbaud Namespace
  var NS = 'blackbaud:',
      NS_INTERNAL = 'internal:' + NS;
  
  // Disable grunt headers
  grunt.log.header = function() {} 
  
  // Load the required node modules
  grunt.loadNpmTasks('assemble');
  grunt.loadNpmTasks('grunt-asciify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-curl');
  grunt.loadNpmTasks('grunt-filerev');
  grunt.loadNpmTasks('grunt-http');
  grunt.loadNpmTasks('grunt-newer');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-usemin');
  grunt.loadNpmTasks('grunt-zip');

  // Initialize our configuration
  // For my sanity, please alphabetize any tasks after pkg and paths.
  grunt.initConfig({
    
    // Reads our configuration files
    pkg: grunt.file.readJSON('package.json'),
    site: grunt.file.readYAML('_config.yml'),
    
    // Paths used through this gruntfile
    paths: {
      appSrc: 'app-src/',
      appDist: 'app-dist/',
      appData: '<%= paths.appSrc %>_data/',
      appAssets: '<%= paths.appSrc %>assets/',
      appTemp: '.tmp/',
      portalName: 'bbapidev',
      portalApi: 'https://<%= paths.portalName %>.management.azure-api.net',
      portalQueryString: {
        'api-version': '2014-02-14-preview'
      },
      nuget: 'Blackbaud.SkyUI.Sass',
      nugetDir: '<%= paths.appAssets %>nuget/<%= paths.nuget %>',
      nugetServer: 'http://tfs-sym.blackbaud.com:81/nuget/',
      nugetVersion: '',  // Set by blackbaud:skyui-nuget
      skyJsonRemote: '', // Set by blackbaud:skyui-nuget
      skyJsonRemoteById: '<%= paths.nugetServer %>FindPackagesById()?id=\'<%= paths.nuget %>\'&$orderby=Published desc&$top=1',
      skyJsonRemoteByVersion: '<%= paths.nugetServer %>Packages(Id=\'<%= paths.nuget %>\',Version=\'<%= paths.nugetVersion %>\')',
      skyTfsLocal: '<%= paths.appSrc %>_sass/',
      skyTfsRemote: '$/Products/REx/Styles/Sky/DEV/Sky/Content/Styles/Sky/',
      skyZipExpanded: '<%= paths.nugetDir %>/',
      skyZipLocal: '<%= paths.appTemp %><%= paths.nuget %>.zip',
      skyZipRemote: '', // Set by http:skyui-json
      tfs:  'https://tfs.blackbaud.com/tfs/DefaultCollection/'
    },
    
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
    
    // The meat and potatoes of our application.
    assemble: {
      options: {
        assets: '<%= paths.appDist %>assets/',        
        data: '<%= paths.appData %>*.*',
		helpers: ['<%= paths.appSrc %>_helpers/**/*.js'],
        layoutdir: '<%= paths.appSrc %>_layouts/',
        layout: 'base.hbs',
        pkg: '<%= pkg %>'
      },
      pages: {
        options: {},
        files: [{
          expand: true,
          cwd: '<%= paths.appSrc %>',
          dest: '<%= paths.appDist %>',
          src: ['*.hbs']
        }]
      }
    },
    
    // Cleans the dist folder before serve/build
    clean: {
      build: {
        src: ['<%= paths.appDist %>']
      }
    },
    
    // Creates a server
    connect: {
      dev: {
        options: {
          base: [
            '<%= paths.appDist %>',
            '<%= paths.appSrc %>'
          ],
          livereload: true,
          port: 4000 
        }
      }
    },
    
    // Copies the contents of unzipped nuget package to our _sass directory.
    copy: {
      'skyui-nuget-copy': {
        files: [{
          expand: true,
          cwd: '<%= paths.skyZipExpanded %>/Content/Content/Styles/Sky/',
          src: ['**'],
          dest: '<%= paths.skyTfsLocal %>'
        }]
      }
    },
    
    // Downloads the latest nuget package, saving it as a zip file.
    curl: {
      'skyui-nuget-download': {
        src: '<%= paths.skyZipRemote %>',
        dest: '<%= paths.skyZipLocal %>'
      }
    },
    
    // Adds timestamp to the assets
    filerev: {
      site: {
        files: [{
          src: [
            '<%= paths.appDist %>assets/css/*.css',
            '<%= paths.appDist %>assets/js/*.js'
          ]
        }]
      }
    },
    
    // Downloads the latest metadata for a package and finds the download url.
    http: {
      'skyui-nuget-json': {
        options: {
          url: '<%= paths.skyJsonRemote %>',
          json: true,
          ignoreErrors: true,
          callback: function(possibleError, response, body) {
            var error, message;
            
            if (possibleError) {
              error = possibleError;
              if (error.code == 'ENOTFOUND') {
                message = 'Blackbaud NuGet server requires LAN / VPN access.'.green.bold;
              }
            } else {
              try {
                var parent = grunt.config('paths.nugetVersion') ? body.d : body.d[0];
                grunt.config.set('paths.skyZipRemote', parent.__metadata.media_src);
                message = 'Found latest SkyUI nuget: ' + grunt.config('paths.skyZipRemote');
              } catch(e) {
                message = 'Error parsing nuget response.';
                error = err;
              }
            }
            
            if (message) {
              grunt.log.writeln(message);
            }
            
            if (error) {
              grunt.fail.fatal(error);
            }
          }
        }
      },
      'portal-get-operations': {
        options: {
          url: '<%= paths.portalApi %>/apis/54c136c272126c0990e57438/operations',
          qs: '<%= paths.portalQueryString %>',
          headers: {
            Authorization: 'SharedAccessSignature uid=54c12d71ce82280329030003&ex=2016-02-06T22:41:00.0000000Z&sn=SuypLuSQqpGI3MEhiGNHcwIkEQQIswUxWsmoh54mpyYXt0U27lOyAapkYHxtnDxIak9JyUskfplQT9iTmBm2yg=='
          },
          
          // Instead of being able to use dest, I'm having to remove '{ value: [...]}'
          // This caused errors in assemble.
          json: true,
          callback: function(error, response, body) {
            if (error) {
              grunt.log.writeln(error);
            } else {
              grunt.file.write('<%= paths.appData %>operations.json', JSON.stringify(body.value)); 
            }
          }
        }
      }
    },
    
    // Tasks to clone and fetch the latest SkyUI from TFS.
    shell: {
      'skyui-tfs-clone': {
        command: 'git tf clone <%= paths.tfs %> <%= paths.skyTfsRemote %> <%= paths.skyTfsLocal %>'
      },
      'skyui-tfs-fetch': {
        command: 'git fetch <%= paths.skyLocal %>'
      },
      'bower-install': {
        command: 'bower install'
      },
      'npm-install': {
        command: 'npm install'
      }
    },
    
    useminPrepare: {
      html: '<%= paths.appDist %>index.html',
      options: {
        assetsDirs: ['<%= paths.appDist %>assets/'],
        dest: '<%= paths.appDist %>assets/',
        root: '<%= paths.appSrc %>'
      }
    },
    
    usemin: {
      html: '<%= paths.appDist %>index.html'
    },
    
    
    // Unzips our nuget package
    unzip: {
      'skyui-nuget-unzip': {
        src: '<%= paths.skyZipLocal %>',
        dest: '<%= paths.skyZipExpanded %>'
      }
    },
    
    // When serving, watch for file changes
    watch: {
      serve: {
        files: ['src/**/*.*'],
        tasks: ['assemble'],
        options: {
          livereload: true
        }
      }
    }
  });
  
  // Current showing help message as default task
  grunt.registerTask(NS_INTERNAL + 'welcome', function() {

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
  
  // Possibly not necessary in this context, but I'm namespacing all our commands.
  // I do like this approach as it also abstracts the original grunt task.
  // Meaning if we need to change a task, the command and our documentation don't have to change.
  // It's obviously still possible to call the original grunt commands.
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
    'Downloads the latest (or specified) SkyUI nuget package', 
    function(version) {
      var url = version ? 'paths.skyJsonRemoteByVersion' : 'paths.skyJsonRemoteById';
      grunt.config.set('paths.nugetVersion', version);
      grunt.config.set('paths.skyJsonRemote', grunt.config(url));    
      grunt.task.run('http:skyui-nuget-json');
      grunt.task.run('curl:skyui-nuget-download');
      grunt.task.run('unzip:skyui-nuget-unzip');
      //grunt.task.run('copy:skyui-nuget-copy');
    }
  );
  
  // Display help message as default task
  grunt.registerTask('default', [
    'asciify:one', 
    'asciify:two', 
    'asciify:three', 
    NS_INTERNAL + 'welcome'
  ]);
  
};