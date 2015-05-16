/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('FloorPlan', [])
    .directive('floorPlan', function ($window) {
        return {
            restrict: 'E',
            template: '<div class="floorplan" ng-style="style">' +
            '<img ng-src="{{src}}" class="fade">' +
            '<div ng-repeat="hotspot in hotspots">' +
            '<div class="hotspot" ng-style="getHotspotStyle(hotspot)">' +
            '<span class="badge">' +
            '<habmin-icon category="hotspot.item.category"></habmin-icon>&nbsp;27.4C' +
            '</span>' +
            '</div>' +
            '</div>' +
            '</div>',
            scope: {
                src: "@",
                hotspots: "="
            },
            link: function ($scope, element) {
                $scope.style = {};

                var imgElement = element.children().children();
                var divElement = element.parent();

                // Resize the image.
                // Actually, we let CSS do the resizing, we just need
                // to work out how to constrain it
                $scope.resizeImage = function () {
                    var imgH = imgElement[0].naturalHeight;
                    var imgW = imgElement[0].naturalWidth;

                    var h = divElement.height();
                    var w = divElement.width();

                    var rH = h / imgH;
                    var rW = w / imgW;

                    var margin;
                    if (rW > rH) {
                        var nW = h * (imgW/imgH);
                        margin = Math.abs(w - nW) / 2;
                        $scope.style = {height: "100%", width: nW, marginLeft: margin, marginRight: margin};
                    }
                    else {
                        var nH = w * (imgH/imgW);
                        margin = Math.abs(h - nH) / 2;
                        $scope.style = {width: "100%", height: nH, marginTop: margin, marginBottom: margin};
                    }

                    console.log("resize floorplan :", h, w, rH, rW, $scope.style);
                };

                $scope.getHotspotStyle = function (hotspot) {
                    return {left: hotspot.posX + "%", top: hotspot.posY + "%"};
                };

                imgElement.bind('load', function () {
                    $scope.resizeImage();
                    $scope.$apply();
                    imgElement.addClass('in');
                });
                imgElement.bind('error', function () {
                    console.log("Error loading img");
                });
                var w = angular.element($window);
                w.bind('resize', function () {
                    $scope.resizeImage();
                    $scope.$apply();
                });
                $scope.$watch('ngSrc', function (newVal) {
                    imgElement.removeClass('in');
                });
            }
        };
    })

;
