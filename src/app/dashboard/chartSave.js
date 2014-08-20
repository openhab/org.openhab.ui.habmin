/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('HABmin.chartSave', [
    'ui.bootstrap',
    'colorpicker.module'
])
    .service('ChartSave', ['$modal',
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
                    backdrop: 'static',
                    keyboard: true,
                    modalFade: true,
                    size: 'lg',
                    templateUrl: 'dashboard/chartSave.tpl.html',
                    controller: controller
                }).result;
            };
        }]
)

    .directive('chartSaveGeneral', function ($window) {
        return {
            restrict: 'E', // Use as element
            scope: { // Isolate scope
                model: '='
            },
            templateUrl: 'dashboard/chartSaveGeneral.tpl.html'
        };
    }
)

    .directive('chartSaveItem', function ($window) {
        return {
            restrict: 'E', // Use as element
            scope: { // Isolate scope
                model: '='
            },
            templateUrl: 'dashboard/chartSaveItem.tpl.html'
        };
    }
);