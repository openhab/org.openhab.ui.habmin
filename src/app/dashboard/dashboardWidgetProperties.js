/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('dashboardWidgetProperties', [
    'ui.bootstrap',
    'ngSanitize',
    'angular-growl',
    'ngLocalize'
])
    .service('dashboardWidgetProperties',
    function ($modal, $rootScope, ChartListModel, growl, locale, UserService) {
        this.editChart = function (chartId) {
            var me = this;

            ChartListModel.getChart(chartId).then(function (chart) {
                me.saveChart(chart);
            });
        };

        this.saveChart = function (chart) {
            var scope = $rootScope.$new();
            scope.showTab = 0;
            scope.general = {
                name: chart.name,
                title: chart.title,
                icon: chart.icon,
                period: chart.period
            };

            /**
             * Controller functions get called when the modal closes
             * @param $scope
             * @param $modalInstance
             */
            var controller = function ($scope, $modalInstance) {
                $scope.ok = function (result) {
                    var query = {};

                    // Make sure to set the ID
                    query.id = chart.id;

                    query.name = scope.general.name;
                    if (scope.general.title !== undefined) {
                        query.title = scope.general.title;
                    }
                    query.icon = scope.general.icon;
                    query.period = scope.general.period;

                    query.axis = [];
                    if (scope.leftaxis !== undefined) {
                        var leftAxis = {position: "left"};

                        if (scope.leftaxis.label !== undefined) {
                            leftAxis.label = scope.leftaxis.label;
                        }
                        if (scope.leftaxis.textColor !== undefined) {
                            leftAxis.color = scope.leftaxis.textColor;
                        }
                        if (!isNaN(scope.leftaxis.format)) {
                            leftAxis.format = scope.leftaxis.format;
                        }
                        if (!isNaN(scope.leftaxis.minimum)) {
                            leftAxis.minimum = scope.leftaxis.minimum;
                        }
                        if (!isNaN(scope.leftaxis.maximum)) {
                            leftAxis.maximum = scope.leftaxis.maximum;
                        }
                        if (scope.leftaxis.lineStyle !== undefined) {
                            leftAxis.lineStyle = scope.leftaxis.lineStyle;
                        }

                        query.axis.push(leftAxis);
                    }
                    if (scope.rightaxis !== undefined) {
                        var rightAxis = {position: "right"};

                        if (scope.rightaxis.label !== undefined) {
                            rightAxis.label = scope.rightaxis.label;
                        }
                        if (scope.rightaxis.textColor !== undefined) {
                            rightAxis.color = scope.rightaxis.textColor;
                        }
                        if (!isNaN(scope.rightaxis.format)) {
                            rightAxis.format = scope.rightaxis.format;
                        }
                        if (!isNaN(scope.rightaxis.minimum)) {
                            rightAxis.minimum = scope.rightaxis.minimum;
                        }
                        if (!isNaN(scope.rightaxis.maximum)) {
                            rightAxis.maximum = scope.rightaxis.maximum;
                        }
                        if (scope.rightaxis.lineStyle !== undefined) {
                            rightAxis.lineStyle = scope.rightaxis.lineStyle;
                        }
                        query.axis.push(rightAxis);
                    }

                    ChartListModel.putChart(query).then(
                        function () {
                            growl.success(locale.getString('habmin.chartSaveSuccess', query.name));
                        },
                        function (error) {
                            growl.warning(locale.getString('habmin.chartSaveError', query.name, error));

                        });

                    $modalInstance.close(result);
                };
                $scope.cancel = function (result) {
                    $modalInstance.dismiss('cancel');
                };
            };

            return $modal.open({
                backdrop: 'static',
                keyboard: true,
                modalFade: true,
                size: 'lg',
                templateUrl: 'chart/chartSave.tpl.html',
                controller: controller,
                windowClass: UserService.getTheme(),
                scope: scope
            }).result;
        };
    })
;
