/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('dashboardGaugeWidget', [
    "angular-dialgauge",
    'angular-growl',
    'HABmin.itemModel',
    'HABmin.persistenceModel',
    'ngLocalize',
    'ui.select'
])
    .directive('dashboardGauge', function (ItemModel) {
        return {
            restrict: 'E',
            template: '<ng-dial-gauge options="options" ng-model="value" ' +
            'style="display:inline-block;height:100%;width:100%;"></ng-dial-gauge>',
            scope: {
                options: "="
            },
            link: function ($scope) {
                $scope.options.percent = true;
//                $scope.borderWidth = $scope.options.borderWidth;
                $scope.$watch("options", function (newOptions) {
//                    $scope.value++;
//                    $scope.options = {borderWidth:4};
//                    $scope.borderWidth = $scope.options.borderWidth;
                });
            },
            controller: function ($scope) {
                // First poll the current value
                ItemModel.getItem($scope.options.itemId).then(
                    function (item) {
                        $scope.value = item.state;
                    }
                );

                // and then watch for changes
                $scope.$on('openhab:smarthome/update', function (event) {
                    if (event == null) {
                        $scope.value = 0;
                    }
                });
            }
        };
    })

    .directive('dashboardGaugeProperties', function ($window, growl, locale, ItemModel, PersistenceItemModel) {
        return {
            restrict: 'E', // Use as element
            scope: { // Isolate scope
                options: '='
            },
            templateUrl: 'dashboard/dashboardGaugeProperties.tpl.html',
            link: function ($scope, $element, $state) {
                $scope.gaugeThemes = [
                    {
                        name: "",
                        desc: "",
                        options: {
                            barWidth: 20,
                            borderWidth: 0,
                            angle: 315,
                            rotate: 180,
                            barAngle: 0,
                            lineCap: 'butt',
                            percent: true
                        }
                    },
                    {
                        name: "",
                        desc: "",
                        options: {
                            barWidth: 20,
                            borderWidth: 0,
                            angle: 315,
                            rotate: 180,
                            barAngle: 10,
                            lineCap: 'round',
                            percent: true
                        }
                    }
                ];
                $scope.endCaps = [
                    {id: "round", name: locale.getString("habmin.dashboardGaugeEndCapRound")},
                    {id: "butt", name: locale.getString("habmin.dashboardGaugeEndCapSquare")}
                ];

                $scope.selectTheme = function (theme) {
                    if (theme == null || theme.options == null) {
                        return;
                    }
                    $scope.options.barWidth = theme.options.barWidth;
                    $scope.options.borderWidth = theme.options.borderWidth;
                    $scope.options.angle = theme.options.angle;
                    $scope.options.rotate = theme.options.rotate;
                    $scope.options.barAngle = theme.options.barAngle;
                };

                if ($scope.options.barWidth != null) {
                    $scope.options.barWidth = Number($scope.options.barWidth);
                }
                if ($scope.options.borderWidth != null) {
                    $scope.options.borderWidth = Number($scope.options.borderWidth);
                }
                if ($scope.options.angle != null) {
                    $scope.options.angle = Number($scope.options.angle);
                }
                if ($scope.options.rotate != null) {
                    $scope.options.rotate = Number($scope.options.rotate);
                }
                if ($scope.options.barAngle != null) {
                    $scope.options.barAngle = Number($scope.options.barAngle);
                }
                $scope.removeNull = function (item) {
                    if (item == null || item.label == null || item.label.title == null ||
                        item.label.title.length === 0) {
                        return false;
                    }
                    return true;
                };

                // Load the list of items
                PersistenceItemModel.get().then(
                    function (items) {
                        if (items == null) {
                            ItemModel.getList().then(
                                function (items) {
                                    $scope.items = items;
                                },
                                function (reason) {
                                    // handle failure
                                    growl.warning(locale.getString('habmin.chartErrorGettingItems'));
                                }
                            );
                        }
                        $scope.items = items;
                    },
                    function (reason) {
                        // handle failure
                        growl.warning(locale.getString('habmin.chartErrorGettingItems'));
                    }
                );
            }
        };
    })
;
