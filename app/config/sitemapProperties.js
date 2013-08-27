/**
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
    id:'sitemapProperties',
    tabTip:'Sitemap Properties',
    header:false,

    initComponent:function () {
        var configTree = [];

        makeItemGroupTree(configTree, "All");

        // We want to setup a model and store instead of using dataUrl
        Ext.define('ItemTree', {
            extend:'Ext.data.Model',
            fields:[
                {name:'Parent', type:'string'},
                {name:'State', type:'string'},
                {name:'Type', type:'string'}
            ]
        });

        var sitemapItemStore = Ext.create('Ext.data.TreeStore', {
            model:'ItemTree',
            proxy:{
                type:'memory'
            },
            folderSort:true
        });

        var rootHere = [];
        rootHere.text = "ROOT!!!";
        rootHere.children = configTree;
        var configRootNode = sitemapItemStore.setRootNode(rootHere);

        var itemsTree = Ext.create('Ext.tree.Panel', {
            id:'sitemapItemTree',
            store:sitemapItemStore,
            header:true,
            title:"Items",
            split:true,
            flex:1,
            collapsible:false,
            useArrows:false,
            lines:true,
            rootVisible:false,
            multiSelect:false,
            viewConfig:{
                allowCopy: true,
                copy: true,
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
                    xtype:'treecolumn', //this is so we know which column will show the tree
                    text:'Item',
                    flex:5,
                    dataIndex:'Parent'
                },
                {
                    text:'Type',
                    flex:2,
                    dataIndex:'type'
                }
            ]
        });

        var sitemapTree = Ext.create('Ext.tree.Panel', {
            id:'sitemapSitemapTree',
//            store:sitemapItemStore,
            header:true,
            title:"Sitemap Configuration",
            split:true,
            flex:3,
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
                    dataIndex:'Parent'
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
            id:'sitemapPanel',
            icon:'images/maps-stack.png',
            xtype:'panel',
//                tbar:highchartsToolbar,
            maintainFlex:true,
            border:false,
            layout:'fit',
            layout:{
                type:'hbox',
                align:'stretch'
                //,                padding: 5
            },
            items:[itemsTree, sitemapTree]
        });

        var tabs = Ext.create('Ext.tab.Panel', {
            layout:'fit',
            border:false,
            id:'tabsSitemapProperties',
            items:[sitemapDesign]
        });

        this.items = tabs;

        this.callParent();
    }
})
;