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
        "dijit/form/Button"//,
//        "dijit/Tooltip"
    ],
    function (declare, lang, on, dom, Evented, Deferred, JSON, domConstruct, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, Dialog, Form, TextBox, Button, Tooltip) {

        return declare([Dialog, Evented], {
            READY: 0,
            BUSY: 1,

            title: "Login Dialog",
            message: "",
            busyLabel: "Working...",

            attributeMap: lang.delegate(dijit._Widget.prototype.attributeMap, {
                message: {
                    node: "messageNode",
                    type: "innerHTML"
                }
            }),
            constructor: function (/*Object*/ kwArgs) {
                lang.mixin(this, kwArgs);
                var dialogTemplate = dojo.cache('app.main', 'login-dialog.html');
                var formTemplate = dojo.cache('app.main', 'login-form.html');
                var template = lang.replace(dialogTemplate, {
                    form: formTemplate
                });

                var contentWidget = new (declare(
                    [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin],
                    {
                        templateString: template
                    }
                ));
                contentWidget.startup();
                var content = this.content = contentWidget;
                this.form = content.form;
                // shortcuts
                this.submitButton = content.submitButton;
                this.cancelButton = content.cancelButton;
                this.messageNode = content.messageNode;
            },

            postCreate: function () {
                this.inherited(arguments);

                this.readyState = this.READY;
                this.okLabel = this.submitButton.get("label");

                this.connect(this.submitButton, "onClick", "onSubmit");
                this.connect(this.cancelButton, "onClick", "onCancel");

                this.watch("readyState", lang.hitch(this, "_onReadyStateChange"));

                this.form.watch("state", lang.hitch(this, "_onValidStateChange"));
                this._onValidStateChange();
            },

            onSubmit: function () {
                this.set("readyState", this.BUSY);
                this.set("message", "");
                var data = this.form.get("value");

                var auth = this.controller.login(data);

                Deferred.when(auth, lang.hitch(this, function (loginSuccess) {
                    if (loginSuccess === true) {
                        this.onLoginSuccess();
                        return;
                    }
                    this.onLoginError();
                }));
            },

            onLoginSuccess: function () {
                this.set("readyState", this.READY);
                this.set("message", "Login successful.");
                this.emit("success");
            },

            onLoginError: function () {
                this.set("readyState", this.READY);
                this.set("message", "Please try again.");
                this.emit("error");
            },

            onCancel: function () {
                this.emit("cancel");
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
