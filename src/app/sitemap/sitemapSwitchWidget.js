/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('sitemapSwitchWidget', [
    'toggle-switch'
])
    .directive('sitemapSwitch', function () {
        return {
            restrict: 'E',
            template: '<span ng-style="labelColor">{{label}}</span>' +
                '<span class="pull-right" ng-style="valueColor">' +
                '<toggle-switch model="value" on-label="ON" off-label="OFF"></toggle-switch></span>',
            scope: {
                itemModel: "=",
                widget: "="
            },
            link: function ($scope, element, attrs, controller) {
                if($scope.widget === undefined) {
                    return;
                }
                if ($scope.widget.item !== undefined) {
                    // Handle state translation
                    switch ($scope.widget.item.type) {
                        case "DimmerItem":
                            if (parseInt($scope.itemModel, 10) > 0) {
                                $scope.value = true;
                            }
                            else {
                                $scope.value = false;
                            }
                            break;
                        case "SwitchItem":
                            if ($scope.itemModel == "ON") {
                                $scope.value = true;
                            }
                            else {
                                $scope.value = false;
                            }
                            break;
                    }
                }

                $scope.label = $scope.widget.label;
                if ($scope.widget.labelcolor != null) {
                    $scope.labelColor = {color: $scope.widget.labelcolor};
                }
                if ($scope.widget.valuecolor) {
                    $scope.valueColor = {color: $scope.widget.valuecolor};
                }

                if ($scope.itemModel !== undefined) {
                    $scope.$watch('value', function (newValue, oldValue) {
                        console.log("Changed switch", $scope.widget.label, newValue, oldValue);
                        $scope.itemModel = newValue === true ? "ON" : "OFF";
                    });
                }
            }
        };
    });
