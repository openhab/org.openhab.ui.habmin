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

/**
 * Load the language file before the application starts
 */
var languageCode;
document.ready = function () {
    // Write the version to the splash-screen
    Ext.fly('HABminVersion').update(versionGUI, false);

    // Detect the language and get the two character code
    languageCode = Ext.util.Cookies.get("language");
    if (languageCode === null)
        languageCode = "en";
    else if (isoLanguageGetName(languageCode) == "UNKNOWN")
        languageCode = "en";

    // Write the language on the splash-screen
    Ext.fly('HABminLanguage').update(isoLanguageGetName(languageCode), false);

    // Only try and load languages that aren't English since this is the base
    if (languageCode != "en")
        loadLanguage(languageCode);
};

Ext.Container.prototype.bufferResize = false;

Ext.Loader.setConfig({
    enabled: true,
    disableCaching: false, // For debug only
    'paths': {
        'Ext.ux': 'js/extux',
        'Ext.ux.window': 'js/extux/notification',
        'Ext.ux.aceeditor': 'js/extux/aceeditor',
        'Ext.ux.grid': 'js/extux/grid',
        'openHAB': 'app'
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
    'Ext.ux.grid.QuickFilter',
    'Ext.ux.statusbar.StatusBar',
    'Ext.ux.aceeditor.Panel',
    'Ext.ux.window.Notification',
    'openHAB.graph.*',
    'openHAB.config.*',
    'openHAB.system.*',
    'openHAB.automation.*'
]
);

var versionGUI = "0.1.1-snapshot";
var versionJAR;
var gitRepoLink = "https://api.github.com/repos/cdjackson/HABmin/releases";

var viewPort;

var statusTooltip;
var STATUS_UNKNOWN = 0;
var STATUS_ONLINE = 1;
var STATUS_BUSY = 2;
var STATUS_OFFLINE = 3;
var onlineStatus = STATUS_UNKNOWN;

var NOTIFICATION_ERROR = 1;
var NOTIFICATION_OK = 2;
var NOTIFICATION_WARNING = 3;
var NOTIFICATION_INFO = 4;

// Global data stores from openHAB
var persistenceItemStore;
var persistenceServiceStore;
var itemTypeStore;
var itemIconStore;
var widgetStore;
var sitemapStore;
var bindingStore;
var itemConfigStore;
var itemFormatStore;
var translationServiceStore;
var ruleLibraryStore;
var ruleStore;
var cronRuleStore;
var chartStore;

// Global variables
var persistenceService = "";
var HABminBaseURL = "/services/habmin";

// User preferences
var userPrefs = {};

var itemTypeArray = [
    {name: "GroupItem", icon: "images/category-group.png"},
    {name: "SwitchItem", icon: "images/switch.png"},
    {name: "NumberItem", icon: "images/counter.png"},
    {name: "ColorItem", icon: "images/color.png"},
    {name: "ContactItem", icon: "images/door-open.png"},
    {name: "DateTimeItem", icon: "images/clock.png"},
    {name: "DimmerItem", icon: "images/ui-slider.png"},
    {name: "RollerShutterItem", icon: "images/curtain.png"},
    {name: "StringItem", icon: "images/edit.png"}
];

var widgetTypeArray = [
    {type: "Group", icon: "images/ui-scroll-pane.png", iconCls: "widget-group"},
    {type: "Frame", icon: "images/ui-group-box.png", iconCls: "widget-frame"},
    {type: "Image", icon: "images/picture.png", iconCls: "widget-image"},
    {type: "Selection", icon: "images/ui-combo-box-blue.png", iconCls: "widget-selection"},
    {type: "Slider", icon: "images/ui-slider.png", iconCls: "widget-slider"},
    {type: "Chart", icon: "images/chart-up.png", iconCls: "widget-chart"},
    {type: "Video", icon: "images/film.png", iconCls: "widget-video"},
    {type: "Webview", icon: "images/globe.png", iconCls: "widget-webview"},
    {type: "Setpoint", icon: "images/ui-scroll-bar.png", iconCls: "widget-setpoint"},
    {type: "Switch", icon: "images/switch.png", iconCls: "widget-switch"},
    {type: "Colorpicker", icon: "images/color.png", iconCls: "widget-colorpicker"},
    {type: "Text", icon: "images/edit.png", iconCls: "widget-text"}
];

var formatLookupArray = [
    {format: '%d', label: 'Integer'},
    {format: '%.1f', label: 'Float (1 decimal place)'},
    {format: '%.2f', label: 'Float (2 decimal place)'},
    {format: '%.3f', label: 'Float (3 decimal place)'},
    {format: '%b', label: 'Boolean (lower case)'},
    {format: '%B', label: 'Boolean (upper case)'},
    {format: '%s', label: 'String (lower case)'},
    {format: '%S', label: 'String (upper case)'},
    {format: '%x', label: 'Hexadecimal (lower case)'},
    {format: '%X', label: 'Hexadecimal (upper case)'},
    {format: '%o', label: 'Octal'},
    {format: '%1$tR', label: 'Time (HH:MM)'},
    {format: '%1$tT', label: 'Time (HH:MM:SS)'},
    {format: '%1$td %1$tb %1$tY', label: 'Date (dd MMM YYYY)'},
    {format: '%1$ta %1$td %1$tb %1$tY', label: 'Date (DDD dd MMM YYYY)'},
    {format: '%1$ta %1$tR', label: 'Day/Time (DDD HH:MM)'},
    {format: '%1$ta %1$tT', label: 'Day/Time (DDD HH:MM:SS)'},
    {format: '%1$td %1$tb %1$tY %1$tR', label: 'Date/Time (dd MMM YYYY HH:MM)'},
    {format: '%1$td %1$tb %1$tY %1$tT', label: 'Date/Time (dd MMM YYYY HH:MM:SS)'},
    {format: '%1$tT %1$td %1$tb %1$tY', label: 'Date/Time (HH:MM:SS dd MMM YYYY)'}
];

var translationServiceArray = [
    {name: "", label: language.translation_None},
    {name: "MAP", label: language.translation_MapFile},
    {name: "REGEX", label: language.translation_Regex},
    {name: "JAVASCRIPT", label: language.translation_Javascript},
    {name: "EXEC", label: language.translation_Exec},
    {name: "XSLT", label: language.translation_XLS},
    {name: "XPATH", label: language.translation_XPath}
];

var cronRuleArray = [
    {label: "Every 15 seconds", rule: "0/15 * * * * ?"},
    {label: "Every 30 seconds", rule: "0/30 * * * * ?"},
    {label: "Every 1 minute", rule: "0 * * * * ?"},
    {label: "Every 2 minutes", rule: "0 0/2 * * * ?"},
    {label: "Every 5 minutes", rule: "0 0/5 * * * ?"},
    {label: "Every 10 minutes", rule: "0 0/10 * * * ?"},
    {label: "Every 15 minutes", rule: "0 0/15 * * * ?"},
    {label: "Every 20 minutes", rule: "0 0/20 * * * ?"},
    {label: "Every 30 minutes", rule: "0 0/30 * * * ?"},
    {label: "Every 1 hour", rule: "0 0 * * * ?"},
    {label: "Every 2 hours", rule: "0 0 0/2 * * ?"},
    {label: "Every 3 hours", rule: "0 0 0/3 * * ?"},
    {label: "Every 6 hours", rule: "0 0 0/6 * * ?"},
    {label: "Every 12 hours (midday/midnight)", rule: "0 0 0/12 * * ?"},
    {label: "Every day at midday", rule: "0 0 12 * * ?"},
    {label: "Every day at midnight", rule: "0 0 0 * * ?"}
];

/**
 * The main application. The launch method is called once the application files have all loaded.
 */
Ext.application({
    name: 'HABmin',
    launch: function () {

        initState = 0;
        createUI();
    }
});

/**
 * Set default json headers
 */
Ext.Ajax.defaultHeaders = {
    'Accept': 'application/json,application/xml',
    'Content-Type': 'application/json'
};

/**
 * Load a country language file
 * @param countryCode the two digit ISO country code
 */
function loadLanguage(countryCode) {
    moment.lang(countryCode);

    Ext.Ajax.request({
        url: "./app/language/" + countryCode + ".json",
        headers: {'Accept': 'application/json'},

        success: function (response, opts) {
            var json = Ext.decode(response.responseText);

            if (json === null)
                return;

            for (var attrname in json) {
                language[attrname] = json[attrname];
            }
        },
        callback: function (response, opts) {
        }
    });
}

function getReleaseVersion() {
    Ext.data.JsonP.request({
        url: gitRepoLink,
        callbackKey: 'callback',
        success: function (result) {
            if (result == null)
                return;
            if (result.data == null)
                return;

            // Find the latest version(s)
            var currentReleaseTime = 0;
            var newestReleaseTime = 0;
            var newestReleaseVersion = "";
            var newestPrereleaseTime = 0;
            var newestPrereleaseVersion = "";
            for (var cnt = 0; cnt < result.data.length; cnt++) {
                // Ignore drafts
                if (result.data[cnt].draft == true)
                    continue;

                // Find the time on the current version
                if(result.data[cnt].tag_name == versionGUI)
                    currentReleaseTime = Date.parse(result.data[cnt].published_at);

                // Find the latest prerelease and release versions
                if (result.data[cnt].prerelease == false) {
                    if (Date.parse(result.data[cnt].published_at) > newestReleaseTime) {
                        newestReleaseTime = result.data[cnt].published_at;
                        newestReleaseVersion = result.data[cnt].tag_name;
                    }
                }
                else {
                    if (Date.parse(result.data[cnt].published_at) > newestPrereleaseTime) {
                        newestPrereleaseTime = Date.parse(result.data[cnt].published_at);
                        newestPrereleaseVersion = result.data[cnt].tag_name;
                    }
                }
            }

            // Get the time of the last pre-release notification
            // We don't want to notify our users too often!
            var lastPrereleaseCheck = Ext.util.Cookies.get("lastPrereleaseNotification");
            if(lastPrereleaseCheck == null)
                lastPrereleaseCheck = 0;

            // Check if we have a new release
            if(newestReleaseTime > currentReleaseTime) {
                var notification = sprintf(language.newReleaseNotification, newestPrereleaseVersion, moment(newestPrereleaseTime).format("D MMM"));
                handleStatusNotification(NOTIFICATION_INFO, notification);
            }
            else if(lastPrereleaseCheck < (new Date()).getTime() - (5 * 86400000)) {
                if(newestPrereleaseTime > currentReleaseTime) {
                    var notification = sprintf(language.newPrereleaseNotification, newestPrereleaseVersion, moment(newestPrereleaseTime).format("D MMM YYYY"));
                    handleStatusNotification(NOTIFICATION_INFO, notification);

                    var lastPrereleaseCheck = Ext.util.Cookies.set("lastPrereleaseNotification", (new Date()).getTime());
                }
            }
        }
    });
}

/**
 * Handle user preferences
 * This ensures that all required preferences are set, and are valid
 */
function checkUserPrefs() {
    if (userPrefs === null)
        userPrefs = {};

    // Time to show error message
    if (userPrefs.messageTimeError === null)
        userPrefs.messageTimeError = 2500;
    if (userPrefs.messageTimeError > 10000)
        userPrefs.messageTimeError = 2500;
    if (userPrefs.messageTimeError < 0)
        userPrefs.messageTimeError = 2500;

    // Time to show warning message
    if (userPrefs.messageTimeWarning === null)
        userPrefs.messageTimeWarning = 2500;
    if (userPrefs.messageTimeWarning > 10000)
        userPrefs.messageTimeWarning = 2500;
    if (userPrefs.messageTimeWarning < 0)
        userPrefs.messageTimeWarning = 2500;

    // Time to show ok message
    if (userPrefs.messageTimeSuccess === null)
        userPrefs.messageTimeSuccess = 1500;
    if (userPrefs.messageTimeSuccess > 10000)
        userPrefs.messageTimeSuccess = 1500;
    if (userPrefs.messageTimeSuccess < 0)
        userPrefs.messageTimeSuccess = 1500;
}

/**
 * Generate notifications. This method is used by all parts of the app that want to notify
 * the user of something.
 * @param type
 * @param message
 */
function handleStatusNotification(type, message) {
    if (type == NOTIFICATION_OK) {
        Ext.create('widget.uxNotification', {
            position: 'tr',
            useXAxis: false,
            cls: 'ux-notification-success',
            iconCls: 'ux-notification-success-icon',
            closable: false,
            title: language.success,
            html: message,
            slideInDuration: 800,
            slideBackDuration: 1500,
            autoCloseDelay: 3000,
            width: 250,
            height: 75,
            slideInAnimation: 'bounceOut',
            slideBackAnimation: 'easeIn'
        }).show();
    }
    else if (type == NOTIFICATION_ERROR) {
        Ext.create('widget.uxNotification', {
            position: 'tr',
            useXAxis: false,
            cls: 'ux-notification-error',
            iconCls: 'ux-notification-error-icon',
            closable: true,
            title: language.error,
            html: message,
            slideInDuration: 800,
            slideBackDuration: 1500,
            autoCloseDelay: 20000,
            width: 250,
            height: 75,
            slideInAnimation: 'bounceOut',
            slideBackAnimation: 'easeIn'
        }).show();
    }
    else if (type == NOTIFICATION_WARNING) {
        Ext.create('widget.uxNotification', {
            position: 'tr',
            useXAxis: false,
            cls: 'ux-notification-warning',
            iconCls: 'ux-notification-warning-icon',
            closable: false,
            title: language.warning,
            html: message,
            slideInDuration: 800,
            slideBackDuration: 1500,
            autoCloseDelay: 3000,
            width: 250,
            height: 75,
            slideInAnimation: 'bounceOut',
            slideBackAnimation: 'easeIn'
        }).show();
    }
    else {
        Ext.create('widget.uxNotification', {
            position: 'tr',
            useXAxis: false,
            cls: 'ux-notification-info',
            iconCls: 'ux-notification-info-icon',
            closable: false,
            title: language.information,
            html: message,
            slideInDuration: 800,
            slideBackDuration: 1500,
            autoCloseDelay: 6000,
            width: 250,
            height: 75,
            slideInAnimation: 'bounceOut',
            slideBackAnimation: 'easeIn'
        }).show();
    }
}

function handleOnlineStatus(newStatus) {
    // Don't do anything if the status hasn't changed
    if (onlineStatus == newStatus)
        return;
    onlineStatus = newStatus;

    if (newStatus == STATUS_ONLINE) {
        Ext.get('statusicon').dom.src = 'images/status.png';
        statusTooltip.update(language.onlineState_Online);
        handleStatusNotification(NOTIFICATION_OK, language.onlineState_Online);
    }
    else if (newStatus == STATUS_BUSY) {
        Ext.get('statusicon').dom.src = 'images/status-away.png';
        statusTooltip.update(language.onlineState_Busy);
        handleStatusNotification(NOTIFICATION_WARNING, language.onlineState_Busy);
    }
    else if (newStatus == STATUS_OFFLINE) {
        Ext.get('statusicon').dom.src = 'images/status-busy.png';
        statusTooltip.update(language.onlineState_Offline);
        handleStatusNotification(NOTIFICATION_ERROR, language.onlineState_Offline);
    }
}

function doStatus() {
    // Periodically retrieve the openHAB server status updates
    var updateStatus = {
        run: function () {
            Ext.Ajax.request({
                type: 'rest',
                url: HABminBaseURL + '/status',
                timeout: updateStatus.timeout,
                method: 'GET',
                success: function (response, opts) {
                    var res = Ext.decode(response.responseText);
                    if (res == null)
                        updateStatus.statusCount++;
                    else
                        updateStatus.statusCount = 0;
                },
                failure: function (response, opts) {
                    updateStatus.statusCount++;
                },
                callback: function () {
                    // Hold off any errors until after the startup time.
                    // This is necessary for slower (embedded) machines
                    if (updateStatus.startCnt > 0) {
                        updateStatus.startCnt--;
                    }
                    else {
                        updateStatus.errorLimit = 2;
                    }

                    if (updateStatus.statusCount >= updateStatus.errorLimit) {
                        updateStatus.timeout = 30000;
                        handleOnlineStatus(STATUS_OFFLINE);
                    }
                    else if (updateStatus.statusCount == 0) {
                        updateStatus.timeout = 2500;
                        handleOnlineStatus(STATUS_ONLINE);
                    }
                }
            });
        },
        timeout: 30000,
        interval: 2500,
        startCnt: 6,
        statusCount: 0,
        errorLimit: 6
    };
    Ext.TaskManager.start(updateStatus);
}


// Return an icon based on the ItemType
function getItemTypeIcon(type) {
    var ref = itemTypeStore.findExact("name", type);
    if (ref == -1)
        return "";
    else
        return itemTypeStore.getAt(ref).get('icon');
}

/**
 * The main GUI creation method
 */
function createUI() {
    delete Ext.tip.Tip.prototype.minWidth;

    Ext.QuickTips.init();
    Ext.state.Manager.setProvider(new Ext.state.CookieProvider());

    //======= Quartz CRON Rule Store
    Ext.define('CRONRuleModel', {
        extend: 'Ext.data.Model',
        fields: [
            {name: 'rule'},
            {name: 'label'}
        ]
    });

    // Create the data store
    cronRuleStore = Ext.create('Ext.data.ArrayStore', {
        model: 'CRONRuleModel'
    });
    cronRuleStore.loadData(cronRuleArray);


    //======= Translation Services Store
    Ext.define('TranslationServiceModel', {
        extend: 'Ext.data.Model',
        fields: [
            {name: 'name'},
            {name: 'label'}
        ]
    });

    // Create the data store
    translationServiceStore = Ext.create('Ext.data.ArrayStore', {
        model: 'TranslationServiceModel'
    });
    translationServiceStore.loadData(translationServiceArray);


    //======= Item Type Store
    Ext.define('ItemTypeModel', {
        extend: 'Ext.data.Model',
        fields: [
            {name: 'name'},
            {name: 'label'},
            {name: 'icon'}
        ]
    });

    // Create the Item data store
    itemTypeStore = Ext.create('Ext.data.ArrayStore', {
        model: 'ItemTypeModel'
    });
    itemTypeStore.loadData(itemTypeArray);


    //======= Persistence Service Store
    Ext.define('PersistenceServiceModel', {
        extend: 'Ext.data.Model',
        fields: [
            {name: 'name'},
            {name: 'actions'},
            {name: 'strategies'}
        ]
    });

    persistenceServiceStore = Ext.create('Ext.data.JsonStore', {
            model: 'PersistenceServiceModel',
            proxy: {
                type: 'rest',
                url: HABminBaseURL + '/config/persistence/services',
                reader: {
                    type: 'json',
                    root: 'services'
                },
                headers: {'Accept': 'application/json'},
                pageParam: undefined,
                startParam: undefined,
                sortParam: undefined,
                limitParam: undefined
            },
            autoLoad: true,
            listeners: {
                load: function (store, records, options) {
                    // Get the selection menu
                    var menu = Ext.getCmp("persistenceServiceMenu");

                    // Select the default service
                    for (var cnt = 0; cnt < store.getCount(); cnt++) {
                        var actions = [].concat(store.getAt(cnt).get("actions"));
                        // TODO: Better method to determine default needed!!!
                        if (actions.indexOf("Read")) {
                            persistenceService = store.getAt(cnt).get("name");
                            var newItem = {};
                            newItem.text = store.getAt(cnt).get("name");
                            newItem.icon = "images/database-sql.png";
                            newItem.disabled = false;
                            menu.add(newItem);
                        }
                    }

                    // Update the button for selecting the persistence service
                    var button = Ext.getCmp("persistenceServiceSelect");
                    if (button != null) {
                        button.setText(persistenceService);
                        persistenceItemStore.filterItems(persistenceService);
                    }
                }
            }
        }
    )
    ;

// ====== Charts Store
    chartStore = Ext.create('Ext.data.Store', {
        fields: ['id', 'name', 'icon'],
        proxy: {
            type: 'rest',
            url: HABminBaseURL + '/persistence/charts',
            reader: {
                type: 'json',
                root: 'chart'
            },
            headers: {'Accept': 'application/json'},
            pageParam: undefined,
            startParam: undefined,
            sortParam: undefined,
            limitParam: undefined
        },
        autoLoad: true
    });

//======= Persistence Items Store
    Ext.define('PersistenceItemModel', {
        extend: 'Ext.data.Model',
        fields: [
            {name: 'name'},
            {name: 'label'},
            {name: 'unit'},
            {name: 'format'},
            {name: 'state'},
            {name: 'icon'},
            {name: 'type'},
            {name: 'services'},
            {name: 'groups'}
        ]
    });

    persistenceItemStore = Ext.create('Ext.data.ArrayStore', {
        model: 'PersistenceItemModel',
        proxy: {
            type: 'rest',
            url: HABminBaseURL + '/persistence/items',
            reader: {
                type: 'json',
                root: 'items'
            },
            headers: {'Accept': 'application/json'},
            pageParam: undefined,
            startParam: undefined,
            sortParam: undefined,
            limitParam: undefined
        },
        autoLoad: true,
        filterItems: function (service) {
            persistenceItemStore.filterBy(function (rec, id) {
                var serviceList = [].concat(rec.get('services'));
                if (serviceList.indexOf(service) != -1)
                    return true;
                else
                    return false;
            });
        }
    });


//======= Item Icon Store
    Ext.define('ItemIconModel', {
        extend: 'Ext.data.Model',
        fields: [
            {name: 'name'},
            {name: 'menuicon'},
            {name: 'label'},
            {name: 'description'},
            {name: 'height'},
            {name: 'width'}
        ]
    });

    itemIconStore = Ext.create('Ext.data.ArrayStore', {
        model: 'ItemIconModel',
        proxy: {
            type: 'rest',
            url: HABminBaseURL + '/config/icons',
            reader: {
                type: 'json',
                root: 'icon'
            },
            headers: {'Accept': 'application/json'},
            pageParam: undefined,
            startParam: undefined,
            sortParam: undefined,
            limitParam: undefined
        },
        autoLoad: true
    });

//======= Rule Template Store
    Ext.define('RuleTemplateModel', {
        extend: 'Ext.data.Model',
        fields: [
            {name: 'name'},
            {name: 'label'},
            {name: 'type'},
            {name: 'itemtype'},
            {name: 'description'},
            {name: 'extension'},
            {name: 'trigger'},
            {name: 'action'},
            {name: 'variable'},
            {name: 'linkeditem'}
        ]
    });

    // Load the rules for this item
    ruleLibraryStore = Ext.create('Ext.data.JsonStore', {
        model: 'RuleTemplateModel',
        proxy: {
            type: 'rest',
            url: HABminBaseURL + '/config/rules/library/list',
            reader: {
                type: 'json',
                root: 'rule'
            },
            headers: {'Accept': 'application/json'},
            pageParam: undefined,
            startParam: undefined,
            sortParam: undefined,
            limitParam: undefined
        },
        autoLoad: true
    });

//======= Widgets Store
    Ext.define('WidgetsModel', {
        extend: 'Ext.data.Model',
        fields: [
            {name: 'type'},
            {name: 'icon'},
            {name: 'iconCls'}
        ]
    });

// Create the Widgets data store
    widgetStore = Ext.create('Ext.data.ArrayStore', {
        model: 'WidgetsModel'
    });
    widgetStore.loadData(widgetTypeArray);


//======= Item Format Store
    Ext.define('FormatModel', {
        extend: 'Ext.data.Model',
        fields: [
            {name: 'format'},
            {name: 'label'}
        ]
    });

// Create the item format store
    itemFormatStore = Ext.create('Ext.data.ArrayStore', {
        model: 'FormatModel'
    });
    itemFormatStore.loadData(formatLookupArray);


//======= Rule Store
    Ext.define('RuleModel', {
        extend: 'Ext.data.Model',
        fields: [
            {name: 'item'},
            {name: 'name'},
            {name: 'label'},
            {name: 'description'}
        ]
    });

    ruleStore = Ext.create('Ext.data.ArrayStore', {
        model: 'RuleModel',
        proxy: {
            type: 'rest',
            url: HABminBaseURL + '/config/rules/list',
            reader: {
                type: 'json',
                root: 'rule'
            },
            headers: {'Accept': 'application/json'},
            pageParam: undefined,
            startParam: undefined,
            sortParam: undefined,
            limitParam: undefined
        },
        autoLoad: true
    });


//======= Item Config Store
    Ext.define('ItemConfigModel', {
        extend: 'Ext.data.Model',
        fields: [
            {name: 'model'},
            {name: 'name'},
            {name: 'type'},
            {name: 'icon'},
            {name: 'type'},
            {name: 'label'},
            {name: 'format'},
            {name: 'units'},
            {name: 'groups'}
        ]
    });

    itemConfigStore = Ext.create('Ext.data.ArrayStore', {
        model: 'ItemConfigModel',
        proxy: {
            type: 'rest',
            url: HABminBaseURL + '/config/items',
            reader: {
                type: 'json',
                root: 'item'
            },
            headers: {'Accept': 'application/json'},
            pageParam: undefined,
            startParam: undefined,
            sortParam: undefined,
            limitParam: undefined
        },
        autoLoad: true
    });


//======= Sitemap Store
    Ext.define('SitemapsModel', {
        extend: 'Ext.data.Model',
        fields: [
            {name: 'icon'},
            {name: 'name'},
            {name: 'label'}
        ]
    });

    sitemapStore = Ext.create('Ext.data.ArrayStore', {
        model: 'SitemapsModel',
        proxy: {
            type: 'rest',
            url: HABminBaseURL + '/config/sitemap',
            reader: {
                type: 'json',
                root: 'sitemap'
            },
            headers: {'Accept': 'application/json'},
            pageParam: undefined,
            startParam: undefined,
            sortParam: undefined,
            limitParam: undefined
        },
        autoLoad: true
    });


//======= Bindings Store
    Ext.define('BindingsModel', {
        extend: 'Ext.data.Model',
        fields: [
            {name: 'bundle'},
            {name: 'name'},
            {name: 'pid'},
            {name: 'type'},
            {name: 'author'},
            {name: 'version'},
            {name: 'ohversion'},
            {name: 'link'},
            {name: 'osgiVersion'}
        ]
    });

// Create the Bindings data store
    bindingStore = Ext.create('Ext.data.ArrayStore', {
        model: 'BindingsModel',
        proxy: {
            type: 'rest',
            url: HABminBaseURL + '/config/bindings',
            reader: {
                type: 'json',
                root: 'binding'
            },
            headers: {'Accept': 'application/json'},
            pageParam: undefined,
            startParam: undefined,
            sortParam: undefined,
            limitParam: undefined
        },
        autoLoad: true
    });

    var configTab = Ext.create('openHAB.config.config');
    var chartTab = Ext.create('openHAB.graph.graph');
    var automationTab = Ext.create('openHAB.automation.automation');
    var systemTab = Ext.create('openHAB.system.system');

    Ext.define('StatusBar', {
        extend: 'Ext.Component',
        alias: 'widget.onlinestatusbar',
        html: '<div id="onlineStatus" style="position:absolute;right:5px;top:3px;width:250px;text-align:right"><span id="statustext" style="vertical-align: top;">' + language.mainTab_OnlineStatus + '&nbsp</span><img style="margin-top:-1px;" id="statusicon" src="images/status-offline.png"></div>'
    });

    var tabMain = Ext.create('Ext.tab.Panel', {
        layout: 'fit',
        items: [chartTab, configTab, automationTab, systemTab],
        listeners: {
            render: function () {
                this.tabBar.add(
                    { xtype: 'tbfill' },
                    { xtype: 'onlinestatusbar' },
                    {
                        border: false,
                        closable: false,
                        tooltip: language.mainTab_UserSettings,
                        icon: "images/user-green.png",
                        handler: function () {
                            var store = Ext.create('Ext.data.ArrayStore', {
                                fields: [
                                    {name: 'code'},
                                    {name: 'name'},
                                    {name: 'nativeName'}
                                ]
                            });
                            store.loadData(isoLanguages);
                            store.sort('nativeName');

                            var form = Ext.widget('form', {
                                layout: {
                                    type: 'vbox',
                                    align: 'stretch'
                                },
                                border: false,
                                bodyPadding: 10,
                                fieldDefaults: {
                                    labelAlign: 'top',
                                    labelWidth: 100,
                                    labelStyle: 'font-weight:bold'
                                },
                                defaults: {
                                    margins: '0 0 10 0'
                                },
                                items: [
                                    {
                                        margin: '0 0 0 0',
                                        xtype: 'combobox',
                                        fieldLabel: language.personalisation_Language,
                                        itemId: 'language',
                                        name: 'language',
                                        store: store,
                                        allowBlank: false,
                                        valueField: 'code',
                                        displayField: 'nativeName',
                                        forceSelection: true,
                                        editable: true,
                                        typeAhead: true,
                                        queryMode: 'local',
                                        value: languageCode
                                    }
                                ],
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
                                            if (this.up('form').getForm().isValid()) {
                                                // Read the model name
                                                languageCode = form.getForm().findField('language').getSubmitValue();
                                                Ext.util.Cookies.set("language", languageCode);
                                                loadLanguage(languageCode);

                                                this.up('window').destroy();
                                                window.location.reload();
                                            }
                                        }
                                    }
                                ]
                            });

                            var saveWin = Ext.widget('window', {
                                header: false,
                                closeAction: 'destroy',
                                width: 225,
                                resizable: false,
                                draggable: false,
                                modal: true,
                                layout: {
                                    type: 'vbox',
                                    align: 'stretch'
                                },
                                items: [form]
                            });

                            saveWin.show();
                            saveWin.alignTo(tabMain.getActiveTab(), "tr-tr");
                        }
                    }
                );
            },
            tabchange: function (tabPanel, newCard, oldCard, eOpts) {
                if (newCard.id == 'maintabGraph') {
                }
                else if (newCard.id == 'maintabSystem') {
                }
                else if (newCard.id == 'maintabConfig') {
                }
            }
        }

    });

    viewPort = Ext.create('Ext.container.Viewport', {
        el: 'openHAB',
        layout: 'fit',
        renderTo: 'HABmin',
        hidden: true,
        items: [tabMain]
    });

    viewPort.show(true);

    Ext.get('splashscreen').fadeOut({
        duration: 750,
        remove: true
    });

    Ext.get('HABmin').show(true);

    // Create the status toolbar and start the status update thread
    statusTooltip = Ext.create('Ext.tip.ToolTip', {target: 'onlineStatus', html: language.onlineState_Offline});
    doStatus();

    getReleaseVersion();
}
