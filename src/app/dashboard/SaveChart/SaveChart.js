define([
        "../../../dojo/_base/declare",
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
        "GeneralConfig",
        "ItemConfig",
        "SaveChart/AxisConfig",

        "dijit/_Widget",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",

        "dijit/Dialog",
        "dijit/form/Form",

        "dojo/i18n!dijit/nls/common",
        "dojo/i18n!app/nls/SaveChart"

    ],
    function (declare, lang, on, dom, Evented, Deferred, JSON, domConstruct, domStyle, StackContainer, StackController, GeneralConfig, ItemConfig, AxisConfig, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, Dialog, Form, langCommon, langSaveChart) {

        return declare([Dialog, Evented], {
            title: langSaveChart.WindowTitle,

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

                // Set the button names - for internationalisation
                this.submitButton.set("label", langCommon.buttonOk);
                this.cancelButton.set("label", langCommon.buttonCancel);

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

                var child;

                child = new GeneralConfig({style: "height:250px", title:langSaveChart.General});
                this.stackContainer.addChild(child);

                child = new ItemConfig({style: "height:250px", title:"Item 1"});
                this.stackContainer.addChild(child);

                child = new AxisConfig({style: "height:250px", title:langSaveChart.Axis1});
                this.stackContainer.addChild(child);

                child = new AxisConfig({style: "height:250px", title:langSaveChart.Axis2});
                this.stackContainer.addChild(child);

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
            },

            hide: function() {
                this.destroyRecursive(false);

            }
        })
    });
