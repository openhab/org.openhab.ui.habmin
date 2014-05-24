define([
        "require",
        "dojo/_base/array", // array.forEach array.map
        "dojo/_base/declare", // declare
        "dojo/fx", // fx.Animation
        "dojo/dom", // dom.setSelectable
        "dojo/dom-attr", // domAttr.attr
        "dojo/dom-class", // domClass.remove
        "dojo/dom-construct", // domConstruct.place
        "dojo/dom-geometry",
        "dojo/keys", // keys
        "dojo/_base/lang", // lang.getObject lang.hitch
        "dojo/sniff", // has("ie") has("dijit-legacy-requires")
        "dojo/topic", // publish
        "dijit/focus", // focus.focus()
        "dijit/_base/manager", // manager.defaultDuration
        "dojo/query",
        "dijit/_Widget",
        "dijit/_Container",
        "dijit/_TemplatedMixin",
        "dijit/_CssStateMixin",
        "dijit/layout/ContentPane",
        "dijit/layout/ContentPane",
        "dijit/form/TextBox",
        "dojo/text!app/bindings/DeviceHeader.html",
        "dijit/a11yclick",
        "dojo/domReady!"
    ],
    function (require, array, declare, fx, dom, domAttr, domClass, domConstruct, domGeometry, keys, lang, has, topic, focus, manager, query, _Widget, _Container, _TemplatedMixin, _CssStateMixin, StackContainer, ContentPane, TextBox, template) {
        return declare([ContentPane], {
/*
            postCreate: function (arguments, node) {
                this.inherited(arguments);
                this.content = "Hello";
            },

                    // into the button widget?
            _onTitleClick: function () {
                console.log("clicky");
                if (this._expanded) {
                    this._expanded = false;
                    fx.wipeOut({node: this.containerNode, duration: 400}).play();
                }
                else {
                    this._expanded = true;
                    fx.wipeIn({node: this.containerNode, duration: 400}).play();
                }
            },

            _onTitleKeyDown: function (/Event/ evt) {
                return this.getParent()._onKeyDown(evt, this.contentWidget);
            }*/
        });
    });
