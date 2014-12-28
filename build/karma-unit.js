module.exports = function ( karma ) {
  karma.set({
    /** 
     * From where to look for files, starting with the location of this file.
     */
    basePath: '../',

    /**
     * This is the list of file patterns to load into the browser during testing.
     */
    files: [
      'vendor/jquery/dist/jquery.js',
      'vendor/angular/angular.js',
      'vendor/angular-animate/angular-animate.js',
      'vendor/angular-http-auth/src/http-auth-interceptor.js',
      'vendor/angular-resource/angular-resource.js',
      'vendor/angular-sanitize/angular-sanitize.js',
      'vendor/angular-bootstrap/ui-bootstrap-tpls.js',
      'vendor/angular-ui-router/release/angular-ui-router.js',
      'vendor/angular-localization/angular-localization.js',
      'vendor/angular-cookies/angular-cookies.js',
      'vendor/angular-growl-v2/build/angular-growl.js',
      'vendor/angular-toggle-switch/angular-toggle-switch.js',
      'vendor/jquery-atmosphere/jquery.atmosphere.js',
      'vendor/tinycolor/tinycolor.js',
      'vendor/pick-a-color/src/js/pick-a-color.js',
      'vendor/angular-pick-a-color/src/angular-pick-a-color.js',
      'vendor/moment/moment.js',
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
      'vendor/fullcalendar/fullcalendar.js',
      'vendor/fullcalendar/gcal.js',
      'vendor/angular-timeago/src/timeAgo.js',
      'vendor/vis/dist/vis.js',
      'vendor/angular-base64/angular-base64.js',
      'vendor/bootstrap-select/bootstrap-select.js',
      'vendor/angular-bootstrap-select/build/angular-bootstrap-select.js',
      'build/templates-app.js',
      'build/templates-common.js',
      'vendor/angular-mocks/angular-mocks.js',
      
      'src/**/*.js',
      'src/**/*.coffee',
    ],
    exclude: [
      'src/assets/**/*.js'
    ],
    frameworks: [ 'jasmine' ],
    plugins: [ 'karma-jasmine', 'karma-firefox-launcher', 'karma-coffee-preprocessor' ],
    preprocessors: {
      '**/*.coffee': 'coffee',
    },

    /**
     * How to report, by default.
     */
    reporters: 'dots',

    /**
     * On which port should the browser connect, on which port is the test runner
     * operating, and what is the URL path for the browser to use.
     */
    port: 9018,
    runnerPort: 9100,
    urlRoot: '/',

    /** 
     * Disable file watching by default.
     */
    autoWatch: false,

    /**
     * The list of browsers to launch to test on. This includes only "Firefox" by
     * default, but other browser names include:
     * Chrome, ChromeCanary, Firefox, Opera, Safari, PhantomJS
     *
     * Note that you can also use the executable name of the browser, like "chromium"
     * or "firefox", but that these vary based on your operating system.
     *
     * You may also leave this blank and manually navigate your browser to
     * http://localhost:9018/ when you're running tests. The window/tab can be left
     * open and the tests will automatically occur there during the build. This has
     * the aesthetic advantage of not launching a browser every time you save.
     */
    browsers: [
      'Firefox'
    ]
  });
};

