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
    'ui.bootstrap',
    'ngLocalize',
    'angular-growl',
    'HABmin.persistenceModel',
    'HABmin.chartModel',
    'HABmin.chartSave',
    'HABmin.iconModel',
    'ngVis',
    'ngConfirmClick'
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
            data: { pageTitle: 'Charting' },
            resolve: {
                // Make sure the localisation files are resolved before the controller runs
                localisations: function (locale) {
                    return locale.ready('common');
                }
            }
        });
    })

    .controller('DashboardChartCtrl',
    function DashboardChartCtrl($scope, $modal, locale, PersistenceItemModel, PersistenceServiceModel, PersistenceDataModel, ChartListModel, ChartSave, growl) {
        var itemsLoaded = 0;
        var itemsLoading = 0;
        var newChart;
        var chartDef;

        var chartData;
        var roundingTime = 1000;

        var groups;
        var groupCnt;

        var lineStyles = {
            solid: [5, 0],
            shortdash: [7, 3],
            shortdot: [3, 3],
            shortdashdot: [7, 3, 3, 3],
            shortdashdotdot: [7, 3, 3, 3, 3, 3],
            dot: [3, 7],
            dash: [10, 7],
            longdash: [20, 7],
            dashdot: [10, 7, 3, 7],
            longdashdot: [20, 7, 3, 7],
            longdashdotdot: [20, 7, 3, 7, 3, 7]
        };

        var visoptions = {
//            align: 'center', // left | right (String)
//            autoResize: true, // false (Boolean)
//            editable: true,
//            selectable: true,
            // start: null,
            // end: null,
            height: '100%',
            width: '100%',
            // margin: {
            //   axis: 20,
            //   item: 10
            // },
            // min: null,
            // max: null,
            // maxHeight: null,
//            orientation: 'bottom',
//            padding: 5,
//            legend: {left:{position:"bottom-left"}},
            dataAxis: {
                icons:true,
                showMajorLabels: true,
                showMinorLabels: false
            },
            showCurrentTime: false,
 //           showCustomTime: true,
            // type: 'box', // dot | point
            zoomMin: 60000
            // zoomMax: 1000 * 60 * 60 * 24 * 30 * 12 * 10,
            // groupOrder: 'content'
        };

        $scope.graphLoaded = false;

        $scope.selectCharts = true;
        $scope.selectedChart = undefined;

        $scope.chartsTotal = -1;
        $scope.charts = [];

        $scope.itemsTotal = -1;
        $scope.itemsSelected = 0;
        $scope.items = [];
        $scope.services = [];

        // ------------------------------------------------
        // Load model data

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
                growl.warning(locale.getString('habmin.chartErrorGettingItems'));
            }
        );

        // Load the list of charts
        ChartListModel.getList().then(
            function (charts) {
                $scope.charts = charts;
                if ($scope.charts != null) {
                    $scope.chartsTotal = $scope.charts.length;
                }
            },
            function (reason) {
                // handle failure
                growl.warning(locale.getString('habmin.chartErrorGettingCharts'));
                $scope.chartsTotal = 0;
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
                growl.warning(locale.getString('habmin.chartErrorGettingServices'));
            }
        );

        // ------------------------------------------------
        // Event Handlers

        $scope.doChart = function () {
            console.log("doChart button clicked");

            if ($scope.selectCharts === false) {
                _displayItems();
            }
        };

        $scope.saveChart = function () {
            console.log("saveChart button clicked");
            var chart = {};
            chart.name = locale.getString('habmin.chartSaveNewName');
            chart.period = 86400;
            chart.items = [];

            angular.forEach($scope.items, function (item) {
                if (item.selected === true) {
                    var newItem = {};
                    newItem.item = item.name;
                    newItem.label = item.label;
                    chart.items.push(newItem);
                }
            });

            ChartSave.saveChart(chart);
        };

        $scope.editChart = function () {
            console.log("editChart button clicked");

            if ($scope.selectedChart === undefined) {
                return;
            }

            ChartSave.editChart($scope.selectedChart.id);
        };

        $scope.deleteChart = function () {
            console.log("deleteChart button clicked");

            if ($scope.selectedChart === undefined) {
                return;
            }

            ChartListModel.deleteChart($scope.selectedChart);
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

        $scope.selectChart = function (parm) {
            angular.forEach($scope.charts, function (chart) {
                chart.selected = 'no';
            });

            parm.selected = 'loading';

            $scope.selectedChart = parm;
            _displayChart(parm.id);
        };

        $scope.setType = function (selectType) {
            if (selectType === false) {
                $scope.selectCharts = false;
            }
            else {
                $scope.selectCharts = true;
            }
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

        // This is what we will bind the filter to
        $scope.filter = {text: ''};
        $scope.filterFunction = function (element) {
            if ($scope.filter.text === "") {
                return true;
            }
            if (element.label == null) {
                return false;
            }
            return element.label.toLowerCase().indexOf($scope.filter.text.toLowerCase()) !== -1 ? true : false;
        };

        // ------------------------------------------------
        // Private functions

        function _initChart(period) {
            // The following sets the number of chart points to approximately 2000
            roundingTime = Math.floor(period / 2000000) * 1000;
            console.log("Setting rounding time to", roundingTime);

            itemsLoaded = 0;
            itemsLoading = 0;

            newChart = [];

            groups = new vis.DataSet();
            groupCnt = 0;
        }

        function _displayChart(id) {
            ChartListModel.getChart(id).then(
                function (chart) {
                    $scope.stopTime = Math.floor((new Date()).getTime());
                    $scope.startTime = $scope.stopTime - (chart.period * 1000);
                    _initChart($scope.stopTime - $scope.startTime);

                    chart.items = [].concat(chart.items);
                    chartDef = chart;
                    angular.forEach(chart.items, function (item) {
                        itemsLoading++;
                        _loadItem(item.item, $scope.startTime, $scope.stopTime);
                    });
                },
                function (reason) {
                    // Handle failure
                    growl.warning(locale.getString('habmin.chartErrorLoadingDef'));

                    // Update the loading icon
                    // Effectively we're setting this back to no chart loaded.
                    angular.forEach($scope.charts, function (chart) {
                        if (chart.selected == "loading") {
                            chart.selected = 'no';
                        }
                    });
                }
            );
        }

        function _displayItems() {
            $scope.stopTime = Math.floor((new Date()).getTime());
            $scope.startTime = $scope.stopTime - (86400 * 1000);

            _initChart($scope.stopTime - $scope.startTime);

            angular.forEach($scope.items, function (item) {
                if (item.selected === true) {
                    itemsLoading++;
                    var i = {};
                    i.item = item.name;
                    i.label = item.label;
                    chartDef.items.push(i);
                    _loadItem(item.name, start, stop);
                }
            });
        }

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
                },
                function (reason) {
                    // Handle failure
                    growl.warning(locale.getString('habmin.chartErrorLoadingItem', itemRef));
                }
            );
        }

        function _addChartItem(itemRef, data) {
            // Find the chart config for this item
            var itemCfg = null;
            for (var i = 0; i < chartDef.items.length; i++) {
                if (itemRef == chartDef.items[i].item) {
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

 //           chartData.options.labels.push(itemCfg.item);
   //         chartData.options.series[itemCfg.item] = {};

//            chartData.legend.series[itemCfg.item] = {};
  //          chartData.legend.series[itemCfg.item].label = itemCfg.label;
    //        chartData.legend.series[itemCfg.item].format = 0;

            if (itemCfg.format !== undefined && !isNaN(itemCfg.format)) {
    //            chartData.legend.series[itemCfg.item].format = itemCfg.format;
            }

            if (itemCfg.lineWidth !== undefined) {
  //              chartData.options.series[itemCfg.item].strokeWidth = itemCfg.lineWidth;
            }

            if (itemCfg.fill !== undefined) {
    //            chartData.options.series[itemCfg.item].fillGraph = Boolean(itemCfg.fill);
            }

            if (itemCfg.axis == "left") {
//                chartData.options.series[itemCfg.item].axis = 'y';
            }
            else if (itemCfg.axis == "right") {
 //               chartData.options.series[itemCfg.item].axis = 'y2';
            }

            if (itemCfg.lineColor !== undefined) {
                var t = tinycolor(itemCfg.lineColor);
                if (t.isValid() === true) {
   //                 chartData.options.series[itemCfg.item].color = t.toHexString();
                }
            }
            console.log("Updating data:", $scope.graph);



            groups.add( {
                id: groupCnt,
                content: itemCfg.label,
                style: 'stroke-width:6px;',
//                    className: 'customStyle1',
                options: {
                    yAxisOrientation: itemCfg.axis,
                    drawPoints: false,
            //{
              //          style: 'square' // square, circle
                //    },
                    shaded: {
                        orientation: 'bottom' // top, bottom
                    }
                }
            });

            newChart = addSeries(newChart, data, itemCfg.repeatTime, groupCnt);
            groupCnt++;

            if (itemCfg.lineStyle !== undefined && itemCfg.lineStyle.length > 0) {
 //               chartData.options.series[itemCfg.item].strokePattern = lineStyles[itemCfg.lineStyle.toLowerCase()];
            }

            // If everything is loaded, render the chart
            itemsLoaded++;
            console.log("Loaded " + itemsLoaded + " of " + itemsLoading);
            if (itemsLoaded >= itemsLoading) {
                // All items loaded
                if (chartDef.title) {
  //                  chartOptions.title = chartDef.title;
                }

                if (chartDef.axis) {
                    angular.forEach(chartDef.axis, function (axis) {
                        if (axis == null) {
                            return;
                        }
                        var min = null;
                        var max = null;
                        var label = "";
                        if (axis.label !== undefined) {
                            var style = "";
                            if (axis.color != null && axis.color.length > 0) {
                                // Sanatise the colours with tinycolor
                                var t = tinycolor(axis.color);
                                if (t.isValid() === true) {
                                    style = " style='color:" + t.toHexString() + ";'";
                                }
                            }
                            label = "<span" + style + ">" + axis.label + "</span>";
                        }
                        switch (axis.position) {
                            default:
                            case 'left':
  //                              chartData.options.ylabel = label;
    //                            chartData.options.axes.y = {};
      //                          chartData.options.axes.y.format = Number(axis.format);
                                if (axis.minimum !== undefined || axis.maximum !== undefined) {
                                    if (axis.minimum !== undefined) {
                                        min = Number(axis.minimum);
                                    }
                                    if (axis.maximum !== undefined) {
                                        max = Number(axis.maximum);
                                    }
          //                          chartData.options.axes.y.valueRange = null;
        //                            chartData.options.axes.y.valueRange = [min, max];
                                }
                                break;
                            case 'right':
  //                              chartData.options.y2label = label;
    //                            chartData.options.axes.y2 = {};
      //                          chartData.options.axes.y2.format = Number(axis.format);
                                if (axis.minimum !== undefined || axis.maximum !== undefined) {
                                    if (axis.minimum !== undefined) {
                                        min = Number(axis.minimum);
                                    }
                                    if (axis.maximum !== undefined) {
                                        max = Number(axis.maximum);
                                    }
   //                                 chartData.options.axes.y2.valueRange = null;
     //                               chartData.options.axes.y2.valueRange = [min, max];
                                }
                                break;
                        }
                    });
                }

                console.log("Rendering chart", chartData);

                console.log(angular.toJson(newChart));
                console.log(angular.toJson(groups));

                var items = new vis.DataSet();
                items.add(newChart);

                $scope.graphData = {
                    items: items,
                    groups: groups
                    };
                visoptions.min = $scope.startTime;
                visoptions.max = $scope.stopTime;
                $scope.graphOptions = visoptions;
                $scope.graphLoaded = true;

                // Update the loading icon
                angular.forEach($scope.charts, function (chart) {
                    if (chart.selected == "loading") {
                        chart.selected = 'yes';
                    }
                });
            }
        }

        // Sequentially step through the new data and add it to a new array along with the old data
        function addSeries(curData, newData, repeatTime, group) {
            var d;

            // Record the starting time/value of the new series
            var lastTime = Math.floor(Number(newData[0].time) / roundingTime) * roundingTime;

            var curTime;
            var newTime;
            // Process merging of the two data arrays
            for (var cntNew = 0; cntNew < newData.length; cntNew++) {
                if (newData[cntNew + 1] !== undefined &&
                    newData[cntNew + 1].time > newData[cntNew].time + repeatTime) {
                    // The next value is more than 'repeatTime' in the future. We need to record this value
                    newTime = Math.floor(Number(newData[cntNew].time) / 1000) * 1000;
                }
                else {
                    // Round the time down to the closest second
                    newTime = Math.floor(Number(newData[cntNew].time) / roundingTime) * roundingTime;
                }

                // Check if we need to repeat the data
                if (newTime > lastTime + repeatTime) {
                    // Repeat needed
                    curData.push({x: newTime - repeatTime, y: Number(newData[cntNew].state), group: group});
                }

                lastTime = newTime;

                curData.push({x: newTime, y: Number(newData[cntNew].state), group: group});
            }

            return curData;
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
                $scope.styleItemList = function () {
                    return {
                        'height': (newValue.h - 232) + 'px'
                    };
                };
                $scope.styleChartList = function () {
                    return {
                        'height': (newValue.h - 165) + 'px'
                    };
                };
                $scope.styleChartPanel = function () {
                    return {
                        'height': (newValue.h - 93) + 'px'
                    };
                };
                $scope.styleChart = function () {
                    return {
                        'height': (newValue.h - 132) + 'px'
                    };
                };
            }, true);

            w.bind('resize', function () {
                $scope.$apply();
            });
        };
    })

;
