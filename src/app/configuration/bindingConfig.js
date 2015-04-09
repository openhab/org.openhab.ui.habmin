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
    'HABmin.userModel',
    'HABmin.bindingModel',
    'Config.parameter',
    'angular-growl',
    'Binding.config',
    'ngVis',
    'ResizePanel',
    'SidepanelService'
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
    function BindingConfigCtrl($scope, locale, growl, $timeout, $window, $http, $interval, UserService, BindingModel, SidepanelService) {
        $scope.bindings = null;
        $scope.bindingsCnt = -1;
        BindingModel.getList().then(
            function (bindings) {
                $scope.bindings = bindings;
                $scope.bindingsCnt = bindings.length;
            },
            function (reason) {
                // Handle failure
                growl.warning(locale.getString("habmin.mainErrorGettingBindings"));
            }
        );

        $scope.selectBinding = function(binding) {
            $scope.selectedBinding = binding;
        }
    })

;
