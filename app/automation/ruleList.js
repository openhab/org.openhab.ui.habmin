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


Ext.define('openHAB.automation.ruleList', {
    extend:'Ext.panel.Panel',
    layout:'fit',
    icon:'images/application-list.png',
    title: 'Rules',

    initComponent:function () {

        var ruleList = Ext.create('Ext.grid.Panel', {
            store:ruleStore,
            header:false,
            split:true,
//            tbar:toolbar,
            collapsible:false,
            multiSelect:false,
            columns:[
                {
                    text:'Item',
                    flex:3,
                    dataIndex:'item'
                    /*,
                    renderer:function (value, metadata, record) {
                        var icon = "";
                        var ref = itemConfigStore.findExact("name", value);
                        if (ref != -1) {
                            if (itemConfigStore.getAt(ref).get('icon') != "")
                                icon = '<img src="../images/' + itemConfigStore.getAt(ref).get('icon') + '.png" align="left" height="16">';
                        }

                        return '<div>' + icon + '</div><div style="margin-left:20px">' + value + '</div>';
                    }*/
                },
                {
                    text:'Rule',
                    flex:4,
                    dataIndex:'label'
                    /*,
                    renderer:function (value, metadata, record, row, col, store, gridView) {
                        var img = '';
                        if (record.get("persistence") != null) {
                            var services = record.get("persistence");
                            if (services != "")
                                img = '<img src="images/database-small.png">';
                        }

                        return '<span>' + value + '</span><span style="float:right">' + img + '</span>';
                    }*/
                }
            ],
            listeners:{
                select:function (grid, record, index, eOpts) {
                }
            }
        });

        this.items = ruleList;

        this.callParent();
    }
})
;