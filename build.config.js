/**
 * This file/module contains all configuration for the build process.
 */
module.exports = {
    /**
     * The `build_dir` folder is where our projects are compiled during
     * development and the `compile_dir` folder is where our app resides once it's
     * completely built.
     */
    build_dir: 'target/web/build',
    compile_dir: 'target/web/bin',
    cordova_dir: 'cordova',
    output_dir: 'target/web/output',
    bundle_dir: 'web',
    language_dir: 'src/web/languages',

    /**
     * This is a collection of file patterns that refer to our app code (the
     * stuff in `src/`). These file paths are used in the configuration of
     * build tasks. `js` is all project javascript, less tests. `ctpl` contains
     * our reusable components' (`src/common`) template HTML files, while
     * `atpl` contains the same, but for our app's code. `html` is just our
     * main HTML file, `less` is our main stylesheet, and `unit` contains our
     * app's unit tests.
     */
    app_files: {
        js: [ '**/*.js', '!**/*.spec.js', '!assets/**/*.js' ],
        jsunit: [ 'src/web/**/*.spec.js' ],

        atpl: [ 'src/web/app/**/*.tpl.html' ],
        ctpl: [ 'src/web/common/**/*.tpl.html' ],

        html:  'src/web/index.html' ,
        less: 'src/web/less/main.less'
    },

    /**
     * This is a collection of files used during testing only.
     */
    test_files: {
        js: [
            'vendor/angular-mocks/angular-mocks.js'
        ]
    },

    /**
     * This is the same as `app_files`, except it contains patterns that
     * reference vendor code (`vendor/`) that we need to place into the build
     * process somewhere. While the `app_files` property ensures all
     * standardized files are collected for compilation, it is the user's job
     * to ensure non-standardized (i.e. vendor-related) files are handled
     * appropriately in `vendor_files.js`.
     *
     * The `vendor_files.js` property holds files to be automatically
     * concatenated and minified with our project source files.
     *
     * The `vendor_files.css` property holds any CSS files to be automatically
     * included in our app.
     *
     * The `vendor_files.assets` property holds any assets to be copied along
     * with our app's assets. This structure is flattened, so it is not
     * recommended that you use wildcards.
     */
    vendor_files: {
        js: [
            'bower_modules/jquery/dist/jquery.js',
            'bower_modules/angular/angular.js',
            'bower_modules/angular-animate/angular-animate.js',
            'bower_modules/angular-touch/angular-touch.js',
            'bower_modules/angular-http-auth/src/http-auth-interceptor.js',
            'bower_modules/angular-resource/angular-resource.js',
            'bower_modules/angular-sanitize/angular-sanitize.js',
            'bower_modules/angular-ui-router/release/angular-ui-router.js',
            'bower_modules/angular-ui-utils/modules/route/route.js',
            'bower_modules/angular-cookies/angular-cookies.js',
            'bower_modules/angular-growl-v2/build/angular-growl.js',
            'bower_modules/tinycolor/tinycolor.js',
            'bower_modules/moment/moment.js',
            'bower_modules/moment/locale/da.js',
            'bower_modules/moment/locale/de.js',
            'bower_modules/moment/locale/fr.js',
            'bower_modules/moment/locale/it.js',
            'bower_modules/moment/locale/nl.js',
            'bower_modules/moment/locale/pl.js',
            'bower_modules/moment/locale/ru.js',
            'bower_modules/moment/locale/sv.js',
            'bower_modules/ace-builds/src-min-noconflict/ace.js',
            'bower_modules/ace-builds/src-min-noconflict/theme-tomorrow.js',
            'bower_modules/ace-builds/src-min-noconflict/theme-tomorrow_night_bright.js',
            'bower_modules/angular-ui-ace/ui-ace.js',
            'bower_modules/angular-gridster/src/angular-gridster.js',
            'bower_modules/jquery-ui/ui/core.js',
            'bower_modules/jquery-ui/ui/widget.js',
            'bower_modules/jquery-ui/ui/mouse.js',
            'bower_modules/jquery-ui/ui/draggable.js',
            'bower_modules/jquery-ui/ui/resizable.js',
            'bower_modules/angular-ui-calendar/src/calendar.js',
            'bower_modules/fullcalendar/dist/fullcalendar.js',
            'bower_modules/vis/dist/vis.js',
            'bower_modules/angular-base64/angular-base64.js',
            'bower_modules/checklist-model/checklist-model.js',
            'bower_modules/angular-rt-popup/dist/angular-rt-popup.js',
            'bower_modules/angular-ui-select/dist/select.js',
            'bower_modules/angular-input-modified/dist/angular-input-modified.js',
            'bower_modules/angular-drag-and-drop-lists/angular-drag-and-drop-lists.js',
            'bower_modules/angularjs-slider/rzslider.js',
            'bower_modules/screenfull/dist/screenfull.js',
            'bower_modules/angular-screenfull/dist/angular-screenfull.min.js',
            'bower_modules/slimScroll/jquery.slimscroll.js',
            'bower_modules/angular-slimscroll/angular-slimscroll.js',
            'bower_modules/angular-clipboard/angular-clipboard.js',
            'bower_modules/angular-promise-extras/angular-promise-extras.js',
            'bower_modules/angular-moment/angular-moment.js',
            'bower_modules/angular-xeditable/dist/js/xeditable.js',
            'bower_modules/pick-a-color/src/js/pick-a-color.js',
            'bower_modules/angular-pick-a-color/src/angular-pick-a-color.js',
            'bower_modules/angular-bootstrap/ui-bootstrap-tpls.js',
            'vendor/placeholders/angular-placeholders-0.0.1-SNAPSHOT.min.js',
            'vendor/angular-localization/angular-localization.js',
            'vendor/angular-toggle-switch/angular-toggle-switch.js',
            'vendor/angular-blockly/build/angular-blockly.js',
            'vendor/angular-blockly/build/blockly_compressed.js',
            'vendor/angular-blockly/build/blocks_compressed.js',
            'vendor/angular-blockly/build/en.js',
            'vendor/angular-dialgauge/src/angular-dialgauge.js',
            'vendor/angular-visjs/angular-vis.js'
        ],
        css: [
            'bower_modules/angular-growl-v2/build/angular-growl.css',
            'bower_modules/jquery-ui/themes/base/core.css',
            'bower_modules/jquery-ui/themes/base/resizable.css',
            'bower_modules/oa-font/css/style.css',
            'bower_modules/fullcalendar/dist/fullcalendar.css',
            'bower_modules/angular-ui-select/dist/select.css',
            'bower_modules/vis/dist/vis.css',
            'bower_modules/angular-xeditable/dist/css/xeditable.css',
            'vendor/angular-toggle-switch/angular-toggle-switch.css',
            'vendor/angular-toggle-switch/angular-toggle-switch-bootstrap.css',
            'vendor/font-awesome/css/font-awesome.css',
            'vendor/weather-icons/css/weather-icons.css'
        ],
        assets: [
            'bower_modules/flag-icon-css/flags/4x3/de.svg',
            'bower_modules/flag-icon-css/flags/4x3/dk.svg',
            'bower_modules/flag-icon-css/flags/4x3/fr.svg',
            'bower_modules/flag-icon-css/flags/4x3/gb.svg',
            'bower_modules/flag-icon-css/flags/4x3/it.svg',
            'bower_modules/flag-icon-css/flags/4x3/nl.svg',
            'bower_modules/flag-icon-css/flags/4x3/pl.svg',
            'bower_modules/flag-icon-css/flags/4x3/ru.svg',
            'bower_modules/flag-icon-css/flags/4x3/se.svg',
            'vendor/oa-font/fonts/*',
            'vendor/font-awesome/fonts/*',
            'vendor/weather-icons/font/*',
            'vendor/bootstrap/fonts/*',
            'vendor/angular-blockly/media/*'
        ]
    },

    /**
     * The name of each skin.
     */
    skins: [
        'skin-blue'
    ],

    /**
     * The list of languages we support
     */
    languages: [
        'de-DE',
        'en-GB',
        'fr-FR',
        'it-IT',
        'pl-PL',
        'sv-SE',
        'da-DK'
    ],

    /**
     * Customisation of splashscreen and navscreen
     */
    splashScreen: {
        image: "",
        background: "white"
    },
    navScreen: {
        image: ""
    }
};
