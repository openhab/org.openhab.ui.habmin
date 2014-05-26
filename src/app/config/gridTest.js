define([
        "dojo/_base/declare",
        "dijit/layout/LayoutContainer",
        "dijit/Toolbar",
        "dijit/form/Button",
        "dojo/_base/array"
    ],
    function (declare, Container, Toolbar, Button, array) {
        return declare(Container, {
            postCreate: function () {
                this.inherited(arguments);

                var me = this;
                this.toolbar = new Toolbar({region: "top"});
                array.forEach(["Cut", "Copy", "Paste"], function (label) {
                    var button = new Button({
                        label: label,
                        showLabel: true,
                        iconClass: "dijitButtonIcon dijitIconSave"
                    },label);

                    me.toolbar.addChild(button);
                });

                this.addChild(this.toolbar);

            },
            startup: function() {
                this.inherited(arguments);
                this.resize();
            }
        });
    });