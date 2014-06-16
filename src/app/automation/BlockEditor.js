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
            style:"width:100%;height:100%",

            postCreate: function () {
                this.inherited(arguments);
            },

            startup: function () {
                if (this.initialized)
                    return;

                this.inherited(arguments);

                this.initialized = true;
            }
        })
    });
