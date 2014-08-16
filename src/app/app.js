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
    'ngBoilerplate.home',
    'ngBoilerplate.about',
    'HABmin.userModel',
    'HABmin.chart',
    'HABmin.sitemap',
    'HABmin.sitemapModel',
    'UserChartPrefs',
    'ui.router',
    'ui.bootstrap',
    'ngAnimate',
    'ngLocalize',
    'ngLocalize.Config',
    'ngLocalize.Events',
    'angular-growl'
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

    .config(function myAppConfig($stateProvider, $urlRouterProvider, growlProvider) {
        $urlRouterProvider.otherwise('/home');
        growlProvider.globalTimeToLive({success: 2000, info: 2000, warning: 5000, error: 15000});
    })

    .run(function run() {
    })

    .controller('HABminCtrl', function HABminCtrl($scope, $location, SitemapModel, growl, UserService, UserChartPrefs) {
        $scope.isLoggedIn = UserService.isLoggedIn;

        $scope.sitemaps = null;
        SitemapModel.getList().then(
            function(data){
                $scope.sitemaps = data;
            },
            function(reason) {
                // handle failure
                growl.warning('Hello world ' + reason.message);
            }
        );
        $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            if (angular.isDefined(toState.data.pageTitle)) {
                $scope.pageTitle = toState.data.pageTitle + ' | HABmin';
            }
        });

        $scope.showUserChartPrefs = function() {
            UserChartPrefs.showModal();
        };
    })

;

