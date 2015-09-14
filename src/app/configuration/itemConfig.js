/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('Config.Items', [
    'ui.router',
    'ui.bootstrap',
    'ngLocalize',
    'HABmin.userModel',
    'HABmin.itemModel',
    'Config.parameter',
    'angular-growl',
    'Binding.config',
    'ngVis',
    'ResizePanel'
])

    .config(function config($stateProvider) {
        $stateProvider.state('items', {
            url: '/items',
            views: {
                "main": {
                    controller: 'ItemConfigCtrl',
                    templateUrl: 'configuration/itemConfig.tpl.html'
                }
            },
            data: {pageTitle: 'Items'},
            resolve: {
                // Make sure the localisation files are resolved before the controller runs
                localisations: function (locale) {
                    return locale.ready('habmin');
                }
            }
        });
    })

    .controller('ItemConfigCtrl',
    function ItemConfigCtrl($scope, locale, growl, $timeout, $window, $http, $interval, UserService, ItemModel) {
        $scope.items = null;
        $scope.itemsCnt = -1;
        $scope.filterItems = [
            "thing",
            "channel-group"
        ];

        ItemModel.getList().then(
            function (items) {
                $scope.items = items;
                $scope.itemsCnt = items.length;
            },
            function (reason) {
                // Handle failure
                growl.warning(locale.getString("habmin.mainErrorGettingBindings"));
            }
        );

        $scope.selectItem = function (item) {
            $scope.selectedItem = item;
        };

        /**
         * Function to filter items
         * @param element
         * @returns {boolean}
         */
        $scope.filterFunction = function (element) {
            if(element.tags == null) {
                return true;
            }
            for(var c = 0; c < element.tags.length; c++) {
                if ($scope.filterItems.indexOf(element.tags[c]) != -1) {
                    return false;
                }
            }

            return true;
        };

        $scope.getParentThingItem = function(item) {
            return ItemModel.getParentThingItem(item);
        };
    })

;
