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
    'ngLocalize',
    'ngLocalize.Config',
    'ngLocalize.Events',
    'angular-growl',
    'pickAColor',
    'angular-blockly',
    'Binding.zwave',
    'SidepanelService',
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

            // Update the notification template. The use of <button> causes problems with some templates
            $templateCache.put('templates/notifications/summary.tpl.html',
                '<div class="popover-content">' +
                '<table class="table table-condensed small">' +
                '<tr ng-repeat="msg in inbox" ng-if="msg.flag==\'NEW\'" class="text-success">' +
                '<td><span class="fa fa-fw fa-plus-circle text-success"></span><span i18n="habmin.thingNew"></span></td>' +
                '<td>{{msg.label}}</td>' +
                '</tr>' +
                '<tr ng-repeat="msg in inbox" ng-if="msg.flag==\'IGNORED\' && showAll" class="text-muted">' +
                '<td><span class="fa fa-fw fa-dot-circle-o text-muted"></span><span i18n="habmin.thingIgnored"></span></td>' +
                '<td>{{msg.label}}</td>' +
                '</tr>' +
                '</table>' +
                '<div>' +
                '<div class="checkbox pull-left">' +
                '<label>' +
                '<input type="checkbox" ng-model="showAll" ng-disabled="notificationCntIgnored==0"><span i18n="habmin.thingShowAll"></span>' +
                '</label>' +
                '</div>' +
                '<div class="pull-right">' +
                '<a ui-sref="things" ng-click="hidePopover()" class="btn btn-xs btn-primary"><span i18n="common.open"></span></a>' +
                '<a ng-click="hidePopover()" class="btn btn-xs btn-primary"><span i18n="common.close"></span></a>' +
                '</div>' +
                '</div>' +
                '</div>'
            )
            ;
        }
    ])

    .controller('HABminCtrl',
    function HABminCtrl($scope, $window, $timeout, $interval, $rootScope, locale, ItemModel, ThingModel, DashboardModel, SitemapModel, growl, UserService, UserChartPrefs, UserGeneralPrefs, BindingModel, InboxModel, SidepanelService, RestService, UpdateService, EventModel, ServerMonitor) {
        $scope.isLoggedIn = UserService.isLoggedIn;
        $scope.notificationError = false;
        $scope.onlineStatus = false;

        $scope.dashboards = [];

        // List of current themes
        // TODO: Consolidate this with the user selection
        var themes = ['yeti', 'paper', 'slate'];
        $scope.setTheme = function (theme) {
            // Make sure the theme exists!
            // Setting an invalid theme will completely screw the presentation
            if (themes.indexOf(theme.toLowerCase()) == -1) {
                return;
            }

            $('html').removeClass();
            $('html').addClass(theme);
        };

        ServerMonitor.monitor();

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
        // We need to use the right toggle as the left one changes visibility for other reasons!
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

            // Remember the state so we can enable some state dependant options
            // (The ui router directives don't seem to support hide options!)
            $scope.currentState = toState.name;

            // Reset the sidebar
            if ($scope.doublePanel === false) {
                SidepanelService.showPanel('side');
            }
        });

        $scope.showUserChartPrefs = function () {
            UserChartPrefs.showModal();
        };
        $scope.showUserGeneralPrefs = function () {
            UserGeneralPrefs.showModal();
        };

        $scope.dashboardEdit = function () {
            $rootScope.$broadcast("dashboardEdit");
        };

        // Swipe handler - mainly for handling small screens where we split the panels
        // on a side and main panel and display them separately.
        $scope.swipe = function (dir) {
            console.log("Swipe action event:" + dir);
            // Ignore this if we don't have the split screen
            if ($scope.sidepanelEnabled === false || SidepanelService.getPanel() == 'all') {
                return;
            }

            // Handle the swipe notifications
            if (dir == 'left') {
                SidepanelService.showPanel('main');
            }
            if (dir == 'right') {
                SidepanelService.showPanel('side');
            }
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

