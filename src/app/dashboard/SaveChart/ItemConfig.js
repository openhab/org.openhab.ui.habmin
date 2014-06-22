define([
        "../../../dojo/_base/declare",
        "dojo/_base/lang",

        "dojox/layout/TableContainer",

        "dijit/form/ValidationTextBox",
        "dijit/form/NumberSpinner",
        "dijit/form/Select",
        "dijit/form/CheckBox",

        "dojo/i18n!app/nls/SaveChart"
    ],
    function (declare, lang, TableContainer, TextBox, NumberSpinner, Select, CheckBox, langSaveChart) {
        return declare([TableContainer], {
            cols: 1,
            labelWidth: "150",

            cfgItem: "",
            cfgLabel: "",
            cfgAxis: 1,
            cfgLineColor: "",
            cfgLineWidth: 1,
            cfgLineStyle: "",
            cfgMarkerColor: "",
            cfgMarkerStyle: "",

            postCreate: function () {
                this.inherited(arguments);

                this.itemEditor = new TextBox({label: langSaveChart.Item,
                    style: "width:100%"
                });
                this.labelEditor = new TextBox({label: langSaveChart.Label,
                    style: "width:100%"
                });
                this.typeEditor = new TextBox({label: langSaveChart.ChartType,
                    style: "width:100%"
                });
                this.axisEditor = new NumberSpinner({label: langSaveChart.Axis,
                    style: "width:100%"
                });
                this.lineColorEditor = new Select({label: langSaveChart.LineColor,
                    style: "width:100%"
                });
                this.lineWidthEditor = new NumberSpinner({label: langSaveChart.LineWidth,
                    style: "width:100%"
                });
                this.lineStyleEditor = new TextBox({label: langSaveChart.LineStyle,
                    style: "width:100%"
                });
                this.markerColorEditor = new Select({label: langSaveChart.MarkerColor,
                    style: "width:100%"
                });
                this.markerStyleEditor = new Select({label: langSaveChart.MarkerStyle,
                    style: "width:100%"
                });
                this.legendEditor = new CheckBox({label: langSaveChart.DisplayLegend,
                    style: "width:100%"
                });
                this.timeEditor = new NumberSpinner({label: langSaveChart.RepeatTime,
                    style: "width:100%"
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
