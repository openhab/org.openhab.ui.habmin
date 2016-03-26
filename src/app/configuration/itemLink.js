/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('Config.ItemLink', [
    'ui.bootstrap',
    'ngSanitize',
    'angular-growl',
    'HABmin.itemModel',
    'ngLocalize'
])
    .service('itemLink',
    function ($modal, $rootScope, growl, locale, UserService, ItemModel, SmartHomeModel) {
        this.edit = function (channel) {
            var scope = $rootScope.$new();
            scope.result = {name: ""};
            ItemModel.getList().then(function (list) {
                scope.items = list
            });

            /**
             * Controller functions get called when the modal closes
             * @param $scope
             * @param $modalInstance
             */
            var controller = function ($scope, $modalInstance) {
                $scope.ok = function (result) {
                    ItemModel.linkItem(channel, scope.result).then(
                        function () {
                            $modalInstance.close($scope.item);
                            growl.success(locale.getString("item.SaveOk",
                                {name: $scope.item.name}));
                        },
                        function (response) {
                            var msg;
                            if (response != null && response.error != null) {
                                msg = response.error.message;
                            }
                            else {
                                msg = locale.getString("common.noResponse");
                            }
                            growl.warning(locale.getString("item.SaveLinkFailed",
                                {name: $scope.item.label, message: msg}));
                        }
                    );
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
                templateUrl: 'configuration/itemLink.tpl.html',
                controller: controller,
                windowClass: UserService.getTheme(),
                scope: scope
            }).result;
        };
    })

;
