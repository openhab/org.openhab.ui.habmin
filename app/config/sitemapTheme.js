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


Ext.define('openHAB.config.sitemapTheme', {
    extend:'Ext.panel.Panel',
    title:'Theme',
    icon:'images/palette-paint-brush.png',
    layout:'fit',
    header:false,

    initComponent:function () {
        var toolbar = Ext.create('Ext.toolbar.Toolbar', {
            items:[
                {
                    icon:'images/minus-button.png',
                    itemId:'delete',
                    text:'Delete Item',
                    cls:'x-btn-icon',
                    disabled:true,
                    tooltip:'Delete the theme',
                    handler:function () {
                    }
                },
                {
                    icon:'images/plus-button.png',
                    itemId:'add',
                    text:'Add New Item',
                    cls:'x-btn-icon',
                    disabled:false,
                    tooltip:'Add a new theme',
                    handler:function () {
                    }
                },
                {
                    icon:'images/ui-accordion.png',
                    itemId:'expand',
                    text:'Expand List',
                    cls:'x-btn-icon',
                    disabled:false,
                    tooltip:'Expand all themes in the list',
                    handler:function () {
                    }
                }
            ]
        });

        var themeList = Ext.create('Ext.grid.Panel', {
//            store:ruleLibraryStore,
            header:false,
            split:true,
            requires: [
                'Ext.grid.feature.Grouping'
            ],
            features: [{
                ftype: 'grouping',
                groupHeaderTpl: '{columnName}: {name} ({rows.length} Item{[values.rows.length > 1 ? "s" : ""]})',
                hideGroupedHeader: true,
                startCollapsed: true,
                id: 'themeGrouping'
            }],
            tbar:toolbar,
            collapsible:false,
            multiSelect:false,
            columns:[
                {
                    text:'Theme',
                    flex:4,
                    hidden: true,
                    dataIndex:'label'
                },
                {
                    text:'Condition',
                    flex:4,
                    dataIndex:'state'
                },
                {
                    text:'Icon',
                    flex:1,
                    dataIndex:'icon'
                },
                {
                    text:'Icon Color',
                    flex:1,
                    dataIndex:'iconcolor'
                },
                {
                    text:'Label Color',
                    flex:1,
                    dataIndex:'labelcolor'
                },
                {
                    text:'Value Color',
                    flex:1,
                    dataIndex:'valuecolor'
                }
            ],
            listeners:{
                select:function (grid, record, index, eOpts) {
                }
            }
        });

        this.items = themeList;


        this.callParent();

    }
})
;
