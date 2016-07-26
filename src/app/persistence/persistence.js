/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2016 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('Config.Persistence', [
    'ui.router',
    'ui.bootstrap',
    'ngLocalize',
    'HABmin.persistenceModel',
    'angular-growl',
    'ResizePanel',
    "xeditable"
])

    .config(function config($stateProvider) {
        $stateProvider.state('persistence', {
            url: '/persistence',
            views: {
                "main": {
                    controller: 'PersistenceCtrl',
                    templateUrl: 'persistence/persistence.tpl.html'
                }
            },
            data: {pageTitle: 'Persistence'},
            resolve: {
                // Make sure the localisation files are resolved before the controller runs
                localisations: function ($q, locale) {
                    return $q.all([
                        locale.ready('habmin'),
                        locale.ready('persistence')
                    ]);
                }
            }
        });
    })

    .controller('PersistenceCtrl',
    function PersistenceCtrl($scope, locale, growl, $timeout, $window, $http, $interval, UserService, PersistenceServiceModel, PersistenceDataModel) {
        $scope.selectedService = null;

        $scope.items = [];
        $scope.services = [];

        $scope.pageSize = 100;
        $scope.maxSize = 8;
        $scope.totalItems = 0;
        $scope.currentPage = 1;

        // Load the list of persistence services
        PersistenceServiceModel.getList().then(
            function (data) {
                $scope.services = data;
                $scope.selectedService = null;

                for(var c = 0; c < data.length; c++) {
                    if(data[c].name == UserService.getPersistence()) {
                        $scope.selectedService = data[c];
                        break;
                    }
                }

                if ($scope.selectedService == null && $scope.services.length > 0) {
                    // Use the first service as the default if there isn't a default set
                    $scope.selectedService = $scope.services[0];
                }

                if($scope.selectedService != null) {
                    $scope.selectService($scope.selectedService);
                }
            },
            function (reason) {
                // handle failure
                growl.warning(locale.getString('persistence.ErrorGettingServices'));
            }
        );

        $scope.selectService = function(service) {
            $scope.selectedService = service;
            $scope.items = [];
            $scope.dataPage = [];
            if(service.classname == "ModifiablePersistenceService") {
                $scope.serviceEditable = true;
            }
            else {
                $scope.serviceEditable = false;
            }
            PersistenceServiceModel.getItems($scope.selectedService.name).then(
                function (items) {
                    $scope.items = items;
                },
                function (reason) {
                    // Handle failure
                    growl.warning(locale.getString("persistence.ErrorGettingItems"));
                }
            );
        };

        $scope.selectPage = function() {
            PersistenceDataModel.get($scope.selectedService.name, $scope.selectedItem.name, "1980-01-01T00:00:00Z", "2035-01-01T00:00:00Z", $scope.currentPage-1, $scope.pageSize).then(
                function (data) {
                    $scope.dataPage = data;
                },
                function (reason) {
                    growl.warning(locale.getString("persistence.ErrorGettingData"));
                }
            )
        };

        $scope.selectItem = function (item) {
            $scope.selectedItem = item;
            $scope.currentPage = 1;
            $scope.totalItems = item.count;

            $scope.selectPage();
        };

        $scope.removeRecord = function(recordTime) {
            var date = new moment(recordTime).toISOString();
            PersistenceServiceModel.deleteData($scope.selectedService.name, $scope.selectedItem.name, date, date)
        };

        $scope.updateRecord = function(recordTime, value) {
            var date = new moment(recordTime).toISOString();
            PersistenceServiceModel.putData($scope.selectedService.name, $scope.selectedItem.name, date, value)
        };
    })
;
