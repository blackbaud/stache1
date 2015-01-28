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
  
  // Private vars
  var ns = 'blackbaud';
  
  // Load the required node modules
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-curl');
  grunt.loadNpmTasks('grunt-http');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-zip');

  // Initialize our configuration
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
    
    // Downloads the latest nuget package, saving it as a zip file.
    curl: {
      'skyui-nuget-download': {
        src: '<%= paths.skyZipRemote %>',
        dest: '<%= paths.skyZipLocal %>'
      }
    },
    
    // Unzips our nuget package
    unzip: {
      'skyui-nuget-unzip': {
        src: '<%= paths.skyZipLocal %>',
        dest: '<%= paths.skyZipExpanded %>'
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
      'fenxt-serve': {
        command: 'jekyll build --config _config.yml,<%= paths.fenxtConfig %>' 
      }
    }
  });
  
  // Possibly not necessary in this context, but I'm namespacing all our commands.
  // I do like this approach as it also abstracts the original grunt task.
  // Meaning if we need to change a task, the command and our documentation don't have to change.
  // It's obviously still possible to call the original grunt commands.
  grunt.registerTask(ns + ':renxt-serve', 'shell:renxt-serve');
  grunt.registerTask(ns + ':renxt-build', 'shell:renxt-build');
  grunt.registerTask(ns + ':fenxt-serve', 'shell:fenxt-serve');
  grunt.registerTask(ns + ':fenxt-build', 'shell:fenxt-build');
  grunt.registerTask(ns + ':skyui-tfs-clone', 'shell:skyui-tfs-clone');
  grunt.registerTask(ns + ':skyui-tfs-fetch', 'shell:skyui-tfs-fetch');
  grunt.registerTask(ns + ':skyui-nuget', [
    'http:skyui-nuget-json', 
    'curl:skyui-nuget-download', 
    'unzip:skyui-nuget-unzip',
    'copy:skyui-nuget-copy'
  ]);
  
  // Not sure what the "default" task should do yet
  //grunt.registerTask('default', ['copy', 'concat', 'sass', 'watch']);
};