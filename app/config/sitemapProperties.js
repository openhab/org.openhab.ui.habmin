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

Ext.define('openHAB.config.sitemapProperties', {
    extend:'Ext.panel.Panel',
    layout:'fit',
    tabTip:'Sitemap Properties',
    header:false,

    initComponent:function () {
        // Note that "itemicon" is used for the model to avoid upsetting the icon in the treeview
        // ExtJS uses the keyword "icon" to allow the user to set the icon in the tree!
        var widgetConfig = {
            Sitemap:["label"],
            Chart:["item", "label", "itemicon", "service", "period", "refresh"],
            Colorpicker:["item", "label", "itemicon", "sendFrequency"],
            Frame:["item", "label", "itemicon"],
            Group:["item", "label", "itemicon"],
            Image:["label", "itemicon", "url", "refresh"],
            List:["item", "label", "itemicon", "separator"],
            Switch:["item", "label", "itemicon", "command", "mappings"],
            Selection:["item", "label", "itemicon", "mappings"],
            Setpoint:["item", "label", "itemicon", "minValue", "maxValue", "step"],
            Slider:["item", "label", "itemicon", "sendFrequency", "switchSupport"],
            Text:["item", "label", "itemicon"],
            Video:["label", "url", "itemicon"],
            Webview:["label", "url", "height", "itemicon"]
        };

        var widgetItemTypes = {
            Sitemap:["ColorItem","ContactItem", "DateTimeItem", "DimmerItem", "GroupItem", "NumberItem", "RollershutterItem", "StringItem", "SwitchItem"],
            Chart:["ColorItem","ContactItem", "DateTimeItem", "DimmerItem", "GroupItem", "NumberItem", "RollershutterItem", "StringItem", "SwitchItem"],
            Colorpicker:["ColorItem","ContactItem", "DateTimeItem", "DimmerItem", "GroupItem", "NumberItem", "RollershutterItem", "StringItem", "SwitchItem"],
            Frame:["GroupItem", "StringItem"],
            Group:["GroupItem", "StringItem"],
            Image:["ColorItem","ContactItem", "DateTimeItem", "DimmerItem", "GroupItem", "NumberItem", "RollershutterItem", "StringItem", "SwitchItem"],
            List:["ColorItem","ContactItem", "DateTimeItem", "DimmerItem", "GroupItem", "NumberItem", "RollershutterItem", "StringItem", "SwitchItem"],
            Switch:["DimmerItem", "GroupItem", "NumberItem", "RollershutterItem", "StringItem", "SwitchItem"],
            Selection:["ColorItem","ContactItem", "DateTimeItem", "DimmerItem", "GroupItem", "NumberItem", "RollershutterItem", "StringItem", "SwitchItem"],
            Setpoint:["NumberItem"],
            Slider:["ColorItem","ContactItem", "DateTimeItem", "DimmerItem", "GroupItem", "NumberItem", "RollershutterItem", "StringItem", "SwitchItem"],
            Text:["ColorItem","ContactItem", "DateTimeItem", "DimmerItem", "GroupItem", "NumberItem", "RollershutterItem", "StringItem", "SwitchItem"],
            Video:["ColorItem","ContactItem", "DateTimeItem", "DimmerItem", "GroupItem", "NumberItem", "RollershutterItem", "StringItem", "SwitchItem"],
            Webview:["ColorItem","ContactItem", "DateTimeItem", "DimmerItem", "GroupItem", "NumberItem", "RollershutterItem", "StringItem", "SwitchItem"]
        };

        var widgetHelp = {
            command:"?",
            height:"Set the height of the widget in the UI",
            item:"Select the item attached to this widget",
            itemicon:"Override the item icon. Leave blank to use the default for this item",
            label:"Override the item label. Leave blank to use the default for this item",
            mappings:"Override the default map data. Leave blank to use the default for this item",
            maxValue:"Set the maximum allowable value",
            minValue:"Set the minimum allowable value",
            period:"?",
            refresh:"?",
            sendFrequency:"?",
            separator:"?",
            service:"?",
            step:"Set the step value",
            switchSupport:"?",
            url:"Set the URL attached to this widget"
        };

        var configTranslate = {
            itemicon:'icon',
            icon:'iconitem'
        };

        var sitemapName;

        var itemComboStore = Ext.create('Ext.data.ArrayStore', {
            model:'ItemConfigModel',
            proxy:{
                type:'rest',
                url:'/rest/config/items',
                reader:{
                    type:'json',
                    root:'item'
                },
                headers:{'Accept':'application/json'},
                pageParam:undefined,
                startParam:undefined,
                sortParam:undefined,
                limitParam:undefined
            },
            autoLoad:true
        });

        var configTree = [];
        var sourceConfig = {
            item:{
                displayName:"Item",
                renderer:function (v) {
                    var icon = "";
                    var id = itemComboStore.findExact("name", v);
                    if (id != -1) {
                        var type = itemComboStore.getAt(id).get('type');
                        if (type != "") {
                            id = itemTypeStore.findExact("name", type);
                            if (id != -1)
                                icon = '<img src="' + itemTypeStore.getAt(id).get('icon') + '" align="left" height="16">';
                        }
                    }

                    return '<div>' + icon + '</div><div style="margin-left:20px">' + v + '</div>';
                },
                editor:Ext.create('Ext.form.ComboBox', {
                    store:itemComboStore,
                    queryMode:'local',
                    typeAhead:false,
                    editable:false,
                    displayField:'name',
                    valueField:'name',
                    forceSelection:true,
                    editable:false,
                    allowBlank:false
                    /*,
                     listConfig:{
                     getInnerTpl:function () {
                     var icon = "";
                     var id = itemTypeStore.findExact("name");
                     if(id != -1) {
                     if(itemTypeStore.getAt(ref).get('icon') != "")
                     icon = '<img src="../images/'+itemTypeStore.getAt(ref).get('icon')+'.png" align="left" height="16">';
                     }

                     return '<div>' + icon + '</div><div style="margin-left:20px">' + v +'</div>';
                     }
                     }*/
                })
            },
            itemicon:{
                displayName:"Icon",
                renderer:function (v) {
                    if(v == "")
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
            label:{displayName:"Label"},
            mapping:{displayName:"Mapping"},
            maxValue:{displayName:"Maximum"},
            minValue:{displayName:"Minimum"},
            service:{displayName:"Service"},
            step:{displayName:"Step"},
            command:{displayName:"Command"},
            mappings:{displayName:"Mappings"},
            sendFrequency:{displayName:"Send Frequency"},
            switchSupport:{displayName:"Switch Support"},
            url:{displayName:"URL"},
            height:{displayName:"Height"},
            refresh:{displayName:"Refresh Period"}
        };


        // Sitemap model
        Ext.define('SitemapTree', {
            extend:'Ext.data.Model',
            fields:[
                {name:'id'},
                {name:'item'},
                {name:'label'},
                {name:'type'},
                {name:'itemicon'},
                {name:'maxValue'},
                {name:'minValue'},
                {name:'step'},
                {name:'mappings'},
                {name:'leaf'},
                {name:'sendFrequency'},
                {name:'switchSupport'},
                {name:'height'},
                {name:'refresh'},
                {name:'service'},
                {name:'period'},
                {name:'command'}
            ]
        });

        var sitemapItemStore = Ext.create('Ext.data.TreeStore', {
            model:'SitemapTree',
            proxy:{
                type:'memory'
            },
            folderSort:true
        });

        var propertySheet = Ext.create('Ext.grid.property.Grid', {
            title:'Properties',
            icon:'images/gear.png',
            region:'east',
            flex:1,
            hideHeaders:true,
            sortableColumns:false,
            split:true,
            tools:[
                {
                    type:'tick',
                    disabled:true,
                    tooltip:'Update data',
                    handler:function (event, toolEl, panel) {
                        // Save button pressed - update the sitemap tree with the updated properties
                        var node = sitemapTree.getSelectionModel().getSelection()[0];
                        if (node == null)
                            return;

                        var prop = propertySheet.getStore();
                        var properties = widgetConfig[node.get("type")];
                        if (properties != null) {
                            for (var pcnt = 0; pcnt < properties.length; pcnt++) {
                                node.set(properties[pcnt], getPropertyValue(prop, properties[pcnt]));
                            }
                        }

                        // Function to get a property value given the name
                        // Returns null if property not found
                        function getPropertyValue(prop, name) {
                            var index = prop.find('name', name);
                            if (index != -1)
                                return prop.getAt(index).get('value');
                            else
                                return null;
                        }
                    }
                },
                {
                    type:'cross',
                    disabled:true,
                    tooltip:'Delete this widget and its children',
                    handler:function (event, toolEl, panel) {
                        Ext.Msg.show({
                            title:"Confirm Delete",
                            msg:'Are you sure you want to delete the selected widget and all its children?',
                            buttons:Ext.Msg.YESNO,
                            config:{
                                obj:this,
                                name:sitemapName
                            },
                            fn:deleteWidget,
                            icon:Ext.MessageBox.QUESTION
                        });
                    }
                }
            ],
            viewConfig:{
                markDirty:true
            },
            listeners:{
                propertychange:function (source, recordId, value, oldValue, eOpts) {
                    propertySheet.getHeader().getTools()[0].enable();
                }/*,
                 itemmouseenter:function (grid, record, item, index, e, eOpts) {
                 var name = record.get("name");
                 helpStatusText.setText(widgetHelp[name]);
                 },
                 itemmouseleave:function (grid, record, item, index, e, eOpts) {
                 helpStatusText.setStatus({text: ""});
                 }*/
            }
        });

        var widgetsGrid = Ext.create('Ext.grid.Panel', {
            // TODO: Does this need to be 'id'?
            id:'sitemapWidgetGrid',
            store:widgetStore,
            icon:'images/document-node.png',
            header:true,
            hideHeaders:true,
            title:"Widgets",
            region:'center',
            flex:1,
            collapsible:false,
            useArrows:false,
            lines:true,
            rootVisible:false,
            multiSelect:false,
            viewConfig:{
                allowCopy:true,
                copy:true,
                plugins:{
                    ptype:'gridviewdragdrop',
                    dragGroup:'sitemapSitemapTree',
                    dropGroup:'sitemapSitemapTree',
                    enableDrag:true,
                    enableDrop:false
                }
            },
            columns:[
                {
                    text:'Widget',
                    flex:5,
                    dataIndex:'type',
                    renderer:function (v) {
                        var icon = "";
                        var ref = widgetStore.findExact("type", v);
                        if (ref != -1) {
                            if (widgetStore.getAt(ref).get('icon') != "")
                                icon = '<img src="' + widgetStore.getAt(ref).get('icon') + '" align="left" height="16">';
                        }

                        return '<div>' + icon + '</div><div style="margin-left:20px">' + v + '</div>';
                    }
                }
            ]
        });

        var sitemapTree = Ext.create('Ext.tree.Panel', {
            // TODO: Does this need to be 'id'
            id:'sitemapSitemapTree',
            store:sitemapItemStore,
            header:true,
            title:"Sitemap Configuration",
            region:'south',
            icon:'images/maps-stack.png',
            flex:2,
            collapsible:false,
            useArrows:false,
            lines:true,
            tools:[
                {
                    type:'disk',
                    tooltip:'Save sitemap',
                    handler:function (event, toolEl, panel) {
                        // Make sure we're loaded!
                        if (sitemapName == null)
                            return;

                        var root = sitemapTree.getRootNode();
                        var jsonArray = {};

                        jsonArray.name = sitemapName;
                        // Iterate through the store to generate the sitemap
                        jsonArray.widget = iterateStore(root, 0);

                        // Send the sitemap to openHAB
                        Ext.Ajax.request({
                            url:"/rest/config/sitemap/" + sitemapName,
                            headers:{'Accept':'application/json'},
                            method:'PUT',
                            jsonData:jsonArray,
                            success:function (response, opts) {
                                Ext.MessageBox.show({
                                    msg:'Sitemap configuration saved',
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
                                    msg:'Error saving sitemap',
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

                        function iterateStore(node, iterateCnt) {
                            iterateCnt++;
                            if (iterateCnt >= 9)
                                return;

                            // Valid widget?
                            var properties = widgetConfig[node.get("type")];
                            if (properties == null)
                                return;

                            // Get the widget properties
                            var newNode = {};
                            newNode.type = node.get('type');
                            for (var pcnt = 0; pcnt < properties.length; pcnt++) {
                                var property = properties[pcnt];
                                if (configTranslate[properties[pcnt]] != null)
                                    property = configTranslate[properties[pcnt]];
                                newNode[property] = node.get(properties[pcnt]);
                            }

                            // Check for children
                            if (node.hasChildNodes()) {
                                newNode.widget = [];
                                for (var cnt = 0; cnt < 1000; cnt++) {
                                    var child = node.getChildAt(cnt);
                                    if (child == null)
                                        break;

                                    newNode.widget.push(iterateStore(child, iterateCnt));
                                }
                            }
                            return newNode;
                        }
                    }
                }
            ],
            rootVisible:true,
            multiSelect:false,
            viewConfig:{
                stripeRows:true,
                plugins:{
                    ptype:'treeviewdragdrop',
                    dropGroup:'sitemapSitemapTree',
                    dragGroup:'sitemapSitemapTree',
                    enableDrag:true,
                    enableDrop:true
                },
                listeners:{
                    beforedrop:function (node, data, overModel, dropPosition, dropFunction, eOpts) {
//                        var dropOn = dropRec ? ' ' + dropPosition + ' ' + dropRec.get('name') : ' on empty view';
//                        Ext.example.msg('Drag from right to left', 'Dropped ' + data.records[0].get('name') + dropOn);
//                        return 0;
                    },
                    drop:function (node, data, dropRec, dropPosition) {
                        // Set default data
                        // Most of this is done automatically based on store names
                        var record = data.records[0];
                        record.set('icon', '');
                    },
                    nodedragover:function (targetNode, position, dragData, e, eOpts) {
                        // Make sure we can only append to groups and frames
                        if (position == "append") {
                            if (targetNode.get('type') == 'Group' | targetNode.get('type') == 'Frame' | targetNode.get('type') == 'Sitemap')
                                return true;
                            return false
                        }
                    }
                }
            },
            columns:[
                {
                    // The tree column
                    xtype:'treecolumn',
                    text:'Widget',
                    flex:2,
                    dataIndex:'type'
                },
                {
                    text:'Item',
                    flex:2,
                    dataIndex:'item'
                },
                {
                    text:'Label',
                    flex:3,
                    dataIndex:'label',
                    renderer:function (value, meta, record) {
                        // Rendering of the item
                        // This will use the values specified in the sitemap if set
                        // Otherwise it will default to showing the default item configuration
                        var label = value;
                        var icon = record.get("itemicon");
                        var item = record.get("item");
                        var ref = itemConfigStore.findExact("name", item);
                        var labelClass = "sitemap-label-set";

                        if (ref != -1) {
                            if (label == "") {
                                label = itemConfigStore.getAt(ref).get('label');
                                labelClass = "sitemap-label-default";
                            }

                            if (icon == "") {
                                icon = itemConfigStore.getAt(ref).get('icon');
//                                labelClass = "sitemap-label-default";
                            }
                        }
                        if (icon != "")
                            icon = '<img src="../images/' + icon + '.png" align="left" height="16">';

                        return '<div>' + icon + '</div><div class="' + labelClass + '">' + label + '</div>';
                    }
                }
            ],
            listeners:{
                itemclick:function (grid, record, item, index, element, eOpts) {
                    // ToDo: We really should check if the properties are dirty and warn the user before setting the new values
                    showWidgetProperties(record);
                }
            }
        });

        var helpStatusText = Ext.create('Ext.toolbar.TextItem', {text:''});
        var statusBar = Ext.create('Ext.ux.StatusBar', {text:'Sitemap:', items:[helpStatusText]});

        var sitemapDesign = Ext.create('Ext.panel.Panel', {
            itemId:'sitemapPanel',
            title:'Properties',
            bbar:statusBar,
            icon:'images/maps-stack.png',
            defaults:{
                split:true
            },
            border:false,
            layout:'border',
            items:[widgetsGrid, sitemapTree, propertySheet]
        });

        var tabs = Ext.create('Ext.tab.Panel', {
            layout:'fit',
            border:false,
            items:[sitemapDesign]
        });

        this.items = tabs;

        this.callParent();

        this.setItem = function (newSitemap) {
            Ext.Ajax.request({
                url:"/rest/config/sitemap/" + newSitemap,
                headers:{'Accept':'application/json'},
                method:'GET',
                success:function (response, opts) {
                    var json = Ext.decode(response.responseText);
                    // If there's no config for this sitemap, records will be null
                    if (json == null)
                        return;

                    sitemapName = newSitemap;
                    statusBar.setStatus({text:"Sitemap: " + newSitemap});

                    // Create the root item
                    var sitemapRoot = [];
                    sitemapRoot.label = json.label;
                    sitemapRoot.iconCls = "sitemap-sitemap";
                    sitemapRoot.type = "Sitemap";
                    sitemapRoot.children = [];

                    iterateTree(sitemapRoot.children, json.widget, 0);

                    // Load the tree and expand all nodes
                    sitemapItemStore.setRootNode(sitemapRoot);
                    sitemapTree.expandAll();

                    function iterateTree(parent, tree, iterationCnt) {
                        if (tree == null)
                            return;

                        // Keep track of the number of iterations
                        iterationCnt++;
                        if (iterationCnt == 8)
                            return;

                        // Loop through the configuration
                        var numWidgets = tree.length;
                        for (var iItem = 0; iItem < numWidgets; ++iItem) {
                            var newItem = [];

                            // Create the new item
                            // Allows translation of local and remote naming
                            var properties = widgetConfig[tree[iItem].type];
                            if (properties != null) {
                                newItem.type = tree[iItem].type;
                                for (var pcnt = 0; pcnt < properties.length; pcnt++) {
                                    var property = properties[pcnt];
                                    if (configTranslate[properties[pcnt]] != null)
                                        property = configTranslate[properties[pcnt]];
                                    newItem[properties[pcnt]] = tree[iItem][property];
                                }
                            }

                            var widget = widgetStore.findExact('type', newItem.type);
                            if (widget != -1)
                                newItem.iconCls = widgetStore.getAt(widget).get("iconCls");

                            // Check if this is a group
                            if (tree[iItem].type == "Group") {
                                newItem.children = [];
                                if (tree[iItem].widget != null)
                                    iterateTree(newItem.children, tree[iItem].widget, iterationCnt);
                            }
                            if (tree[iItem].type == "Frame") {
                                newItem.children = [];
                                if (tree[iItem].widget != null)
                                    iterateTree(newItem.children, tree[iItem].widget, iterationCnt);
                            }

                            if (newItem.children == null)
                                newItem.leaf = true;
                            else
                                newItem.leaf = false;
                            parent.push(newItem);
                        }
                    }
                }
            });
        }

        // Delete the currently selected widget
        function deleteWidget(button, text, options) {
            if (button !== 'yes')
                return;

            // Delete button pressed - update the sitemap tree
            var node = sitemapTree.getSelectionModel().getSelection()[0];
            if (node == null)
                return;

            node.parentNode.removeChild(node);
        }

        function showWidgetProperties(widget) {
            var source = [];
            var properties = widgetConfig[widget.get("type")];
            // Valid widget?
            if (properties == null)
                return;

            // Create the properties grid
            for (var cnt = 0; cnt < properties.length; cnt++) {
                source[properties[cnt]] = widget.get(properties[cnt]);
            }

            propertySheet.setSource(source, sourceConfig);
            propertySheet.getHeader().getTools()[0].disable();

            itemComboStore.filterBy(function myfilter(record) {
                var t = widget.get("type");
                var x = widgetItemTypes[widget.get("type")];
                var a = record.get("type");

                if (widgetItemTypes[widget.get("type")].indexOf(record.get("type")) == -1)
                    return false;
                return true;
            });

            // Enable delete button
            propertySheet.getHeader().getTools()[1].enable();
        }
    }
})
;
