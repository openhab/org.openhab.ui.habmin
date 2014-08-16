/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('UserChartPrefs', [])
    .service('UserChartPrefs', ['$modal',
        function ($modal) {
            this.showModal = function () {
                var controller = function ($scope, $modalInstance) {
                    $scope.ok = function (result) {
                        $modalInstance.close(result);
                    };
                    $scope.cancel = function (result) {
                        $modalInstance.dismiss('cancel');
                    };
                };

                return $modal.open({
                    backdrop: true,
                    keyboard: true,
                    modalFade: true,
                    templateUrl: 'user/userChart.tpl.html',
                    controller: controller
                }).result;
            };
        }]
);