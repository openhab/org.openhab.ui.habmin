angular.module('ngVis', [])

    .factory('VisDataSet', function () {
        'use strict';
        return function (data, options) {
            // Create the new dataSets
            var dataSet = new vis.DataSet(data, options);

            this.add = function (data, senderId) {
                var response = dataSet.add(data, senderId);

                return response;
            };

            this.update = function (data, senderId) {
                var response = dataSet.update(data, senderId);

                return response;
            };

            this.getDataSet = function () {
                return dataSet;
            };
        };
    })

/**
 * TimeLine directive
 */
    .directive('visTimeline', function () {
        return {
            restrict: 'EA',
            transclude: false,
            scope: {
                data: '=',
                options: '='
            },
            link: function (scope, element, attr) {
                var timeline = new vis.Timeline(element[0]);

                scope.$watch('data', function () {
                    timeline.clear({options: true});

                    if (scope.data.single) {
                        timeline.clear({groups: true});
                        timeline.setItems(scope.data.load);
                    } else {
                        timeline.setGroups(scope.data.load.groups);
                        timeline.setItems(scope.data.load.items);
                    }

                    timeline.fit();
                });

                scope.$watchCollection('options', function (options) {
                    timeline.clear({options: true});
                    timeline.setOptions(options);
                });

                scope.$watch('events', function (events) {
                    angular.forEach(events, function (callback, event) {
                        if (['rangechange', 'rangechanged', 'select', 'timechange',
                                'timechanged'].indexOf(String(event)) >=
                            0) {
                            timeline.on(event, callback);
                        }
                    });
                });
            }
        };
    })

/**
 * Directive for network chart.
 */
    .directive('visNetwork', function () {
        return {
            restrict: 'EA',
            transclude: false,
            scope: {
                data: '=',
                options: '='
            },
            link: function (scope, element, attr, visCtrl) {
                var network = new vis.Network(element[0], scope.data, scope.options);

                scope.$watch('data', function () {
                    network.setData(scope.data);
                });

                scope.$watchCollection('options', function (options) {
                    network.setOptions(options);
                });

                scope.$watch('events', function (events) {
                    angular.forEach(events, function (callback, event) {
                        if (['select', 'click', 'hoverNode'].indexOf(String(event)) >= 0) {
                            network.on(event, callback);
                        }
                    });
                });
            }
        };
    })

/**
 * Directive for graph2d.
 */
    .directive('visGraph2d', function () {
        'use strict';
        return {
            restrict: 'EA',
            transclude: false,
            scope: {
                data: '=',
                options: '=',
                events: '='
            },
            link: function (scope, element, attr, visCtrl) {
                var graphEvents = [
                    'rangechange',
                    'rangechanged',
                    'timechange',
                    'timechanged'
                ];

                // Create the chart
                var graph = new vis.Graph2d(element[0]);

                scope.$watch('data', function () {
                    // Sanity check
                    if (scope.data === undefined) {
                        return;
                    }

                    // If we've actually changed the data set, then recreate the graph
                    // We can always update the data by adding more data to the existing data set
                    if (graph !== undefined) {
                        graph.destroy();
                    }

                    // Create the graph2d object
                    graph = new vis.Graph2d(element[0]);

                    // Attach an event handler if defined
                    angular.forEach(scope.events, function (callback, event) {
                        if (graphEvents.indexOf(String(event)) >= 0) {
                            graph.on(event, callback);
                        }
                    });

                    // Set the options first
                    graph.setOptions(scope.options);

                    // Add groups and items
                    if (scope.data.groups !== undefined) {
                        graph.setGroups(scope.data.groups.getDataSet());
                    }
                    if (scope.data.items !== undefined) {
                        graph.setItems(scope.data.items.getDataSet());
                    }

                    // onLoad callback
                    if (scope.events.onload !== undefined && angular.isFunction(scope.events.onload)) {
                        scope.events.onload(graph);
                    }
                });

                scope.$watchCollection('options', function (options) {
                    graph.setOptions(options);
                });

                /*            scope.$watch('events', function (events) {
                 angular.forEach(events, function (callback, event) {
                 if (graphEvents.indexOf(String(event)) >=
                 0) {
                 graph.on(event, callback);
                 }
                 });
                 });*/
            }
        };
    })
;
