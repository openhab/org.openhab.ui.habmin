/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2016 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('Config.Services', [
    'ui.router',
    'ui.bootstrap',
    'ngLocalize',
    'HABmin.configModel',
    'HABmin.serviceModel',
    'angular-growl',
    'ngInputModified',
    'ResizePanel'
])

    .config(function config($stateProvider) {
        $stateProvider.state('services', {
            url: '/services',
            views: {
                "main": {
                    controller: 'ServicesConfigCtrl',
                    templateUrl: 'configuration/servicesConfig.tpl.html'
                }
            },
            data: {pageTitle: 'Services'},
            resolve: {
                // Make sure the localisation files are resolved before the controller runs
                localisations: function (locale) {
                    return locale.ready('services');
                }
            }
        });
    })

    .controller('ServicesConfigCtrl',
    function ServicesConfigCtrl($scope, $timeout, locale, growl, ServiceModel, ConfigModel) {
        $scope.services = [];
        $scope.serviceTypes = [];
        $scope.typesCnt = -1;
        $scope.servicesCnt = -1;

        ServiceModel.getServices().then(
            function (services) {
                $scope.services = services;
                $scope.servicesCnt = services.length;

                // There's no service type list, so let's make one!
                for (var service in services) {
                    var found = false;
                    for (var serviceType in $scope.serviceTypes) {
                        if ($scope.serviceTypes[serviceType].id == services[service].category) {
                            found = true;
                            break;
                        }
                    }

                    if (found == false) {
                        $scope.serviceTypes.push({
                            id: services[service].category,
                            label: services[service].category.toUpperCase()
                        });
                    }
                }
            },
            function (reason) {
                // Handle failure
                growl.warning(locale.getString("services.ErrorGettingServices"));
            }
        );

        /*
         ServiceModel.getTypes().then(
         function (serviceTypes) {
         $scope.serviceTypes = serviceTypes;
         $scope.typesCnt = serviceTypes.length;
         $scope.selectedType = $scope.serviceTypes[0];
         },
         function (reason) {
         // Handle failure
         growl.warning(locale.getString("services.ErrorGettingServices"));
         }
         );
         */

        $scope.selectService = function (service) {
            $scope.serviceConfig = null;
            $scope.serviceConfiguration = null;
            $scope.selectedService = service;

            $scope.configForm.reset();
            $scope.formLoaded = false;

            if (service.configDescriptionURI != null) {
                // Get the configuration
                ConfigModel.getConfig(service.configDescriptionURI).then(
                    function (cfg) {
                        $scope.serviceConfig = cfg;
                    },
                    function () {
                        $scope.serviceConfig = null;
                    }
                );

                ServiceModel.getServiceConfig(service).then(
                    function (cfg) {
                        $scope.serviceConfiguration = cfg;

                        // Ensure the options are converted to a string for internal processing
                        angular.forEach($scope.serviceConfiguration.parameters, function (parameter) {
                            angular.forEach(parameter.options, function (option) {
                                option.value = option.value.toString();
                            });
                        });

                    },
                    function () {
                    }
                );
            }

            $timeout(function () {
                $scope.configForm.$setPristine();
                $scope.formLoaded = true;
            });
        };

        $scope.configSave = function() {
            var cfgUpdated = false;

            var updatedCfg = {};
            angular.forEach($scope.configForm.modifiedModels, function (model) {
                // Get the configuration description
                for (var cnt = 0; cnt < $scope.serviceConfig.parameters.length; cnt++) {
                    if ($scope.serviceConfig.parameters[cnt].name == model.$name) {
                        updatedCfg[model.$name] =
                            ConfigModel.convertType($scope.serviceConfig.parameters[cnt].type,
                                model.$modelValue,
                                $scope.serviceConfig.parameters[cnt].multiple);
                    }
                }
            });

            ServiceModel.putServiceConfig($scope.selectedService, updatedCfg).then(
                function (cfg) {
                    $scope.configForm.reset();
                },
                function () {
                }
            );
        };

        $scope.hasUngroupedParams = function () {
            if ($scope.serviceConfig == null || $scope.serviceConfig.parameters == null) {
                return false;
            }

            for (var cnt = 0; cnt < $scope.serviceConfig.parameters.length; cnt++) {
                if ($scope.serviceConfig.parameters[cnt].groupName == null ||
                    $scope.serviceConfig.parameters[cnt].groupName === "" ||
                    $scope.serviceConfig.parameterGroups[$scope.serviceConfig.parameters[cnt].groupName] == null) {
                    return true;
                }
            }
        };

        $scope.configGroupFilter = function (config, group) {
            // Sanity check
            if (config == null) {
                return false;
            }

            // Are we looking for ungrouped parameters
            if (group == null) {
                if (config.groupName == null || config.groupName === "" ||
                    $scope.serviceConfig.parameterGroups[config.groupName] == null) {
                    return true;
                }
                return false;
            }

            if (config.groupName == group) {
                return true;
            }

            return false;
        };
    })

;
