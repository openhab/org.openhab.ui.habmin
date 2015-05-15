/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('FloorplanEditor', [
    'ui.router',
    'ui.bootstrap',
    'ngLocalize',
    'HABmin.userModel',
    'HABmin.bindingModel',
    'Config.parameter',
    'angular-growl',
    'Binding.config',
    'ngVis',
    'ResizePanel',
    'SidepanelService',
    'floorplanUpload',
    'FloorPlan'
])

    .config(function config($stateProvider) {
        $stateProvider.state('floorplan/editor', {
            url: '/floorplan/edit',
            views: {
                "main": {
                    controller: 'FloorplanEditor',
                    templateUrl: 'floorplan/floorplanEditor.tpl.html'
                }
            },
            data: {pageTitle: 'Floorplan'},
            resolve: {
                // Make sure the localisation files are resolved before the controller runs
                localisations: function (locale) {
                    return locale.ready('habmin');
                }
            }
        });
    })

    .controller('FloorplanEditor',
    function FloorplanEditorCtrl($scope, locale, growl, $timeout, $window, $http, $interval, floorplanUpload) {
        $scope.hotspots = [];

        /**
         * Event when image is clicked to add a hotspot.
         * @param event
         */
        $scope.imgClicked = function (event) {
            // Make sure this is on the image
            if(event.toElement.localName != "img") {
                return;
            }

            // Get the position of the click - rounding to 2 decimal places
            var posX = Math.round(event.offsetX / event.toElement.width * 10000) / 100;
            var posY = Math.round(event.offsetY / event.toElement.height * 10000) / 100;

            // Work out if there's another hotspot already near here

            // Add the new hotspot to the list
            $scope.hotspots.push({posX: posX, posY: posY});
        };

        $scope.getHotspotStyle = function (hotspot) {
            return {left: hotspot.posX + "%", top: hotspot.posY + "%"};
        };

        $scope.uploadFile = function () {
            floorplanUpload.open();
        };
    })

;
