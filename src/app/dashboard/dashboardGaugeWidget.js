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
    'HABmin.persistenceModel'
])
    .directive('dashboardGauge', function () {
        return {
            restrict: 'E',
            template: '<ng-dial-gauge scale-min="0" scale-max="100" border-width="0" ng-model="gauge5" ' +
            'bar-color="#ff0000" bar-color-end="#00ff00" bar-width="30" angle="315"' +
            ' rotate="180" scale-minor-length="0" scale-major-length="0" line-cap="butt"' +
            ' style="display:inline-block;height:100%;width:100%;stroke:blue;font-weight:100;"></ng-dial-gauge>',
            scope: {
                options: "="
            },
            link: function ($scope, element, attrs, controller) {
//                $scope.chartId = $scope.options.chartId;
//                $scope.serviceId = $scope.options.serviceId;
            }
        };
    })

    .directive('dashboardGaugeProperties', function ($window, growl, ItemModel, PersistenceItemModel) {
        return {
            restrict: 'E', // Use as element
            scope: { // Isolate scope
                model: '='
            },
            templateUrl: 'dashboard/dashboardGaugeProperties.tpl.html',
            link: function ($scope, $element, $state) {
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
