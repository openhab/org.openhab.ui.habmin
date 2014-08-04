/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copywrite of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('HABmin.login', ['ngAnimate'])

    .controller('FormCtrl', ['$scope', function ($scope) {
        // hide error messages until 'submit' event
        $scope.submitted = false;
        // hide success message
        $scope.showMessage = false;
        // method called from shakeThat directive
        $scope.submit = function () {
            // show success message
            $scope.showMessage = true;
        };
    }])

    .directive('shakeThat', ['$animate', function ($animate) {
        return {
            require: '^form',
            scope: {
                submit: '&',
                submitted: '='
            },
            link: function (scope, element, attrs, form) {
                // listen on submit event
                element.on('submit', function () {
                    // tell angular to update scope
                    scope.$apply(function () {
                        // everything ok -> call submit fn from controller
                        if (form.$valid) {
                            return scope.submit();
                        }

                        // show error messages on submit
                        scope.submitted = true;
                        // shake that form
                        $animate.addClass(element, 'shake', function () {
                            $animate.removeClass(element, 'shake');
                        });
                    });
                });
            }
        };
    }]);
