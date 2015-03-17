/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('Config.Discovery', [
    'ui.router',
    'ui.bootstrap',
    'ngLocalize',
    'HABmin.userModel',
    'HABmin.inboxModel',
    'HABmin.thingModel',
    'HABmin.bindingModel',
    'angular-growl',
    'Binding.config',
    'ngVis',
    'ResizePanel',
    'SidepanelService'
])

    .config(function config($stateProvider) {
        $stateProvider.state('discovery', {
            url: '/discovery',
            views: {
                "main": {
                    controller: 'DiscoveryCtrl',
                    templateUrl: 'configuration/thingDiscovery.tpl.html'
                }
            },
            data: {pageTitle: 'Discovery'},
            resolve: {
                // Make sure the localisation files are resolved before the controller runs
                localisations: function (locale) {
                    return locale.ready('habmin');
                }
            }
        });
    })

    .controller('DiscoveryCtrl',
    function DiscoveryCtrl($scope, locale, growl, $timeout, $window, $http, $interval, UserService, ThingModel, InboxModel, BindingModel, SidepanelService) {

        $scope.inboxCnt = -1;
        InboxModel.refreshInbox().then(
            function (list) {
//                $scope.inbox = list;
                $scope.inboxCnt = $scope.inbox.length;
            }
        );

        $scope.inbox = InboxModel.getInbox();
        $scope.$watch('inbox', function() {
            $scope.inboxCnt = $scope.inbox.length;
        }, true);

        $scope.listNew = true;
        $scope.listIgnored = false;
        $scope.selectedThing = null;

        BindingModel.getList().then(
            function (bindings) {
                $scope.bindings = bindings;
            },
            function (reason) {
                // Handle failure
                growl.warning(locale.getString("habmin.mainErrorGettingBindings"));
            }
        );

        $scope.filterFunction = function (element) {
            if (element.flag == "NEW" && $scope.listNew) {
                return true;
            }
            if (element.flag == "IGNORED" && $scope.listIgnored) {
                return true;
            }
            return false;
        };

        $scope.selectThing = function (thing) {
            $scope.selectedThing = thing;
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

        $scope.saveThing = function () {
            InboxModel.thingApprove($scope.selectedThing.thingUID, $scope.selectedThing.label).then(
                function () {
                    InboxModel.refreshInbox();
                },
                function () {
                    growl.error(locale.getString("habmin.discoveryIgnoreFail", {name: $scope.selectedThing.name}));
                }
            );

        };

        $scope.ignoreThing = function () {
            InboxModel.thingIgnore($scope.selectedThing.thingUID).then(
                function () {
                    InboxModel.refreshInbox();
                },
                function () {
                    growl.error(locale.getString("habmin.discoveryIgnoreFail", {name: $scope.selectedThing.name}));
                }
            );
        };

        $scope.deleteThing = function () {
            InboxModel.thingDelete($scope.selectedThing.thingUID).then(
                function () {
                    InboxModel.refreshInbox();
                    $scope.selectedThing = null;
                },
                function () {
                    growl.error(locale.getString("habmin.discoveryDeleteFail", {name: $scope.selectedThing.name}));
                }
            );
        };

    })

;









