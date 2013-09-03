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

Ext.define('openHAB.config.itemList', {
    extend:'Ext.panel.Panel',
    layout:'fit',
    icon:'images/document-node.png',
    tabTip:'Configure items and groups',
    title:'Items and Groups',

    initComponent:function () {

        var itemsTree = Ext.create('Ext.grid.Panel', {
            store:itemConfigStore,
            header:false,
            split:true,
            collapsible:false,
            multiSelect:false,
            columns:[
                {
                    text:'Item',
                    flex:3,
                    dataIndex:'name',
                    renderer:function (v) {
                        var icon = "";
                        var ref = itemConfigStore.findExact("name", v);
                        if(ref != -1) {
                            if(itemConfigStore.getAt(ref).get('icon') != "")
                                icon = '<img src="../images/'+itemConfigStore.getAt(ref).get('icon')+'.png" align="left" height="16">';
                        }

                        return '<div>' + icon + '</div><div style="margin-left:20px">' + v +'</div>';
                    }
                },
                {
                    text:'Label',
                    flex:4,
                    dataIndex:'label'
                },
                {
                    text:'Type',
                    flex:2,
                    dataIndex:'type',
                    renderer:function (value, metaData, record, row, col, store, gridView) {
                        var img = 'node.png';
                        if (record.get("type") != null)
                            img = getItemTypeIcon(record.get("type"));
                        return '<img src="' + img +'" align="left" height="16">&nbsp;&nbsp;' + value;
                    }
                },
                {
                    text:'Binding',
                    flex:2,
                    dataIndex:'binding'
                }
            ],
            listeners:{
                select:function (grid, record, index, eOpts) {
                    if (record == null)
                        return;

                    var newName = record.get('name');
                    var newProperties = null;
                    if (record.get("type") == "GroupItem") {
                        // Create a new groupProperties
                        newProperties = Ext.create('openHAB.config.groupProperties');
                        newProperties.setItem(newName);
                    }
                    else {
                        // Create a new itemProperties
                        newProperties = Ext.create('openHAB.config.itemProperties');
                        newProperties.setItem(newName);
                    }

                    if(newProperties != null)
                        Ext.getCmp('configPropertyContainer').setNewProperty(newProperties);
                }
            }
        });

        this.items = itemsTree;

        this.callParent();
    }
})
;