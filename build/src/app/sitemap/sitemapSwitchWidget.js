angular.module('sitemapSwitchWidget', [
  'HABmin.iconModel',
  'toggle-switch'
]).directive('sitemapSwitch', [
  'ImgFactory',
  function (ImgFactory) {
    return {
      restrict: 'E',
      template: '<habmin-icon class="icon-lg" icon="{{widget.icon}}"></habmin-icon>' + '<span class="sitemap-item-text"><span ng-style="labelColor">{{widget.label}}</span>' + '<span class="pull-right" ng-style="valueColor"></span></span>' + '<span class="pull-right"><toggle-switch model="value" on-label="ON" off-label="OFF"></toggle-switch></span>',
      scope: {
        itemModel: '=',
        widget: '='
      },
      link: function ($scope, element, attrs, controller) {
        if ($scope.widget === undefined) {
          return;
        }
        $scope.$on('habminGUIRefresh', function (newValue, oldValue) {
          updateWidget();
          $scope.$apply();
        });
        if ($scope.widget.item !== undefined) {
          $scope.$watch('value', function (newValue, oldValue) {
            if (newValue != $scope.currentValue) {
              $scope.currentValue = newValue;
              $scope.$emit('habminGUIUpdate', $scope.widget.item.name, $scope.currentValue === true ? 'ON' : 'OFF');
            }
          });
        }
        updateWidget();
        function updateWidget() {
          if ($scope.widget.item !== undefined) {
            switch ($scope.widget.item.type) {
            case 'DimmerItem':
              if (parseInt($scope.widget.item.state, 10) > 0) {
                $scope.value = true;
              } else {
                $scope.value = false;
              }
              break;
            case 'SwitchItem':
              if ($scope.widget.item.state == 'ON') {
                $scope.value = true;
              } else {
                $scope.value = false;
              }
              break;
            }
          }
          if ($scope.widget.labelcolor != null) {
            $scope.labelColor = { color: $scope.widget.labelcolor };
          }
          if ($scope.widget.valuecolor) {
            $scope.valueColor = { color: $scope.widget.valuecolor };
          }
          $scope.currentValue = $scope.value;
        }
      }
    };
  }
]);