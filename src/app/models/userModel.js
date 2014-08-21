/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('HABmin.userModel', [])
    .factory('UserService', function ($http, $rootScope, $cookieStore, $interval) {
        var authenticated = false;

        var userConfig = {
            useCache: false
        };

        // Log us in after 5 seconds
        $interval(function() {
            console.log("Timeout - we're now logged in!");
            authenticated = true;
        }, 5000, 1);

        function changeUser(user) {
        }

        return {
            isLoggedIn: function (user) {
                return authenticated;
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
            },
            userCfg: function() {
                return userConfig;
            }

//            accessLevels: accessLevels,
//            userRoles: userRoles,
//            user: currentUser
        };

    });