module.exports = function(grunt) {
  grunt.loadNpmTasks( 'grunt-contrib-copy' );
  grunt.loadNpmTasks( 'grunt-contrib-clean' );
  grunt.loadNpmTasks( 'grunt-bowercopy' );
  grunt.loadNpmTasks( 'grunt-contrib-requirejs' );
  grunt.loadNpmTasks( 'grunt-bower-requirejs' );
  grunt.loadNpmTasks( 'grunt-contrib-jshint' );
  grunt.loadNpmTasks( 'grunt-contrib-uglify' );
  grunt.loadNpmTasks( 'grunt-contrib-cssmin' );
  grunt.loadNpmTasks( 'grunt-contrib-watch' );
  grunt.loadNpmTasks( 'grunt-contrib-sass' );

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    clean: {
      build: ['build/'],
      dev: {
        src: ['build/**/*']
      },
      lib: {
        src: ['build/**/lib', 'build/css/main.css']
      }
    },

    sass: {
      dist: {
        options: {
          //style: 'expanded'
          style: 'compressed'
        },
        files: {
          'build/css/contrail-charts.css': 'src/sass/contrail-charts.scss'
        }
      }
    },

    copy: {
      prod: {
        files: [
          { expand: true, cwd: 'src', flatten: false, src: ['**/*.html', '**/*.png'], dest: 'build/', filter: 'isFile' }
        ]
      },
      dev: {
        files: [
          { expand: true, cwd: 'src', flatten: false, src: ['**/*.html', '**/*.js', '**/*.png'], dest: 'build/', filter: 'isFile' },
          { expand: true, flatten: true,  src: ['build/js/lib/require.js'], dest: 'build/js/', filter: 'isFile' }
        ]
      }
    },

    bowercopy: {
      options: {},
      js: {
        options: {
          destPrefix: 'build/js/lib'
        },
        files: {
          'require.js': 'requirejs/require.js',
          'jquery.js': 'jquery/dist/jquery.js',
          'd3.js': 'd3/d3.js',
          'underscore.js': 'underscore/underscore.js',
          'backbone.js': 'backbone/backbone.js'
        }
      }
      /*,
      css: {
        options: {
          destPrefix: 'build/css/lib'
        },
        files: {
        }
      }
      */
    },

    uglify: {
      prod: {
        files: {
          'build/js/require.js': ['build/js/lib/require.js']
        }
      }
    },

    requirejs: {
      compile: {
        options: {
          name: 'bower_components/almond/almond',
          baseUrl: 'src/js/',
          mainConfigFile: 'src/js/config.js',
          out: 'build/js/config.js',
          paths: {
            /*
            'jquery': '../../build/js/lib/jquery',
            'd3': '../../build/js/lib/d3',
            'underscore': '../../build/js/lib/underscore',
            'backbone': '../../build/js/lib/backbone'
            */
          },
          preserveLicenseComments: false,
          optimize: 'uglify2',
          uglify2: {
            output: {
                beautify: false
            },
            compress: {
                drop_console: true,
                sequences: false,
                global_defs: {
                    DEBUG: false
                }
            },
            warnings: true,
            mangle: true
          }
        }
      },
      dev: {
        options: {
          //name: '../../bower_components/almond/almond',
          include: ['contrail-charts'],
          exclude: ['jquery', 'd3', 'underscore', 'backbone'],
          baseUrl: 'src/js',
          mainConfigFile: 'src/js/config.js',
          out: 'build/js/contrail-charts.js',
          paths: {
            'contrail-charts': 'contrail-charts',
            'jquery': 'empty:',
            'd3': 'empty:',
            'underscore': 'empty:',
            'backbone': 'empty:'
          },
          /*
          wrap: {
            startFile: 'src/js/wrap.start',
            endFile: 'src/js/wrap.end'
          },
          */
          /*
          paths: {
            'jquery': '../../build/js/lib/jquery',
            'd3': '../../build/js/lib/d3',
            'underscore': '../../build/js/lib/underscore',
            'backbone': '../../build/js/lib/backbone'
          },
          */
          optimize: 'none'
        }
      },
      examples: {
        options: {
          name: 'config',
          baseUrl: 'examples/js',
          mainConfigFile: 'examples/js/config.js',
          out: 'examples/js/contrail-charts-examples-all-min.js',
          paths: {
            'contrail-charts': '../../build/js/contrail-charts',
            'jquery': '../../build/js/lib/jquery',
            'd3': '../../build/js/lib/d3',
            'underscore': '../../build/js/lib/underscore',
            'backbone': '../../build/js/lib/backbone'
          },
          optimize: 'none'
        }
      },
      css: {
        options: {
          //optimizeCss: "standard.keepLines.keepWhitespace",
          optimizeCss: "standard",
          cssIn: "build/css/contrail-charts.css",
          out: "build/css/contrail-charts-min.css"
        }
      }
    },

    bowerRequirejs: {
      all: {
        rjsConfig: 'src/js/config.js'
      }
    },

    watch: {
      src: {
        files: [ 'src/js/**/*.js', 'src/sass/**/*.scss', 'src/**/*.html' ],
        tasks: [ 'sass', 'requirejs:css', 'requirejs:dev', 'requirejs:examples' ]
      }
    }
  });

  grunt.registerTask( 'default',  ['clean:dev', 'bowercopy:js', /*'bowercopy:css', 'copy:dev',*/  'sass', 'requirejs:css', 'requirejs:dev', 'watch' ] );
  grunt.registerTask( 'examples',  ['clean:dev', 'bowercopy:js', /*'bowercopy:css', 'copy:dev',*/  'sass', 'requirejs:css', 'requirejs:dev', 'requirejs:examples', 'watch' ] );
  grunt.registerTask( 'prod', ['clean:dev', 'bowercopy:js', 'bowercopy:css', 'copy:prod', 'sass', 'requirejs:css', 'requirejs:compile', 'uglify:prod', 'clean:lib' ] );

};
