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


Ext.define('openHAB.config.zwaveDeviceList', {
    extend: 'Ext.panel.Panel',
    icon: 'images/application-list.png',
    title: language.zwave_Devices,
    border: false,
    layout: 'fit',

    initComponent: function () {
        var me = this;

        function getChildLeafNodes(node) {
            var allNodes = new Array();
            if (!Ext.value(node, false)) {
                return [];
            }

            if (!node.hasChildNodes()) {
                return [];
            } else if(node.isVisible()) {
                allNodes.push(node.get("domain"));
                node.eachChild(function (Mynode) {
                    allNodes = allNodes.concat(getChildLeafNodes(Mynode));
                });
            }
            return allNodes;
        }

        var toolbar = Ext.create('Ext.toolbar.Toolbar', {
            items: [
                {
                    icon: 'images/arrow-circle-315.png',
                    itemId: 'reload',
                    text: language.zwave_DevicesReloadButton,
                    cls: 'x-btn-icon',
                    disabled: false,
                    tooltip: language.zwave_DevicesReloadButtonTip,
                    handler: function () {
                        var store = list.getStore();
                        if (store == null)
                            return;

                        // Reload the store
                        store.reload();
                    }
                },
                {
                    icon: 'images/bandaid--arrow.png',
                    itemId: 'heal',
                    text: language.zwave_DevicesHealButton,
                    cls: 'x-btn-icon',
                    disabled: false,
                    tooltip: language.zwave_DevicesHealButtonTip,
                    handler: function () {
                        Ext.Ajax.request({
                            url: HABminBaseURL + '/zwave/action/binding/network/',
                            method: 'PUT',
                            jsonData: 'Heal',
                            headers: {'Accept': 'application/json'},
                            success: function (response, opts) {
                            },
                            failure: function () {
                                handleStatusNotification(NOTIFICATION_ERROR, language.zwave_DevicesActionError);
                            }
                        });
                    }
                }
            ]
        });

        // Create the model for the store
        Ext.define('ZWaveConfigModel', {
            extend: 'Ext.data.Model',
            idProperty: 'domain',
            fields: [
                {name: 'domain', type: 'string'},
                {name: 'name', type: 'string'},
                {name: 'label', type: 'string'},
                {name: 'optional', type: 'boolean'},
                {name: 'readonly', type: 'boolean'},
                {name: 'type', type: 'string'},
                {name: 'value', type: 'string'},
                {name: 'minimum', type: 'integer'},
                {name: 'maximum', type: 'integer'},
                {name: 'state', type: 'string'},
                {name: 'description', type: 'string'},
                {name: 'valuelist'},
                {name: 'actionlist'}
            ]
        });

        // Create the tree view, and the associated store
        var list = Ext.create('Ext.tree.Panel', {
            store: {
                extend: 'Ext.data.TreeStore',
                model: 'ZWaveConfigModel',
                autoSync: false,
                clearOnLoad: true,
                clearRemovedOnLoad: true,
                proxy: {
                    type: 'rest',
                    url: HABminBaseURL + '/zwave',
                    reader: {
                        root: 'records'
                    },
                    headers: {'Accept': 'application/json'},
                    pageParam: undefined,
                    startParam: undefined,
                    sortParam: undefined,
                    limitParam: undefined
                },
                nodeParam: "domain",
                root: {
                    text: 'nodes',
                    domain: 'nodes/',
                    expanded: true
                },
                listeners: {
                    load: function (tree, node, records, success) {
                        node.eachChild(function (childNode) {
                            var domain = childNode.get('domain');

                            // Set the icons and leaf attributes for the tree
                            if (domain.indexOf('/', domain.length - 1) == -1) {
                                childNode.set('leaf', true);

                                if (childNode.get('readonly') == true)
                                    childNode.set('iconCls', 'x-config-icon-readonly');
                                else
                                    childNode.set('iconCls', 'x-config-icon-editable');
                            }
                            else {
                                childNode.set('iconCls', 'x-config-icon-domain');
                                childNode.set('leaf', false);
                            }
                        });
                    }
                }
            },
            header: false,
            split: true,
            tbar: toolbar,
            collapsible: false,
            multiSelect: false,
            singleExpand: true,
            rootVisible: false,
            viewConfig: {
                stripeRows: true,
                markDirty: false
            },
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 2,
                    listeners: {
                        beforeedit: function (e, editor) {
                            // Only allow editing if this is not a read-only cell
                            if (editor.record.get('readonly') == true)
                                return false;
                        },
                        edit: function (editor, e) {
                            // Detect if data has actually changed
                            if (e.originalValue == e.value) {
                                // No change!
                                return;
                            }

                            // Check that the value is within limits
                            var limitError = false;
                            if (limitError == true) {
                                handleStatusNotification(NOTIFICATION_WARNING, sprintf(language.zwave_DevicesValueUpdateRangeError, e.record.get('minimum'), e.record.get('maximum')));
                                return;
                            }

                            // All good - send it to the server
                            var domain = e.record.get('domain');
                            Ext.Ajax.request({
                                url: HABminBaseURL + '/zwave/set/' + domain,
                                method: 'PUT',
                                jsonData: e.value,
                                headers: {'Accept': 'application/json'},
                                success: function (response, opts) {
                                },
                                failure: function () {
                                    handleStatusNotification(NOTIFICATION_ERROR, language.zwave_DevicesValueUpdateError);
                                }
                            });
                        }
                    }
                })
            ],
            columns: [
                {
                    text: language.zwave_DevicesTreeNode,
                    xtype: 'treecolumn',
                    flex: 1,
                    dataIndex: 'label',
                    renderer: function (value, meta, record) {
                        // If a description is provided, then display this as a tooltip
                        var description = record.get("description");
                        if (description != "") {
                            description = Ext.String.htmlEncode(description);
                            meta.tdAttr = 'data-qtip="' + description + '"';
                        }

                        // Add a small status image to show the state of this record
                        var img = "";
                        switch (record.get('state')) {
                            case 'OK':
                                meta.tdCls = 'grid-ok';
                                break;
                            case 'WARNING':
                                meta.tdCls = 'grid-warning';
                                break;
                            case 'ERROR':
                                meta.tdCls = 'grid-error';
                                break;
                            case 'INITIALIZING':
                                meta.tdCls = 'grid-initializing';
                                break;
                        }

                        return value;
                    }
                },
                {
                    text: language.zwave_DevicesTreeValue,
                    flex: 1,
                    dataIndex: 'value',
                    renderer: function (value, meta, record) {
                        if (value == "")
                            return "";

                        // If the status is PENDING, then mark it so...
                        if(record.get('state') == "PENDING")
                            meta.style = 'background-color: #FDFD96;border-radius: 8px;';

                        // If this is a list, then we want to display the value, not the number!
                        var type = record.get('type');
                        if (type != "LIST")
                            return value;

                        var list = record.get('valuelist');
                        if (list == null || list.entry == null)
                            return value;

                        for (var cnt = 0; cnt < list.entry.length; cnt++) {
                            if (value == list.entry[cnt].key)
                                return list.entry[cnt].value;
                        }

                        // If we didn't find an entry with this value, just show the value.
                        return value;
                    },
                    getEditor: function (record, defaultField) {
                        var type = record.get('type');

                        if (type == "LIST") {
                            // This is a list, so we need to load the data into a store
                            // and create a combobox editor.
                            Ext.define('ListComboModel', {
                                extend: 'Ext.data.Model',
                                fields: [
                                    {name: 'key'},
                                    {name: 'value'}
                                ]
                            });
                            // Create the data store
                            var store = Ext.create('Ext.data.ArrayStore', {
                                model: 'ListComboModel'
                            });
                            var list = record.get('valuelist')
                            if (list != null && list.entry != null)
                                store.loadData(list.entry);

                            var editor = Ext.create('Ext.grid.CellEditor', {
                                field: Ext.create('Ext.form.field.ComboBox', {
                                    store: store,
                                    editable: false,
                                    displayField: 'value',
                                    valueField: 'key',
                                    queryMode: 'local'
                                })
                            });

                            editor.field.setEditable(false);
                            editor.field.setValue("YYY");
                            return editor;
                        } else {
                            return Ext.create('Ext.grid.CellEditor', {
                                field: Ext.create('Ext.form.field.Text')
                            });
                        }
                    }
                }
            ],
            listeners: {
                select: function (grid, record, index, eOpts) {
                    // Remove all current action buttons
                    for (var cnt = 2; cnt < toolbar.items.length; cnt++) {
                        toolbar.remove(toolbar.items.get(cnt), true);
                    }

                    if (record == null)
                        return;

                    var list = record.get("actionlist");
                    if (list == null || list.entry == null)
                        return;

                    var actions = [].concat(list.entry);
                    if (actions.length == 0)
                        return;

                    var domain = record.get("domain");
                    var name = record.get("name");

                    // Add any actions for the selected item
//                    for (var cnt = 0; cnt < actions.length; cnt++) {
                    var x = {
//                            itemId:"action" + 0,
                        icon: 'images/gear.png',
                        cls: 'x-btn-icon',
                        text: actions[0].value,
                        handler: function () {
                            var data = {};
                            data.action = actions[0].key;
//                                data.name = name;
                            Ext.Ajax.request({
                                url: HABminBaseURL + '/zwave/action/' + domain,
                                method: 'PUT',
                                jsonData: actions[0].key,
                                headers: {'Accept': 'application/json'},
                                success: function (response, opts) {
                                },
                                failure: function () {
                                    handleStatusNotification(NOTIFICATION_ERROR, language.zwave_DevicesActionError);
                                }
                            });
                        }
                    };

                    toolbar.add(x);
//                     }

                    // Get the node ID
                    var nodeName;
                },
                afteritemexpand: function (node, index, item, eOpts) {
                    // Get a list of all children nodes
                    me.nodePollingTable = getChildLeafNodes(node);

                    // And now add parents as well
                    var parent = node.parentNode;
                    while (parent != null) {
                        me.nodePollingTable.push(parent.get("domain"));
                        parent = parent.parentNode;
                    }
                }
            }
        });

        this.store = list.getStore();
        this.items = [list];
        this.callParent();
    },
    store: null,
    nodePollingTable: [],
    updateView: {
        run: function () {
            // Periodically update the visible store items
            if (this.nodePollingTable == null || this.nodePollingTable.length == 0)
                return;

            // Keep a local copy of 'this' so we have scope in the callback
            var me = this;
            // Loop through and request all visible nodes
            for (var cnt = 0; cnt < this.nodePollingTable.length; cnt++) {
                // Request an update of the node
                Ext.Ajax.request({
                    type: 'rest',
                    url: HABminBaseURL + '/zwave/' + this.nodePollingTable[cnt],
                    method: 'GET',
                    success: function (response, opts) {
                        var res = Ext.decode(response.responseText);
                        if (res == null || res.records == null)
                            return;

                        // Loop through all records
                        for (var i = 0; i < res.records.length; i++) {
                            var updatedNode = me.store.getNodeById(res.records[i].domain);
                            if (updatedNode == null) {
                                // TODO:If the node isn't found, then it's new - add it!
//                                var rootNode = me.store.getRootNode();
//                                rootNode.insertChild(4,res.records[i]);
                                continue;
                            }

                            // Update the dynamic attributes
                            updatedNode.set("value", res.records[i].value);
                            updatedNode.set("state", res.records[i].state);
                        }
                    }
                });
            }
        },
        interval: 1500
    },
    listeners: {
        beforeshow: function (grid, eOpts) {
            this.updateView.scope = this;
            Ext.TaskManager.start(this.updateView);
        },
        beforehide: function (grid, eOpts) {
            Ext.TaskManager.stop(this.updateView);
        },
        beforedestroy: function (grid, eOpts) {
            Ext.TaskManager.stop(this.updateView);
        }
    }
})
;
