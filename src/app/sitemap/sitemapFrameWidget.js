/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('sitemapFrameWidget', [
])

    .directive('sitemapFrame', function () {
        return {
            restrict: 'E',
            transclude: true,
            template: '<div class="col-md-4"><div class="sitemap-frame-title">' +
                '<span ng-style="labelColor">{{label}}</span>' +
                '<span class="pull-right" ng-style="valueColor"></span>' +
                '</div><div class="sitemap-frame" ng-transclude></div></div>',
            scope: {
                itemModel: "=",
                widget: "="
            },
            link: function ($scope, element, attrs, controller) {
                $scope.label = $scope.widget.label;
                if ($scope.widget.labelcolor != null) {
                    $scope.labelColor = {color: $scope.widget.labelcolor};
                }
                if ($scope.widget.valuecolor) {
                    $scope.valueColor = {color: $scope.widget.valuecolor};
                }
                $scope.label = $scope.widget.label;
                $scope.value = $scope.widget.value;
            }
        };
    });

