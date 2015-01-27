/**
* Grunt configuration file.
* Bobby Earl, 2015-01-27
*
* NOTES
*   There is a current bug where 'local echo' can't be disabled when running the skyui-tfs-clone task.
*   This means a user's password will be visible.  More investigation into the problem is necessary.
**/
module.exports = function(grunt) {
  
  // Load the required node modules
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-curl');
  grunt.loadNpmTasks('grunt-http');
  grunt.loadNpmTasks('grunt-jekyll');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-zip');

  // Initialize our configuration
  grunt.initConfig({
    
    // Reads package information
    pkg: grunt.file.readJSON('package.json'),
    
    // Paths used through this gruntfile
    paths: {
      tfs:  'https://tfs.blackbaud.com/tfs/DefaultCollection/',
      skyTfsRemote: '$/Products/REx/Styles/Sky/DEV/Sky/Content/Styles/Sky/',
      skyTfsLocal: '_sass/Sky/',
      skyJsonRemote: [
        'http://tfs-sym.blackbaud.com:81/nuget/FindPackagesById()',
        '?id=\'Blackbaud.SkyUI.Mixins\'',
        '&$orderby=Published desc',
        '&$top=1'].join(''),
      skyJsonLocal: '_nuget/Blackbaud.SkyUI.Mixins.json',
      skyZipRemote: '', // Set by http:skyui-json
      skyZipLocal: '_nuget/Blackbaud.SkyUI.Mixins.zip',
      skyZipExpanded: '_nuget/Blackbaud.SkyUI.Mixins/',
      renxtConfig: '_config.yml,_config.renxt.yml',
      fenxtConfig: '_config.yml,_config.fenxt.yml'
    },
    
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
    
    // Expose our CURL / SkyUI NuGet tasks
    curl: {
      'skyui-nuget-download': {
        src: '<%= paths.skyZipRemote %>',
        dest: '<%= paths.skyZipLocal %>'
      }
    },
    
    // Expose our zip tasks
    unzip: {
      'skyui-nuget-unzip': {
        src: '<%= paths.skyZipLocal %>',
        dest: '<%= paths.skyZipExpanded %>'
      }
    },
    
    // Expose our copy tasks
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
    
    // Expose our TFS / SkyUI tasks
    shell: {
      'skyui-tfs-clone': {
        command: 'git tf clone <%= paths.tfs %> <%= paths.skyTfsRemote %> <%= paths.skyTfsLocal %>'
      },
      'skyui-tfs-fetch': {
        command: 'git fetch <%= paths.skyLocal %>'
      }
    },
    
    // Expose jekyll tasks
    jekyll: {
      'renxt-serve': {
        options: {
          serve: true,
          baseurl: '""',
          config: '<%= paths.renxtConfig %>'
        }
      },
      'renxt-build': {
        options: {
          serve: false,
          config: '<%= paths.renxtConfig %>'
        }
      },
      'fenxt-serve': {
        options: {
          serve: true,
          baseurl: '""',
          config: '<%= paths.fenxtConfig %>'
        }
      },
      'fenxt-build': {
        options: {
          serve: false,
          config: '<%= paths.fenxtConfig %>'
        }
      }
    }
  });
  
  // Possibly not necessary in this context, but I'm namespacing all our commands.
  // It's obviously still possible to call the original grunt commands.
  grunt.registerTask('blackbaud:skyui-tfs-clone', 'shell:skyui-tfs-clone');
  grunt.registerTask('blackbaud:skyui-tfs-fetch', 'shell:skyui-tfs-fetch');
  grunt.registerTask('blackbaud:skyui-nuget', [
    'http:skyui-nuget-json', 
    'curl:skyui-nuget-download', 
    'unzip:skyui-nuget-unzip',
    'copy:skyui-nuget-copy'
  ]);
  
  // Not sure what the "default" task should do yet
  //grunt.registerTask('default', ['copy', 'concat', 'sass', 'watch']);
};