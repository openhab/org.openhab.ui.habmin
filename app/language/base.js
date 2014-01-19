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
    onlineState_Online: "openHAB is online",
    onlineState_Offline: "openHAB is offline",
    onlineState_Busy: "openHAB is busy",

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

    // graph/graph.js
    chartTab_Chart: "Chart",
    chartTab_Table: "Table",

    // graph/itemList.js
    graph_Update: "Update",
    graph_UpdateTip: "Retrieve the currently selected channels",
    graph_Save: "Save Graph",
    graph_SaveTip: "Save current chart configuration",
    graph_Reset: "Reset Graph",
    graph_ResetTip: "Clear Selected Channels and Reset Period",

    // automation/ruleFileList.js
    rule_FileListTitle: "Rule Models",
    rule_FileListAdd: "Add New Model",
    rule_FileListAddTip: "Add a new rule model to openHAB",
    rule_FileListCreateButton: "Create Model",
    rule_FileListCreateWindow: "Specify Model Name",
    rule_FileListRefresh: "Refresh the rule model list",
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
