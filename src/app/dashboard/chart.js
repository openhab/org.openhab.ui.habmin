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
    'HABmin.chartModel',
    'HABmin.chartSave',
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
        $scope.selectName = locale.getString('habmin.chartChartList');

        $scope.chartsTotal = 0;
        $scope.charts = [];

        $scope.itemsTotal = 0;
        $scope.itemsSelected = 0;
        $scope.items = [];
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

        $scope.doChart = function () {
            console.log("doChart button clicked");

            if($scope.selectType === false) {
                _displayItems();
            }
        };

        $scope.saveChart = function () {
            console.log("saveChart button clicked");
            ChartSave.showModal();
        };

        $scope.editChart = function () {
            console.log("editChart button clicked");
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
                chart.selected = false;
            });

            parm.selected = !parm.selected;

            _displayChart(parm.id);
        };

        $scope.setType = function (selectType) {
            if(selectType === false) {
                $scope.selectCharts = false;
                $scope.selectName = locale.getString('habmin.chartItemList');
            }
            else {
                $scope.selectCharts = true;
                $scope.selectName = locale.getString('habmin.chartChartList');
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

        function _initChart(period) {
            roundingTime = period / 2000;
            console.log("Setting rounding time to",roundingTime);

            itemsLoaded = 0;
            itemsLoading = 0;

            newChart = [];
            chartDef = {};
            chartDef.items = [];
            chartData = {};
            chartData.opts = chartOptions;
            chartData.opts.xlabel = undefined;
            chartData.opts.ylabel = undefined;
            chartData.opts.y2label = undefined;
            chartData.opts.title = undefined;
            chartData.opts.labels = [locale.getString('common.time')];

            chartData.opts.axes = {};
            chartData.opts.series = {};
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

            chartData.opts.labels.push(itemCfg.item);
            chartData.opts.series[itemCfg.item] = {};
            chartData.opts.series[itemCfg.item].label = itemCfg.label;

            if(itemCfg.axis == "left") {
//                chartData.opts.series[itemCfg.item].axis = 'y';
            }
            else if(itemCfg.axis == "right") {
//            else if(itemCfg.lineWidth == "6") {
                chartData.opts.series[itemCfg.item].axis = 'y2';
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
                if (chartDef.title) {
                    chartOptions.title = chartDef.title;
                }

                if(chartDef.axis) {
                    angular.forEach(chartDef.axis, function(axis) {
                        var style = "";
                        if(axis.color != null && axis.color.length > 0) {
                            style = " style='color:" + axis.color + ";'";
                        }
                        var label = "<span" + style + ">" + axis.label + "</span>";
                        switch(axis.position) {
                            case 'left':
                                chartData.opts.ylabel = label;
                                chartData.opts.axes.y = {};
                                chartData.opts.axes.y.drawGrid = true;
                                break;
                            case 'right':
                                chartData.opts.y2label = label;
                                chartData.opts.axes.y2 = {};
                                chartData.opts.axes.y2.drawGrid = true;
                                break;
                        }
                    });
                }

                chartData.data = newChart;
                chartData.opts = chartOptions;
                console.log("Rendering chart", chartData);
                $scope.graph = chartData;
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
                newTime = Math.round(Number(newData[cntNew].time) / roundingTime) * roundingTime;

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
                        'height': (newValue.h - 145) + 'px'
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
