/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('sitemapTextWidget', [

])
    .directive('sitemapText', function () {
        return {
            restrict: 'E',
            template: '<h6><span ng-style="tLabelColor">{{tLabel}}</span><span class="pull-right" ng-style="tValueColor">{{tValue}}</span></h6>',
            scope: {
            },
            link: function ($scope, element, attrs, controller) {
                $scope.tLabel = attrs.label;
                $scope.tValue = attrs.value;
                if (attrs.labelColor != null) {
                    $scope.tLabelColor = {color: attrs.labelColor};
                }
                if (attrs.valueColor) {
                    $scope.tValueColor = {color: attrs.valueColor};
                }
            }
        };
    });
