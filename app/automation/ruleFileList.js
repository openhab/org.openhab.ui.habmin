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


Ext.define('openHAB.automation.ruleFileList', {
    extend: 'Ext.panel.Panel',
    layout: 'fit',
    icon: 'images/application-list.png',
    title: 'Rule Models',

    initComponent: function () {

        // Define the Rule Template Store
        Ext.define('RuleModelModel', {
            extend: 'Ext.data.Model',
            fields: [
                {name: 'model'},
                {name: 'rule'}
            ]
        });

        var ruleModelStore = Ext.create('Ext.data.ArrayStore', {
            model: 'RuleModelModel'
        });

        // Load the rule list from openHAB
        Ext.Ajax.request({
            url: HABminBaseURL + "/config/rules/model/list",
            headers: {'Accept': 'application/json'},
            method: 'GET',
            success: function (response, opts) {
                var json = Ext.decode(response.responseText);
                // If there's no config for this sitemap, records will be null
                if (json == null)
                    return;

                var models = [].concat(json.rule);
                for (var cnt = 0; cnt < models.length; cnt++) {
                    var rules = models[cnt].rules;
                    for (var elcnt = 0; elcnt < rules.length; elcnt++) {
                        var element = {};
                        element.model = models[cnt].model;
                        element.rule = rules[elcnt].name;

                        ruleModelStore.add(element);
                    }
                }
            }
        });

        var ruleList = Ext.create('Ext.grid.Panel', {
            store: ruleModelStore,
            header: false,
            split: true,
//            tbar:toolbar,
            collapsible: false,
            multiSelect: false,
            columns: [
                {
                    text: 'Model',
                    flex: 1,
                    dataIndex: 'model'
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
                    text: 'Rule',
                    flex: 3,
                    dataIndex: 'rule'
                }
            ],
            listeners: {
                select: function (grid, record, index, eOpts) {
                    if (record == null)
                        return;

                    // Create a new ruleEditor
                    var newProperties = Ext.create('openHAB.automation.ruleEditor', {
                        modelName: record.get('model'),
                        ruleName: record.get('rule')
                    });

                    if (newProperties != null)
                        Ext.getCmp('automationPropertyContainer').setNewProperty(newProperties);

                    // Update the toolbar
//                    toolbar.getComponent('delete').enable();
                }
            }
        });

        this.items = ruleList;

        this.callParent();
    }
})
;