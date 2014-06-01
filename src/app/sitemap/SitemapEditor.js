define([
        "dojo/_base/declare", // declare
        "dojo/_base/array", // array.map
        "dijit/layout/BorderContainer",
        "dojo/date",
        "dojo/date/locale",
        "dojo/dom-attr", // domAttr.get
        "dojo/dom-class", // domClass.add domClass.contains domClass.remove domClass.toggle
        "dojo/_base/kernel", // kernel.deprecated
        "dojo/keys", // keys
        "dojo/_base/lang", // lang.hitch
        "dojo/on",
        "dijit/_Widget",
        "dijit/_CssStateMixin",
        "dijit/_TemplatedMixin"
    ],
    function (array, date, Border, local, declare, domAttr, domClass, kernel, keys, lang, on, has, _Widget, _CssStateMixin, _TemplatedMixin, DropDownButton) {
        return declare(null, [Border], {
            postCreate: function () {

                // Create the sitemap list

                // Create the widgets bar

                // Create the sitemap container

                // Create the property editor
            },
            startup: function() {
                this.inherited(arguments);
                this.resize();
            }
        });
    });
