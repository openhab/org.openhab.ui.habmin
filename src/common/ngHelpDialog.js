/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('ngHelpDialog', [
    'ui.bootstrap',
    'ngSanitize'
])
    .directive('ngHelpDialog', function ($window, $modal, $rootScope, $timeout, $parse, $sce) {
        return {
            restrict: 'A',

            link: function (scope, element, attrs) {
                element.bind('click', function () {
                    if (attrs.ngConfirmIf !== undefined && !$parse(attrs.ngConfirmIf)(scope)) {
                        $timeout(function () {
                            scope.$apply(attrs.ngConfirmClick);
                        });

                        return;
                    }

                    var newScope = $rootScope.$new();
                    newScope.message = attrs.ngHelpMessage;
                    newScope.titleMsg = attrs.ngHelpTitle;

                    var controller = function ($scope, $modalInstance) {
                        $scope.ok = function (result) {
                            $modalInstance.close(result);
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
                        '<div class="modal-body" ng-bind-html="message"></div>' +
                        '<div class="modal-footer">' +
                        '<button class="btn btn-warning" ng-click="cancel()">' +
                        '<span i18n="common.close">' +
                        '</span></button>' +
                        '</div>',
                        controller: controller
                    }).result;
                });
            }
        };
    }
);

