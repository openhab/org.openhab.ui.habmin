/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('HABmin', [
    'templates-app',
    'templates-common',
    'http-auth-interceptor',
    'HABmin.home',
    'HABmin.userModel',
    'HABmin.chart',
    'HABmin.sitemap',
    'HABmin.rules',
    'HABmin.sitemapModel',
    'HABmin.bindingModel',
    'HABmin.dashboard',
    'HABmin.scheduler',
    'UserChartPrefs',
    'UserGeneralPrefs',
    'ui.router',
    'ui.bootstrap',
    'ngLocalize',
    'ngLocalize.Config',
    'ngLocalize.Events',
    'angular-growl',
    'pickAColor',
    'angular-blockly',
    'Binding.zwave',
    'angular-bootstrap-select',
    'SidepanelService',
    'ngAnimate',
    'ngTouch'
])
    .value('localeConf', {
        basePath: 'languages',
        defaultLocale: 'en-GB',
        sharedDictionary: 'common',
        fileExtension: '.lang.json',
        persistSelection: true,
        cookieName: 'COOKIE_LOCALE_LANG',
        observableAttrs: new RegExp('^data-(?!ng-|i18n)'),
        delimiter: '::'
    })
    .value('localeSupported', [
        'en-GB'
    ])
    .value('localeFallbacks', {
        'en': 'en-GB'
    })

    .config(function myAppConfig($stateProvider, $urlRouterProvider, growlProvider, pickAColorProvider, ngBlocklyProvider) {
        $urlRouterProvider.otherwise('/home');
        growlProvider.globalTimeToLive({
            success: 2000,
            info: 2000,
            warning: 5000,
            error: 15000
        });
        growlProvider.globalDisableIcons(true);

        pickAColorProvider.setOptions({
            inlineDropdown: true
        });
        ngBlocklyProvider.setOptions({
            path: "assets/",
            trashcan: true,
            toolbox: [
                {
                    name: "Logic",
                    blocks: [
                        {type: "logic_compare"},
                        {type: "logic_operation"},
                        {type: "logic_negate"},
                        {type: "controls_if"},
                        {type: "openhab_time"},
                        {type: "openhab_iftimer"},
                        {type: "logic_boolean"}
                    ]
                },
                {
                    name: "Math",
                    blocks: [
                        {type: "math_number"},
                        {type: "math_arithmetic"},
                        {type: "math_round"},
                        {type: "math_constrain"},
                        {type: "math_constant"},
                        {type: "math_trig"},
                        {type: "math_number_property"},
                        {type: "math_change"}
                    ]
                },
                {
                    name: "Items",
                    blocks: [
                        {type: "openhab_itemset"},
                        {type: "openhab_itemget"},
                        {type: "openhab_itemcmd"},
                        {type: "openhab_persistence_get"},
                        {type: "variables_set"},
                        {type: "variables_get"},
                        {type: "openhab_constantget"},
                        {type: "openhab_constantset"},
                        {type: "openhab_state_onoff"},
                        {type: "openhab_state_openclosed"},
                        {type: "text"}
                    ]
                }
            ]
        });
    })

    .run(function run() {
    })

    .controller('HABminCtrl',
    function HABminCtrl($scope, $location, $window, $timeout, locale, SitemapModel, growl, UserService, UserChartPrefs, UserGeneralPrefs, BindingModel, SidepanelService) {
        $scope.isLoggedIn = UserService.isLoggedIn;

        $scope.setTheme = function (theme) {
            $('html').removeClass();
            $('html').addClass(theme);
        };

        $scope.$on("habminTheme", function (event, theme) {
            $scope.setTheme(theme);
        });

        $scope.setTheme(UserService.getTheme());

        $scope.logout = function () {
            UserService.logout();
        };

        $scope.login = function () {
            UserService.login();
        };

        // Load models used in the nav bar
        function getAppData() {
            $scope.sitemaps = null;
            SitemapModel.getList().then(
                function (data) {
                    $scope.sitemaps = data;
                },
                function (reason) {
                    // Handle failure
                    growl.warning(locale.getString('habmin.mainErrorLoadingSitemaps'));
                }
            );

            BindingModel.getList().then(
                function (data) {
                    var bindings = [];
                    angular.forEach(data, function (binding) {
                        // Only show bindings that have defined names
                        if (binding.name === undefined) {
                            return;
                        }
                        var info = BindingModel.getBinding(binding.pid);
                        var newBinding = {};
                        newBinding.name = binding.name;

                        if (info === undefined) {
                            newBinding.disabled = true;
                        }
                        else {
                            newBinding.disabled = false;
                            newBinding.icon = info.icon;
                            newBinding.link = info.link;
                        }

                        bindings.push(newBinding);
                    });
                    $scope.bindings = bindings;
                },
                function (reason) {
                    // Handle failure
                    growl.warning(locale.getString("habmin.mainErrorGettingBindings"));
                }
            );
        }

        // If we're logged in, then get the app data
        // This is needed as we will miss the event if we're already logged in!
        if (UserService.isLoggedIn() === true) {
            console.log("App logged in at startup");
            getAppData();
        }
        else if (document.HABminCordova) {
            // If running as an app, and we have the server, then kick-start comms
            if (UserService.getServer() != "") {
                console.log("App Start: Server is", UserService.getServer());
                getAppData();
            }
            else {
                // No server is set, so we need to pop up the login box
                UserService.login();
            }
        }

        // Install handlers to catch authorisation failures
        $scope.$on('event:auth-loginConfirmed', function () {
            console.log("App login message - updating configuration data");
            getAppData();
        });

        var el = angular.element(".navbar-toggle");
        if (el != null) {
            if (el.css('display') == 'none') {
                SidepanelService.showPanel('all');
            }
            else {
                SidepanelService.showPanel('side');
            }
        }

        // Detect if we're in multi or single (collapsed) configuration
        function checkPanelConfiguration() {
            var el = angular.element(".navbar-toggle.pull-right");
            if (el != null) {
                if (el.css('display') == 'none') {
                    $scope.doublePanel = true;
                    SidepanelService.showPanel('all');
                }
                else {
                    $scope.doublePanel = false;

                    // We need to detect the single instance the menu collapses
                    // to avoid unwanted changes to the displayed panel
                    if (SidepanelService.getPanel() == 'all') {
                        SidepanelService.showPanel('side');
                    }
                }
            }
        }
        checkPanelConfiguration();

        // Use the resize event to detect if the navbar is collapsed
        // If it's not collapsed, tell the sidepanel to show all
        angular.element($window).bind('resize', checkPanelConfiguration);

        $scope.$on("sidepanelChange", function () {
            $timeout(function () {
                $(window).trigger('resize');
            }, 0);
        });

        $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            console.log("State change - panel is", SidepanelService.getPanel());
            // Collapse the menu if we change view
            $scope.menuCollapsed = true;
            if (angular.isDefined(toState.data.pageTitle)) {
                $scope.pageTitle = toState.data.pageTitle + ' | HABmin';
            }
            if (angular.isDefined(toState.data.sidepanelEnabled)) {
                $scope.sidepanelEnabled = toState.data.sidepanelEnabled;
            }
            else {
                $scope.sidepanelEnabled = true;
            }

            // Reset the sidebar
            if ($scope.doublePanel == false) {
                SidepanelService.showPanel('side');
            }
        });

        $scope.showUserChartPrefs = function () {
            UserChartPrefs.showModal();
        };
        $scope.showUserGeneralPrefs = function () {
            UserGeneralPrefs.showModal();
        };

        // Swipe handler - mainly for handling small screens where we split the panels
        // on a side and main panel and display them separately.
        $scope.swipe = function (dir) {
            console.log("Swipe action event:" + dir);
            // Ignore this if we don't have the split screen
            if ($scope.sidepanelEnabled == false || SidepanelService.getPanel() == 'all') {
                return;
            }

            // Handle the swipe notifications
            if (dir == 'left') {
                SidepanelService.showPanel('main');
            }
            if (dir == 'right') {
                SidepanelService.showPanel('side');
            }
        }
    })

;

