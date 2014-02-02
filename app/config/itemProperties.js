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


Ext.define('openHAB.config.itemProperties', {
    extend: 'Ext.panel.Panel',
    layout: 'fit',
    header: false,
    itemId: 'itemPropertiesMain',
    saveOutstanding: 0,
    saveError: false,

    initComponent: function () {
        this.title = language.properties;
        this.tabTip = language.config_ItemPropertiesTitleTip;

        var me = this;

        var newItem;
        var itemData;
        var itemExtendedData;
        var itemPersistenceData;
        var itemPrimaryOptionsUpdated = false;
        var itemExtendedOptionsUpdated = false;
        var itemPersistenceOptionsUpdated = false;

        var itemHelp = {
            ItemName: language.config_ItemPropertiesSetName,
            Type: language.config_ItemPropertiesSetType,
            Label: language.config_ItemPropertiesSetLabel,
            Units: language.config_ItemPropertiesSetUnits,
            Format: language.config_ItemPropertiesSetFormat,
            TranslateService: language.config_ItemPropertiesSetTransService,
            TranslateRule: language.config_ItemPropertiesSetTransRule,
            Icon: language.config_ItemPropertiesSetIcon,
            Groups: language.config_ItemPropertiesSetGroups,
            Persistence: language.config_ItemPropertiesSetPersistence
        };

        Ext.define('PersistenceStrategyModel', {
            extend: 'Ext.data.Model',
            fields: [
                {name: 'service'},
                {name: 'strategy'},
                {name: 'display'}
            ]
        });

        // Create the data store
        var persistenceStrategyStore = Ext.create('Ext.data.ArrayStore', {
            model: 'PersistenceStrategyModel'
        });

        // Create the persistence service strategies list
        var strategies = [];
        var outCnt = 0;
        for (var cnt = 0; cnt < persistenceServiceStore.getCount(); cnt++) {
            var list = [].concat(persistenceServiceStore.getAt(cnt).get("strategies"));
            for (var scnt = 0; scnt < list.length; scnt++) {
                strategies[outCnt] = {};
                strategies[outCnt].name = persistenceServiceStore.getAt(cnt).get("name");
                strategies[outCnt].strategy = list[scnt].name;
                strategies[outCnt].display = strategies[outCnt].name + ":" + strategies[outCnt].strategy;
                outCnt++;
            }
        }
        persistenceStrategyStore.loadData(strategies);

        var sourceConfig = {
            ItemName: {
                displayName: language.config_ItemPropertiesItemName
            },
            Icon: {
                renderer: function (v) {
                    if (v == "")
                        return "";
                    var icon = "";
                    var label = "";
                    var resp = '<div width="30">';
                    var ref = itemIconStore.findExact("name", v);
                    if (ref != -1) {
                        if (itemIconStore.getAt(ref).get('menuicon') != "")
                            icon = '<img src="../images/' + itemIconStore.getAt(ref).get('menuicon') + '" align="left" height="16">';
                        if (itemIconStore.getAt(ref).get('label') != "")
                            label = itemIconStore.getAt(ref).get('label');
                    }
                    else {
                        // If we get here, we're using an icon that isn't known to the REST service
                        icon = '<img src="../images/' + v + '.png" align="left" height="16">';
                        label = v + " (manually set)";
                    }

                    resp += '</div>' + v;
                    return '<div>' + icon + '</div><div style="margin-left:20px">' + label + '</div>';
                },
                editor: Ext.create('Ext.form.ComboBox', {
                    store: itemIconStore,
                    queryMode: 'local',
                    typeAhead: false,
                    editable: false,
                    displayField: 'label',
                    valueField: 'name',
                    forceSelection: true,
                    editable: false,
                    allowBlank: false,
                    listConfig: {
                        getInnerTpl: function () {
                            var tpl = '<div>' +
                                '<img src="../images/{menuicon}" align="left" height="16">&nbsp;&nbsp;' +
                                '{label}</div>';
                            return tpl;
                        }
                    }
                })
            },
            Format: {
                renderer: function (v) {
                    var label = "";
                    var ref = itemFormatStore.findExact("format", v);
                    if (ref != -1) {
                        if (itemFormatStore.getAt(ref).get('label') != "")
                            label = itemFormatStore.getAt(ref).get('label');
                    }
                    else {
                        // If we get here, we're using a format that isn't defined
                        label = v;
                    }

                    return label;
                },
                editor: Ext.create('Ext.form.ComboBox', {
                    store: itemFormatStore,
                    queryMode: 'local',
                    typeAhead: true,
                    displayField: 'label',
                    valueField: 'format',
                    forceSelection: false,
                    editable: true,
                    allowBlank: true
                })
            },
            Type: {
                displayName: language.config_ItemPropertiesItemType,
                renderer: function (v) {
                    var ref = itemTypeStore.findExact("name", v);
                    if (ref == -1)
                        return "";
                    var icon = itemTypeStore.getAt(ref).get("icon");
                    return '<img src="' + icon + '" align="left" height="16">&nbsp;&nbsp;' + v;
                },
                editor: Ext.create('Ext.form.ComboBox', {
                    store: itemTypeStore,
                    queryMode: 'local',
                    typeAhead: false,
                    editable: false,
                    displayField: 'name',
                    valueField: 'name',
                    forceSelection: true,
                    allowBlank: false,
                    listConfig: {
                        getInnerTpl: function () {
                            var tpl = '<div>' +
                                '<img src="{icon}" align="left" height="16" width:"16";>&nbsp;&nbsp;' +
                                '{name}</div>';
                            return tpl;
                        }
                    }
                })
            },
            TranslateService: {
                displayName: language.config_ItemPropertiesTranslationService,
                renderer: function (v) {
                    var ref = translationServiceStore.findExact("name", v);
                    if (ref == -1)
                        return "";
                    return translationServiceStore.getAt(ref).get("label");
                },
                editor: Ext.create('Ext.form.ComboBox', {
                    store: translationServiceStore,
                    queryMode: 'local',
                    displayField: 'label',
                    valueField: 'name',
                    typeAhead: false,
                    editable: false,
                    forceSelection: true,
                    allowBlank: true
                })
            },
            TranslateRule: {
                displayName: language.config_ItemPropertiesTranslationRule
            },
            Persistence: {
                displayName: language.config_ItemPropertiesPersistence,
                editor: Ext.create('Ext.form.ComboBox', {
                    multiSelect: true,
                    typeAhead: false,
                    editable: false,
                    displayField: 'display',
                    valueField: 'display',
                    store: persistenceStrategyStore,
                    queryMode: 'local',
                    listeners: {
                        expand: function (cb, eOpts) {
                            // The combo doesn't get set correctly within the property grid
                            // We need to split the selection and reset it!
                            var val = cb.getValue();

                            if (val.length != 1)
                                return;

                            cb.setValue(val[0].split(","));
                        }
                    }
                })
            },
            Groups: {
                displayName: language.config_ItemPropertiesGroups
            }
        };

        Ext.define('ItemIcons', {
            extend: 'Ext.data.Model',
            fields: [
                {type: 'number', name: 'id'},
                {type: 'string', name: 'icon'},
                {type: 'string', name: 'name'}
            ]
        });

        var toolbar = Ext.create('Ext.toolbar.Toolbar', {
            itemId: "toolbar",
            items: [
                {
                    icon: 'images/cross.png',
                    itemId: 'cancel',
                    text: language.cancel,
                    cls: 'x-btn-icon',
                    disabled: true,
                    tooltip: language.config_ItemPropertiesCancelChangeTip,
                    handler: function () {
                        // Reset to the current data
                        me.revertItem();
                    }
                },
                {
                    icon: 'images/disk.png',
                    itemId: 'save',
                    text: language.save,
                    cls: 'x-btn-icon',
                    disabled: true,
                    tooltip: language.config_ItemPropertiesSaveChangeTip,
                    handler: function () {
                        me.saveItem();
                    }
                }
            ]
        });

        var graphTypeStore = Ext.create('Ext.data.Store', {
            fields: ['id', 'name']
        });
        var graphTypes = [
            {id: 0, name: 'Spline'},
            {id: 1, name: 'Line'},
            {id: 2, name: 'Bar'}
        ];

        graphTypeStore.loadData(graphTypes);

        var itemOptions = Ext.create('Ext.grid.property.Grid', {
            hideHeaders: true,
            sortableColumns: false,
            nameColumnWidth: 300,
            border: false,
            viewConfig: {
                markDirty: true
            },
            listeners: {
                propertychange: function (source, recordId, value, oldValue, eOpts) {
                    toolbar.getComponent('cancel').enable();
                    toolbar.getComponent('save').enable();
                    itemPrimaryOptionsUpdated = true;
                },
                beforeedit: function (editor, e) {
                    var rec = e.record;
                    // Make some properties read-only
                    if (newItem == false && rec.get('name') == 'ItemName')
                        e.cancel = true;
                    if (rec.get('name') == 'Groups')
                        e.cancel = true;
//                    if (rec.get('name') == 'Persistence')
                    //                       e.cancel = true;
                },
                itemmouseenter: function (grid, record, item, index, e, eOpts) {
                    var name = record.get("name");
//                    helpStatusText.setText(itemHelp[name]);
                },
                itemmouseleave: function (grid, record, item, index, e, eOpts) {
//                    helpStatusText.setText("");
                }
            }
        });

        var itemExtendedOptions = Ext.create('Ext.grid.property.Grid', {
            hideHeaders: true,
            sortableColumns: false,
            nameColumnWidth: 300,
            border: false,
            viewConfig: {
                markDirty: true
            },
            listeners: {
                propertychange: function (source, recordId, value, oldValue, eOpts) {
                    toolbar.getComponent('cancel').enable();
                    toolbar.getComponent('save').enable();
                    itemExtendedOptionsUpdated = true;
                },
                itemmouseenter: function (grid, record, item, index, e, eOpts) {
                    var name = record.get("name");
//                    helpStatusText.setText(itemHelp[name]);
                },
                itemmouseleave: function (grid, record, item, index, e, eOpts) {
//                    helpStatusText.setText("");
                }
            }
        });

        var itemPersistenceOptions = Ext.create('Ext.grid.property.Grid', {
            hideHeaders: true,
            sortableColumns: false,
            nameColumnWidth: 300,
            border: false,
            viewConfig: {
                markDirty: true
            },
            listeners: {
                propertychange: function (source, recordId, value, oldValue, eOpts) {
                    toolbar.getComponent('cancel').enable();
                    toolbar.getComponent('save').enable();
                    itemPersistenceOptionsUpdated = true;
                },
                itemmouseenter: function (grid, record, item, index, e, eOpts) {
                    var name = record.get("name");
//                    helpStatusText.setText(itemHelp[name]);
                },
                itemmouseleave: function (grid, record, item, index, e, eOpts) {
//                    helpStatusText.setText("");
                }
            }
        });

        var itemProperties = Ext.create('Ext.panel.Panel', {
            title: language.properties,
            itemId: 'itemProperties',
            icon: 'images/gear.png',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
//            layout: 'fit',
            tbar: toolbar,
            border: false,
            items: [itemOptions, itemPersistenceOptions, itemExtendedOptions]
        });

        var helpStatusText = Ext.create('Ext.toolbar.TextItem', {text: ''});
        var statusBar = Ext.create('Ext.ux.StatusBar', {text: '-', items: [helpStatusText]});

        var itemGroups = Ext.create('openHAB.config.groupTree');
        var itemRules = Ext.create('openHAB.config.itemRules');
        var itemBindings = Ext.create('openHAB.config.itemBindings');

        // Create the tab container for the item configuration
        var tabs = Ext.create('Ext.tab.Panel', {
            layout: 'fit',
//            itemId: 'itemProperties',
            bbar: statusBar,
            border: false,
            items: [itemProperties, itemGroups, itemRules, itemBindings],
            listeners: {
                beforetabchange: function (tabPanel, newCard, oldCard, eOpts) {
                    // Detect if we've changed view so we can collate the data from the sub-tabs
                    if (newCard.itemId == 'itemProperties') {
                        // Only update the property grid if it's changed.
                        // Otherwise the cell gets marked dirty when it's not!
                        var newGroups = itemGroups.getSelected();
                        if (compareGroups([].concat(itemData.groups), newGroups) == false) {
                            var groupsOut = "";
                            newGroups = [].concat(newGroups);
                            for (var cnt = 0; cnt < newGroups.length; cnt++) {
                                itemGroups.setGroup(newGroups[cnt]);
                                if (groupsOut.length != 0)
                                    groupsOut += ", ";
                                groupsOut += newGroups[cnt];
                            }

                            itemOptions.setProperty("Groups", groupsOut);
                        }
                    }

                    // Synchronise the states of the SAVE/CANCEL buttons across all tabs
                    // This makes it look like a common toolbar.

                    // First get the state of the buttons in the old window
                    var tbOld = oldCard.getDockedComponent('toolbar');

                    var stSave = tbOld.getComponent('save').isDisabled();
                    var stCancel = tbOld.getComponent('cancel').isDisabled();

                    var tbProperties = itemProperties.getDockedComponent('toolbar');
                    var tbBinding = itemBindings.getDockedComponent('toolbar');
                    var tbGroup = itemGroups.getDockedComponent('toolbar');
                    var tbRules = itemRules.getDockedComponent('toolbar');
                    if (stCancel == true) {
                        tbProperties.getComponent('cancel').disable();
                        tbBinding.getComponent('cancel').disable();
                        tbGroup.getComponent('cancel').disable();
                        tbRules.getComponent('cancel').disable();
                    }
                    else {
                        tbProperties.getComponent('cancel').enable();
                        tbBinding.getComponent('cancel').enable();
                        tbGroup.getComponent('cancel').enable();
                        tbRules.getComponent('cancel').enable();
                    }
                    if (stSave == true) {
                        tbProperties.getComponent('save').disable();
                        tbBinding.getComponent('save').disable();
                        tbGroup.getComponent('save').disable();
                        tbRules.getComponent('save').disable();
                    }
                    else {
                        tbProperties.getComponent('save').enable();
                        tbBinding.getComponent('save').enable();
                        tbGroup.getComponent('save').enable();
                        tbRules.getComponent('save').enable();
                    }
                }
            }
        });

        this.items = tabs;

        this.callParent();

        // --------------
        // Class members.

        function compareGroups(group1, group2) {
            if (group1.length != group2.length)
                return false;
            for (var i = 0; i < group1.length; i++) {
                if (group1.indexOf(group2[i]))
                    return false;
            }
            return true;
        }

        function compareBindings(binding1, binding2) {
            if (binding1.length != binding2.length)
                return false;
            for (var i = 0; i < binding1.length; i++) {
                var found = false;
                for (var c = 0; c < binding1.length; c++) {
                    if(binding1[i].binding != binding2[c].binding)
                        continue;
                    if(binding1[i].config == binding2[i].config) {
                        found = true;
                        break;
                    }
                }
                if(found == false)
                    return false;
            }
            return true;
        }

        // Set the name of the item and load all the settings.
        this.setItem = function (itemName) {
            var me = this;
            // Load the item data
            Ext.Ajax.request({
                url: HABminBaseURL + '/config/items/' + itemName,
                timeout: 5000,
                method: 'GET',
                headers: {'Accept': 'application/json'},
                success: function (response, opts) {
                    var json = Ext.decode(response.responseText);
                    // If there's no config for this item, records will be null
                    if (json == null)
                        return;

                    me.updatePrimaryItemProperties(json);
                }
            });

            // Load the rules for this item
            Ext.Ajax.request({
                url: HABminBaseURL + '/config/persistence/item/' + itemName,
                timeout: 5000,
                method: 'GET',
                headers: {'Accept': 'application/json'},
                success: function (response, opts) {
                    var json = Ext.decode(response.responseText);
                    // If there's no config for this item, records will be null
                    if (json == null)
                        return;

                    me.updatePersistenceItemProperties(json);
                }
            });

            // Load the rules for this item
            Ext.Ajax.request({
                url: HABminBaseURL + '/config/rules/item/' + itemName,
                timeout: 5000,
                method: 'GET',
                headers: {'Accept': 'application/json'},
                success: function (response, opts) {
                    var json = Ext.decode(response.responseText);
                    // If there's no config for this item, records will be null
                    if (json == null)
                        return;

                    me.updateExtendedItemProperties(json);
                }
            });

            // This is an existing item, so we don't allow the item name to be edited.
            newItem = false;
        };

        // Create a new item
        this.createItem = function (modelName) {
            var json = {};
            json.model = modelName;
            json.groups = "";
            this.updatePrimaryItemProperties(json);

            // This is a new item, so we allow the item name to be edited.
            newItem = true;

            json = {};
            json.persistence = "";
            this.updatePersistenceItemProperties(json);
        };

        // Update the item properties
        this.updatePrimaryItemProperties = function (json) {
            // Save the response so we can reset later if needed
            itemData = json;

            itemPrimaryOptionsUpdated = false;

            statusBar.setText("Item: " + json.name);

            // Set the main item properties
            var source = {};
            source.ItemName = setValue(json.name);
            source.Type = setValue(json.type);
            source.Icon = setValue(json.icon);
            source.Label = setValue(json.label);
            source.Format = setValue(json.format);
            source.Units = setValue(json.units);
            source.TranslateService = setValue(json.translateService);
            source.TranslateRule = setValue(json.translateRule);

            // Ensure the groups is an array!
            var groups = [];
            if (json.groups)
                var groups = [].concat(json.groups);

            // Set the groups
            var groupsOut = "";
            itemGroups.resetGroups();
            for (var cnt = 0; cnt < groups.length; cnt++) {
                itemGroups.setGroup(groups[cnt]);
                if (groupsOut.length != 0)
                    groupsOut += ", ";
                groupsOut += groups[cnt];
            }

            source.Groups = setValue(groupsOut);

            // If this is a group, remove all non applicable properties
            if (json.type == "GroupItem") {
                // Block the "Bindings" tab
                tabs.remove(itemBindings, true);
                // TODO: Maybe nothing? Needs to account for active groups!
            }
            // Update the property grid
            itemOptions.setSource(source, sourceConfig);

            // Ensure the bindings is an array!
            var bindings = [];
            if (json.bindings)
                bindings = [].concat(json.bindings);

            // Set the binding strings
            itemBindings.setBindings(bindings);

            var cancel = toolbar.getComponent('cancel');
            if (cancel)
                cancel.disable();
            var save = toolbar.getComponent('save');
            if (save)
                save.disable();

            // Set the item name in the rules tab
            itemRules.setItem(json.name);

            // Helper function to make above code more readable
            function setValue(val) {
                if (val == null)
                    return "";
                return val;
            }
        };

        // Add the extended item properties from rules...
        this.updateExtendedItemProperties = function (json) {
            // Save the response so we can reset later if needed
            itemExtendedData = json;

            var itemExtendedOptionsUpdated = false;

            // Sanity check the response
            if (json == null)
                return;
            if (json.rule == null)
                return;

            var extendedSource = {};
            var extendedConfig = {};
            for (var cnt = 0; cnt < json.rule.length; cnt++) {
                var rec = json.rule[cnt];
                if (rec == null)
                    continue;

                if (rec.linkeditem != null && rec.linkeditem != "") {
                    var variables = [].concat(rec.variable);

                    for (var vcnt = 0; vcnt < variables.length; vcnt++) {
                        if (variables[vcnt].scope == "Setup")
                            continue;

                        var name = rec.name + "." + variables[vcnt].name;

                        extendedSource[name] = variables[vcnt].value;
                        extendedConfig[name] = {};
                        extendedConfig[name].displayName = variables[vcnt].label;
                    }
                }
            }
            itemExtendedOptions.setSource(extendedSource, extendedConfig);
        };

        // Add the extended item properties from rules...
        this.updatePersistenceItemProperties = function (json) {
            // Save the response so we can reset later if needed
            itemPersistenceData = json;

            var itemPersistenceOptionsUpdated = false;

            var source = {};
            // Ensure the persistence is an array!
            var persistenceOut = "";
            if (json.persistence != null) {
                var persistenceIn = [].concat(json.persistence);

                // Flatten the structure so it works with a combobox
                for (var cnt = 0; cnt < persistenceIn.length; cnt++) {
                    var itemStrategies = [].concat(persistenceIn[cnt].itemstrategies);
                    var groupStrategies = [].concat(persistenceIn[cnt].groupstrategies);
                    var totalStrategies = "";
                    for (var icnt = 0; icnt < itemStrategies.length; icnt++) {
                        if (itemStrategies[icnt] == null)
                            continue;
                        if (totalStrategies.length != 0)
                            totalStrategies += ",";

                        var display = persistenceIn[cnt].service + ":" + itemStrategies[icnt];
                        var id = persistenceStrategyStore.findExact("display", display);
                        if (id != -1) {

                        }
                        totalStrategies += display;
                    }

                    // Have we got any specific strategies for this item?
                    if (totalStrategies == "") {
                        // No - show the group strategies
                        for (var gcnt = 0; gcnt < groupStrategies.length; gcnt++) {
                            if (groupStrategies[gcnt] == null)
                                continue;
                            if (itemStrategies.indexOf(groupStrategies) == -1) {
                                if (totalStrategies.length != 0)
                                    totalStrategies += ",";
                                totalStrategies += persistenceIn[cnt].service + ":" + groupStrategies[gcnt];
                            }
                        }
                        if (totalStrategies != "")
                            totalStrategies = "group(" + totalStrategies + ")";
                    }

                    persistenceOut += totalStrategies;
                }
            }
            source.Persistence = persistenceOut;

            // Update the property grid
            itemPersistenceOptions.setSource(source, sourceConfig);
        };


        // Handles the responses from the different Ajax calls
        // Only when all outstanding calls are finished do we post success/fail
        this.saveResponse = function (saveState) {
            // Keep track of any errors
            if (saveState == false)
                this.saveError = true;

            // See if all requests are complete?
            this.saveOutstanding--;
            if (this.saveOutstanding > 0)
                return;

            // All requests complete - display success (or otherwise!)
            if (this.saveError == false) {
                handleStatusNotification(NOTIFICATION_OK, language.config_ItemPropertiesSaveOk);
            }
            else {
                handleStatusNotification(NOTIFICATION_ERROR, language.config_ItemPropertiesSaveError);
            }

            // Reload the item store
            itemConfigStore.reload();
        };

        // Save the openHAB item model data
        this.savePrimaryData = function () {
            var me = this;

            var groups = itemGroups.getSelected();
            if(compareGroups(groups, [].concat(itemData.groups)) == false)
                itemPrimaryOptionsUpdated = true;

            var bindings = itemBindings.getBindings();
            if(compareBindings(bindings, [].concat(itemData.bindings)) == false)
                itemPrimaryOptionsUpdated = true;

            // Check if this data has changed
            if (itemPrimaryOptionsUpdated == false)
                return false;

            var prop = itemOptions.getSource();
            if (prop == null)
                return false;

            itemData.groups = groups;
            itemData.bindings = bindings;

            itemData.type = prop.Type;
            itemData.name = prop.ItemName;
            itemData.icon = prop.Icon;
            itemData.label = prop.Label;
            itemData.units = prop.Units;
            itemData.format = prop.Format;
            itemData.translateService = prop.TranslateService;
            itemData.translateRule = prop.TranslateRule;

            // Send the item configuration to openHAB
            Ext.Ajax.request({
                url: HABminBaseURL + "/config/items/" + itemData.name,
                headers: {'Accept': 'application/json'},
                method: 'PUT',
                jsonData: itemData,
                success: function (response, opts) {
                    me.saveResponse(true);

                    var json = Ext.decode(response.responseText);
                    // If there's no config returned for this item, records will be null
                    if (json != null)
                        me.updatePrimaryItemProperties(json);
                },
                failure: function (result, request) {
                    me.saveResponse(false);
                }
            });

            return true;
        };

        // Save HABmin extended data (eg rule configurations)
        this.saveExtendedData = function () {
            var me = this;

            // Firstly, check if this data has changed
            if (itemExtendedOptionsUpdated == false)
                return false;

            // Get the data from the main properties so we can find the itemName
            var prop = itemOptions.getSource();
            if (prop == null)
                return false;
            var itemName = prop.ItemName;

            // Get the data from the extended property sheet
            var prop = itemExtendedOptions.getSource();
            if (prop == null)
                return false;

            // Data needs to be translated into a format compatible with
            // the respective openHAB beans
            var data = {};
            data.rule = [];
            var ruleCnt = 0;

            // Loop through the store and extract all the variables that were in the property sheet
            for (var cnt = 0; cnt < itemExtendedData.rule.length; cnt++) {
                var rec = itemExtendedData.rule[cnt];
                if (rec == null)
                    continue;

                if (rec.linkeditem != null && rec.linkeditem != "") {
                    var variables = [].concat(rec.variable);

                    var varCnt = 0;
                    var rule = null;
                    for (var vcnt = 0; vcnt < variables.length; vcnt++) {
                        if (variables[vcnt].scope == "Setup")
                            continue;

                        var name = rec.name + "." + variables[vcnt].name;

                        if (rule == null) {
                            rule = {};
                            rule.name = rec.name;
                            rule.variable = [];
                        }
                        rule.variable[varCnt] = {};
                        rule.variable[varCnt].name = variables[vcnt].name;
                        rule.variable[varCnt].value = prop[name];
                        varCnt++;
                    }

                    if (rule != null) {
                        data.rule[ruleCnt] = rule;
                        ruleCnt++;
                    }
                }
            }

            if (ruleCnt != 0) {
                Ext.Ajax.request({
                    url: HABminBaseURL + '/config/rules/item/' + itemName,
                    method: 'PUT',
                    jsonData: data,
                    headers: {'Accept': 'application/json'},
                    success: function (response, opts) {
                        me.saveResponse(true);

                        var json = Ext.decode(response.responseText);
                        // If there's no config returned for this item, records will be null
                        if (json != null)
                            updateExtendedItemProperties(json);
                    },
                    failure: function () {
                        me.saveResponse(false);
                    }
                });
            }

            return true;
        };

        // Save persistence data
        this.savePersistenceData = function () {
            var me = this;

            // Firstly, check if this data has changed
            if (itemPersistenceOptionsUpdated == false)
                return false;

            var itemName = itemPersistenceData.item;

            var prop = itemPersistenceOptions.getSource();
            if (prop == null)
                return false;

            // Sanity check!
            if (prop.Persistence == null)
                return;

            // Create the bean to send to openHAB
            var data = {};
            data.item = itemName;
            data.persistence = [];

            // Copy all the services from the original definition into the response
            // Otherwise we'd not be able to disable persistence if there were no
            // strategies selected.
            if (itemPersistenceData.persistence == null || itemPersistenceData.persistence.length == 0)
                itemPersistenceData.persistence = [];
            var persistenceIn = [].concat(itemPersistenceData.persistence);
            for (var cnt = 0; cnt < persistenceIn.length; cnt++) {
                data.persistence[cnt] = {};
                data.persistence[cnt].service = persistenceIn[cnt].service;
                data.persistence[cnt].itemstrategies = [];
            }

            // Split the services and strategies
            for (var cnt = 0; cnt < prop.Persistence.length; cnt++) {
                var s = prop.Persistence[cnt].split(":");

                // Loop through all the existing services to find the applicable service
                var found = false;
                for (var scnt = 0; scnt < data.persistence.length; scnt++) {
                    if (data.persistence[scnt].service == s[0]) {
                        data.persistence[scnt].itemstrategies.push(s[1]);
                        found = true;
                    }
                }
                if (found == false) {
                    // The service wasn't found - push a new item to the array
                    var svc = {};
                    svc.service = s[0];
                    svc.itemstrategies = [];
                    svc.itemstrategies.push(s[1]);
                    data.persistence.push(svc);
                }
            }

            // Send the data to openHAB
            Ext.Ajax.request({
                url: HABminBaseURL + '/config/persistence/item/' + itemName,
                method: 'PUT',
                jsonData: data,
                headers: {'Accept': 'application/json'},
                success: function (response, opts) {
                    me.saveResponse(true);

                    var json = Ext.decode(response.responseText);
                    // If there's no config returned for this request, records will be null
                    if (json != null)
                        me.updatePersistenceItemProperties(json);
                },
                failure: function () {
                    me.saveResponse(false);
                }
            });

            return true;
        };

        this.saveItem = function () {
            var me = this;

            // Reset the status flags so we can correlate the different requests
            me.saveOutstanding = 0;
            me.saveError = false;

            var totalRequests = 0;
            if (me.savePrimaryData() == true) {
                me.saveOutstanding++;
                totalRequests++;
            }
            if (me.savePersistenceData() == true) {
                me.saveOutstanding++;
                totalRequests++;
            }
            if (me.saveExtendedData() == true) {
                me.saveOutstanding++;
                totalRequests++;
            }

            if (totalRequests == 0) {
                handleStatusNotification(NOTIFICATION_WARNING, language.config_ItemPropertiesNothingSaved);
            }

            // Disable the toolbar
            toolbar.getComponent('cancel').disable();
            toolbar.getComponent('save').disable();
        };

        this.revertItem = function () {
            var me = this;
            me.updatePrimaryItemProperties(itemData);
        };
    }
})
;