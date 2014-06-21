define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/on",
        "dojo/dom",
        "dojo/Evented",
        "dojo/_base/Deferred",
        "dojo/json",
        "dojo/dom-construct",

        "dijit/_Widget",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",

        "dijit/Dialog",
        "dijit/form/Form",
        "dijit/form/ValidationTextBox",
        "dojox/layout/TableContainer",
        "dijit/form/CheckBox",
        "dijit/form/NumberSpinner",
        "dijit/form/Button"//,
//        "dijit/Tooltip"
    ],
    function (declare, lang, on, dom, Evented, Deferred, JSON, domConstruct, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, Dialog, Form, TextBox, TableContainer, Button, Tooltip) {

        return declare([TableContainer], { //_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {
            cols: 1,
            "labelWidth": "150",

            constructor: function (/*Object*/ kwArgs) {
                lang.mixin(this, kwArgs);
                //               this.templateString = dojo.cache('app.dashboard', 'ItemConfig.html');

                /*                var contentWidget = new (declare(
                 [],
                 {
                 templateString: template
                 }
                 ));
                 contentWidget.startup();
                 var content = this.content = contentWidget;*/
//                this.form = content.form;
                // shortcuts
            },

            postCreate: function () {
                this.inherited(arguments);


                this.label = new dijit.form.TextBox({label: "Label"});
                this.format = new dijit.form.TextBox({label: "Format"});
                this.color = new dijit.form.TextBox({label: "Color"});
                this.minimum = new dijit.form.TextBox({label: "Minimum"});
                this.maximum = new dijit.form.TextBox({label: "Maximum"});
                this.position = new dijit.form.TextBox({label: "Position"});

                this.addChild(this.label);
                this.addChild(this.format);
                this.addChild(this.color);
                this.addChild(this.minimum);
                this.addChild(this.maximum);
                this.addChild(this.position);

// Start the table container. This initializes it and places
// the child widgets in the correct place.
//        programmatic.startup();


            }

        })
    });
