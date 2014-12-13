/**
 * dygraph directive for AngularJS
 *
 * Author: Chris Jackson
 *
 * License: MIT
 */
angular.module("angular-dygraphs", [
    'ngSanitize'
])
    .directive('ngDygraphs', function ($window, $sce) {
        return {
            restrict: 'E',
            scope: { // Isolate scope
                data: '=',
                options: '=',
                legend: '=?'
            },
            template: '<div class="ng-dygraphs">' +                     // Outer div to hold the whole directive
                '<div class="graph"></div>' +                           // Div for graph
                '<div class="legend" ng-if="LegendEnabled">' +          // Div for legend
                '<div class="series-container">' +                      // Div for series
                '<div ng-repeat="series in legendSeries" class="series">' +
                '<a ng-click="selectSeries(series)">' +
                '<span ng-bind-html="seriesLine(series)"></span>' +
                '<span ng-style="seriesStyle(series)">{{series.label}}</span>' +
                '</a>' +
                '</div>' +                                              // Repeat
                '</div>' +                                              // Series Div
                '</div>' +                                              // Legend Div
                '<div class="dypopover"></div>' +
                '</div>',                                               // Outer div
            link: function (scope, element, attrs) {
                scope.LegendEnabled = true;

                var parent = element.parent();
                var mainDiv = element.children()[0];
                var chartDiv = $(mainDiv).children()[0];
                var legendDiv = $(mainDiv).children()[1];
                var popover = element.find('.dypopover');

                var popoverWidth = 0;
                var popoverHeight = 0;
                var chartArea;
                var popoverPos = false;

                var graph;

                scope.$watch("data", function () {
                    graph = new Dygraph(chartDiv, scope.data, scope.options);
                    var options = scope.options;
                    if (options === undefined) {
                        options = {};
                    }

                    if (options.axes === undefined) {
                        options.axes = {};
                    }

                    if (options.axes.y !== undefined && options.axes.y.format !== undefined &&
                        options.axes.y.axisLabelFormatter === undefined) {
                        options.axes.y.axisLabelFormatter = formatY1;
                    }
                    if (options.axes.y2 !== undefined && options.axes.y2.format !== undefined &&
                        options.axes.y2.axisLabelFormatter === undefined) {
                        options.axes.y2.axisLabelFormatter = formatY2;
                    }

                    options.file = scope.data;
                    options.highlightCallback = scope.highlightCallback;
                    options.unhighlightCallback = scope.unhighlightCallback;

                    if (scope.legend !== undefined) {
                        options.labelsDivWidth = 0;
                    }
                    graph.updateOptions(options);
                    graph.resetZoom();

                    resize();
                }, true);

                scope.$watch("legend", function () {
                    // Clear the legend
                    var colors = graph.getColors();
                    var labels = graph.getLabels();

                    scope.legendSeries = {};

                    if (scope.legend.dateFormat === undefined) {
                        scope.legend.dateFormat = 'MMMM Do YYYY, h:mm:ss a';
                    }

                    // If we want our own legend, then create it
                    if (scope.legend !== undefined && scope.legend.series !== undefined) {
                        var cnt = 0;
                        for (var key in scope.legend.series) {
                            scope.legendSeries[key] = {};
                            scope.legendSeries[key].color = colors[cnt];
                            scope.legendSeries[key].label = scope.legend.series[key].label;
                            scope.legendSeries[key].format = scope.legend.series[key].format;
                            scope.legendSeries[key].visible = true;
                            scope.legendSeries[key].column = cnt;

                            cnt++;
                        }
                    }

                    resize();
                });

                scope.highlightCallback = function (event, x, points, row) {
                    console.log(event, x, points, row);
                    var html = "<table><tr><th colspan='2'>";
                    if (typeof moment === "function") {
                        html += moment(x).format(scope.legend.dateFormat);
                    }
                    else {
                        html += x;
                    }
                    html += "</th></tr>";

                    angular.forEach(points, function (point) {
                        var color;
                        var label;
                        var value;
                        if (scope.legendSeries[point.name] !== undefined) {
                            label = scope.legendSeries[point.name].label;
                            color = "style='color:" + scope.legendSeries[point.name].color + ";'";
                        }
                        else {
                            label = point.name;
                            color = "";
                        }
                        if (scope.legendSeries[point.name].format) {
                            value = format(point.yval);//point.yval.toFixed(scope.legendSeries[point.name].format);
                        }
                        else {
                            value = point.yval;
                        }
                        html += "<tr " + color + "><td>" + label + "</td>" + "<td>" + value + "</td></tr>";
                    });
                    html += "</table>";
                    popover.html(html);
                    popover.show();
                    var table = popover.find('table');
                    popoverWidth = table.outerWidth(true);
                    popoverHeight = table.outerHeight(true);

                    // Provide some hysterises to the popup position to stop it flicking back and forward
                    if (points[0].x < 0.4) {
                        popoverPos = false;
                    }
                    else if (points[0].x > 0.6) {
                        popoverPos = true;
                    }
                    var x;
                    if (popoverPos == true) {
                        x = event.pageX - popoverWidth - 20;
                    }
                    else {
                        x = event.pageX + 20;
                    }
                    popover.width(popoverWidth);
                    popover.height(popoverHeight);
                    popover.animate({left: x + 'px', top: (event.pageY - (popoverHeight / 2)) + 'px'}, 15);

                    console.log("Moving", {left: x + 'px', top: (event.pageY - (popoverHeight / 2)) + 'px'})
                };

                scope.unhighlightCallback = function (event, a, b) {
                    popover.hide();
                };

                scope.seriesLine = function (series) {
                    return $sce.trustAsHtml('<svg height="14" width="20"><line x1="0" x2="16" y1="8" y2="8" stroke="' +
                        series.color + '" stroke-width="3" /></svg>');
                };

                scope.seriesStyle = function (series) {
                    if (series.visible) {
                        return {color: series.color};
                    }
                    return {};
                };

                scope.selectSeries = function (series) {
                    console.log("Change series", series);
                    series.visible = !series.visible;
                    graph.setVisibility(series.column, series.visible);
                };

                resize();

                var w = angular.element($window);
                w.bind('resize', function () {
                    resize();
                });

                function formatY1(value) {
                    return format(value, scope.options.axes.y.format);
                }

                function formatY2(value) {
                    return format(value, scope.options.axes.y2.format);
                }

                function format(value, dec) {
                    return value.toFixed(dec);
                }

                function resize() {
                    var maxWidth = 0;
                    element.find('div.series').each(function () {
                        var itemWidth = $(this).width();
                        maxWidth = Math.max(maxWidth, itemWidth)
                    });
                    element.find('div.series').each(function () {
                        $(this).width(maxWidth);
                    });

                    var legendHeight = element.find('div.legend').outerHeight(true);
                    console.log("Heights", legendHeight, parent.height(), parent.outerHeight(true),
                        $(mainDiv).outerHeight(), element.height(), $(legendDiv).height(),
                        $(legendDiv).outerHeight(true));
                    if (graph !== undefined) {
                        graph.resize(parent.width(), parent.height() - legendHeight);
                    }
                    chartArea = $(chartDiv).offset();
                    chartArea.bottom = chartArea.top + parent.height() - legendHeight;
                    chartArea.right = chartArea.left + parent.width();
                    console.log("Position", chartArea);
                }
            }
        };
    });
