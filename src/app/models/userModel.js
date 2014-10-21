/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('HABmin.userModel', [
    'http-auth-interceptor',
    'base64'
])
    .factory('UserService', function ($http, $rootScope, $cookieStore, $interval) {
        // Install handlers to catch authorisation failures
        $rootScope.$on('event:auth-loginRequired', function () {
            console.log("Login required");


//            $http.defaults.headers.common['Authorization'] = 'Basic Y2hyaXM6aGVsbG8=';
//            authService.loginConfirmed(null, function(config) {
            //              $http.defaults.headers.common['Authorization'] = 'Basic Y2hyaXM6aGVsbG8=';
//                return config;
            //        });
        });
        $rootScope.$on('event:auth-loginConfirmed', function () {
            console.log("Login complete");
        });

        // On startup, check the local storage to see if we've got saved info here
        var storedPass = localStorage.getItem('Auth-pass');
        var storedTime = localStorage.getItem('Auth-time');

        if(storedTime > new Date().getTime()) {
            console.log("Using saved authentication data!");
            $http.defaults.headers.common['Authorization'] = 'Basic Y2hyaXM6aGVsbG8=';

        }
        else {
            console.log("Removing saved authentication data!");
            // Timeout - remove the password etc.
            localStorage.removeItem('Auth-pass');
            localStorage.removeItem('Auth-time');

            // Reset the authentication header
            $http.defaults.headers.common['Authorization'] = '';
        }

        var authenticated = false;

        var userConfig = {
            useCache: false
        };

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
                authenticated = false;
                userConfig = {};

//                $http.post('/logout').success(function () {
//                    changeUser({
//                        username: '',
//                        role: userRoles.public
//                    });
//                    success();
//                }).error(error);
            },
            userCfg: function() {
                return userConfig;
            }

//            accessLevels: accessLevels,
//            userRoles: userRoles,
//            user: currentUser
        };
    })

    .directive('loginHandler', function() {
        return {
            restrict: 'C',
            link: function(scope, elem, attrs) {
                var login = elem.find('#login-holder');
                var main = elem.find('#content');

                login.hide();

                scope.$on('event:auth-loginRequired', function() {
                    login.slideDown('slow', function() {
                        main.hide();
                    });
                });
                scope.$on('event:auth-loginConfirmed', function() {
                    main.show();
                    login.slideUp();
                });
            }
        };
    })

    .controller('LoginController', function ($scope, $http, authService, $base64) {
        $scope.submit = function() {
            var pass = $base64.encode( $scope.user + ':' + $scope.password);
            console.log($scope.password, $scope.user, pass);
            $http.defaults.headers.common['Authorization'] = 'Basic ' + pass;

            localStorage.setItem('Auth-user', $scope.user);
            localStorage.setItem('Auth-pass', pass);

            authService.loginConfirmed(null, function(config) {
                config.headers['Authorization'] = 'Basic ' + pass;
                return config;
            });

//            $http.post('auth/login').success(function() {
             //   authService.loginConfirmed();
  //          });
        };
    })
;