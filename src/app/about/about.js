/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copywrite of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('ngBoilerplate.about', [
    'ui.router',
    'placeholders',
    'ui.bootstrap'
])

    .config(function config($stateProvider) {
        $stateProvider.state('about', {
            url: '/about',
            views: {
                "main": {
                    controller: 'AboutCtrl',
                    templateUrl: 'about/about.tpl.html'
                }
            },
            data: { pageTitle: 'What is It?' }
        });
    })

    .controller('AboutCtrl', function AboutCtrl($scope) {
        // This is simple a demo for UI Boostrap.
        $scope.dropdownDemoItems = [
            "The first choice!",
            "And another choice for you.",
            "but wait! A third!"
        ];
    })

;
