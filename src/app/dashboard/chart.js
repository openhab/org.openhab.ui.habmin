/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('HABmin.chart', [
    'ui.router',
    'placeholders',
    'ui.bootstrap',
    'ngLocalize',
    'angular-growl',
    'HABmin.persistenceModel',
    'dygraphs-directive'
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
            data: { pageTitle: 'Charting' }
        });
    })

    .controller('DashboardChartCtrl',
    function DashboardChartCtrl($scope, locale, PersistenceItemModel, PersistenceServiceModel, PersistenceDataModel, growl) {
        var itemsLoaded = 0;
        var newChart;
        var chartDef;

        var chartData;

        var chartOptions = {
            colors: ["#FF9900", "#33FFFF", "#FFCC00", "#33CCCC"],
            labelsSeparateLines: true,
            connectSeparatedPoints: true
        };


        $scope.itemsTotal = 0;
        $scope.itemsSelected = 0;
        $scope.items = [
            {iconobject: "../images/light_led_stripe_rgb.svg", label: "1"}
        ];
        $scope.services = [];

        // Load the list of items
        PersistenceItemModel.get().then(
            function (items) {
                $scope.items = items;
                if ($scope.items != null) {
                    $scope.itemsTotal = $scope.items.length;
                }
            },
            function (reason) {
                // handle failure
                growl.warning('Hello world ' + reason.message);
            }
        );

        // Load the list of persistence services
        PersistenceServiceModel.query().$promise.then(
            function (data) {
                $scope.services = [].concat(data.services);
                $scope.services[0].selected = true;
                $scope.selectedService = $scope.services[0].name;
            },
            function (reason) {
                // handle failure
                growl.warning('Hello world ' + reason.message);
            }
        );

        $scope.doChart = function () {
            console.log("doChart button clicked");
            var stop = Math.round((new Date()).getTime());
            var start = stop - (86400 * 1000);

            itemsLoaded = 0;
            newChart = [];
            chartDef = {};
            chartDef.items = [];
            chartData = {};
            chartData.opts = chartOptions;
            chartData.opts.labels = [locale.getString('common.time')];

            angular.forEach($scope.items, function (item) {
                if (item.selected === true) {
                    chartDef.items.push(item);
                    _loadItem(item.name, start, stop);
                }
            });
        };

        $scope.selectItem = function (parm) {
            parm.selected = !parm.selected;

            $scope.itemsSelected = 0;
            angular.forEach($scope.items, function (item) {
                if (item.selected === true) {
                    $scope.itemsSelected++;
                }
            });
        };

        $scope.clearList = function () {
            console.log("clearList button clicked");
            $scope.itemsSelected = 0;
            angular.forEach($scope.items, function (item) {
                item.selected = false;
            });
        };

        $scope.selectService = function (sel) {
            angular.forEach($scope.services, function (service) {
                if (service.name == sel.name) {
                    service.selected = true;
                }
                else {
                    service.selected = false;
                }
            });
        };

        $scope.filterDefaultString = locale.getString('common.filter');

        // This is what you will bind the filter to
        $scope.filterText = '';
        $scope.filterFunction = function (element) {
            if ($scope.filterText === "") {
                return true;
            }
            if (element.label == null) {
                return false;
            }
            return element.label.toLowerCase().indexOf($scope.filterText.toLowerCase()) !== -1 ? true : false;
        };

        function _loadItem(itemRef, start, stop) {
            console.log("Requesting ", itemRef);
            var parms = {};
            parms.starttime = start;
            parms.endtime = stop;

            var me = this;

            PersistenceDataModel.get($scope.selectedService, itemRef, start, stop).then(
                function (response) {
                    console.log("The item definition is: ", response);
                    _addChartItem(itemRef, response);
                }
            );
        }

        function _addChartItem(itemRef, data) {
            // Find the chart config for this item
            var itemCfg = null;
            for (var i = 0; i < chartDef.items.length; i++) {
                if (itemRef == chartDef.items[i].name) {
                    itemCfg = chartDef.items[i];
                }
            }

            if (itemCfg == null) {
                console.error("Unable to find definition for ", itemRef, chartDef);
                return;
            }

            // If there's no repeat time, then set it to 'infinity'
            // Otherwise turn into milliseconds
            if (itemCfg.repeatTime == null || itemCfg.repeatTime < 1) {
                itemCfg.repeatTime = 9007199254740000;
            }
            else {
                itemCfg.repeatTime *= 1000;
            }

            console.log("Adding", itemRef, "- repeat is ", itemCfg.repeatTime);

            chartData.opts.labels.push(itemCfg.label);

            console.log("Updating data:", $scope.graph);

            newChart = addSeries(newChart, data);

            /*        if (itemCfg.lineStyle != undefined && itemCfg.lineStyle.length > 0)
             plotOptions.stroke.style = itemCfg.lineStyle;
             if (itemCfg.lineWidth != undefined && itemCfg.lineWidth.length > 0)
             plotOptions.stroke.width = itemCfg.lineWidth;
             if (itemCfg.lineColor != undefined && itemCfg.lineColor.length > 0)
             plotOptions.stroke.color = itemCfg.lineColor;
             console.log("Adding item " + item.name + ":", plotOptions);
             if (itemCfg.label == null)
             this.chart.addSeries(item.name, data, plotOptions);
             else
             this.chart.addSeries(itemCfg.label, data, plotOptions);
             */


            // If everything is loaded, create the legend and render
            itemsLoaded++;
            console.log("Loaded " + itemsLoaded + " of " + $scope.itemsSelected);
            if (itemsLoaded >= $scope.itemsSelected) {
                if (chartDef.title) {
                    chartOptions.title = chartDef.title;
                }

                if(chartDef.axis) {
                    for(var c = 0; c < chartDef.axis.length; c++) {

                    }
                }

                chartData.data = newChart;
                chartData.opts = chartOptions;
                console.log("Rendering chart", chartData);
                $scope.graph = chartData;
            }
        }

        // Sequentially step through the new data and add it to a new array along with the old data
        // TODO: Add the data repeat for new data
        function addSeries(curData, newData) {
            var cntCur = 0;
            var cntNew = 0;
            var output = [];
            var d;

            var len = 0;
            if (curData.length) {
                len = curData[0].length;
            }

            // Process merging of the two data arrays
            while (cntCur < curData.length && cntNew < newData.length) {
                var curTime = curData[cntCur][0].getTime() / 1000 * 1000;
                var newTime = Number(newData[cntNew].time) / 1000 * 1000;
                if (curTime < newTime) {
                    // Existing data is next up
                    // Just copy the existing data and add a null on the end as a placeholder
                    d = curData[cntCur];
                    d.push(null);

                    cntCur++;
                }
                else if (curTime === newTime) {
                    // Data has the same time
                    // Copy the existing data and add the new data to the end
                    d = curData[cntCur];
                    d.push(Number(newData[cntNew].state));

                    cntCur++;
                    cntNew++;
                }
                else {
                    // New data is next up
                    // Set the new time, add nulls as placeholders for the existing data, then add the new data
                    d = [];
                    d[0] = new Date(newTime);
                    for (var c = 1; c < len; c++) {
                        d.push(null);
                    }

                    d.push(Number(newData[cntNew].state));

                    cntNew++;
                }

                output.push(d);
            }

            // Process remaining existing data
            while (cntCur < curData.length) {
                d = curData[cntCur];
                d.push(null);

                cntCur++;
                output.push(d);
            }

            // Process remaining new data
            while (cntNew < newData.length) {
                d = [];
                d[0] = new Date(Number(newData[cntNew].time) / 1000 * 1000);
                for (var b = 1; b < len; b++) {
                    d.push(null);
                }

                d.push(Number(newData[cntNew].state));

                cntNew++;
                output.push(d);
            }

            return output;
        }
    })

    .directive('resizePage', function ($window) {
        return function ($scope, element) {
            var w = angular.element($window);
            $scope.getWindowDimensions = function () {
                return {
                    'h': w.height()
                };
            };
            $scope.$watch($scope.getWindowDimensions, function (newValue, oldValue) {
                $scope.windowHeight = newValue.h;
                $scope.styleList = function () {
                    return {
                        'height': (newValue.h - 210) + 'px'
                    };
                };
                $scope.styleChart = function () {
                    return {
                        'height': (newValue.h - 85) + 'px'
                    };
                };
            }, true);

            w.bind('resize', function () {
                $scope.$apply();
            });
        };
    })

;
