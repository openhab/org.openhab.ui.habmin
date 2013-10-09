/**
 * HABmin - the openHAB admin interface
 *
 * openHAB, the open Home Automation Bus.
 * Copyright (C) 2010-2013, openHAB.org <admin@openhab.org>
 *
 * See the contributors.txt file in the distribution for a
 * full listing of individual contributors.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as
 * published by the Free Software Foundation; either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, see <http://www.gnu.org/licenses>.
 *
 * Additional permission under GNU GPL version 3 section 7
 *
 * If you modify this Program, or any covered work, by linking or
 * combining it with Eclipse (or a modified version of that library),
 * containing parts covered by the terms of the Eclipse Public License
 * (EPL), the licensors of this Program grant you additional permission
 * to convey the resulting work.
 */

/** OpenHAB Admin Console HABmin
 *
 * @author Chris Jackson
 */


Ext.define('openHAB.config.itemRules', {
    extend:'Ext.panel.Panel',
    defaults:{
        split:true
    },
    border:false,
    layout:'border',
    icon:'images/node-design.png',
    title:'Rules',

    initComponent:function () {
        var itemName = "";
        var toolbar = Ext.create('Ext.toolbar.Toolbar', {
            items:[
                {
                    icon:'images/plus-button.png',
                    itemId:'add',
                    text:'Add Rule',
                    cls:'x-btn-icon',
                    disabled:true,
                    tooltip:'Add the rule to this item',
                    handler:function () {
                        var record = listRules.getSelectionModel().getSelection()[0];
                        if (record == null)
                            return;

                        createRule(record);
                    }
                },
                {
                    icon:'images/minus-button.png',
                    itemId:'delete',
                    text:'Delete Rule',
                    cls:'x-btn-icon',
                    disabled:true,
                    tooltip:'Remove the rule from this item',
                    handler:function () {
//                        removeRule();
                    }
                }
            ]
        });

        var listRules = Ext.create('Ext.grid.Panel', {
            store:ruleTemplateStore,
            region:"center",
            flex:1,
            header:false,
            split:true,
            tbar:toolbar,
            collapsible:false,
            multiSelect:false,
            columns:[
                {
                    text:'Name',
                    flex:2,
                    dataIndex:'label'
                },
                {
                    text:'Item',
                    flex:2,
                    dataIndex:'item'
                },
                {
                    text:'Description',
                    flex:4,
                    dataIndex:'description'
                }
            ],
            listeners:{
                select:function (grid, record, index, eOpts) {
                    if (record == null)
                        return;

                    // Enable buttons
                    if (record.get("linkeditem") == "") {
                        toolbar.getComponent('add').enable();
                        toolbar.getComponent('delete').disable();
                    }
                    else {
                        toolbar.getComponent('add').disable();
                        toolbar.getComponent('delete').enable();
                    }
                }
            }
        });

        this.items = [listRules];

        this.callParent();


        // Save a rule - ask for the variables etc
        function createRule(rule) {
            var ruleFields = [];

            var variables = [].concat(rule.get("variable"));

            for (var cnt = 0; cnt < variables.length; cnt++) {
                ruleFields[cnt] = {};
                ruleFields[cnt].xtype = 'textfield';
                ruleFields[cnt].allowBlank = false;
                ruleFields[cnt].maxLength = 75;
                ruleFields[cnt].enforceMaxLength = true;
                ruleFields[cnt].fieldLabel = variables[cnt].label;
                ruleFields[cnt].value = transposeVariables(variables[cnt].defaultvalue);
                ruleFields[cnt].name = variables[cnt].name;
            }

            var formPanel = new Ext.form.Panel({
                frame:false,
                width:450,
                bodyPadding:5,
                fieldDefaults:{
                    labelAlign:'right',
                    labelWidth:120,
                    msgTarget:'side'
                },
                defaults:{
                    anchor: '100%'
                },
                items:ruleFields,
                buttons:[
                    {
                        text:'Cancel',
                        handler:function () {
                            saveWin.destroy();
                        }
                    },
                    {
                        text:'Save',
                        handler:function () {
                            // Save stuff here
                            saveWin.destroy();
                        }
                    }
                ]
            });

            var saveWin = Ext.widget('window', {
                title:'Add Rule',
                closeAction:'destroy',
                layout:'fit',
                resizable:false,
                draggable:false,
                modal:true,
                layout:{
                    type:'vbox',
                    align:'stretch'
                },
                items:[formPanel]
            });
            saveWin.show();
        }

        // Transpose variables
        function transposeVariables(string) {
            var result = "";
            result = string.replace("%%" + "ItemName" + "%%", itemName);

            return result;
        }

        // Set the item
        this.setItem = function(item) {
            itemName = item;
        }
    }
})
;