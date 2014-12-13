/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('ngConfirmClick', [
    'ui.bootstrap'
])
    .directive('ngConfirmClick', function ($window, $modal, $rootScope, $timeout, $parse) {
        return {
            restrict: 'A',

            link: function (scope, element, attrs) {
                element.bind('click', function () {
                    if(attrs.ngConfirmIf !== undefined && !$parse(attrs.ngConfirmIf)(scope)) {
                        $timeout(function () {
                            scope.$apply(attrs.ngConfirmClick);
                        });

                        return;
                    }

                    var newScope = $rootScope.$new();
                    newScope.message = attrs.ngConfirmMessage || "Are you sure?";
                    newScope.titleMsg = attrs.ngConfirmTitle || "Confirm";
                    newScope.yesMsg = attrs.ngConfirmYesBtn || "Yes";
                    newScope.noMsg = attrs.ngConfirmNoBtn || "No";

                    var controller = function ($scope, $modalInstance) {
                        $scope.ok = function (result) {
                            $modalInstance.close(result);

                            $timeout(function () {
                                scope.$apply(attrs.ngConfirmClick);
                            });
                        };
                        $scope.cancel = function (result) {
                            $modalInstance.dismiss('cancel');
                        };
                    };

                    return $modal.open({
                        scope: newScope,
                        backdrop: 'static',
                        keyboard: true,
                        modalFade: true,
                        template: '<div class="modal-header"><h3 class="modal-title">{{titleMsg}}</h3></div>' +
                        '<div class="modal-body">{{message}}</div>' +
                        '<div class="modal-footer">' +
                        '<button class="btn btn-primary" ng-click="ok()">{{yesMsg}}</button>' +
                        '<button class="btn btn-warning" ng-click="cancel()">{{noMsg}}</button>' +
                        '</div>',
                        controller: controller
                    }).result;
                });
            }
        };
    }
);

