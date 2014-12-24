/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('UserGeneralPrefs', [
    'ngLocalize'
])
    .service('UserGeneralPrefs',
    function ($modal, $rootScope) {
        this.showModal = function () {
            var controller = function ($scope, $modalInstance) {
                $scope.ok = function (result) {
                    $modalInstance.close(result);
                };
                $scope.cancel = function (result) {
                    $modalInstance.dismiss('cancel');
                };
            };

            var scope = $rootScope.$new();
            scope.embedded = window.PhoneGap;

            return $modal.open({
                backdrop: 'static',
                keyboard: true,
                modalFade: true,
                templateUrl: 'user/userGeneral.tpl.html',
                controller: controller,
                scope: scope
            }).result;
        };
    }
);