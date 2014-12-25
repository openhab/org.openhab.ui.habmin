/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('ResizePanel', [
])
    .directive('resizePanel', function ($window) {
        return {
            restrict: 'A',
            scope: {},
            link: function ($scope, element, attrs) {
                var top = element[0].offsetTop;
                var w = angular.element($window);
                $scope.getWindowDimensions = function () {
                    var pa = element.parent('.panel');
                    var top = pa.offset().top;
                    var h = pa[0].offsetHeight;
                    var h1 = element[0].offsetHeight;
                    $scope.headerSize = h - h1;

                    var vvv = (w.height() - $scope.headerSize - top - 20);
                    element.css('height', vvv + 'px');
                    return {
                        'h': w.height()
                    };
                };
                $scope.$watch($scope.getWindowDimensions, function (newValue, oldValue) {
                    var pa = element.parent();
                    var h = pa[0].offsetHeight;
                    var h1 = element[0].offsetHeight;
                    var hh = w.height();
                    var tt = pa[0].offsetTop;
                    var ttt = element[0].offsetTop;
                    $scope.headerSize = h - h1;
                    var hx = hh - $scope.headerSize;
                    var vvv = (w.height() - $scope.headerSize - 60 - 20);
//                    element.css('height', vvv + 'px');
                    /*                   $scope.styleItemList = function () {
                     return {
                     'height': (newValue.h - $scope.headerSize) + 'px'
                     };
                     };
                     $scope.styleChartList = function () {
                     return {
                     'height': (newValue.h - $scope.headerSize) + 'px'
                     };
                     };
                     $scope.styleChartPanel = function () {
                     return {
                     'height': (newValue.h - $scope.headerSize) + 'px'
                     };
                     };
                     $scope.styleChart = function () {
                     return {
                     'height': (newValue.h - $scope.headerSize) + 'px'
                     };
                     };*/
                }, true);

                w.bind('resize', function () {
                    var pa = element.parent();
                    var h = pa[0].offsetHeight;
                    var h1 = element[0].offsetHeight;
                    var hh = w.height();
                    var tt = pa[0].offsetTop;
                    var ttt = element[0].offsetTop;
                    $scope.headerSize = h - h1;
                    var hx = hh - $scope.headerSize;
                    var vvv = (w.height() - $scope.headerSize - 60 - 20);
                    //                   element.css('height', vvv + 'px');
                    $scope.$apply();
                });
            }
        };
    })

;