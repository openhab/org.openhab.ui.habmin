/**
 * This file/module contains all configuration for the build process.
 */
module.exports = {
    /**
     * The `build_dir` folder is where our projects are compiled during
     * development and the `compile_dir` folder is where our app resides once it's
     * completely built.
     */
    build_dir: 'build',
    compile_dir: 'bin',
    cordova_dir: 'cordova',
    output_dir: 'output',
    bundle_dir: 'openhab2/org.openhab.ui.habmin/web',
    language_dir: 'src/languages',

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
        js: [ 'src/**/*.js', '!src/**/*.spec.js', '!src/assets/**/*.js' ],
        jsunit: [ 'src/**/*.spec.js' ],

        atpl: [ 'src/app/**/*.tpl.html' ],
        ctpl: [ 'src/common/**/*.tpl.html' ],

        html: [ 'src/index.html' ],
        less: 'src/less/main.less'
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
            'vendor/jquery/dist/jquery.js',
            'vendor/angular/angular.js',
            'vendor/angular-animate/angular-animate.js',
            'vendor/angular-touch/angular-touch.js',
            'vendor/angular-http-auth/src/http-auth-interceptor.js',
            'vendor/angular-resource/angular-resource.js',
            'vendor/angular-sanitize/angular-sanitize.js',
            'vendor/angular-bootstrap/ui-bootstrap-tpls.js',
            'vendor/placeholders/angular-placeholders-0.0.1-SNAPSHOT.min.js',
            'vendor/angular-ui-router/release/angular-ui-router.js',
            'vendor/angular-ui-utils/modules/route/route.js',
            'vendor/angular-localization/angular-localization.js',
            'vendor/angular-cookies/angular-cookies.js',
            'vendor/angular-growl-v2/build/angular-growl.js',
            'vendor/angular-toggle-switch/angular-toggle-switch.js',
            'vendor/tinycolor/tinycolor.js',
            'vendor/pick-a-color/src/js/pick-a-color.js',
            'vendor/angular-pick-a-color/src/angular-pick-a-color.js',
            'vendor/moment/moment.js',
            'vendor/moment/locale/fr.js',
            'vendor/moment/locale/de.js',
            'vendor/angular-blockly/build/angular-blockly.js',
            'vendor/angular-blockly/build/blockly_compressed.js',
            'vendor/angular-blockly/build/blocks_compressed.js',
            'vendor/angular-blockly/build/en.js',
            'vendor/ace-builds/src-min-noconflict/ace.js',
            'vendor/ace-builds/src-min-noconflict/theme-tomorrow.js',
            'vendor/ace-builds/src-min-noconflict/theme-tomorrow_night_bright.js',
            'vendor/angular-ui-ace/ui-ace.js',
            'vendor/angular-gridster/src/angular-gridster.js',
            'vendor/jquery-ui/ui/core.js',
            'vendor/jquery-ui/ui/widget.js',
            'vendor/jquery-ui/ui/mouse.js',
            'vendor/jquery-ui/ui/draggable.js',
            'vendor/jquery-ui/ui/resizable.js',
            'vendor/angular-dialgauge/src/angular-dialgauge.js',
            'vendor/angular-ui-calendar/src/calendar.js',
            'vendor/fullcalendar/dist/fullcalendar.js',
            'vendor/fullcalendar/dist/gcal.js',
            'vendor/angular-timeago/src/timeAgo.js',
            'vendor/vis/dist/vis.js',
            'vendor/angular-base64/angular-base64.js',
            'vendor/angular-visjs/angular-vis.js',
            'vendor/checklist-model/checklist-model.js',
            'vendor/angular-rt-popup/dist/angular-rt-popup.js',
            'vendor/angular-ui-select/dist/select.bootstrap.js',
            'vendor/angular-input-modified/dist/angular-input-modified.js',
            'vendor/angular-drag-and-drop-lists/angular-drag-and-drop-lists.js',
            'vendor/angularjs-slider/rzslider.js',
            'vendor/screenfull/dist/screenfull.js',
            'vendor/angular-screenfull/dist/angular-screenfull.min.js',
            'vendor/slimScroll/jquery.slimscroll.js',
            'vendor/angular-slimscroll/angular-slimscroll.js',
            'vendor/angular-clipboard/angular-clipboard.js',
            'vendor/angular-promise-extras/angular-promise-extras.js'
        ],
        css: [
            'vendor/angular-growl-v2/build/angular-growl.css',
            'vendor/angular-toggle-switch/angular-toggle-switch.css',
            'vendor/angular-toggle-switch/angular-toggle-switch-bootstrap.css',
            'vendor/jquery-ui/themes/base/core.css',
            'vendor/jquery-ui/themes/base/resizable.css',
            'vendor/oa-font/css/style.css',
            'vendor/font-awesome/css/font-awesome.css',
            'vendor/weather-icons/css/weather-icons.css',
            'vendor/fullcalendar/dist/fullcalendar.css',
            'vendor/angular-ui-select/dist/select.css',
            'vendor/vis/dist/vis.css'
        ],
        assets: [
            'vendor/oa-font/fonts/*',
            'vendor/font-awesome/fonts/*',
            'vendor/weather-icons/font/*',
            'vendor/bootstrap/fonts/*',
            'vendor/angular-blockly/media/*',
            'vendor/flag-icon-css/flags/4x3/de.svg',
            'vendor/flag-icon-css/flags/4x3/fr.svg',
            'vendor/flag-icon-css/flags/4x3/gb.svg',
            'vendor/flag-icon-css/flags/4x3/it.svg',
            'vendor/flag-icon-css/flags/4x3/pl.svg',
            'vendor/flag-icon-css/flags/4x3/se.svg'
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
        'it-IT'
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
