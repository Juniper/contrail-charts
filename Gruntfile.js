module.exports = function( grunt ) {
  grunt.loadNpmTasks( 'grunt-contrib-copy' );
  grunt.loadNpmTasks( 'grunt-contrib-clean' );
  grunt.loadNpmTasks( 'grunt-bowercopy' );
  grunt.loadNpmTasks( 'grunt-contrib-requirejs' );
  grunt.loadNpmTasks( 'grunt-contrib-jshint' );
  grunt.loadNpmTasks( 'grunt-contrib-watch' );
  grunt.loadNpmTasks( 'grunt-contrib-sass' );
  grunt.loadNpmTasks( 'grunt-contrib-jasmine' );
  grunt.loadNpmTasks( 'grunt-contrib-connect' );

  // Fix for grunt-template-jasmine-requirejs old grunt.util._ support.
  grunt.util._.contains = require( 'underscore' ).contains;
  grunt.util._.template = function( tmpl, context ) { return require( 'underscore' ).template( tmpl )( context ) };

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    clean: {
      build: ['build/'],
      dev: {
        src: ['build/**/*']
      },
      examples: {
        src: ['examples/build/**/*']
      }
    },

    sass: {
      dist: {
        options: {
          style: 'compressed'
        },
        files: {
          'build/css/contrail-charts.min.css': 'src/sass/contrail-charts.scss'
        }
      },
      examples: {
        options: {
          style: 'compressed',
          loadPath: ['bower_components/components-font-awesome/scss','src/sass','examples/src/scss']
        },
        files: {
          'examples/build/css/contrail-charts-examples-all.css': 'examples/src/scss/contrail-charts-examples-all.scss'
        }
      }
    },

    copy: {
      dev: {
        files: [
          { expand: true, cwd: 'src', flatten: false, src: ['**/*.html', '**/*.js', '**/*.png'], dest: 'build/', filter: 'isFile' },
          { expand: true, flatten: true,  src: ['build/js/lib/require.js'], dest: 'build/js/', filter: 'isFile' }
        ]
      },
      examples: {
        files: [
          { expand: true, flatten: true,  src: ['examples/src/html/index.html'], dest: 'examples/build/', filter: 'isFile' },
          { expand: true, flatten: true,  src: ['build/js/lib/require.js'], dest: 'examples/build/js/lib/', filter: 'isFile' }
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
      },
      fonts: {
        options: {
          destPrefix: 'examples/build'
        },
        files: {
          'fonts': 'components-font-awesome/fonts/*'
        }
      }
    },

    requirejs: {
      // For production optimize javascript into one minified version without dependencies.
      compile: {
        options: {
          //name: 'bower_components/almond/almond',
          include: ['contrail-charts'],
          exclude: ['jquery', 'd3', 'underscore', 'backbone'],
          baseUrl: 'src/js',
          mainConfigFile: 'src/js/config.js',
          out: 'build/js/contrail-charts.min.js',
          paths: {
            'contrail-charts': 'contrail-charts',
            'jquery': 'empty:',
            'd3': 'empty:',
            'underscore': 'empty:',
            'backbone': 'empty:'
          },
          preserveLicenseComments: false,
          generateSourceMaps: true,
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
      // For the examples build one file with all dependencies included inside.
      examples: {
        options: {
          name: 'config',
          baseUrl: 'examples/src/js',
          mainConfigFile: 'examples/src/js/config.js',
          out: 'examples/build/js/contrail-charts-examples-all.js',
          paths: {
            'contrail-charts': '../../../build/js/contrail-charts',
            'jquery': '../../../build/js/lib/jquery',
            'd3': '../../../build/js/lib/d3',
            'underscore': '../../../build/js/lib/underscore',
            'backbone': '../../../build/js/lib/backbone'
          },
          optimize: 'none'
        }
      }
    },

    connect: {
      test : {
        port : 8000
      }
    },
    jasmine: {
      test: {
        src: 'src/js/**/*.js',
        options: {
          keepRunner: true,
          specs: 'tests/*Spec.js',
          helpers: 'tests/*Helper.js',
          host: 'http://127.0.0.1:8000/',
          template: require( 'grunt-template-jasmine-requirejs' ),
          templateOptions: {
            version: 'build/js/lib/require.js',
            requireConfigFile: 'src/js/config.js',
            requireConfig: {
              baseUrl: 'src/js',
              paths: {
                'contrail-charts': 'contrail-charts',
                requirejs: 'lib/require',
                jquery: '../../build/js/lib/jquery',
                d3: '../../build/js/lib/d3',
                underscore: '../../build/js/lib/underscore',
                backbone: '../../build/js/lib/backbone'
              }
            }
          }
        }
      }
    },

    watch: {
      src: {
        files: [ 'src/js/**/*.js', 'src/sass/**/*.scss', 'src/**/*.html', 'examples/src/js/**/*.js', 'examples/src/scss/**/*.scss', 'examples/src/html/**/*.html' ],
        tasks: [ 'copy:examples', 'sass:examples', 'requirejs:dev', 'requirejs:examples' ]
      }
    }
  });

  grunt.registerTask( 'default',  [ 'clean:dev', 'bowercopy:js', 'sass:dist', 'requirejs:dev', 'watch' ] );
  grunt.registerTask( 'examples',  [ 'clean:examples', 'bowercopy:js', 'bowercopy:fonts', 'copy:examples', 'sass:examples', 'requirejs:dev', 'requirejs:examples', 'watch' ] );
  grunt.registerTask( 'lib', [ 'clean:dev', 'sass:dist', 'requirejs:compile' ] );
  grunt.registerTask( 'test', [ 'clean:dev', 'bowercopy:js', 'sass:dist', 'connect:test', 'jasmine:test' ] );

};
