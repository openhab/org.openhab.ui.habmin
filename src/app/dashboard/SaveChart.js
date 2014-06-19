define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/on",
        "dojo/dom",
        "dojo/Evented",
        "dojo/_base/Deferred",
        "dojo/json",
        "dojo/dom-construct",

        "dgrid/extensions/DijitRegistry",
        "dgrid/OnDemandGrid",
        "dgrid/Selection",
        "dgrid/Keyboard",
        "dgrid/editor",

        "dijit/_Widget",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",

        "dijit/Dialog",
        "dijit/form/Form",
        "dijit/form/ValidationTextBox",
        "dijit/form/Button"
    ],
    function (declare, lang, on, dom, Evented, Deferred, JSON, domConstruct, Registry, Grid, Selection, Keyboard, Editor, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, Dialog, Form, TextBox, Button, Tooltip) {

        return declare([Dialog, Evented], {
            READY: 0,
            BUSY: 1,

            title: "Login Dialog",
            message: "",
            busyLabel: "Working...",

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
                this.itemGrid = content.itemGrid;
                this.axisGrid = content.axisGrid;
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


                var columns = [
                    {label: 'Id', field: 'id', sortable: false},
                    Editor({label: 'Display name', field: 'displayName'}, "text", "dblclick"),
                    {label: 'Email', field: 'email'}//,
//            Editor({label: 'Role', get: getRole, set: setRole, field: 'roles', editorArgs: {store: rolesStore, searchAttr: "role", style: "width:120px;"}}, FilteringSelect)
                ];
                var itemGrid = new Grid({
//                    store: store,
                    getBeforePut: false,
                    columns: columns,
                    selectionMode: "none"
                }, this.itemGrid);

                var axisGrid = new Grid({
//                    store: store,
                    getBeforePut: false,
                    columns: columns,
                    selectionMode: "none"
                }, this.axisGrid);

            },

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
