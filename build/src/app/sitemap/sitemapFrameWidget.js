angular.module('sitemapFrameWidget', []).directive('sitemapFrame', function () {
  return {
    restrict: 'E',
    transclude: true,
    template: '<div class="col-md-4">' + '<div class="sitemap-frame-title">' + '<habmin-icon class="icon-lg" icon="{{widget.icon}}"></habmin-icon>' + '<span ng-style="labelColor">{{widget.label}}</span>' + '<span class="pull-right" ng-style="valueColor"></span>' + '</div><div class="sitemap-frame" ng-transclude></div></div>',
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
});