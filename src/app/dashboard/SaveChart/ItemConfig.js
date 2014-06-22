define([
        "dojo/_base/declare",
        "dojo/_base/lang",

        "dojox/layout/TableContainer",

        "dijit/form/ValidationTextBox",
        "dijit/form/NumberSpinner",
        "dijit/form/Select",
        "dijit/form/CheckBox",
        "dijit/ColorPalette",

        "app/dashboard/SaveChart/ColorSelectButton",

        "dojo/i18n!app/nls/SaveChart"
    ],
    function (declare, lang, TableContainer, TextBox, NumberSpinner, Select, CheckBox, ColorPalette, ColorButton, langSaveChart) {
        return declare([TableContainer], {
            cols: 1,
            labelWidth: "150",

            cfgItem: "",
            cfgLabel: "",
            cfgAxis: 1,
            cfgType: "",
            cfgLineColor: "",
            cfgLineWidth: 1,
            cfgLineStyle: "",
            cfgMarkerColor: "",
            cfgMarkerStyle: "",
            cfgLegend: true,

            postCreate: function () {
                this.inherited(arguments);
                var childStyle = "width:98%";

                this.itemEditor = new TextBox({
                    label: langSaveChart.Item,
                    style: childStyle,
                    value: this.cfgItem
                });
                this.labelEditor = new TextBox({
                    label: langSaveChart.Label,
                    style: childStyle,
                    value: this.cfgLabel
                });
                this.typeEditor = new TextBox({
                    label: langSaveChart.ChartType,
                    style: childStyle,
                    value: this.cfgType
                });
                this.axisEditor = new NumberSpinner({
                    label: langSaveChart.Axis,
                    style: childStyle,
                    value: this.cfgAxis,
                    required: true,
                    constraints:{ min:1, max:2 },
                    invalidMessage: langSaveChart.AxisInvalid
                });
                this.lineColorEditor = new ColorButton({
                    label: langSaveChart.LineColor,
                    style: childStyle,
                    colorValue: this.cfgLineColor
                });
                this.lineWidthEditor = new NumberSpinner({
                    label: langSaveChart.LineWidth,
                    style: childStyle,
                    value: this.cfgLineWidth,
                    required: true,
                    constraints:{ min:0, max:30 },
                    invalidMessage: langSaveChart.LineWidthInvalid
                });
                this.lineStyleEditor = new TextBox({
                    label: langSaveChart.LineStyle,
                    style: childStyle,
                    value: this.cfgLineStyle
                });
                this.markerColorEditor = new ColorButton({
                    label: langSaveChart.MarkerColor,
                    style: childStyle,
                    value: this.cfgMarkerColor
                });
                this.markerStyleEditor = new Select({
                    label: langSaveChart.MarkerStyle,
                    style: childStyle,
                    value: this.cfgMarkerStyle
                });
                this.legendEditor = new CheckBox({
                    label: langSaveChart.DisplayLegend,
                    style: childStyle,
                    value: this.cfgLegend
                });
                this.timeEditor = new NumberSpinner({
                    label: langSaveChart.RepeatTime,
                    style: childStyle,
                    value: this.cfg
                });

                this.addChild(this.itemEditor);
                this.addChild(this.labelEditor);
                this.addChild(this.axisEditor);
                this.addChild(this.lineColorEditor);
                this.addChild(this.lineWidthEditor);
                this.addChild(this.lineStyleEditor);
                this.addChild(this.markerColorEditor);
                this.addChild(this.markerStyleEditor);
                this.addChild(this.legendEditor);
                this.addChild(this.timeEditor);
            }
        })
    });
