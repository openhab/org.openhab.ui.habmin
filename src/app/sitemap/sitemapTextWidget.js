/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('sitemapTextWidget', []).directive('sitemapText', function () {
    return {
        restrict: 'E',
        template: '<h6><span ng-style="tLabelColor">{{tLabel}}</span><span class="pull-right" ng-style="tValueColor">{{tValue}}</span></h6>',
        scope: {
//            tValue: '',
//            tLabel: '=label'
        },
        link: function ($scope, element, attrs, controller) {
            $scope.tLabel = attrs.label;
            $scope.tValue = attrs.value;
            if(attrs.labelColor != null) {
                $scope.tLabelColor = {color: attrs.labelColor};
            }
            if(attrs.valueColor) {
                $scope.tValueColor = {color: attrs.valueColor};
            }
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
});
