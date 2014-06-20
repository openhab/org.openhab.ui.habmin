define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/on",
        "dojo/dom",
        "dojo/Evented",
        "dojo/_base/Deferred",
        "dojo/json",
        "dojo/dom-construct",

        "dijit/layout/StackContainer",
        "app/dashboard/ItemConfig",

        "dijit/_Widget",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",

        "dijit/Dialog",
        "dijit/form/Form",
        "dijit/form/ValidationTextBox",
        "dijit/form/Button"
    ],
    function (declare, lang, on, dom, Evented, Deferred, JSON, domConstruct, StackContainer, ItemConfig, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, Dialog, Form, TextBox, Button, Tooltip) {

        return declare([Dialog, Evented], {
            title: "Save Chart",

//            _setCategoriesAttr: {node: "itemGrid", type: "innerHTML" },

            constructor: function (/*Object*/ kwArgs) {
                lang.mixin(this, kwArgs);
                var dialogTemplate = dojo.cache('app.dashboard', 'SaveChartForm.html');

                var contentWidget = new (declare(
                    [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin],
                    {
                        templateString: dialogTemplate
                    }
                ));
                contentWidget.startup();
                var content = this.content = contentWidget;
                this.form = content.form;
                // shortcuts
                this.submitButton = content.submitButton;
                this.cancelButton = content.cancelButton;
                this.pagePane = content.pagePane;
            },

            postCreate: function () {
                this.inherited(arguments);

                this.okLabel = this.submitButton.get("label");

                this.connect(this.submitButton, "onClick", "onSubmit");
                this.connect(this.cancelButton, "onClick", "onCancel");

                this.watch("readyState", lang.hitch(this, "_onReadyStateChange"));

                this.form.watch("state", lang.hitch(this, "_onValidStateChange"));
                this._onValidStateChange();

                this.stackContainer = new StackContainer({style:"height:300px;width:450px;"
                }, this.pagePane);

                var p = new ItemConfig();
//                this.stackContainer = new ItemConfig({style:"height:200px;width:450px;"
//                }, this.pagePane);
                this.stackContainer.addChild(p);

                this.stackContainer.startup();
                this.stackContainer.resize();
            },

//            startu

            onSubmit: function () {

            },

            _onValidStateChange: function () {
                this.submitButton.set("disabled", !!this.form.get("state").length);
            },

            _onReadyStateChange: function () {
                var isBusy = this.get("readyState") == this.BUSY;
                this.submitButton.set("label", isBusy ? this.busyLabel : this.okLabel);
                this.submitButton.set("disabled", isBusy);
            }
        })
    });
