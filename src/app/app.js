/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('HABmin', [
    'templates-app',
    'templates-common',
    'http-auth-interceptor',
    'HABmin.home',
    'HABmin.chart',
    'HABmin.sitemap',
    'HABmin.rules',
    'HABmin.itemModel',
    'HABmin.userModel',
    'HABmin.restModel',
    'HABmin.sitemapModel',
    'HABmin.thingModel',
    'HABmin.bindingModel',
    'HABmin.dashboardModel',
    'HABmin.inboxModel',
    'HABmin.eventModel',
    'HABmin.dashboard',
    'HABmin.scheduler',
    'HABmin.updateService',
    'FloorplanEditor',
    'ZWaveLogViewer',
    'Config.Bindings',
    'Config.Things',
    'Config.Items',
    'Config.Discovery',
    'UserChartPrefs',
    'UserGeneralPrefs',
    'ui.router',
    'ui.bootstrap',
    'ui.select',
    'ui.slimscroll',
    'ngLocalize',
    'ngLocalize.Config',
    'ngLocalize.Events',
    'angular-growl',
    'pickAColor',
    'angular-blockly',
    'Binding.zwave',
    'ngAnimate',
    'ngTouch',
    'angularScreenfull',
    'serverMonitor'
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
    // Specify the locale names here.
    // These strings will be treated as HTML so special HTML character codes can be used
    // to support international character sets.
    .value('localeSupported', {
        'en-GB': {name: "English", desc: "United Kingdom"},
        'de-DE': {name: "Deutsch", desc: "Deutschland"},
        'fr-FR': {name: "Fran&ccedil;ais", desc: "France"}
    })
    .value('localeFallbacks', {
        'en': 'en-GB',
        'de': 'de-DE',
        'fr': 'fr-FR'
    })

    .config(function myAppConfig($stateProvider, $urlRouterProvider, growlProvider, pickAColorProvider, ngBlocklyProvider, uiSelectConfig) {
        // Default the 'moment' language to english
        moment.locale("en");

        $urlRouterProvider.otherwise('/home');
        growlProvider.globalTimeToLive({
            success: 2000,
            info: 2000,
            warning: 5000,
            error: 15000
        });
        growlProvider.globalDisableIcons(true);
        growlProvider.globalDisableCountDown(true);

        pickAColorProvider.setOptions({
            inlineDropdown: true
        });

        uiSelectConfig.theme = 'bootstrap';

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

    .run([
        '$templateCache',
        function ($templateCache) {
            // Update the notification template. The use of <button> causes problems with some templates
            $templateCache.put('templates/growl/growl.html',
                '<div class="growl-container" ng-class="wrapperClasses()">' +
                '<div class="growl-item alert" ng-repeat="message in growlMessages.directives[referenceId].messages" ng-class="alertClasses(message)" ng-click="stopTimeoutClose(message)">' +
                '<span type="button" class="close" data-dismiss="alert" aria-hidden="true" ng-click="growlMessages.deleteMessage(message)" ng-show="!message.disableCloseButton"><span class="fa fa-close"></span></span>' +
                '<h4 class="growl-title" ng-show="message.title" ng-bind="message.title"></h4>' +
                '<div class="growl-message" ng-bind-html="message.text"></div></div></div>'
            );
        }
    ])

    .controller('HABminCtrl',
    function HABminCtrl($scope, $state, $window, $timeout, $interval, $rootScope, locale, ItemModel, ThingModel, DashboardModel, SitemapModel, growl, UserService, UserChartPrefs, UserGeneralPrefs, BindingModel, InboxModel, RestService, UpdateService, EventModel, ServerMonitor) {
        $scope.$state = $state;

        $scope.isLoggedIn = UserService.isLoggedIn;
        $scope.notificationError = false;
        $scope.onlineStatus = false;

        $scope.dashboards = [];

        // List of current themes
        // TODO: Consolidate this with the user selection
/*        var themes = ['yeti', 'paper', 'slate'];
        $scope.setTheme = function (theme) {
            // Make sure the theme exists!
            // Setting an invalid theme will completely screw the presentation
            if (themes.indexOf(theme.toLowerCase()) == -1) {
                return;
            }

            $('html').removeClass();
            $('html').addClass(theme);
        };*/

        $scope.$on("habminTheme", function (event, theme) {
//            $scope.setTheme(theme);
        });

//        $scope.setTheme(UserService.getTheme());

        ServerMonitor.monitor();

        $scope.logout = function () {
            UserService.logout();
        };

        $scope.login = function () {
            UserService.login();
        };

        // Get the inbox.
        // If there are any changes, then count the number of NEW messages
        $scope.inbox = InboxModel.getInbox();
        $scope.$watch('inbox', function () {
            $scope.notificationCntNew = 0;
            $scope.notificationCntIgnored = 0;
            angular.forEach($scope.inbox, function (msg) {
                if (msg.flag == "NEW") {
                    $scope.notificationCntNew++;
                }
                if (msg.flag == "IGNORED") {
                    $scope.notificationCntIgnored++;
                }
            });
        }, true);

        $scope.updateRestServices = function () {
            RestService.updateServices();
        };

        // Create a poll timer to update the REST services every 30 seconds
        var pollTimer = $interval(function () {
            $scope.updateRestServices();
        }, 30000);

        function updateClock() {
            var m = moment();
            $scope.clockTime = m.format("HH:mm");
            $scope.clockDay = m.format("ddd Do MMM");
        }
        updateClock();

        // Create a poll timer to update the time every 5 seconds
        var clockTimer = $interval(function () {
            updateClock();
        }, 5000);

        // Load models used in the nav bar
        function getAppData() {
            $scope.sitemaps = null;
            $scope.notificationCntNew = 0;
            $scope.notificationCntIgnored = 0;

            RestService.updateServices().then(
                function (data) {
                    $scope.updateRestServices();

                    InboxModel.refreshInbox().then(
                        function (data) {
                        },
                        function (reason) {
                            // Handle failure
                            growl.warning(locale.getString('habmin.mainErrorLoadingInbox'));
                        }
                    );

                    ThingModel.getList(true);
                    ItemModel.getList(true);

                    DashboardModel.getList().then(
                        function (data) {
                            $scope.dashboards = data;
                        },
                        function (reason) {
                            // Handle failure
                            growl.warning(locale.getString('habmin.mainErrorLoadingDashboards'));
                        }
                    );

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
                        function (bindings) {
//                            var bindings = [];
                            /*                            angular.forEach(data, function (binding) {
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
                             });*/
                            $scope.bindings = bindings;
                        },
                        function (reason) {
                            // Handle failure
                            growl.warning(locale.getString("habmin.mainErrorGettingBindings"));
                        }
                    );
                },
                function (reason) {
                    // Handle failure
                    // TODO: Maybe remove this and just let the monitor handle it?
                    growl.warning(locale.getString('habmin.mainOpenHABOffline'));
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
            if (UserService.getServer() !== "") {
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

        $scope.showUserChartPrefs = function () {
            UserChartPrefs.showModal();
        };
        $scope.showUserGeneralPrefs = function () {
            UserGeneralPrefs.showModal();
        };

        $scope.startDiscovery = function (binding) {
            BindingModel.startDiscovery(binding.id).then(
                function () {
                    growl.success(locale.getString("habmin.discoveryStartOk", {name: binding.name}));
                },
                function () {
                    growl.error(locale.getString("habmin.discoveryStartFail", {name: binding.name}));
                }
            );
        };

        $scope.saveThing = function (thingUID, thingLabel) {
            InboxModel.thingApprove(thingUID, thingLabel).then(
                function () {
                    InboxModel.refreshInbox();
                },
                function () {
                    growl.error(locale.getString("habmin.discoveryIgnoreFail", {name: thingUID}));
                }
            );

        };

        $scope.ignoreThing = function (thingUID) {
            InboxModel.thingIgnore(thingUID).then(
                function () {
                    InboxModel.refreshInbox();
                },
                function () {
                    growl.error(locale.getString("habmin.discoveryIgnoreFail", {name: thingUID}));
                }
            );
        };

        $scope.deleteThing = function (thingUID) {
            InboxModel.thingDelete(thingUID).then(
                function () {
                    InboxModel.refreshInbox();
                },
                function () {
                    growl.error(locale.getString("habmin.discoveryDeleteFail", {name: thingUID}));
                }
            );
        };

        // Check if there's a newer version available
        UpdateService.checkForUpdates();

        // Once we've initialised, fade out the splashscreen
        // then remove it once the transition has finished!
        $timeout(function () {
            var splash = $('#splash');
            var main = $('#content');
            splash.removeClass('in');
            main.addClass('in');
            $timeout(function () {
                splash.remove();
            }, 250);
        }, 100);

        EventModel.listen();
    })

    .filter('orderObjectBy', function () {
        return function (items, field, reverse) {
            var filtered = [];
            angular.forEach(items, function (item) {
                filtered.push(item);
            });
            filtered.sort(function (a, b) {
                return (a[field] > b[field] ? 1 : -1);
            });
            if (reverse) {
                filtered.reverse();
            }
            return filtered;
        };
    })
;

