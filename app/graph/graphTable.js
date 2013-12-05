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

Ext.define('openHAB.graph.graphTable', {
    extend:'Ext.panel.Panel',
    layout:'fit',
    tabTip:'Show and edit graph data',
    itemId:'graphTableData',
    title:'Table',
    icon:'images/table-export.png',
    lastUpdate:0,
    deferredRender:true,

    initComponent:function () {
        this.callParent();

        this.updateData = function () {
            // Detect if the graph data has been updated
            // Don't update the table if it's old data!
            if (Ext.getCmp("highchartsChart").getLastUpdate() == null)
                return;
            if (Ext.getCmp("highchartsChart").getLastUpdate() < this.lastUpdate)
                return;
            this.lastUpdate = (new Date()).getTime();

            // Retrieve the data from the graph object
            var data = Ext.getCmp("highchartsChart").getData();
            if (data == null)
                return;
            if (data.length == 0)
                return;

            // Remove the current grid
            this.removeAll();

            Ext.MessageBox.show({
                msg:'Producing table array...',
                width:100,
                height:40,
                icon:'icon-download',
                draggable:false,
                closable:false
            });

            var columns = [];
            columns[0] = [];
            columns[0].text = 'Time';
            columns[0].dataIndex = 'time';
            columns[0].xtype = 'datecolumn';
            columns[0].format = 'H:i:s d M Y';
            columns[0].width = 130;

            var fields = [];
            fields[0] = [];
            fields[0].name = 'time';
            fields[0].type = 'date';
            fields[0].dateFormat = 'time';

            for (var c = 0; c < data.length; c++) {
                // Add the field attributes for the data model
                fields[c + 1] = [];
                fields[c + 1].name = data[c].item;

                // Add the column attributes for the grid
                columns[c + 1] = [];
                columns[c + 1].text = data[c].item;
                columns[c + 1].dataIndex = data[c].item;
                columns[c + 1].width = 150;
            }

            // Create a model
            Ext.define('GraphTableModel', {
                extend:'Ext.data.Model',
                fields:fields
            });

            var editAction = Ext.create('Ext.Action', {
                icon:'images/layer--pencil.png',
                text:'Edit Record',
                disabled:false,
                handler:function (widget, event) {
                    var c = dataGrid.contextCellIndex;
                    var x = dataGrid.contextRowIndex;
                    var rec = dataGrid.getSelectionModel().getSelection()[0];
                    if (rec) {
                    }
                }
            });
            var deleteAction = Ext.create('Ext.Action', {
                icon:'images/cross.png',
                text:'Delete Record',
                disabled:false,
                handler:function (widget, event) {
                    // Delete the selected record!
                    var cell = dataGrid.contextCellIndex;
                    var row = dataGrid.contextRowIndex;

                    var store = dataGrid.getStore();
                    if (store == null)
                        return;

                    var rec = store.getAt(row);
                    if (rec == null)
                        return;

                    var time = rec.get("time");
                    var state = rec.get(columns[cell].text);

                    // Make sure we really want to do this!!!
                    Ext.Msg.show({
                        title:"Confirm Delete",
                        msg:'Are you sure you want to delete the selected record?<br>' + columns[cell].text + '<br>' + time + ':' + state,
                        buttons:Ext.Msg.YESNO,
                        config:{
                            obj:this,
                            item:columns[cell].dataIndex,
                            time:time,
                            state:state
                        },
                        fn:deleteRecord,
                        icon:Ext.MessageBox.QUESTION
                    });
                }
            });

            var contextMenu = Ext.create('Ext.menu.Menu', {
                items:[
                    editAction,
                    deleteAction
                ]
            });

            var dataGrid = Ext.create('Ext.grid.Panel', {
                store:{model:'GraphTableModel', data:data[0].data},
                multiSelect:false,
                columns:columns,
                selType:'cellmodel',
                viewConfig:{
                    stripeRows:true,
                    listeners:{
                        cellcontextmenu:function (grid, td, cellIndex, record, tr, rowIndex, e, eOpts) {
                            e.stopEvent();
                            if (cellIndex == 0)
                                return false;

                            // Make sure the selected persistence service is a full CRUD
                            var id = persistenceServiceStore.findExact(persistenceService);
                            if(id == -1)
                                return false;

                            // Set showMenu to true is one action is supported
                            var showMenu = false;
                            var svc = [].concat(persistenceItemStore.getAt(id).get("actions"));
                            svc = ["Delete"];
                            if(svc.indexOf("Delete") == -1)
                                deleteAction.disable();
                            else {
                                deleteAction.enable();
                                showMenu = true;
                            }

                            if(svc.indexOf("Update") == -1)
                                editAction.disable();
                            else {
                                editAction.enable();
                                showMenu = true;
                            }

                            // If no services, just return
                            if(showMenu == false)
                                return;

                            dataGrid.contextCellIndex = cellIndex;
                            dataGrid.contextRowIndex = rowIndex;
                            contextMenu.showAt(e.getXY());
                            return false;
                        }
                    }
                }
            });

            this.add(dataGrid);

            Ext.MessageBox.hide();
        }
        this.isUpdateRequired = function () {
            // Detect if the graph data has been updated
            // Don't update the table if it's old data!
            if (Ext.getCmp("highchartsChart").getLastUpdate() < this.lastUpdate)
                return false;
            return true;
        }

        function deleteRecord(button, text, options) {
            if (button !== 'yes')
                return;

            // Specify the delete parameters
            var parms = {};
            parms.time = options.config.time;

            // Tell OH to Remove the record
            Ext.Ajax.request({
                url:HABminBaseURL + "/persistence/" + persistenceService + '/' + options.config.item,
                headers:{'Accept':'application/json'},
                params:parms,
                method:'DELETE',
                success:function (response, opts) {
                    handleStatusNotification(NOTIFICATION_OK,'Record deleted');
                },
                failure:function (result, request) {
                    handleStatusNotification(NOTIFICATION_ERROR,'Error deleting record');
                },
                callback:function (options, success, response) {
                    // Reload the store
                    sitemapStore.reload();

                    // Clear the sitemap properties
                    Ext.getCmp('configPropertyContainer').removeProperty();

                    // Disable delete
                    toolbar.getComponent('delete').disable();
                }
            });
        }
    }
})
;