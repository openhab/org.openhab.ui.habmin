/**
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


var lookupStore;

Ext.define('openHAB.config.mappingProperties', {
    extend:'Ext.panel.Panel',
    layout:'fit',
    tabTip:'Mapping configuration',
    header:false,

    initComponent:function () {
        Ext.define('MapList', {
            extend:'Ext.data.Model',
            fields:[
                {name:'minimum'},
                {name:'maximum'},
                {name:'label'},
                {name:'colour'},
                {name:'icon'}
            ]
        });
        // create the data store
        lookupStore = Ext.create('Ext.data.ArrayStore', {
            model:'MapList'
        });

        var tbMapping = Ext.create('Ext.toolbar.Toolbar', {
            items:[
                {
                    icon:'images/cross.png',
                    id:'configLookupTb-cancel',
                    text:'Cancel',
                    cls:'x-btn-icon',
                    disabled:true,
                    tooltip:'Cancel changes made to the lookup table',
                    handler:function () {
                        Ext.getCmp("configLookupTb-save").disable();
                        Ext.getCmp("configLookupTb-cancel").disable();
                        Ext.getCmp("configLookupTb-add").enable();
                        Ext.getCmp("configLookupTb-delete").disable();

                        // Reset to the current data
                        var prop = Ext.getCmp('configProperties').getStore();
                        var Service = prop.getAt(1).get('value');
                        var Variable = prop.getAt(2).get('value');
                        SetConfigVariableData(configDeviceId, Service, Variable);
                    }
                },
                {
                    icon:'images/disk.png',
                    id:'configLookupTb-save',
                    text:'Save',
                    cls:'x-btn-icon',
                    disabled:true,
                    tooltip:'Save changes to the lookup table',
                    handler:function () {
                        Ext.getCmp("configLookupTb-save").disable();
                        Ext.getCmp("configLookupTb-cancel").disable();
                        Ext.getCmp("configLookupTb-add").enable();
                        SaveConfigVariableData();
                    }
                },
                {
                    icon:'images/plus-button.png',
                    id:'configLookupTb-add',
                    text:'Add',
                    cls:'x-btn-icon',
                    disabled:true,
                    tooltip:'Add a row to the lookup table',
                    handler:function () {
                        Ext.getCmp("configLookupTb-save").enable();
                        Ext.getCmp("configLookupTb-cancel").enable();

                        var newVar = {};
                        newVar.value = 0;
                        newVar.label = "New Label";

                        lookupStore.add(newVar);
                    }
                },
                {
                    icon:'images/minus-button.png',
                    id:'configLookupTb-delete',
                    text:'Delete',
                    cls:'x-btn-icon',
                    disabled:true,
                    tooltip:'Remove highlighted row from the lookup table',
                    handler:function () {
                        Ext.getCmp("configLookupTb-save").enable();
                        Ext.getCmp("configLookupTb-cancel").enable();
                        Ext.getCmp("configLookupTb-add").enable();
                        Ext.getCmp("configLookupTb-delete").disable();

                        var selection = Ext.getCmp("gridLookup").getView().getSelectionModel().getSelection()[0];
                        if (selection) {
                            lookupStore.remove(selection);
                        }
                    }
                }
            ]
        });

        this.cellEditing = new Ext.grid.plugin.CellEditing({
            clicksToEdit:1
        });

        var itemMapping  = Ext.create('Ext.grid.Panel', {
            xtype:'cell-editing',
            id:'gridLookup',
            title: 'Mapping Properties',
            icon:'images/tables-relation.png',
            header:false,
            plugins:[this.cellEditing],
            store:lookupStore,
            columns:[
                {
                    header:'Minimum',
                    dataIndex:'minimum',
                    width:75,
                    editor:{
                        allowBlank:false
                    }
                },
                {
                    header:'Maximum',
                    dataIndex:'maximum',
                    width:75,
                    editor:{
                        allowBlank:false
                    }
                },
                {
                    header:'Label',
                    dataIndex:'label',
                    width:300,
                    editor:{
                        allowBlank:false
                    }
                },
                {
                    header:'Value',
                    dataIndex:'value',
                    editor:{
                        allowBlank:false
                    }
                },
                {
                    header:'Icon',
                    dataIndex:'icon',
                    editor:{
                        allowBlank:false
                    }
                }
            ],
            selModel:{
                selType:'cellmodel'
            },
            tbar:tbMapping,
            listeners:{
                beforeedit:function (dv, record, item, index, e) {
                    Ext.getCmp("configLookupTb-delete").enable();
                },
                edit:function (dv, record, item, index, e) {
                    Ext.getCmp("configLookupTb-save").enable();
                }
            }
        });

        var tabs = Ext.create('Ext.tab.Panel', {
            layout:'fit',
            border:false,
            id:'tabsMappingProperties',
            items:[itemMapping]
        });

        this.items = tabs;
        this.callParent();
    }
})
;