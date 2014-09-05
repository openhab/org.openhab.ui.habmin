/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('HABmin.dashboard', [
    'gridster'
])
    .config(function config($stateProvider) {
        $stateProvider.state('dashboard', {
            url: '/dashboard',
            views: {
                "main": {
                    controller: 'DashboardCtrl',
                    templateUrl: 'dashboard/dashboard.tpl.html'
                }
            },
            data: { pageTitle: 'Dashboard' }
        });
    })

    .controller('DashboardCtrl',
    function ($scope, $timeout) {
        $scope.gridsterOptions = {
            margins: [10, 40],
            columns: 4,
            draggable: {
                handle: 'h3'
            },
            resizable: {
                enabled: true,
                handles: 'n, e, s, w, ne, se, sw, nw'
            }
        };

        $scope.dashboards = {
            '1': {
                id: '1',
                name: 'Home',
                widgets: [
                    {
                        col: 0,
                        row: 0,
                        sizeY: 1,
                        sizeX: 1,
                        name: "Widget 1"
                    },
                    {
                        col: 2,
                        row: 1,
                        sizeY: 1,
                        sizeX: 1,
                        name: "Widget 2"
                    }
                ]
            },
            '2': {
                id: '2',
                name: 'Other',
                widgets: [
                    {
                        col: 1,
                        row: 1,
                        sizeY: 1,
                        sizeX: 2,
                        name: "Other Widget 1"
                    },
                    {
                        col: 1,
                        row: 3,
                        sizeY: 1,
                        sizeX: 1,
                        name: "Other Widget 2"
                    }
                ]
            }
        };

        $scope.clear = function () {
            $scope.dashboard.widgets = [];
        };

        $scope.addWidget = function () {
            $scope.dashboard.widgets.push({
                name: "New Widget",
                sizeX: 1,
                sizeY: 1
            });
        };

        $scope.$watch('selectedDashboardId', function (newVal, oldVal) {
            if (newVal !== oldVal) {
                $scope.dashboard = $scope.dashboards[newVal];
            } else {
                $scope.dashboard = $scope.dashboards[1];
            }
        });

        // init dashboard
        $scope.selectedDashboardId = '1';

    })

    .controller('CustomWidgetCtrl',
    function ($scope, $modal) {

        $scope.remove = function (widget) {
            $scope.dashboard.widgets.splice($scope.dashboard.widgets.indexOf(widget), 1);
        };

        $scope.openSettings = function (widget) {
            $modal.open({
                scope: $scope,
                templateUrl: 'demo/dashboard/widget_settings.html',
                controller: 'WidgetSettingsCtrl',
                resolve: {
                    widget: function () {
                        return widget;
                    }
                }
            });
        };
    })

    .controller('WidgetSettingsCtrl',
    function ($scope, $timeout, $rootScope, $modalInstance, widget) {
        $scope.widget = widget;

        $scope.form = {
            name: widget.name,
            sizeX: widget.sizeX,
            sizeY: widget.sizeY,
            col: widget.col,
            row: widget.row
        };

        $scope.sizeOptions = [
            {
                id: '1',
                name: '1'
            },
            {
                id: '2',
                name: '2'
            },
            {
                id: '3',
                name: '3'
            },
            {
                id: '4',
                name: '4'
            }
        ];

        $scope.dismiss = function () {
            $modalInstance.dismiss();
        };

        $scope.remove = function () {
            $scope.dashboard.widgets.splice($scope.dashboard.widgets.indexOf(widget), 1);
            $modalInstance.close();
        };

        $scope.submit = function () {
            angular.extend(widget, $scope.form);

            $modalInstance.close(widget);
        };
    })

// helper code
    .filter('object2Array', function () {
        return function (input) {
            var out = [];
            for (var i in input) {
                out.push(input[i]);
            }
            return out;
        };
    })
;