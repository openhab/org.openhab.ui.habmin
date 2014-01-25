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


Ext.define('openHAB.graph.saveGraph', {
    extend: 'Ext.window.Window',
    title: language.graph_SaveGraphTitle,
    closeAction: 'destroy',
    width: 750,
    resizable: false,
    draggable: false,
    modal: true,
//    layout: 'border',
    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    initComponent: function () {
        var saveGraphAxisStore = Ext.create('Ext.data.Store', {
            fields: [
                {type: 'number', name: 'axis'},
                {type: 'string', name: 'label'},
                {type: 'number', name: 'minimum'},
                {type: 'number', name: 'maximum'},
                {type: 'number', name: 'position'}
            ],
            data: [
                {axis: 1},
                {axis: 2},
                {axis: 3},
                {axis: 4}
            ]
        });

        var saveGraphStore = Ext.create('Ext.data.Store', {
            storeId: 'saveGraphStore',
            fields: [
                {type: 'number', name: 'id'},
                {type: 'string', name: 'name'},
                {type: 'string', name: 'label'},
                {type: 'number', name: 'axis'}
            ]
        });

        var yesnoStore = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            data: [
                {id: 1, name: 'Yes'},
                {id: 0, name: 'No'}
            ]
        });

        var chartStore = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            data: [
                {id: 'line', name: 'Line'},
                {id: 'spline', name: 'Spline'}
            ]
        });

        var iconStore = Ext.create('Ext.data.Store', {
            fields: ['icon', 'name'],
            data: [
                {icon: 'thermometer.png', name: 'Temperature'},
                {icon: 'water.png', name: 'Water'}
            ]
        });

        var colorStore = Ext.create('Ext.data.Store', {
            fields: ['color'],
            data: [
                {color: '#2f7ed8'},
                {color: '#0d233a'},
                {color: '#8bbc21'},
                {color: '#910000'},
                {color: '#1aadce'},
                {color: '#492970'},
                {color: '#f28f43'},
                {color: '#77a1e5'},
                {color: '#c42525'},
                {color: '#a6c96a'}
            ]
        });

        var periodStore = Ext.create('Ext.data.Store', {
            fields: ['duration', 'name'],
            data: [
                {duration: 3600, name: '1 Hour'},
                {duration: 7200, name: '2 Hours'},
                {duration: 10800, name: '3 Hours'},
                {duration: 14400, name: '4 Hours'},
                {duration: 21600, name: '6 Hours'},
                {duration: 43200, name: '12 Hours'},
                {duration: 84600, name: '1 Day'}
            ]
        });

            var axisStore = Ext.create('Ext.data.Store', {
            fields: ['axis', 'icon'],
            data: [
                {axis: 1, icon: 'images/notification-counter-01.png'},
                {axis: 2, icon: 'images/notification-counter-02.png'},
                {axis: 3, icon: 'images/notification-counter-03.png'},
                {axis: 4, icon: 'images/notification-counter-04.png'}
            ]
        });

        var cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
            clicksToEdit: 1
        });

        var chanList = Ext.create('Ext.grid.Panel', {
            store: saveGraphStore,
            region: 'north',
            selType: 'cellmodel',
            border: true,
            hideHeaders: false,
            title: 'Item Configuration',
            header: {
                height: 18,
                padding: 1,
                titleAlign: "center"
            },
            cls: 'save-chart-form',
            disableSelection: true,
            height: 195,
//        stateful:true,
//        stateId:'stateGrid',
            columns: [
                {
                    text: 'Axis',
                    hideable: false,
                    width: 32,
                    sortable: true,
                    dataIndex: 'axis',
                    editor: new Ext.form.field.ComboBox({
                        editable: false,
                        selectOnTab: true,
                        store: axisStore,
                        displayField: 'icon',
                        valueField: 'axis',
                        displayTpl: function () {
                            return '';//'<div><img src="{icon}" height="16"></div>';
                        },
                        listConfig: {
                            minWidth:24,
                            getInnerTpl: function () {
                                return '<div><img src="{icon}" height="16"></div>';
                            }
                        }
                    }),
                    renderer: function (v) {
                        var ref = axisStore.findExact("axis", v)
                        if (ref == -1)
                            return "";
                        var icon = axisStore.getAt(ref).get("icon");
                        return '<img src="' + icon + '" align="left" height="16">';
                    }
                },
                {
                    text: 'Item',
                    hideable: false,
                    flex: 4,
                    sortable: true,
                    dataIndex: 'name'
                },
                {
                    text: 'Label',
                    hideable: false,
                    flex: 4,
                    sortable: true,
                    dataIndex: 'label',
                    editor: {
                        allowBlank: true
                    }
                },
                {
                    text: 'Chart',
                    hideable: false,
                    flex: 2,
                    sortable: true,
                    dataIndex: 'chart',
                    editor: new Ext.form.field.ComboBox({
                        editable: false,
                        store: chartStore,
                        displayField: 'name',
                        valueField: 'id'
                    }),
                    renderer: function (v) {
                        var ref = chartStore.findExact("id", v)
                        if (ref == -1)
                            return "";
                        return chartStore.getAt(ref).get("name");
                    }
                },
                {
                    text: 'Color',
                    hideable: false,
                    flex: 2,
                    sortable: true,
                    dataIndex: 'color',
                    editor: new Ext.form.field.ComboBox({
                        editable: false,
                        store: colorStore,
                        displayField: 'color',
                        valueField: 'color',
                        displayTpl: function () {
                            return'';//<div style="background-color:{color};text-align:center;">&nbsp</div>';
                        },
                        listConfig: {
                            getInnerTpl: function () {
                                return'<div style="background-color:{color};text-align:center;">&nbsp</div>';
                            }
                        }
                    }),
                    renderer: function (v) {
                        return '<div style="background-color:' + v + ';text-align:center;">&nbsp</div>';
                    }
                },
                {
                    text: 'Line',
                    hideable: false,
                    flex: 2,
                    sortable: true,
                    dataIndex: 'line'
                },
                {
                    xtype: 'checkcolumn',
                    text: 'Markers',
                    hideable: false,
                    dataIndex: 'marker',
                    flex: 1,
                    stopSelection: false
                }
            ],
            layout: 'fit',
            viewConfig: {
                stripeRows: false,
                enableTextSelection: false,
                markDirty: false
            },
            plugins: [cellEditing]
        });

        var axisList = Ext.create('Ext.grid.Panel', {
            store: saveGraphAxisStore,
            title: "Axis Configuration",
            flex: 3,
            border: true,
            region: 'east',
            selType: 'cellmodel',
            hideHeaders: false,
            //header: true,
            header: {
                height: 18,
                padding: 1,
                titleAlign: "center"
            },
            cls: 'save-chart-form',

            disableSelection: true,
//        stateful:true,
//        stateId:'stateGrid',
            columns: [
                {
                    text: "Axis",
                    hideable: false,
                    width: 32,
                    sortable: true,
                    dataIndex: 'axis',
                    renderer: function (v) {
                        var ref = axisStore.findExact("axis", v)
                        if (ref == -1)
                            return "";
                        var icon = axisStore.getAt(ref).get("icon");
                        return '<img src="' + icon + '" align="left" height="16">';
                    }
                },
                {
                    text: 'Title',
                    hideable: false,
                    flex: 6,
                    sortable: true,
                    dataIndex: 'label',
                    editor: {
                        allowBlank: true
                    }
                },
                {
                    text: 'Format',
                    hideable: false,
                    flex: 3,
                    sortable: true,
                    dataIndex: 'label',
                    editor: {
                        allowBlank: true
                    }
                },
                {
                    text: 'Minimum',
                    hideable: false,
                    flex: 2,
                    sortable: true,
                    dataIndex: 'minimum',
                    editor: {
                        allowBlank: true
                    }
                },
                {
                    text: 'Maximum',
                    hideable: false,
                    flex: 2,
                    sortable: true,
                    dataIndex: 'maximum',
                    editor: {
                        allowBlank: true
                    }
                },
                {
                    text: 'Position',
                    hideable: false,
                    flex: 2,
                    sortable: true,
                    dataIndex: 'position',
                    editor: {
                        allowBlank: true
                    }
                }
            ],
            layout: 'fit',
            viewConfig: {
                stripeRows: false,
                enableTextSelection: false,
                markDirty: false
            }
        });

        var form = Ext.create('Ext.panel.Panel', {
            layout: 'form',
            region: 'center',
            flex: 2,
            header: {
                height: 18,
                padding: 1,
                titleAlign: "center"
            },
            cls: 'save-chart-form',
            title: 'Chart Configuration',
            border: true,
            bodyPadding: 10,
            fieldDefaults: {
                labelAlign: 'left',
                labelWidth: 50,
                labelStyle: 'font-weight:bold'
            },
            items: [
                {
                    labelWidth:40,
                    xtype: 'textfield',
                    id: 'graphName',
                    fieldLabel: 'Name',
                    maxLength: 50,
                    enforceMaxLength: true,
                    allowBlank: false
                },
                {
                    xtype: 'combobox',
                    itemId: 'graphDuration',
                    fieldLabel: 'Duration',
                    allowBlank: false,
                    valueField: 'duration',
                    displayField: 'name',
                    queryMode: 'local',
                    editable: false,
                    store: periodStore
                },
                {
                    xtype: 'combobox',
                    fieldLabel: 'Icon',
                    itemId: 'graphIcon',
                    name: 'graphIcon',
                    store: iconStore,
                    allowBlank: false,
                    valueField: 'name',
                    displayField: 'name',
                    forceSelection: true,
                    editable: false,
                    queryMode: 'local',
                    listConfig: {
                        getInnerTpl: function () {
                            var tpl = '<div>' +
                                '<img src="images/{icon}" align="left">&nbsp;&nbsp;' +
                                '{name}</div>';
                            return tpl;
                        }
                    }
//                    ,displayTpl: function () {
//                        return '<img src="{icon}" align="left" height="16">&nbsp{name}';
//                    }
                }
            ]
        });

        var subPanel = Ext.create('Ext.panel.Panel', {
//            layout: 'fit',
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            flex: 1,
            border: false,
            items: [form, axisList]
        });

        this.items = [subPanel, chanList];
        this.callParent();

        this.setData = function (channels) {
            var chanData = [];
            for (var chCnt = 0; chCnt < channels.length; chCnt++) {
                chanData[chCnt] = {};
                chanData[chCnt].name = channels[chCnt].name;
                chanData[chCnt].axis = 1;

                var id = persistenceItemStore.findExact("name", channels[chCnt].name);
                if (id != -1) {
                    var rec = persistenceItemStore.getAt(id);
                    chanData[chCnt].label = rec.get("label");
                }
            }

            saveGraphStore.loadData(chanData);
        }
    },
    buttons: [
        {
            text: language.cancel,
            handler: function () {
                this.up('window').destroy();
            }
        },
        {
            text: language.save,
            handler: function () {
                if (this.up('form').getForm().isValid() == false) {
                    return;
                }
                var parms = {};
                parms.id = 'lr_dmCtrl';
                parms.control = 'saveGraph';
                parms.name = Ext.getCmp('graphName').getValue();
                parms.icon = Ext.getCmp('graphIcon').getValue();
                parms.ref = Ext.getCmp('graphRef').getValue();
                parms.period = Ext.getCmp('graphDuration').getValue() * 86400000;

                var data = saveGraphStore.getRange();
                for (var chCnt = 0; chCnt < data.length; chCnt++) {
                    parms["channel" + chCnt] = data[chCnt].get('id');
                    parms["axis" + chCnt] = data[chCnt].get('axis');

                    if (parms["axis" + chCnt] > 4 | parms["axis" + chCnt] < 1)
                        parms["axis" + chCnt] = 1;
                }

                Ext.Ajax.request({
                    url: HABminBaseURL + '/habmin/graph/',
                    params: parms,
                    method: 'PUT',
                    success: function (response, opts) {
                        var configGraph = Ext.decode(response.responseText);
//                                graphStore.loadData(configGraph);
                    }
                });

                this.up('window').destroy();
            }
        }
    ]

})
;

