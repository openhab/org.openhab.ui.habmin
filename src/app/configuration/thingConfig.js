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
    function ThingConfigCtrl($scope, locale, growl, $timeout, $window, $http, $interval, UserService, ThingModel, BindingModel, ItemModel) {
        $scope.panelDisplayed = 'CHANNELS';
        $scope.thingCnt = -1;
        ThingModel.getList().then(
            function (list) {
                $scope.things = list;
                $scope.thingCnt = $scope.things.length;
            }
        );

        ItemModel.getList().then(
            function (list) {
                $scope.items = list;
            }
        );

        $scope.newThings = [];

        $scope.insertMode = false;
        $scope.listOnline = true;
        $scope.listOffline = true;

        $scope.filterFunction = function (element) {
            if (element.status == "ONLINE" && $scope.listOnline) {
                return true;
            }
            if (element.status == "OFFLINE" && $scope.listOffline) {
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

            for (var i = 0; i < $scope.thingSelected.channels.length; i++) {
                if ($scope.thingSelected.channels[i].id == channel.id) {
                    return $scope.thingSelected.channels[i].linkedItems;
                }
            }
            return [];
        };

        $scope.getItem = function (itemName) {
            for (var i = 0; i < $scope.items.length; i++) {
                if ($scope.items[i].name == itemName) {
                    return $scope.items[i];
                }
            }
            return {};
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
            if ($scope.thingSelected == null) {
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
                    growl.success(locale.getString("habmin.thingSuccessSavingThing",
                        {name: $scope.thingSelected.item.label}));
                },
                function () {
                    growl.error(locale.getString("habmin.thingErrorSavingThing",
                        {name: $scope.thingSelected.item.label}));
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
                        UID: type.UID + ":" + new Date().getTime().toString(16),
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

        $scope.categoryIcons = {
            Alarm: 'oa-secur_alarm',
            Battery: 'oa-measure_battery_100',
            Blinds: 'oa-fts_sunblind',
            ColorLight: 'fa fa-lightbulb-o',
            Contact: '',
            DimmableLight: 'oa-light_light_dim_70',
            CarbonDioxide: '',
            Door: 'oa-fts_door_open',
            Energy: 'oa-measure_power_meter',
            Fan: 'oa-vent_ventilation',
            Fire: 'fa fa-fire',
            Flow: '',
            GarageDoor: 'oa-fts_garage',
            Gas: '',
            Humidity: 'oa-weather_humidity',
            Light: 'fa fa-lightbulb-o',
            Motion: 'oa-message_presence',
            MoveControl: '',
            Player: 'fa fa-play',
            PowerOutlet: 'oa-message_socket',
            Pressure: 'oa-weather_barometric_pressure',
            QualityOfService: '',
            Rain: 'oa-weather_rain_gauge',
            Recorder: '',
            Smoke: 'oa-secur_smoke_detector',
            SoundVolume: 'fa fa-volume-up',
            Switch: '',
            Temperature: 'oa-temp_temperature',
            Water: 'oa-sani_water_tap',
            Wind: 'oa-weather_wind',
            Window: 'oa-fts_window_2w_open',
            Zoom: 'fa fa-search'
        };
    })

;
