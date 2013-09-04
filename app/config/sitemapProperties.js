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
        var configTree = [];

        // We want to setup a model and store instead of using dataUrl
        Ext.define('SitemapTree', {
            extend:'Ext.data.Model',
            fields:[
                {name:'item'},
                {name:'type'},
                {name:'description'},
                {name:'icon'}
            ]
        });

        var sitemapItemStore = Ext.create('Ext.data.TreeStore', {
            model:'SitemapTree',
            proxy:{
                type:'memory'
            },
            folderSort:true
        });

        var propertyContainer = Ext.create('Ext.panel.Panel', {
            region:'east',
//            id:'configPropertyContainer',
            flex:1,
            collapsible:false,
            header:false,
            border:false,
            layout:'fit'
        });

        var itemsTree = Ext.create('Ext.grid.Panel', {
            // TODO: Does this need to be 'id'?
            id:'sitemapItemTree',
            store:itemConfigStore,
            header:true,
            title:"Items",
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
                    dragGroup:'sitemapItemTree',
                    dropGroup:'sitemapSitemapTree',
                    enableDrag:true,
                    enableDrop:false
                }
            },
            columns:[
                {
                    text:'Item',
                    flex:5,
                    dataIndex:'name'
                },
                {
                    text:'Type',
                    flex:2,
                    dataIndex:'type'
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
            flex:4,
            collapsible:false,
            useArrows:false,
            lines:true,
            rootVisible:false,
            multiSelect:false,
            viewConfig:{
                plugins:{
                    ptype:'gridviewdragdrop',
                    dragGroup:'sitemapSitemapTree',
                    dropGroup:'sitemapItemTree',
                    enableDrag:false,
                    enableDrop:true
                },
                listeners:{
                    beforedrop:function (node, data, overModel, dropPosition, dropFunction, eOpts) {
//                        var dropOn = dropRec ? ' ' + dropPosition + ' ' + dropRec.get('name') : ' on empty view';
//                        Ext.example.msg('Drag from right to left', 'Dropped ' + data.records[0].get('name') + dropOn);
//                        return 0;
                    },
                    drop:function (node, data, dropRec, dropPosition) {
                        var dropOn = dropRec ? ' ' + dropPosition + ' ' + dropRec.get('name') : ' on empty view';
//                        Ext.example.msg('Drag from right to left', 'Dropped ' + data.records[0].get('name') + dropOn);
                    }
                }

            },
            columns:[
                {
                    xtype:'treecolumn', //this is so we know which column will show the tree
                    text:'Item',
                    flex:5,
                    dataIndex:'item'
                },
                {
                    text:'Type',
                    flex:2,
                    dataIndex:'type'
                }
            ]
        });

        var sitemapDesign = Ext.create('Ext.panel.Panel', {
            itemId:'sitemapPanel',
            title:'Properties',
            icon:'images/maps-stack.png',
            defaults:{
                split:true//,
//                bodyStyle: 'padding:15px'
            },
            border:false,
            layout:'border',
            items:[itemsTree, sitemapTree, propertyContainer]
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
                success:function (response, opts) {
                    var json = Ext.decode(response.responseText);
                    // If there's no config for this sitemap, records will be null
                    if (json == null)
                        return;

                    var sitemapRoot = [];
                    sitemapRoot.children = [];
                    sitemapRoot.text = "Sitemap";
                    iterateTree(sitemapRoot.children, json.homepage.widget, 0);

                    var sitemapRootNode = sitemapItemStore.setRootNode(sitemapRoot);

                    function iterateTree(parent, tree, iterationCnt) {
                        // Keep track of the number of iterations
                        iterationCnt++;
                        if (iterationCnt == 8)
                            return;

                        // Loop through the configuration
                        var numWidgets = tree.length;
                        for (var iItem = 0; iItem < numWidgets; ++iItem) {
                            var newItem = [];
                            var newItemPnt;

                            // Create the new item
                            newItem.item = tree[iItem].item;
                            newItem.type = tree[iItem].type;
//                                newItem.Type = openHABItems.item[iItem].type;
                            newItem.iconCls = 'node-device';
                            newItem.children = [];

                            // Check if this is a group
                            if (tree[iItem].type == "Group") {
                                newItem.item = tree[iItem].label;
                                iterateTree(newItem.children, tree[iItem].linkedPage.widget, iterationCnt);
                            }
                            if (tree[iItem].type == "Frame") {
                                newItem.item = tree[iItem].label;
                                iterateTree(newItem.children, tree[iItem].widget, iterationCnt);
                            }

                            parent.push(newItem);
                        }

                    }

                }
            });
        }
    }
})
;