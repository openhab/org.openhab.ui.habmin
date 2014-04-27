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

Ext.define('openHAB.config.itemList', {
    extend: 'Ext.panel.Panel',
    layout: 'fit',
    icon: 'images/document-node.png',

    initComponent: function () {
        this.title = language.config_ItemListTitle;
        this.tabTip = language.config_ItemListTitleTip;

        var me = this;

        var toolbar = Ext.create('Ext.toolbar.Toolbar', {
            items: [
                {
                    icon: 'images/minus-button.png',
                    itemId: 'delete',
                    text: language.delete,
                    cls: 'x-btn-icon',
                    disabled: true,
                    tooltip: language.config_ItemListDeleteTip,
                    handler: function () {
                        // Get the item name to delete
                        var record = itemsList.getSelectionModel().getSelection()[0];
                        if (record == null)
                            return;

                        // Make sure we really want to do this!!!
                        var itemName = record.get('name');
                        Ext.Msg.show({
                            title: language.config_ItemListConfirmDeleteTitle,
                            msg: sprintf(language.config_ItemListConfirmDeleteMsg, itemName),
                            buttons: Ext.Msg.YESNO,
                            config: {
                                obj: this,
                                name: itemName
                            },
                            fn: deleteItem,
                            icon: Ext.MessageBox.QUESTION
                        });
                    }
                },
                {
                    icon: 'images/plus-button.png',
                    itemId: 'add',
                    text: language.add,
                    cls: 'x-btn-icon',
                    disabled: false,
                    tooltip: language.config_ItemListAddTip,
                    handler: function () {
                        Ext.define('ItemModelsModel', {
                            extend: 'Ext.data.Model',
                            fields: [
                                {name: 'name'},
                                {name: 'icon'},
                                {name: 'iconCls'}
                            ]
                        });

                        // Generate a list of all existing models
                        // User can type their own, but this gives them options.
                        var models = [];
                        var ocnt = 0;

                        var allRecords = itemConfigStore.queryBy(function(){return true;});
                        allRecords.each(function(r) {
                            var found = false;
                            var name = r.get("model");
                            for (var mcnt = 0; mcnt < models.length; mcnt++) {
                                if (models[mcnt].name == name) {
                                    found = true;
                                    break;
                                }
                            }
                            if (found == false) {
                                models[ocnt] = {};
                                models[ocnt].name = name;
                                ocnt++;
                            }
                        });

                        var form = Ext.widget('form', {
                            layout: {
                                type: 'vbox',
                                align: 'stretch'
                            },
                            border: false,
                            bodyPadding: 10,
                            fieldDefaults: {
                                labelAlign: 'top',
                                labelWidth: 100,
                                labelStyle: 'font-weight:bold'
                            },
                            defaults: {
                                margins: '0 0 10 0'
                            },
                            items: [
                                {
                                    margin: '0 0 0 0',
                                    xtype: 'combobox',
                                    fieldLabel: language.config_ItemListModelName,
                                    itemId: 'model',
                                    name: 'model',
                                    store: {
                                        model: 'ItemModelsModel',
                                        data: models,
                                        sorters: [
                                            {
                                                property: 'name',
                                                direction: 'ASC'
                                            }
                                        ]
                                    },
                                    allowBlank: false,
                                    valueField: 'name',
                                    displayField: 'name',
                                    forceSelection: false,
                                    editable: true,
                                    typeAhead: true,
                                    queryMode: 'local'
                                }
                            ],
                            buttons: [
                                {
                                    text: language.cancel,
                                    handler: function () {
                                        this.up('window').destroy();
                                    }
                                },
                                {
                                    text: language.config_ItemListCreateItem,
                                    handler: function () {
                                        if (this.up('form').getForm().isValid()) {
                                            // Read the model name
                                            var model = form.getForm().findField('model').getSubmitValue();

                                            // Create a new itemProperties
                                            var newProperties = Ext.create('openHAB.config.itemProperties');
                                            newProperties.createItem(model);

                                            if (newProperties != null)
                                                Ext.getCmp('configPropertyContainer').setNewProperty(newProperties);

                                            this.up('window').destroy();
                                        }
                                    }
                                }
                            ]
                        });

                        var saveWin = Ext.widget('window', {
                            title: language.config_ItemListSelectModel,
                            closeAction: 'destroy',
                            width: 225,
                            resizable: false,
                            draggable: false,
                            modal: true,
                            layout: {
                                type: 'vbox',
                                align: 'stretch'
                            },
                            items: [form]
                        });

                        saveWin.show();
                    }
                },
                { xtype: 'tbfill' },
                {
                    icon: 'images/arrow-circle-315.png',
                    itemId: 'refresh',
                    cls: 'x-btn-icon',
                    disabled: false,
                    tooltip: language.config_ItemListRefreshTip,
                    handler: function () {
                        itemConfigStore.load();
                    }
                }
            ]
        });

        var itemsList = Ext.create('Ext.grid.Panel', {
            store: itemConfigStore,
            header: false,
            split: true,
            tbar: toolbar,
            collapsible: false,
            multiSelect: false,
            plugins: [
                {
                    ptype: 'grid',
                    emptyText: language.config_ItemListFilterDefault
                },
                {
                    ptype: 'cellediting',
                    clicksToEdit: 1
                }
            ],
            columns: [
                {
                    text: language.config_ItemListItem,
                    flex: 3,
                    dataIndex: 'name',
                    renderer: function (value, metadata, record) {
                        var icon = "";
                        var ref = itemConfigStore.findExact("name", value);
                        if (ref != -1) {
                            if (itemConfigStore.getAt(ref).get('icon') != "")
                                icon = '<img src="../images/' + itemConfigStore.getAt(ref).get('icon') + '.png" align="left" height="16">';
                        }

                        return '<div>' + icon + '</div><div style="margin-left:20px">' + value + '</div>';
                    }
                },
                {
                    text: language.config_ItemListLabel,
                    flex: 4,
                    dataIndex: 'label',
                    renderer: function (value, metadata, record, row, col, store, gridView) {
                        var img = '';
                        var id = persistenceItemStore.findExact("name", record.get("name"));
                        if (id != -1) {
                            metadata.tdCls = 'grid-database';
                        }

                        return value;
                    }
                },
                {
                    text: language.config_ItemListType,
                    flex: 2,
                    dataIndex: 'type',
                    renderer: function (value, metadata, record, row, col, store, gridView) {
                        var img = 'node.png';
                        if (record.get("type") != null)
                            img = getItemTypeIcon(record.get("type"));

                        return '<img src="' + img + '" align="left" height="16">&nbsp;&nbsp;' + value;
                    }
                },
                {
                    text: language.config_ItemListModel,
                    flex: 2,
                    dataIndex: 'model'
                }
            ],
            listeners: {
                itemclick: function (grid, record) {
                    if (record == null)
                        return;

                    var newProperties = null;

                    // Create a new itemProperties
                    newProperties = Ext.create('openHAB.config.itemProperties');
                    newProperties.setItem(record.get('name'));

                    if (newProperties != null)
                        Ext.getCmp('configPropertyContainer').setNewProperty(newProperties);

                    // Update the toolbar
                    toolbar.getComponent('delete').enable();
                }
            }
        });

        this.items = itemsList;

        this.callParent();

        function deleteItem(button, text, options) {
            if (button !== 'yes')
                return;

            // Tell OH to Remove the item
            Ext.Ajax.request({
                url: HABminBaseURL + "/config/items/" + options.config.name,
                headers: {'Accept': 'application/json'},
                method: 'DELETE',
                success: function (response, opts) {
                    handleStatusNotification(NOTIFICATION_OK, sprintf(language.config_ItemListDeleted, options.config.name));
                },
                failure: function (result, request) {
                    handleStatusNotification(NOTIFICATION_ERROR, sprintf(language.config_ItemListDeleteError, options.config.name));
                },
                callback: function (options, success, response) {
                    // Reload the store
                    itemConfigStore.reload();

                    // Disable delete
                    toolbar.getComponent('delete').disable();

                    // Clear the item properties
                    Ext.getCmp('configPropertyContainer').removeProperty();
                }
            });
        }
    }
})
;