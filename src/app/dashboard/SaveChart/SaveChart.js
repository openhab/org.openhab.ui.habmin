define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/on",
        "dojo/_base/array",
        "dojo/dom",
        "dojo/Evented",
        "dojo/_base/Deferred",
        "dojo/json",
        "dojo/dom-construct",
        "dojo/dom-style",
        "dojo/request",

        "dojo/json",
        "dojox/string/sprintf",

        "app/main/Notification",

        "dijit/layout/StackContainer",
        "dijit/layout/StackController",

        "app/dashboard/SaveChart/GeneralConfig",
        "app/dashboard/SaveChart/ItemConfig",
        "app/dashboard/SaveChart/AxisConfig",

        "dijit/_Widget",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",

        "dijit/Dialog",
        "dijit/form/Form",

        "dojo/i18n!dijit/nls/common",
        "dojo/i18n!app/nls/SaveChart"

    ],
    function (declare, lang, on, array, dom, Evented, Deferred, JSON, domConstruct, domStyle, request, json, sprintf, Notification, StackContainer, StackController, GeneralConfig, ItemConfig, AxisConfig, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, Dialog, Form, langCommon, langSaveChart) {

        return declare([Dialog, Evented], {
            title: langSaveChart.WindowTitle,

            defaultColors: [
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

            constructor: function (/*Object*/ kwArgs) {
                lang.mixin(this, kwArgs);
                var dialogTemplate = dojo.cache('app.dashboard.SaveChart', 'SaveChartForm.html');

                var contentWidget = new (declare(
                    [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin],
                    {
                        templateString: dialogTemplate
                    }
                ));
                contentWidget.startup();
                var content = this.content = contentWidget;
//                this.form = content.form;
                // shortcuts
                this.submitButton = content.submitButton;
                this.cancelButton = content.cancelButton;
                this.pagePane = content.pagePane;
                this.optionPane = content.optionPane;
            },

            postCreate: function () {
                this.inherited(arguments);

                // Initialise the notification system
                this.notification = Notification();

                // Set the button names - for internationalisation
                this.submitButton.set("label", langCommon.buttonSave);
                this.cancelButton.set("label", langCommon.buttonCancel);

                this.connect(this.submitButton, "onClick", "onSubmit");
                this.connect(this.cancelButton, "onClick", "onCancel");

                this.watch("readyState", lang.hitch(this, "_onReadyStateChange"));

//                this.form.watch("state", lang.hitch(this, "_onValidStateChange"));
                this._onValidStateChange();

                this.stackContainer = new StackContainer({
                    style:"height:350px;width:410px;",
                    doLayout:false,
                    isLayoutContainer: false
                }, this.pagePane);

                // Children loaded here

                var controller = new StackController({
                    style:"height:350px;width:290px;",
                    containerId: this.stackContainer.domNode.id
                }, this.optionPane);

                controller.startup();
                this.stackContainer.startup();
                this.stackContainer.resize();
            },

            onSubmit: function () {
                // Loop through all children and validate data
                var children = this.stackContainer.getChildren()

                // Generate the chart definition
                var chartDef = {
                    id: this.chartId,
                    axis: [],
                    items: []
                };

                array.forEach(children, lang.hitch(this, function(child) {
                    child.updateData();
                    switch(child.cfgType) {
                        case 'general':
                            chartDef.icon = child.cfgIcon;
                            chartDef.name = child.cfgName;
                            chartDef.period = child.cfgPeriod;
                            break;
                        case 'item':
                            var itemCfg = {};
                            itemCfg.item = child.cfgItem;
                            itemCfg.label = child.cfgLabel;
                            itemCfg.lineColor = child.cfgLineColor;
                            itemCfg.lineWidth = child.cfgLineWidth;
                            itemCfg.lineStyle = child.cfgLineStyle;
                            itemCfg.axis = child.cfgAxis;
                            itemCfg.repeatTime = child.cfgRepeatTime;
                            chartDef.items.push(itemCfg);
                            break;
                        case 'axis':
                            var axisCfg = {};
                            axisCfg.label = child.cfgLabel;
                            axisCfg.format = child.cfgFormat;
                            axisCfg.color = child.cfgColor;
                            axisCfg.minimum = child.cfgMinimum;
                            axisCfg.maximum = child.cfgMaximum;
                            chartDef.axis.push(axisCfg);
                            break;
                    }
                }));

                // All ok? Send to openHAB
                var jsonData = json.stringify(chartDef);

                request("/services/habmin/persistence/charts/" + + (this.chartId == null ? "" : this.chartId), {
                    method: this.chartId == null ? 'POST' : 'PUT',
                    timeout: 5000,
                    data: jsonData,
                    handleAs: 'json',
                    preventCache: true,
                    headers: {
                        "Content-Type": 'application/json; charset=utf-8',
                        "Accept": "application/json"
                    }
                }).then(
                    lang.hitch(this, function (data) {
                        this.notification.alert(this.notification.SUCCESS,
                            sprintf(langSaveChart.ChartSavedOk, chartDef.name));

                        console.log("The rule source response is: ", data);
                        this.blockEditor.setBlocks(data);
                        this.codeEditor.setCode(data.source);


                    }),
                    lang.hitch(this, function (error) {
                        this.notification.alert(this.notification.ERROR,
                            sprintf(langSaveChart.ErrorSavingChart, chartDef.name));
                        console.log("An error occurred with rule source response: " + error);
                    })
                );
            },

            _onValidStateChange: function () {
//                this.submitButton.set("disabled", !!this.form.get("state").length);
            },

            _onReadyStateChange: function () {
                var isBusy = this.get("readyState") == this.BUSY;
            },

            hide: function() {
                this.destroyRecursive(false);
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

                array.forEach(items, lang.hitch(this, function (item) {
                    this._loadItem(item, this.chartStart, this.chartStop);
                }));
            },

            loadChart: function (chartRef) {
                console.log("Loading chart: " + chartRef);

                this.chartId = chartRef;

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

                        // Update the configuration
                        this._updateData(data);
                    }),
                    lang.hitch(this, function (error) {
                        console.log("An error occurred: " + error);
                    })
                );
            },
            _updateData: function(chartDef) {
                var child;
                var childStyle = "height:270px";

                // Add the general configuration
                child = new GeneralConfig({
                    style: childStyle,
                    title:langSaveChart.General,
                    cfgPeriod: chartDef.period,
                    cfgIcon: chartDef.icon,
                    cfgName: chartDef.name,
                    cfgTitle: ""
                });
                this.stackContainer.addChild(child);

                // Add all the items
                var colorRef = 0;
                array.forEach(chartDef.items, lang.hitch(this, function (item) {
                    if(item.lineColor == null || item.lineColor.length == 0)
                        item.lineColor = this.defaultColors[colorRef++];
                    if(item.lineStyle == null || item.lineStyle.length == 0)
                        item.lineStyle = "Solid";
                    child = new ItemConfig({
                        style: childStyle,
                        title: item.item,
                        cfgItem: item.item,
                        cfgLabel: item.label,
                        cfgAxis: item.axis,
                        cfgLineColor: item.lineColor,
                        cfgLineWidth: item.lineWidth,
                        cfgLineStyle: item.lineStyle
 //                       cfgMarkerColor: item.,
 //                       cfgMarkerStyle: ""
                    });
                    this.stackContainer.addChild(child);
                }));

                array.forEach(chartDef.axis, lang.hitch(this, function (axis) {
                    switch(parseInt(axis.axis)) {
                        case 1:
                            // Add the axis configuration
                            child = new AxisConfig({
                                style: childStyle,
                                title:langSaveChart.Axis1,
                                cfgLabel: axis.label,
                                cfgColor: axis.color,
                                cfgFormat: axis.format,
                                cfgMaximum: axis.maximum,
                                cfgMinimum: axis.minimum
                            });
                            this.stackContainer.addChild(child);
                            break;
                        case 2:
                            child = new AxisConfig({
                                style: childStyle,
                                title:langSaveChart.Axis2,
                                cfgLabel: axis.label,
                                cfgColor: axis.color,
                                cfgFormat: axis.format,
                                cfgMaximum: axis.maximum,
                                cfgMinimum: axis.minimum
                            });
                            this.stackContainer.addChild(child);
                            break;
                    }
                }));
            }
        })
    });
