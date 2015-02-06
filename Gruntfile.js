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
      NS_INTERNAL = 'internal:' + NS;
  
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
      skyJsonRemote: [
        'http://tfs-sym.blackbaud.com:81/nuget/FindPackagesById()',
        '?id=\'<%= paths.nuget %>\'',
        '&$orderby=Published desc',
        '&$top=1'].join(''),
      skyJsonLocal: '<%= paths.nugetDir %>.json',
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
        options: {
          font: 'cybersmall',
          log: true
        }
      },
      two: {
        text: 'Documentation',
        options: {
          font: 'cybersmall',
          log: true
        }
      },
      three: {
        text: 'Builder',
        options: {
          font: 'cybersmall',
          log: true
        }
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
            try {
              grunt.config.set('paths.skyZipRemote', body.d[0].__metadata.media_src);
              console.log('Found latest SkyUI nuget: %s', grunt.config('paths.skyZipRemote'));
            } catch(err) {
              console.log('Error parsing NuGet response.');
              console.log(err);
            }
          }
        },
        dest: '<%= paths.skyJsonLocal %>'
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
      'renxt-serve': {
        command: 'jekyll serve --config _config.yml,<%= paths.renxtConfig %> --baseurl "" --dest _site' 
      },
      'renxt-build': {
        command: 'jekyll build --config _config.yml,<%= paths.renxtConfig %>' 
      },
      'fenxt-serve': {
        command: 'jekyll serve --config _config.yml,<%= paths.fenxtConfig %> --baseurl "" --dest _site' 
      },
      'fenxt-build': {
        command: 'jekyll build --config _config.yml,<%= paths.fenxtConfig %>' 
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

    var spacer = '----------------------------------------';
    
    grunt.log.writeln(spacer);
    grunt.log.writeln('The "default" grunt task is intentionally blank.');
    grunt.log.writeln('Listed below are available tasks.');
    grunt.log.writeln(spacer);
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
  grunt.registerTask(NS + 'renxt-serve', 'Serve the RENXT documentation', 'shell:renxt-serve');
  grunt.registerTask(NS + 'renxt-build', 'Build the RENXT documentation', 'shell:renxt-build');
  grunt.registerTask(NS + 'fenxt-serve', 'Serve the FENXT documentation', 'shell:fenxt-serve');
  grunt.registerTask(NS + 'fenxt-build', 'Build the FENXT documentation', 'shell:fenxt-build');
  grunt.registerTask(NS + 'skyui-tfs-clone', 'Clones the latest version of SkyUI from TFS', 'shell:skyui-tfs-clone');
  grunt.registerTask(NS + 'skyui-tfs-fetch', 'Fetches the latest version of SkyUI from TFS', 'shell:skyui-tfs-fetch');
  grunt.registerTask(NS + 'skyui-nuget', 'Downloads the latest SkyUI nuget package', [
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