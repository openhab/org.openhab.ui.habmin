angular.module('HABmin.userModel', [
  'http-auth-interceptor',
  'base64'
]).factory('UserService', [
  '$http',
  '$rootScope',
  '$cookieStore',
  '$interval',
  function ($http, $rootScope, $cookieStore, $interval) {
    var authenticated = false;
    $rootScope.$on('event:auth-loginConfirmed', function () {
      console.log('Login complete');
      authenticated = true;
    });
    var storedPass = localStorage.getItem('Auth-pass');
    var storedTime = localStorage.getItem('Auth-time');
    if (storedTime > new Date().getTime()) {
      console.log('Using saved authentication data!');
      $http.defaults.headers.common['Authorization'] = 'Basic ' + storedPass;
      authenticated = true;
    } else {
      console.log('Removing saved authentication data!');
      localStorage.removeItem('Auth-pass');
      localStorage.removeItem('Auth-time');
      $http.defaults.headers.common['Authorization'] = '';
    }
    var userConfig = { useCache: false };
    function changeUser(user) {
    }
    return {
      isLoggedIn: function (user) {
        return authenticated;
      },
      login: function (user, success, error) {
      },
      logout: function (success, error) {
        $http.defaults.headers.common['Authorization'] = '';
        authenticated = false;
        userConfig = {};
        localStorage.removeItem('Auth-pass');
        localStorage.removeItem('Auth-time');
      },
      userCfg: function () {
        return userConfig;
      }
    };
  }
]).directive('loginHandler', function () {
  return {
    restrict: 'C',
    link: function (scope, elem, attrs) {
      var login = elem.find('#login-holder');
      var main = elem.find('#content');
      login.hide();
      scope.$on('event:auth-loginRequired', function () {
        login.slideDown('slow', function () {
          main.hide();
        });
      });
      scope.$on('event:auth-loginConfirmed', function () {
        main.show();
        login.slideUp();
      });
    }
  };
}).controller('LoginController', [
  '$scope',
  '$http',
  'authService',
  '$base64',
  function ($scope, $http, authService, $base64) {
    $scope.user = localStorage.getItem('Auth-user');
    $scope.period = localStorage.getItem('Auth-period');
    if ($scope.period == null) {
      $scope.period = 3600;
    }
    $scope.submit = function () {
      var pass = $base64.encode($scope.user + ':' + $scope.password);
      console.log($scope.password, $scope.user, pass);
      $http.defaults.headers.common['Authorization'] = 'Basic ' + pass;
      localStorage.setItem('Auth-user', $scope.user);
      localStorage.setItem('Auth-pass', pass);
      localStorage.setItem('Auth-time', $scope.period * 1000 + new Date().getTime());
      localStorage.setItem('Auth-period', $scope.period);
      authService.loginConfirmed(null, function (config) {
        config.headers['Authorization'] = 'Basic ' + pass;
        return config;
      });
    };
  }
]);
;