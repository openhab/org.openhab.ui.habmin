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
    'HABmin.userModel',
    'angular-growl',
    'yaru22.angular-timeago'
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
            data: { pageTitle: 'ZWave' },
            resolve: {
                // Make sure the localisation files are resolved before the controller runs
                localisations: function (locale) {
                    return locale.ready('zwave');
                }
            }
        });
    })

    .controller('ZwaveBindingCtrl',
    function ZwaveBindingCtrl($scope, locale, growl, $timeout, $window, $http, timeAgo) {
        var url = '/services/habmin/zwave/';
        $scope.devices = [];

        $http.get(url + 'nodes/')
            .success(function (data) {
                $scope.devices = {};

                angular.forEach(data.records, function (device) {
                    var newDevice = {};
                    newDevice.domain = device.domain;
                    newDevice.label = device.label;
                    newDevice.type = device.value;
                    newDevice.lifeState = 0;
                    newDevice.healState = 0;
                    newDevice.state = device.state;
                    newDevice.healState = "OK";
                    newDevice.lastUpdate = "";

                    if (newDevice.type === undefined) {
                        newDevice.type = locale.getString("zwave.zwaveUnknownDevice");
                    }

                    var domain = newDevice.domain.split('/');
                    newDevice.device = domain[1];
                    $scope.devices[domain[1]] = newDevice;

                    updateStatus(device.domain);
                    updateInfo(device.domain);
                });
            })
            .error(function (data, status) {
                growl.warning(locale.getString('zwave.zwaveErrorLoadingDevices'));
            });

        $scope.stateOnline = function (node) {
            var t = moment(node.lastUpdate);
            // If moment can parse it, then we return the time since
            // otherwise just show what the server gave us!
            if (t.isValid()) {
                return locale.getString("zwave.zwaveLastSeen", timeAgo.inWords(t - moment()));
            }
            else {
                return node.lastUpdate;
            }
        };

        $scope.stateHeal = function (node) {
            // If moment can parse it, then we return the time since
            // otherwise just show what the server gave us!
            var t = moment(node.healTime);
            if (node.healTime !== undefined && t.isValid()) {
                t = timeAgo.inWords(t - moment());
            }
            else {
                t = "@" + node.lastUpdate;
            }

            switch(node.healStage) {
                case "IDLE":
                    t = locale.getString("zwave.zwaveHealIdle");
                    break;
                case "WAITING":
                    t = locale.getString("zwave.zwaveHealWaiting");
                    break;
                case "FAILED":
                    t = locale.getString("zwave.zwaveHealFailed", node.healFailStage, t);
                    break;
                case "DONE":
                    t = locale.getString("zwave.zwaveHealDone", t);
                    break;
                default:
                    t = locale.getString("zwave.zwaveHealRunning", node.healStage, t);
                    break;
            }

            return t;
        };

        function updateStatus(id) {
            $http.get(url + id + 'status/')
                .success(function (data) {
                    if (data.records === undefined) {
                        return;
                    }
                    if (data.records[0] === undefined) {
                        return;
                    }
                    var domain = data.records[0].domain.split('/');
                    var device = $scope.devices[domain[1]];
                    if (device === null) {
                        return;
                    }

                    // Loop through all status attributes and pull out the stuff we care about!
                    angular.forEach(data.records, function (status) {
                        if (status.name === "LastHeal") {
                            device.healTime = undefined;
                            var heal = status.value.split(" ");
                            device.healStage = heal[0];
                            if (heal[0] === "IDLE") {
                                device.healState = "OK";
                            }
                            else if (heal[0] === "DONE") {
                                device.healState = "OK";
                                device.healTime = heal[2];
                            }
                            else if (heal[0] === "WAITING") {
                                device.healState = "WAIT";
                            }
                            else if (!heal[0].indexOf("FAILED")) {
                                device.healState = "ERROR";
                                device.healFailStage = heal[2];
                                device.healTime = heal[4];
                            }
                            else {
                                device.healState = "RUN";
                                device.healTime = heal[2];
                            }
                        }
                        if (status.name === "LastUpdated") {
                            device.lastUpdate = status.value;
                        }
                    });
                })
                .error(function (data, status) {
                });
        }

        function updateInfo(id) {
            $http.get(url + id + 'info/')
                .success(function (data) {
                    if (data.records === undefined) {
                        return;
                    }
                    if (data.records[0] === undefined) {
                        return;
                    }
                    var domain = data.records[0].domain.split('/');
                    var device = $scope.devices[domain[1]];
                    if (device === null) {
                        return;
                    }

                    // Loop through all info attributes and pull out the stuff we care about!
                    angular.forEach(data.records, function (status) {
                        if (status.name === "Power") {
                        }
                        if (status.name === "SpecificClass") {
                            switch (status.value) {
                                case "PC_CONTROLLER":
                                    device.icon = "desktop-computer";
                                    break;
                                case "PORTABLE_REMOTE_CONTROLLER":
                                    device.icon = "remote-control";
                                    break;
                                case "POWER_SWITCH_BINARY":
                                    device.icon = "switch";
                                    break;
                                case "POWER_SWITCH_MULTILEVEL":
                                    device.icon = "light-control";
                                    break;
                                case "ROUTING_SENSOR_BINARY":
                                    device.icon = "door-open";
                                    break;
                                case "SWITCH_REMOTE_MULTILEVEL":
                                    device.icon = "temperature";
                                    break;
                                default:
                                    device.icon = "wifi";
                                    break;
                            }
                        }
                    });
                })
                .error(function (data, status) {
                });

        }

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