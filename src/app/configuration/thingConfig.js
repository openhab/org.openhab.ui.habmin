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
    'HABmin.itemModel',
    'HABmin.thingModel',
    'HABmin.bindingModel',
    'HABmin.smarthomeModel',
    'Config.parameter',
    'Config.ItemEdit',
    'angular-growl',
    'Binding.config',
    'ngVis',
    'ResizePanel',
    'showOverflow',
    'ngHelpDialog',
    'ngInputModified'
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
            data: {pageTitle: 'Things'},
            resolve: {
                // Make sure the localisation files are resolved before the controller runs
                localisations: function ($q, locale) {
                    return $q.all([
                        locale.ready('habmin'),
                        locale.ready('smarthome')
                    ]);
                }
            }
        });
    })

    .controller('ThingConfigCtrl',
    function ThingConfigCtrl($scope, $q, locale, growl, $timeout, $window, $http, $interval, UserService, ThingModel, BindingModel, ItemModel, itemEdit, SmartHomeModel) {
        $scope.panelDisplayed = 'PROPERTIES';
        $scope.thingCnt = -1;

        $scope.formLoaded = false;

        $scope.newThings = [];
        $scope.thingTypes = [];
        $scope.newThing = false;
        $scope.insertMode = false;

        $scope.showAdvancedSettings = false;

        $scope.filterStatus = [];
        $scope.filterBindings = [];

        SmartHomeModel.ready().then(
            function () {
                $scope.itemtypes = SmartHomeModel.itemtypes;
                $scope.categories = SmartHomeModel.categories;
            });

        ThingModel.getList().then(
            function (list) {
                $scope.things = list;
            }
        );

        // If the list ever changes, update the counter
        $scope.$watch("things", function () {
            if ($scope.things === undefined) {
                return;
            }
            if ($scope.things == null) {
                $scope.thingCnt = 0;
            }
            else {
                $scope.thingCnt = $scope.things.length;

                // Loop through all the things and derive battery status
                // TODO: Maybe this should move to the ThingModel?
                angular.forEach($scope.things, function(thing) {
                    for (var i = 0; i < thing.channels.length; i++) {
                        if (thing.channels[i].id == "battery-level") {
                            ItemModel.getItem(thing.channels[i].linkedItems[0]).then(
                                function (item) {
//                            if(item == null) {
                                    thing.batteryIcon = "fa fa-question-circle";
                                }
                            );

                            return;
                        }
                    }
                });
            }
        }, true);

        ThingModel.getThingTypes().then(
            function (list) {
                $scope.thingTypes = list;
            }
        );

        ItemModel.getList().then(
            function (list) {
                $scope.itemList = list;
            }
        );

        BindingModel.getList().then(
            function (bindings) {
                $scope.bindings = bindings;
            },
            function (reason) {
                // Handle failure
                growl.warning(locale.getString("habmin.mainErrorGettingBindings"));
            }
        );

        /**
         * Function to filter things depending on selected bindings and status
         * @param element
         * @returns {boolean}
         */
        $scope.filterFunction = function (element) {
            if ($scope.filterBindings.indexOf(element.binding) != -1) {
                return false;
            }
            if (element.statusInfo != null && $scope.filterStatus.indexOf(element.statusInfo.status) != -1) {
                return false;
            }

            return true;
        };

        $scope.toggleStatusFilter = function (status) {
            var p = $scope.filterStatus.indexOf(status);
            if (p == -1) {
                $scope.filterStatus.push(status);
            }
            else {
                $scope.filterStatus.splice(p, 1);
            }
        };

        $scope.toggleBindingFilter = function (binding) {
            var p = $scope.filterBindings.indexOf(binding.id);
            if (p == -1) {
                $scope.filterBindings.push(binding.id);
            }
            else {
                $scope.filterBindings.splice(p, 1);
            }
        };

        $scope.configGroupFilter = function (config, group) {
            // Sanity check
            if (config == null) {
                return false;
            }

            // Are we looking for ungrouped parameters
            if (group == null) {
                if (config.groupName == null || config.groupName == "") {
                    return true;
                }
                return false;
            }

            if (config.groupName == group) {
                return true;
            }

            return false;
        };

        $scope.configGroupAdvanced = function (group) {
            if (group.advanced == true || group == null || group.length == 0) {
                return false;
            }

            for (var i = 0; i < $scope.selectedThingType.configParameters.length; i++) {
                if ($scope.selectedThingType.configParameters[i].groupName == group.name &&
                    !($scope.selectedThingType.configParameters[i].advanced == true)) {
                    return true;
                }
            }

            return false;
        };

        $scope.thingHasUngroupedParams = function () {
            if ($scope.selectedThingType == null || $scope.selectedThingType.configParameters == null) {
                return false;
            }

            for (var cnt = 0; cnt < $scope.selectedThingType.configParameters.length; cnt++) {
                if ($scope.selectedThingType.configParameters[cnt].groupName == null ||
                    $scope.selectedThingType.configParameters[cnt].groupName == "") {
                    return true;
                }
            }
        };

        /**
         * Filter used to test if the thing is of a type included in the bridge types
         * supported by the selected thing.
         * @param thing
         * @returns {boolean}
         */
        $scope.bridgeFilter = function (bridge) {
            if ($scope.selectedThingType == null) {
                return false;
            }

            var thingType = $scope.getThingType(bridge);
            if (thingType == null || $scope.selectedThingType.supportedBridgeTypeUIDs == null ||
                thingType.bridge === false) {
                return false;
            }

            return $scope.selectedThingType.supportedBridgeTypeUIDs.indexOf(thingType.UID) != -1;
        };

        $scope.setPanelDisplayed = function (panel) {
            $scope.panelDisplayed = panel;
        };

        /**
         * Get the thing type, given the thing
         * @param thing
         * @returns thingType
         */
        $scope.getThingType = function (thing) {
            var uid = thing.UID.split(':', 2).join(':');

            for (var i = 0; i < $scope.thingTypes.length; i++) {
                if ($scope.thingTypes[i].UID == uid) {
                    return $scope.thingTypes[i];
                }
            }

            return null;
        };


        $scope.channelExists = function(thing, channelId) {
            angular.forEach(thing.channels, function(channel) {
                if(channel.id == channelId) {
                    return channel;
                }
            });
        };

        $scope.selectThing = function (thing) {
            $scope.formLoaded = false;
            $scope.newThing = false;
            $scope.selectedThing = null;
            $scope.panelDisplayed = 'PROPERTIES';

            $scope.selectedThingType = $scope.getThingType(thing);

            // Ensure the options are converted to the correct type
            if($scope.selectedThingType != null) {
                angular.forEach($scope.selectedThingType.configParameters, function (parameter) {
                    angular.forEach(parameter.options, function (option) {
                        option.value = ThingModel.convertType(parameter.type, option.value);
                    });
                });
            }

            // TODO: Do we need to do this - could just make a copy?
            ThingModel.getThing(thing.UID).then(
                function (data) {
                    $scope.selectedThing = data;
                    angular.forEach($scope.selectedThingType.configParameters, function (parameter) {
                        $scope.selectedThing.configuration[parameter.name] =
                            ThingModel.convertType(parameter.type, $scope.selectedThing.configuration[parameter.name], parameter.multiple);
                    });
                    $timeout(function () {
                        $scope.thingConfigForm.$setPristine();
                        $scope.formLoaded = true;
                    });
                },
                function () {
                    growl.warning(locale.getString("habmin.thingErrorGettingThing",
                        {name: thing.item.label}));
                }
            );
        };

        $scope.getChannelItems = function (channel) {
            if ($scope.selectedThing == null) {
                return false;
            }

            if ($scope.selectedThing.channels == null) {
                return [];
            }

            for (var i = 0; i < $scope.selectedThing.channels.length; i++) {
                if ($scope.selectedThing.channels[i].id == channel.id) {
                    return $scope.selectedThing.channels[i].linkedItems;
                }
            }
            return [];
        };

        $scope.editItem = function (itemName) {
            for (var i = 0; i < $scope.itemList.length; i++) {
                if ($scope.itemList[i].name == itemName) {
                    itemEdit.edit($scope.itemList[i]);
                }
            }
        };

        $scope.getItem = function (itemName) {
            for (var i = 0; i < $scope.itemList.length; i++) {
                if ($scope.itemList[i].name == itemName) {
                    return $scope.itemList[i];
                }
            }
            return {label: itemName};
        };

        $scope.channelEnable = function (channel) {
            if ($scope.channelEnabled(channel)) {
                ThingModel.disableChannel($scope.selectedThing.UID + ":" + channel.id).then(
                    function () {
                        growl.success(locale.getString("habmin.thingChannelDisabledOk",
                            {thing: $scope.selectedThing.item.label, channel: channel.label}));

                        ThingModel.getThing($scope.selectedThing.UID).then(
                            function (data) {
                                $scope.selectedThing = data;
                            }
                        );
                    },
                    function () {
                        growl.warning(locale.getString("habmin.thingChannelDisabledError",
                            {thing: $scope.selectedThing.item.label, channel: channel.label}));
                    }
                );
            }
            else {
                ThingModel.enableChannel($scope.selectedThing.UID + ":" + channel.id).then(
                    function () {
                        growl.success(locale.getString("habmin.thingChannelEnabledOk",
                            {thing: $scope.selectedThing.item.label, channel: channel.label}));

                        ThingModel.getThing($scope.selectedThing.UID).then(
                            function (data) {
                                $scope.selectedThing = data;
                            }
                        );
                    },
                    function () {
                        growl.warning(locale.getString("habmin.thingChannelDisabledError",
                            {thing: $scope.selectedThing.item.label, channel: channel.label}));
                    }
                );
            }
        };

        $scope.channelEnabled = function (channel) {
            if ($scope.selectedThing == null || $scope.selectedThing.channels == null) {
                return false;
            }

            for (var i = 0; i < $scope.selectedThing.channels.length; i++) {
                if ($scope.selectedThing.channels[i].id == channel.id) {
                    if ($scope.selectedThing.channels[i].linkedItems.length) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
            }
            return false;
        };

        $scope.thingSave = function () {
            var promises = [];
            // Check if the linked item information has changed
            if ($scope.thingConfigForm.itemLabel.$dirty === true ||
                $scope.thingConfigForm.itemCategory.$dirty === true || $scope.thingConfigForm.itemGroups.$dirty) {
                promises.push(ItemModel.putItem($scope.selectedThing.item));
            }

            // Keep track of configs that have changed
            var dirtyCfg = {};
            var workToDo = false;

            // Perform type conversion to ensure that any INTEGER types are sent as a number
            angular.forEach($scope.selectedThingType.configParameters, function (parameter, key) {
                // If this value hasn't changed, then don't send an update
                if ($scope.thingConfigForm[parameter.name].$dirty !== true) {
                    return;
                }

                $scope.selectedThing.configuration[parameter.name] =
                    ThingModel.convertType(parameter.type, $scope.selectedThing.configuration[parameter.name], parameter.multiple);

                workToDo = true;
                dirtyCfg[parameter.name] = $scope.selectedThing.configuration[parameter.name];
            });

            // Is there anything for us to do?
            if (workToDo === true) {
                promises.push(ThingModel.putConfig($scope.selectedThing, dirtyCfg));
            }

            // Now wait for any promises to complete before notifying our users
            $q.all(promises).then(
                function () {
                    $scope.newThing = false;
                    var name = "";
                    if ($scope.selectedThing.item != null) {
                        name = $scope.selectedThing.item.label;
                    }
                    growl.success(locale.getString("habmin.thingSuccessSavingThing",
                        {name: name}));
                    $scope.thingConfigForm.$setPristine();
                },
                function () {
                    var name = "";
                    if ($scope.selectedThing.item != null) {
                        name = $scope.selectedThing.item.label;
                    }
                    growl.error(locale.getString("habmin.thingErrorSavingThing",
                        {name: name}));
                }
            );

        };

        $scope.thingDelete = function () {
            ThingModel.deleteThing($scope.selectedThing).then(
                function () {
                    var name = "";
                    if ($scope.selectedThing.item != null) {
                        name = $scope.selectedThing.item.label;
                    }
                    growl.success(locale.getString("habmin.thingSuccessDeletingThing",
                        {name: name}));
                    $scope.selectedThing = null;
                    $scope.formLoaded = false;
                    $scope.thingConfigForm.$setPristine();
                },
                function () {
                    var name = "";
                    if ($scope.selectedThing.item != null) {
                        name = $scope.selectedThing.item.label;
                    }
                    growl.error(locale.getString("habmin.thingErrorDeletingThing",
                        {name: name}));
                }
            );
        };

        $scope.createNewThing = function (binding) {
            $scope.insertMode = true;

            // Create a list of all thingTypes for this binding
            $scope.newThings = [];
            angular.forEach($scope.thingTypes, function (thingType) {
                var uid = thingType.UID.split(":");
                if (uid[0] == binding.id) {
                    $scope.newThings.push(thingType);
                }
            });
        };

        $scope.selectNewThing = function (thing) {
            $scope.newThing = true;
            $scope.insertMode = false;
            $scope.panelDisplayed = 'PROPERTIES';

            // Get the thing type
            ThingModel.getThingInfo(thing.UID).then(
                function (type) {
                    $scope.selectedThingType = type;
                    $scope.selectedThing = {
                        UID: type.UID + ":",
                        item: {
                            // Default the thing name to the thing type name
                            label: type.label,
                            groupNames: []
                        },
                        configuration: {}
                    };

                    // Handle any type conversion and default parameters
                    angular.forEach(type.configParameters, function (parameter) {
                        if (parameter.type == 'BOOLEAN') {
                            $scope.selectedThing.configuration[parameter.name] =
                                parameter.defaultValue === 'true' ? true : false;
                        }
                        else {
                            $scope.selectedThing.configuration[parameter.name] = parameter.defaultValue;
                        }
                    });

                    if ($scope.selectedThing.item != null) {
                        $scope.selectedThing.item.category = ThingModel.getThingTypeCategory($scope.selectedThingType);
                    }

                    // If this thing requires a bridge, see how many things are current defined of the type required
                    // If there's only one, then use it by default
                    if (type.supportedBridgeTypeUIDs != null && type.supportedBridgeTypeUIDs.length != 0) {
                        var bridgeFound = null;
                        angular.forEach($scope.things, function (thing) {
                            // Check if this is a supported bridge
                            if (type.supportedBridgeTypeUIDs.indexOf(thing.UID.split(':', 2).join(':')) != -1) {
                                if (bridgeFound == null) {
                                    bridgeFound = thing.UID;
                                }
                                else {
                                    bridgeFound = "";
                                }
                            }
                        });

                        // If we found a single bridge, it's now in bridgeFound
                        if (bridgeFound != null && bridgeFound != "") {
                            $scope.selectedThing.bridgeUID = bridgeFound;
                        }
                    }

                    // Display the form
                    $timeout(function () {
                        $scope.thingConfigForm.$setPristine();
                        $scope.formLoaded = true;
                    });
                },
                function () {
                    growl.warning(locale.getString("habmin.thingErrorGettingThing",
                        {name: thing.item.label}));
                }
            );
        };
    })

;
