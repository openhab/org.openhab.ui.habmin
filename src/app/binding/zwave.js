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
    'Binding.config',
    'yaru22.angular-timeago',
    'ui.multiselect',
    'ngVis'
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
        $scope.devEdit = {};
        $scope.panelDisplayed = "";
        $scope.deviceDisplay = "CONFIG";

        $scope.networkOptions = {
            hierarchicalLayout: {
                enabled: true,
                layout: "direction",
                direction: "UD"
            },
            width: '100%',
            height: '100%',
            edges: {
                color: '#ffffff',
                width: 5
            },
            dragNodes: false
        };

        $scope.cars = [
            {id: 1, name: 'Audi'},
            {id: 2, name: 'BMW'},
            {id: 1, name: 'Honda'}
        ];
        $scope.selectedCar = [];
        // Avoid error messages on every poll!
        $scope.loadError = false;

        $scope.showPanel = function (panel) {
            if ($scope.panelDisplayed == panel) {
                $scope.panelDisplayed = "";
            }
            else {
                $scope.panelDisplayed = panel;
            }
        };

        $scope.stateOnline = function (node) {
            // If moment can parse it, then we return the time since
            // otherwise just show what the server gave us!
            var t = moment(node.lastReceived);
            var lastTime = node.lastReceived;
            if (t.isValid()) {
                lastTime = timeAgo.inWords(t - moment());
            }
            else if(node.lastReceived == "NEVER") {
                lastTime = locale.getString("zwave.zwaveNeverReceived", node.retryRate);
            }

            var status = "";
            if (node.retryRate > 3) {
                status += " " + locale.getString("zwave.zwaveStatusRetries", node.retryRate);
            }

            return locale.getString("zwave.zwaveStage",
                [locale.getString("zwave.zwaveStage" + node.nodeStage), lastTime, status]);
        };

        $scope.selectDevice = function (node) {
            $scope.devEdit = node;

            // Close the panels
            $scope.panelDisplayed = "";

            // Set the display to the config panel
            $scope.setView("CONFIG");

            // Update information
            updateConfig(node.device);
            updateAssociations(node.device);
            updateInfo(node.device);
        };

        $scope.setView = function (view) {
            $scope.deviceDisplay = view;

            if (view === "NETWORK") {
                createNetworkMap($scope.devEdit.device);
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
            switch (node.healStage) {
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

        $scope.zwaveAction = function (domain, action) {
            $http.put(url + 'action/' + domain, action)
                .success(function (data) {
                    growl.success(locale.getString('zwave.zwaveActionOk'));
                })
                .error(function (data, status) {
                    growl.warning(locale.getString('zwave.zwaveActionError'));
                });
        };

        $scope.updateNodes = function () {
            // Get the list of nodes. Then for each node, get the static state (/info)
            // and the dynamic status (/status)
            $http.get(url + 'nodes/')
                .success(function (data) {
                    // This function creates a new list each time through
                    // I'm not sure this is the best way, but it seems the easiest
                    // way to ensure that any deleted nodes get removed.
                    var newList = {};
                    var count = 0;

                    var stillEditing = false;

                    // Loop through all devices and add any new ones
                    angular.forEach(data.records, function (device) {
                        var domain = device.domain.split('/');
                        var node = {};
                        count++;

                        // If this is the currently edited device, then mark it as still available
                        stillEditing = true;

                        // If the device isn't known, then create a new entry
                        if ($scope.devices[domain[1]] === undefined) {
                            node.device = domain[1];
                            node.domain = device.domain;
                            node.lifeState = 0;
                            node.healState = 0;
                            node.healState = "OK";
                            node.lastReceived = "";
                            $scope.devices[domain[1]] = node;

                            // Only request the static info if this is a new device
                            updateInfo(node.device);
                            updateNeighbors(node.device);
                        }
                        else {
                            node = $scope.devices[domain[1]];
                        }

                        node.label = device.label;
                        node.type = device.value;
                        node.state = device.state;

                        if (node.type === undefined) {
                            node.type = locale.getString("zwave.zwaveUnknownDevice");
                            node.typeUnknown = true;
                        }
                        else {
                            node.typeUnknown = false;
                        }

                        newList[domain[1]] = node;

                        // Update the dynamic info
                        updateStatus(node.device);
                    });

                    $scope.devices = newList;
                    $scope.deviceCnt = count;
                    $scope.loadError = false;

                    // If the currently editing device is no longer available, clear the device editor
                    if (stillEditing === false) {
                        $scope.devEdit = {};
                    }
                })
                .error(function (data, status) {
                    if ($scope.loadError === false) {
                        growl.warning(locale.getString('zwave.zwaveErrorLoadingDevices'));
                        $scope.loadError = true;
                    }
                    $scope.devices = {};
                    $scope.deviceCnt = 0;
                    $scope.devEdit = {};
                });
        };

        function updateStatus(id) {
            $http.get(url + "nodes/" + id + '/status/')
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
                        else if (status.name === "Packets") {
                            var packets = status.value.split(" ");
                            var retry = parseInt(packets[0], 10);
                            var total = parseInt(packets[2], 10);
                            if (isNaN(retry) || isNaN(total) || total === 0) {
                                device.retryRate = 0;
                            }
                            else {
                                device.retryRate = Math.floor(retry / total * 100);
                            }
                        }
                        else if (status.name === "LastReceived") {
                            device.lastReceived = status.value;
                        }
                        else if (status.name === "LastSent") {
                            device.lastSent = status.value;
                        }
                        else if (status.name === "Dead") {
                            var dead = status.value.split(" ");
                            device.dead = dead[0];
                        }
                        else if (status.name === "NodeStage") {
                            // If the stage has changed, then update the info.
                            var stage = status.value.split(" ");
                            if(device.nodeState != stage[0]) {
                                device.nodeStage = stage[0];
                                updateInfo(id);
                            }
                        }
                    });
                })
                .error(function (data, status) {
                });
        }

        function updateInfo(id) {
            $http.get(url + "nodes/" + id + '/info/')
                .success(function (data) {
                    if (data.records === undefined) {
                        return;
                    }
                    if (data.records[0] === undefined) {
                        return;
                    }

                    if ($scope.devEdit.device == id) {
                        $scope.devEdit.information = data.records;
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
                            device.power = power[0];
                            switch (power[0]) {
                                case "MAINS":
                                    device.batteryIcon = "oa-battery-charge";
                                    device.batteryLevel = 100;
                                    device.powerInfo = locale.getString("zwave.zwaveMainsPower");
                                    break;
                                case "BATTERY":
                                    var level = parseInt(power[1], 10);
                                    if (isNaN(level)) {
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
                        if(status.name === "ManufacturerID" && status.value === "UNKNOWN") {
                            status.value = locale.getString("zwave.zwaveUnknown");
                        }
                        if(status.name === "DeviceID" && status.value === "UNKNOWN") {
                            status.value = locale.getString("zwave.zwaveUnknown");
                        }
                        if(status.name === "DeviceType" && status.value === "UNKNOWN") {
                            status.value = locale.getString("zwave.zwaveUnknown");
                        }
                    });
                })
                .error(function (data, status) {
                    $scope.devEdit.information = undefined;
                });
        }

        function updateConfig(id) {
            $http.get(url + "nodes/" + id + '/parameters/')
                .success(function (data) {
                    if (data.records === undefined || data.records.length === 0) {
                        $scope.devEdit.configuration = undefined;
                    }
                    else {
                        $scope.devEdit.configuration = data.records;
                    }
                })
                .error(function (data, status) {
                    $scope.devEdit.configuration = undefined;
                });
        }

        function updateAssociations(id) {
            $http.get(url + "nodes/" + id + '/associations/')
                .success(function (data) {
                    if (data.records === undefined || data.records.length === 0) {
                        $scope.devEdit.associations = undefined;
                    }
                    else {
                        $scope.devEdit.associations = data.records;
                    }
                })
                .error(function (data, status) {
                    $scope.devEdit.associations = undefined;
                });
        }

        function updateNeighbors(id) {
            $http.get(url + "nodes/" + id + '/neighbors/')
                .success(function (data) {
                    if (data.records === undefined || data.records.length === 0) {
                        return;
                    }
                    var domain = data.records[0].domain.split('/');
                    var device = $scope.devices[domain[1]];
                    if (device === null) {
                        return;
                    }
                    else {
                        device.neighbors = data.records;
                    }
                })
                .error(function (data, status) {
                });
        }

        // Kickstart the system and get all the nodes...
        $scope.updateNodes();

        // Create a poll timer to update the data every 5 seconds
        var pollTimer = $interval(function () {
            $scope.updateNodes();
        }, 5000);

        $scope.$on('$destroy', function () {
            // Make sure that the pollTimer is destroyed too
            $interval.cancel(pollTimer);
        });

        function createNetworkMap(root) {
            // We use 'doneNodes' to keep track of what nodes we've added
            var doneNodes = [root];

            // First, add all the routes
            var edges = [];
            angular.forEach($scope.devices, function (device) {
                if (device.neighbors !== undefined && doneNodes.indexOf(device.device) == -1) {
                    doneNodes.push(device.device);
                }

                // Add all the neighbour routes
                angular.forEach(device.neighbors, function (neighbor) {
                    // Check if the route exists and mark it as bidirectional
                    var found = false;
                    angular.forEach(edges, function (edge) {
                        if (edge.from == neighbor.name && edge.to == device.device) {
                            edge.color = "green";
                            edge.style = "line";
                            edge.width = 3;

                            found = true;
                        }
                    });
                    if (found === false) {
                        var newEdge = {};
                        newEdge.from = device.device;
                        newEdge.to = neighbor.name;
                        newEdge.color = "red";
                        newEdge.style = "arrow";
                        newEdge.width = 1;
                        edges.push(newEdge);

                        // Remember this node!
                        if (doneNodes.indexOf(neighbor.name) == -1) {
                            doneNodes.push(neighbor.name);
                        }
                    }
                });
            });

            // Now, add all the nodes that have routes
            var nodes = [];
            angular.forEach($scope.devices, function (device) {
                // Only add nodes that have routes
                if (doneNodes.indexOf(device.device) == -1) {
                    return;
                }

                console.log("Processing", device.device);
                if (device.neighbors === undefined) {
                    console.log("No neighbors for ", device.device);
                }
                // Add the node
                var newNode = {};
                newNode.id = device.device;
                newNode.label = device.label;
                if (root === device.device) {
                    newNode.level = 0;
                }
                else {
                    newNode.level = -1;
                }

                newNode.borderWidth = 2;    // TODO: put this in general options?
                newNode.color = {};

                if (device.power == "Battery") {
                    newNode.color.background = "grey";
                }
                switch (device.state) {
                    case "OK":
                        newNode.color.border = "green";
                        break;
                    case "WARNING":
                        newNode.color.border = "orange";
                        break;
                    case "ERROR":
                        newNode.color.border = "red";
                        break;
                }

                nodes.push(newNode);
            });

            // Add all the neighbors from the root
            var rootDevice = $scope.devices[root];
            if (rootDevice === undefined) {
                return;
            }

            // Check the root devices neighbors
            doneNodes = [root];
            angular.forEach(rootDevice.neighbors, function (neighbor) {
                setNodeLevel(neighbor.name, 1);
            });

            for (var level = 1; level < 5; level++) {
                checkNodeLevel(level);
            }

            function checkNodeLevel(level) {
                angular.forEach(nodes, function (node) {
                    if (node.level !== level) {
                        return;
                    }

                    // Get this device
                    var device = $scope.devices[node.id];
                    if (device === undefined) {
                        return;
                    }
                    // Check this devices neighbors
                    var neighbors = device.neighbors;
                    angular.forEach(neighbors, function (neighbor) {
                        // Is this node already set?
                        if (doneNodes.indexOf(neighbor.name) != -1) {
                            return;
                        }

                        setNodeLevel(neighbor.name, level + 1);
                    });
                });
            }

            function setNodeLevel(nodeId, level) {
                angular.forEach(nodes, function (node) {
                    if (node.id == nodeId) {
                        node.level = level;
                        doneNodes.push(nodeId);
                    }
                });
            }

            var maxLevel = 0;
            angular.forEach(nodes, function (node) {
                if (node.level > maxLevel) {
                    maxLevel = node.level;
                }
            });

            maxLevel += 1;
            angular.forEach(nodes, function (node) {
                if (node.level == -1) {
                    node.level = maxLevel;
                }
            });

            console.log("Setting network options");
            console.log("Setting network data", angular.toJson({nodes: nodes, edges: edges}));
            $scope.networkNodes = {nodes: nodes, edges: edges};
            console.log("Setting network options DONE");
        }
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



