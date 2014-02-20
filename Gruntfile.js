/**
 * Created by chris on 20/02/2014.
 */

module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                drop_console: true,
                compress: true
            },
            files: {
                expand: true,
                flatten: true,
                src: ['app/*.js'],
                dest: 'release/webapps/habmin/app/'
            },
            automation: {
                expand: false,
                flatten: true,
                src: ['app/automation/*.js'],
                dest: 'release/webapps/habmin/app/automation/automation.js'
            },
            config: {
                expand: false,
                flatten: true,
                src: ['app/config/*.js'],
                dest: 'release/webapps/habmin/app/config/config.js'
            },
            graph: {
                expand: false,
                flatten: true,
                src: ['app/graph/*.js'],
                dest: 'release/webapps/habmin/app/graph/graph.js'
            },
            language: {
                expand: false,
                flatten: true,
                src: ['app/language/*.js'],
                dest: 'release/webapps/habmin/app/language/language.js'
            },
            system: {
                expand: false,
                flatten: true,
                src: ['app/system/*.js'],
                dest: 'release/webapps/habmin/app/system/system.js'
            },
            jsfiles: {
                expand: true,
                flatten: true,
                src: ['js/jsprintf.js', 'js/highcharts.js', 'js/highcharts-more.js', 'js/jit.js', 'js/ext-all.js', 'js/jquery.min.js', 'js/jquery.atmosphere.js'],
                dest: 'release/webapps/habmin/js/'
            },
            extuxgrid: {
                expand: true,
                flatten: true,
                src: ['js/extux/grid/*.js'],
                dest: 'release/webapps/habmin/js/extux/grid'
            },
            extuxeditor: {
                expand: true,
                flatten: true,
                src: ['js/extux/aceeditor/*.js'],
                dest: 'release/webapps/habmin/js/extux/aceeditor/'
            },
            extuxace: {
                expand: true,
                flatten: true,
                src: ['js/extux/aceeditor/ace/*.js'],
                dest: 'release/webapps/habmin/js/extux/aceeditor/ace/'
            },
            extuxnotification: {
                expand: true,
                flatten: true,
                src: ['js/extux/notification/*.js'],
                dest: 'release/webapps/habmin/js/extux/notification/'
            },
            extuxstatusbar: {
                expand: true,
                flatten: true,
                src: ['js/extux/statusbar/*.js'],
                dest: 'release/webapps/habmin/js/extux/statusbar/'
            }

        },
        copy: {
            images: {
                expand: true,
                src: ['images/**'],
                dest: 'release/webapps/habmin/'
            },
            addons: {
                expand: true,
                src: ['addons/**'],
                dest: 'release/addons/'
            },
            images: {
                expand: true,
                src: ['images/**'],
                dest: 'release/webapps/habmin/'
            },
            xml: {
                expand: true,
                src: ['openhab/**'],
                dest: 'release/webapps/habmin/'
            },
            language: {
                expand: true,
                src: ['app/language/*.json'],
                dest: 'release/webapps/habmin/'
            },
            resourceimg: {
                expand: true,
                src: ['resources/ext-theme-classic/images/**'],
                dest: 'release/webapps/habmin/'
            },
            statusbar: {
                expand: true,
                src: ['js/extux/statusbar/images/**'],
                dest: 'release/webapps/habmin/'
            }
        },
        cssmin: {
            habmin: {
                expand: true,
                src: ['app/*.css'],
                dest: 'release/webapps/habmin/'
            },
            statusbar: {
                expand: true,
                src: ['js/extux/statusbar/css/*.css'],
                dest: 'release/webapps/habmin/'
            },
            resourcecss: {
                expand: true,
                src: ['resources/css/**/*-all.css'],
                dest: 'release/webapps/habmin/'
            }
        },
        htmlmin: {
            index: {
                expand: true,
                src: ['index.html'],
                dest: 'release/webapps/habmin/'
            }
        },
        'json-minify': {
            language: {
                files: 'release/webapps/habmin/app/language/*.json'
            }
        }

    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-xmlmin');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-json-minify');

    // Default task(s).
    grunt.registerTask('default', ['uglify', 'copy', 'cssmin', 'htmlmin', 'json-minify']);

};
