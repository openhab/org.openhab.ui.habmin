/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('FloorplanProperties', [
    'ui.bootstrap',
    'ngSanitize',
    'angular-growl',
    'ngLocalize',
    'formSelectInput'
])
    .service('floorplanProperties',
    function ($modal, $rootScope, growl, locale, UserService) {
        this.editOptions = function (floorplan) {
            var scope = $rootScope.$new();

            // Ensure floorplan is an object
            // If it is, then make a copy of what we've been passed
            if (floorplan !== null && typeof floorplan === 'object') {
                scope.floorplan = angular.copy(floorplan);
            }
            else {
                scope.floorplan = {};
            }

            /**
             * Controller functions get called when the modal closes
             * @param $scope
             * @param $modalInstance
             */
            var controller = function ($scope, $modalInstance) {
                $scope.ok = function (result) {

                    $modalInstance.close(scope.floorplan);
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
                templateUrl: 'floorplan/floorplanProperties.tpl.html',
                controller: controller,
                windowClass: UserService.getTheme(),
                scope: scope
            }).result;
        };
    })

;
