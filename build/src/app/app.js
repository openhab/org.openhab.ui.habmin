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
    'angular-bootstrap-select'
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
    function HABminCtrl($scope, $location, SitemapModel, growl, UserService, UserChartPrefs, UserGeneralPrefs, BindingModel) {
        $scope.isLoggedIn = UserService.isLoggedIn;

        $scope.setTheme = function(theme) {
            $('html').removeClass();
            $('html').addClass(theme);
        };

        $scope.$on("habminTheme", function(event, theme) {
            $scope.setTheme(theme);
        });

        $scope.logout = function () {
            UserService.logout();
        };

        // Load models used in the nav bar
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

        $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            if (angular.isDefined(toState.data.pageTitle)) {
                $scope.pageTitle = toState.data.pageTitle + ' | HABmin';
            }
        });

        $scope.showUserChartPrefs = function () {
            UserChartPrefs.showModal();
        };
        $scope.showUserGeneralPrefs = function () {
            UserGeneralPrefs.showModal();
        };
    })

;

