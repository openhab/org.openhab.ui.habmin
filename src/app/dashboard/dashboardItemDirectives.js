/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('dashboardItemWidgets', [
    'HABmin.iconModel'
])
    .directive('dashboardText', function () {
        return {
            restrict: 'E',
            template: '<habmin-icon class="icon-lg sitemap-widget-icon" category="{{item.category}}"></habmin-icon>' +
            '<div class="sitemap-widget-content">' +
            '  <span ng-style="labelStyle">{{item.label}}</span>' +
            '  <span class="pull-right" ng-style="valueStyle">{{item.value}}</span>' +
            '</div>',
            scope: {
                itemModel: "=",
                item: "="
            },
            link: function ($scope, element, attrs, controller) {

            }
        };
    })

    .directive('dashboardSwitch', function () {
        return {
            restrict: 'E',
            template: '<habmin-icon class="icon-lg sitemap-widget-icon" icon="{{item.category}}"></habmin-icon>' +
            '<div class="sitemap-widget-content">' +
            '  <span ng-style="labelColor">{{item.label}}</span>' +
            '  <span class="pull-right">' +
            '  <span ng-style="valueColor"></span>' +
            '  <small>' +
            '    <toggle-switch ng-model="value" on-label="ON" off-label="OFF"></toggle-switch>' +
            '  </small>' +
            '</div>',
            scope: {
                itemModel: "=",
                item: "="
            },
            link: function ($scope, element, attrs, controller) {

            }
        };
    })
;
