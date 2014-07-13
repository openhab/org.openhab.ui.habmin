define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/dom-class",
        "dojo/dom-style",
        "dojo/_base/connect",
        "dijit/layout/ContentPane",
        "dijit/layout/BorderContainer",
        "dijit/Toolbar",
        "dijit/form/Button",
        "dojo/request",
        "dojox/string/sprintf",
        "dojo/date/locale",

        "dojox/charting/widget/Chart",
        "dojox/charting/widget/SelectableLegend",
        "dojox/charting/plot2d/Grid",
        "dojox/charting/plot2d/Indicator",
        "dojox/charting/action2d/Tooltip",
        "dojox/charting/themes/PlotKit/blue",
        "dojox/charting/axis2d/Default",
        "dojox/charting/plot2d/Lines"
    ],
    function (declare, lang, array, domClass, domStyle, hub, ContentPane, Container, Toolbar, Button, request, sprintf, locale, Chart, Legend, Grid, Indicator, Tooltip) {
        return declare(Container, {
            chartLegend: true,
            tooltips: true,

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
            axisPos: [],
            postCreate: function () {
                domClass.add(this.domNode, "habminChildNoPadding");
            },
            startup: function () {
                this.inherited(arguments);
                this.resize();
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
                    newItem.item = item.name;
                    newItem.label = item.label;
                    this.chartDef.items.push(newItem);
                }));

                this._sanityCheck(this.chartDef);

                this.itemsTotal = items.length;
                this.itemsLoaded = 0;

                this.chartStop = Math.round((new Date()).getTime());
                this.chartStart = this.chartStop - (2 * 86400 * 1000);

                this._createChart();
                this._createPlots();

                array.forEach(items, lang.hitch(this, function (item) {
                    this._loadItem(item.name, this.chartStart, this.chartStop);
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

                        this.chartStop = Math.round((new Date()).getTime());
                        this.chartStart = this.chartStop - (data.period * 1000);

                        this._createChart();
                        this._createPlots();

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
                console.log("Requesting ", itemRef);
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

                    if (item.axis != "right")
                        item.axis = "left";

                    switch (item.chart) {
                        default:
                            this.chartDef.items[ref].plotType = "Lines";
                            break;
                        case 'bar':
                            this.chartDef.items[ref].plotType = "Bar";
                            break;
                    }
                    this.chartDef.items[ref].plotName = this.chartDef.items[ref].plotType + item.axis;

                    var plotOptions = {};
                    plotOptions.type = this.chartDef.items[ref].plotType;
                    plotOptions.hAxis = "x";
                    plotOptions.vAxis = item.axis;
//                    plotOptions.markers= false;

//                    tension: "X"//,
//                    markers: itemCfg.markerSymbol == "" ? false : true,
//                    stroke: {width: 0}

                    // Only add the plot if it doesn't already exist
                    if (this.chart.getPlot(this.chartDef.items[ref].plotName) == null) {
                        console.log("Adding plot " + this.chartDef.items[ref].plotName + ":", plotOptions)
                        this.chart.addPlot(this.chartDef.items[ref].plotName, plotOptions);

                        if (this.tooltips == true) {
                            new Tooltip(this.chart, this.chartDef.items[ref].plotName, {text: this._tooltipFunction});
                        }
                    }
                }));

                // Create the x (time) axis
                // TODO: Add time config?
                this.chart.addAxis("x", this._calculateXTicks());

                // Now loop through and create all the axis
                if (this.chartDef.axis == null) {
                    // No axis are defined - create a default
                    console.log("Adding default axis 'left'");
                    this.chart.addAxis("left", {vertical: true});
                }
                else {
                    // Reset the axis position
                    this.axisPos[1] = "left";
                    this.axisPos[2] = "left";
                    this.axisPos[3] = "left";
                    this.axisPos[4] = "left";

                    // Make sure the axis list is an array
                    this.chartDef.axis = [].concat(this.chartDef.axis);
                    array.forEach(this.chartDef.axis, lang.hitch(this, function (axis, ref) {
                        if (axis == null)
                            return;

                        var verticalOptions = {vertical: true};

//                        if(axis.label != null && axis.label.length > 0)
//                            verticalOptions.labelFunc = labelVertical;
                        if (axis.minimum != null && axis.minimum.length > 0)
                            verticalOptions.min = Number(axis.minimum);
                        if (axis.maximum != null && axis.maximum.length > 0)
                            verticalOptions.max = Number(axis.maximum);
                        if (axis.label != null && axis.label.length > 0) {
                            verticalOptions.title = axis.label;
                            if (axis.color != null && axis.color.length > 0) {
                                verticalOptions.titleFontColor = axis.color;
                                verticalOptions.fontColor = axis.color
                            }
                        }
                        if (axis.position == "right") {
                            verticalOptions.leftBottom = false;
                        }
                        else {
                            axis.position = "left";
                        }

                        console.log("Adding axis '" + axis.position + "' :", verticalOptions);
                        this.chart.addAxis(axis.position, verticalOptions);

                        if (axis.majorStyle != null) {
                            var gridCfg = {
                                type: Grid,
                                vAxis: axis.position,
                                hMajorLines: !!(axis.majorStyle != null && axis.majorStyle.length != 0 &&
                                    axis.majorStyle != "None"),
                                hMinorLines: !!(axis.minorStyle != null && axis.minorStyle.length != 0 &&
                                    axis.minorStyle != "None"),
                                vMajorLines: false,
                                vMinorLines: false,
                                majorHLine: { style: axis.majorStyle, color: axis.majorColor, width: axis.majorWidth },
                                minorHLine: { style: axis.minorStyle, color: axis.minorColor, width: axis.minorWidth }
                            };
                            console.log("Adding grid ", gridCfg);

                            this.chart.addPlot("grid" + axis.position, gridCfg);
                        }
                    }));
                }

                function labelVertical(o) {
                    return sprintf("%.1f", o);
                }
            },
            _addChartItem: function (item) {
                // Find the chart config for this item
                var itemCfg = null;
                array.forEach(this.chartDef.items, lang.hitch(this, function (cfg, i) {
                    if (cfg.item == item.name) {
                        itemCfg = cfg;
                    }
                }));

                if(itemCfg == null) {
                    console.error("Unable to find definition for ", item, this.chartDef);
                    return;
                }

                // If there's no repeat time, then set it to 'infinity'
                // Otherwise turn into milliseconds
                if (itemCfg.repeatTime == null || itemCfg.repeatTime < 1)
                    itemCfg.repeatTime = 9007199254740000;
                else
                    itemCfg.repeatTime *= 1000;

                console.log("Adding", item.name, "- repeat is ", itemCfg.repeatTime);

                var data = new Array();

                array.forEach(item.data, lang.hitch(this, function (value, ref) {
                    var newVal = {};
                    if (ref != 0) {
                        // Check if we want to extend the data
                        if (value.time - item.data[ref - 1].time > itemCfg.repeatTime) {
                            newVal.y = Number(item.data[ref - 1].state);
                            newVal.x = Number(value.time - itemCfg.repeatTime);
                            data.push(newVal);

                            newVal = {};
                        }
                    }

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
                if (itemCfg.label == null)
                    this.chart.addSeries(item.name, data, plotOptions);
                else
                    this.chart.addSeries(itemCfg.label, data, plotOptions);

                // If everything is loaded, create the legend and render
                this.itemsLoaded++;
                console.log("Loaded " + this.itemsLoaded + " of " + this.itemsTotal);
                if (this.itemsLoaded >= this.itemsTotal) {
                    console.log("Rendering chart");
                    if (this.chartLegend == true) {
                        this.legend = new Legend({chartRef: this.chart});
                        var pane = new ContentPane({region: "bottom", content: this.legend})
                        domClass.add(pane.domNode, "habminChartLegend");

                        this.addChild(pane);
                        this.legend.refresh();

                        // Hide the checkbox from the legend display
                        array.forEach(this.legend.legends, lang.hitch(this, function (legend, i) {
                            domStyle.set(legend.childNodes[0], "display", "none");

                            //	toggle action
                            hub.connect(legend.childNodes[2], "onclick", this, function (e) {
                                domClass.toggle(legend.childNodes[2], "habminLegendDisabled");
                                e.stopPropagation();
                            });
                        }));
                    }

                    if (this.chartDef.title)
                        this.chart.title = this.chartDef.title;

                    this.chart.fullRender();
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

                // Sanity check the period and if it's rubish, make it 1 day
                config.period = parseInt(config.period);
                if(isNaN(config.period) || config.period == 0)
                    config.period = 86400;
            },
            _tooltipFunction: function () {
                return "Tooltip here!";
            },


            _timeTicks: [
                {tick: 5000, bound: 60000, formatTick: "mm:ss", formatBound: "dd EEE HH:mm"},
                {tick: 10000, bound: 60000, formatTick: "mm:ss", formatBound: "dd EEE HH:mm"},
                {tick: 10800000, bound: 86400000, formatTick: "HH:mm", formatBound: "dd EEE HH:mm"},
                {tick: 21600000, bound: 86400000, formatTick: "HH:mm", formatBound: "EEE dd MMM HH:mm"},
                {tick: 43200000, bound: 86400000, formatTick: "HH:mm", formatBound: "EEE dd MMM HH:mm"},
                {tick: 86400000, bound: 604800000, formatTick: "EEE dd", formatBound: "EEE dd MMM"},
                {tick: 100800000, bound: 86400000, formatTick: "HH:mm", formatBound: "dd EEE HH:mm"}
            ],

            _calculateXTicks: function () {
                // Derive x labels
                var span = this.chartStop - this.chartStart;

                // X - holds the time between ticks
                var x = span / 7;

                console.log("Chart start: ", this.chartStart);
                console.log("Chart stop: ", this.chartStop);
                console.log("Chart span: ", span);
                console.log("Chart step: ", x);

                // Now find the step from the tick table
                var step;
                for (var i = this._timeTicks.length - 1; i >= 0; i--) {
                    if (x > this._timeTicks[i].tick) {
                        step = this._timeTicks[i];
                        console.log("Selected tick config ", step);
                        break;
                    }
                }
                ;

                // TODO : Handle local time

                // Get the first tick
                var start = Math.ceil((this.chartStart + 1) / step.tick) * step.tick;

                var config = {
                    min: start - step.tick
                };

                var labels = [];
                var dt = new Date();
                while (start < this.chartStop) {
                    dt.setTime(start);

                    var label = {};
                    label.value = start;
                    if (start % step.bound == 0)
                        label.text = locale.format(dt, {selector: "date", datePattern: step.formatBound});
                    else
                        label.text = locale.format(dt, {selector: "date", datePattern: step.formatTick});
                    labels.push(label);
                    start += step.tick;
                }

                config.labels = labels;
                config.max = start;
                config.from = this.chartStart;
                config.to = this.chartStop;
                config.majorTickStep = step.tick;
                config.minorLabels = false;

                console.log("Chart X-Axis config: ", config);

                return config;
            }

        })
    });
