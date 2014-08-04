/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copywrite of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('HABmin.auth', [])
    .factory('Authenticate', function ($http, $rootScope, $cookieStore) {

        function changeUser(user) {
        }

        return {
            isLoggedIn: function (user) {
                return false;
            },

            login: function (user, success, error) {
                $http.post('/login', user).success(function (user) {
                    changeUser(user);
                    success(user);
                }).error(error);
            },
            logout: function (success, error) {
                $http.post('/logout').success(function () {
                    changeUser({
//                        username: '',
//                        role: userRoles.public
                    });
                    success();
                }).error(error);
            }

//            accessLevels: accessLevels,
//            userRoles: userRoles,
//            user: currentUser
        };

    });