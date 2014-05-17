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
    extend: 'Ext.panel.Panel',
    layout: 'fit',
    icon: 'images/document-node.png',

    initComponent: function () {
        this.title = language.graph_ItemList;
        this.tabTip = language.graph_ItemListTip;

        var selectedItemList = [];

        var itemToolbar = Ext.create('Ext.toolbar.Toolbar', {
            items: [
                {
                    icon: 'images/arrow-circle-225-left.png',
                    itemId: 'clear',
                    text: language.graph_ItemListReset,
                    cls: 'x-btn-icon',
                    disabled: false,
                    tooltip: language.graph_ItemListResetTip,
                    handler: function () {
                        var selectedChanList = [];
                        itemList.clearSelection();
                        itemToolbar.getComponent('update').disable();
                        itemToolbar.getComponent('save').disable();

                    }
                },
                {
                    icon: 'images/disk.png',
                    itemId: 'save',
                    text: language.graph_ItemListSave,
                    cls: 'x-btn-icon',
                    disabled: true,
                    tooltip: language.graph_ItemListSaveTip,
                    handler: function () {
                        if (selectedItemList.length == 0)
                            return;

                        var saveGraph = Ext.create('openHAB.graph.saveGraph');
                        var config = createConfig();
                        config.period = "86400";
                        saveGraph.setData(config);
                        saveGraph.show();
                    }
                },
                {
                    icon: 'images/external.png',
                    itemId: 'update',
                    text: language.graph_ItemListUpdate,
                    cls: 'x-btn-icon',
                    disabled: true,
                    tooltip: language.graph_ItemListUpdateTip,
                    handler: function () {
                        if (selectedItemList.length == 0)
                            return;

                        Ext.getCmp('highchartsChart').chartUpdate(createConfig());
                    }
                }
            ]
        });

        var itemList = Ext.create('Ext.grid.Panel', {
            store: persistenceItemStore,
            tbar: itemToolbar,
            header: false,
            disableSelection: true,
            plugins: [
                {
                    ptype: 'grid',
                    emptyText: language.graph_ItemListFilterDefault
                },
                {
                    ptype: 'cellediting',
                    clicksToEdit: 1
                }
            ],
            columns: [
                {
                    menuDisabled: true,
                    menuText: language.graph_ItemIcon,
                    sortable: true,
                    width: 24,
                    hidden: false,
                    resizable: false,
                    dataIndex: 'icon',
                    renderer: function (value, metaData, record, row, col, store, gridView) {
                        if (value != "")
                            return '<img src="../images/' + value + '.png" height="16">';
                    }
                },
                {
                    text: language.graph_ItemTitle,
                    hideable: false,
                    flex: 1,
                    width: 75,
                    sortable: true,
                    dataIndex: 'label',
                    renderer: function (value, metaData, record, row, col, store, gridView) {
                        if (value != "")
                            return value;
                        if (record == null)
                            return "";
                        return record.get('name');
                    }
                },
                {
                    text: language.graph_LastValue,
                    width: 75,
                    hidden: true,
                    sortable: true,
                    dataIndex: 'state'
                }
            ],
            layout: 'fit',
            viewConfig: {
                stripeRows: false,
                enableTextSelection: false,
                markDirty: false,
                getRowClass: function (record) {
                    if (selectedItemList == null)
                        return '';
                    var name = record.get('name');
                    for (var i = 0; i < selectedItemList.length; i++) {
                        if (selectedItemList[i].name == name) {
                            return 'x-grid-row-selected-override';
                        }
                    }
                    return '';
                }
            },
            listeners: {
                activate: function (grid, eOpts) {
                    persistenceItemStore.filter("type", "GroupItem");
                },
                itemclick: function (grid, record, item, index, element, eOpts) {
                    if (selectedItemList == null)
                        selectedItemList = [];

                    if (item == null)
                        return;

                    var el = Ext.get(item);
                    var name = record.get('name');
                    var chanRef = -1;
                    for (var i = 0; i < selectedItemList.length; i++) {
                        if (selectedItemList[i].name == name) {
                            chanRef = i;
                            break;
                        }
                    }

                    // Check if the name is in the selected list
                    if (chanRef == -1) {
                        // No - add it - if there's still room!
                        if (selectedItemList.length < 8) {
                            var newRec = {};
                            var Max = -1;
                            var Total = persistenceItemStore.getCount();
                            var chanCnt = 0;

                            newRec.name = name;
                            newRec.axis = 0;
                            selectedItemList.push(newRec);

                            itemToolbar.getComponent('update').enable();
                            itemToolbar.getComponent('save').enable();

                            this.getView().refreshNode(index);
                            el.frame();
                        }
                    }
                    else {
                        selectedItemList.splice(chanRef, 1);
                        if (selectedItemList.length == 0) {
                            itemToolbar.getComponent('update').disable();
                            itemToolbar.getComponent('save').disable();
                        }

                        this.getView().refreshNode(index);
                        el.frame();
                    }
                }
            },
            clearSelection: function () {
                selectedItemList = [];
                this.getView().refresh();

                itemToolbar.getComponent('update').disable();
                itemToolbar.getComponent('save').disable();
            }
        });

        this.items = itemList;

        this.callParent();

        function createConfig() {
            // Create the chart configuration object with the mandatory config items
            var chartConfig = {};
            chartConfig.items = [];
            for (var cnt = 0; cnt < selectedItemList.length; cnt++) {
                var newItem = {};
                newItem.item = selectedItemList[cnt].name;
                newItem.axis = 1;
                newItem.legend = true;
                newItem.lineWidth = 1;

                var ref = persistenceItemStore.findExact("name", selectedItemList[cnt].name);
                if (ref != -1)
                    newItem.label = persistenceItemStore.getAt(ref).get("label");
                else
                    newItem.label = selectedItemList[cnt].name;

                chartConfig.items.push(newItem);
            }

            return chartConfig;
        }
    }
})
;