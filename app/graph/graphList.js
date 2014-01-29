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


Ext.define('openHAB.graph.graphList', {
    extend: 'Ext.panel.Panel',
    layout: 'fit',
    icon: 'images/system-monitor.png',

    initComponent: function () {
        this.title = language.graph_GraphList;
        this.tabTip = language.graph_GraphListTip;

        var selectedId = null;
        var selectedName = null;

        var chartToolbar = Ext.create('Ext.toolbar.Toolbar', {
            items: [
                {
                    icon: 'images/cross.png',
                    itemId: 'delete',
                    text: language.delete,
                    cls: 'x-btn-icon',
                    disabled: true,
                    tooltip: language.graph_GraphListDeleteTip,
                    handler: function () {
                        // Make sure we really want to do this!!!
                        Ext.Msg.show({
                            title: language.config_ItemListConfirmDeleteTitle,
                            msg: sprintf(language.graph_GraphListConfirmDeleteMsg, selectedName),
                            buttons: Ext.Msg.YESNO,
                            config: {
                                obj: this,
                                name: selectedName
                            },
                            fn: deleteChart,
                            icon: Ext.MessageBox.QUESTION
                        });
                    }
                },
                {
                    icon: 'images/pencil-small.png',
                    itemId: 'edit',
                    text: language.edit,
                    cls: 'x-btn-icon',
                    disabled: true,
                    tooltip: language.graph_GraphListEditTip,
                    handler: function () {
                        if(selectedId === null)
                            return;
                        loadChart(selectedId, selectedName, "EDIT");
                    }
                }
            ]
        });

        var chartList = Ext.create('Ext.grid.Panel', {
            store: chartStore,
            tbar: chartToolbar,
            header: false,
            hideHeaders: true,
            columns: [
                {
                    menuDisabled: true,
                    menuText: "Data Type",
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
                    text: 'Item',
                    hideable: false,
                    flex: 1,
                    width: 75,
                    sortable: true,
                    dataIndex: 'name',
                    renderer: function (value, metaData, record, row, col, store, gridView) {
                        if (value != "")
                            return value;
                        if (record == null)
                            return "";
                        return record.get('name');
                    }
                }
            ],
            layout: 'fit',
            viewConfig: {
                stripeRows: false,
                enableTextSelection: false,
                markDirty: false
            },
            listeners: {
                itemclick: function (grid, record, item, index, element, eOpts) {
                    // Retrieve the chart configuration and display it
                    var el = Ext.get(item);
                    selectedId = record.get('id');
                    selectedName = record.get('name');

                    if(selectedId == null)
                        return;

                    // Enable the toolbar
                    chartToolbar.getComponent('delete').enable();
                    chartToolbar.getComponent('edit').enable();

                    loadChart(selectedId, selectedName, "VIEW");
                }
            }
        });

        this.items = chartList;

        this.callParent();

        function loadChart(id, name, action) {
            Ext.Ajax.request({
                url: HABminBaseURL + '/persistence/charts/' + id,
                timeout: 10000,
                method: 'GET',
                headers: {'Accept': 'application/json'},
                success: function (response, opts) {
                    var json = Ext.decode(response.responseText);
                    if(json == null || json.length == 0) {
                        handleStatusNotification(NOTIFICATION_ERROR, sprintf(language.graph_GraphListDownloadError, name));

                        return;
                    }

                    if(action == "EDIT") {
                        var saveGraph = Ext.create('openHAB.graph.saveGraph');

                        saveGraph.setData(json);
                        saveGraph.show();
                    }
                    else {
                        var now = (new Date()).getTime();
                        Ext.getCmp('highchartsChart').chartUpdate(json, now - (json.period * 1000), now);
                    }
                },
                failure: function (response, opts) {
                    handleStatusNotification(NOTIFICATION_ERROR, sprintf(language.graph_GraphListDownloadError, name));
                }
            });
        }

        function deleteChart(button, text, options) {
            if (button !== 'yes')
                return;

            // Tell OH to Remove the chart
            Ext.Ajax.request({
                url: HABminBaseURL + '/persistence/charts/' + selectedId,
                headers: {'Accept': 'application/json'},
                method: 'DELETE',
                success: function (response, opts) {
                    handleStatusNotification(NOTIFICATION_OK, sprintf(language.graph_GraphListDeleteOk, selectedName));
                },
                failure: function (result, request) {
                    handleStatusNotification(NOTIFICATION_ERROR, sprintf(language.graph_GraphListDeleteError, selectedName));
                },
                callback: function (options, success, response) {
                    // Reload the store
                    chartStore.reload();

                    // Disable toolbar
                    chartToolbar.getComponent('delete').disable();
                    chartToolbar.getComponent('edit').disable();
                }
            });
        }
    }
})
;


