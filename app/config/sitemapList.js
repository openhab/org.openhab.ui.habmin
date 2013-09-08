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

Ext.define('openHAB.config.sitemapList', {
    extend:'Ext.panel.Panel',
    layout:'fit',
    tabTip:'Sitemap list',
    title:'Sitemaps',
    icon:'images/maps-stack.png',

    initComponent:function () {
        var toolbar = Ext.create('Ext.toolbar.Toolbar', {
            items:[
                {
                    icon:'images/minus-button.png',
                    itemId:'delete',
                    text:'Delete Sitemap',
                    cls:'x-btn-icon',
                    disabled:true,
                    tooltip:'Delete the sitemap from openHAB',
                    handler:function () {
                        toolbar.getComponent('delete').disable();
                    }
                },
                {
                    icon:'images/plus-button.png',
                    itemId:'add',
                    text:'Add New Sitemap',
                    cls:'x-btn-icon',
                    disabled:false,
                    tooltip:'Add a new sitemap to openHAB',
                    handler:function () {
                        // Pop up a dialogue box asking for the sitemap name
                        Ext.MessageBox.prompt('Sitemap Name', 'Please enter the new sitemap name:', function (btn, text) {
                            if (btn == 'ok') {
                                if(text.indexOf('.') != -1) {
                                    Ext.MessageBox("Error", "Sitemap name can only contain alphanumeric characters.");
                                }

                                // Create a new itemProperties
                                var newProperties = Ext.create('openHAB.config.sitemapProperties');
                                newProperties.setItem(text);

                                Ext.getCmp('configPropertyContainer').setNewProperty(newProperties);

                                // Add to the store so it appears in the list


                                // Allow this sitemap to be deleted!
                                toolbar.getComponent('delete').enable();
                            }
                        });
                    }
                }
            ]
        });

        var sitemapList = Ext.create('Ext.grid.Panel', {
            store:sitemapStore,
            header:false,
            tbar:toolbar,
            columns:[
                {
                    text:'Sitemap Name',
                    hideable:false,
                    flex:1,
                    width:75,
                    sortable:true,
                    dataIndex:'name'
                }
            ],
            layout:'fit',
            viewConfig:{
                stripeRows:false,
                enableTextSelection:false,
                markDirty:false
            },
            listeners:{
                select:function (grid, record, index, eOpts) {
                    if (record == null)
                        return;

                    // Create a new itemProperties
                    var newProperties = Ext.create('openHAB.config.sitemapProperties');
                    var newName = record.get('name');
                    newProperties.setItem(newName);

                    Ext.getCmp('configPropertyContainer').setNewProperty(newProperties);

                    // Allow this sitemap to be deleted
                    toolbar.getComponent('delete').enable();
                }
            }
        });

        this.items = sitemapList;

        this.callParent();
    }
})
;