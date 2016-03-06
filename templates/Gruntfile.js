module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify : {
      build: {
        src: 'games/<%= @game_id %>/<%= pkg.name %>.concat.js',
        dest: 'games/<%= @game_id %>/<%= pkg.name %>.min.js'
      }
    },
    concat : {
      options: {
        separator: "//==========================\n",
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n(function() {\n',
        footer: '})();'
      },
      dist: {
        src: ['games/<%= @game_id %>/helper/require.js',
              'games/<%= @game_id %>/lib/*.js',
              'games/<%= @game_id %>/src/*.js',
              'games/<%= @game_id %>/helper/loader.js'],
        dest: 'games/<%= @game_id %>/<%= pkg.name %>.concat.js',
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');

  // Default task(s).
  grunt.registerTask('default', ['concat', 'uglify']);

};
