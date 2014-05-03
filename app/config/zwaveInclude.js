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


Ext.define('openHAB.config.zwaveInclud', {
    extend: 'Ext.window.Window',
    closeAction: 'destroy',
    width: 750,
    resizable: false,
    draggable: false,
    modal: true,
    itemId: 'zwaveInclude',
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    chartId: null,
    initComponent: function () {
        this.title = language.zwave_IncludeTitle;

        var me = this;

        var deviceTypeStore = Ext.create('Ext.data.Store', {
            fields: ['name'],
            data: [
                {name: 'any', label: 'Any Device'},
                {name: 'controller', label: 'Controller'},
                {name: 'slave', label: 'Slave'}
            ]
        });

        var includeForm = Ext.create('Ext.form.Panel', {
            xtype: 'form',
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
                    xtype: 'combobox',
                    name: 'type',
                    fieldLabel: language.zwave_IncludeDeviceType,
                    store: deviceTypeStore,
                    allowBlank: false,
                    valueField: 'name',
                    displayField: 'label',
                    forceSelection: true,
                    editable: false,
                    queryMode: 'local'
                },
                {
                    xtype: 'checkboxfield',
                    name: 'power',
                    fieldLabel: language.zwave_IncludeHighPower
                }
            ]
        });

        this.items = [includeForm];//, chanList];
        this.callParent();
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
                if (me.chartForm.isValid() == false) {
                    return;
                }

                Ext.Ajax.request({
                    url: HABminBaseURL + '/zwave/action/binding/network/',
                    method: 'PUT',
                    jsonData: 'Include',
                    headers: {'Accept': 'application/json'},
                    success: function (response, opts) {
                    },
                    failure: function () {
                        handleStatusNotification(NOTIFICATION_ERROR, language.zwave_DevicesActionError);
                    }
                });
            }
        }
    ]
})
;

