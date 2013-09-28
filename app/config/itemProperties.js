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


Ext.define('openHAB.config.itemProperties', {
    extend:'Ext.panel.Panel',
    layout:'fit',
    tabTip:'Item Properties',
    header:false,

    initComponent:function () {
        var itemHelp = {
            ItemName:"Set the item name.",
            Type:"Set the item type.",
            Label:"Specify the default label used in the UI.",
            Units:"Specify the unit for this item. This is printed after the value.",
            Format:"Specify the default format that is used for printing values.",
            Map:"Define the mapping list applicable for the item.",
            Icon:"Define the default icon for the item. This is used for the UI.",
            Groups:"List groups that this item is entered. Groups must be changed in the 'Groups' tab.",
            Persistence:"Lists persistence services configured for this item."
        };

        var sourceConfig = {
            ItemName:{
                displayName:"Item Name"
            },
            Icon:{
                renderer:function (v) {
                    if (v == "")
                        return "";
                    var icon = "";
                    var label = "";
                    var resp = '<div width="30">';
                    var ref = itemIconStore.findExact("name", v);
                    if (ref != -1) {
                        if (itemIconStore.getAt(ref).get('menuicon') != "")
                            icon = '<img src="../images/' + itemIconStore.getAt(ref).get('menuicon') + '" align="left" height="16">';
                        if (itemIconStore.getAt(ref).get('label') != "")
                            label = itemIconStore.getAt(ref).get('label');
                    }
                    else {
                        // If we get here, we're using an icon that isn't known to the REST service
                        icon = '<img src="../images/' + v + '.png" align="left" height="16">';
                        label = v + " (manually set)";
                    }

                    resp += '</div>' + v;
                    return '<div>' + icon + '</div><div style="margin-left:20px">' + label + '</div>';
                },
                editor:Ext.create('Ext.form.ComboBox', {
                    store:itemIconStore,
                    queryMode:'local',
                    typeAhead:false,
                    editable:false,
                    displayField:'label',
                    valueField:'name',
                    forceSelection:true,
                    editable:false,
                    allowBlank:false,
                    listConfig:{
                        getInnerTpl:function () {
                            var tpl = '<div>' +
                                '<img src="../images/{menuicon}" align="left" height="16">&nbsp;&nbsp;' +
                                '{label}</div>';
                            return tpl;
                        }
                    }
                })
            },
            Format:{
                renderer:function (v) {
                    var label = "";
                    var ref = itemFormatStore.findExact("format", v);
                    if (ref != -1) {
                        if (itemFormatStore.getAt(ref).get('label') != "")
                            label = itemFormatStore.getAt(ref).get('label');
                    }
                    else {
                        // If we get here, we're using a format that isn't defined
                        label = v;
                    }

                    return label;
                },
                editor:Ext.create('Ext.form.ComboBox', {
                    store:itemFormatStore,
                    queryMode:'local',
                    typeAhead:true,
                    displayField:'label',
                    valueField:'format',
                    forceSelection:false,
                    editable:true,
                    allowBlank:true
                })
            },
            Groups:{
            },
            Type:{
                displayName:"Item Type",
                renderer:function (v) {
                    var ref = itemTypeStore.findExact("name", v);
                    if (ref == -1)
                        return;
                    var icon = itemTypeStore.getAt(ref).get("icon");
                    return '<div>' +
                        '<img src="' + icon + '" align="left" height="16" width:"46">&nbsp;&nbsp;' +
                        v + '</div>';
                },
                editor:Ext.create('Ext.form.ComboBox', {
                    store:itemTypeStore,
                    queryMode:'local',
                    typeAhead:false,
                    editable:false,
                    displayField:'name',
                    valueField:'name',
                    forceSelection:true,
                    editable:false,
                    allowBlank:false,
                    listConfig:{
                        getInnerTpl:function () {
                            var tpl = '<div>' +
                                '<img src="{icon}" align="left" height="16" width:"16";>&nbsp;&nbsp;' +
                                '{name}</div>';
                            return tpl;
                        }
                    }
                })
            },
            Map:{
                displayName:"Translation Map",

                editor:Ext.create('Ext.form.ComboBox', {
                    queryMode:'local',
                    typeAhead:false,
                    editable:true,
                    displayField:'name',
                    valueField:'id'
                })
            },
            Persistence:{
                displayName:"Persistence"
            },
            Groups:{
                displayName:"Groups"
            }
        };

        var itemData;

        Ext.define('ItemIcons', {
            extend:'Ext.data.Model',
            fields:[
                {type:'number', name:'id'},
                {type:'string', name:'icon'},
                {type:'string', name:'name'}
            ]
        });

        var toolbar = Ext.create('Ext.toolbar.Toolbar', {
            items:[
                {
                    icon:'images/cross.png',
                    itemId:'cancel',
                    text:'Cancel',
                    cls:'x-btn-icon',
                    disabled:true,
                    tooltip:'Cancel changes made to the item configuration',
                    handler:function () {
                        // Reset to the current data
                        updateItem(itemData);
                    }
                },
                {
                    icon:'images/disk.png',
                    itemId:'save',
                    text:'Save',
                    cls:'x-btn-icon',
                    disabled:true,
                    tooltip:'Save changes to the item configuration',
                    handler:function () {
                        var prop = itemOptions.getSource();
                        if (prop == null)
                            return;

                        itemData.groups = itemGroups.getSelected();
                        itemData.bindings = itemBindings.getBindings();
                        itemData.binding = itemBindings.getBindingName();

                        itemData.type = prop.Type;
                        itemData.name = prop.ItemName;
                        itemData.icon = prop.Icon;
                        itemData.label = prop.Label;
                        itemData.units = prop.Units;
                        itemData.format = prop.Format;
                        itemData.map = prop.Map;

                        // Send the sitemap to openHAB
                        Ext.Ajax.request({
                            url:"/rest/config/items/" + itemData.name,
                            headers:{'Accept':'application/json'},
                            method:'PUT',
                            jsonData:itemData,
                            success:function (response, opts) {
                                Ext.MessageBox.show({
                                    msg:'Item configuration saved',
                                    width:200,
                                    draggable:false,
                                    icon:'icon-ok',
                                    closable:false
                                });
                                setTimeout(function () {
                                    Ext.MessageBox.hide();
                                }, 2500);

                                var json = Ext.decode(response.responseText);
                                // If there's no config for this binding, records will be null
                                if (json == null)
                                    return;

                                updateItem(json);
                            },
                            failure:function (result, request) {
                                Ext.MessageBox.show({
                                    msg:'Error saving item',
                                    width:200,
                                    draggable:false,
                                    icon:'icon-error',
                                    closable:false
                                });
                                setTimeout(function () {
                                    Ext.MessageBox.hide();
                                }, 2500);
                            },
                            callback:function (options, success, response) {
                                // Reload the store
                                itemConfigStore.reload();
                            }
                        });

                        toolbar.getComponent('cancel').disable();
                        toolbar.getComponent('save').disable();
                    }
                }
            ]
        });

        var graphTypeStore = Ext.create('Ext.data.Store', {
            fields:['id', 'name']
        });
        var graphTypes = [
            {id:0, name:'Spline'},
            {id:1, name:'Line'},
            {id:2, name:'Bar'}
        ];

        graphTypeStore.loadData(graphTypes);

        var helpStatusText = Ext.create('Ext.toolbar.TextItem', {text:''});
        var statusBar = Ext.create('Ext.ux.StatusBar', {text:'-', items:[helpStatusText]});

        var itemOptions = Ext.create('Ext.grid.property.Grid', {
            title:'Properties',
            icon:'images/gear.png',
            itemId:'itemProperties',
            tbar:toolbar,
            hideHeaders:true,
            sortableColumns:false,
            nameColumnWidth:300,
            split:true,
            viewConfig:{
                markDirty:true
            },
            listeners:{
                propertychange:function (source, recordId, value, oldValue, eOpts) {
                    toolbar.getComponent('cancel').enable();
                    toolbar.getComponent('save').enable();
                },
                beforeedit:function (editor, e) {
                    var rec = e.record;
                    // Make some properties read-only
                    if (rec.get('name') == 'Groups')
                        e.cancel = true;
                    if (rec.get('name') == 'Persistence')
                        e.cancel = true;
                },
                itemmouseenter:function (grid, record, item, index, e, eOpts) {
                    var name = record.get("name");
                    helpStatusText.setText(itemHelp[name]);
                },
                itemmouseleave:function (grid, record, item, index, e, eOpts) {
                    helpStatusText.setText("");
                }
            }
        });

        var itemGroups = Ext.create('openHAB.config.groupTree');

        var itemBindings = Ext.create('openHAB.config.itemBindings');

        // Create the tab container for the item configuration
        var tabs = Ext.create('Ext.tab.Panel', {
            layout:'fit',
            bbar:statusBar,
            border:false,
            items:[itemOptions, itemGroups, itemBindings],
            listeners:{
                beforetabchange:function (tabPanel, newCard, oldCard, eOpts) {
                    // Detect if we've changed view so we can collate the data from the sub-tabs
                    if (newCard.itemId == 'itemProperties') {
                        // Only update the property grid if it's changed.
                        // Otherwise the cell gets marked dirty when it's not!
                        var newGroups = itemGroups.getSelected();
                        if (itemData.groups != newGroups) {
                            var groupsOut = "";
                            newGroups = [].concat(newGroups);
                            for (var cnt = 0; cnt < newGroups.length; cnt++) {
                                itemGroups.setGroup(newGroups[cnt]);
                                if(groupsOut.length != 0)
                                    groupsOut += ", ";
                                groupsOut += newGroups[cnt];
                            }

                            itemOptions.setProperty("Groups", groupsOut);
                        }

                        // Just detect if the bindings have changed
                        if(itemBindings.isDirty()) {
                            toolbar.getComponent('cancel').enable();
                            toolbar.getComponent('save').enable();
                        }
                    }
                }
            }
        });

        this.items = tabs;

        this.callParent();

        // Class members.
        this.setItem = function (itemName) {
            Ext.Ajax.request({
                url:'/rest/config/items/' + itemName,
                timeout:5000,
                method:'GET',
                headers:{'Accept':'application/json'},
                success:function (response, opts) {
                    var json = Ext.decode(response.responseText);
                    // If there's no config for this binding, records will be null
                    if (json == null)
                        return;

                    updateItem(json);
                }
            });
        }

        // Create a new item
        this.newItem = function (modelName) {
            var json = {};
            json.model = modelName;
            json.groups = "";

            updateItem(json);
        }

        // Update the item properties
        function updateItem(json) {
            itemData = json;
            statusBar.setText("Item: " + json.name);

            // Set the main item properties
            var source = {};
            source.ItemName = setValue(json.name);
            source.Type = setValue(json.type);
            source.Icon = setValue(json.icon);
            source.Label = setValue(json.label);
            source.Format = setValue(json.format);
            source.Units = setValue(json.units);
            source.Map = setValue(json.map);

            // Ensure the persistence is an array!
            var persistenceOut = "";
            if (json.persistence != null) {
                var persistenceIn = [].concat(json.persistence);

                for (var cnt = 0; cnt < persistenceIn.length; cnt++) {
                    persistenceOut += persistenceIn[cnt].service;
                    if (persistenceIn[cnt].strategies != null)
                        persistenceOut += "[" + persistenceIn[cnt].strategies + "] ";
                    else
                        persistenceOut += "[default] ";
                }
            }
            source.Persistence = persistenceOut;

            // Ensure the groups is an array!
            var groups = [];
            if(json.groups)
                var groups = [].concat(json.groups);

            // Set the groups
            var groupsOut = "";
            itemGroups.resetGroups();
            for (var cnt = 0; cnt < groups.length; cnt++) {
                itemGroups.setGroup(groups[cnt]);
                if(groupsOut.length != 0)
                    groupsOut += ", ";
                groupsOut += groups[cnt];
            }

            source.Groups = setValue(groupsOut);

            // If this is a group, remove all non applicable properties
            if(json.type == "GroupItem") {
                // Block the "Bindings" tab
                tabs.remove(itemBindings, true);
                // TODO: Maybe nothing? Needs to account for active groups!
            }

            // Update the property grid
            itemOptions.setSource(source, sourceConfig);

            // Ensure the bindings is an array!
            var bindings = [];
            if(json.bindings)
                bindings = [].concat(json.bindings);

            // Set the binding strings
            itemBindings.setBindings(json.binding, bindings);

            var cancel = toolbar.getComponent('cancel');
            if(cancel)
                cancel.disable();
            var save = toolbar.getComponent('save');
            if(save)
                save.disable();

            // Helper function to make above code more readable
            function setValue(val) {
                if (val == null)
                    return "";
                return val;
            }
        }
    }
})
;