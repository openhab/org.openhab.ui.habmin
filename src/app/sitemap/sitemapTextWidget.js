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
            template: '<habmin-icon class="icon-lg" icon="{{icon}}"></habmin-icon>' +
                '<span ng-style="labelColor">{{label}}</span>' +
                '<span class="pull-right" ng-style="valueColor">{{value}}</span>',
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

                $scope.icon = ImgFactory.lookupImage($scope.widget.icon);

                $scope.label = $scope.widget.label;
                $scope.value = $scope.widget.value;
            }
        };
    });
