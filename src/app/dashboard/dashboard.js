/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('HABmin.dashboard', [
    'ui.router',
    'gridster',
    'dashboardChartWidget',
    'dashboardWidgetProperties'
])
    .config(function config($stateProvider) {
        $stateProvider.state('dashboard', {
            url: '/dashboard/:dashName/:dashPage?edit',
            views: {
                "main": {
                    controller: 'DashboardCtrl',
                    templateUrl: 'dashboard/dashboard.tpl.html'
                }
            },
            data: {pageTitle: 'Dashboard'}
        });
    })

    .controller('DashboardCtrl',
    function ($scope, $timeout, $state, $stateParams) {
        $scope.editMode = $stateParams.edit == "true";

        $scope.gridsterOptions = {
            outerMargin: false,
            margins: [10, 10],
            columns: 12,
            draggable: false,
            resizable: false
        };

        $scope.dashboards = {
            '1': {
                id: '1',
                name: 'Home',
                widgets: [
                    {
                        col: 0,
                        row: 0,
                        sizeY: 3,
                        sizeX: 6,
                        type: 'Chart',
                        options: {
                            serviceId: 'mysql',
                            chartId: '20'
                        }
                    },

                    {
                        col: 4,
                        row: 0,
                        sizeY: 3,
                        sizeX: 6,
                        type: 'Chart',
                        options: {
                            serviceId: 'mysql',
                            chartId: '22'
                        }
                    }
                ]
            }
        };

        $scope.editStart = function () {
            $scope.gridsterOptions.resizable = {
                enabled: true,
                handles: ['n', 'e', 's', 'w', 'ne', 'se', 'sw', 'nw'],
                stop: function (event, uiWidget, $element) {
                    console.log("Resize done", uiWidget, $element);
//                    console.log("Resize to", $element[0].getBoundingClientRect());
//                    console.log("Resize to", uiWidget.element[0].getBoundingClientRect());
//                    console.log("Parent", $element[0].parent());
                    $element.on(whichTransitionEvent(), function () {
                        console.log("Transition event");
                        $scope.$apply(function () {
                            console.log("Transition event apply");
                            $scope.$broadcast('gridster-item-resized');
                        });
                    });
                }
            };
            $scope.gridsterOptions.draggable = {
                handle: '.box-header'
            };
        };

        $scope.clearEdit = function () {
            $scope.dashboard.widgets = [];
        };

        $scope.endEdit = function () {
            $scope.editMode = false;
            $scope.gridsterOptions.resizable = false;
            $scope.gridsterOptions.draggable = false;
            //    $state;//.transitionTo($)
        };

        $scope.saveEdit = function () {

        };

        $scope.addWidget = function (type) {
            $scope.dashboard.widgets.push({
                type: type,
                sizeX: 4,
                sizeY: 2
            });
        };

        $scope.$watch('selectedDashboardId', function (newVal, oldVal) {
            if (newVal !== oldVal) {
                $scope.dashboard = $scope.dashboards[newVal];
            } else {
                $scope.dashboard = $scope.dashboards[1];
            }
        });


        /* From Modernizr */
        function whichTransitionEvent() {
            var el = document.createElement('div');
            var transitions = {
                'transition': 'transitionend',
                'OTransition': 'oTransitionEnd',
                'MozTransition': 'transitionend',
                'WebkitTransition': 'webkitTransitionEnd'
            };
            for (var t in transitions) {
                if (el.style[t] !== undefined) {
                    return transitions[t];
                }
            }
        }


        function updateDashboard(dashboardDef) {
            // Sanity check
            if (dashboardDef === null || dashboardDef.widget === undefined) {
                return "";
            }

            // Loop through all widgets on the page
            // If the widget model isn't in the $scope, then we assume this is new
            processWidgetUpdate(dashboardDef.widget);
            $scope.$digest();

            function processWidgetUpdate(widgetArray) {
                // Sanity check
                if (widgetArray == null) {
                    return;
                }

                angular.forEach(widgetArray, function (widget) {
                    // Sanity check
                    if (widget == null) {
                        return;
                    }
                });
            }
        }


        $scope.$on('gridster-resized', function (event, newSizes) {
            console.log("Grid resized", newSizes);
//            var newWidth = sizes[0];
            //           var newHeight = sizes[1];
        });

        $scope.$watch('dashboard.widgets', function (items) {
            console.log("Items updated", items);
            // one of the items changed
        }, true);

        // init dashboard
        $scope.selectedDashboardId = '1';

        if ($scope.editMode) {
            $scope.editStart();
        }


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

    .directive('dashboardWidget', ['$compile', function ($compile) {
        return {
            restrict: 'AE',
            scope: {
                widget: '='
            },
            link: function (scope, element, attrs) {
                var widgetMap = {
                    Chart: {
                        directive: "dashboard-chart"
                    }
                };

                var build = function (widget) {
                    var html = '<' + widgetMap[widget.type].directive + ' options="widget.options"></' + widgetMap[widget.type].directive + '>';
                    element.empty().append($compile(html)(scope));
                };
                scope.$watch('widget', function (newValue, oldValue) {
                    if (newValue) {
//                        scope.options = newValue.options;
                        build(newValue);
                    }
                });
            }
        };
    }])
;

