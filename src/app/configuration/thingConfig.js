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
    'HABmin.configModel',
    'HABmin.thingModel',
    'HABmin.bindingModel',
    'HABmin.smarthomeModel',
    'HABmin.channelTypeModel',
    'Config.parameter',
    'Config.ItemEdit',
    'angular-growl',
    'Binding.config',
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
                },
                "menu": {
                    controller: 'ThingConfigMenuCtrl',
                    templateUrl: 'configuration/thingConfigMenu.tpl.html'
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

    // Service used to communicate between controllers
    .factory('ThingConfigService', function () {
        var Service = {
            graphItems: [],
            service: ""
        };

        Service.getItems = function () {
            return Service.graphItems;
        };

        Service.getService = function () {
            return Service.service;
        };

        return Service;
    })

    .controller('ThingConfigCtrl',
    function ($scope, $q, ThingConfigService, locale, growl, $timeout, $window, $http, $interval, UserService, ThingModel, ConfigModel, BindingModel, ItemModel, itemEdit, SmartHomeModel, ChannelTypeModel) {
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
                angular.forEach($scope.things, function (thing) {
                    for (var i = 0; i < thing.channels.length; i++) {
                        if (thing.channels[i].id == "battery-level") {
                            /*ItemModel.getItem(thing.channels[i].linkedItems[0]).then(
                             function (item) {
                             if (item == null) {
                             thing.batteryIcon = "fa fa-question-circle";
                             }
                             }
                             );*/

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

            for (var cnt1 = 0; cnt1 < $scope.selectedThingType.configParameters.length; cnt1++) {
                // If there's no group name, then it's not grouped
                if ($scope.selectedThingType.configParameters[cnt1].groupName == null ||
                    $scope.selectedThingType.configParameters[cnt1].groupName == "") {
                    return true;
                }

                // If it has a group name, but the group doesn't exist, then it's ungrouped
                var found = false;
                for (var cnt2 = 0; cnt2 < $scope.selectedThingType.parameterGroups.length; cnt2++) {
                    if ($scope.selectedThingType.parameterGroups[cnt2].name ==
                        $scope.selectedThingType.configParameters[cnt1].groupName) {
                        found = true;
                        break;
                    }
                }
                if (found == false) {
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

        $scope.channelExists = function (thing, channelId) {
            angular.forEach(thing.channels, function (channel) {
                if (channel.id == channelId) {
                    return channel;
                }
            });
        };

        $scope.selectThing = function (thing) {
            $scope.formLoaded = false;
            $scope.newThing = false;
            $scope.selectedThing = null;
            $scope.panelDisplayed = 'PROPERTIES';

            // We make a copy here so that we're not editing the live version
            $scope.selectedThing = angular.copy(thing);//ThingModel.getThing(thing.UID));

            $scope.selectedThingType = $scope.getThingType(thing);
            if ($scope.selectedThingType == null) {
                return;
            }
            angular.forEach($scope.selectedThingType.configParameters, function (parameter) {
                $scope.selectedThing.configuration[parameter.name] =
                    ThingModel.convertType(parameter.type, $scope.selectedThing.configuration[parameter.name],
                        parameter.multiple);
            });

            // Get the configuration
            ThingModel.getConfig(thing.UID).then(
                function (cfg) {
                    $scope.selectedThingConfig = cfg;
                },
                function () {
                    $scope.selectedThingConfig = null;
                }
            );

            // Get all the channel types
            angular.forEach($scope.selectedThing.channels, function (channel) {
                ChannelTypeModel.getChannelType(channel.channelTypeUID).then(
                    function (cfg) {
                        channel.channelType = cfg;

                        // Ensure the options are converted to the correct type
                        angular.forEach(channel.channelType.configParameters, function (parameter) {
                            angular.forEach(parameter.options, function (option) {
                                option.value = ThingModel.convertType(parameter.type, option.value);
                            });
                        });
                    },
                    function () {
                        channel.channelType = null;
                    }
                );
            });

            // Ensure the options are converted to the correct type
            angular.forEach($scope.selectedThingType.configParameters, function (parameter) {
                angular.forEach(parameter.options, function (option) {
                    option.value = ThingModel.convertType(parameter.type, option.value);
                });
            });

            $timeout(function () {
                $scope.thingConfigForm.$setPristine();
                $scope.formLoaded = true;
            });
        };

        $scope.getChannelItems = function (channel) {
            if ($scope.selectedThing == null || $scope.selectedThing.channels == null) {
                return [];
            }

            for (var i = 0; i < $scope.selectedThing.channels.length; i++) {
                if ($scope.selectedThing.channels[i].id == channel.id) {
                    return $scope.selectedThing.channels[i].linkedItems;
                }
            }
            return [];
        };

        $scope.editItem = function (item, channel) {
            itemEdit.edit($scope.selectedThing, channel, item);
        };

        $scope.addItem = function (channel) {
            var newItem = {
                label: channel.channelType.label,
                type: channel.itemType + 'Item',
                category: channel.channelType.category
            };
            itemEdit.edit($scope.selectedThing, channel, newItem);
        };

        $scope.deleteItem = function (item) {
            ItemModel.deleteItem(item).then(
                function() {
                    growl.success(locale.getString("habmin.thingDeleteItemOk"));
                },
                function(){
                    growl.success(locale.getString("habmin.thingDeleteItemFailed"));
                }
            );
        };

        $scope.getItem = function (itemName) {
            for (var i = 0; i < $scope.itemList.length; i++) {
                if ($scope.itemList[i].name == itemName) {
                    return $scope.itemList[i];
                }
            }
            return {label: itemName};
        };

        $scope.getChannel = function (channelId) {
            for (var cnt = 0; cnt < $scope.selectedThing.channels.length; cnt++) {
                if ($scope.selectedThing.channels[cnt].id == channelId) {
                    return $scope.selectedThing.channels[cnt];
                }
            }
            return null;
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

                        $scope.selectedThing = ThingModel.getThing($scope.selectedThing.UID);
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

        $scope.getChannelType = function (channelId) {
            for (var cnt = 0; cnt < $scope.selectedThingType.channels.length; cnt++) {
                if ($scope.selectedThingType.channels[cnt].id == channelId) {
                    return $scope.selectedThingType.channels[cnt];
                }
            }

            return null;
        };

        $scope.thingSave = function () {
            var promises = [];

            // Check if anything at thing level needs updating
            var thingUpdated = false;
            if ($scope.thingConfigForm.modifiedChildFormsCount != 0) {
                angular.forEach($scope.thingConfigForm.modifiedChildForms, function (childForm) {
                    var channel = $scope.getChannel(childForm.$name);
                    if (channel == null) {
                        return;
                    }

                    // Get the channel type so we can get the type information
                    var channelType = $scope.getChannelType(channel.id);
                    if (channelType == null) {
                        return;
                    }

                    // Loop over all the modified parameters
                    angular.forEach(childForm.modifiedModels, function (model) {
                        // Get the configuration description
                        for (var cnt = 0; cnt < channelType.channelType.parameters.length; cnt++) {
                            if (channelType.channelType.parameters[cnt].name == model.$name) {
                                channel.configuration[model.$name] =
                                    ThingModel.convertType(channelType.channelType.parameters[cnt].type, model.$modelValue,
                                        channelType.channelType.parameters[cnt].multiple);

                                thingUpdated = true;
                            }
                        }
                    });
                });
            }

            if(thingUpdated == true) {
                promises.push(ThingModel.putThing($scope.selectedThing));
            }

            // Check if the linked item information has changed
            if ($scope.thingConfigForm.itemLabel.$dirty === true ||
                $scope.thingConfigForm.itemCategory.$dirty === true || $scope.thingConfigForm.itemGroups.$dirty) {
                // We need to check if the item exists - if it doesn't we need to create it...
                if ($scope.selectedThing.item.name == null) {
                    // Item doesn't exist - create it
                    // TODO: Once ESH supports linking a new item to a thing
                    //   $scope.selectedThing.item.name = $scope.selectedThing.UID.split(':').join('_');
                    //   $scope.selectedThing.item.type = "GroupItem";
                    //   $scope.selectedThing.item.tags = ["thing"];
                    //   $scope.selectedThing.item.members = [];
                    //   $scope.selectedThing.item.groupNames = [];
                }
                else {
                    // For now, only save the item if it already exists
                    promises.push(ItemModel.putItem($scope.selectedThing.item));
                }
            }

            // Keep track of configs that have changed
            var dirtyCfg = {};
            var workToDo = false;

            // Perform type conversion to ensure that any INTEGER types are sent as a number
            angular.forEach($scope.selectedThingType.configParameters, function (parameter, key) {
                // If this value doesn't exist in the object, then return!
                // This can happen for advanced parameters when not in advanced mode
                // If this value hasn't changed, then don't send an update
                if ($scope.thingConfigForm[parameter.name] === undefined ||
                    $scope.thingConfigForm[parameter.name].$dirty !== true) {
                    return;
                }

                $scope.selectedThing.configuration[parameter.name] =
                    ThingModel.convertType(parameter.type, $scope.thingConfigForm[parameter.name].$modelValue,
                        parameter.multiple);
                dirtyCfg[parameter.name] = $scope.selectedThing.configuration[parameter.name];
                workToDo = true;
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

        $scope.thingDelete = function (thing) {
            // TODO - detect if this is in the removing state and send force true
//            if(thing.)
//            thing.
            var force = true;

            ThingModel.deleteThing(thing, force).then(
                function () {
                    var name = "";
                    if (thing.item != null) {
                        name = thing.item.label;
                    }
                    growl.success(locale.getString("habmin.thingSuccessDeletingThing",
                        {name: name}));
                    $scope.selectedThing = null;
                    $scope.formLoaded = false;
                    $scope.thingConfigForm.$setPristine();
                },
                function () {
                    var name = "";
                    if (thing.item != null) {
                        name = thing.item.label;
                    }
                    growl.error(locale.getString("habmin.thingErrorDeletingThing",
                        {name: name}));
                }
            );
        };

        $scope.doAction = function (config, value) {
            if (value === undefined) {
                value = 0;
            }
            var cfg = {};
            cfg[config.name] = ThingModel.convertType(config.type, value, false);
            ThingModel.putConfig($scope.selectedThing, cfg).then(
                function () {
                    growl.success(locale.getString("habmin.thingActionSentOk",
                        {name: name}));
                },
                function () {
                    growl.error(locale.getString("habmin.thingActionSentError",
                        {name: name}));
                }
            )
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

    .controller('ThingConfigMenuCtrl',
    function ($scope, ThingConfigService, BindingModel, locale, growl) {
        $scope.tooltipDiscover = locale.getString('habmin.mainDiscovery');
        $scope.tooltipManualAdd = locale.getString('habmin.mainAddThing');

        $scope.discoveryEnabled = true;

        BindingModel.getList().then(
            function (bindings) {
                $scope.bindings = bindings;

                // Set a flag if at least one binding is discoverable
                angular.forEach($scope.bindings, function (binding) {
                    if (binding.discovery) {
                        $scope.discoveryEnabled = true;
                    }
                });
            },
            function (reason) {
                // Handle failure
                growl.warning(locale.getString("habmin.mainErrorGettingBindings"));
            }
        );

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

    })
;
