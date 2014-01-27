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
var language = {
    // GENERAL
    properties: "Properties",
    error: "Error",
    warning: "Warning",
    success: "Success",
    cancel: "Cancel",
    save: "Save",
    add: "Add",
    edit: "Edit",
    delete: "Delete",
    copy: "Copy",
    refresh: "Refresh",
    create: "Create",

    // app.js
    mainTab_Persistence: "Persistence",
    mainTab_PersistenceTip: "Display chart page",
    mainTab_Configuration: "Configuration",
    mainTab_ConfigurationTip: "Display <i>openHAB</i> configuration page",
    mainTab_Automation: "Automation",
    mainTab_AutomationTip: "Automation information",
    mainTab_System: "System",
    mainTab_SystemTip: "Display system information",
    mainTab_OnlineStatus: "Online Status",
    mainTab_UserSettings: "Configure <i>HABmin</i> user settings",
    onlineState_Online: "openHAB is online",
    onlineState_Offline: "openHAB is offline",
    onlineState_Busy: "openHAB is busy",

    personalisation_Language: "Language:",

    //
    zwave_Network: "Network",
    zwave_ProductExplorer: "Product Explorer",

    // config/zwaveDeviceList.js
    zwave_Devices: "Devices",
    zwave_DevicesReloadButton: "Reload Properties",
    zwave_DevicesReloadButtonTip: "Reload the configuration",
    zwave_DevicesValueUpdateError: "Error sending updated value to the server!",
    zwave_DevicesValueUpdateRangeError: "Value is out of specified range. Please limit the value to between %s and %d.",
    zwave_DevicesActionError: "Error sending action to the server!",
    zwave_DevicesTreeNode: "Node",
    zwave_DevicesTreeValue: "Value",

    // config/zwaveNetwork.js
    zwave_NetworkListening: "Listening",
    zwave_NetworkRouting: "Routing",
    zwave_NetworkPower: "Power",
    zwave_NetworkNeighbors: "Neighbors",

    // config/bindingList.js
    config_BindingListTitle: "Bindings",
    config_BindingListTitleTip: "Binding list",
    config_BindingListBundle: "Bundle",
    config_BindingListName: "Name",
    config_BindingListVersion: "Version",

    // config/bindingProperties.js
    config_BindingPropertiesBinding: "Binding: ",
    config_BindingPropertiesInterfaceName: "Interface Name",
    config_BindingPropertiesInterfaceNamePrompt: "Please enter the new interface name:",
    config_BindingPropertiesInterfaceNameError: "Interface name can only contain alphanumeric characters.",
    config_BindingPropertiesCancelTip: "Cancel changes made to the configuration",
    config_BindingPropertiesSaveTip: "Save changes to the binding configuration",
    config_BindingPropertiesAddTip: "Add an interface to the binding configuration",
    config_BindingPropertiesSaved: "Binding configuration saved",
    config_BindingPropertiesError: "Error saving binding configuration",

    // config/itemList.js
    config_ItemListTitle: "Items and Groups",
    config_ItemListTitleTip: "Configure items and groups",
    config_ItemListDeleteTip: "Delete the item from openHAB",
    config_ItemListConfirmDeleteTitle: "Confirm Delete",
    config_ItemListConfirmDeleteMsg: "Are you sure you want to delete the item '%s'?",
    config_ItemListAddTip: "Add a new item to openHAB",
    config_ItemListRefreshTip: "Refresh the items list",
    config_ItemListCreateItem: "Create Item",
    config_ItemListModelName: "Model Name:",
    config_ItemListSelectModel: "Select Item Model",
    config_ItemListItem: "Item",
    config_ItemListLabel: "Label",
    config_ItemListType: "Type",
    config_ItemListModel: "Model",
    config_ItemListDeleted: "Item '%s' has been deleted.",
    config_ItemListDeleteError: "Error deleting item '%s'.",

    // config/itemProperties.js
    config_ItemPropertiesSetName: "Set the item name.",
    config_ItemPropertiesSetType: "Set the item type.",
    config_ItemPropertiesSetLabel: "Specify the default label used in the UI.",
    config_ItemPropertiesSetUnits: "Specify the unit for this item. This is printed after the value.",
    config_ItemPropertiesSetFormat: "Specify the default format that is used for printing values.",
    config_ItemPropertiesSetTransService: "Define the translation service applicable for the item.",
    config_ItemPropertiesSetTransRule: "Define the translation rule applicable for the item.",
    config_ItemPropertiesSetIcon: "Define the default icon for the item. This is used for the UI.",
    config_ItemPropertiesSetGroups: "List groups that this item is entered. Groups must be changed in the 'Groups' tab.",
    config_ItemPropertiesSetPersistence: "Lists persistence services configured for this item.",
    config_ItemPropertiesItemName: "Item Name",
    config_ItemPropertiesItemType: "Item Type",
    config_ItemPropertiesTranslationService: "Translation Service",
    config_ItemPropertiesTranslationRule: "Translation Rule",
    config_ItemPropertiesPersistence: "Persistence",
    config_ItemPropertiesGroups: "Groups",
    config_ItemPropertiesCancelChangeTip: "Cancel changes made to the item configuration",
    config_ItemPropertiesSaveChangeTip: "Save changes to the item configuration",
    config_ItemPropertiesSaveOk: "Item configuration saved successfully",
    config_ItemPropertiesSaveError: "Error saving item configuration",

    // config/itemRules.js
    config_ItemRulesTitle: "Rules",
    config_ItemRulesAddTip: "Add the rule to this item",
    config_ItemRulesDeleteTip: "Delete the rule from this item",
    config_ItemRulesConfirmDelete: "Confirm Delete",
    config_ItemRulesConfirmDeleteMsg: "Are you sure you want to delete the rule '%s'?",
    config_ItemRulesName: "Name",
    config_ItemRulesItem: "Item",
    config_ItemRulesDescription: "Description",
    config_ItemRulesDeletedOk: "Rule '%s' successfully removed from item '%s'",
    config_ItemRulesDeletedError: "Error deleting rule '%s' from item '%s'",

    // config/groupTree.js
    config_GroupsTitle: "Groups",

    // config/mappingList.js
    config_MappingListTitle: "Translation Rules",
    config_MappingListTitleTip: "Translation rule list",

    // config/mappingProperties.js
    config_MappingPropertiesTip: "Translation rule configuration",
    config_MappingPropertiesCancelTip: "Cancel changes made to the lookup table",
    config_MappingPropertiesSaveTip: "Save changes to the lookup table",
    config_MappingPropertiesAddTip: "Add a row to the lookup table",
    config_MappingPropertiesDeleteTip: "Remove highlighted row from the lookup table",
    config_MappingPropertiesNewLabel: "New Label",
    config_MappingPropertiesGridTitle: "Mapping Properties",
    config_MappingPropertiesGridMinimum: "Minimum",
    config_MappingPropertiesGridMaximum: "Maximum",
    config_MappingPropertiesGridLabel: "Label",
    config_MappingPropertiesGridValue: "Value",
    config_MappingPropertiesGridIcon: "Icon",

    // config/sitemapList.js
    config_SitemapListTitle: "Sitemaps",
    config_SitemapListTitleTip: "Sitemap list",
    config_SitemapListDeleteTip: "Delete the sitemap from openHAB",
    config_SitemapListDeleteMsg: "Are you sure you want to delete the sitemap '%s'?",
    config_SitemapListAddTip: "Add a new sitemap to openHAB",
    config_SitemapListSitemapName: "Sitemap Name",
    config_SitemapListNewSitemapMsg: "Please enter the new sitemap name:",
    config_SitemapListCopyTip: "Copy the selected sitemap as a new sitemap",
    config_SitemapListCopySitemapMsg: "Please enter the new sitemap name:",
    config_SitemapListRefreshTip: "Refresh the sitemap list",
    config_SitemapListName: "Name",
    config_SitemapListLabel: "Label",
    config_SitemapListSitemapDeleteOk: "Sitemap '%s' deleted",
    config_SitemapListSitemapDeleteErr: "Error deleting sitemap '%s'",
    config_SitemapListSitemapCreateOk: "Sitemap '%s' created successfully",
    config_SitemapListSitemapCreateErr: "Error creating sitemap '%s'",
    config_SitemapListFormatError: "Sitemap name can only contain alphanumeric characters.",

    // config/sitemapProperties.js
    config_SitemapPropertiesTip: "Sitemap Properties",
    config_SitemapHelpHeight: "Set the height of the widget in the UI",
    config_SitemapHelpItem: "Select the item attached to this widget",
    config_SitemapHelpIcon: "Override the item icon. Leave blank to use the default for this item",
    config_SitemapHelpLabel: "Override the item label. Leave blank to use the default for this item",
    config_SitemapHelpFormat: "Overrides the item formatting. Must be used with label.",
    config_SitemapHelpUnits: "Overrides the item formatting. Must be used with label.",
    config_SitemapHelpTranslateSvc: "Overrides the translate service",
    config_SitemapHelpTranslateRule: "Overrides the translate rule",
    config_SitemapHelpMapping: "Mapping values for switch.",
    config_SitemapHelpMax: "Set the maximum allowable value",
    config_SitemapHelpMin: "Set the minimum allowable value",
    config_SitemapHelpPeriod: "?",
    config_SitemapHelpRefresh: "?",
    config_SitemapHelpFrequency: "?",
    config_SitemapHelpSeparator: "?",
    config_SitemapHelpService: "?",
    config_SitemapHelpStep: "Set the step value",
    config_SitemapHelpSwitchSupport: "?",
    config_SitemapHelpURL: "Set the URL attached to this widget",
    config_SitemapHelpVisibility: "Visibility",
    config_SitemapHelpLabelColor: "Label Color",
    config_SitemapHelpValueColor: "Value Color",
    config_SitemapPropertiesItem: "Item",
    config_SitemapPropertiesIcon: "Icon",
    config_SitemapPropertiesFormat: "Format",
    config_SitemapPropertiesUnits: "Units",
    config_SitemapPropertiesLabel: "Label",
    config_SitemapPropertiesTranslationService: "Translation Service",
    config_SitemapPropertiesMapping: "Mapping",
    config_SitemapPropertiesTranslationRule: "Translation Rule",
    config_SitemapPropertiesMaximum: "Maximum",
    config_SitemapPropertiesMinimum: "Minimum",
    config_SitemapPropertiesService: "Service",
    config_SitemapPropertiesStep: "Step",
    config_SitemapPropertiesCommand: "Command",
    config_SitemapPropertiesSendFrequency: "Send Frequency",
    config_SitemapPropertiesSwitchSupport: "Switch Support",
    config_SitemapPropertiesURL: "URL",
    config_SitemapPropertiesHeight: "Height",
    config_SitemapPropertiesRefreshPeriod: "Refresh Period",
    config_SitemapPropertiesUpdate: "Update data",
    config_SitemapPropertiesDeleteWidget: "Delete this widget and its children",
    config_SitemapPropertiesDeleteWidgetMsg: "Are you sure you want to delete the selected widget and all its children?",
    config_SitemapPropertiesDeleteWidgetConfirm: "Confirm Delete",
    config_SitemapPropertiesWidgets: "Widgets",
    config_SitemapPropertiesConfiguration: "Sitemap Configuration",
    config_SitemapPropertiesExpand: "Expand sitemap",
    config_SitemapPropertiesSave: 'Save sitemap',
    config_SitemapPropertiesSaveOk: "Sitemap configuration saved",
    config_SitemapPropertiesSaveErr: "Error saving sitemap",
    config_SitemapPropertiesFrameErr: "Frames must have children [%s]",
    config_SitemapPropertiesLabelWidget: "Widget",
    config_SitemapPropertiesLabelItem: "Item",
    config_SitemapPropertiesLabelLabel: "Label",


    // graph/graph.js
    chartTab_Chart: "Chart",
    chartTab_Table: "Table",

    // graph/itemList.js
    graph_ItemList: "Item List",
    graph_ItemListTip: "Select items to be graphed",
    graph_ItemListUpdate: "Update",
    graph_ItemListUpdateTip: "Retrieve the currently selected channels",
    graph_ItemListSave: "Save Graph",
    graph_ItemListSaveTip: "Save current chart configuration",
    graph_ItemListReset: "Reset Graph",
    graph_ItemListResetTip: "Clear Selected Channels and Reset Period",
    graph_ItemTitle: "Item",
    graph_LastValue: "Last Value",
    graph_ItemIcon: "Item Icon",

    // graph/graphList.js
    graph_GraphList: "Graph List",
    graph_GraphListTip: "Display predefined graphs",
    graph_GraphListDeleteTip: "Delete the selected graph definition",
    graph_GraphListEditTip: "Edit the selected graph definition",
    graph_GraphListDownloadError: "Error downloading chart definition '%s'.",

    // graph/saveGraph.js
    graph_SaveGraphTitle: "Save Graph",
    graph_SaveGraphError: "Error saving graph '%s'!",
    graph_SaveGraphSuccess: "Graph '%s' saved successfully.",
    graph_SaveGraphLine: "Line",
    graph_SaveGraphSpline: "Spline",
    graph_SaveGraphItemConfig: "Item Configuration",
    graph_SaveGraphItemAxis: "Axis",
    graph_SaveGraphItemItem: "Item",
    graph_SaveGraphItemLabel: "Label",
    graph_SaveGraphItemChart: "Chart",
    graph_SaveGraphItemLegend: "Legend",
    graph_SaveGraphItemLine: "Line",
    graph_SaveGraphItemLineColor: "Color",
    graph_SaveGraphItemLineWidth: "Width",
    graph_SaveGraphItemLineStyle: "Style",
    graph_SaveGraphItemMarker: "Marker",
    graph_SaveGraphItemMarkerColor: "Color",
    graph_SaveGraphItemMarkerSymbol: "Symbol",
    graph_SaveGraphAxisConfig: "Axis Configuration",
    graph_SaveGraphAxisAxis: "Axis",
    graph_SaveGraphAxisTitle: "Title",
    graph_SaveGraphAxisFormat: "Format",
    graph_SaveGraphAxisMinimum: "Minimum",
    graph_SaveGraphAxisMaximum: "Maximum",
    graph_SaveGraphAxisNumberError: "Value must be a number",
    graph_SaveGraphAxisPosition: "Position",
    graph_SaveGraphChartConfig: "Chart Configuration",
    graph_SaveGraphName: "Name",
    graph_SaveGraphPeriod: "Period",
    graph_SaveGraphIcon: "Icon",

    // graph/graphHighcharts.js
    graph_HighchartsTitle: "Chart",
    graph_HighchartsLoading: "Downloading graph data...",
    graph_HighchartsZoomIn: "Zoom In",
    graph_HighchartsZoomOut: "Zoom Out",
    graph_HighchartsDisplayDay: "Display last day",
    graph_HighchartsDisplayWeek: "Display last week",
    graph_HighchartsDisplayMonth: "Display last month",
    graph_HighchartsDisplayYear: "Display last year",
    graph_HighchartsScrollLeft: "Scroll left",
    graph_HighchartsScrollRight: "Scroll right",

    // automation/ruleFileList.js
    rule_FileListTitle: "Rule Models",
    rule_FileListAddTip: "Add a new rule model to openHAB",
    rule_FileListCreateButton: "Create Model",
    rule_FileListCreateWindow: "Specify Model Name",
    rule_FileListModel: "Model",
    rule_FileListRule: "Rule",

    // automation/ruleEditor.js
    rule_EditorCancelTip: "Cancel changes made to the rule file",
    rule_EditorSaveTip: "Save changes to the rule file",
    rule_EditorUndoTip: "Undo changes",
    rule_EditorRedoTip: "Redo changes",
    rule_EditorIncreaseFontTip: "Increase font size",
    rule_EditorDecreaseFontTip: "Decrease font size",
    rule_EditorAddTemplateTip: "Add openHAB rule template at cursor location",
    rule_EditorAddItemTip: "Add openHAB item name at cursor location",
    rule_EditorAddItemName: "Item name:",
    rule_EditorInsertItem: "Insert Item",
    rule_EditorSelectItemName: "Select Item Name",
    rule_EditorAddTimerTip: "Add timer definition at cursor location",
    rule_EditorTimeRule: "Time Rule:",
    rule_EditorInsertTimer: "Insert Timer",
    rule_EditorSelectTimer: "Select Timer",
    rule_EditorErrorSavingRule: "Error saving rule model '%s'",
    rule_EditorSaveOk: "Rule model '%s' saved successfully.",
    rule_EditorErrorLoadingRule: "Error loading rule model '%s'",
    rule_EditorCreatedOk: "Rule model '%s' created successfully.",
    rule_EditorLoadedOk: "Rule model '%s' loaded successfully.",
    rule_EditorErrorNoModel: "Error loading rule model - no model defined",

    // automation/ruleLibrary.js
    rule_LibraryTitle: "Rule Library",
    rule_LibraryRule: "Rule",

    // automation/ruleList.js
    rule_ListTitle: "Rules",
    rule_ListItem: "Item",
    rule_ListRule: "Rule",

    // automation/notificationList.js
    notification_ListTitle: "Notifications"
};
