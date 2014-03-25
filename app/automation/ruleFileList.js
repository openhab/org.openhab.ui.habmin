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


Ext.define('openHAB.automation.ruleFileList', {
    extend: 'Ext.panel.Panel',
    layout: 'fit',
    icon: 'images/document-copy.png',

    initComponent: function () {
        this.title = language.rule_FileListTitle;

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

        var toolbar = Ext.create('Ext.toolbar.Toolbar', {
            items: [
                {
                    icon: 'images/plus-button.png',
                    itemId: 'add',
                    text: language.add,
                    cls: 'x-btn-icon',
                    disabled: false,
                    tooltip: language.rule_FileListAddTip,
                    handler: function () {
                        Ext.define('RuleModelsModel', {
                            extend: 'Ext.data.Model',
                            fields: [
                                {name: 'name'},
                                {name: 'icon'},
                                {name: 'iconCls'}
                            ]
                        });

                        // Generate a list of all existing models
                        // User can type their own, but this gives them options.
                        var models = [];
                        var ocnt = 0;
                        for (var cnt = 0; cnt < ruleModelStore.getCount(); cnt++) {
                            var found = false;
                            var name = ruleModelStore.getAt(cnt).get("model");
                            for (var mcnt = 0; mcnt < models.length; mcnt++) {
                                if (models[mcnt].name == name) {
                                    found = true;
                                    break;
                                }
                            }
                            if (found === false) {
                                models[ocnt] = {};
                                models[ocnt].name = name;
                                ocnt++;
                            }
                        }

                        var form = Ext.widget('form', {
                            layout: {
                                type: 'vbox',
                                align: 'stretch'
                            },
                            border: false,
                            bodyPadding: 10,
                            fieldDefaults: {
                                labelAlign: 'top',
                                labelWidth: 100,
                                labelStyle: 'font-weight:bold'
                            },
                            defaults: {
                                margins: '0 0 10 0'
                            },
                            items: [
                                {
                                    margin: '0 0 0 0',
                                    xtype: 'combobox',
                                    fieldLabel: 'Model name:',
                                    itemId: 'model',
                                    name: 'model',
                                    store: {model: 'RuleModelsModel', data: models},
                                    allowBlank: false,
                                    valueField: 'name',
                                    displayField: 'name',
                                    queryMode: 'local',
                                    forceSelection: false,
                                    editable: true,
                                    typeAhead: true
                                }
                            ],
                            buttons: [
                                {
                                    text: language.cancel,
                                    handler: function () {
                                        this.up('window').destroy();
                                    }
                                },
                                {
                                    text: language.rule_FileListCreateButton,
                                    handler: function () {
                                        if (this.up('form').getForm().isValid()) {
                                            // Read the model name
                                            var model = form.getForm().findField('model').getSubmitValue();

                                            var newProperties = null;

                                            // Create a new ruleEditor
                                            var newProperties = Ext.create('openHAB.automation.ruleEditor', {
                                                modelName: model
                                            });

                                            if (newProperties != null)
                                                Ext.getCmp('automationPropertyContainer').setNewProperty(newProperties);

                                            this.up('window').destroy();
                                        }
                                    }
                                }
                            ]
                        });

                        var createWin = Ext.widget('window', {
                            title: language.rule_FileListCreateButton,
                            closeAction: 'destroy',
                            width: 225,
                            resizable: false,
                            draggable: false,
                            modal: true,
                            layout: {
                                type: 'vbox',
                                align: 'stretch'
                            },
                            items: [form]
                        });

                        createWin.show();
                    }
                },
                {
                    xtype: 'tbfill'
                },
                {
                    icon: 'images/arrow-circle-315.png',
                    itemId: 'refresh',
                    cls: 'x-btn-icon',
                    disabled: false,
                    tooltip: language.refresh,
                    handler: function () {
                        loadModelList();
                    }
                }
            ]
        });

        var ruleList = Ext.create('Ext.grid.Panel', {
            store: ruleModelStore,
            header: false,
            split: true,
            tbar: toolbar,
            collapsible: false,
            multiSelect: false,
            columns: [
                {
                    text: language.rule_FileListModel,
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
                    text: language.rule_FileListRule,
                    flex: 3,
                    dataIndex: 'rule'
                }
            ],
            listeners: {
                itemclick: function (grid, record) {
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

        loadModelList();

        function loadModelList() {
            // Clear the existing data
            ruleModelStore.loadData([], false);

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
                        if (models[cnt].rules == null) {
                            var element = {};
                            element.model = models[cnt].model;

                            ruleModelStore.add(element);
                            continue;
                        }
                        var rules = [].concat(models[cnt].rules);
                        for (var elcnt = 0; elcnt < rules.length; elcnt++) {
                            var element = {};
                            element.model = models[cnt].model;
                            element.rule = rules[elcnt].name;

                            ruleModelStore.add(element);
                        }
                    }
                }
            });
        }
    }
})
;