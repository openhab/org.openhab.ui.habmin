/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('Config.ItemEdit', [
    'ui.bootstrap',
    'ngSanitize',
    'angular-growl',
    'HABmin.itemModel',
    'HABmin.smarthomeModel',
    'ngLocalize'
])
    .service('itemEdit',
    function ($modal, $rootScope, growl, locale, UserService, ItemModel, SmartHomeModel) {
        this.edit = function (thing, channel, item) {
            var scope = $rootScope.$new();
            scope.item = angular.copy(item);
            scope.itemtypes = SmartHomeModel.itemtypes;
            scope.categories = SmartHomeModel.categories;

            scope.items = [];
            ItemModel.getList().then(
                function (list) {
                    scope.items = list;
                }
            );

            /**
             * Controller functions get called when the modal closes
             * @param $scope
             * @param $modalInstance
             */
            var controller = function ($scope, $modalInstance) {
                $scope.ok = function (result) {
                    if ($scope.item.groupNames != null) {
                        $scope.item.groupNames = [].concat($scope.item.groupNames);
                    }
                    ItemModel.putItem($scope.item).then(
                        function (newItem) {
                            ItemModel.linkItem(thing, channel, newItem).then(
                                function () {
                                    $modalInstance.close($scope.item);
                                },
                                function () {
                                    growl.warning(locale.getString("habmin.itemSaveFailed",
                                        {name: $scope.item.label}));
                                }
                            );
                        },
                        function () {
                            growl.warning(locale.getString("habmin.itemSaveFailed",
                                {name: $scope.item.label}));
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
                templateUrl: 'configuration/itemEdit.tpl.html',
                controller: controller,
                windowClass: UserService.getTheme(),
                scope: scope
            }).result;
        };
    })

;
