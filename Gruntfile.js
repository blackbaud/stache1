module.exports = function(grunt) {

  grunt.initConfig({
    
    // Reads package information
    pkg: grunt.file.readJSON('package.json'),
    
    // Paths used through this gruntfile
    paths: {
      tfs:  'https://tfs.blackbaud.com/tfs/DefaultCollection/',
      skyRemote: '$/Products/REx/Styles/Sky/DEV/Sky/Content/Styles/Sky/',
      skyLocal: '_sass/Sky/',
      renxtConfig: '_config.yml,_config.renxt.yml',
      fenxtConfig: '_config.yml,_config.fenxt.yml'
    },
    
    // Expose our TFS / SkyUI tasks
    shell: {
      skyuiClone: {
        command: 'git tf clone <%= paths.tfs %> <%= paths.skyRemote %> <%= paths.skyLocal %>'
      },
      skyuiFetch: {
        command: 'git fetch <%= paths.skyLocal %>'
      }
    },
    
    // Expose jekyll tasks
    jekyll: {
      renxtServe: {
        options: {
          serve: true,
          baseurl: '""',
          config: '<%= paths.renxtConfig %>'
        }
      },
      renxtBuild: {
        options: {
          serve: false,
          config: '<%= paths.renxtConfig %>'
        }
      },
      fenxtServe: {
        options: {
          serve: true,
          baseurl: '""',
          config: '<%= paths.fenxtConfig %>'
        }
      },
      fenxtBuild: {
        options: {
          serve: false,
          config: '<%= paths.fenxtConfig %>'
        }
      }
    }
  });
  
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-jekyll');
  
  //grunt.registerTask('default', ['copy', 'concat', 'sass', 'watch']);
};