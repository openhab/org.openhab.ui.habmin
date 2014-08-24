/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('HABmin.chartSave', [
    'ui.bootstrap',
    'pickAColor',
    'HABmin.chartModel',
    'ngSanitize'
])
    .service('ChartSave',
    function ($modal, $rootScope, ChartListModel) {
        this.showModal = function (chartId) {
            var controller = function ($scope, $modalInstance) {
                $scope.ok = function (result) {
                    $modalInstance.close(result);
                };
                $scope.cancel = function (result) {
                    $modalInstance.dismiss('cancel');
                };
            };

            ChartListModel.getChart(chartId).then(function (chart) {
                var scope = $rootScope.$new();
                scope.showTab = 1;
                scope.general = {
                    name: chart.name,
                    title: chart.title,
                    icon: chart.icon,
                    period: chart.period
                };
                if (chart.axis !== undefined) {
                    angular.forEach([].concat(chart.axis), function (axis) {
                        switch (axis.position) {
                            case "left":
                                scope.leftaxis = {
                                    label: axis.label,
                                    color: axis.color,
                                    minimum: Number(axis.minimum),
                                    maximum: Number(axis.maximum),
                                    linestyle: "shortdashdot"
                                };
                                break;
                            case "right":
                                scope.rightaxis = {
                                    label: axis.label,
                                    color: axis.color,
                                    minimum: Number(axis.minimum),
                                    maximum: Number(axis.maximum)
                                };
                                break;
                        }
                    });
                }
                if (chart.items !== undefined) {
                    angular.forEach([].concat(chart.items), function (item) {

                    });
                }

                return $modal.open({
                    backdrop: 'static',
                    keyboard: true,
                    modalFade: true,
                    size: 'lg',
                    templateUrl: 'dashboard/chartSave.tpl.html',
                    controller: controller,
                    scope: scope
                }).result;
            });
        };
    })

    .directive('chartSaveGeneral', function ($window) {
        return {
            restrict: 'E', // Use as element
            scope: { // Isolate scope
                model: '='
            },
            templateUrl: 'dashboard/chartSaveGeneral.tpl.html',
            link: function ($scope, $element, $state) {
            }
        };
    })

    .directive('chartSaveItem', function ($window) {
        return {
            restrict: 'E', // Use as element
            scope: { // Isolate scope
                model: '='
            },
            templateUrl: 'dashboard/chartSaveItem.tpl.html',
            link: function ($scope, $element, $state) {
            }
        };
    })

    .directive('chartSaveAxis', function ($window) {
        return {
            restrict: 'E', // Use as element
            scope: { // Isolate scope
                model: '='
            },
            templateUrl: 'dashboard/chartSaveAxis.tpl.html',
            link: function ($scope, $element, $state) {
            }
        };
    })

    .directive('selectLineStyle', function ($window, $sce) {
        return {
            restrict: 'E', // Use as element
            scope: { // Isolate scope
                ngModel: '='
            },
            template: '' +
                '<div class="line-selector dropdown"><a class="dropdown-toggle" data-toggle="dropdown">' +
                '<span class="selected" ng-bind-html="getSelected()">' +
                '</span>' +
                '</a>' +
                '<ul class="dropdown-menu" role="menu">' +
                '<li ng-repeat="choice in styles"><a ng-click="setStyle(choice)">' +
                '<span ng-bind-html="getStyle(choice)"></span>' +
                '</a></li>' +
                '</ul>' +
                '</div>',
            link: function ($scope, $element, $state) {
                // Define the array of line styles
                $scope.styles = [
                    {name: "Solid", array: [5, 0]},
                    {name: "ShortDash", array: [7, 3]},
                    {name: "ShortDot", array: [3, 3]},
                    {name: "ShortDashDot", array: [7, 3, 3, 3]},
                    {name: "ShortDashDotDot", array: [7, 3, 3, 3, 3, 3]},
                    {name: "Dot", array: [3, 7]},
                    {name: "Dash", array: [10, 7]},
                    {name: "LongDash", array: [20, 7]},
                    {name: "DashDot", array: [10, 7, 3, 7]},
                    {name: "LongDashDot", array: [20, 7, 3, 7]},
                    {name: "LongDashDotDot", array: [20, 7, 3, 7, 3, 7]}
                ];

                // By default, select the solid line
                $scope.selected = $scope.styles[0];

                // If there's a line style specified, then see if it's valid and use it
                if ($scope.ngModel !== undefined) {
                    var val = $scope.ngModel.toLowerCase();
                    angular.forEach($scope.styles, function (style) {
                        if (style.name.toLowerCase() === val) {
                            $scope.selected = style;
                        }
                    });
                }

                // Return a trusted HTML for the styles
                $scope.getStyle = function (style) {
                    return $sce.trustAsHtml('<svg width="100%" height="10px"><line x1="0" x2="426" y1="5" y2="5" stroke-width="2" stroke-linecap="butt" stroke-dasharray="' +
                        style.array.join(",") + '"/></svg>');
                };

                // Sets the style when the user selects from the menu
                $scope.setStyle = function (style) {
                    $scope.selected = style;
                    $scope.ngModel = style.name;
                };

                // Gets the selected style as trusted HTML
                $scope.getSelected = function () {
                    return $sce.trustAsHtml('<svg width="100%" height="10px"><line x1="0" x2="426" y1="5" y2="5" stroke-width="2" stroke-linecap="butt" stroke-dasharray="' +
                        $scope.selected.array.join(",") + '"/></svg>');
                };
            }
        };
    })
;
