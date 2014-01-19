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


Ext.define('openHAB.automation.ruleProperties', {
    extend:'Ext.panel.Panel',
    layout:'fit',
    tabTip:'Rule Properties',
    header:false,

    initComponent:function () {
        var ruleTriggerTypeArray = [
            {id: 0, label: 'Item command was received ...'},
            {id: 1, label: 'Item state was updated ...'},
            {id: 1, label: 'Item state changed from ...'},
            {id: 2, label: 'The openHAB system has ...'},
            {id: 3, label: 'The time is ...'},
            {id: 4, label: 'A periodic timer running ...'}
        ];

        var ruleTriggerParameterArray = [
            {type: 0, label: ''},
            {type: 1, label: ''},
            {type: 2, label: 'Started', value: 'started'},
            {type: 2, label: 'Shutdown', value: 'shutdown'},
            {type: 3, label: 'Midnight', value: 'midnight'},
            {type: 3, label: 'Midday', value: 'noon'},
            {type: 4, label: 'every day at midnight', value: 'cron ""'},
            {type: 4, label: 'every 5 seconds', value: 'cron "*/5 * * * * ?"'},
            {type: 4, label: 'every 10 seconds', value: 'cron "*/10 * * * * ?"'},
            {type: 4, label: 'every 15 seconds', value: 'cron "*/15 * * * * ?"'},
            {type: 4, label: 'every 20 seconds', value: 'cron "*/20 * * * * ?"'},
            {type: 4, label: 'every 30 seconds', value: 'cron "*/30 * * * * ?"'},
            {type: 4, label: 'every 1 minute', value: 'cron "0 * * * * ?"'},
            {type: 4, label: 'every 2 minutes', value: 'cron "0 */2 * * * ?"'},
            {type: 4, label: 'every 3 minutes', value: 'cron "0 */3 * * * ?"'},
            {type: 4, label: 'every 5 minutes', value: 'cron "0 */5 * * * ?"'},
            {type: 4, label: 'every 10 minutes', value: 'cron "0 */10 * * * ?"'},
            {type: 4, label: 'every 15 minutes', value: 'cron "0 */15 * * * ?"'},
            {type: 4, label: 'every 20 minutes', value: 'cron "0 */20 * * * ?"'},
            {type: 4, label: 'every 30 minutes', value: 'cron "0 */30 * * * ?"'},
            {type: 4, label: 'every 1 hour', value: 'cron "0 0 * * * ?"'},
            {type: 4, label: 'every 2 hours', value: 'cron "0 0 */2 * * ?"'},
            {type: 4, label: 'every 3 hours', value: 'cron "0 0 */3 * * ?"'},
            {type: 4, label: 'every 4 hours', value: 'cron "0 0 */4 * * ?"'},
            {type: 4, label: 'every 6 hours', value: 'cron "0 0 */6 * * ?"'},
            {type: 4, label: 'every 8 hours', value: 'cron "0 0 */8 * * ?"'},
            {type: 4, label: 'every 12 hours', value: 'cron "0 0 */12 * * ?"'},
            {type: 4, label: 'every day', value: 'cron "0 0 0 * * ?"'},
            {type: 4, label: 'every 2 days', value: 'cron "0 0 0 */2 * ?"'},
            {type: 4, label: 'every 3 days', value: 'cron "0 0 0 */3 * ?"'},
            {type: 4, label: 'every 4 days', value: 'cron "0 0 0 */4 * ?"'},
            {type: 4, label: 'every 5 days', value: 'cron "0 0 0 */5 * ?"'},
            {type: 4, label: 'every 7 days', value: 'cron "0 0 0 */7 * ?"'},
            {type: 4, label: 'every 10 days', value: 'cron "0 0 0 */10 * ?"'},
            {type: 4, label: 'every 1 month', value: 'cron "0 0 0 0 * ?"'}
        ];

        var ruleTriggerTypeStore = Ext.create('Ext.data.Store', {
            storeId:'ruleTriggerType',
            fields:[
                {type:'number', name:'id'},
                {type:'text', name:'label'}
            ]
        });
        ruleTriggerTypeStore.loadData(ruleTriggerTypeArray);

        var ruleForm = new Ext.form.Panel({
            border:false,
            bodyPadding:5,
            fieldDefaults:{
                labelWidth:100
            },
            defaultType:'textfield',
            items:[
                {
                    fieldLabel:'Rule Name',
                    name:'name',
                    anchor:'100%'
                },
                {
                    fieldLabel:'Description',
                    name:'description',
                    anchor:'100%'
                }
            ]
        });

        var ruleTrigger = Ext.create('Ext.panel.Panel', {
            padding:'0 5 5 5',
            title:'Trigger',
            collapsed:false,
            collapsible:true,
            layout:{
                type:'vbox',
                align:'stretch',
                pack:'start'
            },
            minHeight:100
        });

        var ruleAction = Ext.create('Ext.panel.Panel', {
            padding:'0 5 5 5',
            title:'Action',
            collapsed:false,
            collapsible:true,
            layout:{
                type:'vbox',
                align:'stretch',
                pack:'start'
            },
            minHeight:100
        });

        var ruleContainer = Ext.create('Ext.panel.Panel', {
            layout:{
                type:'vbox',
                align:'stretch',
                pack:'start'
            },
            items:[
                ruleForm,
                ruleTrigger,
                ruleAction
            ]
        });

        addTrigger();


        this.items = [ruleContainer];
        this.callParent();

        function addTrigger() {

            var trigger = Ext.create('Ext.form.Panel', {
                xtype:'form',
                border:false,
                fieldDefaults:{
                    labelAlign:'top',
                    msgTarget:'side'
                },
                defaults:{
                    border:false,
                    xtype:'panel',
                    padding:10
                },
                layout: 'column',
                items:[
                    {
                        xtype:'combobox',
                        fieldLabel:'Trigger Type',
                        store:ruleTriggerTypeStore,
                        valueField: 'id',
                        displayField: 'label',
                        queryMode: 'local',
                        name:'type',
                        columnWidth: 0.4
                    },
                    {
                        xtype:'textfield',
                        fieldLabel:'Parameter',
                        name:'Parameter',
                        columnWidth: 0.6
                    },
                    {
                        width:100,
                        items: [
                            {
                                xtype:'button',
                                icon:'images/minus-button.png',
                                text:'Delete',
                                width:80,
                                listeners:{
                                    scope: this,
                                    click:function (btn, e, eOpts) {
                                        var x = btn.up("form");
                                        ruleTrigger.remove(x);
                                    }
                                }
                            },
                            {
                                xtype:'button',
                                icon:'images/plus-button.png',
                                text:'Add',
                                width:80,
                                listeners:{
                                    scope: this,
                                    click:function (btn, e, eOpts) {
                                        addTrigger();
                                    }
                                }
                            }
                        ]
                    }
                ]
            });
            ruleTrigger.add(trigger);
        }
    }
})
;