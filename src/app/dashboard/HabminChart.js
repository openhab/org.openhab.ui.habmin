define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/dom-class",
        "dijit/layout/BorderContainer",
        "dijit/Toolbar",
        "dijit/form/Button",
        "dojo/request",

        "dojox/charting/widget/Chart",
        "dojox/charting/widget/SelectableLegend",
        "dojox/charting/themes/PlotKit/blue",
        "dojox/charting/axis2d/Default",
        "dojox/charting/plot2d/Lines"
    ],
    function (declare, lang, array, domClass, Container, Toolbar, Button, request, Chart, Legend) {
        return declare(Container, {
            chartLegend: true,

            gutters: false,
            postCreate: function () {
                domClass.add(this.domNode, "habminChildNoPadding");
                this._createChart();
            },
            startup: function () {
                this.inherited(arguments);
                this.resize();
                this.chart.resize();
            },
            _createChart: function () {
                this.chartWidget = new Chart({region: "center"});

                this.addChild(this.chartWidget);
                this.chart = this.chartWidget.chart;
            },
            loadChart: function (chartRef) {
                console.log("Loading chart: " + chartRef);

                request("/services/habmin/persistence/charts/" + chartRef, {
                    timeout: 5000,
                    handleAs: 'json',
                    preventCache: true,
                    headers: {
                        "Content-Type": 'application/json; charset=utf-8',
                        "Accept": "application/json"
                    }
                }).then(
                    lang.hitch(this, function (data) {
                        console.log("The chart definition is:", data);
                        data.items = [].concat(data.items);
                        this.chartDef = data;
                        this.itemsTotal = data.items.length;
                        this.itemsLoaded = 0;
                        var stop = Math.round((new Date()).getTime());
                        var start = stop - (data.period * 1000);
                        array.forEach(data.items, lang.hitch(this, function (item, ref) {
                            this._loadItem(item.item, start, stop);
                        }));
                    }),
                    lang.hitch(this, function (error) {
                        console.log("An error occurred: " + error);
                    })
                );
            },
            _loadItem: function (itemRef, start, stop) {
                console.log("Requesting " + itemRef);
                var parms = {};
                parms.start = 0;
                parms.stop = 0;

                request("/services/habmin/persistence/services/mysql/" + itemRef, {
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
            _addChartItem: function (item) {
                console.log("Adding", item.name);
                function labelfTime(o) {
                    var dt = new Date();
                    dt.setTime(o);
                    var d = (dt.getMonth() + 1) + "/" + dt.getDate() + "/" + dt.getFullYear();
                    return d;
                }

                var itemCfg = null;
                array.forEach(this.chartDef.items, lang.hitch(this, function (cfg, i) {
                    if (cfg.item == item.name) {
                        itemCfg = cfg;
                    }
                }));

                this.chart.addPlot("default", {
                    type: "Lines"//,
//                    tension: "X"//,
//                    markers: itemCfg.markerSymbol == "" ? false : true,
//                    stroke: {width: 0}
                });

                var data = new Object();
                data.pts = new Array();

                array.forEach(item.data, lang.hitch(this, function (value, i) {
                    var newVal = {};
                    newVal.y = Number(value.state);
                    newVal.x = Number(value.time);
                    data.pts.push(newVal);
                }));
                // set up axis and specify label function for dates
                this.chart.addAxis("x", {labelFunc: labelfTime});
                this.chart.addAxis("y", {vertical: true});
                var plotOptions = {
                    plot: "default",
                    stroke: {},
                    marker: dojox.charting.Theme.DIAMOND
                };
                if (itemCfg.lineStyle != undefined && itemCfg.lineStyle.length > 0)
                    plotOptions.stroke.style = itemCfg.lineStyle;
                if (itemCfg.lineWidth != undefined && itemCfg.lineWidth.length > 0)
                    plotOptions.stroke.width = itemCfg.lineWidth;
                if (itemCfg.lineColor != undefined && itemCfg.lineColor.length > 0)
                    plotOptions.stroke.color = itemCfg.lineColor;
                this.chart.addSeries(item.name, data.pts, plotOptions);

                // If everything is loaded, create the legend and render
                this.itemsLoaded++;
                console.log("Loaded " + this.itemsLoaded + " of " + this.itemsTotal);
                if (this.itemsLoaded >= this.itemsTotal) {
                    console.log("Rendering chart");
                    this.chart.render();

                    if (this.chartLegend == true) {
                        this.legend = new Legend({region: "bottom", chartRef: this.chart});
                        this.addChild(this.legend);
                        this.legend.refresh();
                    }
                }
            }
        })
    });