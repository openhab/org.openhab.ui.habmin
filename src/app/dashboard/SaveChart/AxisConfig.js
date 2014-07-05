define([
        "dojo/_base/declare",
        "dojo/_base/lang",

        "dojox/layout/TableContainer",

        "dijit/form/ValidationTextBox",
        "dijit/form/NumberSpinner",
        "dijit/form/Select",
        "app/dashboard/SaveChart/ColorSelectButton",

        "dojo/i18n!app/nls/SaveChart"
    ],
    function (declare, lang, TableContainer, TextBox, NumberSpinner, Select, ColorButton, langSaveChart) {

        return declare([TableContainer], {
            cols: 1,
            labelWidth: "150",

            cfgType: 'axis',
            cfgLabel: "",
            cfgFormat: "",
            cfgColor: "",
            cfgMinimum: "",
            cfgMaximum: "",

            postCreate: function () {
                this.inherited(arguments);
                var childStyle = "width:98%";

                this.labelEditor = new TextBox({
                    label: langSaveChart.Label,
                    style: childStyle,
                    value: this.cfgLabel
                });
                this.formatEditor = new TextBox({
                    label: langSaveChart.Format,
                    style: childStyle,
                    value: this.cfgFormat
                });
                this.colorEditor = new ColorButton({
                    label: langSaveChart.Color,
                    style: childStyle,
                    colorValue: this.cfgColor
                });
                this.minimumEditor = new NumberSpinner({
                    label: langSaveChart.Minimum,
                    style: childStyle,
                    value: this.cfgMinimum
                });
                this.maximumEditor = new NumberSpinner({
                    label: langSaveChart.Maximum,
                    style: childStyle,
                    value: this.cfgMaximum
                });

                this.addChild(this.labelEditor);
                this.addChild(this.formatEditor);
                this.addChild(this.colorEditor);
                this.addChild(this.minimumEditor);
                this.addChild(this.maximumEditor);
            },
            updateData: function () {
            }
        })
    });
