/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('sitemapSetpointWidget', [
    'HABmin.iconModel'
])
    .directive('sitemapSetpoint', function (ImgFactory) {
        return {
            restrict: 'E',
            template:
                '<habmin-icon class="icon-lg sitemap-widget-icon" icon="{{widget.icon}}"></habmin-icon>' +
                '<div class="sitemap-widget-content">' +
                '  <span ng-style="labelColor">{{widget.label}}</span>' +
                '  <span class="pull-right">' +
                '  <button type="button" class="btn btn-primary btn-sm" on-click="click(1)"><span class="fa fa-chevron-circle-up"></span></button>' +
                '  <span ng-style="valueColor">{{widget.value}}</span>' +
                '  <button type="button" class="btn btn-primary btn-sm" on-click="click(-1)"><span class="fa fa-chevron-circle-down"></span></button>' +
                '</div>',
            scope: {
                itemModel: "=",
                widget: "="
            },
            link: function ($scope, element, attrs, controller) {
                if ($scope.widget === undefined) {
                    return;
                }

                $scope.$on('habminGUIRefresh', function (newValue, oldValue) {
                    updateWidget();
                    $scope.$apply();
                });
// minValue, maxValue, step
                if ($scope.widget.item !== undefined) {
                    $scope.click = function(val) {
                        console.log("Changed setpoint", $scope.widget.label, val);
                        if (newValue != $scope.currentValue) {
                            // Keep a record of the current value so we can detect changes from the GUI
                            // and avoid changes coming from the server!
                            $scope.currentValue = newValue;
                            $scope.$emit('habminGUIUpdate', $scope.widget.item.name,
                                $scope.currentValue === true ? "ON" : "OFF");
                        }
                    };
                }

                updateWidget();

                function updateWidget() {
                    if ($scope.widget.item !== undefined) {
                        // Handle state translation
                        switch ($scope.widget.item.type) {
                            case "DimmerItem":
                                if (parseInt($scope.widget.item.state, 10) > 0) {
                                    $scope.value = true;
                                }
                                else {
                                    $scope.value = false;
                                }
                                break;
                            case "SwitchItem":
                                if ($scope.widget.item.state == "ON") {
                                    $scope.value = true;
                                }
                                else {
                                    $scope.value = false;
                                }
                                break;
                        }
                    }

                    if ($scope.widget.labelcolor != null) {
                        $scope.labelColor = {color: $scope.widget.labelcolor};
                    }
                    if ($scope.widget.valuecolor) {
                        $scope.valueColor = {color: $scope.widget.valuecolor};
                    }

                    // Keep a record of the current value so we can detect changes from the GUI
                    // and avoid changes coming from the server!
                    $scope.currentValue = $scope.value;
                }
            }
        };
    });
