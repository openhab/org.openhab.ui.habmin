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
    'ngHelpDialog'
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
    function ThingConfigCtrl($scope, locale, growl, $timeout, $window, $http, $interval, UserService, ThingModel, BindingModel, ItemModel, itemEdit, SmartHomeModel) {
        $scope.panelDisplayed = 'CHANNELS';
        $scope.thingCnt = -1;

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
                $scope.thingCnt = $scope.things.length;
            }
        );

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

        /**
         * Get the thing type, given the thing
         * @param thing
         * @returns thingType
         */
        $scope.getThingType = function (thing) {
            var uid = thing.UID.substring(0, thing.UID.lastIndexOf(":"));
            uid = thing.UID.split(':', 2).join(':');

            for (var i = 0; i < $scope.thingTypes.length; i++) {
                if ($scope.thingTypes[i].UID == uid) {
                    return $scope.thingTypes[i];
                }
            }

            return null;
        };

        $scope.selectThing = function (thing) {
            $scope.newThing = false;
            $scope.selectedThing = null;
            $scope.panelDisplayed = 'PROPERTIES';

            $scope.selectedThingType = $scope.getThingType(thing);

            // TODO: Do we need to do this - could just make a copy?
            ThingModel.getThing(thing.UID).then(
                function (data) {
                    $scope.selectedThing = data;
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
            // Perform type conversion to ensure that any INTEGER types are sent as a number
            angular.forEach($scope.selectedThingType.configParameters, function (cfg, key) {
                switch (cfg.type) {
                    case "INTEGER":
                        $scope.selectedThing.configuration[cfg.name] =
                            Number($scope.selectedThing.configuration[cfg.name]);
                        break;
                    case "STRING":
                        $scope.selectedThing.configuration[cfg.name] =
                            $scope.selectedThing.configuration[cfg.name].toString();
                        break;
                }
            });
            ThingModel.putThing($scope.selectedThing).then(
                function () {
                    $scope.newThing = false;
                    var name = "";
                    if ($scope.selectedThing.item != null) {
                        name = $scope.selectedThing.item.label;
                    }
                    growl.success(locale.getString("habmin.thingSuccessSavingThing",
                        {name: name}));
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
            $scope.newThings = binding.thingTypes;
        };

        $scope.selectNewThing = function (thing) {
            $scope.newThing = true;
            $scope.insertMode = false;
            $scope.panelDisplayed = 'PROPERTIES';

            ThingModel.getThingInfo(thing.UID).then(
                function (type) {
                    $scope.selectedThingType = type;
                    $scope.selectedThing = {
                        UID: type.UID + ":",
                        item: {
                            label: "",
                            groupNames: []
                        },
                        configuration: {}
                    };

                    angular.forEach(type.configParameters, function (parameter) {
                        if (parameter.type == 'BOOLEAN') {
                            $scope.selectedThing.configuration[parameter.name] =
                                parameter.defaultValue === 'true' ? true : false;
                        }
                        else {
                            $scope.selectedThing.configuration[parameter.name] = parameter.defaultValue;
                        }
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
