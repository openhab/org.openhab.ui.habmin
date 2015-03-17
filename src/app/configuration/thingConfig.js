/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('Config.Things', [
    'ui.router',
    'ui.bootstrap',
    'ngLocalize',
    'HABmin.userModel',
    'HABmin.thingModel',
    'HABmin.bindingModel',
    'angular-growl',
    'Binding.config',
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
    function ThingConfigCtrl($scope, locale, growl, $timeout, $window, $http, $interval, UserService, ThingModel, BindingModel, SidepanelService) {
        $scope.thingCnt = -1;
        ThingModel.getList().then(
            function (list) {
                $scope.things = list;
                $scope.thingCnt = $scope.things.length;
            }
        );

        $scope.listOnline = true;
        $scope.listOffline = true;

        $scope.filterFunction = function (element) {
            if(element.status == "ONLINE" && $scope.listOnline) {
                return true;
            }
            if(element.status == "OFFLINE" && $scope.listOffline) {
                return true;
            }
            return false;
        };

        BindingModel.getList().then(
            function (bindings) {
                $scope.bindings = bindings;
            },
            function (reason) {
                // Handle failure
                growl.warning(locale.getString("habmin.mainErrorGettingBindings"));
            }
        );
    })

;
