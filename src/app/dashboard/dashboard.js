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
    'dashboardGaugeWidget',
    'dashboardWidgetProperties'
])
    .config(function config($stateProvider) {
        $stateProvider.state('dashboard', {
            url: '/dashboard/:dashName',
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
    function ($scope, $timeout, $state, $stateParams, dashboardWidgetProperties) {
        $scope.gridsterOptions = {
            outerMargin: false,
            margins: [10, 10],
            columns: 12,
            draggable: {enabled: false},
            resizable: {enabled: false}
        };

        $scope.dashboard = {
            id: '1',
            name: 'Home',
            widgets: [
                {
                    col: 0,
                    row: 0,
                    sizeY: 3,
                    sizeX: 6,
                    type: 'Gauge',
                    options: {
                        borderWidth: 4,
                        rotate: '90'
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
//                    $element.on(whichTransitionEvent(), function () {
//                        console.log("Transition event");
//                        $scope.$apply(function () {
//                            console.log("Transition event apply");
//                            $scope.$broadcast('gridster-item-resized');
//                        });
//                    });
                }
            };
            $scope.gridsterOptions.draggable = {
                enabled: true,
                handle: '.box-header'
            };
        };

        $scope.clearEdit = function () {
            $scope.dashboard.widgets = [];
        };

        $scope.endEdit = function () {
            $scope.editMode = false;
            $scope.gridsterOptions.resizable = {enabled: false};
            $scope.gridsterOptions.draggable = {enabled: false};
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

        // Handle the event update from the main menu to enable edit mode
        $scope.$on("dashboardEdit", function () {
            $scope.editMode = !$scope.editMode;

            if ($scope.editMode == true) {
                $scope.editStart();
            }
            else {
                $scope.endEdit()
            }
        });

        $scope.removeWidget = function (widget) {
            $scope.dashboard.widgets.splice($scope.dashboard.widgets.indexOf(widget), 1);
        };

        $scope.configWidget = function (widget) {
            dashboardWidgetProperties.editOptions(widget);
        };

        $scope.$on('gridster-resized', function (event, newSizes) {
            console.log("Grid resized", newSizes);
//            var newWidth = sizes[0];
            //           var newHeight = sizes[1];
        });

        $scope.$watch('dashboard.widgets', function (items) {
            console.log("Items updated", items);
            // one of the items changed
        }, true);


    })

    .directive('dashboardWidget', ['$compile', function ($compile) {
        return {
            restrict: 'E',
            scope: {
                widget: '='
            },
            link: function (scope, element, attrs) {
                var widgetMap = {
                    Chart: {
                        directive: "dashboard-chart"
                    },
                    Gauge: {
                        directive: "dashboard-gauge"
                    }
                };

                var build = function (widget) {
                    if(widget.options == null) {
                        widget.options = {};
                    }

                    var html = '<' + widgetMap[widget.type].directive + ' options="widget.options"></' +
                        widgetMap[widget.type].directive + '>';
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

