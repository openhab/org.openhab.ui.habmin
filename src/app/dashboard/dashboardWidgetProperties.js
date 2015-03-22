/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('dashboardWidgetProperties', [
    'ui.bootstrap',
    'ngSanitize',
    'angular-growl',
    'ngLocalize'
])
    .service('dashboardWidgetProperties',
    function ($modal, $rootScope, growl, locale, UserService) {
        this.editOptions = function (widget) {
            var scope = $rootScope.$new();
            scope.showTab = 0;

            scope.widget = angular.copy(widget);

            /**
             * Controller functions get called when the modal closes
             * @param $scope
             * @param $modalInstance
             */
            var controller = function ($scope, $modalInstance) {
                $scope.ok = function (result) {
                    widget.options = scope.widget.options;
//                    var query = {};

                    // Make sure to set the ID
//                    query.id = chart.id;

//                    query.name = scope.general.name;
//                    if (scope.general.title !== undefined) {
//                        query.title = scope.general.title;
//                    }
//                    query.icon = scope.general.icon;
 //                   query.period = scope.general.period;


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
                templateUrl: 'dashboard/dashboardWidgetProperties.tpl.html',
                controller: controller,
                windowClass: UserService.getTheme(),
                scope: scope
            }).result;
        };
    })
;
