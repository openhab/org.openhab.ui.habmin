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
    'Config.parameter',
    'Config.ItemEdit',
    'angular-growl',
    'Binding.config',
    'ngVis',
    'ResizePanel'
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
                localisations: function (locale) {
                    return locale.ready('habmin');
                }
            }
        });
    })

    .controller('ThingConfigCtrl',
    function ThingConfigCtrl($scope, locale, growl, $timeout, $window, $http, $interval, UserService, ThingModel, BindingModel, ItemModel, itemEdit) {
        $scope.panelDisplayed = 'CHANNELS';
        $scope.thingCnt = -1;

        $scope.newThings = [];

        $scope.insertMode = false;

        $scope.filterStatus = ["INITIALIZING", "ONLINE", "OFFLINE"];
        $scope.filterBindings = [];

        ThingModel.getList().then(
            function (list) {
                $scope.things = list;
                $scope.thingCnt = $scope.things.length;
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
                // Add all bindings into the filter for starters...
                angular.forEach($scope.bindings, function (binding) {
                    $scope.filterBindings.push(binding.id);
                });
            },
            function (reason) {
                // Handle failure
                growl.warning(locale.getString("habmin.mainErrorGettingBindings"));
            }
        );

        $scope.filterFunction = function (element) {
            if ($scope.filterBindings.indexOf(element.binding) == -1) {
                return false;
            }
            if ($scope.filterStatus.indexOf(element.statusInfo.status) == -1) {
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

        $scope.selectThing = function (thing) {
            $scope.thingSelected = null;
            $scope.panelDisplayed = 'PROPERTIES';

            var uid = thing.UID.substring(0, thing.UID.lastIndexOf(":"));
            uid = thing.UID.split(':', 2).join(':');
            ThingModel.getThingInfo(uid).then(
                function (type) {
                    $scope.thingType = type;
                },
                function () {
                    growl.warning(locale.getString("habmin.thingErrorGettingThing",
                        {name: thing.item.label}));
                }
            );

            ThingModel.getThing(thing.UID).then(
                function (data) {
                    $scope.thingSelected = data;
                },
                function () {
                    growl.warning(locale.getString("habmin.thingErrorGettingThing",
                        {name: thing.item.label}));
                }
            );
        };

        $scope.getChannelItems = function (channel) {
            if ($scope.thingSelected == null) {
                return false;
            }

            if ($scope.thingSelected.channels == null) {
                return [];
            }

            for (var i = 0; i < $scope.thingSelected.channels.length; i++) {
                if ($scope.thingSelected.channels[i].id == channel.id) {
                    return $scope.thingSelected.channels[i].linkedItems;
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
                ThingModel.disableChannel($scope.thingSelected.UID + ":" + channel.id).then(
                    function () {
                        growl.success(locale.getString("habmin.thingChannelDisabledOk",
                            {thing: $scope.thingSelected.item.label, channel: channel.label}));

                        ThingModel.getThing($scope.thingSelected.UID).then(
                            function (data) {
                                $scope.thingSelected = data;
                            }
                        );
                    },
                    function () {
                        growl.warning(locale.getString("habmin.thingChannelDisabledError",
                            {thing: $scope.thingSelected.item.label, channel: channel.label}));
                    }
                );
            }
            else {
                ThingModel.enableChannel($scope.thingSelected.UID + ":" + channel.id).then(
                    function () {
                        growl.success(locale.getString("habmin.thingChannelEnabledOk",
                            {thing: $scope.thingSelected.item.label, channel: channel.label}));

                        ThingModel.getThing($scope.thingSelected.UID).then(
                            function (data) {
                                $scope.thingSelected = data;
                            }
                        );
                    },
                    function () {
                        growl.warning(locale.getString("habmin.thingChannelDisabledError",
                            {thing: $scope.thingSelected.item.label, channel: channel.label}));
                    }
                );
            }
        };

        $scope.channelEnabled = function (channel) {
            if ($scope.thingSelected == null || $scope.thingSelected.channels == null) {
                return false;
            }

            for (var i = 0; i < $scope.thingSelected.channels.length; i++) {
                if ($scope.thingSelected.channels[i].id == channel.id) {
                    if ($scope.thingSelected.channels[i].linkedItems.length) {
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
            ThingModel.putThing($scope.thingSelected).then(
                function () {
                    var name = "";
                    if ($scope.thingSelected.item != null) {
                        name = $scope.thingSelected.item.label;
                    }
                    growl.success(locale.getString("habmin.thingSuccessSavingThing",
                        {name: name}));
                },
                function () {
                    var name = "";
                    if ($scope.thingSelected.item != null) {
                        name = $scope.thingSelected.item.label;
                    }
                    growl.error(locale.getString("habmin.thingErrorSavingThing",
                        {name: name}));
                }
            )
        };

        $scope.thingDelete = function () {
            ThingModel.deleteThing($scope.thingSelected).then(
                function () {
                    var name = "";
                    if ($scope.thingSelected.item != null) {
                        name = $scope.thingSelected.item.label;
                    }
                    growl.success(locale.getString("habmin.thingSuccessDeletingThing",
                        {name: name}));
                    $scope.thingSelected = null;
                },
                function () {
                    var name = "";
                    if ($scope.thingSelected.item != null) {
                        name = $scope.thingSelected.item.label;
                    }
                    growl.error(locale.getString("habmin.thingErrorDeletingThing",
                        {name: name}));
                }
            )
        };

        $scope.newThing = function (binding) {
            $scope.insertMode = true;
            $scope.newThings = binding.thingTypes;
        };

        $scope.selectNewThing = function (thing) {
            $scope.insertMode = false;
            $scope.panelDisplayed = 'PROPERTIES';

            ThingModel.getThingInfo(thing.UID).then(
                function (type) {
                    $scope.thingType = type;
                    $scope.thingSelected = {
                        UID: type.UID + ":",
                        item: {
                            label: "",
                            groupNames: []
                        },
                        configuration: {}
                    };

                    angular.forEach(type.configParameters, function (parameter) {
                        if (parameter.type == 'BOOLEAN') {
                            $scope.thingSelected.configuration[parameter.name] =
                                parameter.defaultValue === 'true' ? true : false;
                        }
                        else {
                            $scope.thingSelected.configuration[parameter.name] = parameter.defaultValue;
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
