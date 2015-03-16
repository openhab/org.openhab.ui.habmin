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
    'HABmin.userModel',
    'HABmin.restModel',
    'HABmin.sitemapModel',
    'HABmin.bindingModel',
    'HABmin.inboxModel',
    'HABmin.dashboard',
    'HABmin.scheduler',
    'ZWaveLogViewer',
    'Config.Things',
    'Config.Discovery',
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
    .value('localeSupported', {
        'en-GB': "English (United Kingdom)",
        'de-DE': "Deutsch (Deutschland)",
        'fr-FR': decodeURIComponent(escape("Français (France)"))
    })
    .value('localeFallbacks', {
        'en': 'en-GB',
        'de': 'de-DE',
        'fr': 'fr-FR'
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
        growlProvider.globalDisableCountDown(true);

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
                '<tr ng-repeat="msg in inbox" ng-if="msg.flag==\'IGNORED\'" class="text-muted">' +
                '<td><span class="fa fa-fw fa-dot-circle-o text-muted"></span><span i18n="habmin.thingIgnored"></span></td>' +
                '<td>{{msg.label}}</td>' +
                '</tr>' +
                '</table>' +
                '<div class="pull-right">' +
                '<a ui-sref="things" ng-click="hidePopover()" class="btn btn-xs btn-primary"><span i18n="common.open"></span></a>' +
                '<a ng-click="hidePopover()" class="btn btn-xs btn-primary"><span i18n="common.close"></span></a>' +
                '</div>' +
                '</div>'
            );
        }
    ])

    .controller('HABminCtrl',
    function HABminCtrl($scope, $location, $window, $timeout, $interval, locale, SitemapModel, growl, UserService, UserChartPrefs, UserGeneralPrefs, BindingModel, InboxModel, SidepanelService, RestService) {
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

        // Get the inbox.
        // If there are any changes, then count the number of NEW messages
        $scope.inbox = InboxModel.getInbox();
        $scope.$watch('inbox', function() {
            $scope.notificationCnt = 0;
            angular.forEach($scope.inbox, function(msg) {
                if(msg.flag == "NEW") {
                    $scope.notificationCnt++;
                }
            });
        }, true);

        $scope.updateRestServices = function() {
            RestService.updateServices();
        };

        // Create a poll timer to update the REST services every 30 seconds
        var pollTimer = $interval(function () {
            $scope.updateRestServices();
        }, 30000);

        // Load models used in the nav bar
        function getAppData() {
            $scope.sitemaps = null;
            $scope.notificationCnt = 0;

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

