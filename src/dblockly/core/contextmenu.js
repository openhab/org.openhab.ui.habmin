/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2011 Google Inc.
 * https://blockly.googlecode.com/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Functionality for the right-click context menus.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

Blockly.ContextMenu = {};


/**
 * Which block is the context menu attached to?
 * @type {Blockly.Block}
 */
Blockly.ContextMenu.currentBlock = null;

/**
 * Construct the menu based on the list of options and show the menu.
 * @param {!Event} e Mouse event.
 * @param {!Array.<!Object>} options Array of menu options.
 */
Blockly.ContextMenu.show = function (e, options) {
    // If there's already a menu open, we need to destroy it first
    // Failure to do so will corrupt the menu!
    if (Blockly.openMenu != null) {
        Ext.destroy(Blockly.openMenu);
        Blockly.openMenu = null;
    }

    Blockly.WidgetDiv.show(Blockly.ContextMenu, null);
    if (!options.length) {
        Blockly.ContextMenu.hide();
        return;
    }
    /* Here's what one option object looks like:
     {text: 'Make It So',
     enabled: true,
     callback: Blockly.MakeItSo}
     */
    var menuCfg = {
        renderTo: document.body,
        floating: true,
        items: [],
        shrinkWrap: 3,
        minWidth: 30,
        listeners: {
            hide: function (menu, item) {
                Ext.destroy(menu);
                Blockly.openMenu = null;
            }
        }
    };

    for (var x = 0, option; option = options[x]; x++) {
        var menuItem = {};
        menuItem.text = option.text;                 // Human-readable text.
        menuItem.disabled = !option.enabled;         // Human-readable text.
        if (option.enabled) {
            menuItem.handler = option.callback;
        }

        menuCfg.items.push(menuItem);
    }

    Blockly.openMenu = new Ext.menu.Menu(menuCfg);

    var scrollOffset = {};
    scrollOffset.x = 0;
    scrollOffset.y = 0;

    // Position the menu.
    var x = e.clientX + scrollOffset.x;
    var y = e.clientY + scrollOffset.y;
    //   Blockly.panel.add(Blockly.openMenu);

    Blockly.openMenu.showAt(x, y);

    Blockly.ContextMenu.currentBlock = null;  // May be set by Blockly.Block.
};

/**
 * Hide the context menu.
 */
Blockly.ContextMenu.hide = function () {
    Blockly.WidgetDiv.hideIfOwner(Blockly.ContextMenu);
    Blockly.ContextMenu.currentBlock = null;
};

/**
 * Create a callback function that creates and configures a block,
 *   then places the new block next to the original.
 * @param {!Blockly.Block} block Original block.
 * @param {!Element} xml XML representation of new block.
 * @return {!Function} Function that creates a block.
 */
Blockly.ContextMenu.callbackFactory = function (block, xml) {
    return function () {
        var newBlock = Blockly.Json.domToBlock(block.workspace, xml);
        // Move the new block next to the old block.
        var xy = block.getRelativeToSurfaceXY();
        if (Blockly.RTL) {
            xy.x -= Blockly.SNAP_RADIUS;
        } else {
            xy.x += Blockly.SNAP_RADIUS;
        }
        xy.y += Blockly.SNAP_RADIUS * 2;
        newBlock.moveBy(xy.x, xy.y);
        newBlock.select();
    };
};
