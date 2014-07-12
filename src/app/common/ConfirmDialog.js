define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/on",
        "dojo/dom",
        "dojo/Evented",
        "dojo/_base/Deferred",
        "dojo/dom-construct",

        "dijit/_Widget",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",

        "dijit/Dialog",
        "dijit/form/Button",

        "dojo/i18n!dijit/nls/common"
    ],
    function (declare, lang, on, dom, Evented, Deferred, domConstruct, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, Dialog, Button, langCommon) {

        return declare([Dialog, Evented], {
            title: "Login Dialog",

            constructor: function (/*Object*/ kwArgs) {
                lang.mixin(this, kwArgs);

                var dialogTemplate = dojo.cache('app.common', 'ConfirmDialog.html');
                var template = lang.replace(dialogTemplate, {
                    message: kwArgs.text
                });

                var contentWidget = new (declare(
                    [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin],
                    {
                        templateString: template
                    }
                ));
                contentWidget.startup();
                this.content = contentWidget;

                // shortcuts
                this.submitButton = this.content.submitButton;
                this.cancelButton = this.content.cancelButton;
            },

            postCreate: function () {
                this.inherited(arguments);

                // Set the button names - for internationalisation
                this.submitButton.set("label", langCommon.buttonOk);
                this.cancelButton.set("label", langCommon.buttonCancel);

                this.connect(this.submitButton, "onClick", lang.hitch(this, this.onSubmit));
                this.connect(this.cancelButton, "onClick", lang.hitch(this, this.onCancel));
            },
            onSubmit: function() {
                this.hide();
                this.dfd.resolve();
            },
            onCancel: function() {
                this.hide();
                this.dfd.cancel();
            },
            /**
             * Shows the dialog.
             * @return {Deferred}
             */
            show: function () {
                this.inherited('show', arguments);

                if (!this.hasUnderlay) {
                    domConstruct.destroy(this.id + '_underlay');	// remove underlay
                }
                this.dfd = new Deferred();
                return this.dfd;
            },
            hide: function(){
                this.destroyRecursive();
            }
        })
    });
