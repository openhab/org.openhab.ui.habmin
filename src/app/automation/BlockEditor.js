define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/dom-class",
        "dblockly/Blockly"
    ],
    function (declare, lang, array, domClass, Blockly) {
        return declare(Blockly, {
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
