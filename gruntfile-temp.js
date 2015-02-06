/**
* Grunt configuration file.
* Bobby Earl, 2015-01-27
*
* TODO
*   Copy fonts from _sass/Sky/fonts/ into assets/fonts/
*
* NOTES
*   There is a current bug where 'local echo' can't be disabled when running the skyui-tfs-clone task.
*   This means a user's password will be visible.  More investigation into the problem is necessary.
*   The Blackbaud.SkyUI.Mixins package would generally be a better choice, but I want the font.
**/
module.exports = function(grunt) {
  'use strict';
  
  // Private vars
  var NS = 'blackbaud:',
      NS_INTERNAL = 'internal:' + NS,
      asciifyOptions = {
        font: 'cybermedium',
        log: true
      };
  
  // Disable grunt headers
  grunt.log.header = function() {} 
  
  // Load the required node modules
  grunt.loadNpmTasks('assemble');
  grunt.loadNpmTasks('grunt-asciify');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-curl');
  grunt.loadNpmTasks('grunt-http');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-zip');

  // Initialize our configuration
  // For my sanity, please alphabetize any tasks after pkg and paths.
  grunt.initConfig({
    
    // Reads package information
    pkg: grunt.file.readJSON('package.json'),
    
    // Paths used through this gruntfile
    paths: {
      nuget: 'Blackbaud.SkyUI.Sass',
      nugetDir: '_nuget/<%= paths.nuget %>',
      nugetServer: 'http://tfs-sym.blackbaud.com:81/nuget/',
      nugetVersion: '',  // Set by blackbaud:skyui-nuget
      skyJsonRemote: '', // Set by blackbaud:skyui-nuget
      skyJsonRemoteById: '<%= paths.nugetServer %>FindPackagesById()?id=\'<%= paths.nuget %>\'&$orderby=Published desc&$top=1',
      skyJsonRemoteByVersion: '<%= paths.nugetServer %>/Packages(Id=\'<%= paths.nuget %>\',Version=\'<%= paths.nugetVersion %>\')',
      skyTfsLocal: '_sass/Sky/',
      skyTfsRemote: '$/Products/REx/Styles/Sky/DEV/Sky/Content/Styles/Sky/',
      skyZipExpanded: '<%= paths.nugetDir %>/',
      skyZipLocal: '<%+ paths.nugetDir %>.zip',
      skyZipRemote: '', // Set by http:skyui-json
      tfs:  'https://tfs.blackbaud.com/tfs/DefaultCollection/',
      renxtConfig: '_config.yml,_config.renxt.yml',
      fenxtConfig: '_config.yml,_config.fenxt.yml'
    },
    
    asciify: {
      one: {
        text: 'Blackbaud',
        options: asciifyOptions
      },
      two: {
        text: 'Documentation',
        options: asciifyOptions
      },
      three: {
        text: 'Builder ',
        options: asciifyOptions
      },
    },
    
    assemble: {
      pages: {
        options: {
          flatten: true,
          assets: 'assets'
        },
        files: {
          'dist/index.html': ['src/index.hbs']
        }
      }
    },
    
    connect: {
      dev: {
        options: {
          base: 'dist/',
          keepalive: true,
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
    
    // Downloads the latest metadata for a package and finds the download url.
    http: {
      'skyui-nuget-json': {
        options: {
          url: '<%= paths.skyJsonRemote %>',
          json: true,
          callback: function(error, response, body) {
            console.log(body);
            try {
              var parent = grunt.config('paths.nugetVersion') ? body.d : body.d[0];
              grunt.config.set('paths.skyZipRemote', parent.__metadata.media_src);
              grunt.log.writeln('Found latest SkyUI nuget: %s', grunt.config('paths.skyZipRemote'));
            } catch(err) {
              grunt.log.writeln('Error parsing NuGet response.');
              grunt.log.writeln(err);
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
      }
    },    
    
    // Unzips our nuget package
    unzip: {
      'skyui-nuget-unzip': {
        src: '<%= paths.skyZipLocal %>',
        dest: '<%= paths.skyZipExpanded %>'
      }
    }
  });
  
  // Current showing help message as default task
  grunt.registerTask(NS_INTERNAL + 'welcome', function() {

    grunt.log.writeln('Listed below are available grunt commands in version %s:'.green.bold, grunt.config('pkg.version'));
    grunt.log.writeln('');
    
    // Filter BB tasks.  Saving to array to sort them by name.
    var tasks = [];
    for ( var task in grunt.task._tasks) {
      if (task.indexOf(NS) == 0) {
        tasks.push(task);
      }
    }
    
    // Sorting the tasks by name
    tasks.sort();
    
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
  grunt.registerTask(NS + 'serve', 'Serve the documentation', ['assemble','connect']);
  grunt.registerTask(NS + 'build', 'Build the documentation', 'assemble');
  grunt.registerTask(NS + 'skyui-tfs-clone', 'Clones the latest version of SkyUI from TFS', 'shell:skyui-tfs-clone');
  grunt.registerTask(NS + 'skyui-tfs-fetch', 'Fetches the latest version of SkyUI from TFS', 'shell:skyui-tfs-fetch');
  grunt.registerTask(NS + 'skyui-nuget', 'Downloads the latest (or specified) SkyUI nuget package', [
    'http:skyui-nuget-json', 
    'curl:skyui-nuget-download', 
    'unzip:skyui-nuget-unzip',
    'copy:skyui-nuget-copy'
  ]);
  
  // Current showing help message as default task
  grunt.registerTask('default', [
    'asciify:one', 
    'asciify:two', 
    'asciify:three', 
    NS_INTERNAL + 'welcome'
  ]);
  
};