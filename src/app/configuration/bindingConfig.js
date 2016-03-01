/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('Config.Bindings', [
    'ui.router',
    'ui.bootstrap',
    'ngLocalize',
    'HABmin.configModel',
    'HABmin.userModel',
    'HABmin.bindingModel',
    'Config.parameter',
    'angular-growl',
    'Binding.config',
    'ngVis',
    'ResizePanel'
])

    .config(function config($stateProvider) {
        $stateProvider.state('bindings', {
            url: '/bindings',
            views: {
                "main": {
                    controller: 'BindingConfigCtrl',
                    templateUrl: 'configuration/bindingConfig.tpl.html'
                }
            },
            data: {pageTitle: 'Bindings'},
            resolve: {
                // Make sure the localisation files are resolved before the controller runs
                localisations: function (locale) {
                    return locale.ready('habmin');
                }
            }
        });
    })

    .controller('BindingConfigCtrl',
    function BindingConfigCtrl($scope, locale, growl, $timeout, $window, $http, $interval, UserService, BindingModel, ConfigModel) {
        $scope.panelDisplayed = 'DESCRIPTION';
        $scope.bindings = null;
        $scope.bindingsCnt = -1;
        BindingModel.getList().then(
            function (bindings) {
                $scope.bindings = bindings;
                $scope.bindingsCnt = bindings.length;
            },
            function (reason) {
                // Handle failure
                growl.warning(locale.getString("habmin.ErrorGettingBindings"));
            }
        );

        $scope.selectBinding = function (binding) {
            $scope.setPanelDisplayed("DESCRIPTION");
            $scope.selectedBinding = binding;

            if (binding.configDescriptionURI != null) {
                // Get the configuration
                ConfigModel.getConfig(binding.configDescriptionURI).then(
                    function (cfg) {
                        $scope.bindingConfig = cfg;
                    },
                    function () {
                        $scope.bindingConfig = null;
                    }
                );
            }
        };

        $scope.setPanelDisplayed = function (panel) {
            $scope.panelDisplayed = panel;
        };

        $scope.bindingHasUngroupedParams = function () {
            if ($scope.bindingConfig == null || $scope.bindingConfig.parameters == null) {
                return false;
            }

            for (var cnt = 0; cnt < $scope.bindingConfig.parameters.length; cnt++) {
                if ($scope.bindingConfig.parameters[cnt].groupName == null ||
                    $scope.bindingConfig.parameters[cnt].groupName === "" ||
                    $scope.bindingConfig.parameterGroups[$scope.bindingConfig.parameters[cnt].groupName] == null) {
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
                    $scope.bindingConfig.parameterGroups[config.groupName] == null) {
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
