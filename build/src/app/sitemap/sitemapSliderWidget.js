angular.module('sitemapSliderWidget', [
  'HABmin.iconModel',
  'toggle-switch'
]).directive('sitemapSlider', [
  '$interval',
  'ImgFactory',
  function ($interval, ImgFactory) {
    return {
      restrict: 'E',
      template: '<habmin-icon class="icon-lg" icon="{{widget.icon}}"></habmin-icon>' + '<span class="sitemap-item-text"><span ng-style="labelColor">{{widget.label}}</span>' + '<span class="pull-right" ng-style="valueColor">{{widget.value}}&nbsp</span></span>' + '<span class="pull-right"><toggle-switch ng-show="showSwitch" model="switchValue" on-label="ON" off-label="OFF"></toggle-switch></span>' + '<div range-slider min="0" max="100" show-values="false" pin-handle="min" model-max="sliderValue"></div>',
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
        var timer;
        function stopTimer() {
          if (angular.isDefined(timer)) {
            $interval.cancel(timer);
            timer = undefined;
            console.log('Timer stopped');
          }
        }
        if ($scope.widget.item !== undefined) {
          $scope.$on('$destroy', function () {
            $scope.stopTimer();
          });
          $scope.$watch('sliderValue', function (newValue, oldValue) {
            if (newValue != $scope.currentSliderValue) {
              $scope.currentSliderValue = newValue;
              if (!angular.isDefined(timer)) {
                $scope.$emit('habminGUIUpdate', $scope.widget.item.name, $scope.currentSliderValue);
                var latestSliderValue = $scope.currentSliderValue;
                timer = $interval(function () {
                  if ($scope.currentSliderValue != latestSliderValue) {
                    latestSliderValue = $scope.currentSliderValue;
                    $scope.$emit('habminGUIUpdate', $scope.widget.item.name, $scope.currentSliderValue);
                  } else {
                    stopTimer();
                  }
                }, 400);
              }
            }
          });
          $scope.$watch('switchValue', function (newValue, oldValue) {
            console.log('SLIDER: Changed switch', $scope.widget.label, newValue, oldValue);
            if (newValue != $scope.currentSwitchValue) {
              $scope.currentSwitchValue = newValue;
              $scope.$emit('habminGUIUpdate', $scope.widget.item.name, $scope.currentSwitchValue === true ? 'ON' : 'OFF');
            }
          });
          $scope.$watch('value', function (newValue, oldValue) {
          });
        }
        updateWidget();
        function updateWidget() {
          if ($scope.widget.item !== undefined) {
            switch ($scope.widget.item.type) {
            case 'DimmerItem':
              if (parseInt($scope.widget.item.state, 10) > 0) {
                $scope.switchValue = true;
                $scope.sliderValue = parseInt($scope.widget.item.state, 10);
              } else {
                $scope.switchValue = false;
                $scope.sliderValue = 0;
              }
              break;
            case 'SwitchItem':
              if ($scope.widget.item.state == 'ON') {
                $scope.switchValue = true;
                $scope.sliderValue = 100;
              } else {
                $scope.switchValue = false;
                $scope.sliderValue = 0;
              }
              break;
            }
          }
          $scope.showSwitch = $scope.widget.switchSupport;
          if ($scope.widget.labelcolor != null) {
            $scope.labelColor = { color: $scope.widget.labelcolor };
          }
          if ($scope.widget.valuecolor) {
            $scope.valueColor = { color: $scope.widget.valuecolor };
          }
          $scope.currentSwitchValue = $scope.switchValue;
          $scope.currentSliderValue = $scope.sliderValue;
        }
      }
    };
  }
]);
;