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

//var ruleSource = 'import org.openhab.core.library.types.*';

Ext.define('openHAB.automation.ruleEditor', {
    extend: 'Ext.panel.Panel',
    layout: 'fit',
//    icon: 'images/application-list.png',
//    title: 'Rules Editor',

    initComponent: function () {
        // Check if modelName is defined
        if (this.modelName == null) {
            handleStatusNotification(NOTIFICATION_ERROR, 'Error loading rule model - no model defined');
        }
        else {
            Ext.Ajax.request({
                url: HABminBaseURL + "/config/rules/model/source/" + this.modelName,
                headers: {'Accept': 'application/json'},
                method: 'GET',
                success: function (response, opts) {
                    var json = Ext.decode(response.responseText);
                    // If there's no config for this sitemap, records will be null
                    if (json == null) {
                        handleStatusNotification(NOTIFICATION_ERROR, 'Error loading rule model "' + modelName + '"');
                        return;
                    }

                    editor.setValue(json.source);
                },
                failure: function (result, request) {
                    handleStatusNotification(NOTIFICATION_ERROR, 'Error loading rule model "' + modelName + '"');
                }
            });
        }

        var toolbar = Ext.create('Ext.toolbar.Toolbar', {
            items: [
                {
                    icon: 'images/cross.png',
                    itemId: 'cancel',
                    text: 'Cancel',
                    cls: 'x-btn-icon',
                    disabled: true,
                    tooltip: 'Cancel changes made to the rule file',
                    handler: function () {
                        toolbar.getComponent('save').disable();
                        toolbar.getComponent('cancel').disable();
                    }
                },
                {
                    icon: 'images/disk.png',
                    itemId: 'save',
                    text: 'Save',
                    cls: 'x-btn-icon',
                    disabled: true,
                    tooltip: 'Save changes to the rule file',
                    handler: function () {
                    }
                },
                {
                    icon: 'images/edit-size-up.png',
                    itemId: 'font-large',
                    cls: 'x-btn-icon',
                    disabled: true,
                    tooltip: 'Increase font size',
                    handler: function () {
                    }
                },
                {
                    icon: 'images/edit-size-down.png',
                    itemId: 'font-small',
                    cls: 'x-btn-icon',
                    disabled: true,
                    tooltip: 'Decrease font size',
                    handler: function () {
                    }
                }
            ]
        });

        var editor = Ext.create('Ext.ux.aceeditor.Panel', {
            tbar: toolbar,
            theme: 'eclipse',
            parser: 'openhabrules',
            layout: 'fit',
//            sourceCode: ruleSource,
            printMargin: true,
            fontSize: '12px'
        });

        this.items = [editor];

        this.callParent();
    }

})
;