define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/dom-class",
        "dijit/layout/ContentPane"//,
//        "dblockly/Blockly"
    ],
    function (declare, lang, array, domClass, Container) {

        return declare(Container, {
            initialized: false,
            style: "width:100%;height:100%",

            postCreate: function () {
                this.inherited(arguments);
            },

            startup: function () {
                if (this.initialized)
                    return;

                this.inherited(arguments);

                Blockly.inject(document.getElementById(this.domNode.id),
                    {
                        path: './blockly/',
                        trashcan: true,
                        toolbox: '<xml>' +
                            '<category name="Logic">' +
                            '<block type="controls_if"></block>' +
                            '<block type="logic_compare"></block>' +
                            '<block type="logic_operation"></block>' +
                            '<block type="logic_negate"></block>' +
                            '<block type="openhab_iftimer"></block>' +
                            '<block type="logic_boolean"></block>' +
                            '</category>' +
                            '<category name="Math">' +
                            '<block type="math_number"></block>' +
                            '<block type="math_arithmetic"></block>' +
                            '<block type="math_round"></block>' +
                            '<block type="math_constrain"></block>' +
                            '</category>' +
                            '<category name="Items">' +
                            '<block type="openhab_itemset"></block>' +
                            '<block type="openhab_itemget"></block>' +
                            '<block type="openhab_itemcmd"></block>' +
                            '<block type="openhab_persistence_get"></block>' +
                            '<block type="variables_set"></block>' +
                            '<block type="variables_get"></block>' +
                            '<block type="openhab_constantget"></block>' +
                            '<block type="openhab_constantset"></block>' +
                            '<block type="openhab_state_onoff"></block>' +
                            '<block type="openhab_state_openclosed"></block>' +
                            '<block type="text"></block>' +
                            '</category>' +
                            '</xml>'
                    });

                this.initialized = true;
            }
        })
    });
