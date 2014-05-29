define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dijit/layout/BorderContainer",
        "dijit/Toolbar",
        "dijit/form/Button",
        "dojo/request",

        "dojox/charting/widget/Chart",
        "dojox/charting/themes/PlotKit/blue",
        "dojox/charting/axis2d/Default",
        "dojox/charting/plot2d/Lines"
    ],
    function (declare, lang, array, Container, Toolbar, Button, request, Chart, theme) {
        return declare(Container, {
            postCreate: function () {
                this._createChart();
            },
            startup: function() {
                this.inherited(arguments);
                this.resize();
            },
            _createChart: function() {
                this.chartWidget = new Chart({region : "center"});
                this.addChild(this.chartWidget);
                this.chart = this.chartWidget.chart;
                this.chart.setTheme(theme);
            },
            loadChart: function(chartRef) {
                console.log("Loading chart: " + chartRef);

                request("http://localhost:8080/services/habmin/persistence/charts/" + chartRef, {
                    timeout: 5000,
                    handleAs: 'json',
                    preventCache: true,
                    headers: {
                        "Content-Type": 'application/json; charset=utf-8',
                        "Accept": "application/json"
                    }
                }).then(
                    lang.hitch(this, function (data) {
                        console.log("The chart definition is: ", data);
                        this.chartDef = data;
                        array.forEach(data.items, lang.hitch(this, function(item, ref) {
                            this._loadItem(item.item);
                        }));
                    }),
                    lang.hitch(this, function (error) {
                        console.log("An error occurred: " + error);
                    })
                );
            },
            _loadItem: function(itemRef, start, stop) {
                var parms = {};
                parms.start = 0;
                parms.stop = 0;

                request("http://localhost:8080/services/habmin/persistence/services/db4o/" + itemRef, {
                    timeout: 15000,
                    data: parms,
                    handleAs: 'json',
                    preventCache: true,
                    headers: {
                        "Content-Type": 'application/json; charset=utf-8',
                        "Accept": "application/json"
                    }
                }).then(
                    lang.hitch(this, function (data) {
                        console.log("The item definition is: ", data);
                        this._addChartItem(data);
                    }),
                    lang.hitch(this, function (error) {
                        console.log("An error occurred: " + error);
                    })
                );
            },
            _addChartItem: function(item) {
                function labelfTime(o) {
                    var dt = new Date();
                    dt.setTime(o);
                    var d = (dt.getMonth() + 1) + "/" + dt.getDate() + "/" + dt.getFullYear();
                    return d;
                }

                var itemCfg = null;
                array.forEach(this.chartDef.items, lang.hitch(this, function(cfg, i) {
                    if(cfg.item == item.name) {
                        itemCfg = cfg;
                    }
                }));

                this.chart.addPlot("default", {
                    type: "Lines"
                });

                var data = new Object();
                data.pts = new Array();

                array.forEach(item.data, lang.hitch(this, function(value, i) {
                    value.y = Number(value.state);
                    value.x = Number(value.time);
                    data.pts.push(value);
                }));
                // set up axis and specify label function for dates
                this.chart.addAxis("x", {labelFunc: labelfTime});
                this.chart.addAxis("y", {vertical: true});
                this.chart.addSeries(item.name, data.pts, {stroke:  {width: itemCfg.lineWidth, color: itemCfg.lineColor}});
                this.chart.render();
            }
        })
    });