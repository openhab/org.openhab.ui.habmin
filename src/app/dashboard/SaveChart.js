define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/on",
        "dojo/dom",
        "dojo/Evented",
        "dojo/_base/Deferred",
        "dojo/json",
        "dojo/dom-construct",
        "dojo/dom-style",

        "dijit/layout/StackContainer",
        "dijit/layout/StackController",
        "app/dashboard/ItemConfig",
        "app/dashboard/AxisConfig",

        "dijit/_Widget",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",

        "dijit/Dialog",
        "dijit/form/Form",
        "dijit/form/ValidationTextBox",
        "dijit/form/Button"
    ],
    function (declare, lang, on, dom, Evented, Deferred, JSON, domConstruct, domStyle, StackContainer, StackController, ItemConfig, AxisConfig, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, Dialog, Form, TextBox, Button, Tooltip) {

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
//                this.form = content.form;
                // shortcuts
                this.submitButton = content.submitButton;
                this.cancelButton = content.cancelButton;
                this.pagePane = content.pagePane;
                this.optionPane = content.optionPane;
            },

            postCreate: function () {
                this.inherited(arguments);

                this.okLabel = this.submitButton.get("label");

                this.connect(this.submitButton, "onClick", "onSubmit");
                this.connect(this.cancelButton, "onClick", "onCancel");

                this.watch("readyState", lang.hitch(this, "_onReadyStateChange"));

//                this.form.watch("state", lang.hitch(this, "_onValidStateChange"));
                this._onValidStateChange();

                this.stackContainer = new StackContainer({
               //     style:"height:350px;width:450px;",
                    doLayout:false,
                    isLayoutContainer: false
                }, this.pagePane);

                var p = new ItemConfig({style: "height:250px", title:"Item 1"});
                this.stackContainer.addChild(p);
//                var x = p.getParent();
//                domStyle.set(x, {"height": 250});

                var p = new AxisConfig({style: "height:250px", title:"Axis 1"});
                this.stackContainer.addChild(p);
//                var x = p.getParent();
//                domStyle.set(x, {"height": 250});

                var controller = new StackController({
                    style:"height:350px;width:450px;",
                    containerId: this.stackContainer.domNode.id
                }, this.optionPane);

                controller.startup();
                this.stackContainer.startup();
                this.stackContainer.resize();
            },

            onSubmit: function () {

            },

            _onValidStateChange: function () {
//                this.submitButton.set("disabled", !!this.form.get("state").length);
            },

            _onReadyStateChange: function () {
                var isBusy = this.get("readyState") == this.BUSY;
                this.submitButton.set("label", isBusy ? this.busyLabel : this.okLabel);
                this.submitButton.set("disabled", isBusy);
            },

            hide: function() {
                this.destroyRecursive(false);

            }
        })
    });
