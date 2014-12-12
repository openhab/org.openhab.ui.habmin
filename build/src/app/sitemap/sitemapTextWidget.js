angular.module('sitemapTextWidget', ['HABmin.iconModel']).directive('sitemapText', [
  'ImgFactory',
  function (ImgFactory) {
    return {
      restrict: 'E',
      template: '<habmin-icon class="icon-lg" icon="{{widget.icon}}"></habmin-icon>' + '<span ng-style="labelColor">{{widget.label}}</span>' + '<span class="pull-right" ng-style="valueColor">{{widget.value}}</span>',
      scope: {
        itemModel: '=',
        widget: '='
      },
      link: function ($scope, element, attrs, controller) {
        if ($scope.widget.labelcolor != null) {
          $scope.labelColor = { color: $scope.widget.labelcolor };
        }
        if ($scope.widget.valuecolor) {
          $scope.valueColor = { color: $scope.widget.valuecolor };
        }
      }
    };
  }
]);