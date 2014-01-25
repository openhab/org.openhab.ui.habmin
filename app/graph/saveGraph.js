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
    itemId: 'saveGraph',
//    layout: 'border',
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    initComponent: function () {
        var me = this;

        me.saveGraphAxisStore = Ext.create('Ext.data.Store', {
            fields: [
                {type: 'number', name: 'axis'},
                {type: 'string', name: 'label'},
                {type: 'string', name: 'format'},
                {type: 'string', name: 'minimum'},
                {type: 'string', name: 'maximum'},
                {type: 'string', name: 'position'}
            ],
            data: [
                {axis: 1, position: 'left'},
                {axis: 2, position: 'left'},
                {axis: 3, position: 'left'},
                {axis: 4, position: 'left'}
            ]
        });

        me.saveGraphStore = Ext.create('Ext.data.Store', {
            storeId: 'saveGraphStore',
            fields: [
                {type: 'string', name: 'item'},
                {type: 'string', name: 'label'},
                {type: 'string', name: 'chart'},
                {type: 'string', name: 'color'},
                {type: 'string', name: 'line'},
                {type: 'string', name: 'marker'},
                {type: 'number', name: 'axis'}
            ]
        });

        var formatStore = Ext.create('Ext.data.Store', {
            fields: ['format', 'label'],
            data: [
                {format: '%d', label: 'Integer'},
                {format: '%.1f', label: 'Float (0.0)'},
                {format: '%.2f', label: 'Float (0.00)'},
                {format: '%.3f', label: 'Float (0.000)'}
            ]
        });

        var positionStore = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            data: [
                {id: 'left', name: 'Left'},
                {id: 'right', name: 'Right'}
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

        var chanCellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
            clicksToEdit: 1
        });

        var chanList = Ext.create('Ext.grid.Panel', {
            store: me.saveGraphStore,
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
                            minWidth: 24,
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
                    dataIndex: 'item'
                },
                {
                    text: 'Label',
                    hideable: false,
                    flex: 4,
                    sortable: false,
                    dataIndex: 'label',
                    editor: {
                        allowBlank: true
                    }
                },
                {
                    text: 'Chart',
                    hideable: false,
                    flex: 2,
                    sortable: false,
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
                    sortable: false,
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
                    sortable: false,
                    dataIndex: 'line'
                },
                {
                    text: 'Markers',
                    hideable: false,
                    dataIndex: 'marker',
                    flex: 1,
                    sortable: false
                }
            ],
            layout: 'fit',
            viewConfig: {
                stripeRows: false,
                enableTextSelection: false,
                markDirty: false
            },
            plugins: [chanCellEditing]
        });

        var axisCellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
            clicksToEdit: 1
        });

        var axisList = Ext.create('Ext.grid.Panel', {
            store: me.saveGraphAxisStore,
            title: "Axis Configuration",
            flex: 3,
            border: true,
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
                    sortable: false,
                    dataIndex: 'axis',
                    renderer: function (v) {
                        var ref = axisStore.findExact("axis", v);
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
                    sortable: false,
                    dataIndex: 'label',
                    editor: {
                        allowBlank: true
                    }
                },
                {
                    text: 'Format',
                    hideable: false,
                    flex: 3,
                    sortable: false,
                    dataIndex: 'format',
                    editor: new Ext.form.field.ComboBox({
                        editable: false,
                        store: formatStore,
                        displayField: 'label',
                        valueField: 'format'
                    }),
                    renderer: function (v) {
                        var ref = formatStore.findExact("format", v);
                        if (ref == -1)
                            return "";
                        return formatStore.getAt(ref).get("label");
                    }
                },
                {
                    text: 'Minimum',
                    hideable: false,
                    flex: 2,
                    sortable: false,
                    dataIndex: 'minimum',
                    editor: {
                        maskRe: /[0-9.-]/,
                        allowBlank: true,
                        validator: function (val) {
                            if (isNaN(val)) {
                                return "Value must be a number";
                            }
                            return true;
                        }
                    }
                },
                {
                    text: 'Maximum',
                    hideable: false,
                    flex: 2,
                    sortable: false,
                    dataIndex: 'maximum',
                    editor: {
                        maskRe: /[0-9.-]/,
                        allowBlank: true,
                        validator: function (val) {
                            if (isNaN(val)) {
                                return "Value must be a number";
                            }
                            return true;
                        }
                    }
                },
                {
                    text: 'Position',
                    hideable: false,
                    flex: 2,
                    sortable: false,
                    dataIndex: 'position',
                    editor: new Ext.form.field.ComboBox({
                        editable: false,
                        store: positionStore,
                        displayField: 'name',
                        valueField: 'id'
                    }),
                    renderer: function (v) {
                        var ref = positionStore.findExact("id", v)
                        if (ref == -1)
                            return "";
                        return positionStore.getAt(ref).get("name");
                    }
                }
            ],
            layout: 'fit',
            viewConfig: {
                stripeRows: false,
                enableTextSelection: false,
                markDirty: false
            },
            plugins: [axisCellEditing]
        });

        me.chartForm = Ext.create('Ext.form.Panel', {
            //id: 'chartForm',
            xtype: 'form',
            //layout: 'form',
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
                    labelWidth: 40,
                    xtype: 'textfield',
                    name: 'name',
                    fieldLabel: 'Name',
                    maxLength: 50,
                    enforceMaxLength: true,
                    allowBlank: false
                },
                {
                    xtype: 'combobox',
                    name: 'duration',
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
                    name: 'icon',
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
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            flex: 1,
            border: false,
            items: [me.chartForm, axisList]
        });


        this.items = [subPanel, chanList];
        this.callParent();

        this.setData = function (channels) {
            var chanData = [];
            for (var chCnt = 0; chCnt < channels.length; chCnt++) {
                chanData[chCnt] = {};
                chanData[chCnt].item = channels[chCnt].name;
                chanData[chCnt].axis = 1;

                var id = persistenceItemStore.findExact("name", channels[chCnt].name);
                if (id != -1) {
                    var rec = persistenceItemStore.getAt(id);
                    chanData[chCnt].label = rec.get("label");
                }
            }

            me.saveGraphStore.loadData(chanData);
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
                var me = this.up('#saveGraph');

                if (me.chartForm.isValid() == false) {
                    return;
                }
                var chartCfg = {};

                // Get the top level configuration
                var formData = me.chartForm.getValues();
                chartCfg.name = formData.name;
                chartCfg.icon = formData.icon;
                chartCfg.period = formData.duration;

                // Get the item configuration
                chartCfg.items = [];
                var data = me.saveGraphStore.getRange();
                for (var chCnt = 0; chCnt < data.length; chCnt++) {
                    var newItem = {};

                    newItem.item = data[chCnt].get('item');
                    newItem.axis = data[chCnt].get('axis');
                    newItem.label = data[chCnt].get('label');
                    newItem.chart = data[chCnt].get('chart');
                    newItem.line = data[chCnt].get('line');
                    newItem.color = data[chCnt].get('color');
                    newItem.marker = data[chCnt].get('marker');

                    chartCfg.items.push(newItem);
                }

                // Get the axis configuration
                chartCfg.axis = [];
                var data = me.saveGraphAxisStore.getRange();
                for (var chCnt = 0; chCnt < data.length; chCnt++) {
                    var newAxis = {};

                    newAxis.axis = data[chCnt].get('axis');
                    newAxis.label = data[chCnt].get('label');
                    newAxis.format = data[chCnt].get('format');
                    newAxis.minimum = data[chCnt].get('minimum');
                    newAxis.maximum = data[chCnt].get('maximum');
                    newAxis.position = data[chCnt].get('position');

                    // Don't send to the server if there's no data
                    if(newAxis.label == "" && newAxis.format == "" && newAxis.minimum == "" && newAxis.maximum == "" && newAxis.position == "left")
                        continue;

                    chartCfg.axis.push(newAxis);
                }

                // If this is a new chart, use POST, otherwise PUT
                var ajaxMethod = "POST";
                var ajaxAddress = "";
                if(chartCfg.id != null && chartCfg.id != 0) {
                    ajaxMethod = "PUT";
                    ajaxAddress = "/" + chartCfg.name;
                }

                // Send to the server
                Ext.Ajax.request({
                    url: HABminBaseURL + '/persistence/charts' + ajaxAddress,
                    jsonData: chartCfg,
                    method: ajaxMethod,
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

