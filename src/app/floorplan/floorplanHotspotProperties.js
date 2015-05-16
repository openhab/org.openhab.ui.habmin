/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('floorplanHotspotProperties', [
    'ui.bootstrap',
    'ngSanitize',
    'angular-growl',
    'ngLocalize',
    'formSelectInput',
    'HABmin.itemModel'
])
    .service('floorplanHotspotProperties',
    function ($modal, $rootScope, growl, locale, UserService, ItemModel) {
        this.editOptions = function (hotspot) {
            var scope = $rootScope.$new();

            // Ensure hotspot is an object
            // If it is, then make a copy of what we've been passed
            if(hotspot !== null && typeof hotspot === 'object') {
                scope.hotspot = angular.copy(hotspot);
            }
            else {
                scope.hotspot = {};
            }

            // Load the list of items
            ItemModel.getList().then(
                function (items) {
                    scope.items = items;
                },
                function (reason) {
                    // handle failure
                    growl.warning(locale.getString('habmin.chartErrorGettingItems'));
                }
            );

            /**
             * Controller functions get called when the modal closes
             * @param $scope
             * @param $modalInstance
             */
            var controller = function ($scope, $modalInstance) {
                $scope.ok = function (result) {
                    // Copy over the properties
                    hotspot.itemId = scope.hotspot.itemId;
                    $modalInstance.close(scope.hotspot);
                };
                $scope.cancel = function (result) {
                    $modalInstance.dismiss('cancel');
                };
            };

            return $modal.open({
                backdrop: 'static',
                keyboard: true,
                modalFade: true,
                size: 'lg',
                templateUrl: 'floorplan/floorplanHotspotProperties.tpl.html',
                controller: controller,
                windowClass: UserService.getTheme(),
                scope: scope
            }).result;
        };
    })

;
