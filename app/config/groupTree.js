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


Ext.define('openHAB.config.groupTree', {
    extend: 'Ext.tree.Panel',
    layout: 'fit',
    icon: 'images/category-group.png',
    header: false,
    border: false,
    hideHeaders: true,
    columns: [
        {
            // The tree column
            xtype: 'treecolumn',
            text: 'Group',
            flex: 2,
            dataIndex: 'group',
            renderer: function (value, meta, record) {
                // Rendering of the item
                // This will use the values specified in the sitemap if set
                // Otherwise it will default to showing the default item configuration
                var label = value;
                var icon = record.get("groupicon");
                var item = record.get("group");
                var labelClass = "sitemap-label-set";

                if (icon != "")
                    icon = '<img src="../images/' + icon + '.png" align="left" height="16">';

                return icon  + label;
                return '<div>' + icon + '</div><div class="' + labelClass + '">' + label + '</div>';
            }
        }
    ],
    rootVisible: false,
    multiSelect: true,
    viewConfig: {
        stripeRows: true
    },

    initComponent: function () {
        var me = this;
        this.title = language.config_GroupsTitle;

        this.tbar = Ext.create('Ext.toolbar.Toolbar', {
            itemId: 'toolbar',
            items: [
                {
                    icon: 'images/cross.png',
                    itemId: 'cancel',
                    text: language.cancel,
                    cls: 'x-btn-icon',
                    disabled: true,
                    tooltip: language.config_ItemPropertiesCancelChangeTip,
                    handler: function () {
                        this.up('#itemPropertiesMain').revertItem();
                        me.toolbar.getComponent('cancel').disable();
                        me.toolbar.getComponent('save').disable();
                    }
                },
                {
                    icon: 'images/disk.png',
                    itemId: 'save',
                    text: language.save,
                    cls: 'x-btn-icon',
                    disabled: false,
                    tooltip: language.config_ItemPropertiesSaveChangeTip,
                    handler: function () {
                        this.up('#itemPropertiesMain').saveItem();
                        me.toolbar.getComponent('cancel').disable();
                        me.toolbar.getComponent('save').disable();
                    }
                }
            ]
        });
        this.toolbar = this.tbar;

        // Add the model for the group tree
        Ext.define('GroupTree', {
            extend: 'Ext.data.Model',
            fields: [
                {name: 'checked'},
                {name: 'group'},
                {name: 'groupicon'}
            ]
        });

        var groupTreeStore = Ext.create('Ext.data.TreeStore', {
            model: 'GroupTree',
            proxy: {
                type: 'memory'
            },
            folderSort: true
        });

        this.store = groupTreeStore;

        // Create the root item
        var groupRoot = [];
        groupRoot.label = "Root";
        groupRoot.children = [];

        // Create the tree
        iterateTree(groupRoot.children, "", 0);

        // Load the tree and expand all nodes
        var sitemapRootNode = groupTreeStore.setRootNode(groupRoot);
        this.expandAll();

        this.callParent();

        // -------------
        // Class members
        function iterateTree(parent, group, iterationCnt) {
            // Keep track of the number of iterations
            iterationCnt++;
            if (iterationCnt == 8)
                return;

            // Loop through the items
            var allRecords = itemConfigStore.queryBy(function(){return true;});
            allRecords.each(function(item) {
                // Is this a group
                if (item.get('type') != 'GroupItem')
                    return;

                // Ensure the groups is an array!
                var groups = [].concat(item.get('groups'));

                // Check if the item is in the required group
                if (groups.indexOf(group) == -1)
                    return;

                // Create the new group
                var newGroup = [];
                newGroup.checked = false;
                newGroup.id = item.get('name');
                newGroup.group = item.get('name');
                newGroup.iconx = '../images/'+item.get('icon')+'.png';
                newGroup.groupicon = item.get('icon');
                newGroup.children = [];

                // Check if this is a group
                iterateTree(newGroup.children, newGroup.group, iterationCnt);

                if (newGroup.children == null)
                    newGroup.leaf = true;
                else
                    newGroup.leaf = false;
                parent.push(newGroup);
            });
        }

        this.resetGroups = function () {
            this.getRootNode().cascadeBy(function (node) {
                if (node == null)
                    return;

                node.set('checked', false);
            });
        };

        this.setGroup = function (group) {
            var rec = groupTreeStore.getNodeById(group);
            if (rec == null)
                return;

            rec.set("checked", true);
        };

        this.getSelected = function () {
            var selList = [];

            this.getRootNode().cascadeBy(function (node) {
                if (node == null)
                    return;

                if (node.get('checked') == true)
                    selList.push(node.get('group'));
            });

            return selList;
        };
    },
    listeners: {
        checkchange: function( node, checked, eOpts ) {
            this.toolbar.getComponent('cancel').enable();
            this.toolbar.getComponent('save').enable();
        }
    }
})
;
