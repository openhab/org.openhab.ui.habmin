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
    closeAction: 'destroy',
    width: 750,
    resizable: false,
    draggable: false,
    modal: true,
    itemId: 'saveGraph',
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    chartId: null,
    initComponent: function () {
        this.title = language.graph_SaveGraphTitle;

        var me = this;

        me.saveGraphAxisStore = Ext.create('Ext.data.Store', {
            fields: [
                {type: 'number', name: 'axis'},
                {type: 'string', name: 'label'},
                {type: 'string', name: 'format'},
                {type: 'string', name: 'color'},
                {type: 'string', name: 'minimum'},
                {type: 'string', name: 'maximum'},
                {type: 'string', name: 'position'}
            ]
        });

        me.saveGraphStore = Ext.create('Ext.data.Store', {
            storeId: 'saveGraphStore',
            fields: [
                {type: 'string', name: 'item'},
                {type: 'number', name: 'axis'},
                {type: 'string', name: 'label'},
                {type: 'string', name: 'chart'},
                {type: 'string', name: 'legend'},
                {type: 'string', name: 'lineColor'},
                {type: 'number', name: 'lineWidth'},
                {type: 'string', name: 'lineStyle'},
                {type: 'string', name: 'markerColor'},
                {type: 'string', name: 'markerSymbol'}
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
                {id: 'line', name: language.graph_SaveGraphLine},
                {id: 'spline', name: language.graph_SaveGraphSpline},
                {id: 'bar', name: language.graph_SaveGraphBar},
                {id: 'area', name: language.graph_SaveGraphArea},
                {id: 'areaspline', name: language.graph_SaveGraphAreaSpline},
                {id: 'column', name: language.graph_SaveGraphColumn}
            ]
        });

        var lineStore = Ext.create('Ext.data.Store', {
            fields: ['icon', 'name'],
            data: [
                {icon: 'None', name: 'None'},
                {icon: 'Solid', name: 'Solid'},
                {icon: 'ShortDash', name: 'ShortDash'},
                {icon: 'ShortDot', name: 'ShortDot'},
                {icon: 'ShortDashDot', name: 'ShortDashDot'},
                {icon: 'Dot', name: 'Dot'},
                {icon: 'ShortDashDot', name: 'ShortDashDot'},
                {icon: 'Dash', name: 'Dash'},
                {icon: 'LongDash', name: 'LongDash'},
                {icon: 'DashDot', name: 'DashDot'},
                {icon: 'LongDashDot', name: 'LongDashDot'},
                {icon: 'LongDashDotDot', name: 'LongDashDotDot'}
            ]
        });

        var symbolStore = Ext.create('Ext.data.Store', {
            fields: ['icon', 'name'],
            data: [
                {icon: 'none.png', name: 'none'},
                {icon: 'square.png', name: 'square'},
                {icon: 'diamond.png', name: 'diamond'},
                {icon: 'triangle.png', name: 'triangle'},
                {icon: 'triangle-down.png', name: 'triangle-down'}
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
            fields: ['period', 'name'],
            autoLoad: true,
            data: [
                {period: '3600', name: language.graph_SaveGraphPeriod1Hour},
                {period: '7200', name: language.graph_SaveGraphPeriod2Hours},
                {period: '10800', name: language.graph_SaveGraphPeriod3Hours},
                {period: '14400', name: language.graph_SaveGraphPeriod4Hours},
                {period: '21600', name: language.graph_SaveGraphPeriod6Hours},
                {period: '43200', name: language.graph_SaveGraphPeriod12Hours},
                {period: '86400', name: language.graph_SaveGraphPeriod1Day},
                {period: '172800', name: language.graph_SaveGraphPeriod2Days},
                {period: '259200', name: language.graph_SaveGraphPeriod3Days},
                {period: '345600', name: language.graph_SaveGraphPeriod4Days},
                {period: '432000', name: language.graph_SaveGraphPeriod5Days},
                {period: '864000', name: language.graph_SaveGraphPeriod10Days},
                {period: '604800', name: language.graph_SaveGraphPeriod1Week},
                {period: '1209600', name: language.graph_SaveGraphPeriod2Weeks}
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

        var enableStore = Ext.create('Ext.data.Store', {
            fields: ['name', 'icon'],
            data: [
                {name: 'true', icon: 'images/tick.png'},
                {name: 'false', icon: 'images/cross.png'}
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
            title: language.graph_SaveGraphItemConfig,
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
                    text: language.graph_SaveGraphItemAxis,
                    hideable: false,
                    width: 32,
                    sortable: false,
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
                    text: language.graph_SaveGraphItemItem,
                    hideable: false,
                    flex: 3,
                    sortable: false,
                    dataIndex: 'item',
                    editor: new Ext.form.field.ComboBox({
                        editable: false,
                        store: itemConfigStore,
                        displayField: 'name',
                        valueField: 'name'
                    })
                },
                {
                    text: language.graph_SaveGraphItemLabel,
                    hideable: false,
                    flex: 3,
                    sortable: false,
                    dataIndex: 'label',
                    editor: {
                        allowBlank: true
                    }
                },
                {
                    text: language.graph_SaveGraphItemChart,
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
                    text: language.graph_SaveGraphItemLegend,
                    hideable: false,
                    flex: 1,
                    sortable: false,
                    dataIndex: 'legend',
                    editor: new Ext.form.field.ComboBox({
                        editable: false,
                        store: enableStore,
                        displayField: 'icon',
                        valueField: 'name',
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
                        var ref = enableStore.findExact("name", v)
                        if (ref == -1)
                            return "";
                        var icon = enableStore.getAt(ref).get("icon");
                        return '<img src="' + icon + '" align="left" height="16">';
                    }
                },
                {
                    text: language.graph_SaveGraphItemLine,
                    height: 40,
                    sortable: false,
                    flex: 4.5,
                    hideable: false,
                    columns: [
                        {
                            text: language.graph_SaveGraphItemLineColor,
                            hideable: false,
                            flex: 1,
                            sortable: false,
                            dataIndex: 'lineColor',
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
                            text: language.graph_SaveGraphItemLineWidth,
                            hideable: false,
                            flex: 1.5,
                            sortable: false,
                            dataIndex: 'lineWidth',
                            editor: {
                                xtype: 'numberfield',
                                minValue: 0,
                                maxValue: 12,
                                allowDecimals: false,
                                keyNavEnabled: false,
                                mouseWheelEnabled: false
                            }
                        },
                        {
                            text: language.graph_SaveGraphItemLineStyle,
                            hideable: false,
                            dataIndex: 'lineStyle',
                            flex: 1.5,
                            sortable: false,
                            editor: new Ext.form.field.ComboBox({
                                editable: false,
                                store: lineStore,
                                displayField: 'name',
                                valueField: 'name'
                            }),
                            renderer: function (v) {
                                var ref = lineStore.findExact("name", v)
                                if (ref == -1)
                                    return "";
                                return lineStore.getAt(ref).get("name");
                            }
                        }
                    ]
                },
                {
                    text: language.graph_SaveGraphItemMarker,
                    height: 40,
                    hideable: false,
                    flex: 3,
                    sortable: false,
                    columns: [
                        {
                            text: language.graph_SaveGraphItemMarkerColor,
                            hideable: false,
                            flex: 1.5,
                            sortable: false,
                            dataIndex: 'markerColor',
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
                            text: language.graph_SaveGraphItemMarkerSymbol,
                            hideable: false,
                            dataIndex: 'markerSymbol',
                            flex: 1.5,
                            sortable: false,
                            editor: new Ext.form.field.ComboBox({
                                editable: false,
                                store: symbolStore,
                                displayField: 'name',
                                valueField: 'name'
                            }),
                            renderer: function (v) {
                                var ref = symbolStore.findExact("name", v)
                                if (ref == -1)
                                    return "";
                                return symbolStore.getAt(ref).get("name");
                            }
                        }
                    ]
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
            title: language.graph_SaveGraphAxisConfig,
            flex: 3,
            border: true,
            selType: 'cellmodel',
            hideHeaders: false,
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
                    text: language.graph_SaveGraphAxisAxis,
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
                    text: language.graph_SaveGraphAxisTitle,
                    hideable: false,
                    flex: 6,
                    sortable: false,
                    dataIndex: 'label',
                    editor: {
                        allowBlank: true
                    }
                },
                {
                    text: language.graph_SaveGraphAxisFormat,
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
                    text: language.graph_SaveGraphAxisColor,
                    hideable: false,
                    flex: 1,
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
                    text: language.graph_SaveGraphAxisMinimum,
                    hideable: false,
                    flex: 2,
                    sortable: false,
                    dataIndex: 'minimum',
                    editor: {
                        maskRe: /[0-9.-]/,
                        allowBlank: true,
                        validator: function (val) {
                            if (isNaN(val)) {
                                return language.graph_SaveGraphAxisNumberError;
                            }
                            return true;
                        }
                    }
                },
                {
                    text: language.graph_SaveGraphAxisMaximum,
                    hideable: false,
                    flex: 2,
                    sortable: false,
                    dataIndex: 'maximum',
                    editor: {
                        maskRe: /[0-9.-]/,
                        allowBlank: true,
                        validator: function (val) {
                            if (isNaN(val)) {
                                return language.graph_SaveGraphAxisNumberError;
                            }
                            return true;
                        }
                    }
                },
                {
                    text: language.graph_SaveGraphAxisPosition,
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
            xtype: 'form',
            flex: 2,
            header: {
                height: 18,
                padding: 1,
                titleAlign: "center"
            },
            cls: 'save-chart-form',
            title: language.graph_SaveGraphChartConfig,
            border: true,
            bodyPadding: 10,
            fieldDefaults: {
                labelAlign: 'left',
                labelWidth: 60,
                labelStyle: 'font-weight:bold',
                anchor: '100%'
            },
            items: [
                {
                    xtype: 'textfield',
                    name: 'name',
                    fieldLabel: language.graph_SaveGraphName,
                    maxLength: 50,
                    enforceMaxLength: true,
                    allowBlank: false
                },
                {
                    xtype: 'combobox',
                    name: 'period',
                    fieldLabel: language.graph_SaveGraphPeriod,
                    allowBlank: false,
                    valueField: 'period',
                    displayField: 'name',
                    queryMode: 'local',
                    editable: false,
                    store: periodStore
                },
                {
                    xtype: 'combobox',
                    fieldLabel: language.graph_SaveGraphIcon,
                    name: 'icon',
                    store: itemIconStore,
                    allowBlank: false,
                    valueField: 'name',
                    displayField: 'label',
                    forceSelection: true,
                    editable: false,
                    queryMode: 'local',
                    listConfig: {
                        getInnerTpl: function () {
                            var tpl = '<div>' +
                                '<img src="../images/{menuicon}" align="left" height="16">&nbsp;&nbsp;' +
                                '{label}</div>';
                            return tpl;
                        }
                    }
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

        /**
         * Set the chart data to be edited.
         * @param chartCfg
         */
        this.setData = function (chartCfg) {
            // Sanity check
            if (chartCfg == null || chartCfg.items == null || chartCfg.items.length == 0)
                return;

            // Set defaults
            for (var cnt = 0; cnt < chartCfg.items.length; cnt++) {
                if (chartCfg.items[cnt].legend == null)
                    chartCfg.items[cnt].legend = 'true';
            }

            // Load the form
            var form = me.chartForm.getForm();
            if (form != null)
                form.setValues(chartCfg);

            this.chartId = chartCfg.id;

            var axisData = [
                {axis: 1, position: 'left'},
                {axis: 2, position: 'left'},
                {axis: 3, position: 'left'},
                {axis: 4, position: 'left'}
            ];

            if (chartCfg.axis != null) {
                chartCfg.axis = [].concat(chartCfg.axis);
                for (var i = 0; i < chartCfg.axis.length; i++) {
                    axisData[chartCfg.axis[i].axis - 1] = chartCfg.axis[i];
                }
            }
            me.saveGraphAxisStore.loadData(axisData);

            if (chartCfg.items != null) {
                chartCfg.items = [].concat(chartCfg.items);
                me.saveGraphStore.loadData(chartCfg.items);
            }
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
                chartCfg.period = formData.period;

                // Get the item configuration
                chartCfg.items = [];
                var data = me.saveGraphStore.getRange();
                for (var chCnt = 0; chCnt < data.length; chCnt++) {
                    var newItem = {};

                    newItem.item = data[chCnt].get('item');
                    newItem.axis = data[chCnt].get('axis');
                    newItem.label = data[chCnt].get('label');
                    newItem.chart = data[chCnt].get('chart');
                    newItem.legend = data[chCnt].get('legend');
                    newItem.lineWidth = data[chCnt].get('lineWidth');
                    newItem.lineStyle = data[chCnt].get('lineStyle');
                    newItem.lineColor = data[chCnt].get('lineColor');
                    newItem.markerColor = data[chCnt].get('markerColor');
                    newItem.markerSymbol = data[chCnt].get('markerSymbol');

                    chartCfg.items.push(newItem);
                }

                // Get the axis configuration
                chartCfg.axis = [];
                var data = me.saveGraphAxisStore.getRange();
                for (var chCnt = 0; chCnt < data.length; chCnt++) {
                    var newAxis = {};

                    newAxis.axis = data[chCnt].get('axis');
                    newAxis.label = data[chCnt].get('label');
                    newAxis.color = data[chCnt].get('color');
                    newAxis.format = data[chCnt].get('format');
                    newAxis.minimum = data[chCnt].get('minimum');
                    newAxis.maximum = data[chCnt].get('maximum');
                    newAxis.position = data[chCnt].get('position');

                    // Don't send to the server if there's no data
                    if (newAxis.label == "" && newAxis.format == "" && newAxis.minimum == "" && newAxis.maximum == "" && newAxis.position == "left")
                        continue;

                    chartCfg.axis.push(newAxis);
                }

                chartCfg.id = me.chartId;

                // If this is a new chart, use POST, otherwise PUT
                var ajaxMethod = "POST";
                var ajaxAddress = "";
                if (chartCfg.id != null && chartCfg.id != 0) {
                    ajaxMethod = "PUT";
                    ajaxAddress = "/" + chartCfg.id;
                }

                // Send to the server
                Ext.Ajax.request({
                    url: HABminBaseURL + '/persistence/charts' + ajaxAddress,
                    jsonData: chartCfg,
                    method: ajaxMethod,
                    success: function (response, opts) {
                        handleStatusNotification(NOTIFICATION_OK, sprintf(language.graph_SaveGraphSuccess, chartCfg.name));
                        var configGraph = Ext.decode(response.responseText);
                    },
                    failure: function (response, opts) {
                        handleStatusNotification(NOTIFICATION_ERROR, sprintf(language.graph_SaveGraphError, chartCfg.name));
                    },
                    callback: function () {
                        // Reload the store
                        chartStore.reload();
                    }
                });

                this.up('window').destroy();
            }
        }
    ]
})
;

