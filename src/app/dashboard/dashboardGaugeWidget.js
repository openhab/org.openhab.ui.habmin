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

    .directive('dashboardGaugeProperties', function ($window, growl, ItemModel, PersistenceItemModel) {
        return {
            restrict: 'E', // Use as element
            scope: { // Isolate scope
                options: '='
            },
            templateUrl: 'dashboard/dashboardGaugeProperties.tpl.html',
            link: function ($scope, $element, $state) {
                $scope.removeNull = function (item) {
                    if (item == null || item.label == null || item.label.title == null ||
                        item.label.title.length == 0) {
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
