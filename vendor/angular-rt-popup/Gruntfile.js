module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-bump');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-jscs-checker');
    grunt.loadNpmTasks('grunt-ng-annotate');

    grunt.initConfig({
        config: {
            name: 'angular-rt-popup',
            e2ePort: 9000
        },

        jshint: {
            lib: {
                options: {
                    jshintrc: '.jshintrc'
                },
                files: {
                    src: ['src/**/*.js']
                }
            },
        },

        jscs: {
            src: {
                options: {
                    config: '.jscs.json'
                },
                files: {
                    src: ['*.js', 'src/**/*.js']
                }
            },
        },

        concat: {
            dist: {
                files: {
                    'dist/<%= config.name %>.js': ['src/*.js']
                }
            }
        },

        uglify: {
            dist: {
                files: {
                    'dist/<%= config.name %>.min.js': 'dist/<%= config.name %>.js'
                }
            }
        },

        clean: {
            all: ['dist']
        },

        watch: {
            all: {
                files: ['src/**/*.js'],
                tasks: ['build']
            }
        },

        ngAnnotate: {
            dist: {
                files: {
                    'dist/<%= config.name %>.js': 'dist/<%= config.name %>.js'
                }
            }
        },

        bump: {
            options: {
                files: ['package.json', 'bower.json'],
                commitFiles: ['-a'],
                pushTo: 'origin'
            }
        }
    });

    grunt.registerTask('default', ['build', 'watch']);
    grunt.registerTask('build', ['clean', 'jshint', 'jscs', 'concat', 'ngAnnotate', 'uglify']);
    grunt.registerTask('ci', ['build']);
};
