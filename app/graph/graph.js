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

Ext.define('openHAB.graph.graph', {
    extend:'Ext.panel.Panel',
    layout:'border',
    icon:'images/database-sql.png',
    id:'maintabGraph',
    tabTip:'Display chart page',
    title:'Persistence',
    cls:'empty',

    initComponent:function () {
        // Default to local time
        Highcharts.setOptions({global:{useUTC:false}});

        var itemList = Ext.create('openHAB.graph.itemList');

        var accordion = Ext.create('Ext.Panel', {
            split:true,
            border:true,
            region:'west',
            width:450,
            preventHeader:true,
            layout:{
                type:'accordion',
                hideCollapseTool:true
            },
            items:[itemList]
        });

        // If we're running on a mobile device, allow the lists to collapse
        if (Ext.is.Desktop == false)
            accordion.collapsed = true;

        var chartGraph = Ext.create('openHAB.graph.graphHighcharts');
        var chartTable = Ext.create('openHAB.graph.graphTable');

        var tabPanel = Ext.create('Ext.tab.Panel', {
            id:'tabPersistence',
            plain:false,
            region:'center',
            layout:'fit',
            tabPosition: 'bottom',
            items:[chartGraph, chartTable],
			listeners: {
				tabchange:function (tabPanel, newCard, oldCard, eOpts) {
					// Detect if we've changed to the table view
					if (newCard.id == 'graphTableData') {
						Ext.getCmp("graphTableData").updateData();
					}
				}
			}
			
        });

        this.items = [accordion, tabPanel];

        this.callParent();
    }
})
;
