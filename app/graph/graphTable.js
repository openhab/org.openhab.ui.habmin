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

Ext.define('openHAB.graph.graphTable', {
    extend:'Ext.panel.Panel',
    layout:'fit',
    tabTip:'Show and edit graph data',
    id:'graphTableData',
    title:'Table',
    icon:'images/table-export.png',

    initComponent:function () {
        this.callParent();
    },
	updateData:function () {
		// Remove the current grid
		this.removeAll();

		// Retrieve the data from the graph object
		var data = Ext.getCmp("highchartsChart").rawData;
		if(data == null)
			return;
		if(data.length == 0)
			return;
		
		var columns = [];
		columns[0] = [];
		columns[0].text = 'Time';
		columns[0].dataIndex = 'time';
		
		var fields = [];
		fields[0] = [];
		fields[0].name = 'time';
		
		for(var c = 0; c < data.length;c++) {
			fields[c+1] = [];
			fields[c+1].name = data[c].item;
			columns[c+1] = [];
			columns[c+1].text = data[c].item;
			columns[c+1].dataIndex = data[c].item;
		}

		// Create a model
        Ext.define('GraphTableModel', {
            extend:'Ext.data.Model',
            fields:fields
        });

        var dataGrid = Ext.create('Ext.grid.Panel', {
            store:{model:'GraphTableModel', data:data[0].data},
            multiSelect:false,
            columns:columns
        });

		this.add(dataGrid);

	}
})
;
