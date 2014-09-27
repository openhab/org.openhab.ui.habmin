/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('Binding.zwave', [
    'ui.router',
    'ui.bootstrap',
    'ngLocalize',
    'HABmin.userModel'
])

    .config(function config($stateProvider) {
        $stateProvider.state('binding/zwave', {
            url: '/binding/zwave',
            views: {
                "main": {
                    controller: 'ZwaveBindingCtrl',
                    templateUrl: 'binding/zwave.tpl.html'
                }
            },
            data: { pageTitle: 'ZWave' }
        });
    })

    .controller('ZwaveBindingCtrl',
    function ZwaveBindingCtrl($scope, locale, growl, $timeout, $window, $http) {
        var url = '/services/habmin/zwave/';
        $scope.devices = [];

        $http.get(url+'nodes/')
            .success(function (data) {
                $scope.devices = [];

                angular.forEach(data.records, function(device) {
                    var newDevice = {};
                    newDevice.label = device.label;
                    newDevice.type = device.value;
                    newDevice.lifeState = 0;
                    newDevice.healState = 0;
                    newDevice.state = device.state;

                    $http.get(url + device.domain + 'status/')
                        .success(function (data) {
                            angular.forEach(data.records, function(status) {
                                if(status.name === "LastHeal") {
                                    newDevice.healState = 0;
                                }
                                if(status.name === "LastUpdated") {
                                    newDevice.lastUpdate = status.value;
                                }
                            });
                            $scope.devices.push(newDevice);
                        })
                        .error(function (data, status) {
                        });
                });
            })
            .error(function (data, status) {
            });

        $scope.stateOnline = function(node) {
            return node.lastUpdate;
        };

    })


    .directive('resizePage', function ($window) {
        return function ($scope, element) {
            var w = angular.element($window);
            $scope.getWindowDimensions = function () {
                return {
                    'h': w.height()
                };
            };
            $scope.$watch($scope.getWindowDimensions, function (newValue, oldValue) {
                $scope.windowHeight = newValue.h;
                $scope.styleList = function () {
                    return {
                        'height': (newValue.h - 141) + 'px'
                    };
                };
            }, true);

            w.bind('resize', function () {
                $scope.$apply();
            });
        };
    })
;