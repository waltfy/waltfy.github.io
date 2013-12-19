module.exports = function (grunt) {
  /* Grunt config */
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        stripBanners: true,
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      scripts: {
        src: [
          'src/js/main.js'
        ],
        dest: 'dist/scripts/scripts.js'
      },
      styles: {
        src: [
          'src/styl/funct.styl',
          'src/styl/main.styl',
        ],
        dest: 'src/styl/style.styl'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      scripts: {
        src: 'dist/js/scripts.js',
        dest: 'dist/js/scripts.min.js'
      }
    },
    stylus: {
      compile: {
        files: {
          'dist/styles/style.css': ['src/styl/style.styl']
        }
      }
    },
    copy: {
      main: {
        files: [{
          expand: true,
          cwd: 'src/fonts/',
          src: ['**'],
          dest: 'dist/fonts/'
        },
        {
          expand: true,
          cwd: 'src/img/',
          src: ['**'],
          dest: 'dist/img/'
        }]
      }
    },
    watch: {
      scripts: {
        files: ['src/js/*.js'],
        tasks: ['concat:scripts'],
        options: {
          livereload: true
        }
      },
      jade: {
        files: ['views/*.jade'],
        options: {
          livereload: true
        }
      },
      style: {
        files: ['src/styl/*.styl'],
        tasks: ['concat:styles', 'stylus'],
        options: {
          livereload: true
        }
      }
    } 
  });

  /* Load all of Grunt's tasks */
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  /* Default task(s) */
  grunt.registerTask('default', ['copy', 'concat', 'stylus', 'watch']);

};
