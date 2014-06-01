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
        "app/dashboard/SelectableLegend",
        "dojox/charting/action2d/Tooltip",
        "dojox/charting/themes/PlotKit/blue",
        "dojox/charting/axis2d/Default",
        "dojox/charting/plot2d/Lines"
    ],
    function (declare, lang, array, domClass, Container, Toolbar, Button, request, Chart, Legend, Tooltip) {
        return declare(Container, {
            chartLegend: true,
            tooltips:true,

            gutters: false,
            colors: [
                '#2f7ed8',
                '#0d233a',
                '#8bbc21',
                '#910000',
                '#1aadce',
                '#492970',
                '#f28f43',
                '#77a1e5',
                '#c42525',
                '#a6c96a'
            ],
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
            loadItems: function (items) {
                items = [].concat(items);

                // Create the chart definition
                this.chartDef = {};
                this.chartDef.items = [];
                array.forEach(items, lang.hitch(this, function (item) {
                    var newItem = {};
                    newItem.item = item;
                    this.chartDef.items.push(newItem);
                }));

                this._sanityCheck(this.chartDef);

                this.itemsTotal = items.length;
                this.itemsLoaded = 0;

                this._createPlots();

                this.chartStop = Math.round((new Date()).getTime());
                this.chartStart = this.chartStop - (2 * 86400 * 1000);
                array.forEach(items, lang.hitch(this, function (item) {
                    this._loadItem(item, this.chartStart, this.chartStop);
                }));
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
                        this._sanityCheck(data);
                        data.items = [].concat(data.items);
                        this.chartDef = data;
                        this.itemsTotal = data.items.length;
                        this.itemsLoaded = 0;

                        this._createPlots();

                        this.chartStop = Math.round((new Date()).getTime());
                        this.chartStart = this.chartStop - (data.period * 1000);
                        array.forEach(data.items, lang.hitch(this, function (item) {
                            this._loadItem(item.item, this.chartStart, this.chartStop);
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
                parms.starttime = start;
                parms.endtime = stop;

                request("/services/habmin/persistence/services/mysql/" + itemRef, {
                    timeout: 15000,
                    query: parms,
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
            _createPlots: function () {
                // Loop through the items and create a plot for each graph type
                array.forEach(this.chartDef.items, lang.hitch(this, function (item, ref) {
                 //   this.chartDef.items[ref].plotName = "line1";
                   // this.chartDef.items[ref].plotType = "Lines";

                    var axis = 1;
                    if(item.axis > 0)
                        axis = item.axis;

                    switch (item.chart) {
                        default:
                            this.chartDef.items[ref].plotType = "Lines";
                            break;
                        case 'bar':
                            this.chartDef.items[ref].plotType = "Bar";
                            break;
                    }
                    this.chartDef.items[ref].plotName = this.chartDef.items[ref].plotType + axis;

                    var plotOptions = {};
                    plotOptions.type = this.chartDef.items[ref].plotType;
                    plotOptions.hAxis = "x";
                    plotOptions.vAxis = "y"+axis;
//                    plotOptions.markers= false;

//                    tension: "X"//,
//                    markers: itemCfg.markerSymbol == "" ? false : true,
//                    stroke: {width: 0}

                    // Only add the plot if it doesn't already exist
                    if(this.chart.getPlot(this.chartDef.items[ref].plotName) == null) {
                        console.log("Adding plot " + this.chartDef.items[ref].plotName + ":", plotOptions)
                        this.chart.addPlot(this.chartDef.items[ref].plotName, plotOptions);

                        if(this.tooltips == true) {
                            new Tooltip(this.chart, this.chartDef.items[ref].plotName, {text: this._tooltipFunction});
                        }
                    }
                }));

               // _calculateXTicks();

                // Create the x (time) axis
                // TODO: Add time config?
                this.chart.addAxis("x", {labelFunc: labelfTime});

                // Now loop through and create all the axis
                if(this.chartDef.axis == null) {
                    // No axis are defined - create a default
                    console.log("Adding default axis 'y1'");
                    this.chart.addAxis("y1", {vertical: true});
                }
                else {
                    this.chartDef.axis = [].concat(this.chartDef.axis);
                    array.forEach(this.chartDef.axis, lang.hitch(this, function (axis, ref) {
                        if(axis == null)
                            return;

                        var axisOptions = {};
                        axisOptions.vertical = true;

                        if(axis.minimum != null && axis.minimum.length > 0)
                            axisOptions.min = Number(axis.minimum);
                        if(axis.maximum != null && axis.maximum.length > 0)
                            axisOptions.max = Number(axis.maximum);
                        if(axis.label != null && axis.label.length > 0) {
                            axisOptions.title = axis.label;
                            if(axis.color != null && axis.color.length > 0) {
                                axisOptions.titleFontColor = axis.color;
                                axisOptions.fontColor = axis.color
                            }
                        }
                        if(axis.position == "right") {
                            axisOptions.leftBottom = false;
                        }

                        console.log("Adding axis 'y" + axis.axis + "' :", axisOptions);
                        this.chart.addAxis('y'+axis.axis, axisOptions);
                    }));
                }

                // TODO: This needs more work.
                // We need to find a way to set an appropriate start for the first label (on a nice round time period)
                // And then set the incremenet between ticks to another sensible time period
                function labelfTime(o) {
                    var dt = new Date();
                    dt.setTime(Number(o));
                    var d = dt.getHours() + ":" + dt.getMinutes() + " " + (dt.getDate() + 1) + "/" + (dt.getMonth()+1) +
                        "/" + dt.getFullYear();
                    return d;
                }
            },
            _addChartItem: function (item) {
                console.log("Adding", item.name);

                // Find the chart config for this item
                var itemCfg = null;
                array.forEach(this.chartDef.items, lang.hitch(this, function (cfg, i) {
                    if (cfg.item == item.name) {
                        itemCfg = cfg;
                    }
                }));

                var data = new Array();

                array.forEach(item.data, lang.hitch(this, function (value, i) {
                    var newVal = {};
                    newVal.y = Number(value.state);
                    newVal.x = Number(value.time);
                    data.push(newVal);
                }));
                var plotOptions = {
                    plot: itemCfg.plotName,
                    stroke: {}//,
//                    marker: dojox.charting.Theme.DIAMOND
                };
                if (itemCfg.lineStyle != undefined && itemCfg.lineStyle.length > 0)
                    plotOptions.stroke.style = itemCfg.lineStyle;
                if (itemCfg.lineWidth != undefined && itemCfg.lineWidth.length > 0)
                    plotOptions.stroke.width = itemCfg.lineWidth;
                if (itemCfg.lineColor != undefined && itemCfg.lineColor.length > 0)
                    plotOptions.stroke.color = itemCfg.lineColor;
                console.log("Adding item " + item.name + ":", plotOptions);
                if(itemCfg.label == null)
                    this.chart.addSeries(item.name, data, plotOptions);
                else
                    this.chart.addSeries(itemCfg.label, data, plotOptions);

                // If everything is loaded, create the legend and render
                this.itemsLoaded++;
                console.log("Loaded " + this.itemsLoaded + " of " + this.itemsTotal);
                if (this.itemsLoaded >= this.itemsTotal) {
                    console.log("Rendering chart");
                    if (this.chartLegend == true) {
                        this.legend = new Legend({region: "bottom", chartRef: this.chart});
                        this.addChild(this.legend);
                        this.legend.refresh();
                    }
                    this.chart.render();
                }
            },
            _sanityCheck: function (config) {
                array.forEach(config.items, lang.hitch(this, function (item, ref) {
                    if (item.lineStyle == undefined || item.lineStyle.length == 0)
                        config.items[ref].lineStyle = "Solid";
                    if (item.lineWidth == undefined || item.lineWidth.length == 0)
                        config.items[ref].lineWidth = 1;
                    if (item.lineColor == undefined || item.lineColor.length == 0)
                        config.items[ref].lineColor = this.colors[ref];
                }));
            },
            _tooltipFunction: function() {
                return "Tooltip here!";
            },
            _calculateXTicks: function() {
                // Derive x labels
                var span = this.chartStop - this.chartStart;

                // X - holds the time between ticks
                var x = span / 8;

                // Define the mode
                var mode = 0;
                if(x < 3600000)
                    mode = 1;
                else (x < 86400000)
                    mode = 2;

                switch(mode) {
                    case 0:
                        break;
                    case 2:
//                        if()
                        break;
                }
            }

        })
    });
