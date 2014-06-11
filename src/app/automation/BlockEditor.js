define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/dom-class",
        "dijit/layout/ContentPane"
    ],
    function (declare, lang, array, domClass, Container) {
        return declare(Container, {
            initialized: false,

            postCreate: function () {
                this.inherited(arguments);
            },

            startup: function () {
                this.initialize();
            },

            initialize: function () {
                if (this.initialized)
                    return;

                this.initialized = true;
            }
        })
    });
