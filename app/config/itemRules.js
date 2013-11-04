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
        var ruleRecord;

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
                        // Get the item name to delete
                        var record = listRules.getSelectionModel().getSelection()[0];
                        if (record == null)
                            return;

                        // Make sure we really want to do this!!!
                        var ruleName = record.get('name');
                        Ext.Msg.show({
                            title:"Confirm Delete",
                            msg:'Are you sure you want to delete the rule "' + ruleName + '"?',
                            buttons:Ext.Msg.YESNO,
                            config:{
                                obj:this,
                                name:ruleName
                            },
                            fn:deleteRule,
                            icon:Ext.MessageBox.QUESTION
                        });                    }
                }
            ]
        });

        // Load the rules for this item
        var itemRuleStore = Ext.create('Ext.data.JsonStore', {
            model:'RuleTemplateModel',
            proxy:{
                type:'rest',
                reader:{
                    type:'json',
                    root:'rule'
                },
                headers:{'Accept':'application/json'},
                pageParam:undefined,
                startParam:undefined,
                sortParam:undefined,
                limitParam:undefined
            },
            autoLoad:false
        });

        var listRules = Ext.create('Ext.grid.Panel', {
            store:itemRuleStore,
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
                    dataIndex:'linkeditem'
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


        function deleteRule(button, text, options) {
            if (button !== 'yes')
                return;

            // Tell OH to Remove the rule
            Ext.Ajax.request({
                url:HABminBaseURL + '/config/rules/item/' + itemName + '/' + options.config.name,
                headers:{'Accept':'application/json'},
                method:'DELETE',
                success:function (response, opts) {
                    Ext.MessageBox.show({
                        msg:'Rule deleted',
                        width:200,
                        draggable:false,
                        icon:'icon-ok',
                        closable:false
                    });
                    setTimeout(function () {
                        Ext.MessageBox.hide();
                    }, 2500);

                    // Update the list of rules
                    var json = Ext.decode(response.responseText);
                    ruleLibraryStore.loadData(json.rule);

                    // Update the toolbar
                    toolbar.getComponent('add').disable();
                    toolbar.getComponent('delete').disable();
                },
                failure:function (result, request) {
                    Ext.MessageBox.show({
                        msg:'Error deleting rule',
                        width:200,
                        draggable:false,
                        icon:'icon-error',
                        closable:false
                    });
                    setTimeout(function () {
                        Ext.MessageBox.hide();
                    }, 2500);
                }
            });
        }

            // Save a rule - ask for the variables etc
        function createRule(rule) {
            // Remember the rule we're editing so we've got the information when it comes time to save to openhab
            ruleRecord = rule;

            var ruleVariables = [].concat(rule.get("variable"));
            var ruleFields = [];
            for (var cnt = 0; cnt < ruleVariables.length; cnt++) {
                ruleFields[cnt] = {};
                ruleFields[cnt].xtype = 'textfield';
                ruleFields[cnt].allowBlank = false;
                ruleFields[cnt].maxLength = 75;
                ruleFields[cnt].enforceMaxLength = true;
                ruleFields[cnt].fieldLabel = ruleVariables[cnt].label;
                ruleFields[cnt].value = transposeVariables(ruleVariables[cnt].value);
                ruleFields[cnt].name = ruleVariables[cnt].name;
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
                    anchor:'100%'
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
                            var form = this.up('form').getForm();
                            var formData = form.getValues();

                            // Data needs to be translated into a format compatible with
                            // the respective openHAB beans
                            var data = {};
                            data.name = ruleRecord.get("name");
                            data.variable = [];

                            var ruleVariables = [].concat(ruleRecord.get("variable"));
                            for (var cnt = 0; cnt < ruleVariables.length; cnt++) {
                                data.variable[cnt] = {};
                                data.variable[cnt].name = ruleVariables[cnt].name;
                                data.variable[cnt].scope = ruleVariables[cnt].scope;
                                data.variable[cnt].value = formData[ruleVariables[cnt].name];
                            }

                            Ext.Ajax.request({
                                url:HABminBaseURL + '/config/rules/item/' + itemName + '/' + data.name,
                                method:'POST',
                                jsonData:data,
                                headers:{'Accept':'application/json'},
                                success:function (response, opts) {
                                    Ext.MessageBox.show({
                                        msg:'Item rule saved',
                                        width:200,
                                        draggable:false,
                                        icon:'icon-ok',
                                        closable:false
                                    });
                                    setTimeout(function () {
                                        Ext.MessageBox.hide();
                                    }, 2500);

                                    // Reload the item store to account for any new items
                                    // that may have been created
                                    itemConfigStore.load();

                                    // Update the list of rules
                                    var json = Ext.decode(response.responseText);
                                    itemRuleStore.loadData(json.rule);

                                    // Update the toolbar
                                    toolbar.getComponent('add').disable();
                                    toolbar.getComponent('delete').disable();
                                },
                                failure:function () {
                                    Ext.MessageBox.show({
                                        msg:'Error saving rule',
                                        width:200,
                                        draggable:false,
                                        icon:'icon-error',
                                        closable:false
                                    });
                                    setTimeout(function () {
                                        Ext.MessageBox.hide();
                                    }, 2500);
                                }
                            });

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
        this.setItem = function (item) {
            itemName = item;

            // Load the store
            itemRuleStore.proxy.url =HABminBaseURL + '/config/rules/item/' + itemName;
            itemRuleStore.load();
        }
    }
})
;