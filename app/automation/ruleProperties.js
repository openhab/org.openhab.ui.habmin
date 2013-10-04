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


Ext.define('openHAB.automation.ruleProperties', {
    extend:'Ext.panel.Panel',
    layout:'fit',
    tabTip:'Rule Properties',
    header:false,

    initComponent:function () {


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
            padding:5,
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
            padding:5,
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
                    padding:5
                },
                layout: 'column',
                items:[
                    {
                        xtype:'textfield',
                        fieldLabel:'Trigger Type',
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
                        padding:10,
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