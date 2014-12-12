angular.module('ngCron', ['ui.bootstrap']).directive('ngCron', [
  '$window',
  '$modal',
  '$rootScope',
  '$timeout',
  function ($window, $modal, $rootScope, $timeout) {
    return {
      restrict: 'E',
      link: function (scope, element, attrs) {
      }
    };
  }
]);