/**
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


Ext.define('openHAB.graph.saveGraph', {
    extend:'Ext.panel.Panel',
    layout:'fit',
    initComponent:function () {

        var saveWin;


        Ext.define('Icons', {
            extend:'Ext.data.Model',
            fields:[
                {type:'number', name:'id'},
                {type:'string', name:'icon'},
                {type:'string', name:'name'}
            ]
        });

        var chanData = [];
        for (var chCnt = 0; chCnt < channels.length; chCnt++) {
            var dev = getDMDevice(channels[chCnt].value);
            if (dev != null) {
                chanData[chCnt] = {};
                chanData[chCnt].id = channels[chCnt].value;
                chanData[chCnt].name = dev.Name;
                chanData[chCnt].axis = channels[chCnt].axis;
            }
        }

        var saveGraphStore = Ext.create('Ext.data.Store', {
            storeId:'saveGraphStore',
            fields:[
                {type:'number', name:'id'},
                {type:'string', name:'name'},
                {type:'number', name:'axis'}
            ],
            data:chanData
        });
        var cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
            clicksToEdit:1
        });
        var chanList = Ext.create('Ext.grid.Panel', {
            id:'saveChanGrid',
            store:saveGraphStore,
            selType:'cellmodel',
            hideHeaders:false,
            header:false,
            disableSelection:true,
            height:195,
//        stateful:true,
//        stateId:'stateGrid',
            columns:[
                {
                    text:'Id',
                    hidden:true,
                    dataIndex:'id'
                },
                {
                    text:'Name',
                    hideable:false,
                    flex:8,
                    sortable:true,
                    dataIndex:'name'
                },
                {
                    text:'Axis',
                    hideable:false,
                    flex:1,
                    sortable:true,
                    dataIndex:'axis',
                    field:{
                        xtype:'numberfield',
                        allowBlank:false,
                        minValue:1,
                        maxValue:4
                    }
                }
            ],
            layout:'fit',
            title:'Channels',
            viewConfig:{
                stripeRows:false,
                enableTextSelection:false,
                markDirty:false
            },
            plugins:[cellEditing]
        });

        var yesnoStore = Ext.create('Ext.data.Store', {
            fields:['id', 'name'],
            data:[
                {id:1, name:'Yes'},
                {id:0, name:'No'}
            ]
        });

        var form = Ext.widget('form', {
            layout:{
                type:'vbox',
                align:'stretch'
            },
            border:false,
            bodyPadding:10,
            fieldDefaults:{
                labelAlign:'top',
                labelWidth:100,
                labelStyle:'font-weight:bold'
            },
            items:[
                {
                    xtype:'textfield',
                    id:'graphName',
                    fieldLabel:'Graph Name',
                    allowBlank:false,
                    maxLength:50,
                    enforceMaxLength:true,
                    afterLabelTextTpl:'<span style="color:red;font-weight:bold" data-qtip="Required.">*</span>',
//                    vtype:'name',
                    allowBlank:false
                },
                {
                    border:false,
                    layout:'column',
                    items:[
                        {
                            columnWidth:0.5,
                            margin:'0 10 0 0',
                            xtype:'textfield',
                            id:'graphRef',
                            fieldLabel:'Quickview reference',
                            maxLength:15,
                            enforceMaxLength:true,
                            afterLabelTextTpl:'<span data-qtip="Used to reference the graph directly through /dm/graph.html?ref=<i>reference</i>."><img src="images/question.png"></span>',
                            allowBlank:true
                        },
                        {
                            columnWidth:0.5,
                            margin:'0 0 0 10',
                            xtype:'textfield',
                            id:'graphDuration',
                            fieldLabel:'Duration (days)',
                            maxLength:5,
                            enforceMaxLength:true,
                            maskRe:/([0-9]+)/,
                            regex:/[0-9]/,
                            allowBlank:false
                        }
                    ]
                },
                {
                    border:false,
                    layout:'column',
                    items:[
                        {
                            columnWidth:0.33,
                            margin:'0 5 0 0',
                            xtype:'combobox',
                            fieldLabel:'Icon',
                            id:'graphIcon',
                            name:'graphIcon',
                            store:{model:'Icons', data:dataTypeArray},
                            allowBlank:false,
                            value:0,
                            valueField:'id',
                            displayField:'name',
                            queryMode:'local',
                            forceSelection:true,
                            editable:false,
                            typeAhead:false,
                            queryMode:'local',
                            listConfig:{
                                getInnerTpl:function () {
                                    var tpl = '<div>' +
                                        '<img src="images/{icon}" align="left">&nbsp;&nbsp;' +
                                        '{name}</div>';
                                    return tpl;
                                }
                            }
                        }
                    ]
                }
            ],
            buttons:[
                {
                    text:'Cancel',
                    handler:function () {
                        this.up('window').destroy();
                    }
                },
                {
                    text:'Save',
                    handler:function () {
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
                            url:veraServer + '/data_request',
                            params:parms,
                            method:'GET',
                            success:function (response, opts) {
                                configGraph = Ext.decode(response.responseText);
                                graphStore.loadData(configGraph);
                            }
                        });

                        this.up('window').destroy();
                    }
                }
            ]
        });

        saveWin = Ext.widget('window', {
            title:'Save Graph',
            closeAction:'destroy',
            width:475,
            height:430,
            layout:'fit',
            resizable:false,
            draggable:false,
            modal:true,
            layout:{
                type:'vbox',
                align:'stretch'
            },
            items:[chanList, form]
        });

        saveWin.show();

        if (options != null) {
            if (options.Name != null)
                Ext.getCmp('graphName').setValue(options.Name);

            if (options.Icon != null)
                Ext.getCmp('graphIcon').setValue(options.Icon);

            if (options.Period != null)
                Ext.getCmp('graphDuration').setValue(options.Period / 86400000);

            if (options.Reference != null)
                Ext.getCmp('graphRef').setValue(options.Reference);
        }

        this.items = itemsTree;

        this.callParent();
    }
})
;