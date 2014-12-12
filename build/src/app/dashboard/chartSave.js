angular.module('HABmin.chartSave', [
  'ui.bootstrap',
  'pickAColor',
  'HABmin.chartModel',
  'ngSanitize',
  'angular-growl',
  'ngLocalize'
]).service('ChartSave', [
  '$modal',
  '$rootScope',
  'ChartListModel',
  'growl',
  'locale',
  function ($modal, $rootScope, ChartListModel, growl, locale) {
    this.editChart = function (chartId) {
      var me = this;
      ChartListModel.getChart(chartId).then(function (chart) {
        me.saveChart(chart);
      });
    };
    this.saveChart = function (chart) {
      var scope = $rootScope.$new();
      scope.showTab = 0;
      scope.general = {
        name: chart.name,
        title: chart.title,
        icon: chart.icon,
        period: chart.period
      };
      scope.leftaxis = {};
      scope.rightaxis = {};
      if (chart.axis !== undefined) {
        angular.forEach([].concat(chart.axis), function (axis) {
          if (axis == null) {
            return;
          }
          switch (axis.position) {
          case 'left':
            scope.leftaxis = {
              label: axis.label,
              format: Number(axis.format),
              textColor: axis.color,
              minimum: Number(axis.minimum),
              maximum: Number(axis.maximum),
              lineStyle: axis.lineStyle
            };
            break;
          case 'right':
            scope.rightaxis = {
              label: axis.label,
              format: Number(axis.format),
              textColor: axis.color,
              minimum: Number(axis.minimum),
              maximum: Number(axis.maximum),
              lineStyle: axis.lineStyle
            };
            break;
          }
        });
      }
      if (chart.items !== undefined) {
        scope.items = [];
        angular.forEach([].concat(chart.items), function (item) {
          var itemModel = {};
          if (item.axis !== undefined && item.axis.toLowerCase() === 'right') {
            itemModel.axis = 'right';
          } else {
            itemModel.axis = 'left';
          }
          itemModel.item = item.item;
          itemModel.label = item.label;
          itemModel.format = item.format;
          itemModel.fill = item.fill;
          itemModel.fillColor = item.fillColor;
          itemModel.lineColor = item.lineColor;
          itemModel.lineStyle = item.lineStyle;
          itemModel.lineWidth = Number(item.lineWidth);
          itemModel.repeatTime = Number(item.repeatTime);
          itemModel.points = Number(item.points);
          itemModel.pointsSize = Number(item.pointsSize);
          scope.items.push(itemModel);
        });
      }
      var controller = function ($scope, $modalInstance) {
        $scope.ok = function (result) {
          var query = {};
          query.id = chart.id;
          query.name = scope.general.name;
          if (scope.general.title !== undefined) {
            query.title = scope.general.title;
          }
          query.icon = scope.general.icon;
          query.period = scope.general.period;
          query.axis = [];
          if (scope.leftaxis !== undefined) {
            var leftAxis = { position: 'left' };
            if (scope.leftaxis.label !== undefined) {
              leftAxis.label = scope.leftaxis.label;
            }
            if (scope.leftaxis.textColor !== undefined) {
              leftAxis.color = scope.leftaxis.textColor;
            }
            if (!isNaN(scope.leftaxis.format)) {
              leftAxis.format = scope.leftaxis.format;
            }
            if (!isNaN(scope.leftaxis.minimum)) {
              leftAxis.minimum = scope.leftaxis.minimum;
            }
            if (!isNaN(scope.leftaxis.maximum)) {
              leftAxis.maximum = scope.leftaxis.maximum;
            }
            if (scope.leftaxis.lineStyle !== undefined) {
              leftAxis.lineStyle = scope.leftaxis.lineStyle;
            }
            query.axis.push(leftAxis);
          }
          if (scope.rightaxis !== undefined) {
            var rightAxis = { position: 'right' };
            if (scope.rightaxis.label !== undefined) {
              rightAxis.label = scope.rightaxis.label;
            }
            if (scope.rightaxis.textColor !== undefined) {
              rightAxis.color = scope.rightaxis.textColor;
            }
            if (!isNaN(scope.rightaxis.format)) {
              rightAxis.format = scope.rightaxis.format;
            }
            if (!isNaN(scope.rightaxis.minimum)) {
              rightAxis.minimum = scope.rightaxis.minimum;
            }
            if (!isNaN(scope.rightaxis.maximum)) {
              rightAxis.maximum = scope.rightaxis.maximum;
            }
            if (scope.rightaxis.lineStyle !== undefined) {
              rightAxis.lineStyle = scope.rightaxis.lineStyle;
            }
            query.axis.push(rightAxis);
          }
          if (scope.items !== undefined) {
            query.items = [];
            angular.forEach([].concat(scope.items), function (item) {
              var newItem = {};
              newItem.item = item.item;
              if (item.label !== undefined) {
                newItem.label = item.label;
              }
              if (item.lineColor !== undefined) {
                newItem.lineColor = item.lineColor;
              }
              if (item.lineStyle !== undefined) {
                newItem.lineStyle = item.lineStyle;
              }
              if (item.lineWidth !== undefined) {
                newItem.lineWidth = item.lineWidth;
              }
              if (!isNaN(item.repeatTime)) {
                newItem.repeatTime = item.repeatTime;
              }
              if (item.axis !== undefined) {
                newItem.axis = item.axis;
              }
              if (item.fill !== undefined) {
                newItem.fill = item.fill;
              }
              if (item.fillColor !== undefined) {
                newItem.fillColor = item.fillColor;
              }
              if (item.points !== undefined) {
                newItem.points = item.points;
              }
              if (item.pointsSize !== undefined) {
                newItem.pointsSize = item.pointsSize;
              }
              query.items.push(newItem);
            });
          }
          console.log('Saving query', query);
          ChartListModel.putChart(query).then(function () {
            growl.success(locale.getString('habmin.chartSaveSuccess', query.name));
          }, function (error) {
            growl.warning(locale.getString('habmin.chartSaveError', query.name, error));
          });
          $modalInstance.close(result);
        };
        $scope.cancel = function (result) {
          $modalInstance.dismiss('cancel');
        };
      };
      return $modal.open({
        backdrop: 'static',
        keyboard: true,
        modalFade: true,
        size: 'lg',
        templateUrl: 'dashboard/chartSave.tpl.html',
        controller: controller,
        scope: scope
      }).result;
    };
  }
]).directive('chartSaveGeneral', [
  '$window',
  function ($window) {
    return {
      restrict: 'E',
      scope: { model: '=' },
      templateUrl: 'dashboard/chartSaveGeneral.tpl.html',
      link: function ($scope, $element, $state) {
      }
    };
  }
]).directive('chartSaveItem', [
  '$window',
  function ($window) {
    return {
      restrict: 'E',
      scope: { model: '=' },
      templateUrl: 'dashboard/chartSaveItem.tpl.html',
      link: function ($scope, $element, $state) {
      }
    };
  }
]).directive('chartSaveAxis', [
  '$window',
  function ($window) {
    return {
      restrict: 'E',
      scope: { model: '=' },
      templateUrl: 'dashboard/chartSaveAxis.tpl.html',
      link: function ($scope, $element, $state) {
      }
    };
  }
]).directive('selectLineStyle', [
  '$window',
  '$sce',
  function ($window, $sce) {
    return {
      restrict: 'E',
      scope: { ngModel: '=' },
      template: '' + '<div class="line-selector dropdown"><a class="dropdown-toggle" data-toggle="dropdown">' + '<span class="selected" ng-bind-html="getSelected()">' + '</span>' + '</a>' + '<ul class="dropdown-menu" role="menu">' + '<li ng-repeat="choice in styles"><a ng-click="setStyle(choice)">' + '<span ng-bind-html="getStyle(choice)"></span>' + '</a></li>' + '</ul>' + '</div>',
      link: function ($scope, $element, $state) {
        $scope.styles = [
          {
            name: 'Solid',
            array: [
              5,
              0
            ]
          },
          {
            name: 'ShortDash',
            array: [
              7,
              3
            ]
          },
          {
            name: 'ShortDot',
            array: [
              3,
              3
            ]
          },
          {
            name: 'ShortDashDot',
            array: [
              7,
              3,
              3,
              3
            ]
          },
          {
            name: 'ShortDashDotDot',
            array: [
              7,
              3,
              3,
              3,
              3,
              3
            ]
          },
          {
            name: 'Dot',
            array: [
              3,
              7
            ]
          },
          {
            name: 'Dash',
            array: [
              10,
              7
            ]
          },
          {
            name: 'LongDash',
            array: [
              20,
              7
            ]
          },
          {
            name: 'DashDot',
            array: [
              10,
              7,
              3,
              7
            ]
          },
          {
            name: 'LongDashDot',
            array: [
              20,
              7,
              3,
              7
            ]
          },
          {
            name: 'LongDashDotDot',
            array: [
              20,
              7,
              3,
              7,
              3,
              7
            ]
          }
        ];
        $scope.selected = $scope.styles[0];
        if ($scope.ngModel !== undefined) {
          var val = $scope.ngModel.toLowerCase();
          angular.forEach($scope.styles, function (style) {
            if (style.name.toLowerCase() === val) {
              $scope.selected = style;
            }
          });
        }
        $scope.getStyle = function (style) {
          return $sce.trustAsHtml('<svg width="100%" height="10px"><line x1="0" x2="426" y1="5" y2="5" stroke-width="2" stroke-linecap="butt" stroke-dasharray="' + style.array.join(',') + '"/></svg>');
        };
        $scope.setStyle = function (style) {
          $scope.selected = style;
          $scope.ngModel = style.name;
        };
        $scope.getSelected = function () {
          return $sce.trustAsHtml('<svg width="100%" height="10px"><line x1="0" x2="426" y1="5" y2="5" stroke-width="2" stroke-linecap="butt" stroke-dasharray="' + $scope.selected.array.join(',') + '"/></svg>');
        };
      }
    };
  }
]);
;