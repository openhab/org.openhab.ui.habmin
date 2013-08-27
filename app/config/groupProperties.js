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

Ext.define('openHAB.config.groupProperties', {
    extend:'Ext.panel.Panel',
    layout:'fit',
    tabTip:'Group configuration',
    header:false,

    initComponent:function () {
        Ext.define('ItemIcons', {
            extend:'Ext.data.Model',
            fields:[
                {type:'number', name:'id'},
                {type:'string', name:'icon'},
                {type:'string', name:'name'}
            ]
        });

        var tbProperties = Ext.create('Ext.toolbar.Toolbar', {
            items:[
                {
                    icon:'images/cross.png',
                    id:'configPropTb-cancel',
                    text:'Cancel',
                    cls:'x-btn-icon',
                    disabled:true,
                    tooltip:'Cancel changes made to the group configuration',
                    handler:function () {
                        Ext.getCmp("configPropTb-save").disable();
                        Ext.getCmp("configPropTb-cancel").disable();

                        // Reset to the current data
                    }
                },
                {
                    icon:'images/disk.png',
                    id:'configPropTb-save',
                    text:'Save',
                    cls:'x-btn-icon',
                    disabled:true,
                    tooltip:'Save changes to the group configuration',
                    handler:function () {
                        Ext.getCmp("configPropTb-save").disable();
                        Ext.getCmp("configPropTb-cancel").disable();
                    }
                }
            ]
        });

        var groupOptions = Ext.create('Ext.grid.property.Grid', {
            title:'Properties',
            id:'configGroupProperties',
            icon:'images/gear.png',
            tbar:tbProperties,
            hideHeaders:true,
            sortableColumns:false,
            nameColumnWidth:300,
            split:true,
            source:{
                "ItemName":"",
                "Icon":""
            },
            sourceConfig:{
                ItemName:{
                    displayName:"Group Name"
                },
                Icon:{
                    renderer:function (v) {
                        var icon = getIconByValue(v);
                        if (icon == null)
                            return null;
                        return '<div>' +
                            '<img src="'+icon.icon+'" align="left" height="16">&nbsp;&nbsp;' +
                            icon.name+'</div>';
                    },
                    editor:Ext.create('Ext.form.ComboBox', {
                        store:{model:'ItemIcons', data:iconTypeArray},
                        queryMode:'local',
                        typeAhead:false,
                        editable:false,
                        displayField:'name',
                        valueField:'id',
                        forceSelection:true,
                        editable:false,
                        allowBlank:false,
                        listConfig:{
                            getInnerTpl:function () {
                                var tpl = '<div>' +
                                    '<img src="{icon}" align="left" height="16">&nbsp;&nbsp;' +
                                    '{name}</div>';
                                return tpl;
                            }
                        }
                    })
                }
            },
            viewConfig:{
                markDirty:false
            },
            listeners:{
                propertychange:function (source, recordId, value, oldValue, eOpts) {
                    Ext.getCmp("configPropTb-save").enable();
                    Ext.getCmp("configPropTb-cancel").enable();
                }
            }
        });

        var tabs = Ext.create('Ext.tab.Panel', {
            layout:'fit',
            border:false,
            id:'tabsGroupProperties',
            items:[groupOptions]
        });

        this.items = tabs;

        this.callParent();

        // Class members.
        this.setItem = function (newItem) {
            var item = itemStore.findExact("name", newItem);
            if (item == -1)
                return;

            var rec = itemStore.getAt(item);

            groupOptions.setProperty("ItemName", rec.get('name'));
//            itemOptions.setProperty("Type", rec.get('type'));
        }
    }
})
;
