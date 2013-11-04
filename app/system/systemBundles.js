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

Ext.define('openHAB.system.systemBundles', {
    extend:'Ext.panel.Panel',
    layout:'fit',
    tabTip:'OSGi Bundles',
    title:'Bundles',
    header:true,
    icon:'images/chain.png',

    initComponent:function () {
        Ext.define('BundlesModel', {
            extend:'Ext.data.Model',
            fields:[
                {name:'id'},
                {name:'name'},
                {name:'version'},
                {name:'state'},
                {name:'modified', type:'int'},
                {name:'link'}
            ]
        });

        // Create the Bundles data store
        var bundleStore = Ext.create('Ext.data.ArrayStore', {
            model:'BundlesModel',
            proxy:{
                type:'rest',
                url:HABminBaseURL + '/bundle',
                reader:{
                    type:'json',
                    root:'bundle'
                },
                headers:{'Accept':'application/json'},
                pageParam:undefined,
                startParam:undefined,
                sortParam:undefined,
                limitParam:undefined
            },
            autoLoad:true
        });

        var bindings = Ext.create('Ext.grid.Panel', {
            store:bundleStore,
            header:false,
            disableSelection:true,
            columns:[
                {
                    text:'ID',
                    hideable:false,
                    flex:1,
                    width:75,
                    sortable:true,
                    dataIndex:'id'
                },
                {
                    text:'Name',
                    hideable:false,
                    flex:3,
                    width:75,
                    sortable:true,
                    dataIndex:'name'
                },
                {
                    text:'Version',
                    hideable:false,
                    flex:1,
                    width:75,
                    sortable:true,
                    dataIndex:'version'
                },
                {
                    text:'Status',
                    hideable:false,
                    flex:1,
                    width:75,
                    sortable:true,
                    dataIndex:'state',
                    renderer:function (v) {
                        if(v == 1)
                            return "Uninstalled";
                        if(v == 2)
                            return "Installed";
                        if(v == 4)
                            return "Resolved";
                        if(v == 8)
                            return "Starting";
                        if(v == 16)
                            return "Stopping";
                        if(v == 32)
                            return "Active";
                        return "Unknown ("+v+")"
                    }
                }
            ],
            layout:'fit',
            viewConfig:{
                stripeRows:false,
                enableTextSelection:false,
                markDirty:false
            }
        });

        this.items = bindings;

        this.callParent();
    }
})
;