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


Ext.define('openHAB.config.bindingProperties', {
    extend:'Ext.panel.Panel',
    layout:'fit',
    tabTip:'Binding Properties',
    header:false,
    binding:"",

    initComponent:function () {
		// Sanity check that a binding name has been specified!
		if(this.binding == null)
			return;
		if(this.binding == "")
			return;

        var tbProperties = Ext.create('Ext.toolbar.Toolbar', {
            items:[
                {
                    icon:'images/cross.png',
                    id:'configPropTb-cancel',
                    text:'Cancel',
                    cls:'x-btn-icon',
                    disabled:true,
                    tooltip:'Cancel changes made to the configuration',
                    handler:function () {
                        Ext.getCmp("configPropTb-save").disable();
                        Ext.getCmp("configPropTb-cancel").disable();
                    }
                },
                {
                    icon:'images/disk.png',
                    id:'configPropTb-save',
                    text:'Save',
                    cls:'x-btn-icon',
                    disabled:true,
                    tooltip:'Save changes to the binding configuration',
                    handler:function () {
                        Ext.getCmp("configPropTb-save").disable();
                        Ext.getCmp("configPropTb-cancel").disable();
                    }
                },
                {
                    icon:'images/plus-button.png',
                    id:'configPropTb-add',
                    text:'Add Interface',
                    cls:'x-btn-icon',
                    disabled:true,
                    tooltip:'Add an interface to the binding configuration',
                    handler:function () {
						// Pop up a dialogue box asking for the interface name
						Ext.MessageBox.prompt('Interface Name', 'Please enter the new interface name:', function(btn, text){
									if (btn == 'ok') {
										// Add a new property sheet to the panel
										
										// process text value and close...
										for(var c=0;c<this.interfaceConfig.length;c++) {
											
										}
									}
								});
                    }
                }
            ]
        });

        var bbDescription = Ext.create('Ext.toolbar.TextItem', {text: ''});
        var bbProperties = Ext.create('Ext.ux.StatusBar', {
            text:'Binding: '+this.binding,
            items: [bbDescription]
        });

        Ext.define('BindingConfigModel', {
            extend:'Ext.data.Model',
            fields:[
                {name:'pid'},
                {name:'name'},
                {name:'label'},
                {name:'value'},
                {name:'description'},
                {name:'optional'},
                {name:'default'},
                {name:'minimum'},
                {name:'maximum'},
                {name:'options'}
            ]
        });

        // Create the Item data store
        var configBindingStore = Ext.create('Ext.data.ArrayStore', {
            model:'BindingConfigModel',
            proxy:{
                type:'rest',
                url:'/rest/bindings/'+this.binding,
                reader:{
                    type:'json',
                    root:'generalconfig'
                },
                headers:{'Accept':'application/json'},
                pageParam:undefined,
                startParam:undefined,
                sortParam:undefined,
                limitParam:undefined
            },
            autoLoad:true,
            listeners:{
                load:function(store, records, successful, operation, eOpts) {
                    // If there's no config for this binding, records will be null
                    if(records == null)
                        return;

                    this.source = [];
                    this.sourceConfig = [];
                    this.interfaceConfig = [];
                    for(var c = 0; c < records.length; c++) {
                        var id = records[c].get('name');
						// Handle interface (second level) config - start with .
						if(id.charAt(0) == '.') {
							// Put these into the interfaceConfig array for later use
							this.interfaceConfig.push(id);
						}
						else {
							this.sourceConfig[id] = {};
							this.sourceConfig[id].displayName = records[c].get('label');

							if(records[c].get('value') != null)
								this.source[id] = records[c].get('value');
							else
								this.source[id] = "";
						}
					}

                    var bindingProperties = Ext.create('Ext.grid.property.Grid', {
                        title:'Properties',
                        id:'configItemProperties',
                        icon:'images/gear.png',
                        tbar:tbProperties,
                        bbar:bbProperties,
                        hideHeaders:true,
                        sortableColumns:false,
                        nameColumnWidth:300,
                        split:true,
                        source: this.source,
                        sourceConfig:this.sourceConfig,
                        viewConfig:{
                            markDirty:false
                        },
                        listeners:{
                            propertychange:function (source, recordId, value, oldValue, eOpts) {
                                Ext.getCmp("configPropTb-save").enable();
                                Ext.getCmp("configPropTb-cancel").enable();
                            },
                            itemmouseenter:function(grid, record, item, index, e, eOpts ) {
                                var name = record.get("name");
                                var srec = configBindingStore.findExact("name", name);
                                bbDescription.setText(configBindingStore.getAt(srec).get("description"));
                            },
                            itemmouseleave:function(grid, record, item, index, e, eOpts ) {
                                bbDescription.setText("");
                            }
                        }
                    });

                    tabs.add(bindingProperties);
					
					// If there are interface configurations available, then enable the "add interface" button
	
					// Handle special bindings
					if(this.binding == 'zwave') {
						var zwaveDevices = Ext.create('openHAB.config.zwaveDeviceList');
						var zwaveNetwork = Ext.create('openHAB.config.zwaveNetwork');

						tabs.add([zwaveDevices, zwaveNetwork]);
					}
                }
            }
        });
		
        var tabs = Ext.create('Ext.tab.Panel', {
            layout:'fit',
            border:false,
            id:'tabsBindingProperties'
        });

        this.items = tabs;

        this.callParent();

        // Class members.
        this.setItem = function (newItem) {
        }
    }
})
;
