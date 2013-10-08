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


Ext.define('openHAB.config.itemRules', {
    extend:'Ext.panel.Panel',
    defaults:{
        split:true
    },
    border:false,
    layout:'border',
    icon:'images/node-design.png',
    title:'Rules',

    initComponent:function () {

        var toolbar = Ext.create('Ext.toolbar.Toolbar', {
            items:[
                {
                    icon:'images/plus-button.png',
                    itemId:'add',
                    text:'Add Rule',
                    cls:'x-btn-icon',
                    disabled:true,
                    tooltip:'Add the rule to this item',
                    handler:function () {
//                        createRule();
                    }
                },
                {
                    icon:'images/minus-button.png',
                    itemId:'delete',
                    text:'Delete Rule',
                    cls:'x-btn-icon',
                    disabled:true,
                    tooltip:'Remove the rule from this item',
                    handler:function () {
//                        createRule();
                    }
                }
            ]
        });

        var listRules = Ext.create('Ext.grid.Panel', {
            store:ruleTemplateStore,
            region:"center",
            flex:1,
            header:false,
            split:true,
            tbar:toolbar,
            collapsible:false,
            multiSelect:false,
            columns:[
                {
                    text:'Name',
                    flex:2,
                    dataIndex:'name'
                },
                {
                    text:'Item',
                    flex:2,
                    dataIndex:'item'
                },
                {
                    text:'Description',
                    flex:4,
                    dataIndex:'description'
                }
            ]
        });

        this.items = [listRules];

        this.callParent();


        // Save a rule - ask for the variables etc
        function createRule() {


            var formPanel = new Ext.form.Panel({
                frame:false,
                width:340,
                bodyPadding:5,
                fieldDefaults:{
                    labelAlign:'right',
                    labelWidth:85,
                    msgTarget:'side'
                },
                defaults:{
                    width:280
                },
                items:[
                    {
                        fieldLabel:'First Name',
                        emptyText:'First Name',
                        name:'first'
                    },
                    {
                        fieldLabel:'Last Name',
                        emptyText:'Last Name',
                        name:'last'
                    },
                    {
                        fieldLabel:'Company',
                        name:'company'
                    },
                    {
                        fieldLabel:'Email',
                        name:'email',
                        vtype:'email'
                    },
                    {
                        xtype:'combobox',
                        fieldLabel:'State',
                        name:'state',
                        valueField:'abbr',
                        displayField:'state',
                        typeAhead:true,
                        queryMode:'local',
                        emptyText:'Select a state...'
                    },
                    {
                        xtype:'datefield',
                        fieldLabel:'Date of Birth',
                        name:'dob',
                        allowBlank:false,
                        maxValue:new Date()
                    }
                ],

                buttons:[
                    {
                        text:'Load',
                        handler:function () {
                            formPanel.getForm().load({
                                url:'xml-form-data.xml',
                                waitMsg:'Loading...'
                            });
                        }
                    },
                    {
                        text:'Submit',
                        disabled:true,
                        formBind:true,
                        handler:function () {
                            this.up('form').getForm().submit({
                                url:'xml-form-errors.xml',
                                submitEmptyText:false,
                                waitMsg:'Saving Data...'
                            });
                        }
                    }
                ]
            });

            var saveWin = Ext.widget('window', {
                title:'Save Graph',
                closeAction:'destroy',
                layout:'fit',
                resizable:false,
                draggable:false,
                modal:true,
                layout:{
                    type:'vbox',
                    align:'stretch'
                },
                items:[formPanel]
            });
            saveWin.show();

        }


    }
})
;