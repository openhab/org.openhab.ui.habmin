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
        var thisItem;

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
                        toolbar.getComponent('cancel').disable();
                        toolbar.getComponent('save').disable();

                        // Reset to the current data
                        this.setItem(thisItem);
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
                        var rec = itemConfigStore.findExact("name", thisItem);
                        if (rec == -1)
                            return;
                        var item = itemConfigStore.getAt(rec);

                        var jsonArray = {};
                        jsonArray.model = item.get("model");
                        jsonArray.binding = item.get("binding");
                        jsonArray.groups = itemGroups.getSelected();

                        var prop = itemOptions.getSource();
                        if (prop == null)
                            return;

                        jsonArray.type = prop.Type;
                        jsonArray.name = prop.ItemName;
                        jsonArray.icon = prop.Icon;
                        jsonArray.label = prop.Label;
                        jsonArray.units = prop.Units;
                        jsonArray.format = prop.Format;
                        jsonArray.map = prop.Map;
//                        jsonArray.bindings = ;

                        // Send the sitemap to openHAB
                        Ext.Ajax.request({
                            url:"/rest/config/items/" + thisItem,
                            headers:{'Accept':'application/json'},
                            method:'PUT',
                            jsonData:jsonArray,
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

        var itemOptions = Ext.create('Ext.grid.property.Grid', {
            title:'Properties',
            icon:'images/gear.png',
            itemId:'itemProperties',
            tbar:toolbar,
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
                            icon = "../images/" + v + ".png";
                            label = v + "  (manually set)";
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
//                    renderer:function (v) {
//                    },
                    editor:Ext.create('Ext.form.ComboBox', {
//                        store:graphTypeStore,
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

        function blah() {

        }

        // Class members.
        this.setItem = function (newItem) {
            blah();
            var item = itemConfigStore.findExact("name", newItem);
            if (item == -1)
                return;

            thisItem = newItem;

            var rec = itemConfigStore.getAt(item);

            // Set the main item properties
            itemOptions.setProperty("ItemName", rec.get('name'));
            itemOptions.setProperty("Type", rec.get('type'));
            if(rec.get('icon') != null)
                itemOptions.setProperty("Icon", rec.get('icon'));
            itemOptions.setProperty("Label", rec.get('label'));
            itemOptions.setProperty("Units", rec.get('units'));
            itemOptions.setProperty("Format", rec.get('format'));
            itemOptions.setProperty("Map", rec.get('map'));
            itemOptions.setProperty("Groups", rec.get('groups'));

            // Ensure the persistence is an array!
            if(rec.get('persistence') != "") {
                var persistenceIn = [].concat(rec.get('persistence'));
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
            var groups = [].concat(rec.get('groups'));

            // Set the groups
            itemGroups.resetGroups();
            for(var cnt = 0; cnt < groups.length; cnt++)
                itemGroups.setGroup(groups[cnt]);

            var y = rec.get('groups');
            var x = rec.get('bindings');
            // Ensure the groups is an array!
            var bindings = [].concat(rec.get('bindings'));

            // Set the binding strings
            itemBindings.setBindings(bindings);
        }
    }
})
;