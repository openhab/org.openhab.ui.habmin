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

var force_transport = 'auto';

Ext.Loader.setConfig({
    enabled:true,
    disableCaching:false, // For debug only
    'paths':{
        'Ext.ux':'js/extux',
        'Ext.ux.grid.property':'js/extux/propertygrid',
        'openHAB':'app'
    }
});

Ext.require([
    'Ext.tab.*',
    'Ext.grid.*',
    'Ext.data.*',
    'Ext.util.*',
    'Ext.form.*',
    'Ext.tree.Panel',
    'Ext.container.Viewport',
    'Ext.selection.CellModel',
    'Ext.layout.container.Border',
    'Ext.layout.container.Accordion',
    'Ext.ux.statusbar.StatusBar',
    'openHAB.graph.graph',
    'openHAB.graph.saveGraph',
    'openHAB.graph.itemList',
    'openHAB.graph.graphList',
    'openHAB.graph.graphTable',
    'openHAB.graph.graphHighcharts',
    'openHAB.config.config',
    'openHAB.config.bindingList',
    'openHAB.config.bindingProperties',
    'openHAB.config.groupProperties',
    'openHAB.config.itemBindings',
    'openHAB.config.itemList',
    'openHAB.config.itemProperties',
    'openHAB.config.mappingList',
    'openHAB.config.mappingProperties',
    'openHAB.config.sitemapList',
    'openHAB.config.zwaveDeviceList',
    'openHAB.config.zwaveNetwork',
    'openHAB.config.sitemapProperties',
    'openHAB.system.system',
    'openHAB.system.logViewer',
    'openHAB.system.systemBundles',
    'openHAB.automation.automation',
    'openHAB.automation.notificationList',
    'openHAB.automation.ruleList'
]);

var viewPort;
var statusTooltip;

// Global data stores from openHAB
var itemStore;
var sitemapStore;
var bindingStore;

var iconTypeArray = [
    {'id':0, 'icon':'../images/bluetooth.png', 'name':'Bluetooth'},
    {'id':1, 'icon':'../images/heating.png', 'name':'Heating'},
    {'id':2, 'icon':'../images/lock.png', 'name':'Lock'},
    {'id':3, 'icon':'../images/temperature.png', 'name':'Temperature'},
    {'id':4, 'icon':'../images/switch.png', 'name':'Switch'}
];


var initState = 0;
var initList = [
    {type:0, name:"openHAB Version", variable:"openHABVersion", url:"/static/version", fatal:true, notify:"Unable to get openHAB version"}//,
//    {type:1, name:"openHAB Version", variable:"openHABItems", url:"/rest/items", fatal:true, notify:"Unable to get openHAB items"}
];


Ext.application({
    name:'HABmin',
    launch:function () {
        initState = 0;
        loadNextConfig();
    }
});

function loadNextConfig() {
    Ext.Ajax.request({
        url:initList[initState].url,
        headers:{'Accept':'application/json'},

        success:function (response, opts) {
            if (response.responseText == "No handler") {
                loadError(initList[initState].notify);
                return;
            }

            if (initList[initState].type == 0) {
                openHABVersion = response.responseText;
                Ext.fly('openHABVersion').update(openHABVersion, false);
//              Ext.fly('guiVersion').update(guiVersion, false);
            }
            else
                window[initList[initState].variable] = Ext.decode(response.responseText);


            initState++;

            if (initState < initList.length) {
                loadNextConfig();
                return;
            }

            // All configs loaded
            createUI();
        },
        failure:function (response, opts) {
            if (initList[initState].fatal == true) {
                loadError(initList[initState].notify);
                return;
            }

            // Error was non-fatal. Ignore and continue
            initState++;

            if (initState < initList.length) {
                loadNextConfig();
                return;
            }

            // All configs loaded
            createUI();
        }
    });
}
function loadError(errorText) {
}

function handleOnlineStatus(newStatus) {
    if (newStatus == 0) {
        Ext.get('statusicon').dom.src = 'images/status.png';
        statusTooltip.update("openHAB is online")
    }
    else if (newStatus == 1) {
        Ext.get('statusicon').dom.src = 'images/status-busy.png';
        statusTooltip.update("openHAB is busy")
    }
    else if (newStatus == 2) {
        Ext.get('statusicon').dom.src = 'images/status-offline.png';
        statusTooltip.update("openHAB is offline")
    }
}


var detectedTransport = null;
var socket = $.atmosphere;
var fallbackProtocol = null;

function subscribe(location) {
    var request = { url:location,
        maxRequest:256,
        timeout:59000,
        attachHeadersAsQueryString:true,
        executeCallbackBeforeReconnect:false,
        //transport: 'long-polling',
        transport:force_transport,
        fallbackTransport:fallbackProtocol,
        headers:{'Accept':'application/json'}};

    request.onError = function (response) {
        console.log('------ ERROR -------');
        handleOnlineStatus(2);
        console.log(response);
    }
    request.onOpen = function (response) {
        console.log('-------- OPEN --------');
        console.log(response);
        handleOnlineStatus(1);
        detectedTransport = response.transport;
    }

    request.onMessage = function (response) {

        if (response.status == 200) {
            handleOnlineStatus(0);
            var data = response.responseBody;
            if (data.length > 0) {
                try {
                    console.log('-------- INPUT --------');
                    console.log(response);
                    //            updateWidgets(Ext.JSON.decode(data));
                } catch (e) {
                }
            }
        }
    };

    socket.subscribe(request);
}

function unsubscribe() {
    socket.unsubscribe();
}

function loadUIData(sitemap_name) {
    Ext.Ajax.request({
        url:'/rest/sitemaps/' + sitemap_name,
        headers:{
            'Accept':'application/json'
        }, success:function (result_obj) {
            try {
                result = Ext.JSON.decode(result_obj.responseText);
            } catch (error) {
                loadUIData(sitemap_name);
                return;
            }
            //try {
            buildUIArray(result.homepage, UInavPanel);
            clearEmptyFrames();

            Ext.getCmp('content').unmask();
            broadCrumb[0] = new Array(result.homepage.id, result.homepage.title);
            Ext.getCmp('title').setHtml(result.homepage.title);
            //console.log(UInavPanel);

            goToPage(result.homepage.id);


            if (Ext.getCmp('leftPanel')) {
                leftPanelstore.setRoot(UInavPanel);
                setCurrentLeftNavPage(result.homepage.id);
            }


            //} catch (error) {
            Ext.getCmp('content').unmask();
            // alert(OpenHAB.i18n_strings[ui_language].error_build_interface + "\r\n(" + error + ")");
            //}

        }, failure:function () {
            alert("OpenHAB.i18n_strings[ui_language].error_server_connection");
        }
    });
}

function loadSitemapList() {
    Ext.Ajax.request({
        url:'/rest/sitemaps/',
        headers:{
            'Accept':'application/json'
        }, success:function (result_obj) {
            var result = Ext.JSON.decode(result_obj.responseText);

            if (result == null)
                return;

            openHABSitemaps = result.sitemap;
            sitemapStore.loadData(openHABSitemaps);
        }, failure:function () {
            Ext.MessageBox.alert('Error', 'Error downloading sitemap data.');
        }
    });
}

function getIconByValue(value) {
    var numIcons = iconTypeArray.length;
    for (var iIcon = 0; iIcon < numIcons; ++iIcon) {
        if (iconTypeArray[iIcon].id == value) {
            return iconTypeArray[iIcon];
        }
    }

    return null;
}

// Return an icon based on the ItemType
function getItemTypeIcon(type) {
    if (type == "GroupItem")
        return "images/category-group.png";
    if (type == "SwitchItem")
        return "images/switch.png";
    if (type == "NumberItem")
        return "images/counter.png";
    if (type == "ColorItem")
        return "images/color.png";
    if (type == "ContactItem")
        return "images/door-open.png";
    if (type == "DateTimeItem")
        return "images/clock.png";
    if (type == "DimmerItem")
        return "images/ui-slider.png";
    if (type == "RollerShutterItem")
        return "images/curtain.png";
    if (type == "StringItem")
        return "images/edit.png";
}

var iterationCnt = 0;

function makeItemGroupTree(parent, group) {
    return;
    // Keep track of the number of iterations
    iterationCnt++;
    if (iterationCnt == 8)
        return;

    // Loop through the configuration
    openHABItems = itemStore.getProxy().getReader().getResponseData();
    var numItems = openHABItems.item.length;
    for (var iItem = 0; iItem < numItems; ++iItem) {
        var newItem = [];
        var newItemPnt;

        // Ensure the groups is an array!
        var itemGroups = [].concat(openHABItems.item[iItem].groups);

        // Check if the item is in the required group
        if (itemGroups.indexOf(group) == -1) {
            continue;
        }

        // Create the new item
        newItem.Parent = openHABItems.item[iItem].name;
        newItem.State = openHABItems.item[iItem].state;
        newItem.Type = openHABItems.item[iItem].type;
        newItem.iconCls = 'node-device';
        newItem.children = [];

        // Check if this is a group
        if (openHABItems.item[iItem].type == "GroupItem") {
            makeItemGroupTree(newItem.children, newItem.Parent)
        }

        parent.push(newItem);
    }
    iterationCnt--;
}

function createUI() {
    delete Ext.tip.Tip.prototype.minWidth;

    Ext.define('ItemsModel', {
        extend:'Ext.data.Model',
        fields:[
            {name:'name'},
            {name:'state'},
            {name:'type'},
            {name:'link'},
            {name:'binding'},
            {name:'groups'}
        ]
    });

    // Create the Item data store
    itemStore = Ext.create('Ext.data.ArrayStore', {
        model:'ItemsModel',
        proxy:{
            type:'rest',
            url:'/rest/items',
            reader:{
                type:'json',
                root:'item'
            },
            headers:{'Accept':'application/json'},
            pageParam:undefined,
            startParam:undefined,
            sortParam:undefined,
            limitParam:undefined
        },
        autoLoad:true
    });

    Ext.define('SitemapsModel', {
        extend:'Ext.data.Model',
        fields:[
            {name:'name'},
            {name:'leaf'},
            {name:'link'}
        ]
    });

    // Create the Sitemap data store
    sitemapStore = Ext.create('Ext.data.ArrayStore', {
        model:'SitemapsModel',
        proxy:{
            type:'rest',
            url:'/rest/sitemaps',
            reader:{
                type:'json',
                root:'sitemap'
            },
            headers:{'Accept':'application/json'},
            pageParam:undefined,
            startParam:undefined,
            sortParam:undefined,
            limitParam:undefined
        },
        autoLoad:true
    });

    Ext.define('BindingsModel', {
        extend:'Ext.data.Model',
        fields:[
            {name:'bundle'},
            {name:'name'},
            {name:'pid'},
            {name:'type'},
            {name:'author'},
            {name:'version'},
            {name:'ohversion'},
            {name:'link'},
            {name:'osgiVersion'}
        ]
    });

    // Create the Bindings data store
    bindingStore = Ext.create('Ext.data.ArrayStore', {
        model:'BindingsModel',
        proxy:{
            type:'rest',
            url:'/rest/bindings',
            reader:{
                type:'json',
                root:'binding'
            },
            headers:{'Accept':'application/json'},
            pageParam:undefined,
            startParam:undefined,
            sortParam:undefined,
            limitParam:undefined
        },
        autoLoad:true
    });

    var configTab = Ext.create('openHAB.config.config');
    var chartTab = Ext.create('openHAB.graph.graph');
    var automationTab = Ext.create('openHAB.automation.automation');
    var systemTab = Ext.create('openHAB.system.system');

    Ext.define('StatusBar', {
        extend:'Ext.Component',
        alias:'widget.statusbar',
        html:'<div id="onlineStatus" style="position:absolute;right:5px;top:3px;"><span id="statustext" style="vertical-align: top;">openHAB Status </span><img style="margin-top:-1px;" id="statusicon" src="images/status-offline.png"></div>',
        style:{
            'width':250
        }
    });

    Ext.define('StatusBar', {
        extend:'Ext.Component',
        alias:'widget.statusbar',
        html:'<div id="onlineStatus" style="position:absolute;right:5px;top:3px;width:250px;text-align:right"><span id="statustext" style="vertical-align: top;">Online Status </span><img style="margin-top:-1px;" id="statusicon" src="images/status-offline.png"></div>'
    });

    var tabMain = Ext.create('Ext.tab.Panel', {
        id:'mainTab',
        layout:'fit',
        items:[chartTab, configTab, automationTab, systemTab],
        listeners:{
            render:function () {
                this.tabBar.add(
                    { xtype:'tbfill' },
                    { xtype:'statusbar' }
                );
            },
            tabchange:function (tabPanel, newCard, oldCard, eOpts) {
                if (newCard.id == 'maintabGraph') {
                    itemStore.filterBy(function (rec) {
                        if (rec.get('type').substring(0, 19) == "GroupItem")
                            return false;
                        return true;
                    });
                }
                else if (newCard.id == 'maintabSystem') {
                }
                else if (newCard.id == 'maintabConfig') {
                    itemStore.clearFilter();
                }
            }
        }

    });

    viewPort = Ext.create('Ext.container.Viewport', {
        el:'openHAB',
        layout:'fit',
        renderTo:'HABmin',
        hidden:true,
        items:[tabMain]
    });

    viewPort.show(true);

    Ext.get('splashscreen').fadeOut({
        duration:500,
        remove:true
    });

    Ext.get('HABmin').show(true);

    statusTooltip = Ext.create('Ext.tip.ToolTip', {target:'onlineStatus', html:'Offline'});

//    subscribe("/rest/items");

}
