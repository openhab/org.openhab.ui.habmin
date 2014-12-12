angular.module('sitemapSelectionWidget', []).directive('sitemapSelection', function () {
  return {
    restrict: 'E',
    template: '<div><span ng-style="labelColor">{{widget.label}}</span><span class="pull-right" ng-style="valueColor">' + '<div class="btn-group">' + '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">' + 'Action <span class="caret"></span>' + '</button>' + '<ul class="dropdown-menu" role="menu">' + '<li><a href="#">Action</a></li>' + '<li><a href="#">Another action</a></li>' + '<li><a href="#">Something else here</a></li>' + '<li class="divider"></li>' + '<li><a href="#">Separated link</a></li>' + '</ul>' + '</div>' + '</span></div>',
    scope: {
      label: '@',
      value: '@'
    },
    link: function ($scope, element, attrs, controller) {
      if (attrs.labelColor != null) {
        $scope.labelColor = { color: attrs.labelColor };
      }
      if (attrs.valueColor) {
        $scope.valueColor = { color: attrs.valueColor };
      }
    }
  };
});