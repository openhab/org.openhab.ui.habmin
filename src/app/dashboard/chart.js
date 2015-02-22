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
    'ui.bootstrap.datepicker',
    'ngLocalize',
    'angular-growl',
    'HABmin.persistenceModel',
    'HABmin.chartModel',
    'HABmin.chartSave',
    'HABmin.iconModel',
    'ngVis',
    'ngConfirmClick',
    'ResizePanel',
    'SidepanelService'
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
            data: {pageTitle: 'Charting'},
            resolve: {
                // Make sure the localisation files are resolved before the controller runs
                localisations: function (locale) {
                    return locale.ready('common');
                }
            }
        });
    })

    .controller('DashboardChartCtrl',
    function DashboardChartCtrl($scope, locale, PersistenceItemModel, PersistenceServiceModel, PersistenceDataModel, ChartListModel, ChartSave, SidepanelService, growl, VisDataSet, $interval, $timeout) {
        var itemsLoaded = 0;
        var itemsLoading = 0;
        var newChart;
        var chartDef;

        var graph2d;

        var roundingTime = 1000;

        var dataItems;
        var dataGroups;

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

        var chartOptions = {
            height: '100%',
            width: '100%',
            dataAxis: {
                icons: true,
                showMajorLabels: true,
                showMinorLabels: false
            },
            showCurrentTime: false,
            legend: true,
            zoomMin: 60000
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

        $scope.chartLoading = false;

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
                $scope.chartLoading = true;

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
            $scope.chartLoading = true;

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
            $scope.selectedService = sel.name;
        };

        $scope.onLoaded = function (graphRef) {
            $scope.chartLoading = false;
            console.log("graph loaded callback", graphRef);
            graph2d = graphRef;
            graph2d.setWindow($scope.startTime, $scope.stopTime);
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

        $scope.setWindow = function (window) {
            var periodStart = moment().subtract(1, window);
            $scope.timeNow = moment().valueOf();

            if (graph2d === undefined) {
                return;
            }

            graph2d.setOptions({max: $scope.timeNow});
            graph2d.setWindow(periodStart, $scope.timeNow);
        };

        $scope.setNow = function (direction) {
            var range = graph2d.getWindow();
            var interval = range.end - range.start;
            $scope.timeNow = moment().valueOf();

            if (graph2d === undefined) {
                return;
            }

            graph2d.setOptions({max: $scope.timeNow});
            graph2d.setWindow($scope.timeNow - interval, $scope.timeNow);
        };

        $scope.stepWindow = function (direction) {
            var percentage = (direction > 0) ? 0.2 : -0.2;
            var range = graph2d.getWindow();
            var interval = range.end - range.start;

            if (graph2d === undefined) {
                return;
            }

            graph2d.setWindow({
                start: range.start.valueOf() - interval * percentage,
                end: range.end.valueOf() - interval * percentage
            });
        };

        $scope.zoomWindow = function (percentage) {
            var range = graph2d.getWindow();
            var interval = range.end - range.start;

            if (graph2d === undefined) {
                return;
            }

            graph2d.setWindow({
                start: range.start.valueOf() - interval * percentage,
                end: range.end.valueOf() + interval * percentage
            });
        };

        $scope.setDateRange = function () {
            $scope.timeNow = moment().valueOf();

            if (graph2d === undefined) {
                return;
            }

            graph2d.setOptions({max: $scope.timeNow});
            graph2d.setWindow($scope.startTime, $scope.stopTime);
        };

        // Initialise the auto refresh variables
        var refreshTimer = null;
        $scope.$on("$destroy", function (event) {
            console.log("Destroy timer");
            $interval.cancel(refreshTimer);
        });
        $scope.refreshPeriod = '0';
        $scope.setRefresh = function (period) {
            var d = period.split('.');
            var duration = moment.duration(Number(d[0]), d[1]);
/*
            // If the timer is running - cancel it!
            if (refreshTimer != null) {
                console.log("Cancel timer");
                $interval.cancel(refreshTimer);
                refreshTimer = null;
            }

            var count = 100;
            // Now create the timer
            if (duration.asMilliseconds() !== 0) {
                // Remember the period
                $scope.refreshPeriod = period;

                refreshTimer = $interval(function () {
                    console.log("Refresh timer", count);

                    var now = vis.moment();

                    count += 10;
                    dataItems.add({x: now, y: count, group: 'Outside_RainGauge_Counter'});

                }, 2000); //duration.asMilliseconds());
            }
            else {
                $scope.refreshPeriod = "0";
            }*/
        };

        /**
         * Callback from the chart whenever the range is updated
         * This is called repeatedly during zooming and scrolling
         * @param period
         */
        $scope.onRangeChange = function (period) {
            console.log("Range changing", period);
            function splitDate(date) {
                var m = moment(date);
                return {
                    year: m.get('year'),
                    month: {
                        number: m.get('month'),
                        name: m.format('MMM')
                    },
                    week: m.format('w'),
                    day: {
                        number: m.get('date'),
                        name: m.format('ddd')
                    },
                    hour: m.format('HH'),
                    minute: m.format('mm'),
                    second: m.format('ss')
                };
            }

            var p = {
                s: splitDate(period.start),
                e: splitDate(period.end)
            };

            // Set the window for so the appropriate buttons are highlighted
            // We give some leeway to the interval -:
            // A day, +/- 1 minutes
            // A week, +/- 1 hour
            // A month is between 28 and 32 days
            var interval = period.end - period.start;
            if(interval > 86340000 && interval < 86460000) {
                $scope.graphWindow = 'day';
            }
            else if(interval > 601200000 && interval < 608400000) {
                $scope.graphWindow = 'week';
            }
            else if(interval > 2419200000 && interval < 2764800000) {
                $scope.graphWindow = 'month';
            }
            else {
                $scope.graphWindow = 'custom';
            }

            if (p.s.year == p.e.year) {
                $scope.graphTimeline =
                    p.s.day.name + ' ' + p.s.day.number + '-' + p.s.month.name + '  -  ' +
                    p.e.day.name + ' ' + p.e.day.number + '-' + p.e.month.name + ' ' + p.s.year;

                if (p.s.month.number == p.e.month.number) {
                    $scope.graphTimeline =
                        p.s.day.name + ' ' + p.s.day.number + '  -  ' +
                        p.e.day.name + ' ' + p.e.day.number + ' ' +
                        p.s.month.name + ' ' + p.s.year;

                    if (p.s.day.number == p.e.day.number) {
                        if (p.e.hour == 23 && p.e.minute == 59 && p.e.second == 59) {
                            p.e.hour = 24;
                            p.e.minute = '00';
                            p.e.second = '00';
                        }

                        $scope.graphTimeline =
                            p.s.hour + ':' + p.s.minute + '  -  ' +
                            p.e.hour + ':' + p.e.minute + ' ' +
                            p.s.day.name + ' ' + p.s.day.number + ' ' + p.s.month.name + ' ' + p.s.year;
                    }
                }
            }
            else {
                $scope.graphTimeline =
                    p.s.day.name + ' ' + p.s.day.number + '-' + p.s.month.name + ', ' + p.s.year + '  -  ' +
                    p.e.day.name + ' ' + p.e.day.number + '-' + p.e.month.name + ', ' + p.e.year;
            }

            // Call apply since this is updated in an event and angular may not know about the change!
            if(!$scope.$$phase) {
                $timeout(function(){$scope.$apply();}, 0);
            }
        };

        /**
         * Callback from the chart whenever the range is updated
         * This is called once at the end of zooming and scrolling
         * @param period
         */
        $scope.onRangeChanged = function (period) {
            console.log("Range changed", period);

            // We want to add any additional data at the beginning, and/or end of the current data
/*

            $scope.stopTime = Math.floor((new Date()).getTime());
            $scope.startTime = $scope.stopTime - (chart.period * 1000);

            console.log("Requesting ", itemRef);
            var parms = {starttime: start, endtime: stop};
            var me = this;*/

            var allowableDelta = ($scope.stopTime - $scope.startTime) / 100;
            console.log("AllowableDelta", allowableDelta);

            var startTime = moment(period.start).valueOf();
            var stopTime = moment(period.end).valueOf();

            console.log("Start", startTime, $scope.startTime, startTime - $scope.startTime);
            console.log("Stop", stopTime, $scope.stopTime,  stopTime - $scope.stopTime);

            if(startTime >= $scope.startTime - allowableDelta &&
                stopTime <= $scope.stopTime + allowableDelta) {
                return;
            }

            $scope.chartLoading = true;

            $scope.startTime = moment(period.start).valueOf();
            $scope.stopTime = moment(period.end).valueOf();

            newChart = [];
            var cnt = chartDef.items.length;
            angular.forEach(chartDef.items, function(item) {
                console.log("Range changed on item",item);

                PersistenceDataModel.get($scope.selectedService, item.item, $scope.startTime, $scope.stopTime).then(
                    function (data) {
                        console.log("The item definition is: ", data);
                        newChart = addSeries(newChart, data, item.repeatTime, item.item);
                        cnt--;

                        if(cnt === 0) {
                            $scope.chartLoading = false;
                            dataItems.update(newChart);
                        }
                    },
                    function (reason) {
                        // Handle failure
                        growl.warning(locale.getString('habmin.chartErrorLoadingItem', item.item));
                        cnt--;
                    }
                );
            });

            /*
            PersistenceDataModel.get($scope.selectedService, itemRef, start, stop).then(
                function (response) {
                    console.log("The item definition is: ", response);
                    dataItems.add({x: now, y: count, group: 'Outside_RainGauge_Counter'});
                    _addChartItem(itemRef, response);
                },
                function (reason) {
                    // Handle failure
                    growl.warning(locale.getString('habmin.chartErrorLoadingItem', itemRef));
                }
            );

*/


        };

        $scope.graphEvents = {
            rangechange: $scope.onRangeChange,
            rangechanged: $scope.onRangeChanged,
            onload: $scope.onLoaded
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

            chartOptions.dataAxis.title = {};
            chartOptions.dataAxis.title.left = {};
            chartOptions.dataAxis.title.right = {};

            dataGroups = new VisDataSet();
            dataItems = new VisDataSet();
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

            chartDef = {items:[]};
            angular.forEach($scope.items, function (item) {
                if (item.selected === true) {
                    itemsLoading++;
                    var i = {};
                    i.item = item.name;
                    i.label = item.label;
                    i.axis = "left";
                    chartDef.items.push(i);
                    _loadItem(item.name, $scope.startTime, $scope.stopTime);
                }
            });
        }

        function _loadItem(itemRef, start, stop) {
            console.log("Requesting ", itemRef);
            var parms = {starttime: start, endtime: stop};
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
                    break;
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

            var style = "";
            if (itemCfg.lineColor !== undefined) {
                var t = tinycolor(itemCfg.lineColor);
                if (t.ok === true) {                // isValid!!!
                    style += "stroke:" + t.toHexString() + ";";
                }
            }
            if (itemCfg.lineWidth !== undefined) {
                style += "stroke-width:" + itemCfg.lineWidth + ";";
            }

            if (itemCfg.lineStyle !== undefined && itemCfg.lineStyle.length > 0) {
                style += "stroke-dasharray:" + lineStyles[itemCfg.lineStyle.toLowerCase()].join(' ') + ";";
            }

            var shaded = {enabled: false};
            if (itemCfg.fill !== undefined) {
                if (Boolean(itemCfg.fill) === true) {
                    shaded = {orientation: "bottom"};
                }
            }

            dataGroups.add({
                id: itemRef,
                content: itemCfg.label,
                style: style,
                options: {
                    yAxisOrientation: itemCfg.axis,
                    drawPoints: false,
                    //{
                    //          style: 'square' // square, circle
                    //    },
                    shaded: shaded
                }
            });

            newChart = addSeries(newChart, data, itemCfg.repeatTime, itemRef);

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
                        var label = {};
                        if (axis.label !== undefined) {
                            var style = "";
                            if (axis.color != null && axis.color.length > 0) {
                                // Sanatise the colours with tinycolor
                                var t = tinycolor(axis.color);
                                if (t.ok === true) {                // isValid!!!
                                    label.style = "color:" + t.toHexString() + ";";
                                }
                            }
                            label.text = axis.label;
                        }
                        chartOptions.dataAxis.title[axis.position] = label;

                        switch (axis.position) {
                            default:
                            case 'left':
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

                $scope.timeNow = moment().valueOf();

                dataItems.add(newChart);

//                console.log(angular.toJson(dataItems));
//                console.log(angular.toJson(dataGroups));

                $scope.graphData = {
                    items: dataItems,
                    groups: dataGroups
                };
                chartOptions.max = $scope.timeNow;
                $scope.graphOptions = chartOptions;
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

;
