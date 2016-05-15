/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2016 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('Config.Extensions', [
    'ui.router',
    'ui.bootstrap',
    'ngLocalize',
    'HABmin.userModel',
    'HABmin.extensionModel',
    'Config.parameter',
    'angular-growl',
    'ngVis',
    'ResizePanel'
])

    .config(function config($stateProvider) {
        $stateProvider.state('extensions', {
            url: '/extensions',
            views: {
                "main": {
                    controller: 'ExtensionsConfigCtrl',
                    templateUrl: 'configuration/extensionsConfig.tpl.html'
                }
            },
            data: {pageTitle: 'Extensions'},
            resolve: {
                // Make sure the localisation files are resolved before the controller runs
                localisations: function (locale) {
                    return locale.ready('habmin');
                }
            }
        });
    })

    .controller('ExtensionsConfigCtrl',
    function BindingConfigCtrl($scope, locale, growl, $timeout, $window, $http, $interval, UserService, ExtensionModel) {
        $scope.panelDisplayed = 'DESCRIPTION';
        $scope.extensionTypes = null;
        $scope.bindingsCnt = -1;

        ExtensionModel.getTypes().then(
            function (extensionTypes) {
                $scope.extensionTypes = extensionTypes;
                $scope.typesCnt = extensionTypes.length;
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


    })

;
