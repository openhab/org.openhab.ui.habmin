module.exports = function (grunt) {

    /**
     * Load required Grunt tasks. These are installed based on the versions listed
     * in `package.json` when you do `npm install` in this directory.
     */
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-conventional-changelog');
    grunt.loadNpmTasks('grunt-bump');
    grunt.loadNpmTasks('grunt-json-minify');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-ng-annotate');
    grunt.loadNpmTasks('grunt-html2js');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-phonegap');
    grunt.loadNpmTasks('grunt-bootlint');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-run-java');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    /**
     * Load in our build configuration file.
     */
    var userConfig = require('./build.config.js');

    /**
     * This is the configuration object Grunt uses to give each plugin its
     * instructions.
     */
    var taskConfig = {
        /**
         * We read in our `package.json` file so we can access the package name and
         * version. It's already there, so we don't repeat ourselves here.
         */
        pkg: grunt.file.readJSON("package.json"),

        /**
         * The banner is the comment that is placed at the top of our compiled
         * source files. It is first processed as a Grunt template, where the `<%=`
         * pairs are evaluated based on this very configuration object.
         */
        meta: {
            banner: '/**\n' +
            ' * <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
            ' * <%= pkg.homepage %>\n' +
            ' *\n' +
            ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
            ' * Licensed <%= pkg.licenses.type %> <<%= pkg.licenses.url %>>\n' +
            ' */\n'
        },

        /**
         * Creates a changelog on a new version.
         */
        changelog: {
            options: {
                dest: 'CHANGELOG.md',
                template: 'changelog.tpl'
            }
        },

        /**
         * Increments the version number, etc.
         */
        bump: {
            options: {
                files: [
                    "package.json",
                    "bower.json"
                ],
                commit: false,
                commitMessage: 'chore(release): v%VERSION%',
                commitFiles: [
                    "package.json",
                    "client/bower.json"
                ],
                createTag: false,
                tagName: 'v%VERSION%',
                tagMessage: 'Version %VERSION%',
                push: false,
                pushTo: 'origin'
            }
        },

        /**
         * The directories to delete when `grunt clean` is executed.
         */
        clean: {
            init: [
                '<%= build_dir %>',
                '<%= compile_dir %>',
                '<%= phonebuild_dir %>',
                '<%= output_dir %>'
            ],
            css: {
                src: '<%= compile_dir %>/assets/<%= pkg.name %>-*-<%= pkg.version %>.css'
            },
            changelog: {
                src: 'CHANGELOG.md'
            }
        },

        /**
         * The `copy` task just copies files from A to B. We use it here to copy
         * our project assets (images, fonts, etc.) and javascripts into
         * `build_dir`, and then to copy the assets to `compile_dir`.
         */
        copy: {
            build_app_assets: {
                files: [
                    {
                        src: ['**'],
                        dest: '<%= build_dir %>/assets/',
                        cwd: 'src/assets',
                        expand: true
                    }
                ]
            },
            build_app_languages: {
                files: [
                    {
                        src: ['**'],
                        dest: '<%= build_dir %>/languages/',
                        cwd: 'src/languages',
                        expand: true
                    }
                ]
            },
            build_vendor_assets: {
                files: [
                    {
                        src: ['<%= vendor_files.assets %>'],
                        dest: '<%= build_dir %>/assets/',
                        cwd: '.',
                        expand: true,
                        flatten: true
                    }
                ]
            },
            build_appjs: {
                files: [
                    {
                        src: ['<%= app_files.js %>'],
                        dest: '<%= build_dir %>/',
                        cwd: '.',
                        expand: true
                    }
                ]
            },
            build_vendorjs: {
                files: [
                    {
                        src: ['<%= vendor_files.js %>'],
                        dest: '<%= build_dir %>/',
                        cwd: '.',
                        expand: true
                    }
                ]
            },
            build_vendorcss: {
                files: [
                    {
                        src: ['<%= vendor_files.css %>'],
                        dest: '<%= build_dir %>/assets',
                        cwd: '.',
                        expand: true,
                        flatten: true
                    }
                ]
            },
            compile_assets: {
                files: [
                    {
                        src: ['**'],
                        dest: '<%= compile_dir %>/assets',
                        cwd: '<%= build_dir %>/assets',
                        expand: true
                    }
                ]
            },
            compile_languages: {
                files: [
                    {
                        src: ['**'],
                        dest: '<%= compile_dir %>/languages/',
                        cwd: '<%= build_dir %>/languages',
                        expand: true
                    }
                ]
            }
        },

        /**
         * Combine and minify all CSS
         */
        cssmin: {
            target: {
                options: {
// The following lines may be useful for debugging if there are problems with the minification
//                    keepBreaks: true,
//                    aggressiveMerging: false
                },
                files: [{
                    src: [
                        '<%= vendor_files.css %>',
                        '<%= build_dir %>/assets/<%= pkg.name %>-*-<%= pkg.version %>.css'
                    ],
                    dest: '<%= compile_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.css'
                }]
            }
        },

        /**
         * `grunt concat` concatenates multiple source files into a single file.
         */
        concat: {
            /**
             * The `build_css` target concatenates compiled CSS and vendor CSS
             * together.
             */
            build_css: {
                src: [
                    '<%= vendor_files.css %>',
                    '<%= build_dir %>/assets/<%= pkg.name %>-*-<%= pkg.version %>.css'
                ],
                dest: '<%= build_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.css'
            },
            /**
             * The `compile_js` target is the concatenation of our application source
             * code and all specified vendor source code into a single file.
             */
            compile_js: {
                options: {
                    banner: '<%= meta.banner %>'
                },
                src: [
                    '<%= vendor_files.js %>',
                    'module.prefix',
                    '<%= build_dir %>/src/**/*.js',
                    '<%= html2js.app.dest %>',
                    '<%= html2js.common.dest %>',
                    'module.suffix'
                ],
                dest: '<%= compile_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.js'
            }
        },

        /**
         * `ng-annotate` annotates the sources before minifying. That is, it allows us
         * to code without the array syntax.
         */
        ngAnnotate: {
            compile: {
                files: [
                    {
                        src: '<%= compile_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.js'
                    }
                ]
            }
        },

        /**
         * `json-min`  minifys the json language files
         */
        'json-minify': {
            build: {
                files: '<%= compile_dir %>/languages/*/**.*.json'
            }
        },

        /**
         * Minify the sources!
         */
        uglify: {
            compile: {
                options: {
                    banner: '<%= meta.banner %>',
                    ASCIIOnly: true,
                    preserveComments: false
                },
                files: {
                    '<%= concat.compile_js.dest %>': '<%= concat.compile_js.dest %>'
                }
            }
        },

        /**
         * `grunt-contrib-less` handles our LESS compilation and uglification automatically.
         */
        less: {
            // Will be generated dynamically to account for themes
        },

        /**
         * `jshint` defines the rules of our linter as well as which files we
         * should check. This file, all javascript sources, and all our unit tests
         * are linted based on the policies listed in `options`. But we can also
         * specify exclusionary patterns by prefixing them with an exclamation
         * point (!); this is useful when code comes from a third party but is
         * nonetheless inside `src/`.
         */
        jshint: {
            src: [
                '<%= app_files.js %>'
            ],
            test: [
                '<%= app_files.jsunit %>'
            ],
            gruntfile: [
                'Gruntfile.js'
            ],
            options: {
                curly: true,
                immed: true,
                newcap: true,
                noarg: true,
                sub: true,
                boss: true,
                eqnull: true
            },
            globals: {}
        },

        /**
         * HTML2JS is a Grunt plugin that takes all of your template files and
         * places them into JavaScript files as strings that are added to
         * AngularJS's template cache. This means that the templates too become
         * part of the initial payload as one JavaScript file. Neat!
         */
        html2js: {
            /**
             * These are the templates from `src/app`.
             */
            app: {
                options: {
                    base: 'src/app',
                    htmlmin: {
                        collapseBooleanAttributes: true,
                        collapseWhitespace: true,
                        conservativeCollapse: true,
                        removeAttributeQuotes: true,
                        removeComments: true,
                        removeCommentsFromCDATA: true,
                        removeEmptyAttributes: true,
                        removeRedundantAttributes: true,
                        removeScriptTypeAttributes: true,
                        removeStyleLinkTypeAttributes: true
                    }
                },
                src: ['<%= app_files.atpl %>'],
                dest: '<%= build_dir %>/templates-app.js'
            },

            /**
             * These are the templates from `src/common`.
             */
            common: {
                options: {
                    base: 'src/common',
                    htmlmin: {
                        collapseBooleanAttributes: true,
                        collapseWhitespace: true,
                        removeAttributeQuotes: true,
                        removeComments: true,
                        removeEmptyAttributes: true,
                        removeRedundantAttributes: true,
                        removeScriptTypeAttributes: true,
                        removeStyleLinkTypeAttributes: true
                    }
                },
                src: ['<%= app_files.ctpl %>'],
                dest: '<%= build_dir %>/templates-common.js'
            }
        },

        /**
         * The Karma configurations.
         */
        karma: {
            options: {
                configFile: '<%= build_dir %>/karma-unit.js'
            },
            unit: {
                port: 9019,
                background: true
            },
            continuous: {
                singleRun: true
            }
        },

        /**
         * The `index` task compiles the `index.html` file as a Grunt template. CSS
         * and JS files co-exist here but they get split apart later.
         */
        index: {
            /**
             * During development, we don't want to have wait for compilation,
             * concatenation, minification, etc. So to avoid these steps, we simply
             * add all script files directly to the `<head>` of `index.html`. The
             * `src` property contains the list of included files.
             */
            build: {
                dir: '<%= build_dir %>',
                src: [
                    '<%= vendor_files.js %>',
                    '<%= build_dir %>/src/**/*.js',
                    '<%= html2js.common.dest %>',
                    '<%= html2js.app.dest %>',
                    '<%= build_dir %>/assets/**/*.css',
                    '<%= build_dir %>/assets/<%= pkg.name %>-*-<%= pkg.version %>.css'
                ],
                build: 'browser'
            },

            phonegap: {
                dir: '<%= build_dir %>',
                src: [
                    '<%= vendor_files.js %>',
                    '<%= build_dir %>/src/**/*.js',
                    '<%= html2js.common.dest %>',
                    '<%= html2js.app.dest %>',
                    '<%= vendor_files.css %>',
                    '<%= build_dir %>/assets/<%= pkg.name %>-*-<%= pkg.version %>.css'
                ],
                build: 'phonegap'
            },

            /**
             * When it is time to have a completely compiled application, we can
             * alter the above to include only a single JavaScript and a single CSS
             * file. Now we're back!
             */
            compile: {
                dir: '<%= compile_dir %>',
                src: [
                    '<%= concat.compile_js.dest %>',
                    '<%= compile_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.css'
                ],
                build: 'browser'
            }
        },

        /**
         * This task compiles the karma template so that changes to its file array
         * don't have to be managed manually.
         */
        karmaconfig: {
            unit: {
                dir: '<%= build_dir %>',
                src: [
                    '<%= vendor_files.js %>',
                    '<%= html2js.app.dest %>',
                    '<%= html2js.common.dest %>',
                    '<%= test_files.js %>'
                ]
            }
        },

        /**
         * And for rapid development, we have a watch set up that checks to see if
         * any of the files listed below change, and then to execute the listed
         * tasks when they do. This just saves us from having to type "grunt" into
         * the command-line every time we want to see what we're working on; we can
         * instead just leave "grunt watch" running in a background terminal. Set it
         * and forget it, as Ron Popeil used to tell us.
         *
         * But we don't need the same thing to happen for all the files.
         */
        delta: {
            /**
             * By default, we want the Live Reload to work for all tasks; this is
             * overridden in some tasks (like this file) where browser resources are
             * unaffected. It runs by default on port 35729, which your browser
             * plugin should auto-detect.
             */
            options: {
                livereload: true
            },

            /**
             * When the Gruntfile changes, we just want to lint it. In fact, when
             * your Gruntfile changes, it will automatically be reloaded!
             */
            gruntfile: {
                files: 'Gruntfile.js',
                tasks: ['jshint:gruntfile'],
                options: {
                    livereload: false
                }
            },

            /**
             * When our JavaScript source files change, we want to run lint them and
             * run our unit tests.
             */
            jssrc: {
                files: [
                    '<%= app_files.js %>'
                ],
                tasks: [ 'jshint:src', 'karma:unit:run', 'copy:build_appjs' ]
            },

            /**
             * When assets are changed, copy them. Note that this will *not* copy new
             * files, so this is probably not very useful.
             */
            assets: {
                files: [
                    'src/assets/**/*'
                ],
                tasks: ['copy:build_app_assets', 'copy:build_vendor_assets']
            },

            /**
             * When language files are changed, copy them.
             * Note that this will *not* copy new files
             */
            langages: {
                files: [
                    'languages/**/*'
                ],
                tasks: ['copy:build_app_languages']
            },

            /**
             * When index.html changes, we need to compile it.
             */
            html: {
                files: ['<%= app_files.html %>'],
                tasks: ['index:build']
            },

            /**
             * When our templates change, we only rewrite the template cache.
             */
            tpls: {
                files: [
                    '<%= app_files.atpl %>',
                    '<%= app_files.ctpl %>'
                ],
                tasks: ['html2js']
            },

            /**
             * When the CSS files change, we need to compile and minify them.
             */
            less: {
                files: ['src/**/*.less'],
                tasks: ['less:build']
            },

            /**
             * When a JavaScript unit test file changes, we only want to lint it and
             * run the unit tests. We don't want to do any live reloading.
             */
            jsunit: {
                files: [
                    '<%= app_files.jsunit %>'
                ],
                tasks: ['jshint:test', 'karma:unit:run'],
                options: {
                    livereload: false
                }
            }
        },

        /**
         * PhoneGap compiler configuration
         */
        phonegap: {
            config: {
                root: 'build',
                config: 'phonegap/config.xml',
                cordova: 'phonegap/.cordova',
                html: 'index.html',
                path: '<%= phonebuild_dir %>',
//                plugins: ['/local/path/to/plugin', 'http://example.com/path/to/plugin.git'],
                platforms: ['android'],
                maxBuffer: 200, // You may need to raise this for iOS.
                verbose: false,
                releases: 'releases',
                releaseName: function () {
                    var pkg = grunt.file.readJSON('package.json');
                    return (pkg.name + '-' + pkg.version);
                },
                debuggable: false,

                // Must be set for ios to work.
                // Should return the app name.
                name: function () {
                    var pkg = grunt.file.readJSON('package.json');
                    return pkg.name;
                },

                // Add a key if you plan to use the `release:android` task
                // See http://developer.android.com/tools/publishing/app-signing.html
                key: {
                    store: 'release.keystore',
                    alias: 'release',
                    aliasPassword: function () {
                        // Prompt, read an environment variable, or just embed as a string literal
                        return ('');
                    },
                    storePassword: function () {
                        // Prompt, read an environment variable, or just embed as a string literal
                        return ('');
                    }
                },

                // Set an app icon at various sizes (optional)
                icons: {
                    android: {
                        ldpi: 'phonegap/images/icon-36-ldpi.png',
                        mdpi: 'phonegap/images/icon-48-mdpi.png',
                        hdpi: 'phonegap/images/icon-72-hdpi.png',
                        xhdpi: 'phonegap/images/icon-96-xhdpi.png'
                    },
                    wp8: {
                        app: 'icon-62-tile.png',
                        tile: 'icon-173-tile.png'
                    },
                    ios: {
                        icon29: 'icon29.png',
                        icon29x2: 'icon29x2.png',
                        icon40: 'icon40.png',
                        icon40x2: 'icon40x2.png',
                        icon57: 'icon57.png',
                        icon57x2: 'icon57x2.png',
                        icon60x2: 'icon60x2.png',
                        icon72: 'icon72.png',
                        icon72x2: 'icon72x2.png',
                        icon76: 'icon76.png',
                        icon76x2: 'icon76x2.png'
                    }
                },

                // Set a splash screen at various sizes (optional)
                // Only works for Android and IOS
                /*                screens: {
                 android: {
                 ldpi: 'screen-ldpi-portrait.png',
                 // landscape version
                 ldpiLand: 'screen-ldpi-landscape.png',
                 mdpi: 'screen-mdpi-portrait.png',
                 // landscape version
                 mdpiLand: 'screen-mdpi-landscape.png',
                 hdpi: 'screen-hdpi-portrait.png',
                 // landscape version
                 hdpiLand: 'screen-hdpi-landscape.png',
                 xhdpi: 'screen-xhdpi-portrait.png',
                 // landscape version
                 xhdpiLand: 'www/screen-xhdpi-landscape.png'
                 },
                 ios: {
                 // ipad landscape
                 ipadLand: 'screen-ipad-landscape.png',
                 ipadLandx2: 'screen-ipad-landscape-2x.png',
                 // ipad portrait
                 ipadPortrait: 'screen-ipad-portrait.png',
                 ipadPortraitx2: 'screen-ipad-portrait-2x.png',
                 // iphone portrait
                 iphonePortrait: 'screen-iphone-portrait.png',
                 iphonePortraitx2: 'screen-iphone-portrait-2x.png',
                 iphone568hx2: 'screen-iphone-568h-2x.png'
                 }
                 },*/

                // Android-only integer version to increase with each release.
                // See http://developer.android.com/tools/publishing/versioning.html
                versionCode: function () {
                    return (1);
                },

                // Android-only options that will override the defaults set by Phonegap in the
                // generated AndroidManifest.xml
                // See https://developer.android.com/guide/topics/manifest/uses-sdk-element.html
                minSdkVersion: function () {
                    return (10);
                },
                targetSdkVersion: function () {
                    return (19);
                },

                // iOS7-only options that will make the status bar white and transparent
                iosStatusBar: 'WhiteAndTransparent',

                // Set an explicit Android permissions list to override the automatic plugin defaults.
                // In most cases, you should omit this setting. See 'Android Permissions' in README.md for details.
                permissions: ['INTERNET', 'ACCESS_COURSE_LOCATION']
            }
        },

        /**
         * Check that our Bootstrap templates are ok
         */
        bootlint: {
            options: {
                stoponerror: false,
                relaxerror: []
            },
            files: ['<%= app_files.atpl %>']
        },

        /**
         * Run java
         */
        run_java: {
            options: {
                // Task-specific options go here.
            },
            your_target: {
                // Target-specific details go here.
                execOptions:{
                    cwd: "/your/current/working/directory/"
                },
                command: "",      //java ,javac, jarsigner, jar
                jarName: "",      //used for java, jar and jarsigner
                className: "",    //used for java
                javaArgs : "",    //used for java
                sourceFiles: [""],//used for javac
                javaOptions: {    //used for java and javac
                    "classpath": [""]
                }
            },
            manifestName: "", //used for jar
            dir: "",          //used for jar
            files: "",        //used for jar
            jarOptions : {    //used for jar and jarsigner
                "keystore": ""
            },
            alias: ""         //used for jarsigner
        },

        /**
         * Minify the index html file
         */
        htmlmin: {
            compile: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: [
                    {
                    src: '<%= compile_dir %>/index.html',
                    dest: '<%= compile_dir %>/index.html'
                    }
                ]
            }
        },

        /**
         * Compress the output
         */
        compress: {
            debug: {
                options: {
                    archive: '<%= output_dir %>/<%= pkg.name %>-<%= pkg.version %>-debug.zip'
                },
                files: [
                    {expand: true, cwd: '<%= build_dir %>', src: ['**']}
                ]
            },
            release: {
                options: {
                    archive: '<%= output_dir %>/<%= pkg.name %>-<%= pkg.version %>-release.zip'
                },
                files: [
                    {expand: true, cwd: '<%= compile_dir %>', src: ['**']}
                ]
            }
        }
    };

    /**
     * Generate the theme tasks.
     * Maybe this isn't the best way!
     */
    var themeTasksBuild = [];
    var themeTasksCompile = [];
    taskConfig.less = {};
    userConfig.themes.forEach(function(theme) {
        var theme_css = '<%= build_dir %>/assets/<%= pkg.name %>-' + theme +'-<%= pkg.version %>.css';
        taskConfig.less[theme] = {
            files: {},
            options: {
                modifyVars: {
                    HABminTheme: theme
                }
            }
        };
        taskConfig.less[theme].files[theme_css] = '<%= app_files.less %>';
        themeTasksBuild.push('less:' + theme);

        taskConfig.less[theme + '_compile'] = {
            files: {},
            options: {
                modifyVars: {
                    HABminTheme: theme
                },
                cleancss: true,
                compress: true
            }
        };
        taskConfig.less[theme + '_compile'].files[theme_css] = '<%= app_files.less %>';
        themeTasksCompile.push('less:' + theme + '_compile');
//        taskConfig.concat.build_css.src.push('<%= build_dir %>/assets/<%= pkg.name %>-' + theme + '-<%= pkg.version %>.css');
    });

    grunt.registerTask('themes_build', themeTasksBuild);
    grunt.registerTask('themes_compile', themeTasksCompile);

    grunt.initConfig(grunt.util._.extend(taskConfig, userConfig));

    /**
     * In order to make it safe to just compile or copy *only* what was changed,
     * we need to ensure we are starting from a clean, fresh build. So we rename
     * the `watch` task to `delta` (that's why the configuration var above is
     * `delta`) and then add a new task called `watch` that does a clean build
     * before watching for changes.
     */
    grunt.renameTask('watch', 'delta');
    grunt.registerTask('watch', [ 'build', 'karma:unit', 'delta' ]);

    /**
     * The default task is to build and compile.
     */
    grunt.registerTask('default', [ 'build', 'compile' ]);

    /**
     * The `build` task gets your app ready to run for development and testing.
     */
    grunt.registerTask('build', [
        'clean:init', 'html2js',
        'copy:build_vendorcss', 'copy:build_app_assets', 'copy:build_app_languages', 'copy:build_vendor_assets',
        'copy:build_appjs', 'copy:build_vendorjs', 'themes_build', 'index:build'
    ]);

    /**
     * The `dev` task builds and tests the app.
     */
    grunt.registerTask('dev', [
        'build', 'jshint', 'bootlint', 'karmaconfig', 'karma:continuous'
    ]);

    /**
     * Phonegap compiler - external...
     */
    grunt.registerTask('phones', [
        'build', 'compile_phonegap']);


    /**
     * Phonegap compiler - internal...
     */
    grunt.registerTask('compile_phonegap', [
        'index:phonegap', 'phonegap:build']);

    /**
     * The `compile` task gets your app ready for deployment by concatenating and
     * minifying your code.
     * It starts
     */
    grunt.registerTask('compile', [
        'clean:changelog', 'changelog',
        'build',
        'copy:compile_assets', 'copy:compile_languages', 'clean:css', 'cssmin', 'json-minify',
        'concat:compile_js', 'ngAnnotate', 'uglify', 'index:compile', 'htmlmin:compile',
        'compress'
        //,
//        'compile_phonegap'
    ]);

    /**
     * A utility function to get all app JavaScript sources.
     */
    function filterForJS(files) {
        return files.filter(function (file) {
            return file.match(/\.js$/);
        });
    }

    /**
     * A utility function to get all app CSS sources.
     */
    function filterForCSS(files) {
        return files.filter(function (file) {
            return file.match(/\.css$/);
        });
    }

    /**
     * The index.html template includes the stylesheet and javascript sources
     * based on dynamic names calculated in this Gruntfile. This task assembles
     * the list into variables for the template to use and then runs the
     * compilation.
     */
    grunt.registerMultiTask('index', 'Process index.html template', function () {
        var dirRE = new RegExp('^(' + grunt.config('build_dir') + '|' + grunt.config('compile_dir') + ')\/', 'g');

        var jsFiles = filterForJS(this.filesSrc).map(function (file) {
            return file.replace(dirRE, '');
        });
        grunt.log.writeln("build:: " + this.data.build);
        var cssFiles = filterForCSS(this.filesSrc).map(function (file) {
            return file.replace(dirRE, '');
        });

        var buildtype = this.data.build;
        grunt.file.copy('src/index.html', this.data.dir + '/index.html', {
            process: function (contents, path) {
                return grunt.template.process(contents, {
                    data: {
                        scripts: jsFiles,
                        styles: cssFiles,
                        version: grunt.config('pkg.version'),
                        buildtype: buildtype
                    }
                });
            }
        });
    });

    /**
     * In order to avoid having to specify manually the files needed for karma to
     * run, we use grunt to manage the list for us. The `karma/*` files are
     * compiled as grunt templates for use by Karma. Yay!
     */
    grunt.registerMultiTask('karmaconfig', 'Process karma config templates', function () {
        var jsFiles = filterForJS(this.filesSrc);

        grunt.file.copy('karma/karma-unit.tpl.js', grunt.config('build_dir') + '/karma-unit.js', {
            process: function (contents, path) {
                return grunt.template.process(contents, {
                    data: {
                        scripts: jsFiles
                    }
                });
            }
        });
    });
};
