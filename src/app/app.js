angular.module('HABmin', [
    'templates-app',
    'templates-common',
    'ngBoilerplate.home',
    'ngBoilerplate.about',
    'HABmin.chart',
    'HABmin.auth',
    'HABmin.Sitemap',
    'ui.router',
    'ngLocalize',
    'ngLocalize.Config',
    'ngLocalize.Events',
    'ngSanitize',
    'growlNotifications'
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

    .config(function myAppConfig($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/home');
    })

    .run(function run() {
//        Restangular.setBaseUrl('http://localhost:8080');
    })

    .controller('HABminCtrl', function HABminCtrl($scope, $location, SitemapModel, growlNotifications) {
        $scope.notifications = growlNotifications.notifications;
        $scope.sitemaps = null;
        SitemapModel.query().$promise.then(
            function(data){
                $scope.sitemaps = data.sitemap;
            },
            function(reason) {
                // handle failure
                growlNotifications.add('Hello world ' + reason.message, 'warning', 2000);
            }
        );
        $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            if (angular.isDefined(toState.data.pageTitle)) {
                $scope.pageTitle = toState.data.pageTitle + ' | HABmin';
            }
        });
    })

;

