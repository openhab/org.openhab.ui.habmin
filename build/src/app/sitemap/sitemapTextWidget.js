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
    'HABmin.iconModel'
])
    .directive('sitemapText', function (ImgFactory) {
        return {
            restrict: 'E',
            template:
                '<div style="width:100%;display:inline-block;">' +
                '<habmin-icon class="icon-lg" icon="{{widget.icon}}"></habmin-icon>' +
                '<span class="sitemap-item-text">' +
                '<span ng-style="labelColor">{{widget.label}}</span>' +
                '<span class="pull-right" ng-style="valueColor">{{widget.value}}</span>' +
                '</span>' +
                '</div>',
            scope: {
                itemModel: "=",
                widget: "="
            },
            link: function ($scope, element, attrs, controller) {
                if ($scope.widget.labelcolor != null) {
                    $scope.labelColor = {color: $scope.widget.labelcolor};
                }
                if ($scope.widget.valuecolor) {
                    $scope.valueColor = {color: $scope.widget.valuecolor};
                }
            }
        };
    });
