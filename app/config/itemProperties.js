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

//                        itemData.model = ;
//                        itemData.binding = item.get("binding");
                        itemData.groups = itemGroups.getSelected();

                        itemData.type = prop.Type;
                        itemData.name = prop.ItemName;
                        itemData.icon = prop.Icon;
                        itemData.label = prop.Label;
                        itemData.units = prop.Units;
                        itemData.format = prop.Format;
                        itemData.map = prop.Map;
//                        itemData.bindings = ;

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
            bbar:statusBar,
            hideHeaders:true,
            sortableColumns:false,
            nameColumnWidth:300,
            split:true,
            source:{
                ItemName:"",
                Type:"",
                Label:"",
                Units:"",
                Format:"",
                Map:"",
                Icon:"",
                Groups:"",
                Persistence:""
            },
            sourceConfig:{
                ItemName:{
                    displayName:"Item Name"
                },
                Icon:{
                    renderer:function (v) {
                        if(v == "")
                            return "";
                        var icon="";
                        var label="";
                        var resp = '<div width="30">';
                        var ref = itemIconStore.findExact("name", v);
                        if(ref != -1) {
                            if(itemIconStore.getAt(ref).get('menuicon') != "")
                                icon = '<img src="../images/'+itemIconStore.getAt(ref).get('menuicon')+'" align="left" height="16">';
                            if(itemIconStore.getAt(ref).get('label') != "")
                                label = itemIconStore.getAt(ref).get('label');
                        }
                        else {
                            // If we get here, we're using an icon that isn't known to the REST service
                            icon = '<img src="../images/' + v + '.png" align="left" height="16">';
                            label = v + " (manually set)";
                        }

                        resp += '</div>' + v;
                        return '<div>' + icon + '</div><div style="margin-left:20px">' + label +'</div>';
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
                }
            },
            viewConfig:{
                markDirty:false
            },
            listeners:{
                propertychange:function (source, recordId, value, oldValue, eOpts) {
                    toolbar.getComponent('cancel').enable();
                    toolbar.getComponent('save').enable();

                },
                beforeedit : function(editor, e) {
                    var rec = e.record;
                    // Make some properties read-only
                    if (rec.get('name') == 'Groups')
                        e.cancel=true;
                    if (rec.get('name') == 'Persistence')
                        e.cancel=true;
                }
            }
        });

        var itemGroups = Ext.create('openHAB.config.groupTree');

        var itemBindings = Ext.create('openHAB.config.itemBindings');

        // Create the tab container for the item configuration
        var tabs = Ext.create('Ext.tab.Panel', {
            layout:'fit',
            border:false,
            items:[itemOptions, itemGroups, itemBindings],
            listeners: {
                beforetabchange:function (tabPanel, newCard, oldCard, eOpts) {
                    // Detect if we've changed view so we can collate the data from the sub-tabs
                    if (newCard.itemId == 'itemProperties') {
                        itemOptions.setProperty("Groups", itemGroups.getSelected());
                    }
                }
            }
        });

        this.items = tabs;

        this.callParent();

        // Class members.
        this.setItem = function (itemName) {

            bindingName = name;
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

        function updateItem(json) {
            itemData = json;
            statusBar.setText("Item: "+json.name);

            // Set the main item properties
            itemOptions.setProperty("ItemName", json.name);
            itemOptions.setProperty("Type", json.type);
            if(json.icon != null)
                itemOptions.setProperty("Icon", json.icon);
            itemOptions.setProperty("Label", json.label);
            itemOptions.setProperty("Units", json.units);
            itemOptions.setProperty("Format", json.format);
            itemOptions.setProperty("Map", json.map);
            itemOptions.setProperty("Groups", json.groups);

            // Ensure the persistence is an array!
            if(json.persistence != null) {
                var persistenceIn = [].concat(json.persistence);
                var persistenceOut = "";

                for(var cnt = 0; cnt < persistenceIn.length; cnt++) {
                    persistenceOut += persistenceIn[cnt].service;
                    if(persistenceIn[cnt].strategies != null)
                        persistenceOut += "[" + persistenceIn[cnt].strategies + "] ";
                    else
                        persistenceOut += "[default] ";
                }
            }
            itemOptions.setProperty("Persistence", persistenceOut);

            // Ensure the groups is an array!
            var groups = [].concat(json.groups);

            // Set the groups
            itemGroups.resetGroups();
            for(var cnt = 0; cnt < groups.length; cnt++)
                itemGroups.setGroup(groups[cnt]);

            // Ensure the groups is an array!
            var bindings = [].concat(json.bindings);

            // Set the binding strings
            itemBindings.setBindings(bindings);

            toolbar.getComponent('cancel').disable();
            toolbar.getComponent('save').disable();
        }
    }
})
;