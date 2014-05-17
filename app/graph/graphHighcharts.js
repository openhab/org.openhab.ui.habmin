/**
 * HABmin - the openHAB admin interface
 *
 * openHAB, the open Home Automation Bus.
 * Copyright (C) 2010-2013, openHAB.org <admin@openhab.org>
 *
 * See the contributors.txt file in the distribution for a
 * full listing of individual contributors.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as
 * published by the Free Software Foundation; either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, see <http://www.gnu.org/licenses>.
 *
 * Additional permission under GNU GPL version 3 section 7
 *
 * If you modify this Program, or any covered work, by linking or
 * combining it with Eclipse (or a modified version of that library),
 * containing parts covered by the terms of the Eclipse Public License
 * (EPL), the licensors of this Program grant you additional permission
 * to convey the resulting work.
 */

/**
 * OpenHAB Admin Console HABmin
 *
 * @author Chris Jackson
 */

Ext.define('openHAB.graph.graphHighcharts', {
    extend: 'Ext.panel.Panel',
    icon: 'images/chart-up.png',
    layout: 'fit',
    header: false,
    // TODO: does this need to be 'id'?
    id: 'highchartsChart',
    chartObject: null,

    initComponent: function () {
        this.title = language.graph_HighchartsTitle;

        var supportedCharts = [
            'spline',
            'line',
            'area',
            'areaspline',
            'bar',
            'column'
        ];
        var supportedMarkers = [
            'circle',
            'square',
            'diamond',
            'triangle',
            'triangle-down'
        ];
        var lastUpdate = 0;
        var rawData = [];
        var chartMin = 0;
        var chartMax = 0;
        var chartConfig = [];
        var chartOptions = {
            chart: {
                renderTo: 'chartIsHere',
                animation: false,
                type: 'spline',
                zoomType: 'x',
                events: {
                    selection: function (event) {
                        event.preventDefault();
                        updateChart(chartConfig, Math.floor(event.xAxis[0].min), Math.ceil(event.xAxis[0].max));
                    }
                }
            },
            credits: {
                enabled: false
            },
            title: {
                text: null
            },
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: { // don't display the dummy year
                    month: '%e. %b',
                    year: '%b'
                }
            },
            plotOptions: {
                spline: {
                    lineWidth: 3,
                    states: {
                        hover: {
                            lineWidth: 5
                        }
                    },
                    marker: {
                        states: {
                            hover: {
                                enabled: true,
                                symbol: 'circle',
                                radius: 5,
                                lineWidth: 1
                            }
                        }
                    }
                },
                series: {
                    marker: {
                        enabled: false
                    }
                }
            },
            legend: {
                enabled: true
            },
            tooltip: {
                enabled: true,
                crosshairs: true,
                shared: false,
                formatter: function () {
                    return '<b>' + this.series.name + '</b><br/>' +
                        Highcharts.dateFormat('%H:%M:%S %a %d %b %Y', this.x) + ': ' +
                        Highcharts.numberFormat(this.y, 2);
                }
            }
        };

        function toolbarEnable() {
            toolbar.getComponent('zoomIn').enable();
            toolbar.getComponent('zoomOut').enable();
            toolbar.getComponent('scrollLeft').enable();
            toolbar.getComponent('scrollRight').enable();
            toolbar.getComponent('viewDay').enable();
            toolbar.getComponent('viewWeek').enable();
            toolbar.getComponent('viewMonth').enable();
            toolbar.getComponent('viewYear').enable();
//            toolbar.getComponent('info').enable();
        }

        ;

        /**
         * Process incoming data responses.
         * This is called when we receive a response to a graph data request.
         * It correlates the data and waits until all requests are complete
         * before drawing the graph
         * @param item
         * @param json
         */
        function addGraphData(item, json) {
            // Remember the time of the last data update
            // This allows the table view to detect if data is dirty
            lastUpdate = (new Date()).getTime();

            // Reset the info store
            graphInfoItems = [];

            graphInfoItems[1] = [];
            graphInfoItems[1].name = "Response Time";
            graphInfoItems[1].value = "";//(new Date()).getTime() - timeStart + " ms";


            // Find this item in rawData
            for (var chan = 0; chan < rawData.length; chan++) {
                if (rawData[chan].item == item) {
                    // Mark that we've received this item
                    rawData[chan].received = true;

                    // If we have data, process it into the right format for highcharts
                    // This will probably run in parallel with the next channel being received
                    if (json != null) {
                        if (json.datapoints < 2) {

                        }
                        else {
                            // Convert the format. Hopefully the openHAB json can be changed to make this unnecessary
                            var newSeries = [];
                            var subPoints = parseInt(json.datapoints / 1000);
                            var subCount = 0;
                            var outCount = 0;
                            for (var i = 0; i < json.datapoints; i++) {
                                if(subCount++ < subPoints)
                                    continue;
                                subCount = 0;
                                newSeries[outCount] = [];
                                newSeries[outCount][0] = parseInt(json.data[i].time);
                                newSeries[outCount][1] = parseFloat(json.data[i].state);
                                outCount++;
                            }
                            rawData[chan].data = newSeries;
                        }
                    }
                }
            }

            // Check if all requests have completed
            for (var chan = 0; chan < rawData.length; chan++) {
                if (rawData[chan].received == false)
                    return;
            }

            // All requests have completed! Process and display the data!
            drawChart();
        }

        /**
         * Draws the chart. This is called after the data has been received.
         */
        function drawChart() {
            timeStart = (new Date()).getTime();

//                    graphInfoItems[0] = [];
//                    graphInfoItems[0].name = "openHAB Processing Time";
//                    graphInfoItems[0].value = Math.floor(json.procTime * 1000) + " ms";

            var options = chartOptions;

            var errors = "";

            options.series = [];

            var cnt, tot;
            cnt = 0;
            tot = 0;

            // Process all the data
            var series = -1;
            for (var chan = 0; chan < rawData.length; chan++) {
                // Check if this channel has data
                if (rawData[chan].data == null)
                    continue;

                series++;
                options.series[series] = {};

//                    graphInfoItems[4 + s] = [];
//                    graphInfoItems[4 + s].name = json.series[s].label + " points";
//                    graphInfoItems[4 + s].value = json.series[s].pointsRet + " / " + json.series[s].pointsTot;

                // If ticks are provided, add categories to the graph
//                    if (rawData[chan].categories) {
//                        if(rawData[chan].categories.length > 0) {
//                            chartOptions.yAxis[yAxis].categories = new Array();
//                            for (var t = 0; t < rawData[chan].categories.length; t++) {
//                                chartOptions.yAxis[yAxis].categories[rawData[chan].categories[t][1]] = rawData[chan].categories[t][0];
//                            }
//                        }
//                    }

                // Configure the series styles...
                options.series[series].data = rawData[chan].data;
                options.series[series].name = rawData[chan].label;
                options.series[series].yAxis = rawData[chan].axis;

                if (supportedCharts.indexOf(rawData[chan].chart) > -1)
                    options.series[series].type = rawData[chan].chart;
                else
                    options.series[series].type = "spline";

                if (rawData[chan].lineColor != null && rawData[chan].lineColor.length != 0)
                    options.series[series].color = rawData[chan].lineColor;

                if(rawData[chan].lineWidth != null && parseInt(rawData[chan].lineWidth) != NaN) {
                    options.series[series].lineWidth = rawData[chan].lineWidth;
                    if(rawData[chan].lineWidth != 0) {
                        options.series[series].states = {};
                        options.series[series].states.hover = {};
                        options.series[series].states.hover.lineWidth = rawData[chan].lineWidth + 2;
                    }
                }

                if(typeof rawData[chan].legend == 'string' || rawData[chan].legend instanceof String)
                    options.series[series].showInLegend = (rawData[chan].legend.toLowerCase() == 'true') ? true : false;

                if (rawData[chan].lineStyle != null && rawData[chan].lineStyle.length != 0)
                    options.series[series].dashStyle = rawData[chan].lineStyle;

                if (supportedMarkers.indexOf(rawData[chan].markerSymbol) > -1) {
                    options.series[series].marker = {};
                    options.series[series].marker.enabled = true;
                    options.series[series].marker.symbol = rawData[chan].markerSymbol;

                    if (rawData[chan].markerColor != null && rawData[chan].markerColor.length != 0) {
                        options.series[series].marker.fillColor = rawData[chan].markerColor;
                        options.series[series].marker.lineColor = rawData[chan].markerColor;
                    }
                }

                // Keep track of the min/max times
                if (chartMin > rawData[chan].timestart)
                    chartMin = rawData[chan].timestart;
                if (chartMax < rawData[chan].timeend)
                    chartMax = rawData[chan].timeend;
            }

            this.chartObject = new Highcharts.Chart(options);

            if ((chartMax - chartMin) < 300)
                toolbar.getComponent('zoomIn').disable();
            else
                toolbar.getComponent('zoomIn').enable();

            graphInfoItems[2] = [];
            graphInfoItems[2].name = "Render Time";
            graphInfoItems[2].value = "";//(new Date()).getTime() - timeStart + " ms";
            graphInfoItems[3] = [];
            graphInfoItems[3].name = "Total Time";
            graphInfoItems[3].value = "";//(new Date()).getTime() - timeInit + " ms";

            Ext.MessageBox.hide();

            toolbarEnable();
            if (errors != "") {
                handleStatusNotification(NOTIFICATION_WARNING, 'Warning: ' + error);
            }
        }

        /**
         * Update the graph.
         * Requests data from the server and processes the responses.
         * @param newConfig Config object for the chart
         * @param start Start time
         * @param stop Stop time
         */
        function updateChart(newConfig, start, stop) {
            // A bit of sanity checking before we start...
            if (newConfig == null || newConfig.items == null || newConfig.items.length == 0)
                return;

            // Keep track of the current configuration
            chartConfig = newConfig;

            // Change to arrays
            if(newConfig.axis != null)
                newConfig.axis = [].concat(newConfig.axis);
            if(newConfig.items != null)
                newConfig.items = [].concat(newConfig.items);

            // TODO: Something needs to be done about the timers and graph information
            var timeStart = (new Date()).getTime();
            var timeInit = timeStart;

            Ext.MessageBox.show({
                msg: language.graph_HighchartsLoading,
                width: 100,
                height: 40,
                icon: 'icon-download',
                draggable: false,
                closable: false
            });

            if (isNaN(start))
                start = 0;
            if (isNaN(stop))
                stop = 0;

            if (start == 0 || stop == 0) {
                var ts = Math.round((new Date()).getTime());
                start = ts - (2 * 86400000);
                stop = ts;
            }

            // Make sure we're not asking for data from the future!
            if(stop > Math.round((new Date()).getTime()))
                stop = Math.round((new Date()).getTime());

            var parms = {};
            parms.starttime = Math.floor(start);
            parms.endtime = Math.ceil(stop);

            // Remove the categories from the yAxis
            chartOptions.yAxis = [];
            for (var cnt = 0; cnt < 4; cnt++) {
                chartOptions.yAxis[cnt] = {};
                chartOptions.yAxis[cnt].title = {};
                chartOptions.yAxis[cnt].title.style = {};
                chartOptions.yAxis[cnt].title.text = "";
                chartOptions.yAxis[cnt].labels = {};
                chartOptions.yAxis[cnt].labels.style = {};
            }

            // Configure the axis
            if (newConfig.axis != null) {
                for (var cnt = 0; cnt < newConfig.axis.length; cnt++) {
                    var axis = newConfig.axis[cnt].axis - 1;

                    if(newConfig.axis[cnt].label != null && newConfig.axis[cnt].label.length != 0) {
                        chartOptions.yAxis[axis].title.text = newConfig.axis[cnt].label;
                    }
                    if(newConfig.axis[cnt].minimum != null) {
                        chartOptions.yAxis[axis].min = newConfig.axis[cnt].minimum;
                        chartOptions.yAxis[axis].startOnTick = false;
                    }
                    if(newConfig.axis[cnt].maximum != null) {
                        chartOptions.yAxis[axis].max = newConfig.axis[cnt].maximum;
                        chartOptions.yAxis[axis].endOnTick = false;
                    }
                    if(newConfig.axis[cnt].position == 'right') {
                        chartOptions.yAxis[axis].opposite = true;
                    }
                    if(newConfig.axis[cnt].format != null && newConfig.axis[cnt].format.length != 0) {
//                        chartOptions.yAxis[axis].labels.formatter = function() {
//                            numberFormat (Number number, [Number decimals], [String decimalPoint], [String thousandsSep])
//                            return this.value;
//                        }
                    }
                    if(newConfig.axis[cnt].color != null && newConfig.axis[cnt].color.length != 0) {
                        chartOptions.yAxis[axis].labels.style.color = newConfig.axis[cnt].color;
                        if(chartOptions.yAxis[axis].title != null) {
                            chartOptions.yAxis[axis].title.style.color = newConfig.axis[cnt].color;
                        }
                    }
                }
            }

            // Clear the raw data
            rawData = [];

            // Loop through all items and request data via Ajax
            for (var chan = 0; chan < chartConfig.items.length; chan++) {
                rawData[chan] = {};
                rawData[chan].received = false;
                rawData[chan].item = chartConfig.items[chan].item;
                rawData[chan].axis = parseInt(chartConfig.items[chan].axis) - 1;
                rawData[chan].label = chartConfig.items[chan].label;
                rawData[chan].chart = chartConfig.items[chan].chart;
                rawData[chan].legend = chartConfig.items[chan].legend;
                rawData[chan].lineWidth = parseInt(chartConfig.items[chan].lineWidth);
                rawData[chan].lineColor = chartConfig.items[chan].lineColor;
                rawData[chan].lineStyle = chartConfig.items[chan].lineStyle;
                rawData[chan].markerColor = chartConfig.items[chan].markerColor;
                rawData[chan].markerSymbol = chartConfig.items[chan].markerSymbol;

                Ext.Ajax.request({
                    url: HABminBaseURL + '/persistence/services/' + persistenceService + '/' + chartConfig.items[chan].item,
                    timeout: 20000,
                    params: parms,
                    method: 'GET',
                    headers: {'Accept': 'application/json'},
                    callback: function (options, success, response) {
                        var json = null;
                        if (success) {
                            json = Ext.decode(response.responseText);
                        }
                        var item = options.url.split('/');
                        addGraphData(item[item.length - 1], json);
                    }
                });
            }
        };

        function redrawChart() {
            if (this.chartObject != null) {
                this.chartObject.destroy();
                this.chartObject = null;
            }

            var options = chartOptions;
            options.chart.animation = false;
            this.chartObject = new Highcharts.Chart(options);
            options.chart.animation = true;
        }

        ;

        function doGraphTime(days) {
            var ts = Math.round((new Date()).getTime());
            updateChart(chartConfig, ts - (days * 86400000), ts);
        }

        ;


        // -----------------------
        // Main initComponent code

        var toolbar = Ext.create('Ext.toolbar.Toolbar', {
            items: [
                {
                    icon: 'images/zoom_in.png',
                    itemId: 'zoomIn',
                    disabled: true,
                    cls: 'x-btn-icon',
                    tooltip: language.graph_HighchartsZoomIn,
                    handler: function () {
                        var zoom;
                        var min;
                        var max;

                        zoom = (chartMax - chartMin) / 5;
                        min = chartMin + zoom;
                        max = chartMin - zoom;
                        updateChart(chartConfig, min, max);
                    }
                },
                {
                    icon: 'images/zoom_out.png',
                    itemId: 'zoomOut',
                    disabled: true,
                    cls: 'x-btn-icon',
                    tooltip: language.graph_HighchartsZoomOut,
                    handler: function () {
                        var zoom;

                        zoom = (chartMax - chartMin) / 5;
                        updateChart(chartConfig, chartMin - zoom, chartMax + zoom);
                    }
                },
                '-',
                {
                    icon: 'images/calendar-select.png',
                    itemId: 'viewDay',
                    disabled: true,
                    cls: 'x-btn-icon',
                    tooltip: language.graph_HighchartsDisplayDay,
                    handler: function () {
                        doGraphTime(1);
                    }
                },
                {
                    icon: 'images/calendar-select-week.png',
                    itemId: 'viewWeek',
                    disabled: true,
                    cls: 'x-btn-icon',
                    tooltip: language.graph_HighchartsDisplayWeek,
                    handler: function () {
                        doGraphTime(7);
                    }
                },
                {
                    icon: 'images/calendar-select-month.png',
                    itemId: 'viewMonth',
                    disabled: true,
                    cls: 'x-btn-icon',
                    tooltip: language.graph_HighchartsDisplayMonth,
                    handler: function () {
                        doGraphTime(30);
                    }
                },
                {
                    icon: 'images/calendar.png',
                    itemId: 'viewYear',
                    disabled: true,
                    cls: 'x-btn-icon',
                    tooltip: language.graph_HighchartsDisplayYear,
                    handler: function () {
                        doGraphTime(365);
                    }
                },
                '-',
                {
                    icon: 'images/arrow_left.png',
                    itemId: 'scrollLeft',
                    disabled: true,
                    cls: 'x-btn-icon',
                    tooltip: language.graph_HighchartsScrollLeft,
                    handler: function () {
                        var scroll;

                        scroll = (chartMax - chartMin) / 5;
                        updateChart(chartConfig, chartMin - scroll, chartMax - scroll);
                    }
                },
                {
                    icon: 'images/arrow_right.png',
                    itemId: 'scrollRight',
                    disabled: true,
                    cls: 'x-btn-icon',
                    tooltip: language.graph_HighchartsScrollLeft,
                    handler: function () {
                        var scroll;

                        scroll = (chartMax - chartMin) / 5;
                        updateChart(chartConfig, chartMin + scroll, chartMax + scroll);
                    }
                }
                /*                ,'-',
                 {
                 icon: 'images/clock.png',
                 itemId: 'realtime',
                 disabled: true,
                 cls: 'x-btn-icon',
                 tooltip: 'Display real-time graph',
                 handler: function () {
                 }
                 },
                 { xtype: 'tbfill' },
                 {
                 icon: 'images/information-balloon.png',
                 itemId: 'info',
                 cls: 'x-btn-icon',
                 disabled: true,
                 tooltip: 'Display information on current graph',
                 handler: function () {
                 Ext.create('Ext.data.Store', {
                 storeId: 'graphInfoStore',
                 fields: ['name', 'value'],
                 data: graphInfoItems
                 });

                 var graphInfoGrid = Ext.create('Ext.grid.Panel', {
                 hideHeaders: true,
                 store: Ext.data.StoreManager.lookup('graphInfoStore'),
                 columns: [
                 { text: 'Name', dataIndex: 'name', width: 250 },
                 { text: 'Value', dataIndex: 'value', flex: 1 }
                 ],
                 disableSelection: true,
                 viewConfig: {
                 trackOver: false
                 }
                 });

                 var grWin = Ext.create('Ext.Window', {
                 title: 'Graph Information',
                 width: 350,
                 height: 300,
                 modal: true,
                 resizable: false,
                 draggable: false,
                 itemId: 'chartInfo',
                 items: [graphInfoGrid]
                 });

                 grWin.show();
                 grWin.alignTo(Ext.get("chartIsHere"), "tr-tr");
                 }
                 }*/
            ]
        });

        var highchartsPanel = Ext.create('Ext.panel.Panel', {
            itemId: 'chartPanel',
            //TODO: Does this need to be 'id'?
            id: 'chartPanel',
            xtype: 'panel',
            tbar: toolbar,
            flex: 1,
            maintainFlex: true,
            border: false,
            layout: 'fit',
            items: [
                {
                    itemId: 'chartIsHere',
                    id: 'chartIsHere',
                    listeners: {
                        resize: function (comp, width, height, oldWidth, oldHeight, eOpts) {
                            if (this.chartObject != null) {
                                this.chartObject.setSize(width, height);
                            }
                        }
                    }
                }
            ]
        });

        this.items = highchartsPanel;

        this.callParent();

        this.chartUpdate = function (newConfig, start, stop) {
            updateChart(newConfig, start, stop);
        }
        this.getData = function () {
            return rawData;
        }
        this.getLastUpdate = function () {
            return lastUpdate;
        }
    }
})
;



