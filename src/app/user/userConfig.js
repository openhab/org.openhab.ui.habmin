/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('User.Config', [
    'ui.router',
    'ui.bootstrap',
    'ngLocalize',
    'HABmin.userModel',
    'angular-growl',
    'ResizePanel',
    'showOverflow',
    'ngHelpDialog',
    'ngInputModified'
])

    .config(function config($stateProvider) {
        $stateProvider.state('user', {
            url: '/user',
            views: {
                "main": {
                    controller: 'UserConfigCtrl',
                    templateUrl: 'user/userConfig.tpl.html'
                }
            },
            data: {pageTitle: 'User Configuration'},
            resolve: {
                // Make sure the localisation files are resolved before the controller runs
                localisations: function ($q, locale) {
                    return $q.all([
                        locale.ready('habmin')
                    ]);
                }
            }
        });
    })

    .controller('UserConfigCtrl',
    function ($scope, $q, locale, growl, $timeout, $window, $http, $interval, UserService, localeSupported) {
        $scope.panelDisplayed = 'GENERAL';

        $scope.model = {currentLanguage: UserService.getLanguage()};
        $scope.languages = [];
        var languageOk = false;
        angular.forEach(localeSupported, function (loc, key) {
            $scope.languages.push({
                id: key,
                flag: key.split('-')[1].toLowerCase(),
                name: loc.name,
                desc: loc.desc
            });

            if (key == $scope.model.currentLanguage) {
                languageOk = true;
            }
        });

        if (languageOk == false) {
            $scope.model.currentLanguage = "en-GB";
        }

        $scope.setPanelDisplayed = function (panel) {
            $scope.panelDisplayed = panel;
        };

        $scope.saveConfig = function () {
            UserService.setLanguage($scope.model.currentLanguage);
            $scope.userConfigForm.$setPristine();
        };

        $timeout(function () {
            $scope.userConfigForm.$setPristine();
        });

    }
);