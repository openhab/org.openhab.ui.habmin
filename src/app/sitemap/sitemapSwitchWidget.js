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
            template: '<span ng-style="tLabelColor">{{tLabel}}</span>' +
                '<span class="pull-right" ng-style="tValueColor">' +
                '<toggle-switch model="tValue" on-label="ON" off-label="OFF"></toggle-switch></span>',
            scope: {
                itemModel: "="
            },
            link: function ($scope, element, attrs, controller) {
                if (attrs.itemType) {
                    // Handle state translation
                    switch (attrs.itemType) {
                        case "DimmerItem":
                            if (parseInt(attrs.value, 10) > 0) {
                                $scope.tValue = true;
                            }
                            else {
                                $scope.tValue = false;
                            }
                            break;
                        case "SwitchItem":
                            if (attrs.value == "ON") {
                                $scope.tValue = true;
                            }
                            else {
                                $scope.tValue = false;
                            }
                    }
                }

                $scope.tLabel = attrs.label;
                $scope.tValue = attrs.value;
                if (attrs.labelColor != null) {
                    $scope.tLabelColor = {color: attrs.labelColor};
                }
                if (attrs.valueColor) {
                    $scope.tValueColor = {color: attrs.valueColor};
                }

                if (attrs.itemModel !== undefined) {
                    $scope.$watch('tValue', function (newValue, oldValue) {
                        console.log("Changed switch", attrs.label, newValue, oldValue);
                        $scope.itemModel = newValue === true ? "ON" : "OFF";
                    });
                }
            }
        };
    });
