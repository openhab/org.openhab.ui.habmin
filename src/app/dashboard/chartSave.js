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
    'HABmin.chartModel'
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

                ChartListModel.getChart(chartId).then(function(chart) {
                    var scope = $rootScope.$new();
                    scope.general = {
                        name: chart.name,
                        title: chart.title,
                        icon: chart.icon,
                        period: chart.period
                    };
                    if(chart.axis !== undefined) {
                        angular.forEach([].concat(chart.axis), function(axis) {
                            switch(axis.position) {
                                case "left":
                                    scope.leftaxis = {
                                        label: axis.label,
                                        color: axis.color,
                                        minimum: Number(axis.minimum),
                                        maximum: Number(axis.maximum)
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
;
