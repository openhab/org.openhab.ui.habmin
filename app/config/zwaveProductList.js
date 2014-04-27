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


Ext.define('openHAB.config.zwaveProductList', {
    extend: 'Ext.panel.Panel',
    icon: 'images/application-list.png',
    title: language.zwave_ProductExplorer,
    border: false,
    layout: 'fit',

    initComponent: function () {
        Ext.define('ZWaveConfigModel', {
            extend: 'Ext.data.Model',
            fields: [
                {name: 'domain', type: 'string'},
                {name: 'name', type: 'string'},
                {name: 'label', type: 'string'},
                {name: 'optional', type: 'boolean'},
                {name: 'readonly', type: 'boolean'},
                {name: 'type', type: 'string'},
                {name: 'value', type: 'string'},
                {name: 'minimum', type: 'integer'},
                {name: 'maximum', type: 'integer'},
                {name: 'state', type: 'string'},
                {name: 'description', type: 'string'},
                {name: 'valuelist'},
                {name: 'actionlist'}
            ]
        });

        var list = Ext.create('Ext.tree.Panel', {
            store: {
                extend: 'Ext.data.TreeStore',
                model: 'ZWaveConfigModel',
                clearOnLoad: true,
                clearRemovedOnLoad: true,
                proxy: {
                    type: 'rest',
                    url: HABminBaseURL + '/zwave',
                    reader: {
//                        type:'rest',
                        root: 'records'
                    },
                    headers: {'Accept': 'application/json'},
                    pageParam: undefined,
                    startParam: undefined,
                    sortParam: undefined,
                    limitParam: undefined
                },
                nodeParam: "domain",
                root: {
                    text: 'products',
                    id: 'products/',
                    expanded: true
                },
                listeners: {
                    load: function (tree, node, records) {
                        node.eachChild(function (childNode) {
                            var domain = childNode.get('domain');
                            childNode.set('id', domain);

                            // Set the icons and leaf attributes for the tree
                            if (domain.indexOf('/', domain.length - 1) == -1) {
                                childNode.set('leaf', true);

                                if (childNode.get('readonly') == true)
                                    childNode.set('iconCls', 'x-config-icon-readonly');
                                else
                                    childNode.set('iconCls', 'x-config-icon-editable');
                            }
                            else {
                                childNode.set('iconCls', 'x-config-icon-domain');
                                childNode.set('leaf', false);
                            }
                        });
                    }
                }
            },
            header: false,
            split: true,
            collapsible: false,
            multiSelect: false,
            singleExpand: true,
            rootVisible: false,
            columns: [
                {
                    text: 'Node',
                    xtype: 'treecolumn',
                    flex: 1,
                    dataIndex: 'label',
                    renderer: function (value, meta, record) {
                        // If a description is provided, then display this as a tooltip
                        var description = record.get("description");
                        if (description != "") {
                            description = Ext.String.htmlEncode(description);
                            meta.tdAttr = 'data-qtip="' + description + '"';
                        }

                        // Add a small status image to show the state of this record
                        var img = "";
                        switch (record.get('state')) {
                            case 'OK':
                                meta.tdCls = 'grid-ok';
                                break;
                            case 'WARNING':
                                meta.tdCls = 'grid-warning';
                                break;
                            case 'ERROR':
                                meta.tdCls = 'grid-error';
                                break;
                            case 'INITIALIZING':
                                meta.tdCls = 'grid-initializing';
                                break;
                        }

                        return value;
                    }
                },
                {
                    text: 'Value',
                    flex: 1,
                    dataIndex: 'value',
                    renderer: function (value, meta, record) {
                        if (value == "")
                            return "";

                        // If this is a list, then we want to display the value, not the number!
                        var type = record.get('type');
                        if (type != "LIST")
                            return value;

                        var list = record.get('valuelist');
                        if (list == null || list.entry == null)
                            return value;

                        for (var cnt = 0; cnt < list.entry.length; cnt++) {
                            if (value == list.entry[cnt].key)
                                return list.entry[cnt].value;
                        }
                    }
                }
            ]
        });

        this.items = [list];
        this.callParent();
    }
})
;