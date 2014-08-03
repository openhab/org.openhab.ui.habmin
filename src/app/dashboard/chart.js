angular.module('HABmin.chart', [
    'ui.router',
    'placeholders',
    'ui.bootstrap',
    'ngLocalize',
    'restangular'
])

    .config(function config($stateProvider) {
        $stateProvider.state('chart', {
            url: '/chart',
            views: {
                "main": {
                    controller: 'DashboardChartCtrl',
                    templateUrl: 'dashboard/chart.tpl.html'
                }
            },
            data: { pageTitle: 'What is It?' }
        });
    })

    .controller('DashboardChartCtrl', function DashboardChartCtrl($scope, locale, Restangular) {
        $scope.itemTotal = 0;
        $scope.itemSelected = 0;

        $scope.items = [];

        var baseAccounts = Restangular.all('services/habmin/persistence/items');

        // This will query /accounts and return a promise.
        baseAccounts.getList().then(function(accounts) {
            $scope.itemTotal = 0;
            accounts.forEach(function(item) {
                item.selected = false;
                $scope.itemTotal++;
            });
            $scope.items = accounts;
        });

        $scope.doChart = function(parm) {
            console.log("doChart button clicked", parm);
        };

        $scope.selectItem = function(parm) {
            parm.selected = !parm.selected;

            $scope.itemSelected = 0;
            $scope.items.forEach(function(item) {
                if(item.selected === true) {
                    $scope.itemSelected++;
                }
            });
        };

        $scope.clearList = function(parm) {
            console.log("clearList button clicked", parm);
            $scope.itemSelected = 0;
            $scope.items.forEach(function(item) {
                item.selected = false;
            });
        };

        $scope.filterDefaultString = locale.getString('common.filter');
    })

    .directive('resize', function ($window) {
        return function ($scope, element) {
            var w =  angular.element($window);
            $scope.getWindowDimensions = function () {
                return {
                    'h': w.height()
                };
            };
            $scope.$watch($scope.getWindowDimensions, function (newValue, oldValue) {
                $scope.windowHeight = newValue.h;
                $scope.style = function () {
                    console.log("Change height");
                    return {
                        'height': (newValue.h - 210) + 'px'
                    };
                };
            }, true);

            w.bind('resize', function () {
                $scope.$apply();
            });
        };
    })
;
