/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
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
 * @fileoverview Javascript object reader and writer.
 * ported from xml.js
 * @author chris@cd-jackson.com (Chris Jackson)
 */
'use strict';

Blockly.Json = {};

/**
 * Encode a block tree as XML.
 * @param {!Object} workspace The SVG workspace.
 * @return {!Object} XML document.
 */
Blockly.Json.getWorkspace = function (workspace) {
    var width = Blockly.svgSize().width;
    var json = {};
    json.block = [];
    var blocks = workspace.getTopBlocks(true);
    for (var i = 0, block; block = blocks[i]; i++) {
        var element = Blockly.Json.blockToDom_(block);
        var xy = block.getRelativeToSurfaceXY();
        element.x = Blockly.RTL ? width - xy.x : xy.x;
        element.y = xy.y;
        json.block.push(element);
    }
    return json;
};

/**
 * Return a javascript object tree
 * @param {!Blockly.Block} block The root block to encode.
 * @return {!Object} Tree of javascript object elements.
 * @private
 */
Blockly.Json.blockToDom_ = function (block) {
    var element = {};
    element.type = block.type;
    element.id = block.id;
    if (block.mutationToDom) {
        // Custom data for an advanced block.
        var mutation = block.mutationToDom();
        if (mutation) {
            element.mutation = mutation;
        }
    }
    function fieldToDom(field) {
        if (field.name && field.EDITABLE) {
            var container = {};
            container.name = field.name;
            container.value = field.getValue();
            if (element.fields == null)
                element.fields = [];
            element.fields.push(container);
        }
    }

    for (var x = 0, input; input = block.inputList[x]; x++) {
        for (var y = 0, field; field = input.fieldRow[y]; y++) {
            fieldToDom(field);
        }
    }

    if (block.comment) {
        var commentElement = {};
        commentElement.text = block.comment.getText();
        commentElement.pinned = block.comment.isVisible();
        var hw = block.comment.getBubbleSize();
        commentElement.h = hw.height;
        commentElement.w = hw.width;
        element.comment = commentElement;
    }

    var hasValues = false;
    for (var i = 0, input; input = block.inputList[i]; i++) {
        var container = {};
        if (input.type == Blockly.DUMMY_INPUT)
            continue;

        var childBlock = input.connection.targetBlock();
        if (input.type == Blockly.INPUT_VALUE) {
            container.type = 'value';
            hasValues = true;
        } else if (input.type == Blockly.NEXT_STATEMENT) {
            container.type = 'statement';
        }
        if (childBlock) {
            if (element.children == null)
                element.children = [];
            container.name = input.name;
            container.block = Blockly.Json.blockToDom_(childBlock);
            element.children.push(container);
        }
    }
    if (hasValues) {
        element.inline = block.inputsInline;
    }
    if (block.isCollapsed()) {
        element.collapsed = true;
    }
    if (block.disabled) {
        element.disabled = true;
    }
    if (!block.isDeletable()) {
        element.deletable = false;
    }
    if (!block.isMovable()) {
        element.movable = false;
    }
    if (!block.isEditable()) {
        element.editable = false;
    }

    if (block.nextConnection) {
        var nextBlock = block.nextConnection.targetBlock();
        if (nextBlock) {
            element.next = Blockly.Json.blockToDom_(nextBlock);
        }
    }

    return element;
};

/**
 * Decode an XML DOM and create blocks on the workspace.
 * @param {!Blockly.Workspace} workspace The SVG workspace.
 * @param {!Object} json input object array.
 */
Blockly.Json.setWorkspace = function (workspace, json) {
    var width = Blockly.svgSize().width;
    if (json == null || json.block == null)
        return;
    var blocks = [].concat(json.block);
    for (var x = 0; x < blocks.length; x++) {
        var child = blocks[x];
        var block = Blockly.Json.domToBlock(workspace, child);
        var blockX = parseInt(block.x, 10);
        var blockY = parseInt(block.y, 10);
        if (!isNaN(blockX) && !isNaN(blockY)) {
            block.moveBy(Blockly.RTL ? width - blockX : blockX, blockY);
        }
    }
};

/**
 * Decode an XML block tag and create a block (and possibly sub blocks) on the
 * workspace.
 * @param {!Blockly.Workspace} workspace The workspace.
 * @param {!Element} xmlBlock XML block element.
 * @param {boolean=} opt_reuseBlock Optional arg indicating whether to
 *     reinitialize an existing block.
 * @return {!Blockly.Block} The root block created.
 * @private
 */
Blockly.Json.domToBlock = function (workspace, jsonBlock, opt_reuseBlock) {
    var block = null;
    var prototypeName = jsonBlock.type;
    if (!prototypeName) {
        console.log('Block type unspecified');
        return null;
    }
    var id = jsonBlock.id;
    if (opt_reuseBlock && id) {
        block = Blockly.Block.getById(id, workspace);
        // TODO: The following is for debugging.  It should never actually happen.
        if (!block) {
            console.log('Couldn\'t get Block with id: ' + id);
            return null;
        }
        var parentBlock = block.getParent();
        // If we've already filled this block then we will dispose of it and then
        // re-fill it.
        if (block.workspace) {
            block.dispose(true, false, true);
        }
        block.fill(workspace, prototypeName);
        block.parent_ = parentBlock;
    } else {
        block = Blockly.Block.obtain(workspace, prototypeName);
    }
    if (!block.svg_) {
        block.initSvg();
    }

    var inline = jsonBlock.inline;
    if (inline != null) {
        block.setInputsInline(this.parseBoolean(inline));
    }
    var disabled = jsonBlock.disabled;
    if (disabled != null) {
        block.setDisabled(this.parseBoolean(disabled));
    }
    var deletable = jsonBlock.deletable;
    if (deletable != null) {
        block.setDeletable(this.parseBoolean(deletable));
    }
    var movable = jsonBlock.movable;
    if (movable != null) {
        block.setMovable(this.parseBoolean(movable));
    }
    var editable = jsonBlock.editable;
    if (editable != null) {
        block.setEditable(this.parseBoolean(editable));
    }

    if (jsonBlock.mutation != null) {
        // Custom data for an advanced block.
        if (block.domToMutation) {
            block.domToMutation(jsonBlock.mutation);
        }
    }

    if (jsonBlock.comment != null) {
        block.setCommentText(jsonBlock.comment.text);
        var visible = jsonBlock.comment.pinned;
        if (visible) {
            block.comment.setVisible(this.parseBoolean(visible));
        }
        var bubbleW = parseInt(jsonBlock.comment.w, 10);
        var bubbleH = parseInt(jsonBlock.comment.h, 10);
        if (!isNaN(bubbleW) && !isNaN(bubbleH)) {
            block.comment.setBubbleSize(bubbleW, bubbleH);
        }
    }

    if (jsonBlock.fields != null) {
        var fields = [].concat(jsonBlock.fields);
        for (var i = 0; i < fields.length; i++) {
            if (fields[i].value != null && fields[i].name != null)
                block.setFieldValue(fields[i].value, fields[i].name);
        }
    }

    var blockChild = null;
    if (jsonBlock.children != null) {
        var children = [].concat(jsonBlock.children);
        for (var x = 0; x < children.length; x++) {
            var child = children[x];
            var input;

            if (child.block != null) {
                input = block.getInput(child.name);
                if (!input) {
                    console.log('Input ' + child.name + ' does not exist in block ' + prototypeName);
                    continue;
                }
                blockChild = Blockly.Json.domToBlock(workspace, child.block, opt_reuseBlock);
                if (blockChild.outputConnection) {
                    input.connection.connect(blockChild.outputConnection);
                } else if (blockChild.previousConnection) {
                    input.connection.connect(blockChild.previousConnection);
                } else {
                    console.log('Child block does not have output or previous statement.');
                }
            }
        }
    }
    // Next
    if (jsonBlock.next) {
//                && firstRealGrandchild.nodeName.toLowerCase() == 'block') {
        if (!block.nextConnection) {
            console.log('Next statement does not exist.');
        } else if (block.nextConnection.targetConnection) {
            // This could happen if there is more than one XML 'next' tag.
            console.log('Next statement is already connected.');
        }
        blockChild = Blockly.Json.domToBlock(workspace, jsonBlock.next,
            opt_reuseBlock);
        if (!blockChild.previousConnection) {
            console.log('Next block does not have previous statement.');
        }
        else {
            block.nextConnection.connect(blockChild.previousConnection);
        }
    }


    var collapsed = jsonBlock.collapsed;
    if (collapsed != null) {
        block.setCollapsed(this.parseBoolean(collapsed));
    }
    var next = block.nextConnection && block.nextConnection.targetBlock();
    if (next) {
        // Next block in a stack needs to square off its corners.
        // Rendering a child will render its parent.
        next.render();
    } else {
        block.render();
    }
    return block;
};

Blockly.Json.parseBoolean = function (boolIn) {
    if (boolIn == true || boolIn == false)
        return boolIn;
    if (boolIn == 'true')
        return true;
    return false;
}

/**
 * Remove any 'next' block (statements in a stack).
 * @param {!Element} xmlBlock XML block element.
 */
Blockly.Json.deleteNext = function (jsonBlock) {
    if (jsonBlock.children != null) {
        var children = [].concat(jsonBlock.children);
        for (var x = 0; x < children.length; x++) {
        }
    }
    return;

    /*
     for (var x = 0, child; child = xmlBlock.childNodes[x]; x++) {
     if (child.nodeName.toLowerCase() == 'next') {
     xmlBlock.removeChild(child);
     break;
     }
     }*/
};
