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


Ext.define('openHAB.config.bindingProperties', {
    extend: 'Ext.panel.Panel',
    layout: 'fit',
    header: false,

    initComponent: function () {
        var bindingName;
        var bindingConfig;
        var source = Array();
        var sourceConfig = Array();

        // Add the records into the source/sourceConfig arrays
        function addBindingProperty(name, label, value) {
            var id = name;
            sourceConfig[id] = {};
            sourceConfig[id].displayName = label;

            if (value != null)
                source[id] = value;
            else
                source[id] = "";
        }

        function resetBindingProperties() {
            // Ensure config records are an array
            var records = [].concat(bindingConfig.generalconfig);

            // Add the records into the source/sourceConfig arrays
            source = [];
            sourceConfig = [];
            for (var c = 0; c < records.length; c++) {
                addBindingProperty(records[c].name, records[c].label, records[c].value);
            }
            bindingProperties.setSource(source, sourceConfig);
        }

        function getBindingProperty(name) {
            for (var c = 0; c < bindingConfig.generalconfig.length; c++) {
                if (bindingConfig.generalconfig[c].name == name)
                    return bindingConfig.generalconfig[c];
            }

            for (var c = 0; c < bindingConfig.interfaceconfig.length; c++) {
                if (bindingConfig.interfaceconfig[c].name == name)
                    return bindingConfig.interfaceconfig[c];
            }

            return null;
        }

        var toolbar = Ext.create('Ext.toolbar.Toolbar', {
            items: [
                {
                    icon: 'images/cross.png',
                    itemId: 'cancel',
                    text: language.cancel,
                    cls: 'x-btn-icon',
                    disabled: true,
                    tooltip: language.config_BindingPropertiesCancelTip,
                    handler: function () {
                        resetBindingProperties();
                        toolbar.getComponent('save').disable();
                        toolbar.getComponent('cancel').disable();
                    }
                },
                {
                    icon: 'images/disk.png',
                    itemId: 'save',
                    text: language.save,
                    cls: 'x-btn-icon',
                    disabled: true,
                    tooltip: language.config_BindingPropertiesSaveTip,
                    handler: function () {
                        saveBinding();
                    }
                },
                {
                    icon: 'images/plus-button.png',
                    itemId: 'add',
                    text: 'Add Interface',
                    cls: 'x-btn-icon',
                    disabled: true,
                    tooltip: language.config_BindingPropertiesAddTip,
                    handler: function () {
                        // Pop up a dialogue box asking for the interface name
                        Ext.MessageBox.prompt(language.config_BindingPropertiesInterfaceName, language.config_BindingPropertiesInterfaceNamePrompt, function (btn, text) {
                            if (btn == 'ok') {
                                // Add a new property sheet to the panel
                                if (text.indexOf('.') != -1) {
                                    Ext.MessageBox(language.error, language.config_BindingPropertiesInterfaceNameError);
                                }

                                // process text value and close...
                                for (var c = 0; c < bindingConfig.interfaceconfig.length; c++) {
                                    addBindingProperty(text + '.' + bindingConfig.interfaceconfig[c].name, text + ': ' + bindingConfig.interfaceconfig[c].label)
                                }
                                bindingProperties.setSource(source, sourceConfig);
                                toolbar.getComponent('cancel').enable();
                            }
                        });
                    }
                }
            ]
        });

        var bbDescription = Ext.create('Ext.toolbar.TextItem', {text: ''});
        var bbProperties = Ext.create('Ext.ux.StatusBar', {
            text: '-',
            items: [bbDescription]
        });

        Ext.define('BindingConfigModel', {
            extend: 'Ext.data.Model',
            fields: [
                {name: 'pid'},
                {name: 'name'},
                {name: 'label'},
                {name: 'value'},
                {name: 'description'},
                {name: 'optional'},
                {name: 'default'},
                {name: 'minimum'},
                {name: 'maximum'},
                {name: 'options'}
            ]
        });

        var bindingProperties = Ext.create('Ext.grid.property.Grid', {
            title: language.properties,
            icon: 'images/gear.png',
            tbar: toolbar,
            bbar: bbProperties,
            hideHeaders: true,
            sortableColumns: false,
            nameColumnWidth: 300,
            split: true,
            source: source,
            sourceConfig: sourceConfig,
            viewConfig: {
                markDirty: false
            },
            listeners: {
                propertychange: function (source, recordId, value, oldValue, eOpts) {
                    toolbar.getComponent('save').enable();
                    toolbar.getComponent('cancel').enable();
                },
                itemmouseenter: function (grid, record, item, index, e, eOpts) {
                    var name = record.get("name");
                    var parts = name.split(".");
                    var srec = getBindingProperty(parts[parts.length - 1]);

                    if (srec == null)
                        return;
                    bbDescription.setText(srec.description);
                },
                itemmouseleave: function (grid, record, item, index, e, eOpts) {
                    bbDescription.setText("");
                }
            }
        });

        var tabs = Ext.create('Ext.tab.Panel', {
            layout: 'fit',
            border: false,
            items: bindingProperties
        });

        this.items = tabs;

        this.callParent();

        function updateBinding(json) {
            // Remember the configuration
            bindingConfig = json;

            bbProperties.setText(language.config_BindingPropertiesBinding + bindingName);

            // If there are interface configurations available, then enable the "add interface" button
            if (json.interfaceconfig != null)
                toolbar.getComponent('add').enable();
            else
                toolbar.getComponent('add').disable();

            if (json.generalconfig == null)
                return;

            resetBindingProperties();

            // Handle special bindings
            if (bindingName == 'zwave') {
                var newPage;
                newPage = Ext.create('openHAB.config.zwaveDeviceList');
                tabs.add([newPage]);
                newPage = Ext.create('openHAB.config.zwaveNetwork');
                tabs.add([newPage]);
                newPage = Ext.create('openHAB.config.zwaveProductList');
                tabs.add([newPage]);
            }
        }

        // Class members.
        this.setBinding = function (name) {
            // Sanity check that a binding name has been specified!
            if (name == null)
                return;
            if (name == "")
                return;

            bindingName = name;
            Ext.Ajax.request({
                url: HABminBaseURL + '/config/bindings/' + bindingName,
                timeout: 5000,
                method: 'GET',
                headers: {'Accept': 'application/json'},
                success: function (response, opts) {
                    var json = Ext.decode(response.responseText);
                    // If there's no config for this binding, records will be null
                    if (json == null)
                        return;

                    updateBinding(json);
                }
            });
        }

        function saveBinding() {
            toolbar.getComponent('save').disable();
            toolbar.getComponent('cancel').disable();

            // Get the property data
            var prop = bindingProperties.getSource();
            if (prop == null)
                return;

            // The following may not be completely necessary, but it cleans up the response
            // by only returning settings that actually have values.
            var jsonArray = {};
            jsonArray.pid = bindingName;
            jsonArray.config = [];
            var objects = Object.keys(prop);
            for (var cnt = 0; cnt < objects.length; cnt++) {
                var config = {};
                config.name = objects[cnt];
                config.value = prop[objects[cnt]];
                jsonArray.config.push(config);
            }

            // Send the request to openHAB
            Ext.Ajax.request({
                url: HABminBaseURL + '/config/bindings/' + bindingName,
                headers: {'Accept': 'application/json'},
                method: 'PUT',
                jsonData: jsonArray,
                success: function (response, opts) {
                    handleStatusNotification(NOTIFICATION_OK, language.config_BindingPropertiesSaved);

                    var json = Ext.decode(response.responseText);
                    // If there's no config for this binding, records will be null
                    if (json == null)
                        return;
                    updateBinding(json);
                },
                failure: function (result, request) {
                    handleStatusNotification(NOTIFICATION_ERROR, language.config_BindingPropertiesError);
                }
            });
        }
    }
})
;
