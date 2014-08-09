/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('sitemapSliderWidget', [
    'ui-rangeSlider',
    'toggle-switch'
])
    .directive('sitemapSlider', function () {
        return {
            restrict: 'E',
            template: '<span ng-style="tLabelColor">{{tLabel}}</span>' + '' +
                '<span class="pull-right" ng-style="tValueColor">{{tValue}}' +
                '<toggle-switch model="switchValue" on-label="ON" off-label="OFF"></toggle-switch>' +
                '</span>' +
                '<div range-slider min="0" max="100" show-values="false" pin-handle="min" model-max="sliderValue"></div>',
            scope: {
                itemModel: "="
            },
            link: function ($scope, element, attrs, controller) {
                if (attrs.value === undefined || attrs.value === "") {
                    $scope.sliderValue = 0;
                }
                else if(attrs.value.toUpperCase() == "OFF") {
                    $scope.sliderValue = 0;
                }
                else if(attrs.value.toUpperCase() == "ON") {
                    $scope.sliderValue = 100;
                }
                else {
                    $scope.sliderValue = parseInt(attrs.value, 10);
                    if(isNaN($scope.sliderValue)) {
                        $scope.sliderValue = 0;
                    }
                }

                if($scope.sliderValue === 0) {
                    $scope.switchValue = false;
                }
                else {
                    $scope.switchValue = true;
                }

                $scope.tLabel = attrs.label;
                $scope.tValue = attrs.value;
                if (attrs.labelColor != null) {
                    $scope.tLabelColor = {color: attrs.labelColor};
                }
                else {
                    $scope.tLabelColor = {};
                }
                if (attrs.valueColor) {
                    $scope.tValueColor = {color: attrs.valueColor};
                }
                else {
                    $scope.tValueColor = {};
                }

                $scope.$watch('sliderValue', function(newValue, oldValue) {
                    if(newValue === 0) {
                        $scope.switchValue = false;
                    }
                    else {
                        $scope.switchValue = true;
                    }
                });

                $scope.$watch('switchValue', function(newValue, oldValue) {
                    if(newValue === false) {
                        $scope.sliderValue = 0;
                    }
                    else {
                        $scope.sliderValue = 100;
                    }
                });

                /*
                 $scope.on = function () {
                 $(element).find(".btn.on").addClass("btn-primary");
                 $(element).find(".btn.off").removeClass("btn-primary");
                 controller.$setViewValue(true);
                 };
                 $scope.off = function () {
                 $(element).find(".btn.off").addClass("btn-primary");
                 $(element).find(".btn.on").removeClass("btn-primary");
                 controller.$setViewValue(false);
                 };
                 controller.$render = function () {
                 $scope[controller.$viewValue ? "on" : "off"]();
                 };*/
            }
        };
    })
;
