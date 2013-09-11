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

/** OpenHAB Admin Console HABmin
 *
 * @author Chris Jackson
 */

Ext.define('openHAB.graph.graphHighcharts', {
    extend:'Ext.panel.Panel',
    title:'Chart',
    icon:'images/chart-up.png',
    layout:'fit',
    header: false,
    // TODO: does this need to be 'id'?
    id:'highchartsChart',

    initComponent:function () {
        var lastUpdate = 0;
        var rawData = [];
        var chartObject = null;
        var chartMin = 0;
        var chartMax = 0;
        var chartOptions = {
            chart:{
                renderTo:'chartIsHere',
                animation:false,
                type:'spline',
                zoomType:'x',
                events:{
                    selection:function (event) {
                        event.preventDefault();
                        updateChart(chartChannels, Math.floor(event.xAxis[0].min), Math.ceil(event.xAxis[0].max));
                    }
                }
            },
            credits:{
                enabled:false
            },
            title:{
                text:null
            },
            xAxis:{
                type:'datetime',
                dateTimeLabelFormats:{ // don't display the dummy year
                    month:'%e. %b',
                    year:'%b'
                }
            },
            plotOptions:{
                spline:{
                    lineWidth:3,
                    states:{
                        hover:{
                            lineWidth:5
                        }
                    },
                    marker:{
                        states:{
                            hover:{
                                enabled:true,
                                symbol:'circle',
                                radius:5,
                                lineWidth:1
                            }
                        }
                    }
                },
                series:{
                    marker:{
                        enabled:false
                    }
                }
            },
            legend:{
                enabled:true
            },
            tooltip:{
                enabled:true,
                crosshairs:true,
                shared:false,
                formatter:function () {
                    return '<b>' + this.series.name + '</b><br/>' +
                        Highcharts.dateFormat('%H:%M:%S %a %d %b %Y', this.x) + ': ' +
                        Highcharts.numberFormat(this.y, 2);
                }
            }
        };

        function toolbarEnable() {
            //TODO: Change to use toolbar.getComponent
            Ext.getCmp('chartTb-zoomIn').enable();
            Ext.getCmp('chartTb-zoomOut').enable();
            Ext.getCmp('chartTb-scrollLeft').enable();
            Ext.getCmp('chartTb-scrollRight').enable();
            Ext.getCmp('chartTb-viewDay').enable();
            Ext.getCmp('chartTb-viewWeek').enable();
            Ext.getCmp('chartTb-viewMonth').enable();
            Ext.getCmp('chartTb-viewYear').enable();
            Ext.getCmp('chartTb-info').enable();
        };


        function updateChart(channels, start, stop) {
            chartChannels = channels;
            var timeStart = (new Date()).getTime();
            var timeInit = timeStart;

            Ext.MessageBox.show({
                msg:'Downloading graph data...',
                width:100,
                height:40,
                icon:'icon-download',
                draggable:false,
                closable:false
            });

            if(isNaN(start))
                start = 0;
            if(isNaN(stop))
                stop = 0;

            if (start == 0 || stop == 0) {
                var ts = Math.round((new Date()).getTime());
                chartMin = ts - (2 * 86400000);
                chartMax = ts;
            }

            var parms = {};
            parms.starttime = Math.floor(start);
            parms.endtime = Math.ceil(stop);

            // Remove the categories from the yAxis
            chartOptions.yAxis = [];
            for(var cnt = 0; cnt < 4; cnt++) {
                chartOptions.yAxis[cnt] = [];
                chartOptions.yAxis[cnt].title = "";
            }
			
			// Clear the raw data
			rawData = [];

            Ext.Ajax.request({
                url:'/rest/history/'+channels[0].name,
                timeout:20000,
                params:parms,
                method:'GET',
                headers:{'Accept': 'application/json'},
                success:function (response, opts) {
                    // Remember the time of the last data update
                    // This allows the table to detect if data is dirty
                    lastUpdate = (new Date()).getTime();

                    // Reset the info store
                    graphInfoItems = [];

                    graphInfoItems[1] = [];
                    graphInfoItems[1].name = "Response Time";
                    graphInfoItems[1].value = (new Date()).getTime() - timeStart + " ms";

                    timeStart = (new Date()).getTime();

                    var json = Ext.decode(response.responseText);

                    if(json.data == null) {
                        Ext.MessageBox.show({
                            msg:'Warning: No data returned',
                            width:200,
                            draggable:false,
                            icon:'icon-warning',
                            closable:false
                        });
                        setTimeout(function () {
                            Ext.MessageBox.hide();
                        }, 2500);

                        return;
                    }
//                    graphInfoItems[0] = [];
//                    graphInfoItems[0].name = "openHAB Processing Time";
//                    graphInfoItems[0].value = Math.floor(json.procTime * 1000) + " ms";

                    var options = chartOptions;	

                    options.series = [];

                    var cnt, tot;
                    cnt = 0;
                    tot = 0;

                    var newSeries = [];
                    for (var i = 0; i < json.data.length; i++) {
                        newSeries[i] = [];
                        newSeries[i][0] = parseInt(json.data[i].time);
                        newSeries[i][1] = parseFloat(json.data[i].value);
                    }
                    var seriesData = newSeries;
					

//            if (json.series) {
//                for (var s = 0; s < json.series.length; s++) {
                    var s = 0;
					
					// Keep a record of the raw data
					// This gets used in the table view
                    rawData[s] = [];
					rawData[s].item = json.name;
					rawData[s].data = seriesData;

//                    graphInfoItems[4 + s] = [];
//                    graphInfoItems[4 + s].name = json.series[s].label + " points";
//                    graphInfoItems[4 + s].value = json.series[s].pointsRet + " / " + json.series[s].pointsTot;

                    // Get the configuration data
//                    var dmDev = getDMDevice(json.series[s].Id);

                    // Get the axis
//                    var yAxis = 0;
//                    for (var c = 0; c < channels.length; c++) {
//                        if (channels[c].value == dmDev.Id) {
//                            yAxis = channels[c].axis;
//                            break;
//                        }
//                    }


                    // If ticks are provided, add categories to the graph
//                    if (json.series[s].ticks) {
//                        if(json.series[s].ticks.length > 0) {
//                            chartOptions.yAxis[yAxis].categories = new Array();
//                            for (var t = 0; t < json.series[s].ticks.length; t++) {
//                                chartOptions.yAxis[yAxis].categories[json.series[s].ticks[t][1]] = json.series[s].ticks[t][0];
//                            }
//                        }
//                    }

                    options.series[s] = [];
                    options.series[s].data = seriesData;
                    options.series[s].name = json.name;//json.series[s].label;
                    options.series[s].yAxis = 0;//yAxis;
//                    options.series[s].color = '#FF0000';
                    //options.series[s].marker = true;

//                    if (dmDev == null)
                    options.series[s].type = "spline";
                    /*                    else {
                     switch (dmDev.Type) {
                     case 1:
                     options.series[s].type = "line";
                     break;
                     case 2:
                     options.series[s].type = "scatter";
                     //                                chartOptions.scatter.marker.enabled = true;
                     break;
                     case 3:
                     case 4:
                     options.series[s].type = "area";
                     break;
                     default:
                     options.series[s].type = "spline";
                     break;
                     }
                     }*/
//                }

                    this.chartObject = new Highcharts.Chart(options);
//            }
            if (json.timestart) {
                    chartMin = parseInt(json.timestart);
                    chartMax = parseInt(json.timeend);

                if ((chartMax - chartMin) < 300)
                    Ext.getCmp('chartTb-zoomIn').disable();
                else
                    Ext.getCmp('chartTb-zoomIn').enable();
            }

                    graphInfoItems[2] = [];
                    graphInfoItems[2].name = "Render Time";
                    graphInfoItems[2].value = (new Date()).getTime() - timeStart + " ms";
                    graphInfoItems[3] = [];
                    graphInfoItems[3].name = "Total Time";
                    graphInfoItems[3].value = (new Date()).getTime() - timeInit + " ms";

                    Ext.MessageBox.hide();

                    toolbarEnable();
                    if (json.error) {
                        Ext.MessageBox.show({
                            msg:'Warning: ' + json.error,
                            width:200,
                            draggable:false,
                            icon:'icon-warning',
                            closable:false
                        });
                        setTimeout(function () {
                            Ext.MessageBox.hide();
                        }, 2500);
                    }
                },
                failure:function (response, opts) {
                    Ext.MessageBox.hide();
                    Ext.MessageBox.show({
                        msg:'Error downloading data: Response ' + response.status,
                        width:200,
                        draggable:false,
                        icon:'icon-error',
                        closable:false
                    });
                    setTimeout(function () {
                        Ext.MessageBox.hide();
                    }, 2500);
                }
            });
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
        };

        function doGraphTime(days) {
            var ts = Math.round((new Date()).getTime());
            updateChart(chartChannels, ts - (days * 86400000), ts);
        };



        // -----------------------
        // Main initComponent code

        var highchartsToolbar = Ext.create('Ext.toolbar.Toolbar', {
            items:[
                {
                    icon:'images/zoom_in.png',
                    id:'chartTb-zoomIn',
                    disabled:true,
                    cls:'x-btn-icon',
                    tooltip:'Zoom In',
                    handler:function () {
                        var zoom;
                        var min;
                        var max;

                        zoom = (chartMax - chartMin) / 5;
                        min = chartMin + zoom;
                        max = chartMin - zoom;
                        updateChart(chartChannels, min, max);
                    }
                },
                {
                    icon:'images/zoom_out.png',
                    id:'chartTb-zoomOut',
                    disabled:true,
                    cls:'x-btn-icon',
                    tooltip:'Zoom Out',
                    handler:function () {
                        var zoom;

                        zoom = (chartMax - chartMin) / 5;
                        updateChart(chartChannels, chartMin - zoom, chartMax + zoom);
                    }
                },
                '-',
                {
                    icon:'images/calendar-select.png',
                    id:'chartTb-viewDay',
                    disabled:true,
                    cls:'x-btn-icon',
                    tooltip:'Display last day',
                    handler:function () {
                        doGraphTime(1);
                    }
                },
                {
                    icon:'images/calendar-select-week.png',
                    id:'chartTb-viewWeek',
                    disabled:true,
                    cls:'x-btn-icon',
                    tooltip:'Display last week',
                    handler:function () {
                        doGraphTime(7);
                    }
                },
                {
                    icon:'images/calendar-select-month.png',
                    id:'chartTb-viewMonth',
                    disabled:true,
                    cls:'x-btn-icon',
                    tooltip:'Display last month',
                    handler:function () {
                        doGraphTime(30);
                    }
                },
                {
                    icon:'images/calendar.png',
                    id:'chartTb-viewYear',
                    disabled:true,
                    cls:'x-btn-icon',
                    tooltip:'Display last year',
                    handler:function () {
                        doGraphTime(365);
                    }
                },
                '-',
                {
                    icon:'images/arrow_left.png',
                    id:'chartTb-scrollLeft',
                    disabled:true,
                    cls:'x-btn-icon',
                    tooltip:'Scroll left',
                    handler:function () {
                        var scroll;

                        scroll = (chartMax - chartMin) / 5;
                        updateChart(chartChannels, chartMin - scroll, chartMax - scroll);
                    }
                },
                {
                    icon:'images/arrow_right.png',
                    id:'chartTb-scrollRight',
                    disabled:true,
                    cls:'x-btn-icon',
                    tooltip:'Scroll right',
                    handler:function () {
                        var scroll;

                        scroll = (chartMax - chartMin) / 5;
                        updateChart(chartChannels, chartMin + scroll, chartMax + scroll);
                    }
                },
                '-',
                {
                    icon:'images/clock.png',
                    id:'chartTb-realTime',
                    disabled:true,
                    cls:'x-btn-icon',
                    tooltip:'Display real-time graph',
                    handler:function () {
                    }
                },
                { xtype:'tbfill' },
                {
                    icon:'images/information-balloon.png',
                    id:'chartTb-info',
                    cls:'x-btn-icon',
                    disabled:true,
                    tooltip:'Display information on current graph',
                    handler:function () {
                        Ext.create('Ext.data.Store', {
                            storeId:'graphInfoStore',
                            fields:['name', 'value'],
                            data:graphInfoItems
                        });

                        var graphInfoGrid = Ext.create('Ext.grid.Panel', {
                            hideHeaders:true,
                            store:Ext.data.StoreManager.lookup('graphInfoStore'),
                            columns:[
                                { text:'Name', dataIndex:'name', width:250 },
                                { text:'Value', dataIndex:'value', flex:1 }
                            ],
                            disableSelection:true,
                            viewConfig:{
                                trackOver:false
                            }
                        });

                        var grWin = Ext.create('Ext.Window', {
                            title:'Graph Information',
                            width:350,
                            height:300,
                            modal:true,
                            resizable:false,
                            draggable:false,
                            itemId:'chartInfo',
                            id:'chartInfo',
                            items:[graphInfoGrid]
                        });

                        grWin.show();
                        grWin.alignTo(Ext.get("chartIsHere"), "tr-tr");
                    }
                }
            ]
        });

        var highchartsPanel = Ext.create('Ext.panel.Panel', {
            itemId:'chartPanel',
            id:'chartPanel',
            xtype:'panel',
            tbar:highchartsToolbar,
            flex:1,
//            region:'center',
            maintainFlex:true,
            border:false,
            layout:'fit',
            items:[
                {
                    itemId:'chartIsHere',
                    id:'chartIsHere',
                    listeners:{
                        resize:function (comp, width, height, oldWidth, oldHeight, eOpts) {
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

        this.chartUpdate=function(channels, start, stop) {
            updateChart(channels, start, stop);
        }
        this.getData=function() {
            return rawData;
        }
        this.lastUpdate=function() {
            return lastUpdate;
        }
    }
})
;



