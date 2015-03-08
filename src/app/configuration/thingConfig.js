/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('Config.Things', [
    'ui.router',
    'ui.bootstrap',
    'ngLocalize',
    'HABmin.userModel',
    'HABmin.inboxModel',
    'HABmin.thingModel',
    'angular-growl',
    'Binding.config',
    'yaru22.angular-timeago',
    'ngVis',
    'ResizePanel',
    'SidepanelService'
])

    .config(function config($stateProvider) {
        $stateProvider.state('things', {
            url: '/things',
            views: {
                "main": {
                    controller: 'ThingConfigCtrl',
                    templateUrl: 'configuration/thingConfig.tpl.html'
                }
            },
            data: { pageTitle: 'Things' },
            resolve: {
                // Make sure the localisation files are resolved before the controller runs
                localisations: function (locale) {
                    return locale.ready('habmin');
                }
            }
        });
    })

    .controller('ThingConfigCtrl',
    function ThingConfigCtrl($scope, locale, growl, $timeout, $window, $http, timeAgo, $interval, UserService, ThingModel, InboxModel, SidepanelService) {
        $scope.thingCnt = -1;
        ThingModel.getList().then(
            function(list) {
                $scope.things = list;
                $scope.thingCnt = $scope.things.length;
            }
        );
        $scope.inboxCnt = -1;
        InboxModel.refreshInbox().then(
            function(list) {
                $scope.inbox = list;
                $scope.inboxCnt = $scope.inbox.length;
            }
        );
    })

;
