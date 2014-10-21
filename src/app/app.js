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
    'ngBoilerplate.home',
    'ngBoilerplate.about',
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
    'ngAnimate',
    'ngLocalize',
    'ngLocalize.Config',
    'ngLocalize.Events',
    'angular-growl',
    'pickAColor',
    'Binding.zwave'
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

    .config(function myAppConfig($stateProvider, $urlRouterProvider, growlProvider, pickAColorProvider) {
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
    })

    .run(function run() {
    })

    .controller('HABminCtrl',
    function HABminCtrl($scope, $location, SitemapModel, growl, UserService, UserChartPrefs, UserGeneralPrefs, BindingModel) {
        $scope.isLoggedIn = UserService.isLoggedIn;

        $scope.logout = function() {
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

