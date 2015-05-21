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
    'HABmin.floorplanModel',
    'Config.parameter',
    'angular-growl',
    'Binding.config',
    'ngVis',
    'ResizePanel',
    'SidepanelService',
    'floorplanUpload',
    'FloorPlan',
    'floorplanHotspotProperties',
    'FloorplanProperties'
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
    function FloorplanEditorCtrl($scope, locale, growl, $timeout, $window, $http, $interval, FloorplanModel, floorplanProperties, floorplanUpload, floorplanHotspotProperties) {
        $scope.floorplanList = [];
        $scope.selectedFloorplan = {hotspots: []};

        FloorplanModel.getList().then(
            function(list) {
                $scope.floorplanList = list;
            }
        );

        $scope.selectFloorplan = function(floorplan) {
            FloorplanModel.getFloorplan(floorplan.id).then(
                function(fp){
                    $scope.selectedFloorplan = fp;
                    $scope.floorplanImage = "/rest/habmin/floorplan/1/image";
                }
            );
        };

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

            // Add the new hotspot to the list
            var newHotspot = {posX: posX, posY: posY};
            $scope.selectedFloorplan.hotspots.push(newHotspot);

            // And open the properties dialog
            $scope.editHotspot(newHotspot);
        };

        $scope.editHotspot = function (hotspot) {
            floorplanHotspotProperties.editOptions(hotspot).then(
                function(result) {
                    if(result == null) {
                        return;
                    }

                    if(result.cmd == 'save' || result.cmd == 'delete') {
                        // First we want to remove the current hotspot from the list
                        var pnt = -1;
                        for(var i = 0; i < $scope.selectedFloorplan.hotspots.length; i++) {
                            if ($scope.selectedFloorplan.hotspots[i] == hotspot) {
                                pnt = i;
                                break;
                            }
                        }

                        if(pnt != -1) {
                            $scope.selectedFloorplan.hotspots.splice(pnt, 1);
                        }
                    }

                    if(result.cmd == 'save') {
                        // Then if we're saving it, we add the new one back it
                        $scope.selectedFloorplan.hotspots.push(result.hotspot);
                    }
                }
            )
        };

        $scope.editFloorplan = function () {
            floorplanProperties.editOptions($scope.selectedFloorplan).then(
                function (floorplan) {
                    $scope.selectedFloorplan = floorplan;
                }
            );
        };

        $scope.saveFloorplan = function () {
            FloorplanModel.putFloorplan($scope.selectedFloorplan).then(
                function() {
                    growl.success(locale.getString('habmin.floorplanSaveOk',
                        {name: $scope.selectedFloorplan.name}));
                },
                function () {
                    growl.warning(locale.getString('habmin.floorplanSaveError',
                        {name: $scope.selectedFloorplan.name}));
                }
            )
        };

        $scope.floorplanDelete = function () {
            FloorplanModel.deleteFloorplan($scope.selectedFloorplan.id);
        };

        $scope.newFloorplan = function () {
            $scope.selectedFloorplan = {hotspots: []};
            $scope.editFloorplan();
        };

        $scope.uploadFile = function () {
            floorplanUpload.open();
        };
    })

;
