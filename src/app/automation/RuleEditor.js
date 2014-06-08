define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/dom-class",
        "dijit/layout/BorderContainer",
        "dijit/Toolbar",
        "dijit/form/Button",
        "dojo/request",
    ],
    function (declare, lang, array, domClass, Container, Toolbar, Button, request) {
        return declare(Container, {
            chartLegend: true,
            tooltips:true,

            gutters: false,
            postCreate: function () {
                domClass.add(this.domNode, "habminChildNoPadding");
                this._createChart();
            },
            startup: function () {
                this.inherited(arguments);
                this.resize();
                this.chart.resize();
            }
        })
    });
