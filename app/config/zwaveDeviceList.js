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


Ext.define('openHAB.config.zwaveDeviceList', {
    extend:'Ext.panel.Panel',
    icon:'images/application-list.png',
    title: 'ZWave Devices',
    defaults:{
        split:true
    },
    border:false,
    layout:'border',

    initComponent:function () {

        var list = Ext.create('Ext.grid.Panel', {
            store:store,
            region:"center",
            flex:1,
            header:false,
            split:true,
            tbar:toolbar,
            collapsible:false,
            multiSelect:false,
            columns:[
                {
                    text:'Node',
                    flex:1,
                    dataIndex:'node'
                }
            ],
            listeners:{
                select:function (grid, record, index, eOpts) {
                    if (record == null)
                        return;

                    // Get the node ID
                    var nodeName;


                    // Request the node information
                    // Load the item data
                    Ext.Ajax.request({
                        url:'/rest/binding/items/' + nodeName,
                        timeout:5000,
                        method:'GET',
                        headers:{'Accept':'application/json'},
                        success:function (response, opts) {
                            var json = Ext.decode(response.responseText);
                            // If there's no config for this binding, records will be null
                            if (json == null)
                                return;

                            var source = [];
                            var sourceConfig = [];

                            for(var cnt = 0; cnt < json.length; cnt++) {
                                var name = json[cnt].name;
                                source[name] = json[cnt].value;

                                sourceConfig[name] = {};
                                sourceConfig[name].displayName = json[cnt].label;

                                // Process the type
                                if(json[cnt].type == "LIST") {
                                }
                            }

                            properties.setSource(source, sourceConfig);
                        }
                    });
                }
            }
        });

        var properties = Ext.create('Ext.grid.property.Grid', {
            title:'Properties',
            region:"south",
            flex:1,
            icon:'images/gear.png',
            hideHeaders:true,
            sortableColumns:false,
            nameColumnWidth:300,
            split:true,
            viewConfig:{
                markDirty:true
            },
            tools:[
                {
                    type:'tick',
                    tooltip:'Update data',
                    handler:function (event, toolEl, panel) {
                        // Save button pressed - update the sitemap tree with the updated properties
                        var record = list.getSelectionModel().getSelection()[0];
                        if (record == null)
                            return;

                        // Create the bean to return to openHAB

                        // Send the data
                        Ext.Ajax.request({
                            url:'/rest/binding/items/' + nodeName,
                            timeout:5000,
                            method:'PUT',
                            headers:{'Accept':'application/json'},
                            success:function (response, opts) {
                            }
                        });

                    }
                }
            ],
            listeners:{
                propertychange:function (source, recordId, value, oldValue, eOpts) {
                },
                beforeedit : function(editor, e) {
                }
            }
        });

        this.items = [list, properties];
        this.callParent();
    }
})
;