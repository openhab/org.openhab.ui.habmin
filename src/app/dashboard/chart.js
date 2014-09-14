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
    'angular-dygraphs'
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
    function DashboardChartCtrl($scope, locale, PersistenceItemModel, PersistenceServiceModel, PersistenceDataModel, ChartListModel, ChartSave, growl) {
        var itemsLoaded = 0;
        var itemsLoading = 0;
        var newChart;
        var chartDef;

        var chartData;
        var roundingTime = 1000;

        var chartOptions = {
            colors: ["#FF9900", "#33FFFF", "#FFCC00", "#33CCCC"],
            labelsSeparateLines: true,
            connectSeparatedPoints: true
        };

        $scope.selectCharts = true;

        $scope.chartsTotal = 0;
        $scope.charts = [];

        $scope.itemsTotal = 0;
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
                growl.warning('Hello world ' + reason.message);
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

        // ------------------------------------------------
        // Event Handlers

        $scope.doChart = function () {
            console.log("doChart button clicked");

            if($scope.selectCharts === false) {
                _displayItems();
            }
        };

        $scope.saveChart = function () {
            console.log("saveChart button clicked");
            ChartSave.showModal();
        };

        $scope.editChart = function () {
            console.log("editChart button clicked");

            var id = null;
            angular.forEach($scope.charts, function (chart) {
                if(chart.selected) {
                    id = chart.id;
                }
            });

            ChartSave.showModal(id);
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

            _displayChart(parm.id);
        };

        $scope.setType = function (selectType) {
            if(selectType === false) {
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
            roundingTime = period / 2000;
            console.log("Setting rounding time to",roundingTime);

            itemsLoaded = 0;
            itemsLoading = 0;

            newChart = [];
            chartDef = {};
            chartDef.items = [];
            chartData = {};
            chartData.legend = {};
            chartData.legend.series = {};
            chartData.options = chartOptions;
            chartData.options.animatedZooms = true;
            chartData.options.valueRange = null;
            chartData.options.axes = {};
            chartData.options.series = {};
            chartData.options.xlabel = undefined;
            chartData.options.ylabel = undefined;
            chartData.options.y2label = undefined;
            chartData.options.title = undefined;
            chartData.options.labels = [locale.getString('common.time')];
        }

        function _displayChart(id) {
            ChartListModel.getChart(id).then(
                function (chart) {
                    var stop = Math.round((new Date()).getTime());
                    var start = stop - (chart.period * 1000);
                    _initChart(stop - start);

                    chart.items = [].concat(chart.items);
                    chartDef = chart;
                    angular.forEach(chart.items, function (item) {
                        itemsLoading++;
                        _loadItem(item.item, start, stop);
                    });
                },
                function (reason) {
                    // handle failure
                    growl.warning('Hello world ' + reason.message);
                }
            );
        }

        function _displayItems() {
            var stop = Math.round((new Date()).getTime());
            var start = stop - (86400 * 1000);

            _initChart(stop - start);

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

            chartData.options.labels.push(itemCfg.item);
            chartData.options.series[itemCfg.item] = {};

            chartData.legend.series[itemCfg.item] = {};
            chartData.legend.series[itemCfg.item].label = itemCfg.label;
            chartData.legend.series[itemCfg.item].format = 1;

            if(itemCfg.axis == "left") {
//                chartData.options.series[itemCfg.item].axis = 'y';
            }
            else if(itemCfg.axis == "right") {
//            else if(itemCfg.lineWidth == "6") {
                chartData.options.series[itemCfg.item].axis = 'y2';
            }

            console.log("Updating data:", $scope.graph);

            newChart = addSeries(newChart, data, itemCfg.repeatTime);

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


            // If everything is loaded, render the chart
            itemsLoaded++;
            console.log("Loaded " + itemsLoaded + " of " + itemsLoading);
            if (itemsLoaded >= itemsLoading) {
                // All items loaded
                if (chartDef.title) {
                    chartOptions.title = chartDef.title;
                }

                if(chartDef.axis) {
                    angular.forEach(chartDef.axis, function(axis) {
                        if(axis == null) {
                            return;
                        }
                        var min = null;
                        var max = null;
                        var label = "";
                        if(axis.label !== undefined) {
                            var style = "";
                            if(axis.color != null && axis.color.length > 0) {
                                style = " style='color:" + axis.color + ";'";
                            }
                            label = "<span" + style + ">" + axis.label + "</span>";
                        }
                        switch(axis.position) {
                            default:
                            case 'left':
                                chartData.options.ylabel = label;
                                if(axis.minimum !== undefined || axis.maximum !== undefined) {
                                    if(axis.minimum !== undefined) {
                                        min = Number(axis.minimum);
                                    }
                                    if(axis.maximum !== undefined) {
                                        max = Number(axis.maximum);
                                    }
                                    chartData.options.axes.y={};
                                    chartData.options.axes.y.format = 1;
                                    chartData.options.axes.y.valueRange = null;
                                    chartData.options.axes.y.valueRange = [min,max];
                                }
                                break;
                            case 'right':
                                chartData.options.y2label = label;
                                if(axis.minimum !== undefined || axis.maximum !== undefined) {
                                    if(axis.minimum !== undefined) {
                                        min = Number(axis.minimum);
                                    }
                                    if(axis.maximum !== undefined) {
                                        max = Number(axis.maximum);
                                    }
                                    chartData.options.axes.y2={};
                                    chartData.options.axes.y2.format = 1;
                                    chartData.options.axes.y2.valueRange = null;
                                    chartData.options.axes.y2.valueRange = [min,max];
                                }
                                break;
                        }
                    });
                }

                chartData.data = newChart;
                chartData.options = chartOptions;
                console.log("Rendering chart", chartData);
                $scope.graph = chartData;

                // Update the loading icon
                angular.forEach($scope.charts, function (chart) {
                    if(chart.selected == "loading") {
                        chart.selected = 'yes';
                    }
                });
            }
        }

        // Sequentially step through the new data and add it to a new array along with the old data
        function addSeries(curData, newData, repeatTime) {
            var cntCur = 0;
            var cntNew = 0;
            var output = [];
            var d;

            // Get the number of series currently in the array
            var len = 0;
            if (curData.length) {
                len = curData[0].length;
            }

            // Record the starting time/value of the new series
            var lastTime = Math.round(Number(newData[0].time) / roundingTime) * roundingTime;
            var newState = Number(newData[0].state);

            var curTime;
            if(curData.length !== 0) {
                curTime = curData[cntCur][0].getTime();
            }
            var newTime = 0;

            // Process merging of the two data arrays
            while (cntCur < curData.length && cntNew < newData.length) {
                curTime = curData[cntCur][0].getTime();

                // newTime is set to 0 when we add new data to indicate that we need to get the next value
                if(newTime === 0) {
                    if(newData[cntNew+1] !== undefined  && newData[cntNew+1].time > newData[cntNew].time + repeatTime) {
                        // The next value is more than 'repeatTime' in the future. We need to record this value
                        newTime = Math.round(Number(newData[cntNew].time) / 1000) * 1000;
                    }
                    else {
                        // Round the time down to the closest second
                        newTime = Math.round(Number(newData[cntNew].time) / roundingTime) * roundingTime;
                    }

                    // Check if we need to repeat the data
                    if(newTime > lastTime + repeatTime) {
                        // Repeat needed - leave the data alone and reset the time
                        newTime = newTime - repeatTime;
                    }
                    else {
                        // No repeat - use new data and time
                        newState = Number(newData[cntNew].state);

                        // Increment to the next value
                        cntNew++;
                    }

                    // Stop time going backwards - may happen due to rounding
                    if(newTime <= lastTime) {
                        newTime = 0;
                        continue;
                    }

                    lastTime = newTime;
                }

                // Add the data in order
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
                    d.push(newState);

                    cntCur++;
                    newTime = 0;
                }
                else {
                    // New data is next up
                    // Set the new time, add nulls as placeholders for the existing data, then add the new data
                    d = [];
                    d[0] = new Date(newTime);
                    for (var c = 1; c < len; c++) {
                        d.push(null);
                    }

                    d.push(newState);
                    newTime = 0;
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
                if(newData[cntNew+1] !== undefined  && newData[cntNew+1].time > newData[cntNew].time + repeatTime) {
                    // The next value is more than 'repeatTime' in the future. We need to record this value
                    newTime = Math.round(Number(newData[cntNew].time) / 1000) * 1000;
                }
                else {
                    // Round the time down to the closest second
                    newTime = Math.round(Number(newData[cntNew].time) / roundingTime) * roundingTime;
                }

                // Stop time going backwards - may happen due to rounding
                if(newTime <= lastTime) {
                    cntNew++;
                    continue;
                    //newTime = lastTime;
                }

                // Check if we need to repeat the data
                if(newTime > lastTime + repeatTime) {
                    // Repeat needed
                    d = [];
                    d[0] = new Date(newTime - repeatTime);
                    for (var a = 1; a < len; a++) {
                        d.push(null);
                    }
                    d.push(Number(newData[cntNew-1].state));
                    output.push(d);
                }

                d = [];
                d[0] = new Date(newTime);
                for (var b = 1; b < len; b++) {
                    d.push(null);
                }
                d.push(Number(newData[cntNew].state));
                output.push(d);

                lastTime = newTime;
                cntNew++;
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
                $scope.styleItemList = function () {
                    return {
                        'height': (newValue.h - 225) + 'px'
                    };
                };
                $scope.styleChartList = function () {
                    return {
                        'height': (newValue.h - 165) + 'px'
                    };
                };
                $scope.styleChart = function () {
                    return {
                        'height': (newValue.h - 83) + 'px'
                    };
                };
            }, true);

            w.bind('resize', function () {
                $scope.$apply();
            });
        };
    })

;
