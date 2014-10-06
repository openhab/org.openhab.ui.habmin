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
    function ZwaveBindingCtrl($scope, locale, growl, $timeout, $window, $http, timeAgo, $interval) {
        var url = '/services/habmin/zwave/';
        $scope.devices = {};
        $scope.deviceCnt = -1;

        $scope.stateOnline = function (node) {
            // If moment can parse it, then we return the time since
            // otherwise just show what the server gave us!
            var t = moment(node.lastUpdate);
            if (t.isValid()) {
                return locale.getString("zwave.zwaveLastSeen", timeAgo.inWords(t - moment()));
            }
            else {
                return locale.getString("zwave.zwaveLastSeen", node.lastUpdate);
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
                t = "@" + node.healTime;
            }

            var state = "zwaveHealUnknown";
            switch(node.healStage) {
                case "IDLE":
                    state = "zwaveHealIdle";
                    break;
                case "WAITING":
                    state = "zwaveHealWaiting";
                    break;
                case "FAILED":
                    state = "zwaveHealFailed";
                    break;
                case "DONE":
                    state = "zwaveHealDone";
                    break;
                default:
                    state = "zwaveHealRunning";
                    break;
            }
            t = locale.getString("zwave." + state, [t, node.healStage, node.healFailStage]);

            return t;
        };

        $scope.zwaveAction = function(domain, action) {
            $http.put(url + 'action/' + domain, action)
                .success(function (data) {
                    growl.success(locale.getString('zwave.zwaveActionOk'));
                })
                .error(function (data, status) {
                    growl.warning(locale.getString('zwave.zwaveActionError'));
                });
        };

        $scope.updateNodes = function() {
            // Get the list of nodes. Then for each node, get the static state (/info)
            // and the dynamic status (/status)
            $http.get(url + 'nodes/')
                .success(function (data) {
                    // This function creates a new list each time through
                    // I'm not sure this is the best way, but it seems the easiest
                    // way to ensure that any deleted nodes get removed.
                    var newList = {};
                    var count = 0;

                    // Loop through all devices and add any new ones
                    angular.forEach(data.records, function (device) {
                        var domain = device.domain.split('/');
                        var node = {};
                        count++;

                        // If the device isn't known, then create a new entry
                        if($scope.devices[domain[1]] === undefined) {
                            node.device = domain[1];
                            node.domain = device.domain;
                            node.lifeState = 0;
                            node.healState = 0;
                            node.healState = "OK";
                            node.lastUpdate = "";
                            $scope.devices[domain[1]] = node;

                            // Only request the static info if this is a new device
                            updateInfo(node.domain);
                        }
                        else {
                            node = $scope.devices[domain[1]];
                        }

                        node.label = device.label;
                        node.type = device.value;
                        node.state = device.state;

                        if (node.type === undefined) {
                            node.type = locale.getString("zwave.zwaveUnknownDevice");
                        }

                        newList[domain[1]] = node;

                        // Update the dynamic info
                        updateStatus(node.domain);
                    });

                    $scope.devices = newList;
                    $scope.deviceCnt = count;
                })
                .error(function (data, status) {
                    growl.warning(locale.getString('zwave.zwaveErrorLoadingDevices'));
                    $scope.devices = {};
                    $scope.deviceCnt = 0;
                });
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
                            var power = status.value.split(' ');
                            switch(power[0]) {
                                case "Mains":
                                    device.batteryIcon = "oa-battery-charge";
                                    device.batteryLevel = 100;
                                    device.powerInfo = locale.getString("zwave.zwaveMainsPower");
                                    break;
                                case "Battery":
                                    var level = parseInt(power[1], 10);
                                    if(isNaN(level)) {
                                        device.batteryIcon = "oa-battery-empty";
                                        device.batteryLevel = -1;
                                        device.powerInfo = locale.getString("zwave.zwaveBatteryPower");
                                    }
                                    else {
                                        var icon = Math.floor(level / 20) * 20;
                                        device.batteryIcon = "oa-battery-" + icon;
                                        device.batteryLevel = level;
                                        device.powerInfo = locale.getString("zwave.zwaveBatteryPowerLevel", level);
                                    }
                                    break;
                                default:
                                    device.batteryIcon = "oa-battery-empty";
                                    device.batteryLevel = -1;
                                    device.powerInfo = locale.getString("zwave.zwaveUnknownPower");
                                    break;
                            }
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

        // Kickstart the system and get all the nodes...
        $scope.updateNodes();

        // Create a poll timer to update the data every 5 seconds
        var pollTimer = $interval(function() {
            $scope.updateNodes();
        }, 5000);

        $scope.$on('$destroy', function() {
            // Make sure that the pollTimer is destroyed too
            $interval.cancel(pollTimer);
        });
    })


    .directive('resizePage1', function ($window) {
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
                        'height': (newValue.h - 161) + 'px'
                    };
                };
            }, true);

            w.bind('resize', function () {
                $scope.$apply();
            });
        };
    })
;