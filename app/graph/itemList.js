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

/**
 * OpenHAB Admin Console HABmin
 *
 * @author Chris Jackson
 */

Ext.define('openHAB.graph.itemList', {
    extend:'Ext.panel.Panel',
    layout:'fit',
    icon:'images/chart_curve_add.png',
    tabTip:'Items List',
    title:'Item List',
    initComponent:function () {
        var selectedChanList = [];

        var itemToolbar = Ext.create('Ext.toolbar.Toolbar', {
            items:[
                {
                    icon:'images/cross.png',
                    itemId:'clear',
                    text: language.graph_Reset,
                    cls:'x-btn-icon',
                    disabled:false,
                    tooltip: language.graph_ResetTip,
                    handler:function () {
                        var selectedChanList = [];
                        itemToolbar.getComponent('update').disable();
                        itemToolbar.getComponent('save').disable();

                    }
                },
                {
                    icon:'images/disk.png',
                    itemId:'save',
                    text: language.graph_Save,
                    cls:'x-btn-icon',
                    disabled:true,
                    tooltip: language.graph_SaveTip,
                    handler:function () {
                        var saveGraph = Ext.create('openHAB.graph.saveGraph');
                        saveGraph.setData(selectedChanList);
                    }
                },
                {
                    icon:'images/external.png',
                    itemId:'update',
                    text: language.graph_Update,
                    cls:'x-btn-icon',
                    disabled:true,
                    tooltip: language.graph_UpdateTip,
                    handler:function () {
                        if(selectedChanList.length == 0)
                            return;

                        Ext.getCmp('highchartsChart').chartUpdate(selectedChanList);
                    }
                }
            ]
        });

        var itemList = Ext.create('Ext.grid.Panel', {
            store:persistenceItemStore,
            tbar:itemToolbar,
            header:false,
            disableSelection:true,
            columns:[
                {
                    menuDisabled:true,
                    menuText:"Data Type",
                    sortable:true,
                    width:24,
                    hidden:false,
                    resizable:false,
                    dataIndex:'icon',
                    renderer:function (value, metaData, record, row, col, store, gridView) {
                        if (value != "")
                            return '<img src="../images/'+value+'.png" height="16">';
                    }
                },
                {
                    text:'Item',
                    hideable:false,
                    flex:1,
                    width:75,
                    sortable:true,
                    dataIndex:'label',
                    renderer:function (value, metaData, record, row, col, store, gridView) {
                        if (value != "")
                            return value;
                        if(record == null)
                            return "";
                        return record.get('name');
                    }
                },
                {
                    text:'Last Value',
                    width:75,
                    hidden:true,
                    sortable:true,
                    dataIndex:'state'
                }
            ],
            layout:'fit',
            viewConfig:{
                stripeRows:false,
                enableTextSelection:false,
                markDirty:false,
                getRowClass:function (record) {
                    if(selectedChanList == null)
                        return '';
                    var name = record.get('name');
                    for(var i = 0; i < selectedChanList.length; i++) {
                        if(selectedChanList[i].name == name) {
                            return 'x-grid-row-selected-override';
                        }
                    }
                    return '';
                }
            },
            listeners:{
                activate:function (grid, eOpts) {
                    persistenceItemStore.filter("type", "GroupItem");
                },
                itemclick:function (grid, record, item, index, element, eOpts) {
                    if(selectedChanList == null)
                        selectedChanList = [];

                    if (item == null)
                        return;

                    var el = Ext.get(item);
                    var name = record.get('name');
                    var chanRef = -1;
                    for(var i = 0; i < selectedChanList.length; i++) {
                        if(selectedChanList[i].name == name) {
                            chanRef = i;
                            break;
                        }
                    }

                    // Check if the name is in the selected list
                    if(chanRef == -1) {
                        // No - add it - if there's still room!
                        if (selectedChanList.length < 8) {
                            var newRec = {};
                            var Max = -1;
                            var Total = persistenceItemStore.getCount();
                            var chanCnt = 0;

                            newRec.name = name;
                            newRec.axis = 0;
                            selectedChanList.push(newRec);

                            itemToolbar.getComponent('update').enable();
                            itemToolbar.getComponent('save').enable();

                            this.getView().refreshNode(index);
                            el.frame();
                        }
                    }
                    else {
                        selectedChanList.splice(chanRef,1);
                        if (selectedChanList.length == 0) {
                            itemToolbar.getComponent('update').disable();
                            itemToolbar.getComponent('save').disable();
                        }

                        this.getView().refreshNode(index);
                        el.frame();
                    }
                }
            },
            clearSelection:function () {
                selectedChanList = [];
                this.getView().refresh();

                itemToolbar.getComponent('update').disable();
                itemToolbar.getComponent('save').disable();
            }
        });

        this.items = itemList;

        this.callParent();
    },
    listeners:{
        activate:function (grid, eOpts) {
            itemConfigStore.filterBy(function myfilter(record) {
                if(record.get("persistence") == "")
                    return false;
                return true;
            });
        }
    }
})
;