angular.module("dygraphs-directive", [])
    .directive('dygraphs', function ($window) {
        return {
            restrict: 'E', // Use as element
            scope: { // Isolate scope
                data: '=', // Two-way bind data to local scope
                opts: '=?', // '?' means optional
                view: '=?' // '?' means optional
            },
            template: "<div></div>", // We need a div to attach graph to
            link: function (scope, elem, attrs) {
                var graph = new Dygraph(elem.children()[0], scope.data, scope.opts);
                scope.$watch("data", function () {
                    var opts = scope.opts;
                    opts.file = scope.data;
                    opts.drawCallback = scope.drawCallback;
                    graph.updateOptions(opts);
                    graph.resetZoom();
                }, true);

                scope.drawCallback = function (data) {
                    var xAxisRange = data.xAxisRange();
                    if (!scope.view) {
                        scope.view = {};
                    }
                    scope.view.from = xAxisRange[0];
                    scope.view.to = xAxisRange[1];
                    if (!scope.$root.$$phase) {
                        scope.$apply();
                    }
                };

                var e = elem.parent();
                graph.resize(e.width(), e.height());
                var w = angular.element($window);
                w.bind('resize', function () {
//                    var x = e.height();
//                    var y = e.outerHeight();
                    graph.resize(e.width(), e.height());
                    scope.$apply();
                });
            }
        };
    });