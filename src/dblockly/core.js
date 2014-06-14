/*! ExtBlockly 2014-06-14 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/dom",
        "dojo/dom-class",
        "dojo/dom-construct",
        "dojo/string",
        "dojo/has",
        "dojo/_base/Color",
        "dojox/color",
        "dijit/layout/ContentPane",
        "dojo/sniff"
    ],
    function (declare, lang, dom, domClass, domConstruct, string, has, color, hsl, Container) {

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
 * @fileoverview Core JavaScript library for Blockly.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

// Top level object for Blockly.
var Blockly = {};


/**
 * Path to Blockly's directory.  Can be relative, absolute, or remote.
 * Used for loading additional resources.
 */
Blockly.pathToBlockly = './';

/**
 * Required name space for SVG elements.
 * @const
 */
Blockly.SVG_NS = 'http://www.w3.org/2000/svg';
/**
 * Required name space for HTML elements.
 * @const
 */
Blockly.HTML_NS = 'http://www.w3.org/1999/xhtml';

/**
 * The richness of block colours, regardless of the hue.
 * Must be in the range of 0 (inclusive) to 1 (exclusive).
 */
Blockly.HSV_SATURATION = 45;
/**
 * The intensity of block colours, regardless of the hue.
 * Must be in the range of 0 (inclusive) to 1 (exclusive).
 */
Blockly.HSV_VALUE = 65;

/**
 * Convert a hue (HSV model) into an RGB hex triplet.
 * @param {number} hue Hue on a colour wheel (0-360).
 * @return {string} RGB code, e.g. '#5ba65b'.
 */
Blockly.makeColour = function (hue) {
    return hsl.fromHsl(hue, Blockly.HSV_SATURATION, Blockly.HSV_VALUE);//.toString();
};

/**
 * ENUM for a right-facing value input.  E.g. 'test' or 'return'.
 * @const
 */
Blockly.INPUT_VALUE = 1;
/**
 * ENUM for a left-facing value output.  E.g. 'call random'.
 * @const
 */
Blockly.OUTPUT_VALUE = 2;
/**
 * ENUM for a down-facing block stack.  E.g. 'then-do' or 'else-do'.
 * @const
 */
Blockly.NEXT_STATEMENT = 3;
/**
 * ENUM for an up-facing block stack.  E.g. 'close screen'.
 * @const
 */
Blockly.PREVIOUS_STATEMENT = 4;
/**
 * ENUM for an dummy input.  Used to add field(s) with no input.
 * @const
 */
Blockly.DUMMY_INPUT = 5;

/**
 * ENUM for left alignment.
 * @const
 */
Blockly.ALIGN_LEFT = -1;
/**
 * ENUM for centre alignment.
 * @const
 */
Blockly.ALIGN_CENTRE = 0;
/**
 * ENUM for right alignment.
 * @const
 */
Blockly.ALIGN_RIGHT = 1;

/**
 * Lookup table for determining the opposite type of a connection.
 * @const
 */
Blockly.OPPOSITE_TYPE = [];
Blockly.OPPOSITE_TYPE[Blockly.INPUT_VALUE] = Blockly.OUTPUT_VALUE;
Blockly.OPPOSITE_TYPE[Blockly.OUTPUT_VALUE] = Blockly.INPUT_VALUE;
Blockly.OPPOSITE_TYPE[Blockly.NEXT_STATEMENT] = Blockly.PREVIOUS_STATEMENT;
Blockly.OPPOSITE_TYPE[Blockly.PREVIOUS_STATEMENT] = Blockly.NEXT_STATEMENT;

/**
 * Database of pre-loaded sounds.
 * @private
 * @const
 */
Blockly.SOUNDS_ = Object.create(null);

/**
 * Currently selected block.
 * @type {Blockly.Block}
 */
Blockly.selected = null;

/**
 * Is Blockly in a read-only, non-editable mode?
 * Note that this property may only be set before init is called.
 * It can't be used to dynamically toggle editability on and off.
 */
Blockly.readOnly = false;

/**
 * Currently highlighted connection (during a drag).
 * @type {Blockly.Connection}
 * @private
 */
Blockly.highlightedConnection_ = null;

/**
 * Connection on dragged block that matches the highlighted connection.
 * @type {Blockly.Connection}
 * @private
 */
Blockly.localConnection_ = null;

/**
 * Number of pixels the mouse must move before a drag starts.
 * @const
 */
Blockly.DRAG_RADIUS = 5;

/**
 * Maximum misalignment between connections for them to snap together.
 * @const
 */
Blockly.SNAP_RADIUS = 20;

/**
 * Delay in ms between trigger and bumping unconnected block out of alignment.
 * @const
 */
Blockly.BUMP_DELAY = 250;

/**
 * Number of characters to truncate a collapsed block to.
 * @const
 */
Blockly.COLLAPSE_CHARS = 30;

/**
 * The main workspace (defined by inject.js).
 * @type {Blockly.Workspace}
 */
Blockly.mainWorkspace = null;

/**
 * Contents of the local clipboard.
 * @type {Element}
 * @private
 */
Blockly.clipboard_ = null;

/**
 * Returns the dimensions of the current SVG image.
 * @return {!Object} Contains width and height properties.
 */
Blockly.svgSize = function () {
    return {width: Blockly.svg.cachedWidth_,
        height: Blockly.svg.cachedHeight_};
};

/**
 * Size the SVG image to completely fill its container.
 * Record the height/width of the SVG image.
 */
Blockly.svgResize = function () {
    var svg = Blockly.svg;
    var div = svg.parentNode;
    var width = div.clientWidth;
    var height = div.clientHeight;
    if (svg.cachedWidth_ != width) {
        svg.setAttribute('width', width + 'px');
        svg.cachedWidth_ = width;
    }
    if (svg.cachedHeight_ != height) {
        svg.setAttribute('height', height + 'px');
        svg.cachedHeight_ = height;
    }
    // Update the scrollbars (if they exist).
    if (Blockly.mainWorkspace.scrollbar) {
        Blockly.mainWorkspace.scrollbar.resize();
    }
    // Flip the trash can lid if needed.
    if (Blockly.mainWorkspace.trashcan) {
        Blockly.mainWorkspace.trashcan.position_();
    }
};

/**
 * Handle a mouse-down on SVG drawing surface.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.onMouseDown_ = function (e) {
    console.log("Blockly mouse down");
    Blockly.svgResize();
    Blockly.terminateDrag_(); // In case mouse-up event was lost.
    Blockly.hideChaff();
    var isTargetSvg = e.target && e.target.nodeName &&
        e.target.nodeName.toLowerCase() == 'svg';
    if (!Blockly.readOnly && Blockly.selected && isTargetSvg) {
        // Clicking on the document clears the selection.
        Blockly.selected.unselect();
    }
    if (e.target == Blockly.svg && Blockly.isRightButton(e)) {
        // Right-click.
        Blockly.showContextMenu_(e);
    } else if ((Blockly.readOnly || isTargetSvg) &&
        Blockly.mainWorkspace.scrollbar) {
        // If the workspace is editable, only allow dragging when gripping empty
        // space.  Otherwise, allow dragging when gripping anywhere.
        Blockly.mainWorkspace.dragMode = true;
        // Record the current mouse position.
        Blockly.mainWorkspace.startDragMouseX = e.clientX;
        Blockly.mainWorkspace.startDragMouseY = e.clientY;
        Blockly.mainWorkspace.startDragMetrics =
            Blockly.mainWorkspace.getMetrics();
        Blockly.mainWorkspace.startScrollX = Blockly.mainWorkspace.scrollX;
        Blockly.mainWorkspace.startScrollY = Blockly.mainWorkspace.scrollY;
    }
};

/**
 * Handle a mouse-up anywhere on the page.
 * @param {!Event} e Mouse up event.
 * @private
 */
Blockly.onMouseUp_ = function (e) {
    Blockly.setCursorHand_(false);
    Blockly.mainWorkspace.dragMode = false;
};

/**
 * Handle a mouse-move on SVG drawing surface.
 * @param {!Event} e Mouse move event.
 * @private
 */
Blockly.onMouseMove_ = function (e) {
//    console.log("Blockly mouse move (" + Blockly.mainWorkspace.dragMode + ")");

    if (Blockly.mainWorkspace.dragMode) {
//        console.log("Dragging!!!");
        Blockly.removeAllRanges();
        var dx = e.clientX - Blockly.mainWorkspace.startDragMouseX;
        var dy = e.clientY - Blockly.mainWorkspace.startDragMouseY;
        var metrics = Blockly.mainWorkspace.startDragMetrics;
        var x = Blockly.mainWorkspace.startScrollX + dx;
        var y = Blockly.mainWorkspace.startScrollY + dy;
        x = Math.min(x, -metrics.contentLeft);
        y = Math.min(y, -metrics.contentTop);
        x = Math.max(x, metrics.viewWidth - metrics.contentLeft -
            metrics.contentWidth);
        y = Math.max(y, metrics.viewHeight - metrics.contentTop -
            metrics.contentHeight);

        // Move the scrollbars and the page will scroll automatically.
        Blockly.mainWorkspace.scrollbar.set(-x - metrics.contentLeft,
                -y - metrics.contentTop);
    }
};

/**
 * Handle a key-down on SVG drawing surface.
 * @param {!Event} e Key down event.
 * @private
 */
Blockly.onKeyDown_ = function (e) {
    if (Blockly.isTargetInput_(e)) {
        // When focused on an HTML text input widget, don't trap any keys.
        return;
    }
    // TODO: Add keyboard support for cursoring around the context menu.
    if (e.keyCode == 27) {
        // Pressing esc closes the context menu.
        Blockly.hideChaff();
    } else if (e.keyCode == 8 || e.keyCode == 46) {
        // Delete or backspace.
        try {
            if (Blockly.selected && Blockly.selected.isDeletable()) {
                Blockly.hideChaff();
                Blockly.selected.dispose(true, true);
            }
        } finally {
            // Stop the browser from going back to the previous page.
            // Use a finally so that any error in delete code above doesn't disappear
            // from the console when the page rolls back.
            e.preventDefault();
        }
    } else if (e.altKey || e.ctrlKey || e.metaKey) {
        if (Blockly.selected && Blockly.selected.isDeletable() &&
            Blockly.selected.workspace == Blockly.mainWorkspace) {
            Blockly.hideChaff();
            if (e.keyCode == 67) {
                // 'c' for copy.
                Blockly.copy_(Blockly.selected);
            } else if (e.keyCode == 88) {
                // 'x' for cut.
                Blockly.copy_(Blockly.selected);
                Blockly.selected.dispose(true, true);
            }
        }
        if (e.keyCode == 86) {
            // 'v' for paste.
            if (Blockly.clipboard_) {
                Blockly.mainWorkspace.paste(Blockly.clipboard_);
            }
        }
    }
};

/**
 * Stop binding to the global mouseup and mousemove events.
 * @private
 */
Blockly.terminateDrag_ = function () {
    Blockly.Block.terminateDrag_();
    Blockly.Flyout.terminateDrag_();
};

/**
 * Copy a block onto the local clipboard.
 * @param {!Blockly.Block} block Block to be copied.
 * @private
 */
Blockly.copy_ = function (block) {
    var xmlBlock = Blockly.Json.blockToDom_(block);
    Blockly.Json.deleteNext(xmlBlock);
    // Encode start position in XML.
    var xy = block.getRelativeToSurfaceXY();
    xmlBlock.setAttribute('x', Blockly.RTL ? -xy.x : xy.x);
    xmlBlock.setAttribute('y', xy.y);
    Blockly.clipboard_ = xmlBlock;
};

/**
 * Show the context menu for the workspace.
 * @param {!Event} e Mouse event.
 * @private
 */
Blockly.showContextMenu_ = function (e) {
    if (Blockly.readOnly) {
        return;
    }
    var options = [];

    if (Blockly.collapse) {
        var hasCollapsedBlocks = false;
        var hasExpandedBlocks = false;
        var topBlocks = Blockly.mainWorkspace.getTopBlocks(false);
        for (var i = 0; i < topBlocks.length; i++) {
            if (topBlocks[i].isCollapsed()) {
                hasCollapsedBlocks = true;
            } else {
                hasExpandedBlocks = true;
            }
        }

        // Option to collapse top blocks.
        var collapseOption = {enabled: hasExpandedBlocks};
        collapseOption.text = Blockly.Msg.COLLAPSE_ALL;
        collapseOption.callback = function () {
            for (var i = 0; i < topBlocks.length; i++) {
                topBlocks[i].setCollapsed(true);
            }
        };
        options.push(collapseOption);

        // Option to expand top blocks.
        var expandOption = {enabled: hasCollapsedBlocks};
        expandOption.text = Blockly.Msg.EXPAND_ALL;
        expandOption.callback = function () {
            for (var i = 0; i < topBlocks.length; i++) {
                topBlocks[i].setCollapsed(false);
            }
        };
        options.push(expandOption);
    }

    Blockly.ContextMenu.show(e, options);
};

/**
 * Cancel the native context menu, unless the focus is on an HTML input widget.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.onContextMenu_ = function (e) {
    if (!Blockly.isTargetInput_(e)) {
        // When focused on an HTML text input widget, don't cancel the context menu.
        e.preventDefault();
    }
};

/**
 * Close tooltips, context menus, dropdown selections, etc.
 * @param {boolean=} opt_allowToolbox If true, don't close the toolbox.
 */
Blockly.hideChaff = function (opt_allowToolbox) {
    Blockly.Tooltip.hide();
    Blockly.WidgetDiv.hide();
};

/**
 * Deselect any selections on the webpage.
 * Chrome will select text outside the SVG when double-clicking.
 * Deselect this text, so that it doesn't mess up any subsequent drag.
 */
Blockly.removeAllRanges = function () {
    if (window.getSelection) {  // W3
        var sel = window.getSelection();
        if (sel && sel.removeAllRanges) {
            sel.removeAllRanges();
            window.setTimeout(function () {
                try {
                    window.getSelection().removeAllRanges();
                } catch (e) {
                    // MSIE throws 'error 800a025e' here.
                }
            }, 0);
        }
    }
};

/**
 * Is this event targeting a text input widget?
 * @param {!Event} e An event.
 * @return {boolean} True if text input.
 * @private
 */
Blockly.isTargetInput_ = function (e) {
    return e.target.type == 'textarea' || e.target.type == 'text';
};

/**
 * Load an audio file.  Cache it, ready for instantaneous playing.
 * @param {!Array.<string>} filenames List of file types in decreasing order of
 *   preference (i.e. increasing size).  E.g. ['media/go.mp3', 'media/go.wav']
 *   Filenames include path from Blockly's root.  File extensions matter.
 * @param {string} name Name of sound.
 * @private
 */
Blockly.loadAudio_ = function (filenames, name) {
    if (!window['Audio'] || !filenames.length) {
        // No browser support for Audio.
        return;
    }
    var sound;
    var audioTest = new window['Audio']();
    for (var i = 0; i < filenames.length; i++) {
        var filename = filenames[i];
        var ext = filename.match(/\.(\w+)$/);
        if (ext && audioTest.canPlayType('audio/' + ext[1])) {
            // Found an audio format we can play.
            sound = new window['Audio'](Blockly.pathToBlockly + filename);
            break;
        }
    }
    // To force the browser to load the sound, play it, but at nearly zero volume.
    if (sound && sound.play) {
        sound.volume = 0.01;
        sound.play();
        Blockly.SOUNDS_[name] = sound;
    }
};

/**
 * Play an audio file at specified value.  If volume is not specified,
 * use full volume (1).
 * @param {string} name Name of sound.
 * @param {?number} opt_volume Volume of sound (0-1).
 */
Blockly.playAudio = function (name, opt_volume) {
    var sound = Blockly.SOUNDS_[name];
    if (sound) {
        var mySound;
/*        if (Ext.is.Phone || Ext.is.Tablet) {
            // Creating a new audio node causes lag in IE9, Android and iPad. Android
            // and IE9 refetch the file from the server, iPad uses a singleton audio
            // node which must be deleted and recreated for each new audio tag.
            mySound = sound;
        } else {*/
            mySound = sound.cloneNode();
//        }
        mySound.volume = (opt_volume === undefined ? 1 : opt_volume);
        mySound.play();
    }
};

/**
 * Set the mouse cursor to be either a closed hand or the default.
 * @param {boolean} closed True for closed hand.
 * @private
 */
Blockly.setCursorHand_ = function (closed) {
    if (Blockly.readOnly) {
        return;
    }
    /* Hotspot coordinates are baked into the CUR file, but they are still
     required due to a Chrome bug.
     http://code.google.com/p/chromium/issues/detail?id=1446 */
    var cursor = '';
    if (closed) {
        cursor = 'url(' + Blockly.pathToBlockly + 'media/handclosed.cur) 7 3, auto';
    }
    if (Blockly.selected) {
        Blockly.selected.getSvgRoot().style.cursor = cursor;
    }
    // Set cursor on the SVG surface as well as block so that rapid movements
    // don't result in cursor changing to an arrow momentarily.
    Blockly.svg.style.cursor = cursor;
};

/**
 * Return an object with all the metrics required to size scrollbars for the
 * main workspace.  The following properties are computed:
 * .viewHeight: Height of the visible rectangle,
 * .viewWidth: Width of the visible rectangle,
 * .contentHeight: Height of the contents,
 * .contentWidth: Width of the content,
 * .viewTop: Offset of top edge of visible rectangle from parent,
 * .viewLeft: Offset of left edge of visible rectangle from parent,
 * .contentTop: Offset of the top-most content from the y=0 coordinate,
 * .contentLeft: Offset of the left-most content from the x=0 coordinate.
 * .absoluteTop: Top-edge of view.
 * .absoluteLeft: Left-edge of view.
 * @return {Object} Contains size and position metrics of main workspace.
 * @private
 */
Blockly.getMainWorkspaceMetrics_ = function () {
    var svgSize = Blockly.svgSize();
    var viewWidth = svgSize.width - Blockly.Scrollbar.scrollbarThickness;
    var viewHeight = svgSize.height - Blockly.Scrollbar.scrollbarThickness;
    try {
        var blockBox = Blockly.mainWorkspace.getCanvas().getBBox();
    } catch (e) {
        // Firefox has trouble with hidden elements (Bug 528969).
        return null;
    }
    if (Blockly.mainWorkspace.scrollbar) {
        // Add a border around the content that is at least half a screenful wide.
        // Ensure border is wide enough that blocks can scroll over entire screen.
        var leftEdge = Math.min(blockBox.x - viewWidth / 2,
                blockBox.x + blockBox.width - viewWidth);
        var rightEdge = Math.max(blockBox.x + blockBox.width + viewWidth / 2,
                blockBox.x + viewWidth);
        var topEdge = Math.min(blockBox.y - viewHeight / 2,
                blockBox.y + blockBox.height - viewHeight);
        var bottomEdge = Math.max(blockBox.y + blockBox.height + viewHeight / 2,
                blockBox.y + viewHeight);
    } else {
        var leftEdge = blockBox.x;
        var rightEdge = leftEdge + blockBox.width;
        var topEdge = blockBox.y;
        var bottomEdge = topEdge + blockBox.height;
    }
    var metrics = {
        viewHeight: svgSize.height,
        viewWidth: svgSize.width,
        contentHeight: bottomEdge - topEdge,
        contentWidth: rightEdge - leftEdge,
        viewTop: -Blockly.mainWorkspace.scrollY,
        viewLeft: -Blockly.mainWorkspace.scrollX,
        contentTop: topEdge,
        contentLeft: leftEdge,
        absoluteTop: 0,
        absoluteLeft: 0
    };
    return metrics;
};

/**
 * Sets the X/Y translations of the main workspace to match the scrollbars.
 * @param {!Object} xyRatio Contains an x and/or y property which is a float
 *     between 0 and 1 specifying the degree of scrolling.
 * @private
 */
Blockly.setMainWorkspaceMetrics_ = function (xyRatio) {
    if (!Blockly.mainWorkspace.scrollbar) {
        throw 'Attempt to set main workspace scroll without scrollbars.';
    }
    var metrics = Blockly.getMainWorkspaceMetrics_();
    if (!isNaN(xyRatio.x)) {
        Blockly.mainWorkspace.scrollX = -metrics.contentWidth * xyRatio.x -
            metrics.contentLeft;
    }
    if (!isNaN(xyRatio.y)) {
        Blockly.mainWorkspace.scrollY = -metrics.contentHeight * xyRatio.y -
            metrics.contentTop;
    }
    var translation = 'translate(' +
        (Blockly.mainWorkspace.scrollX + metrics.absoluteLeft) + ',' +
        (Blockly.mainWorkspace.scrollY + metrics.absoluteTop) + ')';
    Blockly.mainWorkspace.getCanvas().setAttribute('transform', translation);
    Blockly.mainWorkspace.getBubbleCanvas().setAttribute('transform',
        translation);
};

/**
 * Execute a command.  Generally, a command is the result of a user action
 * e.g., a click, drag or context menu selection.  Calling the cmdThunk function
 * through doCommand() allows us to capture information that can be used for
 * capabilities like undo (which is supported by the realtime collaboration
 * feature).
 * @param {function()} cmdThunk A function representing the command execution.
 */
Blockly.doCommand = function (cmdThunk) {
    cmdThunk();
};

/**
 * When something in Blockly's workspace changes, call a function.
 * @param {!Function} func Function to call.
 * @return {!Array.<!Array>} Opaque data that can be passed to
 *     removeChangeListener.
 */
Blockly.addChangeListener = function (func) {
    return Blockly.bindEvent_(Blockly.mainWorkspace.getCanvas(),
        'blocklyWorkspaceChange', null, func);
};

/**
 * Stop listening for Blockly's workspace changes.
 * @param {!Array.<!Array>} bindData Opaque data from addChangeListener.
 */
Blockly.removeChangeListener = function (bindData) {
    Blockly.unbindEvent_(bindData);
};

/**
 * Returns the main workspace.
 * @return {!Blockly.Workspace} The main workspace.
 */
Blockly.getMainWorkspace = function () {
    return Blockly.mainWorkspace;
};

/**
 * Inherit the prototype methods from one constructor into another.
 * @param {Function} childCtor Child class.
 * @param {Function} parentCtor Parent class.
 */
Blockly.inherits = function (childCtor, parentCtor) {
    /** @constructor */
    function tempCtor() {
    };
    tempCtor.prototype = parentCtor.prototype;
    childCtor.superClass_ = parentCtor.prototype;
    childCtor.prototype = new tempCtor();
    childCtor.prototype.constructor = childCtor;
};

Blockly.caseInsensitiveCompare = function (str1, str2) {
    var test1 = String(str1).toLowerCase();
    var test2 = String(str2).toLowerCase();

    if (test1 < test2) {
        return -1;
    } else if (test1 == test2) {
        return 0;
    } else {
        return 1;
    }
};

/**
 * Removes all the child nodes on a DOM node.
 * @param {Node} node Node to remove children from.
 */
Blockly.removeChildren = function (node) {
    // Note: Iterations over live collections can be slow, this is the fastest
    // we could find. The double parenthesis are used to prevent JsCompiler and
    // strict warnings.
    var child;
    while ((child = node.firstChild)) {
        node.removeChild(child);
    }
};

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
 * @fileoverview The class representing one block.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';


/**
 * Unique ID counter for created blocks.
 * @private
 */
Blockly.uidCounter_ = 0;

/**
 * Get the Blockly.uidCounter_
 * @return {number}
 */
Blockly.getUidCounter = function () {
    return Blockly.uidCounter_;
};

/**
 * Set the Blockly.uidCounter_
 * @param {number} val The value to set the counter to.
 */
Blockly.setUidCounter = function (val) {
    Blockly.uidCounter_ = val;
};

/**
 * Generate a unique id.  This will be locally or globally unique, depending on
 * whether we are in single user or realtime collaborative mode.
 * @return {string}
 */
Blockly.genUid = function () {
    var uid = (++Blockly.uidCounter_).toString();
    return uid;
};

/**
 * Class for one block.
 * @constructor
 */
Blockly.Block = function () {
};

/**
 * Obtain a newly created block.
 * @param {!Blockly.Workspace} workspace The block's workspace.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @return {!Blockly.Block} The created block
 */
Blockly.Block.obtain = function (workspace, prototypeName) {
    var newBlock = new Blockly.Block();
    newBlock.initialize(workspace, prototypeName);
    return newBlock;
};

/**
 * Initialization for one block.
 * @param {!Blockly.Workspace} workspace The new block's workspace.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 */
Blockly.Block.prototype.initialize = function (workspace, prototypeName) {
    this.id = Blockly.genUid();
    workspace.addTopBlock(this);
    this.fill(workspace, prototypeName);
    // Bind an onchange function, if it exists.
    if (typeof(this.onchange) == "function") {
        Blockly.bindEvent_(workspace.getCanvas(), 'blocklyWorkspaceChange', this, this.onchange);
    }
};

/**
 * Fill a block with initial values.
 * @param {!Blockly.Workspace} workspace The workspace to use.
 * @param {string} prototypeName The typename of the block.
 */
Blockly.Block.prototype.fill = function (workspace, prototypeName) {
    this.outputConnection = null;
    this.nextConnection = null;
    this.previousConnection = null;
    this.inputList = [];
    this.inputsInline = false;
    this.rendered = false;
    this.disabled = false;
    this.tooltip = '';
    this.contextMenu = true;

    this.parentBlock_ = null;
    this.childBlocks_ = [];
    this.deletable_ = true;
    this.movable_ = true;
    this.editable_ = true;
    this.collapsed_ = false;

    this.workspace = workspace;
    this.isInFlyout = workspace.isFlyout;

    // Copy the type-specific functions and data from the prototype.
    if (prototypeName) {
        this.type = prototypeName;
        var prototype = Blockly.Blocks[prototypeName];
        if (typeof(prototype) !== "object")
            console.log('Error: "%s" is an unknown language block.', prototypeName);
        lang.mixin(this, prototype);
    }
    // Call an initialization function, if it exists.
    if (typeof(this.init) == "function") {
        this.init();
    }
};

/**
 * Get an existing block.
 * @param {string} id The block's id.
 * @param {!Blockly.Workspace} workspace The block's workspace.
 * @return {Blockly.Block} The found block, or null if not found.
 */
Blockly.Block.getById = function (id, workspace) {
    return workspace.getBlockById(id);
};

/**
 * Pointer to SVG representation of the block.
 * @type {Blockly.BlockSvg}
 * @private
 */
Blockly.Block.prototype.svg_ = null;

/**
 * Block's mutator icon (if any).
 * @type {Blockly.Mutator}
 */
Blockly.Block.prototype.mutator = null;

/**
 * Block's comment icon (if any).
 * @type {Blockly.Comment}
 */
Blockly.Block.prototype.comment = null;

/**
 * Block's warning icon (if any).
 * @type {Blockly.Warning}
 */
Blockly.Block.prototype.warning = null;

/**
 * Returns a list of mutator, comment, and warning icons.
 * @return {!Array} List of icons.
 */
Blockly.Block.prototype.getIcons = function () {
    var icons = [];
    if (this.mutator) {
        icons.push(this.mutator);
    }
    if (this.comment) {
        icons.push(this.comment);
    }
    if (this.warning) {
        icons.push(this.warning);
    }
    return icons;
};

/**
 * Create and initialize the SVG representation of the block.
 */
Blockly.Block.prototype.initSvg = function () {
    this.svg_ = new Blockly.BlockSvg(this);
    this.svg_.init();
    if (!Blockly.readOnly) {
        Blockly.bindEvent_(this.svg_.getRootElement(), 'mousedown', this,
            this.onMouseDown_);
    }
    this.workspace.getCanvas().appendChild(this.svg_.getRootElement());
};

/**
 * Return the root node of the SVG or null if none exists.
 * @return {Element} The root SVG node (probably a group).
 */
Blockly.Block.prototype.getSvgRoot = function () {
    return this.svg_ && this.svg_.getRootElement();
};

/**
 * Is the mouse dragging a block?
 * 0 - No drag operation.
 * 1 - Still inside the sticky DRAG_RADIUS.
 * 2 - Freely draggable.
 * @private
 */
Blockly.Block.dragMode_ = 0;

/**
 * Wrapper function called when a mouseUp occurs during a drag operation.
 * @type {Array.<!Array>}
 * @private
 */
Blockly.Block.onMouseUpWrapper_ = null;

/**
 * Wrapper function called when a mouseMove occurs during a drag operation.
 * @type {Array.<!Array>}
 * @private
 */
Blockly.Block.onMouseMoveWrapper_ = null;

/**
 * Stop binding to the global mouseup and mousemove events.
 * @private
 */
Blockly.Block.terminateDrag_ = function () {
    if (Blockly.Block.onMouseUpWrapper_) {
        Blockly.unbindEvent_(Blockly.Block.onMouseUpWrapper_);
        Blockly.Block.onMouseUpWrapper_ = null;
    }
    if (Blockly.Block.onMouseMoveWrapper_) {
        Blockly.unbindEvent_(Blockly.Block.onMouseMoveWrapper_);
        Blockly.Block.onMouseMoveWrapper_ = null;
    }
    var selected = Blockly.selected;
    if (Blockly.Block.dragMode_ == 2) {
        // Terminate a drag operation.
        if (selected) {
            // Update the connection locations.
            var xy = selected.getRelativeToSurfaceXY();
            var dx = xy.x - selected.startDragX;
            var dy = xy.y - selected.startDragY;
            selected.moveConnections_(dx, dy);
            delete selected.draggedBubbles_;
            selected.setDragging_(false);
            selected.render();
            window.setTimeout(lang.hitch(selected, selected.bumpNeighbours_), Blockly.BUMP_DELAY);

            // Update the scrollbars (if they exist).
            if (Blockly.mainWorkspace.scrollbar) {
                Blockly.mainWorkspace.scrollbar.resize();
            }
        }
    }
    if (selected) {
        selected.workspace.fireChangeEvent();
    }
    Blockly.Block.dragMode_ = 0;
};

/**
 * Select this block.  Highlight it visually.
 */
Blockly.Block.prototype.select = function () {
    if (typeof(this.svg_) !== "object")
        console.log('Block is not rendered.');
    if (Blockly.selected) {
        // Unselect any previously selected block.
        Blockly.selected.unselect();
    }
    Blockly.selected = this;
    this.svg_.addSelect();
    Blockly.fireUiEvent(this.workspace.getCanvas(), 'blocklySelectChange');
};

/**
 * Unselect this block.  Remove its highlighting.
 */
Blockly.Block.prototype.unselect = function () {
    if (typeof(this.svg_) !== "object")
        console.log('Block is not rendered.');
    Blockly.selected = null;
    this.svg_.removeSelect();
    Blockly.fireUiEvent(this.workspace.getCanvas(), 'blocklySelectChange');
};

/**
 * Dispose of this block.
 * @param {boolean} healStack If true, then try to heal any gap by connecting
 *     the next statement with the previous statement.  Otherwise, dispose of
 *     all children of this block.
 * @param {boolean} animate If true, show a disposal animation and sound.
 * @param {boolean} dontRemoveFromWorkspace If true, don't remove this block
 *     from the workspace's list of top blocks.
 */
Blockly.Block.prototype.dispose = function (healStack, animate, dontRemoveFromWorkspace) {
    // Switch off rerendering.
    this.rendered = false;
    this.unplug(healStack);

    if (animate && this.svg_) {
        this.svg_.disposeUiEffect();
    }

    // This block is now at the top of the workspace.
    // Remove this block from the workspace's list of top-most blocks.
    if (this.workspace && !dontRemoveFromWorkspace) {
        this.workspace.removeTopBlock(this);
        this.workspace = null;
    }

    // Just deleting this block from the DOM would result in a memory leak as
    // well as corruption of the connection database.  Therefore we must
    // methodically step through the blocks and carefully disassemble them.

    if (Blockly.selected == this) {
        Blockly.selected = null;
        // If there's a drag in-progress, unlink the mouse events.
        Blockly.terminateDrag_();
    }

    // If this block has a context menu open, close it.
    if (Blockly.ContextMenu.currentBlock == this) {
        Blockly.ContextMenu.hide();
    }

    // First, dispose of all my children.
    for (var x = this.childBlocks_.length - 1; x >= 0; x--) {
        this.childBlocks_[x].dispose(false);
    }
    // Then dispose of myself.
    var icons = this.getIcons();
    for (var x = 0; x < icons.length; x++) {
        icons[x].dispose();
    }
    // Dispose of all inputs and their fields.
    for (var x = 0, input; input = this.inputList[x]; x++) {
        input.dispose();
    }
    this.inputList = [];
    // Dispose of any remaining connections (next/previous/output).
    var connections = this.getConnections_(true);
    for (var x = 0; x < connections.length; x++) {
        var connection = connections[x];
        if (connection.targetConnection) {
            connection.disconnect();
        }
        connections[x].dispose();
    }
    // Dispose of the SVG and break circular references.
    if (this.svg_) {
        this.svg_.dispose();
        this.svg_ = null;
    }
};

/**
 * Unplug this block from its superior block.  If this block is a statement,
 * optionally reconnect the block underneath with the block on top.
 * @param {boolean} healStack Disconnect child statement and reconnect stack.
 * @param {boolean} bump Move the unplugged block sideways a short distance.
 */
Blockly.Block.prototype.unplug = function (healStack, bump) {
    bump = bump && !!this.getParent();
    if (this.outputConnection) {
        if (this.outputConnection.targetConnection) {
            // Disconnect from any superior block.
            this.setParent(null);
        }
    } else {
        var previousTarget = null;
        if (this.previousConnection && this.previousConnection.targetConnection) {
            // Remember the connection that any next statements need to connect to.
            previousTarget = this.previousConnection.targetConnection;
            // Detach this block from the parent's tree.
            this.setParent(null);
        }
        if (healStack && this.nextConnection &&
            this.nextConnection.targetConnection) {
            // Disconnect the next statement.
            var nextTarget = this.nextConnection.targetConnection;
            var nextBlock = this.nextConnection.targetBlock();
            nextBlock.setParent(null);
            if (previousTarget) {
                // Attach the next statement to the previous statement.
                previousTarget.connect(nextTarget);
            }
        }
    }
    if (bump) {
        // Bump the block sideways.
        var dx = Blockly.SNAP_RADIUS * (Blockly.RTL ? -1 : 1);
        var dy = Blockly.SNAP_RADIUS * 2;
        this.moveBy(dx, dy);
    }
};

/**
 * Return the coordinates of the top-left corner of this block relative to the
 * drawing surface's origin (0,0).
 * @return {!Object} Object with .x and .y properties.
 */
Blockly.Block.prototype.getRelativeToSurfaceXY = function () {
    var x = 0;
    var y = 0;
    if (this.svg_) {
        var element = this.svg_.getRootElement();
        do {
            // Loop through this block and every parent.
            var xy = Blockly.getRelativeXY_(element);
            x += xy.x;
            y += xy.y;
            element = element.parentNode;
        } while (element && element != this.workspace.getCanvas());
    }
    return {x: x, y: y};
};

/**
 * Move a block by a relative offset.
 * @param {number} dx Horizontal offset.
 * @param {number} dy Vertical offset.
 */
Blockly.Block.prototype.moveBy = function (dx, dy) {
    var xy = this.getRelativeToSurfaceXY();
    this.svg_.getRootElement().setAttribute('transform',
            'translate(' + (xy.x + dx) + ', ' + (xy.y + dy) + ')');
    this.moveConnections_(dx, dy);
};

/**
 * Returns a bounding box describing the dimensions of this block
 * and any blocks stacked below it.
 * @return {!Object} Object with height and width properties.
 */
Blockly.Block.prototype.getHeightWidth = function () {
    var height = this.svg_.height;
    var width = this.svg_.width;
    // Recursively add size of subsequent blocks.
    var nextBlock = this.nextConnection && this.nextConnection.targetBlock();
    if (nextBlock) {
        var nextHeightWidth = nextBlock.getHeightWidth();
        height += nextHeightWidth.height - 4;  // Height of tab.
        width = Math.max(width, nextHeightWidth.width);
    }
    return {height: height, width: width};
};

/**
 * Handle a mouse-down on an SVG block.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.Block.prototype.onMouseDown_ = function (e) {
    console.log("block.onMouseDown " + this.id + " (" + e.clientX + ","+ e.clientY + ")" );

    if (this.isInFlyout) {
        return;
    }
    // Update Blockly's knowledge of its own location.
    Blockly.svgResize();
    // Update the scrollbars (if they exist).
    if (Blockly.mainWorkspace.scrollbar) {
        Blockly.mainWorkspace.scrollbar.resize();
    }
    Blockly.terminateDrag_();
    this.select();
    Blockly.hideChaff();
    if (Blockly.isRightButton(e)) {
        // Right-click.
        this.showContextMenu_(e);
    } else if (!this.isMovable()) {
        // Allow unmovable blocks to be selected and context menued, but not
        // dragged.  Let this event bubble up to document, so the workspace may be
        // dragged instead.
        return;
    } else {
        // Left-click (or middle click)
        Blockly.removeAllRanges();
        Blockly.setCursorHand_(true);
        // Look up the current translation and record it.
        var xy = this.getRelativeToSurfaceXY();
        this.startDragX = xy.x;
        this.startDragY = xy.y;
        // Record the current mouse position.
        this.startDragMouseX = e.clientX;
        this.startDragMouseY = e.clientY;
        Blockly.Block.dragMode_ = 1;
        Blockly.Block.onMouseUpWrapper_ = Blockly.bindEvent_(document,
            'mouseup', this, this.onMouseUp_);
        Blockly.Block.onMouseMoveWrapper_ = Blockly.bindEvent_(document,
            'mousemove', this, this.onMouseMove_);
        // Build a list of bubbles that need to be moved and where they started.
        this.draggedBubbles_ = [];
        var descendants = this.getDescendants();
        for (var x = 0, descendant; descendant = descendants[x]; x++) {
            var icons = descendant.getIcons();
            for (var y = 0; y < icons.length; y++) {
                var data = icons[y].getIconLocation();
                data.bubble = icons[y];
                this.draggedBubbles_.push(data);
            }
        }
    }
    // This event has been handled.  No need to bubble up to the document.
    e.stopPropagation();
};

/**
 * Handle a mouse-up anywhere in the SVG pane.  Is only registered when a
 * block is clicked.  We can't use mouseUp on the block since a fast-moving
 * cursor can briefly escape the block before it catches up.
 * @param {!Event} e Mouse up event.
 * @private
 */
Blockly.Block.prototype.onMouseUp_ = function (e) {
    console.log("block.onMouseUp " + this.id + " (" + e.clientX + ","+ e.clientY + ")" );

    var this_ = this;
    Blockly.doCommand(function () {
        Blockly.terminateDrag_();
        if (Blockly.selected && Blockly.highlightedConnection_) {
            // Connect two blocks together.
            Blockly.localConnection_.connect(Blockly.highlightedConnection_);
            if (this_.svg_) {
                // Trigger a connection animation.
                // Determine which connection is inferior (lower in the source stack).
                var inferiorConnection;
                if (Blockly.localConnection_.isSuperior()) {
                    inferiorConnection = Blockly.highlightedConnection_;
                } else {
                    inferiorConnection = Blockly.localConnection_;
                }
                inferiorConnection.sourceBlock_.svg_.connectionUiEffect();
            }
            if (this_.workspace.trashcan && this_.workspace.trashcan.isOpen) {
                // Don't throw an object in the trash can if it just got connected.
                this_.workspace.trashcan.close();
            }
        } else if (this_.workspace.trashcan && this_.workspace.trashcan.isOpen) {
            var trashcan = this_.workspace.trashcan;
            window.setTimeout(lang.hitch(trashcan, trashcan.close), 100);
            console.log("var task = new Ext.util.DelayedTask(trashcan.close, trashcan);");
            //task.delay(100);

            Blockly.selected.dispose(false, true);
            // Dropping a block on the trash can will usually cause the workspace to
            // resize to contain the newly positioned block.  Force a second resize
            // now that the block has been deleted.
            Blockly.fireUiEvent(window, 'resize');
        }
        if (Blockly.highlightedConnection_) {
            Blockly.highlightedConnection_.unhighlight();
            Blockly.highlightedConnection_ = null;
        }
    });
};

/**
 * Load the block's help page in a new window.
 * @private
 */
Blockly.Block.prototype.showHelp_ = function () {
    var url = (this.helpUrl) == "function" ? this.helpUrl() : this.helpUrl;
    if (url) {
        window.open(url);
    }
};

/**
 * Duplicate this block and its children.
 * @return {!Blockly.Block} The duplicate.
 * @private
 */
Blockly.Block.prototype.duplicate_ = function () {
    // Create a duplicate via XML.
    var xmlBlock = Blockly.Json.blockToDom_(this);
    Blockly.Json.deleteNext(xmlBlock);
    var newBlock = Blockly.Json.domToBlock(
        /** @type {!Blockly.Workspace} */ (this.workspace), xmlBlock);
    // Move the duplicate next to the old block.
    var xy = this.getRelativeToSurfaceXY();
    if (Blockly.RTL) {
        xy.x -= Blockly.SNAP_RADIUS;
    } else {
        xy.x += Blockly.SNAP_RADIUS;
    }
    xy.y += Blockly.SNAP_RADIUS * 2;
    newBlock.moveBy(xy.x, xy.y);
    newBlock.select();
    return newBlock;
};

/**
 * Show the context menu for this block.
 * @param {!Event} e Mouse event.
 * @private
 */
Blockly.Block.prototype.showContextMenu_ = function (e) {
    if (Blockly.readOnly || !this.contextMenu) {
        return;
    }
    // Save the current block in a variable for use in closures.
    var block = this;
    var options = [];

    if (this.isDeletable() && !block.isInFlyout) {
        // Option to duplicate this block.
        var duplicateOption = {
            text: Blockly.Msg.DUPLICATE_BLOCK,
            enabled: true,
            callback: function () {
                block.duplicate_();
            }
        };
        if (this.getDescendants().length > this.workspace.remainingCapacity()) {
            duplicateOption.enabled = false;
        }
        options.push(duplicateOption);

        if (this.isEditable() && !this.collapsed_) {
            // Option to add/remove a comment.
            var commentOption = {enabled: true};
            if (this.comment) {
                commentOption.text = Blockly.Msg.REMOVE_COMMENT;
                commentOption.callback = function () {
                    block.setCommentText(null);
                };
            } else {
                commentOption.text = Blockly.Msg.ADD_COMMENT;
                commentOption.callback = function () {
                    block.setCommentText('');
                };
            }
            options.push(commentOption);
        }

        // Option to make block inline.
        if (!this.collapsed_) {
            for (var i = 0; i < this.inputList.length; i++) {
                if (this.inputList[i].type == Blockly.INPUT_VALUE) {
                    // Only display this option if there is a value input on the block.
                    var inlineOption = {enabled: true};
                    inlineOption.text = this.inputsInline ? Blockly.Msg.EXTERNAL_INPUTS :
                        Blockly.Msg.INLINE_INPUTS;
                    inlineOption.callback = function () {
                        block.setInputsInline(!block.inputsInline);
                    };
                    options.push(inlineOption);
                    break;
                }
            }
        }

        if (Blockly.collapse) {
            // Option to collapse/expand block.
            if (this.collapsed_) {
                var expandOption = {enabled: true};
                expandOption.text = Blockly.Msg.EXPAND_BLOCK;
                expandOption.callback = function () {
                    block.setCollapsed(false);
                };
                options.push(expandOption);
            } else {
                var collapseOption = {enabled: true};
                collapseOption.text = Blockly.Msg.COLLAPSE_BLOCK;
                collapseOption.callback = function () {
                    block.setCollapsed(true);
                };
                options.push(collapseOption);
            }
        }

        // Option to disable/enable block.
        var disableOption = {
            text: this.disabled ?
                Blockly.Msg.ENABLE_BLOCK : Blockly.Msg.DISABLE_BLOCK,
            enabled: !this.getInheritedDisabled(),
            callback: function () {
                block.setDisabled(!block.disabled);
            }
        };
        options.push(disableOption);

        // Option to delete this block.
        // Count the number of blocks that are nested in this block.
        var descendantCount = this.getDescendants().length;
        if (block.nextConnection && block.nextConnection.targetConnection) {
            // Blocks in the current stack would survive this block's deletion.
            descendantCount -= this.nextConnection.targetBlock().
                getDescendants().length;
        }
        var deleteOption = {
            text: descendantCount == 1 ? Blockly.Msg.DELETE_BLOCK :
                Blockly.Msg.DELETE_X_BLOCKS.replace('%1', String(descendantCount)),
            enabled: true,
            callback: function () {
                block.dispose(true, true);
            }
        };
        options.push(deleteOption);
    }

    // Option to get help.
    var url = typeof(this.helpUrl) == "function" ? this.helpUrl() : this.helpUrl;
    var helpOption = {enabled: !!url};
    helpOption.text = Blockly.Msg.HELP;
    helpOption.callback = function () {
        block.showHelp_();
    };
    options.push(helpOption);

    // Allow the block to add or modify options.
    if (this.customContextMenu && !block.isInFlyout) {
        this.customContextMenu(options);
    }

    Blockly.ContextMenu.show(e, options);
    Blockly.ContextMenu.currentBlock = this;
};

/**
 * Returns all connections originating from this block.
 * @param {boolean} all If true, return all connections even hidden ones.
 *     Otherwise return those that are visible.
 * @return {!Array.<!Blockly.Connection>} Array of connections.
 * @private
 */
Blockly.Block.prototype.getConnections_ = function (all) {
    var myConnections = [];
    if (all || this.rendered) {
        if (this.outputConnection) {
            myConnections.push(this.outputConnection);
        }
        if (this.nextConnection) {
            myConnections.push(this.nextConnection);
        }
        if (this.previousConnection) {
            myConnections.push(this.previousConnection);
        }
        if (all || !this.collapsed_) {
            for (var x = 0, input; input = this.inputList[x]; x++) {
                if (input.connection) {
                    myConnections.push(input.connection);
                }
            }
        }
    }
    return myConnections;
};

/**
 * Move the connections for this block and all blocks attached under it.
 * Also update any attached bubbles.
 * @param {number} dx Horizontal offset from current location.
 * @param {number} dy Vertical offset from current location.
 * @private
 */
Blockly.Block.prototype.moveConnections_ = function (dx, dy) {
    if (!this.rendered) {
        // Rendering is required to lay out the blocks.
        // This is probably an invisible block attached to a collapsed block.
        return;
    }
    var myConnections = this.getConnections_(false);
    for (var x = 0; x < myConnections.length; x++) {
        myConnections[x].moveBy(dx, dy);
    }
    var icons = this.getIcons();
    for (var x = 0; x < icons.length; x++) {
        icons[x].computeIconLocation();
    }

    // Recurse through all blocks attached under this one.
    for (var x = 0; x < this.childBlocks_.length; x++) {
        this.childBlocks_[x].moveConnections_(dx, dy);
    }
};

/**
 * Recursively adds or removes the dragging class to this node and its children.
 * @param {boolean} adding True if adding, false if removing.
 * @private
 */
Blockly.Block.prototype.setDragging_ = function (adding) {
    if (adding) {
        this.svg_.addDragging();
    } else {
        this.svg_.removeDragging();
    }
    // Recurse through all blocks attached under this one.
    for (var x = 0; x < this.childBlocks_.length; x++) {
        this.childBlocks_[x].setDragging_(adding);
    }
};

/**
 * Drag this block to follow the mouse.
 * @param {!Event} e Mouse move event.
 * @private
 */
Blockly.Block.prototype.onMouseMove_ = function (e) {
    console.log("block.onMouseMove " + this.id + " (" + e.clientX + ","+ e.clientY + ")" );

    var this_ = this;
    Blockly.doCommand(function () {
        console.log("block.onMouseMove " + this_.id + " ** 1 **");
        if (e.type == 'mousemove' && e.clientX <= 1 && e.clientY == 0 &&
            e.button == 0) {
            console.log("block.onMouseMove " + this_.id + " ** 2 **");
            /* HACK:
             Safari Mobile 6.0 and Chrome for Android 18.0 fire rogue mousemove events
             on certain touch actions. Ignore events with these signatures.
             This may result in a one-pixel blind spot in other browsers,
             but this shouldn't be noticable. */
            e.stopPropagation();
            return;
        }
        Blockly.removeAllRanges();
        var dx = e.clientX - this_.startDragMouseX;
        var dy = e.clientY - this_.startDragMouseY;
        if (Blockly.Block.dragMode_ == 1) {
            // Still dragging within the sticky DRAG_RADIUS.
            var dr = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
            if (dr > Blockly.DRAG_RADIUS) {
                // Switch to unrestricted dragging.
                Blockly.Block.dragMode_ = 2;
                // Push this block to the very top of the stack.
                this_.setParent(null);
                this_.setDragging_(true);
            }
        }
        if (Blockly.Block.dragMode_ == 2) {
            console.log("block.onMouseMove " + this_.id + " ** 3 **");
            // Unrestricted dragging.
            var x = this_.startDragX + dx;
            var y = this_.startDragY + dy;
            this_.svg_.getRootElement().setAttribute('transform',
                    'translate(' + x + ', ' + y + ')');
            // Drag all the nested bubbles.
            for (var i = 0; i < this_.draggedBubbles_.length; i++) {
                var commentData = this_.draggedBubbles_[i];
                commentData.bubble.setIconLocation(commentData.x + dx,
                        commentData.y + dy);
            }

            // Check to see if any of this block's connections are within range of
            // another block's connection.
            var myConnections = this_.getConnections_(false);
            var closestConnection = null;
            var localConnection = null;
            var radiusConnection = Blockly.SNAP_RADIUS;
            for (var i = 0; i < myConnections.length; i++) {
                var myConnection = myConnections[i];
                var neighbour = myConnection.closest(radiusConnection, dx, dy);
                if (neighbour.connection) {
                    closestConnection = neighbour.connection;
                    localConnection = myConnection;
                    radiusConnection = neighbour.radius;
                }
            }

            // Remove connection highlighting if needed.
            if (Blockly.highlightedConnection_ &&
                Blockly.highlightedConnection_ != closestConnection) {
                Blockly.highlightedConnection_.unhighlight();
                Blockly.highlightedConnection_ = null;
                Blockly.localConnection_ = null;
            }
            // Add connection highlighting if needed.
            if (closestConnection &&
                closestConnection != Blockly.highlightedConnection_) {
                closestConnection.highlight();
                Blockly.highlightedConnection_ = closestConnection;
                Blockly.localConnection_ = localConnection;
            }
            // Flip the trash can lid if needed.
            if (this_.workspace.trashcan && this_.isDeletable()) {
                this_.workspace.trashcan.onMouseMove(e);
            }
            console.log("block.onMouseMove " + this_.id + " ** 9 **");
        }
        console.log("block.onMouseMove " + this_.id + " ** 10 **");
        // This event has been handled.  No need to bubble up to the document.
        e.stopPropagation();
        console.log("block.onMouseMove " + this_.id + " ** 11 **");
    });
};

/**
 * Bump unconnected blocks out of alignment.  Two blocks which aren't actually
 * connected should not coincidentally line up on screen.
 * @private
 */
Blockly.Block.prototype.bumpNeighbours_ = function () {
    if (Blockly.Block.dragMode_ != 0) {
        // Don't bump blocks during a drag.
        return;
    }
    var rootBlock = this.getRootBlock();
    if (rootBlock.isInFlyout) {
        // Don't move blocks around in a flyout.
        return;
    }
    // Loop though every connection on this block.
    var myConnections = this.getConnections_(false);
    for (var x = 0; x < myConnections.length; x++) {
        var connection = myConnections[x];
        // Spider down from this block bumping all sub-blocks.
        if (connection.targetConnection && connection.isSuperior()) {
            connection.targetBlock().bumpNeighbours_();
        }

        var neighbours = connection.neighbours_(Blockly.SNAP_RADIUS);
        for (var y = 0; y < neighbours.length; y++) {
            var otherConnection = neighbours[y];
            // If both connections are connected, that's probably fine.  But if
            // either one of them is unconnected, then there could be confusion.
            if (!connection.targetConnection || !otherConnection.targetConnection) {
                // Only bump blocks if they are from different tree structures.
                if (otherConnection.sourceBlock_.getRootBlock() != rootBlock) {
                    // Always bump the inferior block.
                    if (connection.isSuperior()) {
                        otherConnection.bumpAwayFrom_(connection);
                    } else {
                        connection.bumpAwayFrom_(otherConnection);
                    }
                }
            }
        }
    }
};

/**
 * Return the parent block or null if this block is at the top level.
 * @return {Blockly.Block} The block that holds the current block.
 */
Blockly.Block.prototype.getParent = function () {
    // Look at the DOM to see if we are nested in another block.
    return this.parentBlock_;
};

/**
 * Return the parent block that surrounds the current block, or null if this
 * block has no surrounding block.  A parent block might just be the previous
 * statement, whereas the surrounding block is an if statement, while loop, etc.
 * @return {Blockly.Block} The block that surrounds the current block.
 */
Blockly.Block.prototype.getSurroundParent = function () {
    var block = this;
    while (true) {
        do {
            var prevBlock = block;
            block = block.getParent();
            if (!block) {
                // Ran off the top.
                return null;
            }
        } while (block.nextConnection &&
            block.nextConnection.targetBlock() == prevBlock);
        // This block is an enclosing parent, not just a statement in a stack.
        return block;
    }
};

/**
 * Return the top-most block in this block's tree.
 * This will return itself if this block is at the top level.
 * @return {!Blockly.Block} The root block.
 */
Blockly.Block.prototype.getRootBlock = function () {
    var rootBlock;
    var block = this;
    do {
        rootBlock = block;
        block = rootBlock.parentBlock_;
    } while (block);
    return rootBlock;
};

/**
 * Find all the blocks that are directly nested inside this one.
 * Includes value and block inputs, as well as any following statement.
 * Excludes any connection on an output tab or any preceding statement.
 * @return {!Array.<!Blockly.Block>} Array of blocks.
 */
Blockly.Block.prototype.getChildren = function () {
    return this.childBlocks_;
};

/**
 * Set parent of this block to be a new block or null.
 * @param {Blockly.Block} newParent New parent block.
 */
Blockly.Block.prototype.setParent = function (newParent) {
    if (this.parentBlock_) {
        // Remove this block from the old parent's child list.
        var children = this.parentBlock_.childBlocks_;
        for (var child, x = 0; child = children[x]; x++) {
            if (child == this) {
                children.splice(x, 1);
                break;
            }
        }
        // Move this block up the DOM.  Keep track of x/y translations.
        var xy = this.getRelativeToSurfaceXY();
        this.workspace.getCanvas().appendChild(this.svg_.getRootElement());
        this.svg_.getRootElement().setAttribute('transform',
                'translate(' + xy.x + ', ' + xy.y + ')');

        // Disconnect from superior blocks.
        this.parentBlock_ = null;
        if (this.previousConnection && this.previousConnection.targetConnection) {
            this.previousConnection.disconnect();
        }
        if (this.outputConnection && this.outputConnection.targetConnection) {
            this.outputConnection.disconnect();
        }
        // This block hasn't actually moved on-screen, so there's no need to update
        // its connection locations.
    } else {
        // Remove this block from the workspace's list of top-most blocks.
        // Note that during realtime sync we sometimes create child blocks that are
        // not top level so we check first before removing.
        if (this.workspace.getTopBlocks(false).indexOf(this)) {
            this.workspace.removeTopBlock(this);
        }
    }

    this.parentBlock_ = newParent;
    if (newParent) {
        // Add this block to the new parent's child list.
        newParent.childBlocks_.push(this);

        var oldXY = this.getRelativeToSurfaceXY();
        if (newParent.svg_ && this.svg_) {
            newParent.svg_.getRootElement().appendChild(this.svg_.getRootElement());
        }
        var newXY = this.getRelativeToSurfaceXY();
        // Move the connections to match the child's new position.
        this.moveConnections_(newXY.x - oldXY.x, newXY.y - oldXY.y);
    } else {
        this.workspace.addTopBlock(this);
    }
};

/**
 * Find all the blocks that are directly or indirectly nested inside this one.
 * Includes this block in the list.
 * Includes value and block inputs, as well as any following statements.
 * Excludes any connection on an output tab or any preceding statements.
 * @return {!Array.<!Blockly.Block>} Flattened array of blocks.
 */
Blockly.Block.prototype.getDescendants = function () {
    var blocks = [this];
    for (var child, x = 0; child = this.childBlocks_[x]; x++) {
        blocks = blocks.concat(child.getDescendants());
    }
    return blocks;
};

/**
 * Get whether this block is deletable or not.
 * @return {boolean} True if deletable.
 */
Blockly.Block.prototype.isDeletable = function () {
    return this.deletable_ && !Blockly.readOnly;
};

/**
 * Set whether this block is deletable or not.
 * @param {boolean} deletable True if deletable.
 */
Blockly.Block.prototype.setDeletable = function (deletable) {
    this.deletable_ = deletable;
    this.svg_ && this.svg_.updateMovable();
};

/**
 * Get whether this block is movable or not.
 * @return {boolean} True if movable.
 */
Blockly.Block.prototype.isMovable = function () {
    return this.movable_ && !Blockly.readOnly;
};

/**
 * Set whether this block is movable or not.
 * @param {boolean} movable True if movable.
 */
Blockly.Block.prototype.setMovable = function (movable) {
    this.movable_ = movable;
};

/**
 * Get whether this block is editable or not.
 * @return {boolean} True if editable.
 */
Blockly.Block.prototype.isEditable = function () {
    return this.editable_ && !Blockly.readOnly;
};

/**
 * Set whether this block is editable or not.
 * @param {boolean} editable True if editable.
 */
Blockly.Block.prototype.setEditable = function (editable) {
    this.editable_ = editable;
    for (var x = 0, input; input = this.inputList[x]; x++) {
        for (var y = 0, field; field = input.fieldRow[y]; y++) {
            field.updateEditable();
        }
    }
    var icons = this.getIcons();
    for (var x = 0; x < icons.length; x++) {
        icons[x].updateEditable();
    }
};

/**
 * Set the URL of this block's help page.
 * @param {string|Function} url URL string for block help, or function that
 *     returns a URL.  Null for no help.
 */
Blockly.Block.prototype.setHelpUrl = function (url) {
    this.helpUrl = url;
};

/**
 * Get the colour of a block.
 * @return {number} HSV hue value.
 */
Blockly.Block.prototype.getColour = function () {
    return this.colourHue_;
};

/**
 * Change the colour of a block.
 * @param {number} colourHue HSV hue value.
 */
Blockly.Block.prototype.setColour = function (colourHue) {
    this.colourHue_ = colourHue;
    if (this.svg_) {
        this.svg_.updateColour();
    }
    var icons = this.getIcons();
    for (var x = 0; x < icons.length; x++) {
        icons[x].updateColour();
    }
    if (this.rendered) {
        // Bump every dropdown to change its colour.
        for (var x = 0, input; input = this.inputList[x]; x++) {
            for (var y = 0, field; field = input.fieldRow[y]; y++) {
                field.setText(null);
            }
        }
        this.render();
    }
};

/**
 * Returns the named field from a block.
 * @param {string} name The name of the field.
 * @return {Blockly.Field} Named field, or null if field does not exist.
 * @private
 */
Blockly.Block.prototype.getField_ = function (name) {
    for (var x = 0, input; input = this.inputList[x]; x++) {
        for (var y = 0, field; field = input.fieldRow[y]; y++) {
            if (field.name === name) {
                return field;
            }
        }
    }
    return null;
};

/**
 * Returns the language-neutral value from the field of a block.
 * @param {string} name The name of the field.
 * @return {?string} Value from the field or null if field does not exist.
 */
Blockly.Block.prototype.getFieldValue = function (name) {
    var field = this.getField_(name);
    if (field) {
        return field.getValue();
    }
    return null;
};

/**
 * Returns the language-neutral value from the field of a block.
 * @param {string} name The name of the field.
 * @return {?string} Value from the field or null if field does not exist.
 * @deprecated December 2013
 */
Blockly.Block.prototype.getTitleValue = function (name) {
    console.log('Deprecated call to getTitleValue, use getFieldValue instead.');
    return this.getFieldValue(name);
};

/**
 * Change the field value for a block (e.g. 'CHOOSE' or 'REMOVE').
 * @param {string} newValue Value to be the new field.
 * @param {string} name The name of the field.
 */
Blockly.Block.prototype.setFieldValue = function (newValue, name) {
    var field = this.getField_(name);
    if (field == null) {
        console.log('Field "%s" not found.', name);
        return;
    }
    field.setValue(newValue);
};

/**
 * Change the field value for a block (e.g. 'CHOOSE' or 'REMOVE').
 * @param {string} newValue Value to be the new field.
 * @param {string} name The name of the field.
 * @deprecated December 2013
 */
Blockly.Block.prototype.setTitleValue = function (newValue, name) {
    console.log('Deprecated call to setTitleValue, use setFieldValue instead.');
    this.setFieldValue(newValue, name);
};

/**
 * Change the tooltip text for a block.
 * @param {string|!Function} newTip Text for tooltip or a parent element to
 *     link to for its tooltip.  May be a function that returns a string.
 */
Blockly.Block.prototype.setTooltip = function (newTip) {
    this.tooltip = newTip;
};

/**
 * Set whether this block can chain onto the bottom of another block.
 * @param {boolean} newBoolean True if there can be a previous statement.
 * @param {string|Array.<string>|null} opt_check Statement type or list of
 *     statement types.  Null or undefined if any type could be connected.
 */
Blockly.Block.prototype.setPreviousStatement = function (newBoolean, opt_check) {
    if (this.previousConnection) {
        if (this.previousConnection.targetConnection)
            console.log('Must disconnect previous statement before removing connection.');
        this.previousConnection.dispose();
        this.previousConnection = null;
    }
    if (newBoolean) {
        if (this.outputConnection)
            console.log('Remove output connection prior to adding previous connection.');
        if (opt_check === undefined) {
            opt_check = null;
        }
        this.previousConnection = new Blockly.Connection(this, Blockly.PREVIOUS_STATEMENT);
        this.previousConnection.setCheck(opt_check);
    }
    if (this.rendered) {
        this.render();
        this.bumpNeighbours_();
    }
};

/**
 * Set whether another block can chain onto the bottom of this block.
 * @param {boolean} newBoolean True if there can be a next statement.
 * @param {string|Array.<string>|null} opt_check Statement type or list of
 *     statement types.  Null or undefined if any type could be connected.
 */
Blockly.Block.prototype.setNextStatement = function (newBoolean, opt_check) {
    if (this.nextConnection) {
        if (this.nextConnection.targetConnection)
            console.log('Must disconnect next statement before removing connection.');
        this.nextConnection.dispose();
        this.nextConnection = null;
    }
    if (newBoolean) {
        if (opt_check === undefined) {
            opt_check = null;
        }
        this.nextConnection = new Blockly.Connection(this, Blockly.NEXT_STATEMENT);
        this.nextConnection.setCheck(opt_check);
    }
    if (this.rendered) {
        this.render();
        this.bumpNeighbours_();
    }
};

/**
 * Set whether this block returns a value.
 * @param {boolean} newBoolean True if there is an output.
 * @param {string|Array.<string>|null} opt_check Returned type or list of
 *     returned types.  Null or undefined if any type could be returned
 *     (e.g. variable get).
 */
Blockly.Block.prototype.setOutput = function (newBoolean, opt_check) {
    if (this.outputConnection) {
        if (this.outputConnection.targetConnection)
            console.log('Must disconnect output value before removing connection.');
        this.outputConnection.dispose();
        this.outputConnection = null;
    }
    if (newBoolean) {
        if (this.previousConnection)
            console.log('Remove previous connection prior to adding output connection.');
        if (opt_check === undefined) {
            opt_check = null;
        }
        this.outputConnection = new Blockly.Connection(this, Blockly.OUTPUT_VALUE);
        this.outputConnection.setCheck(opt_check);
    }
    if (this.rendered) {
        this.render();
        this.bumpNeighbours_();
    }
};

/**
 * Change the output type on a block.
 * @param {string|Array.<string>|null} check Returned type or list of
 *     returned types.  Null or undefined if any type could be returned
 *     (e.g. variable get).  It is fine if this is the same as the old type.
 */
Blockly.Block.prototype.changeOutput = function (check) {
    if (this.outputConnection)
        console.log('Only use changeOutput() on blocks that already have an output.');
    this.outputConnection.setCheck(check);
};

/**
 * Set whether value inputs are arranged horizontally or vertically.
 * @param {boolean} newBoolean True if inputs are horizontal.
 */
Blockly.Block.prototype.setInputsInline = function (newBoolean) {
    this.inputsInline = newBoolean;
    if (this.rendered) {
        this.render();
        this.bumpNeighbours_();
        this.workspace.fireChangeEvent();
    }
};

/**
 * Set whether the block is disabled or not.
 * @param {boolean} disabled True if disabled.
 */
Blockly.Block.prototype.setDisabled = function (disabled) {
    if (this.disabled == disabled) {
        return;
    }
    this.disabled = disabled;
    this.svg_.updateDisabled();
    this.workspace.fireChangeEvent();
};

/**
 * Get whether the block is disabled or not due to parents.
 * The block's own disabled property is not considered.
 * @return {boolean} True if disabled.
 */
Blockly.Block.prototype.getInheritedDisabled = function () {
    var block = this;
    while (true) {
        block = block.getSurroundParent();
        if (!block) {
            // Ran off the top.
            return false;
        } else if (block.disabled) {
            return true;
        }
    }
};

/**
 * Get whether the block is collapsed or not.
 * @return {boolean} True if collapsed.
 */
Blockly.Block.prototype.isCollapsed = function () {
    return this.collapsed_;
};

/**
 * Set whether the block is collapsed or not.
 * @param {boolean} collapsed True if collapsed.
 */
Blockly.Block.prototype.setCollapsed = function (collapsed) {
    if (this.collapsed_ == collapsed) {
        return;
    }
    this.collapsed_ = collapsed;
    var renderList = [];
    // Show/hide the inputs.
    for (var x = 0, input; input = this.inputList[x]; x++) {
        renderList = renderList.concat(input.setVisible(!collapsed));
    }

    var COLLAPSED_INPUT_NAME = '_TEMP_COLLAPSED_INPUT';
    if (collapsed) {
        var icons = this.getIcons();
        for (var x = 0; x < icons.length; x++) {
            icons[x].setVisible(false);
        }
        var text = this.toString(Blockly.COLLAPSE_CHARS);
        this.appendDummyInput(COLLAPSED_INPUT_NAME).appendField(text);
    } else {
        this.removeInput(COLLAPSED_INPUT_NAME);
    }

    if (!renderList.length) {
        // No child blocks, just render this block.
        renderList[0] = this;
    }
    if (this.rendered) {
        for (var x = 0, block; block = renderList[x]; x++) {
            block.render();
        }
        this.bumpNeighbours_();
    }
};

/**
 * Create a human-readable text representation of this block and any children.
 * @param {?number} opt_maxLength Truncate the string to this length.
 * @return {string} Text of block.
 */
Blockly.Block.prototype.toString = function (opt_maxLength) {
    var text = [];
    for (var x = 0, input; input = this.inputList[x]; x++) {
        for (var y = 0, field; field = input.fieldRow[y]; y++) {
            text.push(field.getText());
        }
        if (input.connection) {
            var child = input.connection.targetBlock();
            if (child) {
                text.push(child.toString());
            } else {
                text.push('?');
            }
        }
    }
    text = string.trim(text.join(' ')) || '???';
    if (opt_maxLength) {
        // TODO: Improve truncation so that text from this block is given priority.
        // TODO: Handle FieldImage better.
        text = text.substring(0, opt_maxLength);
    }
    return text;
};

/**
 * Shortcut for appending a value input row.
 * @param {string} name Language-neutral identifier which may used to find this
 *     input again.  Should be unique to this block.
 * @return {!Blockly.Input} The input object created.
 */
Blockly.Block.prototype.appendValueInput = function (name) {
    return this.appendInput_(Blockly.INPUT_VALUE, name);
};

/**
 * Shortcut for appending a statement input row.
 * @param {string} name Language-neutral identifier which may used to find this
 *     input again.  Should be unique to this block.
 * @return {!Blockly.Input} The input object created.
 */
Blockly.Block.prototype.appendStatementInput = function (name) {
    return this.appendInput_(Blockly.NEXT_STATEMENT, name);
};

/**
 * Shortcut for appending a dummy input row.
 * @param {string} opt_name Language-neutral identifier which may used to find
 *     this input again.  Should be unique to this block.
 * @return {!Blockly.Input} The input object created.
 */
Blockly.Block.prototype.appendDummyInput = function (opt_name) {
    return this.appendInput_(Blockly.DUMMY_INPUT, opt_name || '');
};

/**
 * Interpolate a message string, creating fields and inputs.
 * @param {string} msg The message string to parse.  %1, %2, etc. are symbols
 *     for value inputs or for Fields, such as an instance of
 *     Blockly.FieldDropdown, which would be placed as a field in either the
 *     following value input or a dummy input.  The newline character forces
 *     the creation of an unnamed dummy input if any fields need placement.
 *     Note that '%10' would be interpreted as a reference to the tenth
 *     argument.  To show the first argument followed by a zero, use '%1 0'.
 *     (Spaces around tokens are stripped.)  To display a percentage sign
 *     followed by a number (e.g., "%123"), put that text in a
 *     Blockly.FieldLabel (as described below).
 * @param {!Array.<?string|number|Array.<string>|Blockly.Field>|number} var_args
 *     A series of tuples that each specify the value inputs to create.  Each
 *     tuple has at least two elements.  The first is its name; the second is
 *     its type, which can be any of:
 *     - A string (such as 'Number'), denoting the one type allowed in the
 *       corresponding socket.
 *     - An array of strings (such as ['Number', 'List']), denoting the
 *       different types allowed in the corresponding socket.
 *     - null, denoting that any type is allowed in the corresponding socket.
 *     - Blockly.Field, in which case that field instance, such as an
 *       instance of Blockly.FieldDropdown, appears (instead of a socket).
 *     If the type is any of the first three options (which are legal arguments
 *     to setCheck()), there should be a third element in the tuple, giving its
 *     alignment.
 *     The final parameter is not a tuple, but just an alignment for any
 *     trailing dummy inputs.  This last parameter is mandatory; there may be
 *     any number of tuples (though the number of tuples must match the symbols
 *     in msg).
 */
Blockly.Block.prototype.interpolateMsg = function (msg, var_args) {
    /**
     * Add a field to this input.
     * @this !Blockly.Input
     * @param {Blockly.Field|Array.<string|Blockly.Field>} field
     *     This is either a Field or a tuple of a name and a Field.
     */
    function addFieldToInput(field) {
        if (field instanceof Blockly.Field) {
            this.appendField(field);
        } else {
            if (!(field instanceof Array))
                console.log("Error in addFieldToInput")
            this.appendField(field[1], field[0]);
        }
    }

    // Validate the msg at the start and the dummy alignment at the end,
    // and remove the latter.
    if (typeof(msg) !== "string")
        console.log("msg is not STRING")
    var dummyAlign = arguments[arguments.length - 1];
    if (
        dummyAlign !== Blockly.ALIGN_LEFT ||
        dummyAlign !== Blockly.ALIGN_CENTRE ||
        dummyAlign !== Blockly.ALIGN_RIGHT) {
        console.log('Illegal final argument "%d" is not an alignment.', dummyAlign);
    }
    arguments.length = arguments.length - 1;

    var tokens = msg.split(this.interpolateMsg.SPLIT_REGEX_);
    var fields = [];
    for (var i = 0; i < tokens.length; i += 2) {
        var text = string.trim(tokens[i]);
        var input = undefined;
        if (text) {
            fields.push(new Blockly.FieldLabel(text));
        }
        var symbol = tokens[i + 1];
        if (symbol && symbol.charAt(0) == '%') {
            // Numeric field.
            var number = parseInt(symbol.substring(1), 10);
            var tuple = arguments[number];
            if (typeof(tuple) !== "array")
                console.log('Message symbol "%s" is out of range.', symbol);
            if (typeof(tuple) !== "array")
                console.log('Argument "%s" is not a tuple.', symbol);
            if (tuple[1] instanceof Blockly.Field) {
                fields.push([tuple[0], tuple[1]]);
            } else {
                input = this.appendValueInput(tuple[0])
                    .setCheck(tuple[1])
                    .setAlign(tuple[2]);
            }
            arguments[number] = null;  // Inputs may not be reused.
        } else if (symbol == '\n' && fields.length) {
            // Create a dummy input.
            input = this.appendDummyInput();
        }
        // If we just added an input, hang any pending fields on it.
        if (input && fields.length) {
            fields.forEach(addFieldToInput, input);
            fields = [];
        }
    }
    // If any fields remain, create a trailing dummy input.
    if (fields.length) {
        var input = this.appendDummyInput()
            .setAlign(dummyAlign);
        fields.forEach(addFieldToInput, input);
    }

    // Verify that all inputs were used.
    for (var i = 1; i < arguments.length - 1; i++) {
        if (arguments[i] === null)
            console.log('Input "%%s" not used in message: "%s"', i, msg);
    }
    // Make the inputs inline unless there is only one input and
    // no text follows it.
    this.setInputsInline(!msg.match(this.interpolateMsg.INLINE_REGEX_));
};

Blockly.Block.prototype.interpolateMsg.SPLIT_REGEX_ = /(%\d+|\n)/;
Blockly.Block.prototype.interpolateMsg.INLINE_REGEX_ = /%1\s*$/;


/**
 * Add a value input, statement input or local variable to this block.
 * @param {number} type Either Blockly.INPUT_VALUE or Blockly.NEXT_STATEMENT or
 *     Blockly.DUMMY_INPUT.
 * @param {string} name Language-neutral identifier which may used to find this
 *     input again.  Should be unique to this block.
 * @return {!Blockly.Input} The input object created.
 * @private
 */
Blockly.Block.prototype.appendInput_ = function (type, name) {
    var connection = null;
    if (type == Blockly.INPUT_VALUE || type == Blockly.NEXT_STATEMENT) {
        connection = new Blockly.Connection(this, type);
    }
    var input = new Blockly.Input(type, name, this, connection);
    // Append input to list.
    this.inputList.push(input);
    if (this.rendered) {
        this.render();
        // Adding an input will cause the block to change shape.
        this.bumpNeighbours_();
    }
    return input;
};

/**
 * Move a named input to a different location on this block.
 * @param {string} name The name of the input to move.
 * @param {?string} refName Name of input that should be after the moved input,
 *   or null to be the input at the end.
 */
Blockly.Block.prototype.moveInputBefore = function (name, refName) {
    if (name == refName) {
        return;
    }
    // Find both inputs.
    var inputIndex = -1;
    var refIndex = refName ? -1 : this.inputList.length;
    for (var x = 0, input; input = this.inputList[x]; x++) {
        if (input.name == name) {
            inputIndex = x;
            if (refIndex != -1) {
                break;
            }
        } else if (refName && input.name == refName) {
            refIndex = x;
            if (inputIndex != -1) {
                break;
            }
        }
    }
    if (inputIndex != -1)
        console.log('Named input "%s" not found.', name);
    if (refIndex != -1)
        console.log('Reference input "%s" not found.',
            refName);
    this.moveNumberedInputBefore(inputIndex, refIndex);
};

/**
 * Move a numbered input to a different location on this block.
 * @param {number} inputIndex Index of the input to move.
 * @param {number} refIndex Index of input that should be after the moved input.
 */
Blockly.Block.prototype.moveNumberedInputBefore = function (inputIndex, refIndex) {
    // Validate arguments.
    if (inputIndex != refIndex)
        console.log('Can\'t move input to itself.');
    if (inputIndex < this.inputList.length)
        console.log('Input index ' + inputIndex + ' out of bounds.');
    if (refIndex <= this.inputList.length)
        console.log('Reference input ' + refIndex + ' out of bounds.');
    // Remove input.
    var input = this.inputList[inputIndex];
    this.inputList.splice(inputIndex, 1);
    if (inputIndex < refIndex) {
        refIndex--;
    }
    // Reinsert input.
    this.inputList.splice(refIndex, 0, input);
    if (this.rendered) {
        this.render();
        // Moving an input will cause the block to change shape.
        this.bumpNeighbours_();
    }
};

/**
 * Remove an input from this block.
 * @param {string} name The name of the input.
 * @param {boolean} opt_quiet True to prevent error if input is not present.
 */
Blockly.Block.prototype.removeInput = function (name, opt_quiet) {
    for (var x = 0, input; input = this.inputList[x]; x++) {
        if (input.name == name) {
            if (input.connection && input.connection.targetConnection) {
                // Disconnect any attached block.
                input.connection.targetBlock().setParent(null);
            }
            input.dispose();
            this.inputList.splice(x, 1);
            if (this.rendered) {
                this.render();
                // Removing an input will cause the block to change shape.
                this.bumpNeighbours_();
            }
            return;
        }
    }
    if (!opt_quiet) {
        console.log('Input "%s" not found.', name);
    }
};

/**
 * Fetches the named input object.
 * @param {string} name The name of the input.
 * @return {Object} The input object, or null of the input does not exist.
 */
Blockly.Block.prototype.getInput = function (name) {
    for (var x = 0, input; input = this.inputList[x]; x++) {
        if (input.name == name) {
            return input;
        }
    }
    // This input does not exist.
    return null;
};

/**
 * Fetches the block attached to the named input.
 * @param {string} name The name of the input.
 * @return {Blockly.Block} The attached value block, or null if the input is
 *     either disconnected or if the input does not exist.
 */
Blockly.Block.prototype.getInputTargetBlock = function (name) {
    var input = this.getInput(name);
    return input && input.connection && input.connection.targetBlock();
};

/**
 * Give this block a mutator dialog.
 * @param {Blockly.Mutator} mutator A mutator dialog instance or null to remove.
 */
Blockly.Block.prototype.setMutator = function (mutator) {
    if (this.mutator && this.mutator !== mutator) {
        this.mutator.dispose();
    }
    if (mutator) {
        mutator.block_ = this;
        this.mutator = mutator;
        if (this.svg_) {
            mutator.createIcon();
        }
    }
};

/**
 * Returns the comment on this block (or '' if none).
 * @return {string} Block's comment.
 */
Blockly.Block.prototype.getCommentText = function () {
    if (this.comment) {
        var comment = this.comment.getText();
        // Trim off trailing whitespace.
        return comment.replace(/\s+$/, '').replace(/ +\n/g, '\n');
    }
    return '';
};

/**
 * Set this block's comment text.
 * @param {?string} text The text, or null to delete.
 */
Blockly.Block.prototype.setCommentText = function (text) {
    var changedState = false;
    if (typeof text == "string") {
        if (!this.comment) {
            this.comment = new Blockly.Comment(this);
            changedState = true;
        }
        this.comment.setText(/** @type {string} */ (text));
    } else {
        if (this.comment) {
            this.comment.dispose();
            changedState = true;
        }
    }
    if (this.rendered) {
        this.render();
        if (changedState) {
            // Adding or removing a comment icon will cause the block to change shape.
            this.bumpNeighbours_();
        }
    }
};

/**
 * Set this block's warning text.
 * @param {?string} text The text, or null to delete.
 */
Blockly.Block.prototype.setWarningText = function (text) {
    if (this.isInFlyout) {
        text = null;
    }
    var changedState = false;
    if (typeof text  == "string") {
        if (!this.warning) {
            this.warning = new Blockly.Warning(this);
            changedState = true;
        }
        this.warning.setText(/** @type {string} */ (text));
    } else {
        if (this.warning) {
            this.warning.dispose();
            changedState = true;
        }
    }
    if (changedState && this.rendered) {
        this.render();
        // Adding or removing a warning icon will cause the block to change shape.
        this.bumpNeighbours_();
    }
};

/**
 * Render the block.
 * Lays out and reflows a block based on its contents and settings.
 */
Blockly.Block.prototype.render = function () {
    if (typeof(this.svg_) !== "object")
        console.log('Uninitialized block cannot be rendered.  Call block.initSvg()');
    this.svg_.render();
};

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
 * @fileoverview Methods for graphically rendering a block as SVG.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * Class for a block's SVG representation.
 * @param {!Blockly.Block} block The underlying block object.
 * @constructor
 */
Blockly.BlockSvg = function (block) {
    this.block_ = block;
    // Create core elements for the block.
    this.svgGroup_ = Blockly.createSvgElement('g', {}, null);
    this.svgPathDark_ = Blockly.createSvgElement('path',
        {'class': 'blocklyPathDark', 'transform': 'translate(1, 1)'},
        this.svgGroup_);
    this.svgPath_ = Blockly.createSvgElement('path', {'class': 'blocklyPath'},
        this.svgGroup_);
    this.svgPathLight_ = Blockly.createSvgElement('path',
        {'class': 'blocklyPathLight'}, this.svgGroup_);
    this.svgPath_.tooltip = this.block_;
    Blockly.Tooltip.bindMouseEvents(this.svgPath_);
    this.updateMovable();
};

/**
 * Height of this block, not including any statement blocks above or below.
 */
Blockly.BlockSvg.prototype.height = 0;
/**
 * Width of this block, including any connected value blocks.
 */
Blockly.BlockSvg.prototype.width = 0;

/**
 * Constant for identifying rows that are to be rendered inline.
 * Don't collide with Blockly.INPUT_VALUE and friends.
 * @const
 */
Blockly.BlockSvg.INLINE = -1;

/**
 * Initialize the SVG representation with any block attributes which have
 * already been defined.
 */
Blockly.BlockSvg.prototype.init = function () {
    var block = this.block_;
    this.updateColour();
    for (var x = 0, input; input = block.inputList[x]; x++) {
        input.init();
    }
    if (block.mutator) {
        block.mutator.createIcon();
    }
};

/**
 * Add or remove the UI indicating if this block is movable or not.
 */
Blockly.BlockSvg.prototype.updateMovable = function () {
    if (this.block_.isMovable()) {
        Blockly.addClass_(/** @type {!Element} */ (this.svgGroup_),
            'blocklyDraggable');
    } else {
        Blockly.removeClass_(/** @type {!Element} */ (this.svgGroup_),
            'blocklyDraggable');
    }
};

/**
 * Get the root SVG element.
 * @return {!Element} The root SVG element.
 */
Blockly.BlockSvg.prototype.getRootElement = function () {
    return this.svgGroup_;
};

// UI constants for rendering blocks.
/**
 * Horizontal space between elements.
 * @const
 */
Blockly.BlockSvg.SEP_SPACE_X = 10;
/**
 * Vertical space between elements.
 * @const
 */
Blockly.BlockSvg.SEP_SPACE_Y = 10;
/**
 * Vertical padding around inline elements.
 * @const
 */
Blockly.BlockSvg.INLINE_PADDING_Y = 5;
/**
 * Minimum height of a block.
 * @const
 */
Blockly.BlockSvg.MIN_BLOCK_Y = 25;
/**
 * Height of horizontal puzzle tab.
 * @const
 */
Blockly.BlockSvg.TAB_HEIGHT = 20;
/**
 * Width of horizontal puzzle tab.
 * @const
 */
Blockly.BlockSvg.TAB_WIDTH = 8;
/**
 * Width of vertical tab (inc left margin).
 * @const
 */
Blockly.BlockSvg.NOTCH_WIDTH = 30;
/**
 * Rounded corner radius.
 * @const
 */
Blockly.BlockSvg.CORNER_RADIUS = 8;
/**
 * Minimum height of field rows.
 * @const
 */
Blockly.BlockSvg.FIELD_HEIGHT = 18;
/**
 * Distance from shape edge to intersect with a curved corner at 45 degrees.
 * Applies to highlighting on around the inside of a curve.
 * @const
 */
Blockly.BlockSvg.DISTANCE_45_INSIDE = (1 - Math.SQRT1_2) *
    (Blockly.BlockSvg.CORNER_RADIUS - 1) + 1;
/**
 * Distance from shape edge to intersect with a curved corner at 45 degrees.
 * Applies to highlighting on around the outside of a curve.
 * @const
 */
Blockly.BlockSvg.DISTANCE_45_OUTSIDE = (1 - Math.SQRT1_2) *
    (Blockly.BlockSvg.CORNER_RADIUS + 1) - 1;
/**
 * SVG path for drawing next/previous notch from left to right.
 * @const
 */
Blockly.BlockSvg.NOTCH_PATH_LEFT = 'l 6,4 3,0 6,-4';
/**
 * SVG path for drawing next/previous notch from left to right with
 * highlighting.
 * @const
 */
Blockly.BlockSvg.NOTCH_PATH_LEFT_HIGHLIGHT = 'l 6.5,4 2,0 6.5,-4';
/**
 * SVG path for drawing next/previous notch from right to left.
 * @const
 */
Blockly.BlockSvg.NOTCH_PATH_RIGHT = 'l -6,4 -3,0 -6,-4';
/**
 * SVG path for drawing jagged teeth at the end of collapsed blocks.
 * @const
 */
Blockly.BlockSvg.JAGGED_TEETH = 'l 8,0 0,4 8,4 -16,8 8,4';
/**
 * Height of SVG path for jagged teeth at the end of collapsed blocks.
 * @const
 */
Blockly.BlockSvg.JAGGED_TEETH_HEIGHT = 20;
/**
 * Width of SVG path for jagged teeth at the end of collapsed blocks.
 * @const
 */
Blockly.BlockSvg.JAGGED_TEETH_WIDTH = 15;
/**
 * SVG path for drawing a horizontal puzzle tab from top to bottom.
 * @const
 */
Blockly.BlockSvg.TAB_PATH_DOWN = 'v 5 c 0,10 -' + Blockly.BlockSvg.TAB_WIDTH +
    ',-8 -' + Blockly.BlockSvg.TAB_WIDTH + ',7.5 s ' +
    Blockly.BlockSvg.TAB_WIDTH + ',-2.5 ' + Blockly.BlockSvg.TAB_WIDTH + ',7.5';
/**
 * SVG path for drawing a horizontal puzzle tab from top to bottom with
 * highlighting from the upper-right.
 * @const
 */
Blockly.BlockSvg.TAB_PATH_DOWN_HIGHLIGHT_RTL = 'v 6.5 m -' +
    (Blockly.BlockSvg.TAB_WIDTH * 0.98) + ',2.5 q -' +
    (Blockly.BlockSvg.TAB_WIDTH * .05) + ',10 ' +
    (Blockly.BlockSvg.TAB_WIDTH * .27) + ',10 m ' +
    (Blockly.BlockSvg.TAB_WIDTH * .71) + ',-2.5 v 1.5';

/**
 * SVG start point for drawing the top-left corner.
 * @const
 */
Blockly.BlockSvg.TOP_LEFT_CORNER_START =
    'm 0,' + Blockly.BlockSvg.CORNER_RADIUS;
/**
 * SVG start point for drawing the top-left corner's highlight in RTL.
 * @const
 */
Blockly.BlockSvg.TOP_LEFT_CORNER_START_HIGHLIGHT_RTL =
    'm ' + Blockly.BlockSvg.DISTANCE_45_INSIDE + ',' +
    Blockly.BlockSvg.DISTANCE_45_INSIDE;
/**
 * SVG start point for drawing the top-left corner's highlight in LTR.
 * @const
 */
Blockly.BlockSvg.TOP_LEFT_CORNER_START_HIGHLIGHT_LTR =
    'm 1,' + (Blockly.BlockSvg.CORNER_RADIUS - 1);
/**
 * SVG path for drawing the rounded top-left corner.
 * @const
 */
Blockly.BlockSvg.TOP_LEFT_CORNER =
    'A ' + Blockly.BlockSvg.CORNER_RADIUS + ',' +
    Blockly.BlockSvg.CORNER_RADIUS + ' 0 0,1 ' +
    Blockly.BlockSvg.CORNER_RADIUS + ',0';
/**
 * SVG path for drawing the highlight on the rounded top-left corner.
 * @const
 */
Blockly.BlockSvg.TOP_LEFT_CORNER_HIGHLIGHT =
    'A ' + (Blockly.BlockSvg.CORNER_RADIUS - 1) + ',' +
    (Blockly.BlockSvg.CORNER_RADIUS - 1) + ' 0 0,1 ' +
    Blockly.BlockSvg.CORNER_RADIUS + ',1';
/**
 * SVG path for drawing the top-left corner of a statement input.
 * Includes the top notch, a horizontal space, and the rounded inside corner.
 * @const
 */
Blockly.BlockSvg.INNER_TOP_LEFT_CORNER =
    Blockly.BlockSvg.NOTCH_PATH_RIGHT + ' h -' +
    (Blockly.BlockSvg.NOTCH_WIDTH - 15 - Blockly.BlockSvg.CORNER_RADIUS) +
    ' a ' + Blockly.BlockSvg.CORNER_RADIUS + ',' +
    Blockly.BlockSvg.CORNER_RADIUS + ' 0 0,0 -' +
    Blockly.BlockSvg.CORNER_RADIUS + ',' +
    Blockly.BlockSvg.CORNER_RADIUS;
/**
 * SVG path for drawing the bottom-left corner of a statement input.
 * Includes the rounded inside corner.
 * @const
 */
Blockly.BlockSvg.INNER_BOTTOM_LEFT_CORNER =
    'a ' + Blockly.BlockSvg.CORNER_RADIUS + ',' +
    Blockly.BlockSvg.CORNER_RADIUS + ' 0 0,0 ' +
    Blockly.BlockSvg.CORNER_RADIUS + ',' +
    Blockly.BlockSvg.CORNER_RADIUS;
/**
 * SVG path for drawing highlight on the top-left corner of a statement
 * input in RTL.
 * @const
 */
Blockly.BlockSvg.INNER_TOP_LEFT_CORNER_HIGHLIGHT_RTL =
    'a ' + (Blockly.BlockSvg.CORNER_RADIUS + 1) + ',' +
    (Blockly.BlockSvg.CORNER_RADIUS + 1) + ' 0 0,0 ' +
    (-Blockly.BlockSvg.DISTANCE_45_OUTSIDE - 1) + ',' +
    (Blockly.BlockSvg.CORNER_RADIUS -
        Blockly.BlockSvg.DISTANCE_45_OUTSIDE);
/**
 * SVG path for drawing highlight on the bottom-left corner of a statement
 * input in RTL.
 * @const
 */
Blockly.BlockSvg.INNER_BOTTOM_LEFT_CORNER_HIGHLIGHT_RTL =
    'a ' + (Blockly.BlockSvg.CORNER_RADIUS + 1) + ',' +
    (Blockly.BlockSvg.CORNER_RADIUS + 1) + ' 0 0,0 ' +
    (Blockly.BlockSvg.CORNER_RADIUS + 1) + ',' +
    (Blockly.BlockSvg.CORNER_RADIUS + 1);
/**
 * SVG path for drawing highlight on the bottom-left corner of a statement
 * input in LTR.
 * @const
 */
Blockly.BlockSvg.INNER_BOTTOM_LEFT_CORNER_HIGHLIGHT_LTR =
    'a ' + (Blockly.BlockSvg.CORNER_RADIUS + 1) + ',' +
    (Blockly.BlockSvg.CORNER_RADIUS + 1) + ' 0 0,0 ' +
    (Blockly.BlockSvg.CORNER_RADIUS -
        Blockly.BlockSvg.DISTANCE_45_OUTSIDE) + ',' +
    (Blockly.BlockSvg.DISTANCE_45_OUTSIDE + 1);

/**
 * Dispose of this SVG block.
 */
Blockly.BlockSvg.prototype.dispose = function () {
    domConstruct.destroy(this.svgGroup_);
    // Sever JavaScript to DOM connections.
    this.svgGroup_ = null;
    this.svgPath_ = null;
    this.svgPathLight_ = null;
    this.svgPathDark_ = null;
    // Break circular references.
    this.block_ = null;
};

/**
 * Play some UI effects (sound, animation) when disposing of a block.
 */
Blockly.BlockSvg.prototype.disposeUiEffect = function () {
    Blockly.playAudio('delete');

    var xy = Blockly.getSvgXY_(/** @type {!Element} */ (this.svgGroup_));
    // Deeply clone the current block.
    var clone = this.svgGroup_.cloneNode(true);
    clone.translateX_ = xy.x;
    clone.translateY_ = xy.y;
    clone.setAttribute('transform',
            'translate(' + clone.translateX_ + ',' + clone.translateY_ + ')');
    Blockly.svg.appendChild(clone);
    clone.bBox_ = clone.getBBox();
    // Start the animation.
    clone.startDate_ = new Date();
    Blockly.BlockSvg.disposeUiStep_(clone);
};

/**
 * Animate a cloned block and eventually dispose of it.
 * @param {!Element} clone SVG element to animate and dispose of.
 * @private
 */
Blockly.BlockSvg.disposeUiStep_ = function (clone) {
    var ms = (new Date()) - clone.startDate_;
    var percent = ms / 150;
    if (percent > 1) {
        domConstruct.destroy(clone);
    } else {
        var x = clone.translateX_ +
            (Blockly.RTL ? -1 : 1) * clone.bBox_.width / 2 * percent;
        var y = clone.translateY_ + clone.bBox_.height * percent;
        var translate = x + ', ' + y;
        var scale = 1 - percent;
        clone.setAttribute('transform', 'translate(' + translate + ')' +
            ' scale(' + scale + ')');
        var closure = function () {
            Blockly.BlockSvg.disposeUiStep_(clone);
        };
        window.setTimeout(closure, 10);
    }
};

/**
 * Play some UI effects (sound, ripple) after a connection has been established.
 */
Blockly.BlockSvg.prototype.connectionUiEffect = function () {
    Blockly.playAudio('click');

    // Determine the absolute coordinates of the inferior block.
    var xy = Blockly.getSvgXY_(/** @type {!Element} */ (this.svgGroup_));
    // Offset the coordinates based on the two connection types.
    if (this.block_.outputConnection) {
        xy.x += Blockly.RTL ? 3 : -3;
        xy.y += 13;
    } else if (this.block_.previousConnection) {
        xy.x += Blockly.RTL ? -23 : 23;
        xy.y += 3;
    }
    var ripple = Blockly.createSvgElement('circle',
        {'cx': xy.x, 'cy': xy.y, 'r': 0, 'fill': 'none',
            'stroke': '#888', 'stroke-width': 10},
        Blockly.svg);
    // Start the animation.
    ripple.startDate_ = new Date();
    Blockly.BlockSvg.connectionUiStep_(ripple);
};

/**
 * Expand a ripple around a connection.
 * @param {!Element} ripple Element to animate.
 * @private
 */
Blockly.BlockSvg.connectionUiStep_ = function (ripple) {
    var ms = (new Date()) - ripple.startDate_;
    var percent = ms / 150;
    if (percent > 1) {
        domConstruct.destroy(ripple);
    } else {
        ripple.setAttribute('r', percent * 25);
        ripple.style.opacity = 1 - percent;
        var closure = function () {
            Blockly.BlockSvg.connectionUiStep_(ripple);
        };
        window.setTimeout(closure, 10);
    }
};

/**
 * Change the colour of a block.
 */
Blockly.BlockSvg.prototype.updateColour = function () {
    if (this.block_.disabled) {
        // Disabled blocks don't have colour.
        return;
    }
    var rgb = Blockly.makeColour(this.block_.getColour());
    var rgbLight = Blockly.makeColour(this.block_.getColour());
    rgbLight.r = rgb.r - 20;
    rgbLight.g = rgb.g - 20;
    rgbLight.b = rgb.b - 20;
    rgbLight.a = rgb.a;
    var rgbDark = Blockly.makeColour(this.block_.getColour());
    rgbDark.r = rgb.r + 20;
    rgbDark.g = rgb.g + 20;
    rgbDark.b = rgb.b + 20;
    rgbDark.a = rgb.a;
    this.svgPathLight_.setAttribute('stroke', rgbLight);
    this.svgPathDark_.setAttribute('fill', rgbDark);
    this.svgPath_.setAttribute('fill', rgb);
};

/**
 * Enable or disable a block.
 */
Blockly.BlockSvg.prototype.updateDisabled = function () {
    if (this.block_.disabled || this.block_.getInheritedDisabled()) {
        Blockly.addClass_(/** @type {!Element} */ (this.svgGroup_),
            'blocklyDisabled');
        this.svgPath_.setAttribute('fill', 'url(#blocklyDisabledPattern)');
    } else {
        Blockly.removeClass_(/** @type {!Element} */ (this.svgGroup_),
            'blocklyDisabled');
        this.updateColour();
    }
    var children = this.block_.getChildren();
    for (var x = 0, child; child = children[x]; x++) {
        child.svg_.updateDisabled();
    }
};

/**
 * Select this block.  Highlight it visually.
 */
Blockly.BlockSvg.prototype.addSelect = function () {
    Blockly.addClass_(/** @type {!Element} */ (this.svgGroup_),
        'blocklySelected');
    // Move the selected block to the top of the stack.
    this.svgGroup_.parentNode.appendChild(this.svgGroup_);
};

/**
 * Unselect this block.  Remove its highlighting.
 */
Blockly.BlockSvg.prototype.removeSelect = function () {
    Blockly.removeClass_(/** @type {!Element} */ (this.svgGroup_),
        'blocklySelected');
};

/**
 * Adds the dragging class to this block.
 * Also disables the highlights/shadows to improve performance.
 */
Blockly.BlockSvg.prototype.addDragging = function () {
    Blockly.addClass_(/** @type {!Element} */ (this.svgGroup_),
        'blocklyDragging');
};

/**
 * Removes the dragging class from this block.
 */
Blockly.BlockSvg.prototype.removeDragging = function () {
    Blockly.removeClass_(/** @type {!Element} */ (this.svgGroup_),
        'blocklyDragging');
};

/**
 * Render the block.
 * Lays out and reflows a block based on its contents and settings.
 */
Blockly.BlockSvg.prototype.render = function () {
    this.block_.rendered = true;

    var cursorX = Blockly.BlockSvg.SEP_SPACE_X;
    if (Blockly.RTL) {
        cursorX = -cursorX;
    }
    // Move the icons into position.
    var icons = this.block_.getIcons();
    for (var x = 0; x < icons.length; x++) {
        cursorX = icons[x].renderIcon(cursorX);
    }
    cursorX += Blockly.RTL ?
        Blockly.BlockSvg.SEP_SPACE_X : -Blockly.BlockSvg.SEP_SPACE_X;
    // If there are no icons, cursorX will be 0, otherwise it will be the
    // width that the first label needs to move over by.

    var inputRows = this.renderCompute_(cursorX);
    this.renderDraw_(cursorX, inputRows);

    // Render all blocks above this one (propagate a reflow).
    var parentBlock = this.block_.getParent();
    if (parentBlock) {
        parentBlock.render();
    } else {
        // Top-most block.  Fire an event to allow scrollbars to resize.
        Blockly.fireUiEvent(window, 'resize');
    }
};

/**
 * Render a list of fields starting at the specified location.
 * @param {!Array.<!Blockly.Field>} fieldList List of fields.
 * @param {number} cursorX X-coordinate to start the fields.
 * @param {number} cursorY Y-coordinate to start the fields.
 * @return {number} X-coordinate of the end of the field row (plus a gap).
 * @private
 */
Blockly.BlockSvg.prototype.renderFields_ =
    function (fieldList, cursorX, cursorY) {
        if (Blockly.RTL) {
            cursorX = -cursorX;
        }
        for (var t = 0, field; field = fieldList[t]; t++) {
            if (Blockly.RTL) {
                cursorX -= field.renderSep + field.renderWidth;
                field.getRootElement().setAttribute('transform',
                        'translate(' + cursorX + ', ' + cursorY + ')');
                if (field.renderWidth) {
                    cursorX -= Blockly.BlockSvg.SEP_SPACE_X;
                }
            } else {
                field.getRootElement().setAttribute('transform',
                        'translate(' + (cursorX + field.renderSep) + ', ' + cursorY + ')');
                if (field.renderWidth) {
                    cursorX += field.renderSep + field.renderWidth +
                        Blockly.BlockSvg.SEP_SPACE_X;
                }
            }
        }
        return Blockly.RTL ? -cursorX : cursorX;
    };

/**
 * Computes the height and widths for each row and field.
 * @param {number} iconWidth Offset of first row due to icons.
 * @return {!Array.<!Array.<!Object>>} 2D array of objects, each containing
 *     position information.
 * @private
 */
Blockly.BlockSvg.prototype.renderCompute_ = function (iconWidth) {
    var inputList = this.block_.inputList;
    var inputRows = [];
    inputRows.rightEdge = iconWidth + Blockly.BlockSvg.SEP_SPACE_X * 2;
    if (this.block_.previousConnection || this.block_.nextConnection) {
        inputRows.rightEdge = Math.max(inputRows.rightEdge,
                Blockly.BlockSvg.NOTCH_WIDTH + Blockly.BlockSvg.SEP_SPACE_X);
    }
    var fieldValueWidth = 0;  // Width of longest external value field.
    var fieldStatementWidth = 0;  // Width of longest statement field.
    var hasValue = false;
    var hasStatement = false;
    var hasDummy = false;
    var lastType = undefined;
    var isInline = this.block_.inputsInline && !this.block_.isCollapsed();
    for (var i = 0, input; input = inputList[i]; i++) {
        if (!input.isVisible()) {
            continue;
        }
        var row;
        if (!isInline || !lastType ||
            lastType == Blockly.NEXT_STATEMENT ||
            input.type == Blockly.NEXT_STATEMENT) {
            // Create new row.
            lastType = input.type;
            row = [];
            if (isInline && input.type != Blockly.NEXT_STATEMENT) {
                row.type = Blockly.BlockSvg.INLINE;
            } else {
                row.type = input.type;
            }
            row.height = 0;
            inputRows.push(row);
        } else {
            row = inputRows[inputRows.length - 1];
        }
        row.push(input);

        // Compute minimum input size.
        input.renderHeight = Blockly.BlockSvg.MIN_BLOCK_Y;
        // The width is currently only needed for inline value inputs.
        if (isInline && input.type == Blockly.INPUT_VALUE) {
            input.renderWidth = Blockly.BlockSvg.TAB_WIDTH +
                Blockly.BlockSvg.SEP_SPACE_X * 1.25;
        } else {
            input.renderWidth = 0;
        }
        // Expand input size if there is a connection.
        if (input.connection && input.connection.targetConnection) {
            var linkedBlock = input.connection.targetBlock();
            var bBox = linkedBlock.getHeightWidth();
            input.renderHeight = Math.max(input.renderHeight, bBox.height);
            input.renderWidth = Math.max(input.renderWidth, bBox.width);
        }

        if (i == inputList.length - 1) {
            // Last element should overhang slightly due to shadow.
            input.renderHeight--;
        }
        row.height = Math.max(row.height, input.renderHeight);
        input.fieldWidth = 0;
        if (inputRows.length == 1) {
            // The first row gets shifted to accommodate any icons.
            input.fieldWidth += Blockly.RTL ? -iconWidth : iconWidth;
        }
        var previousFieldEditable = false;
        for (var j = 0, field; field = input.fieldRow[j]; j++) {
            if (j != 0) {
                input.fieldWidth += Blockly.BlockSvg.SEP_SPACE_X;
            }
            // Get the dimensions of the field.
            var fieldSize = field.getSize();
            field.renderWidth = fieldSize.width;
            field.renderSep = (previousFieldEditable && field.EDITABLE) ?
                Blockly.BlockSvg.SEP_SPACE_X : 0;
            input.fieldWidth += field.renderWidth + field.renderSep;
            row.height = Math.max(row.height, fieldSize.height);
            previousFieldEditable = field.EDITABLE;
        }

        if (row.type != Blockly.BlockSvg.INLINE) {
            if (row.type == Blockly.NEXT_STATEMENT) {
                hasStatement = true;
                fieldStatementWidth = Math.max(fieldStatementWidth, input.fieldWidth);
            } else {
                if (row.type == Blockly.INPUT_VALUE) {
                    hasValue = true;
                } else if (row.type == Blockly.DUMMY_INPUT) {
                    hasDummy = true;
                }
                fieldValueWidth = Math.max(fieldValueWidth, input.fieldWidth);
            }
        }
    }

    // Make inline rows a bit thicker in order to enclose the values.
    for (var y = 0, row; row = inputRows[y]; y++) {
        row.thicker = false;
        if (row.type == Blockly.BlockSvg.INLINE) {
            for (var z = 0, input; input = row[z]; z++) {
                if (input.type == Blockly.INPUT_VALUE) {
                    row.height += 2 * Blockly.BlockSvg.INLINE_PADDING_Y;
                    row.thicker = true;
                    break;
                }
            }
        }
    }

    // Compute the statement edge.
    // This is the width of a block where statements are nested.
    inputRows.statementEdge = 2 * Blockly.BlockSvg.SEP_SPACE_X +
        fieldStatementWidth;
    // Compute the preferred right edge.  Inline blocks may extend beyond.
    // This is the width of the block where external inputs connect.
    if (hasStatement) {
        inputRows.rightEdge = Math.max(inputRows.rightEdge,
                inputRows.statementEdge + Blockly.BlockSvg.NOTCH_WIDTH);
    }
    if (hasValue) {
        inputRows.rightEdge = Math.max(inputRows.rightEdge, fieldValueWidth +
            Blockly.BlockSvg.SEP_SPACE_X * 2 + Blockly.BlockSvg.TAB_WIDTH);
    } else if (hasDummy) {
        inputRows.rightEdge = Math.max(inputRows.rightEdge, fieldValueWidth +
            Blockly.BlockSvg.SEP_SPACE_X * 2);
    }

    inputRows.hasValue = hasValue;
    inputRows.hasStatement = hasStatement;
    inputRows.hasDummy = hasDummy;
    return inputRows;
};


/**
 * Draw the path of the block.
 * Move the fields to the correct locations.
 * @param {number} iconWidth Offset of first row due to icons.
 * @param {!Array.<!Array.<!Object>>} inputRows 2D array of objects, each
 *     containing position information.
 * @private
 */
Blockly.BlockSvg.prototype.renderDraw_ = function (iconWidth, inputRows) {
    // Should the top and bottom left corners be rounded or square?
    if (this.block_.outputConnection) {
        this.squareTopLeftCorner_ = true;
        this.squareBottomLeftCorner_ = true;
    } else {
        this.squareTopLeftCorner_ = false;
        this.squareBottomLeftCorner_ = false;
        // If this block is in the middle of a stack, square the corners.
        if (this.block_.previousConnection) {
            var prevBlock = this.block_.previousConnection.targetBlock();
            if (prevBlock && prevBlock.nextConnection &&
                prevBlock.nextConnection.targetConnection ==
                this.block_.previousConnection) {
                this.squareTopLeftCorner_ = true;
            }
        }
        if (this.block_.nextConnection) {
            var nextBlock = this.block_.nextConnection.targetBlock();
            if (nextBlock && nextBlock.previousConnection &&
                nextBlock.previousConnection.targetConnection ==
                this.block_.nextConnection) {
                this.squareBottomLeftCorner_ = true;
            }
        }
    }

    // Fetch the block's coordinates on the surface for use in anchoring
    // the connections.
    var connectionsXY = this.block_.getRelativeToSurfaceXY();

    // Assemble the block's path.
    var steps = [];
    var inlineSteps = [];
    // The highlighting applies to edges facing the upper-left corner.
    // Since highlighting is a two-pixel wide border, it would normally overhang
    // the edge of the block by a pixel. So undersize all measurements by a pixel.
    var highlightSteps = [];
    var highlightInlineSteps = [];

    this.renderDrawTop_(steps, highlightSteps, connectionsXY,
        inputRows.rightEdge);
    var cursorY = this.renderDrawRight_(steps, highlightSteps, inlineSteps,
        highlightInlineSteps, connectionsXY, inputRows, iconWidth);
    this.renderDrawBottom_(steps, highlightSteps, connectionsXY, cursorY);
    this.renderDrawLeft_(steps, highlightSteps, connectionsXY, cursorY);

    var pathString = steps.join(' ') + '\n' + inlineSteps.join(' ');
    this.svgPath_.setAttribute('d', pathString);
    this.svgPathDark_.setAttribute('d', pathString);
    pathString = highlightSteps.join(' ') + '\n' + highlightInlineSteps.join(' ');
    this.svgPathLight_.setAttribute('d', pathString);
    if (Blockly.RTL) {
        // Mirror the block's path.
        this.svgPath_.setAttribute('transform', 'scale(-1 1)');
        this.svgPathLight_.setAttribute('transform', 'scale(-1 1)');
        this.svgPathDark_.setAttribute('transform', 'translate(1,1) scale(-1 1)');
    }
};

/**
 * Render the top edge of the block.
 * @param {!Array.<string>} steps Path of block outline.
 * @param {!Array.<string>} highlightSteps Path of block highlights.
 * @param {!Object} connectionsXY Location of block.
 * @param {number} rightEdge Minimum width of block.
 * @private
 */
Blockly.BlockSvg.prototype.renderDrawTop_ =
    function (steps, highlightSteps, connectionsXY, rightEdge) {
        // Position the cursor at the top-left starting point.
        if (this.squareTopLeftCorner_) {
            steps.push('m 0,0');
            highlightSteps.push('m 1,1');
        } else {
            steps.push(Blockly.BlockSvg.TOP_LEFT_CORNER_START);
            highlightSteps.push(Blockly.RTL ?
                Blockly.BlockSvg.TOP_LEFT_CORNER_START_HIGHLIGHT_RTL :
                Blockly.BlockSvg.TOP_LEFT_CORNER_START_HIGHLIGHT_LTR);
            // Top-left rounded corner.
            steps.push(Blockly.BlockSvg.TOP_LEFT_CORNER);
            highlightSteps.push(Blockly.BlockSvg.TOP_LEFT_CORNER_HIGHLIGHT);
        }

        // Top edge.
        if (this.block_.previousConnection) {
            steps.push('H', Blockly.BlockSvg.NOTCH_WIDTH - 15);
            highlightSteps.push('H', Blockly.BlockSvg.NOTCH_WIDTH - 15);
            steps.push(Blockly.BlockSvg.NOTCH_PATH_LEFT);
            highlightSteps.push(Blockly.BlockSvg.NOTCH_PATH_LEFT_HIGHLIGHT);
            // Create previous block connection.
            var connectionX = connectionsXY.x + (Blockly.RTL ?
                -Blockly.BlockSvg.NOTCH_WIDTH : Blockly.BlockSvg.NOTCH_WIDTH);
            var connectionY = connectionsXY.y;
            this.block_.previousConnection.moveTo(connectionX, connectionY);
            // This connection will be tightened when the parent renders.
        }
        steps.push('H', rightEdge);
        highlightSteps.push('H', rightEdge + (Blockly.RTL ? -1 : 0));
        this.width = rightEdge;
    };

/**
 * Render the right edge of the block.
 * @param {!Array.<string>} steps Path of block outline.
 * @param {!Array.<string>} highlightSteps Path of block highlights.
 * @param {!Array.<string>} inlineSteps Inline block outlines.
 * @param {!Array.<string>} highlightInlineSteps Inline block highlights.
 * @param {!Object} connectionsXY Location of block.
 * @param {!Array.<!Array.<!Object>>} inputRows 2D array of objects, each
 *     containing position information.
 * @param {number} iconWidth Offset of first row due to icons.
 * @return {number} Height of block.
 * @private
 */
Blockly.BlockSvg.prototype.renderDrawRight_ =
    function (steps, highlightSteps, inlineSteps, highlightInlineSteps, connectionsXY, inputRows, iconWidth) {
        var cursorX;
        var cursorY = 0;
        var connectionX, connectionY;
        for (var y = 0, row; row = inputRows[y]; y++) {
            cursorX = Blockly.BlockSvg.SEP_SPACE_X;
            if (y == 0) {
                cursorX += Blockly.RTL ? -iconWidth : iconWidth;
            }
            highlightSteps.push('M', (inputRows.rightEdge - 1) + ',' + (cursorY + 1));
            if (this.block_.isCollapsed()) {
                // Jagged right edge.
                var input = row[0];
                var fieldX = cursorX;
                var fieldY = cursorY + Blockly.BlockSvg.FIELD_HEIGHT;
                this.renderFields_(input.fieldRow, fieldX, fieldY);
                steps.push(Blockly.BlockSvg.JAGGED_TEETH);
                if (Blockly.RTL) {
                    highlightSteps.push('l 8,0 0,3.8 7,3.2 m -14.5,9 l 8,4');
                } else {
                    highlightSteps.push('h 8');
                }
                var remainder = row.height - Blockly.BlockSvg.JAGGED_TEETH_HEIGHT;
                steps.push('v', remainder);
                if (Blockly.RTL) {
                    highlightSteps.push('v', remainder - 2);
                }
                this.width += Blockly.BlockSvg.JAGGED_TEETH_WIDTH;
            } else if (row.type == Blockly.BlockSvg.INLINE) {
                // Inline inputs.
                for (var x = 0, input; input = row[x]; x++) {
                    var fieldX = cursorX;
                    var fieldY = cursorY + Blockly.BlockSvg.FIELD_HEIGHT;
                    if (row.thicker) {
                        // Lower the field slightly.
                        fieldY += Blockly.BlockSvg.INLINE_PADDING_Y;
                    }
                    // TODO: Align inline field rows (left/right/centre).
                    cursorX = this.renderFields_(input.fieldRow, fieldX, fieldY);
                    if (input.type != Blockly.DUMMY_INPUT) {
                        cursorX += input.renderWidth + Blockly.BlockSvg.SEP_SPACE_X;
                    }
                    if (input.type == Blockly.INPUT_VALUE) {
                        inlineSteps.push('M', (cursorX - Blockly.BlockSvg.SEP_SPACE_X) +
                            ',' + (cursorY + Blockly.BlockSvg.INLINE_PADDING_Y));
                        inlineSteps.push('h', Blockly.BlockSvg.TAB_WIDTH - 2 -
                            input.renderWidth);
                        inlineSteps.push(Blockly.BlockSvg.TAB_PATH_DOWN);
                        inlineSteps.push('v', input.renderHeight + 1 -
                            Blockly.BlockSvg.TAB_HEIGHT);
                        inlineSteps.push('h', input.renderWidth + 2 -
                            Blockly.BlockSvg.TAB_WIDTH);
                        inlineSteps.push('z');
                        if (Blockly.RTL) {
                            // Highlight right edge, around back of tab, and bottom.
                            highlightInlineSteps.push('M',
                                    (cursorX - Blockly.BlockSvg.SEP_SPACE_X - 3 +
                                        Blockly.BlockSvg.TAB_WIDTH - input.renderWidth) + ',' +
                                    (cursorY + Blockly.BlockSvg.INLINE_PADDING_Y + 1));
                            highlightInlineSteps.push(
                                Blockly.BlockSvg.TAB_PATH_DOWN_HIGHLIGHT_RTL);
                            highlightInlineSteps.push('v',
                                    input.renderHeight - Blockly.BlockSvg.TAB_HEIGHT + 3);
                            highlightInlineSteps.push('h',
                                    input.renderWidth - Blockly.BlockSvg.TAB_WIDTH + 1);
                        } else {
                            // Highlight right edge, bottom, and glint at bottom of tab.
                            highlightInlineSteps.push('M',
                                    (cursorX - Blockly.BlockSvg.SEP_SPACE_X + 1) + ',' +
                                    (cursorY + Blockly.BlockSvg.INLINE_PADDING_Y + 1));
                            highlightInlineSteps.push('v', input.renderHeight + 1);
                            highlightInlineSteps.push('h', Blockly.BlockSvg.TAB_WIDTH - 2 -
                                input.renderWidth);
                            highlightInlineSteps.push('M',
                                    (cursorX - input.renderWidth - Blockly.BlockSvg.SEP_SPACE_X +
                                        0.8) + ',' + (cursorY + Blockly.BlockSvg.INLINE_PADDING_Y +
                                    Blockly.BlockSvg.TAB_HEIGHT - 0.4));
                            highlightInlineSteps.push('l',
                                    (Blockly.BlockSvg.TAB_WIDTH * 0.42) + ',-1.8');
                        }
                        // Create inline input connection.
                        if (Blockly.RTL) {
                            connectionX = connectionsXY.x - cursorX -
                                Blockly.BlockSvg.TAB_WIDTH + Blockly.BlockSvg.SEP_SPACE_X +
                                input.renderWidth + 1;
                        } else {
                            connectionX = connectionsXY.x + cursorX +
                                Blockly.BlockSvg.TAB_WIDTH - Blockly.BlockSvg.SEP_SPACE_X -
                                input.renderWidth - 1;
                        }
                        connectionY = connectionsXY.y + cursorY +
                            Blockly.BlockSvg.INLINE_PADDING_Y + 1;
                        input.connection.moveTo(connectionX, connectionY);
                        if (input.connection.targetConnection) {
                            input.connection.tighten_();
                        }
                    }
                }

                cursorX = Math.max(cursorX, inputRows.rightEdge);
                this.width = Math.max(this.width, cursorX);
                steps.push('H', cursorX);
                highlightSteps.push('H', cursorX + (Blockly.RTL ? -1 : 0));
                steps.push('v', row.height);
                if (Blockly.RTL) {
                    highlightSteps.push('v', row.height - 2);
                }
            } else if (row.type == Blockly.INPUT_VALUE) {
                // External input.
                var input = row[0];
                var fieldX = cursorX;
                var fieldY = cursorY + Blockly.BlockSvg.FIELD_HEIGHT;
                if (input.align != Blockly.ALIGN_LEFT) {
                    var fieldRightX = inputRows.rightEdge - input.fieldWidth -
                        Blockly.BlockSvg.TAB_WIDTH - 2 * Blockly.BlockSvg.SEP_SPACE_X;
                    if (input.align == Blockly.ALIGN_RIGHT) {
                        fieldX += fieldRightX;
                    } else if (input.align == Blockly.ALIGN_CENTRE) {
                        fieldX += (fieldRightX + fieldX) / 2;
                    }
                }
                this.renderFields_(input.fieldRow, fieldX, fieldY);
                steps.push(Blockly.BlockSvg.TAB_PATH_DOWN);
                var v = row.height - Blockly.BlockSvg.TAB_HEIGHT
                steps.push('v', v);
                if (Blockly.RTL) {
                    // Highlight around back of tab.
                    highlightSteps.push(Blockly.BlockSvg.TAB_PATH_DOWN_HIGHLIGHT_RTL);
                    highlightSteps.push('v', v);
                } else {
                    // Short highlight glint at bottom of tab.
                    highlightSteps.push('M', (inputRows.rightEdge - 4.2) + ',' +
                        (cursorY + Blockly.BlockSvg.TAB_HEIGHT - 0.4));
                    highlightSteps.push('l', (Blockly.BlockSvg.TAB_WIDTH * 0.42) +
                        ',-1.8');
                }
                // Create external input connection.
                connectionX = connectionsXY.x +
                    (Blockly.RTL ? -inputRows.rightEdge - 1 : inputRows.rightEdge + 1);
                connectionY = connectionsXY.y + cursorY;
                input.connection.moveTo(connectionX, connectionY);
                if (input.connection.targetConnection) {
                    input.connection.tighten_();
                    this.width = Math.max(this.width, inputRows.rightEdge +
                        input.connection.targetBlock().getHeightWidth().width -
                        Blockly.BlockSvg.TAB_WIDTH + 1);
                }
            } else if (row.type == Blockly.DUMMY_INPUT) {
                // External naked field.
                var input = row[0];
                var fieldX = cursorX;
                var fieldY = cursorY + Blockly.BlockSvg.FIELD_HEIGHT;
                if (input.align != Blockly.ALIGN_LEFT) {
                    var fieldRightX = inputRows.rightEdge - input.fieldWidth -
                        2 * Blockly.BlockSvg.SEP_SPACE_X;
                    if (inputRows.hasValue) {
                        fieldRightX -= Blockly.BlockSvg.TAB_WIDTH;
                    }
                    if (input.align == Blockly.ALIGN_RIGHT) {
                        fieldX += fieldRightX;
                    } else if (input.align == Blockly.ALIGN_CENTRE) {
                        fieldX += (fieldRightX + fieldX) / 2;
                    }
                }
                this.renderFields_(input.fieldRow, fieldX, fieldY);
                steps.push('v', row.height);
                if (Blockly.RTL) {
                    highlightSteps.push('v', row.height - 2);
                }
            } else if (row.type == Blockly.NEXT_STATEMENT) {
                // Nested statement.
                var input = row[0];
                if (y == 0) {
                    // If the first input is a statement stack, add a small row on top.
                    steps.push('v', Blockly.BlockSvg.SEP_SPACE_Y);
                    if (Blockly.RTL) {
                        highlightSteps.push('v', Blockly.BlockSvg.SEP_SPACE_Y - 1);
                    }
                    cursorY += Blockly.BlockSvg.SEP_SPACE_Y;
                }
                var fieldX = cursorX;
                var fieldY = cursorY + Blockly.BlockSvg.FIELD_HEIGHT;
                if (input.align != Blockly.ALIGN_LEFT) {
                    var fieldRightX = inputRows.statementEdge - input.fieldWidth -
                        2 * Blockly.BlockSvg.SEP_SPACE_X;
                    if (input.align == Blockly.ALIGN_RIGHT) {
                        fieldX += fieldRightX;
                    } else if (input.align == Blockly.ALIGN_CENTRE) {
                        fieldX += (fieldRightX + fieldX) / 2;
                    }
                }
                this.renderFields_(input.fieldRow, fieldX, fieldY);
                cursorX = inputRows.statementEdge + Blockly.BlockSvg.NOTCH_WIDTH;
                steps.push('H', cursorX);
                steps.push(Blockly.BlockSvg.INNER_TOP_LEFT_CORNER);
                steps.push('v', row.height - 2 * Blockly.BlockSvg.CORNER_RADIUS);
                steps.push(Blockly.BlockSvg.INNER_BOTTOM_LEFT_CORNER);
                steps.push('H', inputRows.rightEdge);
                if (Blockly.RTL) {
                    highlightSteps.push('M',
                            (cursorX - Blockly.BlockSvg.NOTCH_WIDTH +
                                Blockly.BlockSvg.DISTANCE_45_OUTSIDE) +
                            ',' + (cursorY + Blockly.BlockSvg.DISTANCE_45_OUTSIDE));
                    highlightSteps.push(
                        Blockly.BlockSvg.INNER_TOP_LEFT_CORNER_HIGHLIGHT_RTL);
                    highlightSteps.push('v',
                            row.height - 2 * Blockly.BlockSvg.CORNER_RADIUS);
                    highlightSteps.push(
                        Blockly.BlockSvg.INNER_BOTTOM_LEFT_CORNER_HIGHLIGHT_RTL);
                    highlightSteps.push('H', inputRows.rightEdge - 1);
                } else {
                    highlightSteps.push('M',
                            (cursorX - Blockly.BlockSvg.NOTCH_WIDTH +
                                Blockly.BlockSvg.DISTANCE_45_OUTSIDE) + ',' +
                            (cursorY + row.height - Blockly.BlockSvg.DISTANCE_45_OUTSIDE));
                    highlightSteps.push(
                        Blockly.BlockSvg.INNER_BOTTOM_LEFT_CORNER_HIGHLIGHT_LTR);
                    highlightSteps.push('H', inputRows.rightEdge);
                }
                // Create statement connection.
                connectionX = connectionsXY.x + (Blockly.RTL ? -cursorX : cursorX);
                connectionY = connectionsXY.y + cursorY + 1;
                input.connection.moveTo(connectionX, connectionY);
                if (input.connection.targetConnection) {
                    input.connection.tighten_();
                    this.width = Math.max(this.width, inputRows.statementEdge +
                        input.connection.targetBlock().getHeightWidth().width);
                }
                if (y == inputRows.length - 1 ||
                    inputRows[y + 1].type == Blockly.NEXT_STATEMENT) {
                    // If the final input is a statement stack, add a small row underneath.
                    // Consecutive statement stacks are also separated by a small divider.
                    steps.push('v', Blockly.BlockSvg.SEP_SPACE_Y);
                    if (Blockly.RTL) {
                        highlightSteps.push('v', Blockly.BlockSvg.SEP_SPACE_Y - 1);
                    }
                    cursorY += Blockly.BlockSvg.SEP_SPACE_Y;
                }
            }
            cursorY += row.height;
        }
        if (!inputRows.length) {
            cursorY = Blockly.BlockSvg.MIN_BLOCK_Y;
            steps.push('V', cursorY);
            if (Blockly.RTL) {
                highlightSteps.push('V', cursorY - 1);
            }
        }
        return cursorY;
    };

/**
 * Render the bottom edge of the block.
 * @param {!Array.<string>} steps Path of block outline.
 * @param {!Array.<string>} highlightSteps Path of block highlights.
 * @param {!Object} connectionsXY Location of block.
 * @param {number} cursorY Height of block.
 * @private
 */
Blockly.BlockSvg.prototype.renderDrawBottom_ = function (steps, highlightSteps, connectionsXY, cursorY) {
    this.height = cursorY + 1;  // Add one for the shadow.
    if (this.block_.nextConnection) {
        steps.push('H', Blockly.BlockSvg.NOTCH_WIDTH + ' ' +
            Blockly.BlockSvg.NOTCH_PATH_RIGHT);
        // Create next block connection.
        var connectionX;
        if (Blockly.RTL) {
            connectionX = connectionsXY.x - Blockly.BlockSvg.NOTCH_WIDTH;
        } else {
            connectionX = connectionsXY.x + Blockly.BlockSvg.NOTCH_WIDTH;
        }
        var connectionY = connectionsXY.y + cursorY + 1;
        this.block_.nextConnection.moveTo(connectionX, connectionY);
        if (this.block_.nextConnection.targetConnection) {
            this.block_.nextConnection.tighten_();
        }
        this.height += 4;  // Height of tab.
    }

    // Should the bottom-left corner be rounded or square?
    if (this.squareBottomLeftCorner_) {
        steps.push('H 0');
        if (!Blockly.RTL) {
            highlightSteps.push('M', '1,' + cursorY);
        }
    } else {
        steps.push('H', Blockly.BlockSvg.CORNER_RADIUS);
        steps.push('a', Blockly.BlockSvg.CORNER_RADIUS + ',' +
            Blockly.BlockSvg.CORNER_RADIUS + ' 0 0,1 -' +
            Blockly.BlockSvg.CORNER_RADIUS + ',-' +
            Blockly.BlockSvg.CORNER_RADIUS);
        if (!Blockly.RTL) {
            highlightSteps.push('M', Blockly.BlockSvg.DISTANCE_45_INSIDE + ',' +
                (cursorY - Blockly.BlockSvg.DISTANCE_45_INSIDE));
            highlightSteps.push('A', (Blockly.BlockSvg.CORNER_RADIUS - 1) + ',' +
                (Blockly.BlockSvg.CORNER_RADIUS - 1) + ' 0 0,1 ' +
                '1,' + (cursorY - Blockly.BlockSvg.CORNER_RADIUS));
        }
    }
};

/**
 * Render the left edge of the block.
 * @param {!Array.<string>} steps Path of block outline.
 * @param {!Array.<string>} highlightSteps Path of block highlights.
 * @param {!Object} connectionsXY Location of block.
 * @param {number} cursorY Height of block.
 * @private
 */
Blockly.BlockSvg.prototype.renderDrawLeft_ = function (steps, highlightSteps, connectionsXY, cursorY) {
    if (this.block_.outputConnection) {
        // Create output connection.
        this.block_.outputConnection.moveTo(connectionsXY.x, connectionsXY.y);
        // This connection will be tightened when the parent renders.
        steps.push('V', Blockly.BlockSvg.TAB_HEIGHT);
        steps.push('c 0,-10 -' + Blockly.BlockSvg.TAB_WIDTH + ',8 -' +
            Blockly.BlockSvg.TAB_WIDTH + ',-7.5 s ' + Blockly.BlockSvg.TAB_WIDTH +
            ',2.5 ' + Blockly.BlockSvg.TAB_WIDTH + ',-7.5');
        if (Blockly.RTL) {
            highlightSteps.push('M', (Blockly.BlockSvg.TAB_WIDTH * -0.3) + ',8.9');
            highlightSteps.push('l', (Blockly.BlockSvg.TAB_WIDTH * -0.45) + ',-2.1');
        } else {
            highlightSteps.push('V', Blockly.BlockSvg.TAB_HEIGHT - 1);
            highlightSteps.push('m', (Blockly.BlockSvg.TAB_WIDTH * -0.92) +
                ',-1 q ' + (Blockly.BlockSvg.TAB_WIDTH * -0.19) +
                ',-5.5 0,-11');
            highlightSteps.push('m', (Blockly.BlockSvg.TAB_WIDTH * 0.92) +
                ',1 V 1 H 2');
        }
        this.width += Blockly.BlockSvg.TAB_WIDTH;
    } else if (!Blockly.RTL) {
        if (this.squareTopLeftCorner_) {
            highlightSteps.push('V', 1);
        } else {
            highlightSteps.push('V', Blockly.BlockSvg.CORNER_RADIUS);
        }
    }
    steps.push('z');
};

/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2013 Google Inc.
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
 * @fileoverview Flexible templating system for defining blocks.
 * @author spertus@google.com (Ellen Spertus)
 */
'use strict';

/**
 * Name space for the Blocks singleton.
 * Blocks gets populated in the blocks files, possibly through calls to
 * Blocks.addTemplate().
 */
Blockly.Blocks = {};

/**
 * Create a block template and add it as a field to Blockly.Blocks with the
 * name details.blockName.
 * @param {!Object} details Details about the block that should be created.
 *     The following fields are used:
 *     - blockName {string} The name of the block, which should be unique.
 *     - colour {number} The hue value of the colour to use for the block.
 *       (Blockly.HSV_SATURATION and Blockly.HSV_VALUE are used for saturation
 *       and value, respectively.)
 *     - output {?string|Array.<string>} Output type.  If undefined, there are
 *       assumed to be no outputs.  Otherwise, this is interpreted the same way
 *       as arguments to Blockly.Block.setCheck():
 *       - null: Any type can be produced.
 *       - String: Only the specified type (e.g., 'Number') can be produced.
 *       - Array.<string>: Any of the specified types can be produced.
 *     - message {string} A message suitable for passing as a first argument to
 *       Blockly.Block.interpolateMsg().  Specifically, it should consist of
 *       text to be displayed on the block, optionally interspersed with
 *       references to inputs (one-based indices into the args array) or fields,
 *       such as '%1' for the first element of args.  The creation of dummy
 *       inputs can be forced with a newline (\n).
 *     - args {Array.<Object>} One or more descriptions of value inputs.
 *       TODO: Add Fields and statement stacks.
 *       Each object in the array can have the following fields:
 *       - name {string} The name of the input.
 *       - type {?number} One of Blockly.INPUT_VALUE, Blockly.NEXT_STATEMENT, or
 *         ??.   If not provided, it is assumed to be Blockly.INPUT_VALUE.
 *       - check {?string|Array.<string>} Input type.  See description of the
 *         output field above.
 *       - align {?number} One of Blockly.ALIGN_LEFT, Blockly.ALIGN_CENTRE, or
 *         Blockly.ALIGN_RIGHT (the default value, if not explicitly provided).
 *     - inline {?boolean}: Whether inputs should be inline (true) or external
 *       (false).  If not explicitly specified, inputs will be inline if message
 *       references, and ends with, a single value input.
 *     - previousStatement {?boolean} Whether there should be a statement
 *       connector on the top of the block.  If not specified, the default
 *       value will be !output.
 *     - nextStatement {?boolean} Whether there should be a statement
 *       connector on the bottom of the block.  If not specified, the default
 *       value will be !output.
 *     - tooltip {?string|Function} Tooltip text or a function on this block
 *       that returns a tooltip string.
 *     - helpUrl {?string|Function} The help URL, or a function on this block
 *       that returns the help URL.
 *     - switchable {?boolean} Whether the block should be switchable between
 *       an expression and statement.  Specifically, if true, the block will
 *       begin as an expression (having an output).  There will be a context
 *       menu option 'Remove output'.  If selected, the output will disappear,
 *       and previous and next statement connectors will appear.  The context
 *       menu option 'Remove output' will be replaced by 'Add Output'.  If
 *       selected, the output will reappear and the statement connectors will
 *       disappear.
 *     - mutationToDomFunc {Function} TODO desc.
 *     - domToMutationFunc {Function} TODO desc.
 *     - customContextMenuFunc {Function} TODO desc.
 *     Additional fields will be ignored.
 */
Blockly.Blocks.addTemplate = function (details) {
    // Validate inputs.  TODO: Add more.
    if (details.blockName)
        console.log("Error");
    if (Blockly.Blocks[details.blockName])
        console.log('Blockly.Blocks already has a field named ', details.blockName);
    if (details.message)
        console.log("Error")
    if (details.colour && typeof details.colour == 'number' && details.colour >= 0 && details.colour < 360)
        console.log('details.colour must be a number from 0 to 360 (exclusive)');
    if (details.output != 'undefined') {
        if (!details.previousStatement)
            console.log('When details.output is defined, details.previousStatement must not be true.');
        if (!details.nextStatement)
            console.log('When details.output is defined, details.nextStatement must not be true.');
    }

    // Build up template.
    var block = {};
    block.init = function () {
        var thisBlock = this;
        // Set basic properties of block.
        this.setColour(details.colour);
        this.setHelpUrl(details.helpUrl);
        if (typeof details.tooltip == 'string') {
            this.setTooltip(details.tooltip);
        } else if (typeof details.tooltip == 'function') {
            this.setTooltip(function () {
                return details.tooltip(thisBlock);
            });
        }
        // Set output and previous/next connections.
        if (details.output != 'undefined') {
            this.setOutput(true, details.output);
        } else {
            this.setPreviousStatement(
                    typeof details.previousStatement == 'undefined' ?
                    true : details.previousStatement);
            this.setNextStatement(
                    typeof details.nextStatement == 'undefined' ?
                    true : details.nextStatement);
        }
        // Build up arguments in the format expected by interpolateMsg.
        var interpArgs = [];
        interpArgs.push(details.text);
        if (details.args) {
            details.args.forEach(function (arg) {
                if (arg.name)
                    console.log("Error")
                if (arg.check != 'undefined')
                    console.log("Error")
                if (arg.type == 'undefined' || arg.type == Blockly.INPUT_VALUE) {
                    interpArgs.push([arg.name, arg.check,
                            typeof arg.align == 'undefined' ? Blockly.ALIGN_RIGHT : arg.align]);
                } else {
                    // TODO: Write code for other input types.
                    console.log('addTemplate() can only handle value inputs.');
                }
            });
        }
        // Neil, how would you recommend specifying the final dummy alignment?
        // Should it be a top-level field in details?
        interpArgs.push(Blockly.ALIGN_RIGHT);
        if (details.inline) {
            this.setInlineInputs(details.inline);
        }
        Blockly.Block.prototype.interpolateMsg.apply(this, interpArgs);
    };

    // Create mutationToDom if needed.
    if (details.switchable) {
        block.mutationToDom = function () {
            var container = details.mutationToDomFunc ? details.mutatationToDomFunc()
                : document.createElement('mutation');
            container.setAttribute('is_statement', this['isStatement'] || false);
            return container;
        };
    } else {
        block.mutationToDom = details.mutationToDomFunc;
    }
    // TODO: Add domToMutation and customContextMenu.

    // Add new block to Blockly.Blocks.
    Blockly.Blocks[details.blockName] = block;
};

/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2013 Google Inc.
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
 * @fileoverview Object representing an icon on a block.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

Blockly.Icon = {};

/**
 * Class for an icon.
 * @param {Blockly.Block} block The block associated with this icon.
 * @constructor
 */
Blockly.Icon = function (block) {
    this.block_ = block;
};

/**
 * Radius of icons.
 */
Blockly.Icon.RADIUS = 8;

/**
 * Bubble UI (if visible).
 * @type {Blockly.Bubble}
 * @private
 */
Blockly.Icon.prototype.bubble_ = null;

/**
 * Absolute X coordinate of icon's center.
 * @private
 */
Blockly.Icon.prototype.iconX_ = 0;

/**
 * Absolute Y coordinate of icon's centre.
 * @private
 */
Blockly.Icon.prototype.iconY_ = 0;

/**
 * Create the icon on the block.
 * @private
 */
Blockly.Icon.prototype.createIcon_ = function () {
    /* Here's the markup that will be generated:
     <g class="blocklyIconGroup"></g>
     */
    this.iconGroup_ = Blockly.createSvgElement('g', {}, null);
    this.block_.getSvgRoot().appendChild(this.iconGroup_);
    Blockly.bindEvent_(this.iconGroup_, 'mouseup', this, this.iconClick_);
    this.updateEditable();
};

/**
 * Dispose of this icon.
 */
Blockly.Icon.prototype.dispose = function () {
    // Dispose of and unlink the icon.
    domConstruct.destroy(this.iconGroup_);
    this.iconGroup_ = null;
    // Dispose of and unlink the bubble.
    this.setVisible(false);
    this.block_ = null;
};

/**
 * Add or remove the UI indicating if this icon may be clicked or not.
 */
Blockly.Icon.prototype.updateEditable = function () {
    if (!this.block_.isInFlyout) {
        Blockly.addClass_(/** @type {!Element} */ (this.iconGroup_),
            'blocklyIconGroup');
    } else {
        Blockly.removeClass_(/** @type {!Element} */ (this.iconGroup_),
            'blocklyIconGroup');
    }
};

/**
 * Is the associated bubble visible?
 * @return {boolean} True if the bubble is visible.
 */
Blockly.Icon.prototype.isVisible = function () {
    return !!this.bubble_;
};

/**
 * Clicking on the icon toggles if the bubble is visible.
 * @param {!Event} e Mouse click event.
 * @private
 */
Blockly.Icon.prototype.iconClick_ = function (e) {
    if (!this.block_.isInFlyout) {
        this.setVisible(!this.isVisible());
    }
};

/**
 * Change the colour of the associated bubble to match its block.
 */
Blockly.Icon.prototype.updateColour = function () {
    if (this.isVisible()) {
        var hexColour = Blockly.makeColour(this.block_.getColour());
        this.bubble_.setColour(hexColour);
    }
};

/**
 * Render the icon.
 * @param {number} cursorX Horizontal offset at which to position the icon.
 * @return {number} Horizontal offset for next item to draw.
 */
Blockly.Icon.prototype.renderIcon = function (cursorX) {
    if (this.block_.isCollapsed()) {
        this.iconGroup_.setAttribute('display', 'none');
        return cursorX;
    }
    this.iconGroup_.setAttribute('display', 'block');

    var TOP_MARGIN = 5;
    var diameter = 2 * Blockly.Icon.RADIUS;
    if (Blockly.RTL) {
        cursorX -= diameter;
    }
    this.iconGroup_.setAttribute('transform',
            'translate(' + cursorX + ', ' + TOP_MARGIN + ')');
    this.computeIconLocation();
    if (Blockly.RTL) {
        cursorX -= Blockly.BlockSvg.SEP_SPACE_X;
    } else {
        cursorX += diameter + Blockly.BlockSvg.SEP_SPACE_X;
    }
    return cursorX;
};

/**
 * Notification that the icon has moved.  Update the arrow accordingly.
 * @param {number} x Absolute horizontal location.
 * @param {number} y Absolute vertical location.
 */
Blockly.Icon.prototype.setIconLocation = function (x, y) {
    this.iconX_ = x;
    this.iconY_ = y;
    if (this.isVisible()) {
        this.bubble_.setAnchorLocation(x, y);
    }
};

/**
 * Notification that the icon has moved, but we don't really know where.
 * Recompute the icon's location from scratch.
 */
Blockly.Icon.prototype.computeIconLocation = function () {
    // Find coordinates for the centre of the icon and update the arrow.
    var blockXY = this.block_.getRelativeToSurfaceXY();
    var iconXY = Blockly.getRelativeXY_(this.iconGroup_);
    var newX = blockXY.x + iconXY.x + Blockly.Icon.RADIUS;
    var newY = blockXY.y + iconXY.y + Blockly.Icon.RADIUS;
    if (newX !== this.iconX_ || newY !== this.iconY_) {
        this.setIconLocation(newX, newY);
    }
};

/**
 * Returns the center of the block's icon relative to the surface.
 * @return {!Object} Object with x and y properties.
 */
Blockly.Icon.prototype.getIconLocation = function () {
    return {x: this.iconX_, y: this.iconY_};
};

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
 * @fileoverview Object representing a UI bubble.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * Class for UI bubble.
 * @param {!Blockly.Workspace} workspace The workspace on which to draw the
 *     bubble.
 * @param {!Element} content SVG content for the bubble.
 * @param {Element} shape SVG element to avoid eclipsing.
 * @param {number} anchorX Absolute horizontal position of bubbles anchor point.
 * @param {number} anchorY Absolute vertical position of bubbles anchor point.
 * @param {?number} bubbleWidth Width of bubble, or null if not resizable.
 * @param {?number} bubbleHeight Height of bubble, or null if not resizable.
 * @constructor
 */
Blockly.Bubble = function (workspace, content, shape, anchorX, anchorY, bubbleWidth, bubbleHeight) {
    var angle = Blockly.Bubble.ARROW_ANGLE;
    if (Blockly.RTL) {
        angle = -angle;
    }
    this.arrow_radians_ = angle / 360 * Math.PI * 2;

    this.workspace_ = workspace;
    this.content_ = content;
    this.shape_ = shape;
    var canvas = workspace.getBubbleCanvas();
    canvas.appendChild(this.createDom_(content, !!(bubbleWidth && bubbleHeight)));

    this.setAnchorLocation(anchorX, anchorY);
    if (!bubbleWidth || !bubbleHeight) {
        var bBox = /** @type {SVGLocatable} */ (this.content_).getBBox();
        bubbleWidth = bBox.width + 2 * Blockly.Bubble.BORDER_WIDTH;
        bubbleHeight = bBox.height + 2 * Blockly.Bubble.BORDER_WIDTH;
    }
    this.setBubbleSize(bubbleWidth, bubbleHeight);

    // Render the bubble.
    this.positionBubble_();
    this.renderArrow_();
    this.rendered_ = true;

    if (!Blockly.readOnly) {
        Blockly.bindEvent_(this.bubbleBack_, 'mousedown', this,
            this.bubbleMouseDown_);
        if (this.resizeGroup_) {
            Blockly.bindEvent_(this.resizeGroup_, 'mousedown', this,
                this.resizeMouseDown_);
        }
    }
};

/**
 * Width of the border around the bubble.
 */
Blockly.Bubble.BORDER_WIDTH = 6;

/**
 * Determines the thickness of the base of the arrow in relation to the size
 * of the bubble.  Higher numbers result in thinner arrows.
 */
Blockly.Bubble.ARROW_THICKNESS = 10;

/**
 * The number of degrees that the arrow bends counter-clockwise.
 */
Blockly.Bubble.ARROW_ANGLE = 20;

/**
 * The sharpness of the arrow's bend.  Higher numbers result in smoother arrows.
 */
Blockly.Bubble.ARROW_BEND = 4;

/**
 * Distance between arrow point and anchor point.
 */
Blockly.Bubble.ANCHOR_RADIUS = 8;

/**
 * Wrapper function called when a mouseUp occurs during a drag operation.
 * @type {Array.<!Array>}
 * @private
 */
Blockly.Bubble.onMouseUpWrapper_ = null;

/**
 * Wrapper function called when a mouseMove occurs during a drag operation.
 * @type {Array.<!Array>}
 * @private
 */
Blockly.Bubble.onMouseMoveWrapper_ = null;

/**
 * Stop binding to the global mouseup and mousemove events.
 * @private
 */
Blockly.Bubble.unbindDragEvents_ = function () {
    if (Blockly.Bubble.onMouseUpWrapper_) {
        Blockly.unbindEvent_(Blockly.Bubble.onMouseUpWrapper_);
        Blockly.Bubble.onMouseUpWrapper_ = null;
    }
    if (Blockly.Bubble.onMouseMoveWrapper_) {
        Blockly.unbindEvent_(Blockly.Bubble.onMouseMoveWrapper_);
        Blockly.Bubble.onMouseMoveWrapper_ = null;
    }
};

/**
 * Flag to stop incremental rendering during construction.
 * @private
 */
Blockly.Bubble.prototype.rendered_ = false;

/**
 * Absolute X coordinate of anchor point.
 * @private
 */
Blockly.Bubble.prototype.anchorX_ = 0;

/**
 * Absolute Y coordinate of anchor point.
 * @private
 */
Blockly.Bubble.prototype.anchorY_ = 0;

/**
 * Relative X coordinate of bubble with respect to the anchor's centre.
 * In RTL mode the initial value is negated.
 * @private
 */
Blockly.Bubble.prototype.relativeLeft_ = 0;

/**
 * Relative Y coordinate of bubble with respect to the anchor's centre.
 * @private
 */
Blockly.Bubble.prototype.relativeTop_ = 0;

/**
 * Width of bubble.
 * @private
 */
Blockly.Bubble.prototype.width_ = 0;

/**
 * Height of bubble.
 * @private
 */
Blockly.Bubble.prototype.height_ = 0;

/**
 * Automatically position and reposition the bubble.
 * @private
 */
Blockly.Bubble.prototype.autoLayout_ = true;

/**
 * Create the bubble's DOM.
 * @param {!Element} content SVG content for the bubble.
 * @param {boolean} hasResize Add diagonal resize gripper if true.
 * @return {!Element} The bubble's SVG group.
 * @private
 */
Blockly.Bubble.prototype.createDom_ = function (content, hasResize) {
    /* Create the bubble.  Here's the markup that will be generated:
     <g>
     <g filter="url(#blocklyEmboss)">
     <path d="... Z" />
     <rect class="blocklyDraggable" rx="8" ry="8" width="180" height="180"/>
     </g>
     <g transform="translate(165, 165)" class="blocklyResizeSE">
     <polygon points="0,15 15,15 15,0"/>
     <line class="blocklyResizeLine" x1="5" y1="14" x2="14" y2="5"/>
     <line class="blocklyResizeLine" x1="10" y1="14" x2="14" y2="10"/>
     </g>
     [...content goes here...]
     </g>
     */
    this.bubbleGroup_ = Blockly.createSvgElement('g', {}, null);
    var bubbleEmboss = Blockly.createSvgElement('g',
        {'filter': 'url(#blocklyEmboss)'}, this.bubbleGroup_);
    this.bubbleArrow_ = Blockly.createSvgElement('path', {}, bubbleEmboss);
    this.bubbleBack_ = Blockly.createSvgElement('rect',
        {'class': 'blocklyDraggable', 'x': 0, 'y': 0,
            'rx': Blockly.Bubble.BORDER_WIDTH, 'ry': Blockly.Bubble.BORDER_WIDTH},
        bubbleEmboss);
    if (hasResize) {
        this.resizeGroup_ = Blockly.createSvgElement('g',
            {'class': Blockly.RTL ? 'blocklyResizeSW' : 'blocklyResizeSE'},
            this.bubbleGroup_);
        var resizeSize = 2 * Blockly.Bubble.BORDER_WIDTH;
        Blockly.createSvgElement('polygon',
            {'points': '0,x x,x x,0'.replace(/x/g, resizeSize.toString())},
            this.resizeGroup_);
        Blockly.createSvgElement('line',
            {'class': 'blocklyResizeLine',
                'x1': resizeSize / 3, 'y1': resizeSize - 1,
                'x2': resizeSize - 1, 'y2': resizeSize / 3}, this.resizeGroup_);
        Blockly.createSvgElement('line',
            {'class': 'blocklyResizeLine',
                'x1': resizeSize * 2 / 3, 'y1': resizeSize - 1,
                'x2': resizeSize - 1, 'y2': resizeSize * 2 / 3}, this.resizeGroup_);
    } else {
        this.resizeGroup_ = null;
    }
    this.bubbleGroup_.appendChild(content);
    return this.bubbleGroup_;
};

/**
 * Handle a mouse-down on bubble's border.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.Bubble.prototype.bubbleMouseDown_ = function (e) {
    this.promote_();
    Blockly.Bubble.unbindDragEvents_();
    if (Blockly.isRightButton(e)) {
        // Right-click.
        return;
    } else if (Blockly.isTargetInput_(e)) {
        // When focused on an HTML text input widget, don't trap any events.
        return;
    }
    // Left-click (or middle click)
    Blockly.setCursorHand_(true);
    // Record the starting offset between the current location and the mouse.
    if (Blockly.RTL) {
        this.dragDeltaX = this.relativeLeft_ + e.clientX;
    } else {
        this.dragDeltaX = this.relativeLeft_ - e.clientX;
    }
    this.dragDeltaY = this.relativeTop_ - e.clientY;

    Blockly.Bubble.onMouseUpWrapper_ = Blockly.bindEvent_(document,
        'mouseup', this, Blockly.Bubble.unbindDragEvents_);
    Blockly.Bubble.onMouseMoveWrapper_ = Blockly.bindEvent_(document,
        'mousemove', this, this.bubbleMouseMove_);
    Blockly.hideChaff();
    // This event has been handled.  No need to bubble up to the document.
    e.stopPropagation();
};

/**
 * Drag this bubble to follow the mouse.
 * @param {!Event} e Mouse move event.
 * @private
 */
Blockly.Bubble.prototype.bubbleMouseMove_ = function (e) {
    this.autoLayout_ = false;
    if (Blockly.RTL) {
        this.relativeLeft_ = this.dragDeltaX - e.clientX;
    } else {
        this.relativeLeft_ = this.dragDeltaX + e.clientX;
    }
    this.relativeTop_ = this.dragDeltaY + e.clientY;
    this.positionBubble_();
    this.renderArrow_();
};

/**
 * Handle a mouse-down on bubble's resize corner.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.Bubble.prototype.resizeMouseDown_ = function (e) {
    this.promote_();
    Blockly.Bubble.unbindDragEvents_();
    if (Blockly.isRightButton(e)) {
        // Right-click.
        return;
    }
    // Left-click (or middle click)
    Blockly.setCursorHand_(true);
    // Record the starting offset between the current location and the mouse.
    if (Blockly.RTL) {
        this.resizeDeltaWidth = this.width_ + e.clientX;
    } else {
        this.resizeDeltaWidth = this.width_ - e.clientX;
    }
    this.resizeDeltaHeight = this.height_ - e.clientY;

    Blockly.Bubble.onMouseUpWrapper_ = Blockly.bindEvent_(document,
        'mouseup', this, Blockly.Bubble.unbindDragEvents_);
    Blockly.Bubble.onMouseMoveWrapper_ = Blockly.bindEvent_(document,
        'mousemove', this, this.resizeMouseMove_);
    Blockly.hideChaff();
    // This event has been handled.  No need to bubble up to the document.
    e.stopPropagation();
};

/**
 * Resize this bubble to follow the mouse.
 * @param {!Event} e Mouse move event.
 * @private
 */
Blockly.Bubble.prototype.resizeMouseMove_ = function (e) {
    this.autoLayout_ = false;
    var w = this.resizeDeltaWidth;
    var h = this.resizeDeltaHeight + e.clientY;
    if (Blockly.RTL) {
        // RTL drags the bottom-left corner.
        w -= e.clientX;
    } else {
        // LTR drags the bottom-right corner.
        w += e.clientX;
    }
    this.setBubbleSize(w, h);
    if (Blockly.RTL) {
        // RTL requires the bubble to move its left edge.
        this.positionBubble_();
    }
};

/**
 * Register a function as a callback event for when the bubble is resized.
 * @param {Object} thisObject The value of 'this' in the callback.
 * @param {!Function} callback The function to call on resize.
 */
Blockly.Bubble.prototype.registerResizeEvent = function (thisObject, callback) {
    Blockly.bindEvent_(this.bubbleGroup_, 'resize', thisObject, callback);
};

/**
 * Move this bubble to the top of the stack.
 * @private
 */
Blockly.Bubble.prototype.promote_ = function () {
    var svgGroup = this.bubbleGroup_.parentNode;
    svgGroup.appendChild(this.bubbleGroup_);
};

/**
 * Notification that the anchor has moved.
 * Update the arrow and bubble accordingly.
 * @param {number} x Absolute horizontal location.
 * @param {number} y Absolute vertical location.
 */
Blockly.Bubble.prototype.setAnchorLocation = function (x, y) {
    this.anchorX_ = x;
    this.anchorY_ = y;
    if (this.rendered_) {
        this.positionBubble_();
    }
};

/**
 * Position the bubble so that it does not fall offscreen.
 * @private
 */
Blockly.Bubble.prototype.layoutBubble_ = function () {
    // Compute the preferred bubble location.
    var relativeLeft = -this.width_ / 4;
    var relativeTop = -this.height_ - Blockly.BlockSvg.MIN_BLOCK_Y;
    // Prevent the bubble from being offscreen.
    var metrics = this.workspace_.getMetrics();
    if (Blockly.RTL) {
        if (this.anchorX_ - metrics.viewLeft - relativeLeft - this.width_ <
            Blockly.Scrollbar.scrollbarThickness) {
            // Slide the bubble right until it is onscreen.
            relativeLeft = this.anchorX_ - metrics.viewLeft - this.width_ -
                Blockly.Scrollbar.scrollbarThickness;
        } else if (this.anchorX_ - metrics.viewLeft - relativeLeft >
            metrics.viewWidth) {
            // Slide the bubble left until it is onscreen.
            relativeLeft = this.anchorX_ - metrics.viewLeft - metrics.viewWidth;
        }
    } else {
        if (this.anchorX_ + relativeLeft < metrics.viewLeft) {
            // Slide the bubble right until it is onscreen.
            relativeLeft = metrics.viewLeft - this.anchorX_;
        } else if (metrics.viewLeft + metrics.viewWidth <
            this.anchorX_ + relativeLeft + this.width_ +
            Blockly.BlockSvg.SEP_SPACE_X +
            Blockly.Scrollbar.scrollbarThickness) {
            // Slide the bubble left until it is onscreen.
            relativeLeft = metrics.viewLeft + metrics.viewWidth - this.anchorX_ -
                this.width_ - Blockly.Scrollbar.scrollbarThickness;
        }
    }
    if (this.anchorY_ + relativeTop < metrics.viewTop) {
        // Slide the bubble below the block.
        var bBox = /** @type {SVGLocatable} */ (this.shape_).getBBox();
        relativeTop = bBox.height;
    }
    this.relativeLeft_ = relativeLeft;
    this.relativeTop_ = relativeTop;
};

/**
 * Move the bubble to a location relative to the anchor's centre.
 * @private
 */
Blockly.Bubble.prototype.positionBubble_ = function () {
    var left;
    if (Blockly.RTL) {
        left = this.anchorX_ - this.relativeLeft_ - this.width_;
    } else {
        left = this.anchorX_ + this.relativeLeft_;
    }
    var top = this.relativeTop_ + this.anchorY_;
    this.bubbleGroup_.setAttribute('transform',
            'translate(' + left + ', ' + top + ')');
};

/**
 * Get the dimensions of this bubble.
 * @return {!Object} Object with width and height properties.
 */
Blockly.Bubble.prototype.getBubbleSize = function () {
    return {width: this.width_, height: this.height_};
};

/**
 * Size this bubble.
 * @param {number} width Width of the bubble.
 * @param {number} height Height of the bubble.
 */
Blockly.Bubble.prototype.setBubbleSize = function (width, height) {
    var doubleBorderWidth = 2 * Blockly.Bubble.BORDER_WIDTH;
    // Minimum size of a bubble.
    width = Math.max(width, doubleBorderWidth + 45);
    height = Math.max(height, doubleBorderWidth + Blockly.BlockSvg.FIELD_HEIGHT);
    this.width_ = width;
    this.height_ = height;
    this.bubbleBack_.setAttribute('width', width);
    this.bubbleBack_.setAttribute('height', height);
    if (this.resizeGroup_) {
        if (Blockly.RTL) {
            // Mirror the resize group.
            var resizeSize = 2 * Blockly.Bubble.BORDER_WIDTH;
            this.resizeGroup_.setAttribute('transform', 'translate(' +
                resizeSize + ', ' +
                (height - doubleBorderWidth) + ') scale(-1 1)');
        } else {
            this.resizeGroup_.setAttribute('transform', 'translate(' +
                (width - doubleBorderWidth) + ', ' +
                (height - doubleBorderWidth) + ')');
        }
    }
    if (this.rendered_) {
        if (this.autoLayout_) {
            this.layoutBubble_();
        }
        this.positionBubble_();
        this.renderArrow_();
    }
    // Fire an event to allow the contents to resize.
    Blockly.fireUiEvent(this.bubbleGroup_, 'resize');
};

/**
 * Draw the arrow between the bubble and the origin.
 * @private
 */
Blockly.Bubble.prototype.renderArrow_ = function () {
    var steps = [];
    // Find the relative coordinates of the center of the bubble.
    var relBubbleX = this.width_ / 2;
    var relBubbleY = this.height_ / 2;
    // Find the relative coordinates of the center of the anchor.
    var relAnchorX = -this.relativeLeft_;
    var relAnchorY = -this.relativeTop_;
    if (relBubbleX == relAnchorX && relBubbleY == relAnchorY) {
        // Null case.  Bubble is directly on top of the anchor.
        // Short circuit this rather than wade through divide by zeros.
        steps.push('M ' + relBubbleX + ',' + relBubbleY);
    } else {
        // Compute the angle of the arrow's line.
        var rise = relAnchorY - relBubbleY;
        var run = relAnchorX - relBubbleX;
        if (Blockly.RTL) {
            run *= -1;
        }
        var hypotenuse = Math.sqrt(rise * rise + run * run);
        var angle = Math.acos(run / hypotenuse);
        if (rise < 0) {
            angle = 2 * Math.PI - angle;
        }
        // Compute a line perpendicular to the arrow.
        var rightAngle = angle + Math.PI / 2;
        if (rightAngle > Math.PI * 2) {
            rightAngle -= Math.PI * 2;
        }
        var rightRise = Math.sin(rightAngle);
        var rightRun = Math.cos(rightAngle);

        // Calculate the thickness of the base of the arrow.
        var bubbleSize = this.getBubbleSize();
        var thickness = (bubbleSize.width + bubbleSize.height) /
            Blockly.Bubble.ARROW_THICKNESS;
        thickness = Math.min(thickness, bubbleSize.width, bubbleSize.height) / 2;

        // Back the tip of the arrow off of the anchor.
        var backoffRatio = 1 - Blockly.Bubble.ANCHOR_RADIUS / hypotenuse;
        relAnchorX = relBubbleX + backoffRatio * run;
        relAnchorY = relBubbleY + backoffRatio * rise;

        // Coordinates for the base of the arrow.
        var baseX1 = relBubbleX + thickness * rightRun;
        var baseY1 = relBubbleY + thickness * rightRise;
        var baseX2 = relBubbleX - thickness * rightRun;
        var baseY2 = relBubbleY - thickness * rightRise;

        // Distortion to curve the arrow.
        var swirlAngle = angle + this.arrow_radians_;
        if (swirlAngle > Math.PI * 2) {
            swirlAngle -= Math.PI * 2;
        }
        var swirlRise = Math.sin(swirlAngle) *
            hypotenuse / Blockly.Bubble.ARROW_BEND;
        var swirlRun = Math.cos(swirlAngle) *
            hypotenuse / Blockly.Bubble.ARROW_BEND;

        steps.push('M' + baseX1 + ',' + baseY1);
        steps.push('C' + (baseX1 + swirlRun) + ',' + (baseY1 + swirlRise) +
            ' ' + relAnchorX + ',' + relAnchorY +
            ' ' + relAnchorX + ',' + relAnchorY);
        steps.push('C' + relAnchorX + ',' + relAnchorY +
            ' ' + (baseX2 + swirlRun) + ',' + (baseY2 + swirlRise) +
            ' ' + baseX2 + ',' + baseY2);
    }
    steps.push('z');
    this.bubbleArrow_.setAttribute('d', steps.join(' '));
};

/**
 * Change the colour of a bubble.
 * @param {string} hexColour Hex code of colour.
 */
Blockly.Bubble.prototype.setColour = function (hexColour) {
    this.bubbleBack_.setAttribute('fill', hexColour);
    this.bubbleArrow_.setAttribute('fill', hexColour);
};

/**
 * Dispose of this bubble.
 */
Blockly.Bubble.prototype.dispose = function () {
    Blockly.Bubble.unbindDragEvents_();
    // Dispose of and unlink the bubble.
    domConstruct.destroy(this.bubbleGroup_);
    this.bubbleGroup_ = null;
    this.workspace_ = null;
    this.content_ = null;
    this.shape_ = null;
};

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
 * @fileoverview Object representing a code comment.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * Class for a comment.
 * @param {!Blockly.Block} block The block associated with this comment.
 * @extends {Blockly.Icon}
 * @constructor
 */
Blockly.Comment = function (block) {
    Blockly.Comment.superClass_.constructor.call(this, block);
    this.createIcon_();
};
Blockly.inherits(Blockly.Comment, Blockly.Icon);

/**
 * Comment text (if bubble is not visible).
 * @private
 */
Blockly.Comment.prototype.text_ = '';

/**
 * Width of bubble.
 * @private
 */
Blockly.Comment.prototype.width_ = 160;

/**
 * Height of bubble.
 * @private
 */
Blockly.Comment.prototype.height_ = 80;

/**
 * Create the icon on the block.
 * @private
 */
Blockly.Comment.prototype.createIcon_ = function () {
    Blockly.Icon.prototype.createIcon_.call(this);
    /* Here's the markup that will be generated:
     <circle class="blocklyIconShield" r="8" cx="8" cy="8"/>
     <text class="blocklyIconMark" x="8" y="13">?</text>
     */
    var iconShield = Blockly.createSvgElement('circle',
        {'class': 'blocklyIconShield',
            'r': Blockly.Icon.RADIUS,
            'cx': Blockly.Icon.RADIUS,
            'cy': Blockly.Icon.RADIUS}, this.iconGroup_);
    this.iconMark_ = Blockly.createSvgElement('text',
        {'class': 'blocklyIconMark',
            'x': Blockly.Icon.RADIUS,
            'y': 2 * Blockly.Icon.RADIUS - 3}, this.iconGroup_);
    this.iconMark_.appendChild(document.createTextNode('?'));
};

/**
 * Create the editor for the comment's bubble.
 * @return {!Element} The top-level node of the editor.
 * @private
 */
Blockly.Comment.prototype.createEditor_ = function () {
    /* Create the editor.  Here's the markup that will be generated:
     <foreignObject x="8" y="8" width="164" height="164">
     <body xmlns="http://www.w3.org/1999/xhtml" class="blocklyMinimalBody">
     <textarea xmlns="http://www.w3.org/1999/xhtml"
     class="blocklyCommentTextarea"
     style="height: 164px; width: 164px;"></textarea>
     </body>
     </foreignObject>
     */
    this.foreignObject_ = Blockly.createSvgElement('foreignObject',
        {'x': Blockly.Bubble.BORDER_WIDTH, 'y': Blockly.Bubble.BORDER_WIDTH},
        null);
    var body = document.createElementNS(Blockly.HTML_NS, 'body');
    body.setAttribute('xmlns', Blockly.HTML_NS);
    body.className = 'blocklyMinimalBody';
    this.textarea_ = document.createElementNS(Blockly.HTML_NS, 'textarea');
    this.textarea_.className = 'blocklyCommentTextarea';
    this.textarea_.setAttribute('dir', Blockly.RTL ? 'RTL' : 'LTR');
    this.updateEditable();
    body.appendChild(this.textarea_);
    this.foreignObject_.appendChild(body);
    Blockly.bindEvent_(this.textarea_, 'mouseup', this, this.textareaFocus_);
    return this.foreignObject_;
};

/**
 * Add or remove editability of the textarea.
 * @override
 */
Blockly.Comment.prototype.updateEditable = function () {
    if (this.textarea_) {
        if (!this.block_.isEditable()) {
            this.textarea_.setAttribute('disabled', 'disabled');
            this.textarea_.setAttribute('readonly', 'readonly');
        } else {
            this.textarea_.removeAttribute('disabled');
            this.textarea_.removeAttribute('readonly');
        }
    }
    // Allow the icon to update.
    Blockly.Icon.prototype.updateEditable.call(this);
};

/**
 * Callback function triggered when the bubble has resized.
 * Resize the text area accordingly.
 * @private
 */
Blockly.Comment.prototype.resizeBubble_ = function () {
    var size = this.bubble_.getBubbleSize();
    var doubleBorderWidth = 2 * Blockly.Bubble.BORDER_WIDTH;
    this.foreignObject_.setAttribute('width', size.width - doubleBorderWidth);
    this.foreignObject_.setAttribute('height', size.height - doubleBorderWidth);
    this.textarea_.style.width = (size.width - doubleBorderWidth - 4) + 'px';
    this.textarea_.style.height = (size.height - doubleBorderWidth - 4) + 'px';
};

/**
 * Show or hide the comment bubble.
 * @param {boolean} visible True if the bubble should be visible.
 */
Blockly.Comment.prototype.setVisible = function (visible) {
    if (visible == this.isVisible()) {
        // No change.
        return;
    }
    // Save the bubble stats before the visibility switch.
    var text = this.getText();
    var size = this.getBubbleSize();
    if (visible) {
        // Create the bubble.
        this.bubble_ = new Blockly.Bubble(
            /** @type {!Blockly.Workspace} */ (this.block_.workspace),
            this.createEditor_(), this.block_.svg_.svgGroup_,
            this.iconX_, this.iconY_,
            this.width_, this.height_);
        this.bubble_.registerResizeEvent(this, this.resizeBubble_);
        this.updateColour();
        this.text_ = null;
    } else {
        // Dispose of the bubble.
        this.bubble_.dispose();
        this.bubble_ = null;
        this.textarea_ = null;
        this.foreignObject_ = null;
    }
    // Restore the bubble stats after the visibility switch.
    this.setText(text);
    this.setBubbleSize(size.width, size.height);
};

/**
 * Bring the comment to the top of the stack when clicked on.
 * @param {!Event} e Mouse up event.
 * @private
 */
Blockly.Comment.prototype.textareaFocus_ = function (e) {
    // Ideally this would be hooked to the focus event for the comment.
    // However doing so in Firefox swallows the cursor for unknown reasons.
    // So this is hooked to mouseup instead.  No big deal.
    this.bubble_.promote_();
    // Since the act of moving this node within the DOM causes a loss of focus,
    // we need to reapply the focus.
    this.textarea_.focus();
};

/**
 * Get the dimensions of this comment's bubble.
 * @return {!Object} Object with width and height properties.
 */
Blockly.Comment.prototype.getBubbleSize = function () {
    if (this.isVisible()) {
        return this.bubble_.getBubbleSize();
    } else {
        return {width: this.width_, height: this.height_};
    }
};

/**
 * Size this comment's bubble.
 * @param {number} width Width of the bubble.
 * @param {number} height Height of the bubble.
 */
Blockly.Comment.prototype.setBubbleSize = function (width, height) {
    if (this.isVisible()) {
        this.bubble_.setBubbleSize(width, height);
    } else {
        this.width_ = width;
        this.height_ = height;
    }
};

/**
 * Returns this comment's text.
 * @return {string} Comment text.
 */
Blockly.Comment.prototype.getText = function () {
    return this.isVisible() ? this.textarea_.value : this.text_;
};

/**
 * Set this comment's text.
 * @param {string} text Comment text.
 */
Blockly.Comment.prototype.setText = function (text) {
    if (this.isVisible()) {
        this.textarea_.value = text;
    } else {
        this.text_ = text;
    }
};

/**
 * Dispose of this comment.
 */
Blockly.Comment.prototype.dispose = function () {
    this.block_.comment = null;
    Blockly.Icon.prototype.dispose.call(this);
};

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
 * @fileoverview Components for creating connections between blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * Class for a connection between blocks.
 * @param {!Blockly.Block} source The block establishing this connection.
 * @param {number} type The type of the connection.
 * @constructor
 */
Blockly.Connection = function (source, type) {
    this.sourceBlock_ = source;
    this.targetConnection = null;
    this.type = type;
    this.x_ = 0;
    this.y_ = 0;
    this.inDB_ = false;
    // Shortcut for the databases for this connection's workspace.
    this.dbList_ = this.sourceBlock_.workspace.connectionDBList;
};

/**
 * Sever all links to this connection (not including from the source object).
 */
Blockly.Connection.prototype.dispose = function () {
    if (this.targetConnection) {
        throw 'Disconnect connection before disposing of it.';
    }
    if (this.inDB_) {
        this.dbList_[this.type].removeConnection_(this);
    }
    this.inDB_ = false;
    if (Blockly.highlightedConnection_ == this) {
        Blockly.highlightedConnection_ = null;
    }
    if (Blockly.localConnection_ == this) {
        Blockly.localConnection_ = null;
    }
};

/**
 * Does the connection belong to a superior block (higher in the source stack)?
 * @return {boolean} True if connection faces down or right.
 */
Blockly.Connection.prototype.isSuperior = function () {
    return this.type == Blockly.INPUT_VALUE ||
        this.type == Blockly.NEXT_STATEMENT;
};

/**
 * Connect this connection to another connection.
 * @param {!Blockly.Connection} otherConnection Connection to connect to.
 */
Blockly.Connection.prototype.connect = function (otherConnection) {
    if (this.sourceBlock_ == otherConnection.sourceBlock_) {
        throw 'Attempted to connect a block to itself.';
    }
    if (this.sourceBlock_.workspace !== otherConnection.sourceBlock_.workspace) {
        throw 'Blocks are on different workspaces.';
    }
    if (Blockly.OPPOSITE_TYPE[this.type] != otherConnection.type) {
        throw 'Attempt to connect incompatible types.';
    }
    if (this.type == Blockly.INPUT_VALUE || this.type == Blockly.OUTPUT_VALUE) {
        if (this.targetConnection) {
            // Can't make a value connection if male block is already connected.
            throw 'Source connection already connected (value).';
        } else if (otherConnection.targetConnection) {
            // If female block is already connected, disconnect and bump the male.
            var orphanBlock = otherConnection.targetBlock();
            orphanBlock.setParent(null);
            if (!orphanBlock.outputConnection) {
                throw 'Orphan block does not have an output connection.';
            }
            // Attempt to reattach the orphan at the end of the newly inserted
            // block.  Since this block may be a row, walk down to the end.
            var newBlock = this.sourceBlock_;
            var connection;
            while (connection =
                Blockly.Connection.singleConnection_(
                    /** @type {!Blockly.Block} */ (newBlock), orphanBlock)) {
                // '=' is intentional in line above.
                if (connection.targetBlock()) {
                    newBlock = connection.targetBlock();
                } else {
                    connection.connect(orphanBlock.outputConnection);
                    orphanBlock = null;
                    break;
                }
            }
            if (orphanBlock) {
                // Unable to reattach orphan.  Bump it off to the side.
                window.setTimeout(function () {
                    orphanBlock.outputConnection.bumpAwayFrom_(otherConnection);
                }, Blockly.BUMP_DELAY);
            }
        }
    } else {
        if (this.targetConnection) {
            throw 'Source connection already connected (block).';
        } else if (otherConnection.targetConnection) {
            // Statement blocks may be inserted into the middle of a stack.
            if (this.type != Blockly.PREVIOUS_STATEMENT) {
                throw 'Can only do a mid-stack connection with the top of a block.';
            }
            // Split the stack.
            var orphanBlock = otherConnection.targetBlock();
            orphanBlock.setParent(null);
            if (!orphanBlock.previousConnection) {
                throw 'Orphan block does not have a previous connection.';
            }
            // Attempt to reattach the orphan at the bottom of the newly inserted
            // block.  Since this block may be a stack, walk down to the end.
            var newBlock = this.sourceBlock_;
            while (newBlock.nextConnection) {
                if (newBlock.nextConnection.targetConnection) {
                    newBlock = newBlock.nextConnection.targetBlock();
                } else {
                    newBlock.nextConnection.connect(orphanBlock.previousConnection);
                    orphanBlock = null;
                    break;
                }
            }
            if (orphanBlock) {
                // Unable to reattach orphan.  Bump it off to the side.
                window.setTimeout(function () {
                    orphanBlock.previousConnection.bumpAwayFrom_(otherConnection);
                }, Blockly.BUMP_DELAY);
            }
        }
    }

    // Determine which block is superior (higher in the source stack).
    var parentBlock, childBlock;
    if (this.isSuperior()) {
        // Superior block.
        parentBlock = this.sourceBlock_;
        childBlock = otherConnection.sourceBlock_;
    } else {
        // Inferior block.
        parentBlock = otherConnection.sourceBlock_;
        childBlock = this.sourceBlock_;
    }

    // Establish the connections.
    this.targetConnection = otherConnection;
    otherConnection.targetConnection = this;

    // Demote the inferior block so that one is a child of the superior one.
    childBlock.setParent(parentBlock);

    if (parentBlock.rendered) {
        parentBlock.svg_.updateDisabled();
    }
    if (childBlock.rendered) {
        childBlock.svg_.updateDisabled();
    }
    if (parentBlock.rendered && childBlock.rendered) {
        if (this.type == Blockly.NEXT_STATEMENT ||
            this.type == Blockly.PREVIOUS_STATEMENT) {
            // Child block may need to square off its corners if it is in a stack.
            // Rendering a child will render its parent.
            childBlock.render();
        } else {
            // Child block does not change shape.  Rendering the parent node will
            // move its connected children into position.
            parentBlock.render();
        }
    }
};

/**
 * Does the given block have one and only one connection point that will accept
 * the orphaned block?
 * @param {!Blockly.Block} block The superior block.
 * @param {!Blockly.Block} orphanBlock The inferior block.
 * @return {Blockly.Connection} The suitable connection point on 'block',
 *     or null.
 * @private
 */
Blockly.Connection.singleConnection_ = function (block, orphanBlock) {
    var connection = false;
    for (var x = 0; x < block.inputList.length; x++) {
        var thisConnection = block.inputList[x].connection;
        if (thisConnection && thisConnection.type == Blockly.INPUT_VALUE &&
            orphanBlock.outputConnection.checkType_(thisConnection)) {
            if (connection) {
                return null;  // More than one connection.
            }
            connection = thisConnection;
        }
    }
    return connection;
};

/**
 * Disconnect this connection.
 */
Blockly.Connection.prototype.disconnect = function () {
    var otherConnection = this.targetConnection;
    if (!otherConnection) {
        throw 'Source connection not connected.';
    } else if (otherConnection.targetConnection != this) {
        throw 'Target connection not connected to source connection.';
    }
    otherConnection.targetConnection = null;
    this.targetConnection = null;

    // Rerender the parent so that it may reflow.
    var parentBlock, childBlock;
    if (this.isSuperior()) {
        // Superior block.
        parentBlock = this.sourceBlock_;
        childBlock = otherConnection.sourceBlock_;
    } else {
        // Inferior block.
        parentBlock = otherConnection.sourceBlock_;
        childBlock = this.sourceBlock_;
    }
    if (parentBlock.rendered) {
        parentBlock.render();
    }
    if (childBlock.rendered) {
        childBlock.svg_.updateDisabled();
        childBlock.render();
    }
};

/**
 * Returns the block that this connection connects to.
 * @return {Blockly.Block} The connected block or null if none is connected.
 */
Blockly.Connection.prototype.targetBlock = function () {
    if (this.targetConnection) {
        return this.targetConnection.sourceBlock_;
    }
    return null;
};

/**
 * Move the block(s) belonging to the connection to a point where they don't
 * visually interfere with the specified connection.
 * @param {!Blockly.Connection} staticConnection The connection to move away
 *     from.
 * @private
 */
Blockly.Connection.prototype.bumpAwayFrom_ = function (staticConnection) {
    if (Blockly.Block.dragMode_ != 0) {
        // Don't move blocks around while the user is doing the same.
        return;
    }
    // Move the root block.
    var rootBlock = this.sourceBlock_.getRootBlock();
    if (rootBlock.isInFlyout) {
        // Don't move blocks around in a flyout.
        return;
    }
    var reverse = false;
    if (!rootBlock.isMovable()) {
        // Can't bump an uneditable block away.
        // Check to see if the other block is movable.
        rootBlock = staticConnection.sourceBlock_.getRootBlock();
        if (!rootBlock.isMovable()) {
            return;
        }
        // Swap the connections and move the 'static' connection instead.
        staticConnection = this;
        reverse = true;
    }
    // Raise it to the top for extra visibility.
    rootBlock.getSvgRoot().parentNode.appendChild(rootBlock.getSvgRoot());
    var dx = (staticConnection.x_ + Blockly.SNAP_RADIUS) - this.x_;
    var dy = (staticConnection.y_ + Blockly.SNAP_RADIUS) - this.y_;
    if (reverse) {
        // When reversing a bump due to an uneditable block, bump up.
        dy = -dy;
    }
    if (Blockly.RTL) {
        dx = -dx;
    }
    rootBlock.moveBy(dx, dy);
};

/**
 * Change the connection's coordinates.
 * @param {number} x New absolute x coordinate.
 * @param {number} y New absolute y coordinate.
 */
Blockly.Connection.prototype.moveTo = function (x, y) {
    // Remove it from its old location in the database (if already present)
    if (this.inDB_) {
        this.dbList_[this.type].removeConnection_(this);
    }
    this.x_ = x;
    this.y_ = y;
    // Insert it into its new location in the database.
    this.dbList_[this.type].addConnection_(this);
};

/**
 * Change the connection's coordinates.
 * @param {number} dx Change to x coordinate.
 * @param {number} dy Change to y coordinate.
 */
Blockly.Connection.prototype.moveBy = function (dx, dy) {
    this.moveTo(this.x_ + dx, this.y_ + dy);
};

/**
 * Add highlighting around this connection.
 */
Blockly.Connection.prototype.highlight = function () {
    var steps;
    if (this.type == Blockly.INPUT_VALUE || this.type == Blockly.OUTPUT_VALUE) {
        var tabWidth = Blockly.RTL ? -Blockly.BlockSvg.TAB_WIDTH :
            Blockly.BlockSvg.TAB_WIDTH;
        steps = 'm 0,0 v 5 c 0,10 ' + -tabWidth + ',-8 ' + -tabWidth + ',7.5 s ' +
            tabWidth + ',-2.5 ' + tabWidth + ',7.5 v 5';
    } else {
        if (Blockly.RTL) {
            steps = 'm 20,0 h -5 l -6,4 -3,0 -6,-4 h -5';
        } else {
            steps = 'm -20,0 h 5 l 6,4 3,0 6,-4 h 5';
        }
    }
    var xy = this.sourceBlock_.getRelativeToSurfaceXY();
    var x = this.x_ - xy.x;
    var y = this.y_ - xy.y;
    Blockly.Connection.highlightedPath_ = Blockly.createSvgElement('path',
        {'class': 'blocklyHighlightedConnectionPath',
            'd': steps,
            transform: 'translate(' + x + ', ' + y + ')'},
        this.sourceBlock_.getSvgRoot());
};

/**
 * Remove the highlighting around this connection.
 */
Blockly.Connection.prototype.unhighlight = function () {
    domConstruct.destroy(Blockly.Connection.highlightedPath_);
    delete Blockly.Connection.highlightedPath_;
};

/**
 * Move the blocks on either side of this connection right next to each other.
 * @private
 */
Blockly.Connection.prototype.tighten_ = function () {
    var dx = Math.round(this.targetConnection.x_ - this.x_);
    var dy = Math.round(this.targetConnection.y_ - this.y_);
    if (dx != 0 || dy != 0) {
        var block = this.targetBlock();
        var svgRoot = block.getSvgRoot();
        if (!svgRoot) {
            throw 'block is not rendered.';
        }
        var xy = Blockly.getRelativeXY_(svgRoot);
        block.getSvgRoot().setAttribute('transform',
                'translate(' + (xy.x - dx) + ', ' + (xy.y - dy) + ')');
        block.moveConnections_(-dx, -dy);
    }
};

/**
 * Find the closest compatible connection to this connection.
 * @param {number} maxLimit The maximum radius to another connection.
 * @param {number} dx Horizontal offset between this connection's location
 *     in the database and the current location (as a result of dragging).
 * @param {number} dy Vertical offset between this connection's location
 *     in the database and the current location (as a result of dragging).
 * @return {!Object} Contains two properties: 'connection' which is either
 *     another connection or null, and 'radius' which is the distance.
 */
Blockly.Connection.prototype.closest = function (maxLimit, dx, dy) {
    if (this.targetConnection) {
        // Don't offer to connect to a connection that's already connected.
        return {connection: null, radius: maxLimit};
    }
    // Determine the opposite type of connection.
    var oppositeType = Blockly.OPPOSITE_TYPE[this.type];
    var db = this.dbList_[oppositeType];

    // Since this connection is probably being dragged, add the delta.
    var currentX = this.x_ + dx;
    var currentY = this.y_ + dy;

    // Binary search to find the closest y location.
    var pointerMin = 0;
    var pointerMax = db.length - 2;
    var pointerMid = pointerMax;
    while (pointerMin < pointerMid) {
        if (db[pointerMid].y_ < currentY) {
            pointerMin = pointerMid;
        } else {
            pointerMax = pointerMid;
        }
        pointerMid = Math.floor((pointerMin + pointerMax) / 2);
    }

    // Walk forward and back on the y axis looking for the closest x,y point.
    pointerMin = pointerMid;
    pointerMax = pointerMid;
    var closestConnection = null;
    var sourceBlock = this.sourceBlock_;
    var thisConnection = this;
    if (db.length) {
        while (pointerMin >= 0 && checkConnection_(pointerMin)) {
            pointerMin--;
        }
        do {
            pointerMax++;
        } while (pointerMax < db.length && checkConnection_(pointerMax));
    }

    /**
     * Computes if the current connection is within the allowed radius of another
     * connection.
     * This function is a closure and has access to outside variables.
     * @param {number} yIndex The other connection's index in the database.
     * @return {boolean} True if the search needs to continue: either the current
     *     connection's vertical distance from the other connection is less than
     *     the allowed radius, or if the connection is not compatible.
     */
    function checkConnection_(yIndex) {
        var connection = db[yIndex];
        if (connection.type == Blockly.OUTPUT_VALUE ||
            connection.type == Blockly.PREVIOUS_STATEMENT) {
            // Don't offer to connect an already connected left (male) value plug to
            // an available right (female) value plug.  Don't offer to connect the
            // bottom of a statement block to one that's already connected.
            if (connection.targetConnection) {
                return true;
            }
        }
        // Offering to connect the top of a statement block to an already connected
        // connection is ok, we'll just insert it into the stack.

        // Offering to connect the left (male) of a value block to an already
        // connected value pair is ok, we'll splice it in.
        // However, don't offer to splice into an unmovable block.
        if (connection.type == Blockly.INPUT_VALUE &&
            connection.targetConnection && !connection.targetBlock().isMovable()) {
            return true;
        }

        // Do type checking.
        if (!thisConnection.checkType_(connection)) {
            return true;
        }

        // Don't let blocks try to connect to themselves or ones they nest.
        var targetSourceBlock = connection.sourceBlock_;
        do {
            if (sourceBlock == targetSourceBlock) {
                return true;
            }
            targetSourceBlock = targetSourceBlock.getParent();
        } while (targetSourceBlock);

        var dx = currentX - db[yIndex].x_;
        var dy = currentY - db[yIndex].y_;
        var r = Math.sqrt(dx * dx + dy * dy);
        if (r <= maxLimit) {
            closestConnection = db[yIndex];
            maxLimit = r;
        }
        return dy < maxLimit;
    }

    return {connection: closestConnection, radius: maxLimit};
};

/**
 * Is this connection compatible with another connection with respect to the
 * value type system.  E.g. square_root("Hello") is not compatible.
 * @param {!Blockly.Connection} otherConnection Connection to compare against.
 * @return {boolean} True if the connections share a type.
 * @private
 */
Blockly.Connection.prototype.checkType_ = function (otherConnection) {
    if (!this.check_ || !otherConnection.check_) {
        // One or both sides are promiscuous enough that anything will fit.
        console.log("checkType: promiscuous");
        return true;
    }
    // Find any intersection in the check lists.
    for (var x = 0; x < this.check_.length; x++) {
        if (otherConnection.check_.indexOf(this.check_[x]) != -1) {
            console.log("checkType: Yes");
            return true;
        }
    }
    // No intersection.
    console.log("checkType: Nope");
    return false;
};

/**
 * Change a connection's compatibility.
 * @param {*} check Compatible value type or list of value types.
 *     Null if all types are compatible.
 * @return {!Blockly.Connection} The connection being modified
 *     (to allow chaining).
 */
Blockly.Connection.prototype.setCheck = function (check) {
    if (check) {
        // Ensure that check is in an array.
        if (!(check instanceof Array)) {
            check = [check];
        }
        this.check_ = check;
        // The new value type may not be compatible with the existing connection.
        if (this.targetConnection && !this.checkType_(this.targetConnection)) {
            if (this.isSuperior()) {
                this.targetBlock().setParent(null);
            } else {
                this.sourceBlock_.setParent(null);
            }
            // Bump away.
            this.sourceBlock_.bumpNeighbours_();
        }
    } else {
        this.check_ = null;
    }
    return this;
};

/**
 * Find all nearby compatible connections to this connection.
 * Type checking does not apply, since this function is used for bumping.
 * @param {number} maxLimit The maximum radius to another connection.
 * @return {!Array.<Blockly.Connection>} List of connections.
 * @private
 */
Blockly.Connection.prototype.neighbours_ = function (maxLimit) {
    // Determine the opposite type of connection.
    var oppositeType = Blockly.OPPOSITE_TYPE[this.type];
    var db = this.dbList_[oppositeType];

    var currentX = this.x_;
    var currentY = this.y_;

    // Binary search to find the closest y location.
    var pointerMin = 0;
    var pointerMax = db.length - 2;
    var pointerMid = pointerMax;
    while (pointerMin < pointerMid) {
        if (db[pointerMid].y_ < currentY) {
            pointerMin = pointerMid;
        } else {
            pointerMax = pointerMid;
        }
        pointerMid = Math.floor((pointerMin + pointerMax) / 2);
    }

    // Walk forward and back on the y axis looking for the closest x,y point.
    pointerMin = pointerMid;
    pointerMax = pointerMid;
    var neighbours = [];
    var sourceBlock = this.sourceBlock_;
    if (db.length) {
        while (pointerMin >= 0 && checkConnection_(pointerMin)) {
            pointerMin--;
        }
        do {
            pointerMax++;
        } while (pointerMax < db.length && checkConnection_(pointerMax));
    }

    /**
     * Computes if the current connection is within the allowed radius of another
     * connection.
     * This function is a closure and has access to outside variables.
     * @param {number} yIndex The other connection's index in the database.
     * @return {boolean} True if the current connection's vertical distance from
     *     the other connection is less than the allowed radius.
     */
    function checkConnection_(yIndex) {
        var dx = currentX - db[yIndex].x_;
        var dy = currentY - db[yIndex].y_;
        var r = Math.sqrt(dx * dx + dy * dy);
        if (r <= maxLimit) {
            neighbours.push(db[yIndex]);
        }
        return dy < maxLimit;
    }

    return neighbours;
};

/**
 * Hide this connection, as well as all down-stream connections on any block
 * attached to this connection.  This happens when a block is collapsed.
 * Also hides down-stream comments.
 */
Blockly.Connection.prototype.hideAll = function () {
    if (this.inDB_) {
        this.dbList_[this.type].removeConnection_(this);
    }
    if (this.targetConnection) {
        var blocks = this.targetBlock().getDescendants();
        for (var b = 0; b < blocks.length; b++) {
            var block = blocks[b];
            // Hide all connections of all children.
            var connections = block.getConnections_(true);
            for (var c = 0; c < connections.length; c++) {
                var connection = connections[c];
                if (connection.inDB_) {
                    this.dbList_[connection.type].removeConnection_(connection);
                }
            }
            // Close all bubbles of all children.
            var icons = block.getIcons();
            for (var x = 0; x < icons.length; x++) {
                icons[x].setVisible(false);
            }
        }
    }
};

/**
 * Unhide this connection, as well as all down-stream connections on any block
 * attached to this connection.  This happens when a block is expanded.
 * Also unhides down-stream comments.
 * @return {!Array.<!Blockly.Block>} List of blocks to render.
 */
Blockly.Connection.prototype.unhideAll = function () {
    if (!this.inDB_) {
        this.dbList_[this.type].addConnection_(this);
    }
    // All blocks that need unhiding must be unhidden before any rendering takes
    // place, since rendering requires knowing the dimensions of lower blocks.
    // Also, since rendering a block renders all its parents, we only need to
    // render the leaf nodes.
    var renderList = [];
    if (this.type != Blockly.INPUT_VALUE && this.type != Blockly.NEXT_STATEMENT) {
        // Only spider down.
        return renderList;
    }
    var block = this.targetBlock();
    if (block) {
        var connections;
        if (block.isCollapsed()) {
            // This block should only be partially revealed since it is collapsed.
            connections = [];
            block.outputConnection && connections.push(block.outputConnection);
            block.nextConnection && connections.push(block.nextConnection);
            block.previousConnection && connections.push(block.previousConnection);
        } else {
            // Show all connections of this block.
            connections = block.getConnections_(true);
        }
        for (var c = 0; c < connections.length; c++) {
            renderList = renderList.concat(connections[c].unhideAll());
        }
        if (renderList.length == 0) {
            // Leaf block.
            renderList[0] = block;
        }
    }
    return renderList;
};


/**
 * Database of connections.
 * Connections are stored in order of their vertical component.  This way
 * connections in an area may be looked up quickly using a binary search.
 * @constructor
 */
Blockly.ConnectionDB = function () {
};

Blockly.ConnectionDB.prototype = new Array();
/**
 * Don't inherit the constructor from Array.
 * @type {!Function}
 */
Blockly.ConnectionDB.constructor = Blockly.ConnectionDB;

/**
 * Add a connection to the database.  Must not already exist in DB.
 * @param {!Blockly.Connection} connection The connection to be added.
 * @private
 */
Blockly.ConnectionDB.prototype.addConnection_ = function (connection) {
    if (connection.inDB_) {
        throw 'Connection already in database.';
    }
    // Insert connection using binary search.
    var pointerMin = 0;
    var pointerMax = this.length;
    while (pointerMin < pointerMax) {
        var pointerMid = Math.floor((pointerMin + pointerMax) / 2);
        if (this[pointerMid].y_ < connection.y_) {
            pointerMin = pointerMid + 1;
        } else if (this[pointerMid].y_ > connection.y_) {
            pointerMax = pointerMid;
        } else {
            pointerMin = pointerMid;
            break;
        }
    }
    this.splice(pointerMin, 0, connection);
    connection.inDB_ = true;
};

/**
 * Remove a connection from the database.  Must already exist in DB.
 * @param {!Blockly.Connection} connection The connection to be removed.
 * @private
 */
Blockly.ConnectionDB.prototype.removeConnection_ = function (connection) {
    if (!connection.inDB_) {
        throw 'Connection not in database.';
    }
    connection.inDB_ = false;
    // Find the connection using a binary search.
    var pointerMin = 0;
    var pointerMax = this.length - 2;
    var pointerMid = pointerMax;
    while (pointerMin < pointerMid) {
        if (this[pointerMid].y_ < connection.y_) {
            pointerMin = pointerMid;
        } else {
            pointerMax = pointerMid;
        }
        pointerMid = Math.floor((pointerMin + pointerMax) / 2);
    }

    // Walk forward and back on the y axis looking for the connection.
    // When found, splice it out of the array.
    pointerMin = pointerMid;
    pointerMax = pointerMid;
    while (pointerMin >= 0 && this[pointerMin].y_ == connection.y_) {
        if (this[pointerMin] == connection) {
            this.splice(pointerMin, 1);
            return;
        }
        pointerMin--;
    }
    do {
        if (this[pointerMax] == connection) {
            this.splice(pointerMax, 1);
            return;
        }
        pointerMax++;
    } while (pointerMax < this.length &&
        this[pointerMax].y_ == connection.y_);
    throw 'Unable to find connection in connectionDB.';
};

/**
 * Initialize a set of connection DBs for a specified workspace.
 * @param {!Blockly.Workspace} workspace The workspace this DB is for.
 */
Blockly.ConnectionDB.init = function (workspace) {
    // Create four databases, one for each connection type.
    var dbList = [];
    dbList[Blockly.INPUT_VALUE] = new Blockly.ConnectionDB();
    dbList[Blockly.OUTPUT_VALUE] = new Blockly.ConnectionDB();
    dbList[Blockly.NEXT_STATEMENT] = new Blockly.ConnectionDB();
    dbList[Blockly.PREVIOUS_STATEMENT] = new Blockly.ConnectionDB();
    workspace.connectionDBList = dbList;
};

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

/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2013 Google Inc.
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
 * @fileoverview Inject Blockly's CSS synchronously.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

Blockly.Css = {};

/**
 * Inject the CSS into the DOM.  This is preferable over using a regular CSS
 * file since:
 * a) It loads synchronously and doesn't force a redraw later.
 * b) It speeds up loading by not blocking on a separate HTTP transfer.
 * c) The CSS content may be made dynamic depending on init options.
 */
Blockly.Css.inject = function () {
    var text = Blockly.Css.CONTENT.join('\n');
    // Strip off any trailing slash (either Unix or Windows).
    var path = Blockly.pathToBlockly.replace(/[\\\/]$/, '');
    text = text.replace(/<<<PATH>>>/g, path);

    var cssNode = document.createElement('style');
    cssNode.type = 'text/css';
    var head = document.getElementsByTagName('head')[0];
    head.appendChild(cssNode);
    if (cssNode.styleSheet) {
        // IE.
        cssNode.styleSheet.cssText = text;
    } else {
        // W3C.
        var cssTextNode = document.createTextNode(text);
        cssNode.appendChild(cssTextNode);
    }
};

/**
 * Array making up the CSS content for Blockly.
 */
Blockly.Css.CONTENT = [
    '.blocklySvg {',
    '  background-color: #fff;',
    '  border: 1px solid #ddd;',
    '  overflow: hidden;', /* IE overflows by default. */
    '}',

    '.blocklyWidgetDiv {',
    '  position: absolute;',
    '  display: none;',
    '  z-index: 999;',
    '}',

    '.blocklyDraggable {',
    /*
     Hotspot coordinates are baked into the CUR file, but they are still
     required in the CSS due to a Chrome bug.
     http://code.google.com/p/chromium/issues/detail?id=1446
     */
    '  cursor: url(<<<PATH>>>/media/handopen.cur) 8 5, auto;',
    '}',

    '.blocklyResizeSE {',
    '  fill: #aaa;',
    '  cursor: se-resize;',
    '}',

    '.blocklyResizeSW {',
    '  fill: #aaa;',
    '  cursor: sw-resize;',
    '}',

    '.blocklyResizeLine {',
    '  stroke-width: 1;',
    '  stroke: #888;',
    '}',

    '.blocklyHighlightedConnectionPath {',
    '  stroke-width: 4px;',
    '  stroke: #fc3;',
    '  fill: none;',
    '}',

    '.blocklyPathLight {',
    '  fill: none;',
    '  stroke-width: 2;',
    '  stroke-linecap: round;',
    '}',

    '.blocklySelected>.blocklyPath {',
    '  stroke-width: 3px;',
    '  stroke: #fc3;',
    '}',

    '.blocklySelected>.blocklyPathLight {',
    '  display: none;',
    '}',

    '.blocklyDragging>.blocklyPath,',
    '.blocklyDragging>.blocklyPathLight {',
    '  fill-opacity: .8;',
    '  stroke-opacity: .8;',
    '}',

    '.blocklyDragging>.blocklyPathDark {',
    '  display: none;',
    '}',

    '.blocklyDisabled>.blocklyPath {',
    '  fill-opacity: .5;',
    '  stroke-opacity: .5;',
    '}',

    '.blocklyDisabled>.blocklyPathLight,',
    '.blocklyDisabled>.blocklyPathDark {',
    '  display: none;',
    '}',

    '.blocklyText {',
    '  cursor: default;',
    '  font-family: tahoma,arial,verdana,sans-serif;',
    '  font-size: 9pt;',
    '  fill: #fff;',
    '}',

    '.blocklyNonEditableText>text {',
    '  pointer-events: none;',
    '}',

    '.blocklyNonEditableText>rect,',
    '.blocklyEditableText>rect {',
    '  fill: #fff;',
    '  fill-opacity: .6;',
    '}',

    '.blocklyNonEditableText>text,',
    '.blocklyEditableText>text {',
    '  fill: #000;',
    '}',

    '.blocklyEditableText:hover>rect {',
    '  stroke-width: 2;',
    '  stroke: #fff;',
    '}',

    /*
     Don't allow users to select text.  It gets annoying when trying to
     drag a block and selected text moves instead.
     */
    '.blocklySvg text {',
    '  -moz-user-select: none;',
    '  -webkit-user-select: none;',
    '  user-select: none;',
    '  cursor: inherit;',
    '}',

    '.blocklyHidden {',
    '  display: none;',
    '}',

    '.blocklyFieldDropdown:not(.blocklyHidden) {',
    '  display: block;',
    '}',

    '.blocklyTooltipBackground {',
    '  fill: #ffffc7;',
    '  stroke-width: 1px;',
    '  stroke: #d8d8d8;',
    '}',

    '.blocklyTooltipShadow,',
    '.blocklyDropdownMenuShadow {',
    '  fill: #bbb;',
    '  filter: url(#blocklyShadowFilter);',
    '}',

    '.blocklyTooltipText {',
    '  font-family: sans-serif;',
    '  font-size: 9pt;',
    '  fill: #000;',
    '}',

    '.blocklyIconShield {',
    '  cursor: default;',
    '  fill: #00c;',
    '  stroke-width: 1px;',
    '  stroke: #ccc;',
    '}',

    '.blocklyIconGroup:hover>.blocklyIconShield {',
    '  fill: #00f;',
    '  stroke: #fff;',
    '}',

    '.blocklyIconGroup:hover>.blocklyIconMark {',
    '  fill: #fff;',
    '}',

    '.blocklyIconMark {',
    '  cursor: default !important;',
    '  font-family: sans-serif;',
    '  font-size: 9pt;',
    '  font-weight: bold;',
    '  fill: #ccc;',
    '  text-anchor: middle;',
    '}',

    '.blocklyWarningBody {',
    '}',

    '.blocklyMinimalBody {',
    '  margin: 0;',
    '  padding: 0;',
    '}',

    '.blocklyCommentTextarea {',
    '  margin: 0;',
    '  padding: 2px;',
    '  border: 0;',
    '  resize: none;',
    '  background-color: #ffc;',
    '}',

    '.blocklyHtmlInput {',
    '  font-family: sans-serif;',
    '  font-size: 11pt;',
    '  border: none;',
    '  outline: none;',
    '  width: 100%',
    '}',

    '.blocklyMutatorBackground {',
    '  fill: #fff;',
    '  stroke-width: 1;',
    '  stroke: #ddd;',
    '}',

    '.blocklyFlyoutBackground {',
    '  fill: #ddd;',
    '  fill-opacity: .8;',
    '}',

    '.blocklyColourBackground {',
    '  fill: #666;',
    '}',

    '.blocklyScrollbarBackground {',
    '  fill: #fff;',
    '  stroke-width: 1;',
    '  stroke: #e4e4e4;',
    '}',

    '.blocklyScrollbarKnob {',
    '  fill: #ccc;',
    '}',

    '.blocklyScrollbarBackground:hover+.blocklyScrollbarKnob,',
    '.blocklyScrollbarKnob:hover {',
    '  fill: #bbb;',
    '}',

    '.blocklyInvalidInput {',
    '  background: #faa;',
    '}',

    '.blocklyAngleCircle {',
    '  stroke: #444;',
    '  stroke-width: 1;',
    '  fill: #ddd;',
    '  fill-opacity: .8;',
    '}',

    '.blocklyAngleMarks {',
    '  stroke: #444;',
    '  stroke-width: 1;',
    '}',

    '.blocklyAngleGauge {',
    '  fill: #f88;',
    '  fill-opacity: .8;  ',
    '}',

    '.blocklyAngleLine {',
    '  stroke: #f00;',
    '  stroke-width: 2;',
    '  stroke-linecap: round;',
    '}',

    ''
];

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
 * @fileoverview Input field.  Used for editable titles, variables, etc.
 * This is an abstract class that defines the UI on the block.  Actual
 * instances would be Blockly.FieldTextInput, Blockly.FieldDropdown, etc.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * Class for an editable field.
 * @param {string} text The initial content of the field.
 * @constructor
 */
Blockly.Field = function (text) {
    this.sourceBlock_ = null;
    // Build the DOM.
    this.fieldGroup_ = Blockly.createSvgElement('g', {}, null);
    this.borderRect_ = Blockly.createSvgElement('rect',
        {'rx': 4,
            'ry': 4,
            'x': -Blockly.BlockSvg.SEP_SPACE_X / 2,
            'y': -12,
            'height': 16}, this.fieldGroup_);
    this.textElement_ = Blockly.createSvgElement('text',
        {'class': 'blocklyText'}, this.fieldGroup_);
    this.size_ = {height: 25, width: 0};
    this.setText(text);
    this.visible_ = true;
};

/**
 * Clone this Field.  This must be implemented by all classes derived from
 * Field.  Since this class should not be instantiated, calling this method
 * throws an exception.
 */
Blockly.Field.prototype.clone = function () {
    console.log('There should never be an instance of Field, ' +
        'only its derived classes.');
};

/**
 * Non-breaking space.
 */
Blockly.Field.NBSP = '\u00A0';

/**
 * Editable fields are saved by the XML renderer, non-editable fields are not.
 */
Blockly.Field.prototype.EDITABLE = true;

/**
 * Install this field on a block.
 * @param {!Blockly.Block} block The block containing this field.
 */
Blockly.Field.prototype.init = function (block) {
    if (this.sourceBlock_) {
        throw 'Field has already been initialized once.';
    }
    this.sourceBlock_ = block;
    this.updateEditable();
    block.getSvgRoot().appendChild(this.fieldGroup_);
    this.mouseUpWrapper_ =
        Blockly.bindEvent_(this.fieldGroup_, 'mouseup', this, this.onMouseUp_);
    // Bump to set the colours for dropdown arrows.
    this.setText(null);
};

/**
 * Dispose of all DOM objects belonging to this editable field.
 */
Blockly.Field.prototype.dispose = function () {
    if (this.mouseUpWrapper_) {
        Blockly.unbindEvent_(this.mouseUpWrapper_);
        this.mouseUpWrapper_ = null;
    }
    this.sourceBlock_ = null;
    domConstruct.destroy(this.fieldGroup_);
    this.fieldGroup_ = null;
    this.textElement_ = null;
    this.borderRect_ = null;
};

/**
 * Add or remove the UI indicating if this field is editable or not.
 */
Blockly.Field.prototype.updateEditable = function () {
    if (!this.EDITABLE) {
        return;
    }
    if (this.sourceBlock_.isEditable()) {
        Blockly.addClass_(/** @type {!Element} */ (this.fieldGroup_),
            'blocklyEditableText');
        Blockly.removeClass_(/** @type {!Element} */ (this.fieldGroup_),
            'blocklyNoNEditableText');
        this.fieldGroup_.style.cursor = this.CURSOR;
    } else {
        Blockly.addClass_(/** @type {!Element} */ (this.fieldGroup_),
            'blocklyNonEditableText');
        Blockly.removeClass_(/** @type {!Element} */ (this.fieldGroup_),
            'blocklyEditableText');
        this.fieldGroup_.style.cursor = '';
    }
};

/**
 * Gets whether this editable field is visible or not.
 * @return {boolean} True if visible.
 */
Blockly.Field.prototype.isVisible = function () {
    return this.visible_;
};

/**
 * Sets whether this editable field is visible or not.
 * @param {boolean} visible True if visible.
 */
Blockly.Field.prototype.setVisible = function (visible) {
    this.visible_ = visible;
    this.getRootElement().style.display = visible ? 'block' : 'none';
};

/**
 * Gets the group element for this editable field.
 * Used for measuring the size and for positioning.
 * @return {!Element} The group element.
 */
Blockly.Field.prototype.getRootElement = function () {
    return /** @type {!Element} */ (this.fieldGroup_);
};

/**
 * Draws the border with the correct width.
 * Saves the computed width in a property.
 * @private
 */
Blockly.Field.prototype.render_ = function () {
    var width = this.textElement_.getComputedTextLength();
    if (this.borderRect_) {
        this.borderRect_.setAttribute('width',
                width + Blockly.BlockSvg.SEP_SPACE_X);
    }
    this.size_.width = width;
};

/**
 * Returns the height and width of the field.
 * @return {!Object} Height and width.
 */
Blockly.Field.prototype.getSize = function () {
    if (!this.size_.width) {
        this.render_();
    }
    return this.size_;
};

/**
 * Get the text from this field.
 * @return {string} Current text.
 */
Blockly.Field.prototype.getText = function () {
    return this.text_;
};

/**
 * Set the text in this field.  Trigger a rerender of the source block.
 * @param {?string} text New text.
 */
Blockly.Field.prototype.setText = function (text) {
    if (text === null || text === this.text_) {
        // No change if null.
        return;
    }
    this.text_ = text;
    this.updateTextNode_();

    if (this.sourceBlock_ && this.sourceBlock_.rendered) {
        this.sourceBlock_.render();
        this.sourceBlock_.bumpNeighbours_();
        this.sourceBlock_.workspace.fireChangeEvent();
    }
};

/**
 * Update the text node of this field to display the current text.
 * @private
 */
Blockly.Field.prototype.updateTextNode_ = function () {
    var text = this.text_;
    // Empty the text element.
    Blockly.removeChildren(this.textElement_);
    // Replace whitespace with non-breaking spaces so the text doesn't collapse.
    text = text.replace(/\s/g, Blockly.Field.NBSP);
    if (Blockly.RTL && text) {
        // The SVG is LTR, force text to be RTL.
        text = '\u200F' + text + '\u200F';
    }
    if (!text) {
        // Prevent the field from disappearing if empty.
        text = Blockly.Field.NBSP;
    }
    var textNode = document.createTextNode(text);
    this.textElement_.appendChild(textNode);

    // Cached width is obsolete.  Clear it.
    this.size_.width = 0;

    if (this.sourceBlock_ && this.sourceBlock_.rendered) {
        this.sourceBlock_.render();
        this.sourceBlock_.bumpNeighbours_();
        this.sourceBlock_.workspace.fireChangeEvent();
    }
};

/**
 * By default there is no difference between the human-readable text and
 * the language-neutral values.  Subclasses (such as dropdown) may define this.
 * @return {string} Current text.
 */
Blockly.Field.prototype.getValue = function () {
    return this.getText();
};

/**
 * By default there is no difference between the human-readable text and
 * the language-neutral values.  Subclasses (such as dropdown) may define this.
 * @param {string} text New text.
 */
Blockly.Field.prototype.setValue = function (text) {
    this.setText(text);
};

/**
 * Handle a mouse up event on an editable field.
 * @param {!Event} e Mouse up event.
 * @private
 */
Blockly.Field.prototype.onMouseUp_ = function (e) {
    if (Blockly.isRightButton(e)) {
        // Right-click.
        return;
    } else if (Blockly.Block.dragMode_ == 2) {
        // Drag operation is concluding.  Don't open the editor.
        return;
    } else if (this.sourceBlock_.isEditable()) {
        // Non-abstract sub-classes must define a showEditor_ method.
        this.showEditor_();
    }
};

/**
 * Change the tooltip text for this field.
 * @param {string|!Element} newTip Text for tooltip or a parent element to
 *     link to for its tooltip.
 */
Blockly.Field.prototype.setTooltip = function (newTip) {
    // Non-abstract sub-classes may wish to implement this.  See FieldLabel.
};

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
 * @fileoverview Text input field.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * Class for an editable text field.
 * @param {string} text The initial content of the field.
 * @param {Function} opt_changeHandler An optional function that is called
 *     to validate any constraints on what the user entered.  Takes the new
 *     text as an argument and returns either the accepted text, a replacement
 *     text, or null to abort the change.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldTextInput = function (text, opt_changeHandler) {
    Blockly.FieldTextInput.superClass_.constructor.call(this, text);

    this.changeHandler_ = opt_changeHandler;
};
Blockly.inherits(Blockly.FieldTextInput, Blockly.Field);

/**
 * Clone this FieldTextInput.
 * @return {!Blockly.FieldTextInput} The result of calling the constructor again
 *   with the current values of the arguments used during construction.
 */
Blockly.FieldTextInput.prototype.clone = function () {
    return new Blockly.FieldTextInput(this.getText(), this.changeHandler_);
};

/**
 * Mouse cursor style when over the hotspot that initiates the editor.
 */
Blockly.FieldTextInput.prototype.CURSOR = 'text';

/**
 * Close the input widget if this input is being deleted.
 */
Blockly.FieldTextInput.prototype.dispose = function () {
    Blockly.WidgetDiv.hideIfOwner(this);
    Blockly.FieldTextInput.superClass_.dispose.call(this);
};

/**
 * Set the text in this field.
 * @param {?string} text New text.
 * @override
 */
Blockly.FieldTextInput.prototype.setText = function (text) {
    if (text === null) {
        // No change if null.
        return;
    }
    if (this.changeHandler_) {
        var validated = this.changeHandler_(text);
        // If the new text is invalid, validation returns null.
        // In this case we still want to display the illegal result.
        if (validated !== null && validated !== undefined) {
            text = validated;
        }
    }
    Blockly.Field.prototype.setText.call(this, text);
};

/**
 * Show the inline free-text editor on top of the text.
 * @private
 */
Blockly.FieldTextInput.prototype.showEditor_ = function () {
    /*   if (Ext.is.Phone || Ext.is.Tablet) {
     // Mobile browsers have issues with in-line textareas (focus & keyboards).
     var newValue = window.prompt(Blockly.Msg.CHANGE_VALUE_TITLE, this.text_);
     if (this.changeHandler_) {
     var override = this.changeHandler_(newValue);
     if (override !== undefined) {
     newValue = override;
     }
     }
     if (newValue !== null) {
     this.setText(newValue);
     }
     return;
     }*/


    Blockly.FieldTextInput.htmlInput_ = domConstruct.create("Ext.form.field.Text", {
        block: this,
        border: false,
        cls: 'blocklyHtmlInput',
        floating: true,
        value: this.text_,
        enableKeyEvents: true,
        listeners: {
            keypress: function (panel, e, options) {
                this.block.onHtmlInputChange_(e);
            },
            keyup: function (panel, e, options) {
                this.block.onHtmlInputChange_(e);
            }
        }
    })
    Blockly.WidgetDiv.show(this, this.widgetDispose_());

    var xy = this.resizeEditor_();
    Blockly.FieldTextInput.htmlInput_.show();

    var workspaceSvg = this.sourceBlock_.workspace.getCanvas();
    Blockly.FieldTextInput.htmlInput_.onWorkspaceChangeWrapper_ = Blockly.bindEvent_(workspaceSvg, 'blocklyWorkspaceChange', this, this.resizeEditor_);


    return;
    var div = Blockly.DIV;
    // Create the input.
    var htmlInput = domConstruct.create('input', {id: 'blocklyHtmlInput' });
    Blockly.FieldTextInput.htmlInput_ = htmlInput;
    div.appendChild(htmlInput);

    htmlInput.value = htmlInput.defaultValue = this.text_;
    htmlInput.oldValue_ = null;
    this.validate_();
    this.resizeEditor_();
    htmlInput.focus();
    htmlInput.select();

    // Bind to keyup -- trap Enter and Esc; resize after every keystroke.
    htmlInput.onKeyUpWrapper_ = Blockly.bindEvent_(htmlInput, 'keyup', this, this.onHtmlInputChange_);
    htmlInput.onKeyUpWrapper_ =
        Blockly.bindEvent_(htmlInput, 'keyup', this, this.onHtmlInputChange_);
    // Bind to keyPress -- repeatedly resize when holding down a key.
    htmlInput.onKeyPressWrapper_ = Blockly.bindEvent_(htmlInput, 'keypress', this, this.onHtmlInputChange_);
};

/**
 * Handle a change to the editor.
 * @param {!Event} e Keyboard event.
 * @private
 */
Blockly.FieldTextInput.prototype.onHtmlInputChange_ = function (e) {
    var htmlInput = Blockly.FieldTextInput.htmlInput_;
    if (e.keyCode == 13) {
        // Enter
        Blockly.WidgetDiv.hide();
    } else if (e.keyCode == 27) {
        // Esc
        this.setText(htmlInput.defaultValue);
        Blockly.WidgetDiv.hide();
    } else {
        // Update source block.
        var text = htmlInput.getValue();
        if (text !== htmlInput.oldValue_) {
            htmlInput.oldValue_ = text;
            this.setText(text);
            this.validate_();
        } else if (has("webkit")) {
            // Cursor key.  Render the source block to show the caret moving.
            // Chrome only (version 26, OS X).
            this.sourceBlock_.render();
        }
    }
};

/**
 * Check to see if the contents of the editor validates.
 * Style the editor accordingly.
 * @private
 */
Blockly.FieldTextInput.prototype.validate_ = function () {
    var valid = true;
    if (typeof(Blockly.FieldTextInput.htmlInput_) != "object")
        console.log("Error");
    var htmlInput = Blockly.FieldTextInput.htmlInput_;
    if (this.changeHandler_) {
        valid = this.changeHandler_(htmlInput.getValue());
    }
    if (valid === null) {
        htmlInput.addCls('blocklyInvalidInput');
    } else {
        htmlInput.removeCls('blocklyInvalidInput');
    }
};

/**
 * Resize the editor and the underlying block to fit the text.
 * @private
 */
Blockly.FieldTextInput.prototype.resizeEditor_ = function () {
    var htmlInput = Blockly.FieldTextInput.htmlInput_;
    if (htmlInput == null)
        return;

//    var div = Blockly.WidgetDiv.DIV;
    var bBox = this.fieldGroup_.getBBox();
//    div.style.width = bBox.width + 'px';
    var xy = Blockly.getAbsoluteXY_(this.borderRect_);
    // In RTL mode block fields and LTR input fields the left edge moves,
    // whereas the right edge is fixed.  Reposition the editor.
//    if (Blockly.RTL) {
//        var borderBBox = this.borderRect_.getBBox();
//        xy.x += borderBBox.width;
//        xy.x -= div.offsetWidth;
//    }
    // Shift by a few pixels to line up exactly.
    xy.x -= 1;
    xy.y += 1;
    if (has("webkit")) {
        xy.y -= 3;
    }
//    div.style.left = xy.x + 'px';
//    div.style.top = xy.y + 'px';

    htmlInput.setPosition(xy.x, xy.y);
    htmlInput.setSize(bBox.width + 2, bBox.height + 2);

//    return xy;
};

/**
 * Close the editor, save the results, and dispose of the editable
 * text field's elements.
 * @return {!Function} Closure to call on destruction of the WidgetDiv.
 * @private
 */
Blockly.FieldTextInput.prototype.widgetDispose_ = function () {
    var thisField = this;
    return function () {
        var htmlInput = Blockly.FieldTextInput.htmlInput_;
        // Save the edit (if it validates).
        var text = htmlInput.getValue();
        if (thisField.changeHandler_) {
            text = thisField.changeHandler_(text);
            if (text === null) {
                // Invalid edit.
                text = htmlInput.defaultValue;
            }
        }
        thisField.setText(text);
//        thisField.sourceBlock_.rendered && thisField.sourceBlock_.render();
//        Blockly.unbindEvent_(htmlInput.onKeyUpWrapper_);
//        Blockly.unbindEvent_(htmlInput.onKeyPressWrapper_);
        Blockly.unbindEvent_(htmlInput.onWorkspaceChangeWrapper_);
        if (htmlInput != null)
            htmlInput.destroy();
        Blockly.FieldTextInput.htmlInput_ = null;
        // Delete the width property.
//        Blockly.WidgetDiv.DIV.style.width = 'auto';
    };
};

/**
 * Ensure that only a number may be entered.
 * @param {string} text The user's text.
 * @return {?string} A string representing a valid number, or null if invalid.
 */
Blockly.FieldTextInput.numberValidator = function (text) {
    // TODO: Handle cases like 'ten', '1.203,14', etc.
    // 'O' is sometimes mistaken for '0' by inexperienced users.
    text = text.replace(/O/ig, '0');
    // Strip out thousands separators.
    text = text.replace(/,/g, '');
    var n = parseFloat(text || 0);
    return isNaN(n) ? null : String(n);
};

/**
 * Ensure that only a nonnegative integer may be entered.
 * @param {string} text The user's text.
 * @return {?string} A string representing a valid int, or null if invalid.
 */
Blockly.FieldTextInput.nonnegativeIntegerValidator = function (text) {
    var n = Blockly.FieldTextInput.numberValidator(text);
    if (n) {
        n = String(Math.max(0, Math.floor(n)));
    }
    return n;
};

/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2013 Google Inc.
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
 * @fileoverview Angle input field.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * Class for an editable angle field.
 * @param {string} text The initial content of the field.
 * @param {Function} opt_changeHandler An optional function that is called
 *     to validate any constraints on what the user entered.  Takes the new
 *     text as an argument and returns the accepted text or null to abort
 *     the change.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldAngle = function (text, opt_changeHandler) {
    var changeHandler;
    if (opt_changeHandler) {
        // Wrap the user's change handler together with the angle validator.
        var thisObj = this;
        changeHandler = function (value) {
            value = Blockly.FieldAngle.angleValidator.call(thisObj, value);
            if (value !== null) {
                opt_changeHandler.call(thisObj, value);
            }
            return value;
        };
    } else {
        changeHandler = Blockly.FieldAngle.angleValidator;
    }

    // Add degree symbol: "360°" (LTR) or "°360" (RTL)
    this.symbol_ = Blockly.createSvgElement('tspan', {}, null);
    this.symbol_.appendChild(document.createTextNode('\u00B0'));

    Blockly.FieldAngle.superClass_.constructor.call(this,
        text, changeHandler);
};
Blockly.inherits(Blockly.FieldAngle, Blockly.FieldTextInput);

/**
 * Clone this FieldAngle.
 * @return {!Blockly.FieldAngle} The result of calling the constructor again
 *   with the current values of the arguments used during construction.
 */
Blockly.FieldAngle.prototype.clone = function () {
    return new Blockly.FieldAngle(this.getText(), this.changeHandler_);
};

/**
 * Round angles to the nearest 15 degrees when using mouse.
 * Set to 0 to disable rounding.
 */
Blockly.FieldAngle.ROUND = 15;

/**
 * Half the width of protractor image.
 */
Blockly.FieldAngle.HALF = 100 / 2;

/**
 * Radius of protractor circle.  Slightly smaller than protractor size since
 * otherwise SVG crops off half the border at the edges.
 */
Blockly.FieldAngle.RADIUS = Blockly.FieldAngle.HALF - 1;

/**
 * Clean up this FieldAngle, as well as the inherited FieldTextInput.
 * @return {!Function} Closure to call on destruction of the WidgetDiv.
 * @private
 */
Blockly.FieldAngle.prototype.dispose_ = function () {
    var thisField = this;
    return function () {
        Blockly.FieldAngle.superClass_.dispose_.call(thisField)();
        thisField.gauge_ = null;
        if (thisField.clickWrapper_) {
            Blockly.unbindEvent_(thisField.clickWrapper_);
        }
        if (thisField.moveWrapper1_) {
            Blockly.unbindEvent_(thisField.moveWrapper1_);
        }
        if (thisField.moveWrapper2_) {
            Blockly.unbindEvent_(thisField.moveWrapper2_);
        }
    };
};

/**
 * Show the inline free-text editor on top of the text.
 * @private
 */
Blockly.FieldAngle.prototype.showEditor_ = function () {
    Blockly.FieldAngle.superClass_.showEditor_.call(this);
    var div = Blockly.WidgetDiv.DIV;
    if (!div.firstChild) {
        // Mobile interface uses window.prompt.
        return;
    }
    // Build the SVG DOM.
    var svg = Blockly.createSvgElement('svg', {
        'xmlns': 'http://www.w3.org/2000/svg',
        'xmlns:html': 'http://www.w3.org/1999/xhtml',
        'xmlns:xlink': 'http://www.w3.org/1999/xlink',
        'version': '1.1',
        'height': (Blockly.FieldAngle.HALF * 2) + 'px',
        'width': (Blockly.FieldAngle.HALF * 2) + 'px'
    }, div);
    var circle = Blockly.createSvgElement('circle', {
        'cx': Blockly.FieldAngle.HALF, 'cy': Blockly.FieldAngle.HALF,
        'r': Blockly.FieldAngle.RADIUS,
        'class': 'blocklyAngleCircle'
    }, svg);
    this.gauge_ = Blockly.createSvgElement('path',
        {'class': 'blocklyAngleGauge'}, svg);
    this.line_ = Blockly.createSvgElement('line',
        {'x1': Blockly.FieldAngle.HALF,
            'y1': Blockly.FieldAngle.HALF,
            'class': 'blocklyAngleLine'}, svg);
    // Draw markers around the edge.
    for (var a = 0; a < 360; a += 15) {
        Blockly.createSvgElement('line', {
            'x1': Blockly.FieldAngle.HALF + Blockly.FieldAngle.RADIUS,
            'y1': Blockly.FieldAngle.HALF,
            'x2': Blockly.FieldAngle.HALF + Blockly.FieldAngle.RADIUS -
                (a % 45 == 0 ? 10 : 5),
            'y2': Blockly.FieldAngle.HALF,
            'class': 'blocklyAngleMarks',
            'transform': 'rotate(' + a + ', ' +
                Blockly.FieldAngle.HALF + ', ' + Blockly.FieldAngle.HALF + ')'
        }, svg);
    }
    svg.style.marginLeft = '-35px';
    this.clickWrapper_ =
        Blockly.bindEvent_(svg, 'click', this, Blockly.WidgetDiv.hide);
    this.moveWrapper1_ =
        Blockly.bindEvent_(circle, 'mousemove', this, this.onMouseMove);
    this.moveWrapper2_ =
        Blockly.bindEvent_(this.gauge_, 'mousemove', this, this.onMouseMove);
    this.updateGraph_();
};

/**
 * Set the angle to match the mouse's position.
 * @param {!Event} e Mouse move event.
 */
Blockly.FieldAngle.prototype.onMouseMove = function (e) {
    var bBox = this.gauge_.ownerSVGElement.getBoundingClientRect();
    var dx = e.clientX - bBox.left - Blockly.FieldAngle.HALF;
    var dy = e.clientY - bBox.top - Blockly.FieldAngle.HALF;
    var angle = Math.atan(-dy / dx);
    if (isNaN(angle)) {
        // This shouldn't happen, but let's not let this error propogate further.
        return;
    }
    angle = angle / Math.PI * 180;
    // 0: East, 90: North, 180: West, 270: South.
    if (dx < 0) {
        angle += 180;
    } else if (dy > 0) {
        angle += 360;
    }
    if (Blockly.FieldAngle.ROUND) {
        angle = Math.round(angle / Blockly.FieldAngle.ROUND) *
            Blockly.FieldAngle.ROUND;
    }
    if (angle >= 360) {
        // Rounding may have rounded up to 360.
        angle -= 360;
    }
    angle = String(angle);
    Blockly.FieldTextInput.htmlInput_.value = angle;
    this.setText(angle);
};

/**
 * Insert a degree symbol.
 * @param {?string} text New text.
 */
Blockly.FieldAngle.prototype.setText = function (text) {
    Blockly.FieldAngle.superClass_.setText.call(this, text);
    this.updateGraph_();
    // Insert degree symbol.
    if (Blockly.RTL) {
        this.textElement_.insertBefore(this.symbol_, this.textElement_.firstChild);
    } else {
        this.textElement_.appendChild(this.symbol_);
    }
    // Cached width is obsolete.  Clear it.
    this.size_.width = 0;
};

/**
 * Redraw the graph with the current angle.
 * @private
 */
Blockly.FieldAngle.prototype.updateGraph_ = function () {
    if (!this.gauge_) {
        return;
    }
    var angleRadians = Number(this.getText()) / 180 * Math.PI;
    if (isNaN(angleRadians)) {
        this.gauge_.setAttribute('d',
                'M ' + Blockly.FieldAngle.HALF + ', ' + Blockly.FieldAngle.HALF);
        this.line_.setAttribute('x2', Blockly.FieldAngle.HALF);
        this.line_.setAttribute('y2', Blockly.FieldAngle.HALF);
    } else {
        var x = Blockly.FieldAngle.HALF + Math.cos(angleRadians) *
            Blockly.FieldAngle.RADIUS;
        var y = Blockly.FieldAngle.HALF + Math.sin(angleRadians) * -Blockly.FieldAngle.RADIUS;
        var largeFlag = (angleRadians > Math.PI) ? 1 : 0;
        this.gauge_.setAttribute('d',
                'M ' + Blockly.FieldAngle.HALF + ', ' + Blockly.FieldAngle.HALF +
                ' h ' + Blockly.FieldAngle.RADIUS +
                ' A ' + Blockly.FieldAngle.RADIUS + ',' + Blockly.FieldAngle.RADIUS +
                ' 0 ' + largeFlag + ' 0 ' + x + ',' + y + ' z');
        this.line_.setAttribute('x2', x);
        this.line_.setAttribute('y2', y);
    }
};

/**
 * Ensure that only an angle may be entered.
 * @param {string} text The user's text.
 * @return {?string} A string representing a valid angle, or null if invalid.
 */
Blockly.FieldAngle.angleValidator = function (text) {
    var n = Blockly.FieldTextInput.numberValidator(text);
    if (n !== null) {
        n = n % 360;
        if (n < 0) {
            n += 360;
        }
        n = String(n);
    }
    return n;
};

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
 * @fileoverview Checkbox field.  Checked or not checked.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * Class for a checkbox field.
 * @param {string} state The initial state of the field ('TRUE' or 'FALSE').
 * @param {Function} opt_changeHandler A function that is executed when a new
 *     option is selected.  Its sole argument is the new checkbox state.  If
 *     it returns a value, this becomes the new checkbox state, unless the
 *     value is null, in which case the change is aborted.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldCheckbox = function (state, opt_changeHandler) {
    Blockly.FieldCheckbox.superClass_.constructor.call(this, '');

    this.changeHandler_ = opt_changeHandler;
    // The checkbox doesn't use the inherited text element.
    // Instead it uses a custom checkmark element that is either visible or not.
    this.checkElement_ = Blockly.createSvgElement('text',
        {'class': 'blocklyText', 'x': -3}, this.fieldGroup_);
    var textNode = document.createTextNode('\u2713');
    this.checkElement_.appendChild(textNode);
    // Set the initial state.
    this.setValue(state);
};
Blockly.inherits(Blockly.FieldCheckbox, Blockly.Field);

/**
 * Clone this FieldCheckbox.
 * @return {!Blockly.FieldCheckbox} The result of calling the constructor again
 *   with the current values of the arguments used during construction.
 */
Blockly.FieldCheckbox.prototype.clone = function () {
    return new Blockly.FieldCheckbox(this.getValue(), this.changeHandler_);
};

/**
 * Mouse cursor style when over the hotspot that initiates editability.
 */
Blockly.FieldCheckbox.prototype.CURSOR = 'default';

/**
 * Return 'TRUE' if the checkbox is checked, 'FALSE' otherwise.
 * @return {string} Current state.
 */
Blockly.FieldCheckbox.prototype.getValue = function () {
    return String(this.state_).toUpperCase();
};

/**
 * Set the checkbox to be checked if strBool is 'TRUE', unchecks otherwise.
 * @param {string} strBool New state.
 */
Blockly.FieldCheckbox.prototype.setValue = function (strBool) {
    var newState = (strBool == 'TRUE');
    if (this.state_ !== newState) {
        this.state_ = newState;
        this.checkElement_.style.display = newState ? 'block' : 'none';
        if (this.sourceBlock_ && this.sourceBlock_.rendered) {
            this.sourceBlock_.workspace.fireChangeEvent();
        }
    }
};

/**
 * Toggle the state of the checkbox.
 * @private
 */
Blockly.FieldCheckbox.prototype.showEditor_ = function () {
    var newState = !this.state_;
    if (this.changeHandler_) {
        // Call any change handler, and allow it to override.
        var override = this.changeHandler_(newState);
        if (override !== undefined) {
            newState = override;
        }
    }
    if (newState !== null) {
        this.setValue(String(newState).toUpperCase());
    }
};

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
 * @fileoverview Colour input field.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * Class for a colour input field.
 * @param {string} colour The initial colour in '#rrggbb' format.
 * @param {Function} opt_changeHandler A function that is executed when a new
 *     colour is selected.  Its sole argument is the new colour value.  Its
 *     return value becomes the selected colour, unless it is undefined, in
 *     which case the new colour stands, or it is null, in which case the change
 *     is aborted.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldColour = function (colour, opt_changeHandler) {
    Blockly.FieldColour.superClass_.constructor.call(this, '\u00A0\u00A0\u00A0');

    this.changeHandler_ = opt_changeHandler;
    this.borderRect_.style.fillOpacity = 1;
    // Set the initial state.
    this.setValue(colour);
};
Blockly.inherits(Blockly.FieldColour, Blockly.Field);

/**
 * Clone this FieldColour.
 * @return {!Blockly.FieldColour} The result of calling the constructor again
 *   with the current values of the arguments used during construction.
 */
Blockly.FieldColour.prototype.clone = function () {
    return new Blockly.FieldColour(this.getValue(), this.changeHandler_);
};

/**
 * Mouse cursor style when over the hotspot that initiates the editor.
 */
Blockly.FieldColour.prototype.CURSOR = 'default';

/**
 * Close the colour picker if this input is being deleted.
 */
Blockly.FieldColour.prototype.dispose = function () {
    Blockly.WidgetDiv.hideIfOwner(this);
    Blockly.FieldColour.superClass_.dispose.call(this);
};

/**
 * Return the current colour.
 * @return {string} Current colour in '#rrggbb' format.
 */
Blockly.FieldColour.prototype.getValue = function () {
    return this.colour_;
};

/**
 * Set the colour.
 * @param {string} colour The new colour in '#rrggbb' format.
 */
Blockly.FieldColour.prototype.setValue = function (colour) {
    this.colour_ = colour;
    this.borderRect_.style.fill = colour;
    if (this.sourceBlock_ && this.sourceBlock_.rendered) {
        // Since we're not re-rendering we need to explicitly call
        // Blockly.Realtime.blockChanged()
        Blockly.Realtime.blockChanged(this.sourceBlock_);
        this.sourceBlock_.workspace.fireChangeEvent();
    }
};

/**
 * An array of colour strings for the palette.
 * See bottom of this page for the default:
 * http://docs.closure-library.googlecode.com/git/closure_goog_ui_colorpicker.js.source.html
 * @type {!Array.<string>}
 */
Blockly.FieldColour.COLOURS = [];//goog.ui.ColorPicker.SIMPLE_GRID_COLORS;

/**
 * Number of columns in the palette.
 */
Blockly.FieldColour.COLUMNS = 7;

/**
 * Create a palette under the colour field.
 * @private
 */
Blockly.FieldColour.prototype.showEditor_ = function () {
    Blockly.WidgetDiv.show(this, Blockly.FieldColour.widgetDispose_);
    // Create the palette using Closure.
    var picker = new goog.ui.ColorPicker();
    picker.setSize(Blockly.FieldColour.COLUMNS);
    picker.setColors(Blockly.FieldColour.COLOURS);

    // Position the palette to line up with the field.
    // Record windowSize and scrollOffset before adding the palette.
    var windowSize = goog.dom.getViewportSize();
    var scrollOffset = goog.style.getViewportPageOffset(document);
    var xy = Blockly.getAbsoluteXY_(/** @type {!Element} */ (this.borderRect_));
    var borderBBox = this.borderRect_.getBBox();
    var div = Blockly.WidgetDiv.DIV;
    picker.render(div);
    picker.setSelectedColor(this.getValue());
    // Record paletteSize after adding the palette.
    var paletteSize = goog.style.getSize(picker.getElement());

    // Flip the palette vertically if off the bottom.
    if (xy.y + paletteSize.height + borderBBox.height >=
        windowSize.height + scrollOffset.y) {
        xy.y -= paletteSize.height - 1;
    } else {
        xy.y += borderBBox.height - 1;
    }
    if (Blockly.RTL) {
        xy.x += borderBBox.width;
        xy.x -= paletteSize.width;
        // Don't go offscreen left.
        if (xy.x < scrollOffset.x) {
            xy.x = scrollOffset.x;
        }
    } else {
        // Don't go offscreen right.
        if (xy.x > windowSize.width + scrollOffset.x - paletteSize.width) {
            xy.x = windowSize.width + scrollOffset.x - paletteSize.width;
        }
    }
    Blockly.WidgetDiv.position(xy.x, xy.y, windowSize, scrollOffset);

    // Configure event handler.
    var thisObj = this;
    Blockly.FieldColour.changeEventKey_ = goog.events.listen(picker,
        goog.ui.ColorPicker.EventType.CHANGE,
        function (event) {
            var colour = event.target.getSelectedColor() || '#000000';
            Blockly.WidgetDiv.hide();
            if (thisObj.changeHandler_) {
                // Call any change handler, and allow it to override.
                var override = thisObj.changeHandler_(colour);
                if (override !== undefined) {
                    colour = override;
                }
            }
            if (colour !== null) {
                thisObj.setValue(colour);
            }
        });
};

/**
 * Hide the colour palette.
 * @private
 */
Blockly.FieldColour.widgetDispose_ = function () {
    if (Blockly.FieldColour.changeEventKey_) {
        goog.events.unlistenByKey(Blockly.FieldColour.changeEventKey_);
    }
};

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
 * @fileoverview Dropdown input field.  Used for editable titles and variables.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * Class for an editable dropdown field.
 * @param {(!Array.<string>|!Function)} menuGenerator An array of options
 *     for a dropdown list, or a function which generates these options.
 * @param {Function} opt_changeHandler A function that is executed when a new
 *     option is selected, with the newly selected value as its sole argument.
 *     If it returns a value, that value (which must be one of the options) will
 *     become selected in place of the newly selected option, unless the return
 *     value is null, in which case the change is aborted.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldDropdown = function (menuGenerator, opt_changeHandler) {
    this.menuGenerator_ = menuGenerator;
    this.changeHandler_ = opt_changeHandler;
    this.trimOptions_();
    var firstTuple = this.getOptions_()[0];
    this.value_ = firstTuple[1];

    // Add dropdown arrow: "option ▾" (LTR) or "▾ אופציה" (RTL)
    // Android can't (in 2014) display "▾", so use "▼" instead.
    var arrowChar = has("android") ? '\u25BC' : '\u25BE';
    this.arrow_ = Blockly.createSvgElement('tspan', {}, null);
    this.arrow_.appendChild(document.createTextNode(
        Blockly.RTL ? arrowChar + ' ' : ' ' + arrowChar));

    // Call parent's constructor.
    Blockly.FieldDropdown.superClass_.constructor.call(this, firstTuple[0]);
};
Blockly.inherits(Blockly.FieldDropdown, Blockly.Field);

/**
 * Horizontal distance that a checkmark ovehangs the dropdown.
 */
Blockly.FieldDropdown.CHECKMARK_OVERHANG = 25;

/**
 * Clone this FieldDropdown.
 * @return {!Blockly.FieldDropdown} The result of calling the constructor again
 *   with the current values of the arguments used during construction.
 */
Blockly.FieldDropdown.prototype.clone = function () {
    return new Blockly.FieldDropdown(this.menuGenerator_, this.changeHandler_);
};

/**
 * Mouse cursor style when over the hotspot that initiates the editor.
 */
Blockly.FieldDropdown.prototype.CURSOR = 'default';

/**
 * Create a dropdown menu under the text.
 * @private
 */
Blockly.FieldDropdown.prototype.showEditor_ = function () {
    if (Blockly.openMenu != null) {
        Ext.destroy(Blockly.openMenu);
        Blockly.openMenu = null;
    }

    Blockly.WidgetDiv.show(this, null);
    var thisField = this;

    var callback = function (item) {
        if (item != null) {
            var value = item.getId();
            if (thisField.changeHandler_) {
                // Call any change handler, and allow it to override.
//                var override = thisField.changeHandler_(value);
                thisField.changeHandler_(value);
            }
            else if (value !== null) {
                thisField.setValue(value);
            }
        }
    };

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

    var options = this.getOptions_();
    for (var x = 0; x < options.length; x++) {
        var menuItem = {};
        menuItem.id = options[x][1];          // Language-neutral value.
        menuItem.text = options[x][0];        // Human-readable text.
        menuItem.handler = callback;
        if (menuItem.id == this.value_)
            menuItem.iconCls = "x-menu-item-arrow";
        menuCfg.items.push(menuItem);
    }

    var xy = Blockly.getAbsoluteXY_(this.borderRect_);
    var borderBBox = this.borderRect_.getBBox();

    Blockly.openMenu = new Ext.menu.Menu(menuCfg);
    Blockly.openMenu.showAt(xy.x, xy.y + borderBBox.height);
};

/**
 * Factor out common words in statically defined options.
 * Create prefix and/or suffix labels.
 * @private
 */
Blockly.FieldDropdown.prototype.trimOptions_ = function () {
    this.prefixField = null;
    this.suffixField = null;
    var options = this.menuGenerator_;
    if (!(options instanceof Array) || options.length < 2) {
        return;
    }
    var strings = options.map(function (t) {
        return t[0];
    });
    var shortest = Blockly.shortestStringLength(strings);
    var prefixLength = Blockly.commonWordPrefix(strings, shortest);
    var suffixLength = Blockly.commonWordSuffix(strings, shortest);
    if (!prefixLength && !suffixLength) {
        return;
    }
    if (shortest <= prefixLength + suffixLength) {
        // One or more strings will entirely vanish if we proceed.  Abort.
        return;
    }
    if (prefixLength) {
        this.prefixField = strings[0].substring(0, prefixLength - 1);
    }
    if (suffixLength) {
        this.suffixField = strings[0].substr(1 - suffixLength);
    }
    // Remove the prefix and suffix from the options.
    var newOptions = [];
    for (var x = 0; x < options.length; x++) {
        var text = options[x][0];
        var value = options[x][1];
        text = text.substring(prefixLength, text.length - suffixLength);
        newOptions[x] = [text, value];
    }
    this.menuGenerator_ = newOptions;
};

/**
 * Return a list of the options for this dropdown.
 * @return {!Array.<!Array.<string>>} Array of option tuples:
 *     (human-readable text, language-neutral name).
 * @private
 */
Blockly.FieldDropdown.prototype.getOptions_ = function () {
    if (typeof(this.menuGenerator_) == "function") {
        return this.menuGenerator_.call(this);
    }
    return /** @type {!Array.<!Array.<string>>} */ (this.menuGenerator_);
};

/**
 * Get the language-neutral value from this dropdown menu.
 * @return {string} Current text.
 */
Blockly.FieldDropdown.prototype.getValue = function () {
    return this.value_;
};

/**
 * Set the language-neutral value for this dropdown menu.
 * @param {string} newValue New value to set.
 */
Blockly.FieldDropdown.prototype.setValue = function (newValue) {
    this.value_ = newValue;
    // Look up and display the human-readable text.
    var options = this.getOptions_();
    for (var x = 0; x < options.length; x++) {
        // Options are tuples of human-readable text and language-neutral values.
        if (options[x][1] == newValue) {
            this.setText(options[x][0]);
            return;
        }
    }
    // Value not found.  Add it, maybe it will become valid once set
    // (like variable names).
    this.setText(newValue);
};

/**
 * Set the text in this field.  Trigger a rerender of the source block.
 * @param {?string} text New text.
 */
Blockly.FieldDropdown.prototype.setText = function (text) {
    if (this.sourceBlock_) {
        // Update arrow's colour.
        this.arrow_.style.fill = Blockly.makeColour(this.sourceBlock_.getColour());
    }
    if (text === null || text === this.text_) {
        // No change if null.
        return;
    }
    this.text_ = text;
    this.updateTextNode_();

    // Insert dropdown arrow.
    if (Blockly.RTL) {
        this.textElement_.insertBefore(this.arrow_, this.textElement_.firstChild);
    } else {
        this.textElement_.appendChild(this.arrow_);
    }

    if (this.sourceBlock_ && this.sourceBlock_.rendered) {
        this.sourceBlock_.render();
        this.sourceBlock_.bumpNeighbours_();
        this.sourceBlock_.workspace.fireChangeEvent();
    }
};

/**
 * Close the dropdown menu if this input is being deleted.
 */
Blockly.FieldDropdown.prototype.dispose = function () {
    Blockly.WidgetDiv.hideIfOwner(this);
    Blockly.FieldDropdown.superClass_.dispose.call(this);
};

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
 * @fileoverview Image field.  Used for titles, labels, etc.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * Class for an image.
 * @param {string} src The URL of the image.
 * @param {number} width Width of the image.
 * @param {number} height Height of the image.
 * @param {?string} opt_alt Optional alt text for when block is collapsed.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldImage = function (src, width, height, opt_alt) {
    this.sourceBlock_ = null;
    // Ensure height and width are numbers.  Strings are bad at math.
    this.height_ = Number(height);
    this.width_ = Number(width);
    this.size_ = {height: this.height_ + 10, width: this.width_};
    this.text_ = opt_alt || '';
    // Build the DOM.
    var offsetY = 6 - Blockly.BlockSvg.FIELD_HEIGHT;
    this.fieldGroup_ = Blockly.createSvgElement('g', {}, null);
    this.imageElement_ = Blockly.createSvgElement('image',
        {'height': this.height_ + 'px',
            'width': this.width_ + 'px',
            'y': offsetY}, this.fieldGroup_);
    this.setValue(src);
    if (has("ff")) { //Ext.isGecko) {
        // Due to a Firefox bug which eats mouse events on image elements,
        // a transparent rectangle needs to be placed on top of the image.
        this.rectElement_ = Blockly.createSvgElement('rect',
            {'height': this.height_ + 'px',
                'width': this.width_ + 'px',
                'y': offsetY,
                'fill-opacity': 0}, this.fieldGroup_);
    }
};
Blockly.inherits(Blockly.FieldImage, Blockly.Field);

/**
 * Clone this FieldImage.
 * @return {!Blockly.FieldImage} The result of calling the constructor again
 *   with the current values of the arguments used during construction.
 */
Blockly.FieldImage.prototype.clone = function () {
    return new Blockly.FieldImage(this.getSrc(), this.width_, this.height_,
        this.getText());
};

/**
 * Rectangular mask used by Firefox.
 * @type {Element}
 * @private
 */
Blockly.FieldImage.prototype.rectElement_ = null;

/**
 * Editable fields are saved by the XML renderer, non-editable fields are not.
 */
Blockly.FieldImage.prototype.EDITABLE = false;

/**
 * Install this text on a block.
 * @param {!Blockly.Block} block The block containing this text.
 */
Blockly.FieldImage.prototype.init = function (block) {
    if (this.sourceBlock_) {
        throw 'Image has already been initialized once.';
    }
    this.sourceBlock_ = block;
    block.getSvgRoot().appendChild(this.fieldGroup_);

    // Configure the field to be transparent with respect to tooltips.
    var topElement = this.rectElement_ || this.imageElement_;
    topElement.tooltip = this.sourceBlock_;
    Blockly.Tooltip.bindMouseEvents(topElement);
};

/**
 * Dispose of all DOM objects belonging to this text.
 */
Blockly.FieldImage.prototype.dispose = function () {
    domConstruct.destroy(this.fieldGroup_);
    this.fieldGroup_ = null;
    this.imageElement_ = null;
    this.rectElement_ = null;
};

/**
 * Change the tooltip text for this field.
 * @param {string|!Element} newTip Text for tooltip or a parent element to
 *     link to for its tooltip.
 */
Blockly.FieldImage.prototype.setTooltip = function (newTip) {
    var topElement = this.rectElement_ || this.imageElement_;
    topElement.tooltip = newTip;
};

/**
 * Get the source URL of this image.
 * @return {string} Current text.
 * @override
 */
Blockly.FieldImage.prototype.getValue = function () {
    return this.src_;
};

/**
 * Set the source URL of this image.
 * @param {?string} src New source.
 * @override
 */
Blockly.FieldImage.prototype.setValue = function (src) {
    if (src === null) {
        // No change if null.
        return;
    }
    this.src_ = src;
    this.imageElement_.setAttributeNS('http://www.w3.org/1999/xlink',
        'xlink:href', typeof src == "string" ? src : '');
};

/**
 * Set the alt text of this image.
 * @param {?string} alt New alt text.
 * @override
 */
Blockly.FieldImage.prototype.setText = function (alt) {
    if (alt === null) {
        // No change if null.
        return;
    }
    this.text_ = alt;
};

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
 * @fileoverview Non-editable text field.  Used for titles, labels, etc.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * Class for a non-editable field.
 * @param {string} text The initial content of the field.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldLabel = function (text) {
    this.sourceBlock_ = null;
    // Build the DOM.
    this.textElement_ = Blockly.createSvgElement('text',
        {'class': 'blocklyText'}, null);
    this.size_ = {height: 25, width: 0};
    this.setText(text);
};
Blockly.inherits(Blockly.FieldLabel, Blockly.Field);

/**
 * Clone this FieldLabel.
 * @return {!Blockly.FieldLabel} The result of calling the constructor again
 *   with the current values of the arguments used during construction.
 */
Blockly.FieldLabel.prototype.clone = function () {
    return new Blockly.FieldLabel(this.getText());
};

/**
 * Editable fields are saved by the XML renderer, non-editable fields are not.
 */
Blockly.FieldLabel.prototype.EDITABLE = false;

/**
 * Install this text on a block.
 * @param {!Blockly.Block} block The block containing this text.
 */
Blockly.FieldLabel.prototype.init = function (block) {
    if (this.sourceBlock_) {
        throw 'Text has already been initialized once.';
    }
    this.sourceBlock_ = block;
    block.getSvgRoot().appendChild(this.textElement_);

    // Configure the field to be transparent with respect to tooltips.
    this.textElement_.tooltip = this.sourceBlock_;
    Blockly.Tooltip.bindMouseEvents(this.textElement_);
};

/**
 * Dispose of all DOM objects belonging to this text.
 */
Blockly.FieldLabel.prototype.dispose = function () {
    domConstruct.destroy(this.textElement_);
    this.textElement_ = null;
};

/**
 * Gets the group element for this field.
 * Used for measuring the size and for positioning.
 * @return {!Element} The group element.
 */
Blockly.FieldLabel.prototype.getRootElement = function () {
    return /** @type {!Element} */ (this.textElement_);
};

/**
 * Change the tooltip text for this field.
 * @param {string|!Element} newTip Text for tooltip or a parent element to
 *     link to for its tooltip.
 */
Blockly.FieldLabel.prototype.setTooltip = function (newTip) {
    this.textElement_.tooltip = newTip;
};

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
 * @fileoverview Variable input field.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * Class for a variable's dropdown field.
 * @param {?string} varname The default name for the variable.  If null,
 *     a unique variable name will be generated.
 * @param {Function} opt_changeHandler A function that is executed when a new
 *     option is selected.  Its sole argument is the new option value.  Its
 *     return value is ignored.
 * @extends {Blockly.FieldDropdown}
 * @constructor
 */
Blockly.FieldVariable = function (varname, opt_changeHandler) {
    var changeHandler;
    if (opt_changeHandler) {
        // Wrap the user's change handler together with the variable rename handler.
        var thisObj = this;
        changeHandler = function (value) {
            var retVal = Blockly.FieldVariable.dropdownChange.call(thisObj, value);
            var newVal;
            if (retVal === undefined) {
                newVal = value;  // Existing variable selected.
            } else if (retVal === null) {
                newVal = thisObj.getValue();  // Abort, no change.
            } else {
                newVal = retVal;  // Variable name entered.
            }
            opt_changeHandler.call(thisObj, newVal);
            return retVal;
        };
    } else {
        changeHandler = Blockly.FieldVariable.dropdownChange;
    }

    Blockly.FieldVariable.superClass_.constructor.call(this,
        Blockly.FieldVariable.dropdownCreate, changeHandler);

    if (varname) {
        this.setValue(varname);
    } else {
        this.setValue(Blockly.Variables.generateUniqueName());
    }
};
Blockly.inherits(Blockly.FieldVariable, Blockly.FieldDropdown);

/**
 * Clone this FieldVariable.
 * @return {!Blockly.FieldVariable} The result of calling the constructor again
 *   with the current values of the arguments used during construction.
 */
Blockly.FieldVariable.prototype.clone = function () {
    return new Blockly.FieldVariable(this.getValue(), this.changeHandler_);
};

/**
 * Get the variable's name (use a variableDB to convert into a real name).
 * Unline a regular dropdown, variables are literal and have no neutral value.
 * @return {string} Current text.
 */
Blockly.FieldVariable.prototype.getValue = function () {
    return this.getText();
};

/**
 * Set the variable name.
 * @param {string} text New text.
 */
Blockly.FieldVariable.prototype.setValue = function (text) {
    this.value_ = text;
    this.setText(text);
};

/**
 * Return a sorted list of variable names for variable dropdown menus.
 * Include a special option at the end for creating a new variable name.
 * @return {!Array.<string>} Array of variable names.
 * @this {!Blockly.FieldVariable}
 */
Blockly.FieldVariable.dropdownCreate = function () {
    var variableList = Blockly.Variables.allVariables(this.name);
    // Ensure that the currently selected variable is an option.
    var name = this.getText();
    if (name && variableList.indexOf(name) == -1) {
        variableList.push(name);
    }
    variableList.sort(Blockly.caseInsensitiveCompare);
    variableList.push(Blockly.Msg.RENAME_VARIABLE);
    variableList.push(Blockly.Msg.NEW_VARIABLE);
    // Variables are not language-specific, use the name as both the user-facing
    // text and the internal representation.
    var options = [];
    for (var x = 0; x < variableList.length; x++) {
        options[x] = [variableList[x], variableList[x]];
    }
    return options;
};

/**
 * Event handler for a change in variable name.
 * Special case the 'New variable...' and 'Rename variable...' options.
 * In both of these special cases, prompt the user for a new name.
 * @param {string} text The selected dropdown menu option.
 * @return {null|undefined|string} An acceptable new variable name, or null if
 *     change is to be either aborted (cancel button) or has been already
 *     handled (rename), or undefined if an existing variable was chosen.
 * @this {!Blockly.FieldVariable}
 */
Blockly.FieldVariable.dropdownChange = function (inputText) {
    Blockly.hideChaff();

    var oldVar = "";
    if (inputText == Blockly.Msg.RENAME_VARIABLE) {
        oldVar = this.getText();
    }
    else if (inputText != Blockly.Msg.NEW_VARIABLE) {
        this.setText(inputText);
        return;
    }

    var thisField = this;

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
                xtype: 'textfield',
                fieldLabel: inputText,
                itemId: 'variable',
                name: 'variable',
                value: oldVar
            }
        ],
        buttons: [
            {
                text: "Cancel",
                handler: function () {
                    this.up('window').destroy();
                }
            },
            {
                text: "Ok",
                handler: function () {
                    if (this.up('form').getForm().isValid()) {
                        // Read the variable name
                        var newVar = form.getForm().findField('variable').getSubmitValue();

                        // Merge runs of whitespace.  Strip leading and trailing whitespace.
                        // Beyond this, all names are legal.
                        newVar && newVar.replace(/[\s\xa0]+/g, ' ').replace(/^ | $/g, '');

                        Blockly.Variables.renameVariable(thisField.name, oldVar, newVar);
                        thisField.setText(newVar);

                        this.up('window').destroy();
                    }
                }
            }
        ]
    });

    var saveWin = Ext.widget('window', {
        title: inputText,
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
}

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
 * @fileoverview Flyout tray containing blocks which may be created.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * Class for a flyout.
 * @constructor
 */
Blockly.Flyout = function () {
    var flyout = this;
    /**
     * @type {!Blockly.Workspace}
     * @private
     */
    this.workspace_ = new Blockly.Workspace(
        function () {
            return flyout.getMetrics_();
        },
        function (ratio) {
            return flyout.setMetrics_(ratio);
        });
    this.workspace_.isFlyout = true;

    /**
     * Opaque data that can be passed to removeChangeListener.
     * @type {Array.<!Array>}
     * @private
     */
    this.changeWrapper_ = null;

    /**
     * @type {number}
     * @private
     */
    this.width_ = 0;

    /**
     * @type {number}
     * @private
     */
    this.height_ = 0;

    /**
     * List of background buttons that lurk behind each block to catch clicks
     * landing in the blocks' lakes and bays.
     * @type {!Array.<!Element>}
     * @private
     */
    this.buttons_ = [];

    /**
     * List of event listeners.
     * @type {!Array.<!Array>}
     * @private
     */
    this.listeners_ = [];
};

/**
 * Does the flyout automatically close when a block is created?
 * @type {boolean}
 */
Blockly.Flyout.prototype.autoClose = true;

/**
 * Corner radius of the flyout background.
 * @type {number}
 * @const
 */
Blockly.Flyout.prototype.CORNER_RADIUS = 8;

/**
 * Wrapper function called when a resize occurs.
 * @type {Array.<!Array>}
 * @private
 */
Blockly.Flyout.prototype.onResizeWrapper_ = null;

/**
 * Creates the flyout's DOM.  Only needs to be called once.
 * @return {!Element} The flyout's SVG group.
 */
Blockly.Flyout.prototype.createDom = function () {
    /*
     <g>
     <path class="blocklyFlyoutBackground"/>
     <g></g>
     </g>
     */
    this.svgGroup_ = Blockly.createSvgElement('g', {}, null);
    this.svgBackground_ = Blockly.createSvgElement('path',
        {'class': 'blocklyFlyoutBackground'}, this.svgGroup_);
    this.svgGroup_.appendChild(this.workspace_.createDom());
    return this.svgGroup_;
};

/**
 * Dispose of this flyout.
 * Unlink from all DOM elements to prevent memory leaks.
 */
Blockly.Flyout.prototype.dispose = function () {
    this.hide();
    if (this.onResizeWrapper_) {
        Blockly.unbindEvent_(this.onResizeWrapper_);
        this.onResizeWrapper_ = null;
    }
    if (this.changeWrapper_) {
        Blockly.unbindEvent_(this.changeWrapper_);
        this.changeWrapper_ = null;
    }
    if (this.scrollbar_) {
        this.scrollbar_.dispose();
        this.scrollbar_ = null;
    }
    this.workspace_ = null;
    if (this.svgGroup_) {
        domConstruct.destroy(this.svgGroup_);
        this.svgGroup_ = null;
    }
    this.svgBackground_ = null;
    this.targetWorkspace_ = null;
};

/**
 * Return an object with all the metrics required to size scrollbars for the
 * flyout.  The following properties are computed:
 * .viewHeight: Height of the visible rectangle,
 * .viewWidth: Width of the visible rectangle,
 * .contentHeight: Height of the contents,
 * .viewTop: Offset of top edge of visible rectangle from parent,
 * .contentTop: Offset of the top-most content from the y=0 coordinate,
 * .absoluteTop: Top-edge of view.
 * .absoluteLeft: Left-edge of view.
 * @return {Object} Contains size and position metrics of the flyout.
 * @private
 */
Blockly.Flyout.prototype.getMetrics_ = function () {
    if (!this.isVisible()) {
        // Flyout is hidden.
        return null;
    }
    var viewHeight = this.height_ - 2 * this.CORNER_RADIUS;
    var viewWidth = this.width_;
    try {
        var optionBox = this.workspace_.getCanvas().getBBox();
    } catch (e) {
        // Firefox has trouble with hidden elements (Bug 528969).
        var optionBox = {height: 0, y: 0};
    }
    return {
        viewHeight: viewHeight,
        viewWidth: viewWidth,
        contentHeight: optionBox.height + optionBox.y,
        viewTop: -this.workspace_.scrollY,
        contentTop: 0,
        absoluteTop: this.CORNER_RADIUS,
        absoluteLeft: 0
    };
};

/**
 * Sets the Y translation of the flyout to match the scrollbars.
 * @param {!Object} yRatio Contains a y property which is a float
 *     between 0 and 1 specifying the degree of scrolling.
 * @private
 */
Blockly.Flyout.prototype.setMetrics_ = function (yRatio) {
    var metrics = this.getMetrics_();
    // This is a fix to an apparent race condition.
    if (!metrics) {
        return;
    }
    if (lang.isNumeric(yRatio.y)) {
        this.workspace_.scrollY = -metrics.contentHeight * yRatio.y - metrics.contentTop;
    }
    var y = this.workspace_.scrollY + metrics.absoluteTop;
    this.workspace_.getCanvas().setAttribute('transform', 'translate(0,' + y + ')');
    this.workspace_.getCanvas().setAttribute('transform',
            'translate(0,' + y + ')');
};

/**
 * Initializes the flyout.
 * @param {!Blockly.Workspace} workspace The workspace in which to create new
 *     blocks.
 * @param {boolean} withScrollbar True if a scrollbar should be displayed.
 */
Blockly.Flyout.prototype.init =
    function (workspace, withScrollbar) {
        this.targetWorkspace_ = workspace;
        // Add scrollbars.
        var flyout = this;
        if (withScrollbar) {
            this.scrollbar_ = new Blockly.Scrollbar(flyout.workspace_, false, false);
        }

        this.hide();

        // If the document resizes, reposition the flyout.
        console.log("this.onResizeWrapper_ = Blockly.bindEvent_(window, goog.events.EventType.RESIZE, this, this.position_);");
        this.position_();
        this.changeWrapper_ = Blockly.bindEvent_(this.targetWorkspace_.getCanvas(), 'blocklyWorkspaceChange', this, this.filterForCapacity_);
    };

/**
 * Move the toolbox to the edge of the workspace.
 * @private
 */
Blockly.Flyout.prototype.position_ = function () {
    if (!this.isVisible()) {
        return;
    }
    var metrics = this.targetWorkspace_.getMetrics();
    if (!metrics) {
        // Hidden components will return null.
        return;
    }
    var edgeWidth = this.width_ - this.CORNER_RADIUS;
    if (Blockly.RTL) {
        edgeWidth *= -1;
    }
    var path = ['M ' + (Blockly.RTL ? this.width_ : 0) + ',0'];
    path.push('h', edgeWidth);
    path.push('a', this.CORNER_RADIUS, this.CORNER_RADIUS, 0, 0,
        Blockly.RTL ? 0 : 1,
        Blockly.RTL ? -this.CORNER_RADIUS : this.CORNER_RADIUS,
        this.CORNER_RADIUS);
    path.push('v', Math.max(0, metrics.viewHeight - this.CORNER_RADIUS * 2));
    path.push('a', this.CORNER_RADIUS, this.CORNER_RADIUS, 0, 0,
        Blockly.RTL ? 0 : 1,
        Blockly.RTL ? this.CORNER_RADIUS : -this.CORNER_RADIUS,
        this.CORNER_RADIUS);
    path.push('h', -edgeWidth);
    path.push('z');
    this.svgBackground_.setAttribute('d', path.join(' '));

    var x = metrics.absoluteLeft;
    if (Blockly.RTL) {
        x += metrics.viewWidth;
        x -= this.width_;
    }
    this.svgGroup_.setAttribute('transform',
            'translate(' + x + ',' + metrics.absoluteTop + ')');

    // Record the height for Blockly.Flyout.getMetrics_.
    this.height_ = metrics.viewHeight;

    // Update the scrollbar (if one exists).
    if (this.scrollbar_) {
        this.scrollbar_.resize();
    }
};

/**
 * Is the flyout visible?
 * @return {boolean} True if visible.
 */
Blockly.Flyout.prototype.isVisible = function () {
    return this.svgGroup_.style.display == 'block';
};

/**
 * Hide and empty the flyout.
 */
Blockly.Flyout.prototype.hide = function () {
    if (!this.isVisible()) {
        return;
    }
    this.svgGroup_.style.display = 'none';
    // Delete all the event listeners.
    for (var x = 0, listen; listen = this.listeners_[x]; x++) {
        Blockly.unbindEvent_(listen);
    }
    this.listeners_.splice(0);
    if (this.reflowWrapper_) {
        Blockly.unbindEvent_(this.reflowWrapper_);
        this.reflowWrapper_ = null;
    }
    // Delete all the blocks.
    var blocks = this.workspace_.getTopBlocks(false);
    for (var x = 0, block; block = blocks[x]; x++) {
        if (block.workspace == this.workspace_) {
            block.dispose(false, false);
        }
    }
    // Delete all the background buttons.
    for (var x = 0, rect; rect = this.buttons_[x]; x++) {
        domConstruct.destroy(rect);
    }
    this.buttons_.splice(0);
};

/**
 * Show and populate the flyout.
 * @param {!Array|string} xmlList List of blocks to show.
 *     Variables and procedures have a custom set of blocks.
 */
Blockly.Flyout.prototype.show = function (xmlList) {
    this.hide();
    var margin = this.CORNER_RADIUS;
    this.svgGroup_.style.display = 'block';

    // Create the blocks to be shown in this flyout.
    var blocks = [];
    var gaps = [];
    if (xmlList == Blockly.Variables.NAME_TYPE) {
        // Special category for variables.
        Blockly.Variables.flyoutCategory(blocks, gaps, margin,
            /** @type {!Blockly.Workspace} */ (this.workspace_));
    } else if (xmlList == Blockly.Procedures.NAME_TYPE) {
        // Special category for procedures.
        Blockly.Procedures.flyoutCategory(blocks, gaps, margin,
            /** @type {!Blockly.Workspace} */ (this.workspace_));
    } else {
        for (var i = 0, xml; xml = xmlList[i]; i++) {
            if (xml.tagName && xml.tagName.toUpperCase() == 'BLOCK') {
                var block = Blockly.Xml.domToBlock(
                    /** @type {!Blockly.Workspace} */ (this.workspace_), xml);
                blocks.push(block);
                gaps.push(margin * 3);
            }
        }
    }

    // Lay out the blocks vertically.
    var cursorY = margin;
    for (var i = 0, block; block = blocks[i]; i++) {
        var allBlocks = block.getDescendants();
        for (var j = 0, child; child = allBlocks[j]; j++) {
            // Mark blocks as being inside a flyout.  This is used to detect and
            // prevent the closure of the flyout if the user right-clicks on such a
            // block.
            child.isInFlyout = true;
            // There is no good way to handle comment bubbles inside the flyout.
            // Blocks shouldn't come with predefined comments, but someone will
            // try this, I'm sure.  Kill the comment.
            child.setCommentText(null);
        }
        block.render();
        var root = block.getSvgRoot();
        var blockHW = block.getHeightWidth();
        var x = Blockly.RTL ? 0 : margin + Blockly.BlockSvg.TAB_WIDTH;
        block.moveBy(x, cursorY);
        cursorY += blockHW.height + gaps[i];

        // Create an invisible rectangle under the block to act as a button.  Just
        // using the block as a button is poor, since blocks have holes in them.
        var rect = Blockly.createSvgElement('rect', {'fill-opacity': 0}, null);
        // Add the rectangles under the blocks, so that the blocks' tooltips work.
        this.workspace_.getCanvas().insertBefore(rect, block.getSvgRoot());
        block.flyoutRect_ = rect;
        this.buttons_[i] = rect;

        if (this.autoClose) {
            this.listeners_.push(Blockly.bindEvent_(root, 'mousedown', null,
                this.createBlockFunc_(block)));
        } else {
            this.listeners_.push(Blockly.bindEvent_(root, 'mousedown', null,
                this.blockMouseDown_(block)));
        }
        this.listeners_.push(Blockly.bindEvent_(root, 'mouseover', block.svg_,
            block.svg_.addSelect));
        this.listeners_.push(Blockly.bindEvent_(root, 'mouseout', block.svg_,
            block.svg_.removeSelect));
        this.listeners_.push(Blockly.bindEvent_(rect, 'mousedown', null,
            this.createBlockFunc_(block)));
        this.listeners_.push(Blockly.bindEvent_(rect, 'mouseover', block.svg_,
            block.svg_.addSelect));
        this.listeners_.push(Blockly.bindEvent_(rect, 'mouseout', block.svg_,
            block.svg_.removeSelect));
    }

    // IE 11 is an incompetant browser that fails to fire mouseout events.
    // When the mouse is over the background, deselect all blocks.
    var deselectAll = function (e) {
        var blocks = this.workspace_.getTopBlocks(false);
        for (var i = 0, block; block = blocks[i]; i++) {
            block.svg_.removeSelect();
        }
    };
    this.listeners_.push(Blockly.bindEvent_(this.svgBackground_, 'mouseover',
        this, deselectAll));

    this.width_ = 0;
    this.reflow();

    this.filterForCapacity_();

    // Fire a resize event to update the flyout's scrollbar.
    Blockly.fireUiEventNow(window, 'resize');
    this.reflowWrapper_ = Blockly.bindEvent_(this.workspace_.getCanvas(),
        'blocklyWorkspaceChange', this, this.reflow);
    this.workspace_.fireChangeEvent();
};

/**
 * Compute width of flyout.  Position button under each block.
 * For RTL: Lay out the blocks right-aligned.
 */
Blockly.Flyout.prototype.reflow = function () {
    var flyoutWidth = 0;
    var margin = this.CORNER_RADIUS;
    var blocks = this.workspace_.getTopBlocks(false);
    for (var x = 0, block; block = blocks[x]; x++) {
        var root = block.getSvgRoot();
        var blockHW = block.getHeightWidth();
        flyoutWidth = Math.max(flyoutWidth, blockHW.width);
    }
    flyoutWidth += margin + Blockly.BlockSvg.TAB_WIDTH + margin / 2 +
        Blockly.Scrollbar.scrollbarThickness;
    if (this.width_ != flyoutWidth) {
        for (var x = 0, block; block = blocks[x]; x++) {
            var blockHW = block.getHeightWidth();
            var blockXY = block.getRelativeToSurfaceXY();
            if (Blockly.RTL) {
                // With the flyoutWidth known, right-align the blocks.
                var dx = flyoutWidth - margin - Blockly.BlockSvg.TAB_WIDTH - blockXY.x;
                block.moveBy(dx, 0);
                blockXY.x += dx;
            }
            if (block.flyoutRect_) {
                block.flyoutRect_.setAttribute('width', blockHW.width);
                block.flyoutRect_.setAttribute('height', blockHW.height);
                block.flyoutRect_.setAttribute('x',
                    Blockly.RTL ? blockXY.x - blockHW.width : blockXY.x);
                block.flyoutRect_.setAttribute('y', blockXY.y);
            }
        }
        // Record the width for .getMetrics_ and .position_.
        this.width_ = flyoutWidth;
        // Fire a resize event to update the flyout's scrollbar.
        Blockly.fireUiEvent(window, 'resize');
    }
};

/**
 * Move a block to a specific location on the drawing surface.
 * @param {number} x Horizontal location.
 * @param {number} y Vertical location.
 */
Blockly.Block.prototype.moveTo = function (x, y) {
    var oldXY = this.getRelativeToSurfaceXY();
    this.svg_.getRootElement().setAttribute('transform',
            'translate(' + x + ', ' + y + ')');
    this.moveConnections_(x - oldXY.x, y - oldXY.y);
};

/**
 * Handle a mouse-down on an SVG block in a non-closing flyout.
 * @param {!Blockly.Block} block The flyout block to copy.
 * @return {!Function} Function to call when block is clicked.
 * @private
 */
Blockly.Flyout.prototype.blockMouseDown_ = function (block) {
    var flyout = this;
    return function (e) {
        Blockly.terminateDrag_();
        Blockly.hideChaff();
        if (Blockly.isRightButton(e)) {
            // Right-click.
            block.showContextMenu_(e);
        } else {
            // Left-click (or middle click)
            Blockly.removeAllRanges();
            Blockly.setCursorHand_(true);
            // Record the current mouse position.
            Blockly.Flyout.startDownEvent_ = e;
            Blockly.Flyout.startBlock_ = block;
            Blockly.Flyout.startFlyout_ = flyout;
            Blockly.Flyout.onMouseUpWrapper_ = Blockly.bindEvent_(document,
                'mouseup', this, Blockly.terminateDrag_);
            Blockly.Flyout.onMouseMoveWrapper_ = Blockly.bindEvent_(document,
                'mousemove', this, flyout.onMouseMove_);
        }
        // This event has been handled.  No need to bubble up to the document.
        e.stopPropagation();
    };
};

/**
 * Mouse button is down on a block in a non-closing flyout.  Create the block
 * if the mouse moves beyond a small radius.  This allows one to play with
 * fields without instantiating blocks that instantly self-destruct.
 * @param {!Event} e Mouse move event.
 * @private
 */
Blockly.Flyout.prototype.onMouseMove_ = function (e) {
    if (e.type == 'mousemove' && e.clientX <= 1 && e.clientY == 0 &&
        e.button == 0) {
        /* HACK:
         Safari Mobile 6.0 and Chrome for Android 18.0 fire rogue mousemove events
         on certain touch actions. Ignore events with these signatures.
         This may result in a one-pixel blind spot in other browsers,
         but this shouldn't be noticable. */
        e.stopPropagation();
        return;
    }
    Blockly.removeAllRanges();
    var dx = e.clientX - Blockly.Flyout.startDownEvent_.clientX;
    var dy = e.clientY - Blockly.Flyout.startDownEvent_.clientY;
    // Still dragging within the sticky DRAG_RADIUS.
    var dr = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    if (dr > Blockly.DRAG_RADIUS) {
        // Create the block.
        Blockly.Flyout.startFlyout_.createBlockFunc_(Blockly.Flyout.startBlock_)
        (Blockly.Flyout.startDownEvent_);
    }
};

/**
 * Create a copy of this block on the workspace.
 * @param {!Blockly.Block} originBlock The flyout block to copy.
 * @return {!Function} Function to call when block is clicked.
 * @private
 */
Blockly.Flyout.prototype.createBlockFunc_ = function (originBlock) {
    var flyout = this;
    return function (e) {
        if (Blockly.isRightButton(e)) {
            // Right-click.  Don't create a block, let the context menu show.
            return;
        }
        if (originBlock.disabled) {
            // Beyond capacity.
            return;
        }
        // Create the new block by cloning the block in the flyout (via XML).
        var xml = Blockly.Xml.blockToDom_(originBlock);
        var block = Blockly.Xml.domToBlock(flyout.targetWorkspace_, xml);
        // Place it in the same spot as the flyout copy.
        var svgRootOld = originBlock.getSvgRoot();
        if (!svgRootOld) {
            throw 'originBlock is not rendered.';
        }
        var xyOld = Blockly.getSvgXY_(svgRootOld);
        var svgRootNew = block.getSvgRoot();
        if (!svgRootNew) {
            throw 'block is not rendered.';
        }
        var xyNew = Blockly.getSvgXY_(svgRootNew);
        block.moveBy(xyOld.x - xyNew.x, xyOld.y - xyNew.y);
        if (flyout.autoClose) {
            flyout.hide();
        } else {
            flyout.filterForCapacity_();
        }
        // Start a dragging operation on the new block.
        block.onMouseDown_(e);
    };
};

/**
 * Filter the blocks on the flyout to disable the ones that are above the
 * capacity limit.
 * @private
 */
Blockly.Flyout.prototype.filterForCapacity_ = function () {
    var remainingCapacity = this.targetWorkspace_.remainingCapacity();
    var blocks = this.workspace_.getTopBlocks(false);
    for (var i = 0, block; block = blocks[i]; i++) {
        var allBlocks = block.getDescendants();
        var disabled = allBlocks.length > remainingCapacity;
        block.setDisabled(disabled);
    }
};

/**
 * Stop binding to the global mouseup and mousemove events.
 * @private
 */
Blockly.Flyout.terminateDrag_ = function () {
    if (Blockly.Flyout.onMouseUpWrapper_) {
        Blockly.unbindEvent_(Blockly.Flyout.onMouseUpWrapper_);
        Blockly.Flyout.onMouseUpWrapper_ = null;
    }
    if (Blockly.Flyout.onMouseMoveWrapper_) {
        Blockly.unbindEvent_(Blockly.Flyout.onMouseMoveWrapper_);
        Blockly.Flyout.onMouseMoveWrapper_ = null;
    }
    Blockly.Flyout.startDownEvent_ = null;
    Blockly.Flyout.startBlock_ = null;
    Blockly.Flyout.startFlyout_ = null;
};

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
 * @fileoverview Utility functions for generating executable code from
 * Blockly code.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * Class for a code generator that translates the blocks into a language.
 * @param {string} name Language name of this generator.
 * @constructor
 */
Blockly.Generator = function (name) {
    this.name_ = name;
    this.RESERVED_WORDS_ = '';
};

/**
 * Category to separate generated function names from variables and procedures.
 */
Blockly.Generator.NAME_TYPE = 'generated_function';

/**
 * Generate code for all blocks in the workspace to the specified language.
 * @return {string} Generated code.
 */
Blockly.Generator.prototype.workspaceToCode = function () {
    var code = [];
    this.init();
    var blocks = Blockly.mainWorkspace.getTopBlocks(true);
    for (var x = 0, block; block = blocks[x]; x++) {
        var line = this.blockToCode(block);
        if (line instanceof Array) {
            // Value blocks return tuples of code and operator order.
            // Top-level blocks don't care about operator order.
            line = line[0];
        }
        if (line) {
            if (block.outputConnection && this.scrubNakedValue) {
                // This block is a naked value.  Ask the language's code generator if
                // it wants to append a semicolon, or something.
                line = this.scrubNakedValue(line);
            }
            code.push(line);
        }
    }
    code = code.join('\n');  // Blank line between each section.
    code = this.finish(code);
    // Final scrubbing of whitespace.
    code = code.replace(/^\s+\n/, '');
    code = code.replace(/\n\s+$/, '\n');
    code = code.replace(/[ \t]+\n/g, '\n');
    return code;
};

// The following are some helpful functions which can be used by multiple
// languages.

/**
 * Prepend a common prefix onto each line of code.
 * @param {string} text The lines of code.
 * @param {string} prefix The common prefix.
 * @return {string} The prefixed lines of code.
 */
Blockly.Generator.prototype.prefixLines = function (text, prefix) {
    return prefix + text.replace(/\n(.)/g, '\n' + prefix + '$1');
};

/**
 * Recursively spider a tree of blocks, returning all their comments.
 * @param {!Blockly.Block} block The block from which to start spidering.
 * @return {string} Concatenated list of comments.
 */
Blockly.Generator.prototype.allNestedComments = function (block) {
    var comments = [];
    var blocks = block.getDescendants();
    for (var x = 0; x < blocks.length; x++) {
        var comment = blocks[x].getCommentText();
        if (comment) {
            comments.push(comment);
        }
    }
    // Append an empty string to create a trailing line break when joined.
    if (comments.length) {
        comments.push('');
    }
    return comments.join('\n');
};

/**
 * Generate code for the specified block (and attached blocks).
 * @param {Blockly.Block} block The block to generate code for.
 * @return {string|!Array} For statement blocks, the generated code.
 *     For value blocks, an array containing the generated code and an
 *     operator order value.  Returns '' if block is null.
 */
Blockly.Generator.prototype.blockToCode = function (block) {
    if (!block) {
        return '';
    }
    if (block.disabled) {
        // Skip past this block if it is disabled.
        var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
        return this.blockToCode(nextBlock);
    }

    var func = this[block.type];
    if (!func) {
        throw 'Language "' + this.name_ + '" does not know how to generate code ' +
            'for block type "' + block.type + '".';
    }
    // First argument to func.call is the value of 'this' in the generator.
    // Prior to 24 September 2013 'this' was the only way to access the block.
    // The current prefered method of accessing the block is through the second
    // argument to func.call, which becomes the first parameter to the generator.
    var code = func.call(block, block);
    if (code instanceof Array) {
        // Value blocks return tuples of code and operator order.
        return [this.scrub_(block, code[0]), code[1]];
    } else {
        return this.scrub_(block, code);
    }
};

/**
 * Generate code representing the specified value input.
 * @param {!Blockly.Block} block The block containing the input.
 * @param {string} name The name of the input.
 * @param {number} order The maximum binding strength (minimum order value)
 *     of any operators adjacent to "block".
 * @return {string} Generated code or '' if no blocks are connected or the
 *     specified input does not exist.
 */
Blockly.Generator.prototype.valueToCode = function (block, name, order) {
    if (isNaN(order)) {
        throw 'Expecting valid order from block "' + block.type + '".';
    }
    var targetBlock = block.getInputTargetBlock(name);
    if (!targetBlock) {
        return '';
    }
    var tuple = this.blockToCode(targetBlock);
    if (tuple === '') {
        // Disabled block.
        return '';
    }
    if (!(tuple instanceof Array)) {
        // Value blocks must return code and order of operations info.
        // Statement blocks must only return code.
        throw 'Expecting tuple from value block "' + targetBlock.type + '".';
    }
    var code = tuple[0];
    var innerOrder = tuple[1];
    if (isNaN(innerOrder)) {
        throw 'Expecting valid order from value block "' + targetBlock.type + '".';
    }
    if (code && order <= innerOrder) {
        if (order == innerOrder || (order == 0 || order == 99)) {
            // 0 is the atomic order, 99 is the none order.  No parentheses needed.
            // In all known languages multiple such code blocks are not order
            // sensitive.  In fact in Python ('a' 'b') 'c' would fail.
        } else {
            // The operators outside this code are stonger than the operators
            // inside this code.  To prevent the code from being pulled apart,
            // wrap the code in parentheses.
            // Technically, this should be handled on a language-by-language basis.
            // However all known (sane) languages use parentheses for grouping.
            code = '(' + code + ')';
        }
    }
    return code;
};

/**
 * Generate code representing the statement.  Indent the code.
 * @param {!Blockly.Block} block The block containing the input.
 * @param {string} name The name of the input.
 * @return {string} Generated code or '' if no blocks are connected.
 */
Blockly.Generator.prototype.statementToCode = function (block, name) {
    var targetBlock = block.getInputTargetBlock(name);
    var code = this.blockToCode(targetBlock);
    if (!typeof code == "string") {
        // Value blocks must return code and order of operations info.
        // Statement blocks must only return code.
        throw 'Expecting code from statement block "' + targetBlock.type + '".';
    }
    if (code) {
        code = this.prefixLines(/** @type {string} */ (code), '  ');
    }
    return code;
};

/**
 * Add one or more words to the list of reserved words for this language.
 * @param {string} words Comma-separated list of words to add to the list.
 *     No spaces.  Duplicates are ok.
 */
Blockly.Generator.prototype.addReservedWords = function (words) {
    this.RESERVED_WORDS_ += words + ',';
};

/**
 * This is used as a placeholder in functions defined using
 * Blockly.Generator.provideFunction_.  It must not be legal code that could
 * legitimately appear in a function definition (or comment), and it must
 * not confuse the regular expression parser.
 */
Blockly.Generator.prototype.FUNCTION_NAME_PLACEHOLDER_ = '{leCUI8hutHZI4480Dc}';
Blockly.Generator.prototype.FUNCTION_NAME_PLACEHOLDER_REGEXP_ =
    new RegExp(Blockly.Generator.prototype.FUNCTION_NAME_PLACEHOLDER_, 'g');

/**
 * Define a function to be included in the generated code.
 * The first time this is called with a given desiredName, the code is
 * saved and an actual name is generated.  Subsequent calls with the
 * same desiredName have no effect but have the same return value.
 *
 * It is up to the caller to make sure the same desiredName is not
 * used for different code values.
 *
 * The code gets output when Blockly.Generator.finish() is called.
 *
 * @param {string} desiredName The desired name of the function (e.g., isPrime).
 * @param {!Array.<string>} code A list of Python statements.
 * @return {string} The actual name of the new function.  This may differ
 *     from desiredName if the former has already been taken by the user.
 * @private
 */
Blockly.Generator.prototype.provideFunction_ = function (desiredName, code) {
    if (!this.definitions_[desiredName]) {
        var functionName =
            this.variableDB_.getDistinctName(desiredName, this.NAME_TYPE);
        this.functionNames_[desiredName] = functionName;
        this.definitions_[desiredName] = code.join('\n').replace(
            this.FUNCTION_NAME_PLACEHOLDER_REGEXP_, functionName);
    }
    return this.functionNames_[desiredName];
};

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
 * @fileoverview Functions for injecting Blockly into a web page.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * Initialize the SVG document with various handlers.
 * @param {!Element} container Containing element.
 * @param {Object} opt_options Optional dictionary of options.
 */
Blockly.inject = function (container, opt_options) {
    // Verify that the container is in document.
/*    if (dom.byId(container) == null) {
        throw 'Error: container is not in current document.';
    }*/
    Blockly.DIV = container;
    if (opt_options) {
        // TODO(scr): don't mix this in to global variables.
        lang.mixin(Blockly, Blockly.parseOptions_(opt_options));
    }
    var startUi = function () {
        Blockly.createDom_(container);
        Blockly.init_();
    };

    startUi();
};

/**
 * Configure Blockly to behave according to a set of options.
 * @param {!Object} options Dictionary of options.
 * @return {Object} Parsed options.
 * @private
 */
Blockly.parseOptions_ = function (options) {
    var readOnly = !!options['readOnly'];
    if (readOnly) {
        var hasTrashcan = false;
        var hasCollapse = false;
        var tree = null;
    } else {
        var hasTrashcan = options['trashcan'];
        if (hasTrashcan === undefined) {
            hasTrashcan = false;
        }
        var hasCollapse = options['collapse'];
        if (hasCollapse === undefined) {
            hasCollapse = false;
        }
    }
    var hasScrollbars = options['scrollbars'];
    if (hasScrollbars === undefined) {
        hasScrollbars = true;
    }
    return {
        RTL: !!options['rtl'],
        collapse: hasCollapse,
        readOnly: readOnly,
        maxBlocks: options['maxBlocks'] || Infinity,
        pathToBlockly: options['path'] || './',
        hasScrollbars: hasScrollbars,
        hasTrashcan: hasTrashcan,
        languageTree: tree
    };
};

/**
 * Create the SVG image.
 * @param {!Element} container Containing element.
 * @private
 */
Blockly.createDom_ = function (container) {
    // Sadly browsers (Chrome vs Firefox) are currently inconsistent in laying
    // out content in RTL mode.  Therefore Blockly forces the use of LTR,
    // then manually positions content in RTL as needed.
    container.setAttribute('dir', 'LTR');

    // Load CSS.
    Blockly.Css.inject();

    // Build the SVG DOM.
    /*
     <svg
     xmlns="http://www.w3.org/2000/svg"
     xmlns:html="http://www.w3.org/1999/xhtml"
     xmlns:xlink="http://www.w3.org/1999/xlink"
     version="1.1"
     class="blocklySvg">
     ...
     </svg>
     */
    var svg = Blockly.createSvgElement('svg', {
        'xmlns': 'http://www.w3.org/2000/svg',
        'xmlns:html': 'http://www.w3.org/1999/xhtml',
        'xmlns:xlink': 'http://www.w3.org/1999/xlink',
        'version': '1.1',
        'class': 'blocklySvg'
    }, null);
    /*
     <defs>
     ... filters go here ...
     </defs>
     */
    var defs = Blockly.createSvgElement('defs', {}, svg);
    var filter, feSpecularLighting, feMerge, pattern;
    /*
     <filter id="blocklyEmboss">
     <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur"/>
     <feSpecularLighting in="blur" surfaceScale="1" specularConstant="0.5"
     specularExponent="10" lighting-color="white"
     result="specOut">
     <fePointLight x="-5000" y="-10000" z="20000"/>
     </feSpecularLighting>
     <feComposite in="specOut" in2="SourceAlpha" operator="in"
     result="specOut"/>
     <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic"
     k1="0" k2="1" k3="1" k4="0"/>
     </filter>
     */
    filter = Blockly.createSvgElement('filter', {'id': 'blocklyEmboss'}, defs);
    Blockly.createSvgElement('feGaussianBlur',
        {'in': 'SourceAlpha', 'stdDeviation': 1, 'result': 'blur'}, filter);
    feSpecularLighting = Blockly.createSvgElement('feSpecularLighting',
        {'in': 'blur', 'surfaceScale': 1, 'specularConstant': 0.5,
            'specularExponent': 10, 'lighting-color': 'white', 'result': 'specOut'},
        filter);
    Blockly.createSvgElement('fePointLight',
        {'x': -5000, 'y': -10000, 'z': 20000}, feSpecularLighting);
    Blockly.createSvgElement('feComposite',
        {'in': 'specOut', 'in2': 'SourceAlpha', 'operator': 'in',
            'result': 'specOut'}, filter);
    Blockly.createSvgElement('feComposite',
        {'in': 'SourceGraphic', 'in2': 'specOut', 'operator': 'arithmetic',
            'k1': 0, 'k2': 1, 'k3': 1, 'k4': 0}, filter);
    /*
     <filter id="blocklyTrashcanShadowFilter">
     <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur"/>
     <feOffset in="blur" dx="1" dy="1" result="offsetBlur"/>
     <feMerge>
     <feMergeNode in="offsetBlur"/>
     <feMergeNode in="SourceGraphic"/>
     </feMerge>
     </filter>
     */
    filter = Blockly.createSvgElement('filter',
        {'id': 'blocklyTrashcanShadowFilter'}, defs);
    Blockly.createSvgElement('feGaussianBlur',
        {'in': 'SourceAlpha', 'stdDeviation': 2, 'result': 'blur'}, filter);
    Blockly.createSvgElement('feOffset',
        {'in': 'blur', 'dx': 1, 'dy': 1, 'result': 'offsetBlur'}, filter);
    feMerge = Blockly.createSvgElement('feMerge', {}, filter);
    Blockly.createSvgElement('feMergeNode', {'in': 'offsetBlur'}, feMerge);
    Blockly.createSvgElement('feMergeNode', {'in': 'SourceGraphic'}, feMerge);
    /*
     <filter id="blocklyShadowFilter">
     <feGaussianBlur stdDeviation="2"/>
     </filter>
     */
    filter = Blockly.createSvgElement('filter',
        {'id': 'blocklyShadowFilter'}, defs);
    Blockly.createSvgElement('feGaussianBlur', {'stdDeviation': 2}, filter);
    /*
     <pattern id="blocklyDisabledPattern" patternUnits="userSpaceOnUse"
     width="10" height="10">
     <rect width="10" height="10" fill="#aaa" />
     <path d="M 0 0 L 10 10 M 10 0 L 0 10" stroke="#cc0" />
     </pattern>
     */
    pattern = Blockly.createSvgElement('pattern',
        {'id': 'blocklyDisabledPattern', 'patternUnits': 'userSpaceOnUse',
            'width': 10, 'height': 10}, defs);
    Blockly.createSvgElement('rect',
        {'width': 10, 'height': 10, 'fill': '#aaa'}, pattern);
    Blockly.createSvgElement('path',
        {'d': 'M 0 0 L 10 10 M 10 0 L 0 10', 'stroke': '#cc0'}, pattern);
    Blockly.mainWorkspace = new Blockly.Workspace(
        Blockly.getMainWorkspaceMetrics_,
        Blockly.setMainWorkspaceMetrics_);
    svg.appendChild(Blockly.mainWorkspace.createDom());
    Blockly.mainWorkspace.maxBlocks = Blockly.maxBlocks;

    if (!Blockly.readOnly) {
        /**
         * @type {!Blockly.Flyout}
         * @private
         */
        Blockly.mainWorkspace.flyout_ = new Blockly.Flyout();
        var flyout = Blockly.mainWorkspace.flyout_;
        var flyoutSvg = flyout.createDom();
        flyout.init(Blockly.mainWorkspace, true);
        flyout.autoClose = false;
        // Insert the flyout behind the workspace so that blocks appear on top.
        domConstruct.create(flyoutSvg, null, Blockly.mainWorkspace.svgGroup_, 'before');

        var workspaceChanged = function () {
            if (Blockly.Block.dragMode_ == 0) {
                var metrics = Blockly.mainWorkspace.getMetrics();
                if (metrics.contentTop < 0 ||
                    metrics.contentTop + metrics.contentHeight >
                    metrics.viewHeight + metrics.viewTop ||
                    metrics.contentLeft < (Blockly.RTL ? metrics.viewLeft : 0) ||
                    metrics.contentLeft + metrics.contentWidth >
                    metrics.viewWidth + (Blockly.RTL ? 2 : 1) * metrics.viewLeft) {
                    // One or more blocks is out of bounds.  Bump them back in.
                    var MARGIN = 25;
                    var blocks = Blockly.mainWorkspace.getTopBlocks(false);
                    for (var b = 0, block; block = blocks[b]; b++) {
                        var blockXY = block.getRelativeToSurfaceXY();
                        var blockHW = block.getHeightWidth();
                        // Bump any block that's above the top back inside.
                        var overflow = metrics.viewTop + MARGIN - blockHW.height - blockXY.y;
                        if (overflow > 0) {
                            block.moveBy(0, overflow);
                        }
                        // Bump any block that's below the bottom back inside.
                        var overflow = metrics.viewTop + metrics.viewHeight - MARGIN - blockXY.y;
                        if (overflow < 0) {
                            block.moveBy(0, overflow);
                        }
                        // Bump any block that's off the left back inside.
                        var overflow = MARGIN + metrics.viewLeft - blockXY.x - (Blockly.RTL ? 0 : blockHW.width);
                        if (overflow > 0) {
                            block.moveBy(overflow, 0);
                        }
                        // Bump any block that's off the right back inside.
                        var overflow = metrics.viewLeft + metrics.viewWidth - MARGIN - blockXY.x + (Blockly.RTL ? blockHW.width : 0);
                        if (overflow < 0) {
                            block.moveBy(overflow, 0);
                        }
                        // Delete any block that's sitting on top of the flyout.
                        // TODO: Why??????
                        // We've removed the toolbox in this version, so that's why (I think!)
//                        if (block.isDeletable() && (Blockly.RTL ? blockXY.x - 2 * metrics.viewLeft - metrics.viewWidth : -blockXY.x) > MARGIN * 2) {
//                            block.dispose(false, true);
//                        }
                    }
                }
            }
        };
        Blockly.addChangeListener(workspaceChanged);
    }

    svg.appendChild(Blockly.Tooltip.createDom());

    // The SVG is now fully assembled.  Add it to the container.
    container.appendChild(svg);
    Blockly.svg = svg;
    Blockly.svgResize();

    // Create an HTML container for popup overlays (e.g. editor widgets).
//    Blockly.WidgetDiv.DIV = domConstruct.create('div', {id: 'blocklyWidgetDiv' });

//    Blockly.WidgetDiv.DIV.style.direction = Blockly.RTL ? 'rtl' : 'ltr';
//    document.body.appendChild(Blockly.WidgetDiv.DIV);
};


/**
 * Initialize Blockly with various handlers.
 * @private
 */
Blockly.init_ = function () {
    // Bind events for scrolling the workspace.
    // Most of these events should be bound to the SVG's surface.
    // However, 'mouseup' has to be on the whole document so that a block dragged
    // out of bounds and released will know that it has been released.
    // Also, 'keydown' has to be on the whole document since the browser doesn't
    // understand a concept of focus on the SVG image.
    Blockly.bindEvent_(Blockly.svg, 'mousedown', null, Blockly.onMouseDown_);
    Blockly.bindEvent_(Blockly.svg, 'mousemove', null, Blockly.onMouseMove_);
//    Blockly.bindEvent_(Blockly.svg, 'contextmenu', null, Blockly.onContextMenu_);
//    Blockly.bindEvent_(Blockly.WidgetDiv.DIV, 'contextmenu', null, Blockly.onContextMenu_);
//    Blockly.bindEvent_(Blockly.DIV, 'contextmenu', null, Blockly.onContextMenu_);

    if (!Blockly.documentEventsBound_) {
        // Only bind the window/document events once.
        // Destroying and reinjecting Blockly should not bind again.
        Blockly.bindEvent_(window, 'resize', document, Blockly.svgResize);
        Blockly.bindEvent_(document, 'keydown', null, Blockly.onKeyDown_);
        // Don't use bindEvent_ for document's mouseup isce that would create a
        // corresponding touch handler that would squeltch the ability to interact
        // with non-Blockly elements.
        document.addEventListener('mouseup', Blockly.onMouseUp_, false);
        // Some iPad versions don't fire resize after portrait to landscape change.
   //     if (Ext.is.Tablet) {
   //         Blockly.bindEvent_(window, 'orientationchange', document, function () {
   //             Blockly.fireUiEvent(window, 'resize');
   //         });
   //     }
        Blockly.documentEventsBound_ = true;
    }

    if (Blockly.languageTree) {
        // Build a fixed flyout with the root blocks.
        Blockly.mainWorkspace.flyout_.init(Blockly.mainWorkspace, true);
        Blockly.mainWorkspace.flyout_.show(Blockly.languageTree.childNodes);
        // Translate the workspace sideways to avoid the fixed flyout.
        Blockly.mainWorkspace.scrollX = Blockly.mainWorkspace.flyout_.width_;
        var translation = 'translate(' + Blockly.mainWorkspace.scrollX + ', 0)';
        Blockly.mainWorkspace.getCanvas().setAttribute('transform', translation);
        Blockly.mainWorkspace.getBubbleCanvas().setAttribute('transform', translation);

    }
    if (Blockly.hasScrollbars) {
        Blockly.mainWorkspace.scrollbar = new Blockly.ScrollbarPair(Blockly.mainWorkspace);
        Blockly.mainWorkspace.scrollbar.resize();
    }

    Blockly.mainWorkspace.addTrashcan();

    // Load the sounds.
    Blockly.loadAudio_(['media/click.mp3', 'media/click.wav', 'media/click.ogg'], 'click');
    Blockly.loadAudio_(['media/delete.mp3', 'media/delete.ogg', 'media/delete.wav'], 'delete');
};

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
 * @fileoverview Object representing an input (value, statement, or dummy).
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';


/**
 * Class for an input with an optional field.
 * @param {number} type The type of the input.
 * @param {string} name Language-neutral identifier which may used to find this
 *     input again.
 * @param {!Blockly.Block} block The block containing this input.
 * @param {Blockly.Connection} connection Optional connection for this input.
 * @constructor
 */
Blockly.Input = function (type, name, block, connection) {
    this.type = type;
    this.name = name;
    this.sourceBlock_ = block;
    this.connection = connection;
    this.fieldRow = [];
    this.align = Blockly.ALIGN_LEFT;

    this.visible_ = true;
};

/**
 * Add an item to the end of the input's field row.
 * @param {string|!Blockly.Field} field Something to add as a field.
 * @param {string} opt_name Language-neutral identifier which may used to find
 *     this field again.  Should be unique to the host block.
 * @return {!Blockly.Input} The input being append to (to allow chaining).
 */
Blockly.Input.prototype.appendField = function (field, opt_name) {
    // Empty string, Null or undefined generates no field, unless field is named.
    if (!field && !opt_name) {
        return this;
    }
    // Generate a FieldLabel when given a plain text field.
    if (typeof field  == "string") {
        field = new Blockly.FieldLabel(/** @type {string} */ (field));
    }
    if (this.sourceBlock_.svg_) {
        field.init(this.sourceBlock_);
    }
    field.name = opt_name;

    if (field.prefixField) {
        // Add any prefix.
        this.appendField(field.prefixField);
    }
    // Add the field to the field row.
    this.fieldRow.push(field);
    if (field.suffixField) {
        // Add any suffix.
        this.appendField(field.suffixField);
    }

    if (this.sourceBlock_.rendered) {
        this.sourceBlock_.render();
        // Adding a field will cause the block to change shape.
        this.sourceBlock_.bumpNeighbours_();
    }
    return this;
};

/**
 * Add an item to the end of the input's field row.
 * @param {*} field Something to add as a field.
 * @param {string} opt_name Language-neutral identifier which may used to find
 *     this field again.  Should be unique to the host block.
 * @return {!Blockly.Input} The input being append to (to allow chaining).
 * @deprecated December 2013
 */
Blockly.Input.prototype.appendTitle = function (field, opt_name) {
    console.log('Deprecated call to appendTitle, use appendField instead.');
    return this.appendField(field, opt_name);
};

/**
 * Remove a field from this input.
 * @param {string} name The name of the field.
 */
Blockly.Input.prototype.removeField = function (name) {
    for (var i = 0, field; field = this.fieldRow[i]; i++) {
        if (field.name === name) {
            field.dispose();
            this.fieldRow.splice(i, 1);
            if (this.sourceBlock_.rendered) {
                this.sourceBlock_.render();
                // Removing a field will cause the block to change shape.
                this.sourceBlock_.bumpNeighbours_();
            }
            return;
        }
    }
    console.log('Field "%s" not found.', name);
};

/**
 * Gets whether this input is visible or not.
 * @return {boolean} True if visible.
 */
Blockly.Input.prototype.isVisible = function () {
    return this.visible_;
};

/**
 * Sets whether this input is visible or not.
 * @param {boolean} visible True if visible.
 * @return {!Array.<!Blockly.Block>} List of blocks to render.
 */
Blockly.Input.prototype.setVisible = function (visible) {
    var renderList = [];
    if (this.visible_ == visible) {
        return renderList;
    }
    this.visible_ = visible;

    var display = visible ? 'block' : 'none';
    for (var y = 0, field; field = this.fieldRow[y]; y++) {
        field.setVisible(visible);
    }
    if (this.connection) {
        // Has a connection.
        if (visible) {
            renderList = this.connection.unhideAll();
        } else {
            this.connection.hideAll();
        }
        var child = this.connection.targetBlock();
        if (child) {
            child.svg_.getRootElement().style.display = display;
            if (!visible) {
                child.rendered = false;
            }
        }
    }
    return renderList;
};

/**
 * Change a connection's compatibility.
 * @param {string|Array.<string>|null} check Compatible value type or
 *     list of value types.  Null if all types are compatible.
 * @return {!Blockly.Input} The input being modified (to allow chaining).
 */
Blockly.Input.prototype.setCheck = function (check) {
    if (!this.connection) {
        throw 'This input does not have a connection.';
    }
    this.connection.setCheck(check);
    return this;
};

/**
 * Change the alignment of the connection's field(s).
 * @param {number} align One of Blockly.ALIGN_LEFT, ALIGN_CENTRE, ALIGN_RIGHT.
 *   In RTL mode directions are reversed, and ALIGN_RIGHT aligns to the left.
 * @return {!Blockly.Input} The input being modified (to allow chaining).
 */
Blockly.Input.prototype.setAlign = function (align) {
    this.align = align;
    if (this.sourceBlock_.rendered) {
        this.sourceBlock_.render();
    }
    return this;
};

/**
 * Initialize the fields on this input.
 */
Blockly.Input.prototype.init = function () {
    for (var x = 0; x < this.fieldRow.length; x++) {
        this.fieldRow[x].init(this.sourceBlock_);
    }
};

/**
 * Sever all links to this input.
 */
Blockly.Input.prototype.dispose = function () {
    for (var i = 0, field; field = this.fieldRow[i]; i++) {
        field.dispose();
    }
    if (this.connection) {
        this.connection.dispose();
    }
    this.sourceBlock_ = null;
};

/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2013 Google Inc.
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
 * @fileoverview Core JavaScript library for Blockly.
 * @author scr@google.com (Sheridan Rawlins)
 */
'use strict';

/**
 * Name space for the Msg singleton.
 * Msg gets populated in the message files.
 */
Blockly.Msg = {};

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
 * @fileoverview Object representing a mutator dialog.  A mutator allows the
 * user to change the shape of a block using a nested blocks editor.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';


/**
 * Class for a mutator dialog.
 * @param {!Array.<string>} quarkNames List of names of sub-blocks for flyout.
 * @extends {Blockly.Icon}
 * @constructor
 */
Blockly.Mutator = function (quarkNames) {
    Blockly.Mutator.superClass_.constructor.call(this, null);
    this.quarkXml_ = [];
    // Convert the list of names into a list of XML objects for the flyout.
    for (var x = 0; x < quarkNames.length; x++) {
        var element = domConstruct.create('block', {'type': quarkNames[x]});
        this.quarkXml_[x] = element;
    }
};
Blockly.inherits(Blockly.Mutator, Blockly.Icon);

/**
 * Width of workspace.
 * @private
 */
Blockly.Mutator.prototype.workspaceWidth_ = 0;

/**
 * Height of workspace.
 * @private
 */
Blockly.Mutator.prototype.workspaceHeight_ = 0;

/**
 * Create the icon on the block.
 */
Blockly.Mutator.prototype.createIcon = function () {
    Blockly.Icon.prototype.createIcon_.call(this);
    /* Here's the markup that will be generated:
     <rect class="blocklyIconShield" width="16" height="16" rx="4" ry="4"/>
     <text class="blocklyIconMark" x="8" y="12">★</text>
     */
    var quantum = Blockly.Icon.RADIUS / 2;
    var iconShield = Blockly.createSvgElement('rect',
        {'class': 'blocklyIconShield',
            'width': 4 * quantum,
            'height': 4 * quantum,
            'rx': quantum,
            'ry': quantum}, this.iconGroup_);
    this.iconMark_ = Blockly.createSvgElement('text',
        {'class': 'blocklyIconMark',
            'x': Blockly.Icon.RADIUS,
            'y': 2 * Blockly.Icon.RADIUS - 4}, this.iconGroup_);
    this.iconMark_.appendChild(document.createTextNode('\u2699'));
};

/**
 * Clicking on the icon toggles if the mutator bubble is visible.
 * Disable if block is uneditable.
 * @param {!Event} e Mouse click event.
 * @private
 * @override
 */
Blockly.Mutator.prototype.iconClick_ = function (e) {
    if (this.block_.isEditable()) {
        Blockly.Icon.prototype.iconClick_.call(this, e);
    }
};

/**
 * Create the editor for the mutator's bubble.
 * @return {!Element} The top-level node of the editor.
 * @private
 */
Blockly.Mutator.prototype.createEditor_ = function () {
    /* Create the editor.  Here's the markup that will be generated:
     <svg>
     <rect class="blocklyMutatorBackground" />
     [Flyout]
     [Workspace]
     </svg>
     */
    this.svgDialog_ = Blockly.createSvgElement('svg',
        {'x': Blockly.Bubble.BORDER_WIDTH, 'y': Blockly.Bubble.BORDER_WIDTH},
        null);
    Blockly.createSvgElement('rect',
        {'class': 'blocklyMutatorBackground',
            'height': '100%', 'width': '100%'}, this.svgDialog_);
    var mutator = this;
    this.workspace_ = new Blockly.Workspace(
        function () {
            return mutator.getFlyoutMetrics_();
        }, null);
    this.flyout_ = new Blockly.Flyout();
    this.flyout_.autoClose = false;
    this.svgDialog_.appendChild(this.flyout_.createDom());
    this.svgDialog_.appendChild(this.workspace_.createDom());
    return this.svgDialog_;
};

/**
 * Add or remove the UI indicating if this icon may be clicked or not.
 */
Blockly.Mutator.prototype.updateEditable = function () {
    if (this.block_.isEditable()) {
        // Default behaviour for an icon.
        Blockly.Icon.prototype.updateEditable.call(this);
    } else {
        // Close any mutator bubble.  Icon is not clickable.
        this.setVisible(false);
        Blockly.removeClass_(/** @type {!Element} */ (this.iconGroup_),
            'blocklyIconGroup');
    }
};

/**
 * Callback function triggered when the bubble has resized.
 * Resize the workspace accordingly.
 * @private
 */
Blockly.Mutator.prototype.resizeBubble_ = function () {
    var doubleBorderWidth = 2 * Blockly.Bubble.BORDER_WIDTH;
    var workspaceSize = this.workspace_.getCanvas().getBBox();
    var flyoutMetrics = this.flyout_.getMetrics_();
    var width;
    if (Blockly.RTL) {
        width = -workspaceSize.x;
    } else {
        width = workspaceSize.width + workspaceSize.x;
    }
    var height = Math.max(workspaceSize.height + doubleBorderWidth * 3,
            flyoutMetrics.contentHeight + 20);
    width += doubleBorderWidth * 3;
    // Only resize if the size difference is significant.  Eliminates shuddering.
    if (Math.abs(this.workspaceWidth_ - width) > doubleBorderWidth ||
        Math.abs(this.workspaceHeight_ - height) > doubleBorderWidth) {
        // Record some layout information for getFlyoutMetrics_.
        this.workspaceWidth_ = width;
        this.workspaceHeight_ = height;
        // Resize the bubble.
        this.bubble_.setBubbleSize(width + doubleBorderWidth,
                height + doubleBorderWidth);
        this.svgDialog_.setAttribute('width', this.workspaceWidth_);
        this.svgDialog_.setAttribute('height', this.workspaceHeight_);
    }

    if (Blockly.RTL) {
        // Scroll the workspace to always left-align.
        var translation = 'translate(' + this.workspaceWidth_ + ',0)';
        this.workspace_.getCanvas().setAttribute('transform', translation);
    }
};

/**
 * Show or hide the mutator bubble.
 * @param {boolean} visible True if the bubble should be visible.
 */
Blockly.Mutator.prototype.setVisible = function (visible) {
    if (visible == this.isVisible()) {
        // No change.
        return;
    }
    if (visible) {
        // Create the bubble.
        this.bubble_ = new Blockly.Bubble(this.block_.workspace,
            this.createEditor_(), this.block_.svg_.svgGroup_,
            this.iconX_, this.iconY_, null, null);
        var thisObj = this;
        this.flyout_.init(this.workspace_, false);
        this.flyout_.show(this.quarkXml_);

        this.rootBlock_ = this.block_.decompose(this.workspace_);
        var blocks = this.rootBlock_.getDescendants();
        for (var i = 0, child; child = blocks[i]; i++) {
            child.render();
        }
        // The root block should not be dragable or deletable.
        this.rootBlock_.setMovable(false);
        this.rootBlock_.setDeletable(false);
        var margin = this.flyout_.CORNER_RADIUS * 2;
        var x = this.flyout_.width_ + margin;
        if (Blockly.RTL) {
            x = -x;
        }
        this.rootBlock_.moveBy(x, margin);
        // Save the initial connections, then listen for further changes.
        if (this.block_.saveConnections) {
            this.block_.saveConnections(this.rootBlock_);
            this.sourceListener_ = Blockly.bindEvent_(
                this.block_.workspace.getCanvas(),
                'blocklyWorkspaceChange', this.block_,
                function () {
                    thisObj.block_.saveConnections(thisObj.rootBlock_)
                });
        }
        this.resizeBubble_();
        // When the mutator's workspace changes, update the source block.
        Blockly.bindEvent_(this.workspace_.getCanvas(), 'blocklyWorkspaceChange',
            this.block_, function () {
                thisObj.workspaceChanged_();
            });
        this.updateColour();
    } else {
        // Dispose of the bubble.
        this.svgDialog_ = null;
        this.flyout_.dispose();
        this.flyout_ = null;
        this.workspace_.dispose();
        this.workspace_ = null;
        this.rootBlock_ = null;
        this.bubble_.dispose();
        this.bubble_ = null;
        this.workspaceWidth_ = 0;
        this.workspaceHeight_ = 0;
        if (this.sourceListener_) {
            Blockly.unbindEvent_(this.sourceListener_);
            this.sourceListener_ = null;
        }
    }
};

/**
 * Update the source block when the mutator's blocks are changed.
 * Delete or bump any block that's out of bounds.
 * Fired whenever a change is made to the mutator's workspace.
 * @private
 */
Blockly.Mutator.prototype.workspaceChanged_ = function () {
    if (Blockly.Block.dragMode_ == 0) {
        var blocks = this.workspace_.getTopBlocks(false);
        var MARGIN = 20;
        for (var b = 0, block; block = blocks[b]; b++) {
            var blockXY = block.getRelativeToSurfaceXY();
            var blockHW = block.getHeightWidth();
            if (Blockly.RTL ? blockXY.x > -this.flyout_.width_ + MARGIN :
                blockXY.x < this.flyout_.width_ - MARGIN) {
                // Delete any block that's sitting on top of the flyout.
                block.dispose(false, true);
            } else if (blockXY.y + blockHW.height < MARGIN) {
                // Bump any block that's above the top back inside.
                block.moveBy(0, MARGIN - blockHW.height - blockXY.y);
            }
        }
    }

    // When the mutator's workspace changes, update the source block.
    if (this.rootBlock_.workspace == this.workspace_) {
        // Switch off rendering while the source block is rebuilt.
        var savedRendered = this.block_.rendered;
        this.block_.rendered = false;
        // Allow the source block to rebuild itself.
        this.block_.compose(this.rootBlock_);
        // Restore rendering and show the changes.
        this.block_.rendered = savedRendered;
        if (this.block_.rendered) {
            this.block_.render();
        }
        this.resizeBubble_();
        // The source block may have changed, notify its workspace.
        this.block_.workspace.fireChangeEvent();
    }
};

/**
 * Return an object with all the metrics required to size scrollbars for the
 * mutator flyout.  The following properties are computed:
 * .viewHeight: Height of the visible rectangle,
 * .absoluteTop: Top-edge of view.
 * .absoluteLeft: Left-edge of view.
 * @return {!Object} Contains size and position metrics of mutator dialog's
 *     workspace.
 * @private
 */
Blockly.Mutator.prototype.getFlyoutMetrics_ = function () {
    var left = 0;
    if (Blockly.RTL) {
        left += this.workspaceWidth_;
    }
    return {
        viewHeight: this.workspaceHeight_,
        viewWidth: 0,  // This seem wrong, but results in correct RTL layout.
        absoluteTop: 0,
        absoluteLeft: left
    };
};

/**
 * Dispose of this mutator.
 */
Blockly.Mutator.prototype.dispose = function () {
    this.block_.mutator = null;
    Blockly.Icon.prototype.dispose.call(this);
};

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
 * @fileoverview Utility functions for handling variables and procedure names.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';


/**
 * Class for a database of entity names (variables, functions, etc).
 * @param {string} reservedWords A comma-separated string of words that are
 *     illegal for use as names in a language (e.g. 'new,if,this,...').
 * @constructor
 */
Blockly.Names = function (reservedWords) {
    this.reservedDict_ = Object.create(null);
    if (reservedWords) {
        var splitWords = reservedWords.split(',');
        for (var x = 0; x < splitWords.length; x++) {
            this.reservedDict_[splitWords[x]] = true;
        }
    }
    this.reset();
};

/**
 * When JavaScript (or most other languages) is generated, variable 'foo' and
 * procedure 'foo' would collide.  However, Blockly has no such problems since
 * variable get 'foo' and procedure call 'foo' are unambiguous.
 * Therefore, Blockly keeps a separate type name to disambiguate.
 * getName('foo', 'variable') -> 'foo'
 * getName('foo', 'procedure') -> 'foo2'
 */

/**
 * Empty the database and start from scratch.  The reserved words are kept.
 */
Blockly.Names.prototype.reset = function () {
    this.db_ = Object.create(null);
    this.dbReverse_ = Object.create(null);
};

/**
 * Convert a Blockly entity name to a legal exportable entity name.
 * @param {string} name The Blockly entity name (no constraints).
 * @param {string} type The type of entity in Blockly
 *     ('VARIABLE', 'PROCEDURE', 'BUILTIN', etc...).
 * @return {string} An entity name legal for the exported language.
 */
Blockly.Names.prototype.getName = function (name, type) {
    var normalized = name.toLowerCase() + '_' + type;
    if (normalized in this.db_) {
        return this.db_[normalized];
    }
    var safeName = this.getDistinctName(name, type);
    this.db_[normalized] = safeName;
    return safeName;
};

/**
 * Convert a Blockly entity name to a legal exportable entity name.
 * Ensure that this is a new name not overlapping any previously defined name.
 * Also check against list of reserved words for the current language and
 * ensure name doesn't collide.
 * @param {string} name The Blockly entity name (no constraints).
 * @param {string} type The type of entity in Blockly
 *     ('VARIABLE', 'PROCEDURE', 'BUILTIN', etc...).
 * @return {string} An entity name legal for the exported language.
 */
Blockly.Names.prototype.getDistinctName = function (name, type) {
    var safeName = this.safeName_(name);
    var i = '';
    while (this.dbReverse_[safeName + i] ||
        (safeName + i) in this.reservedDict_) {
        // Collision with existing name.  Create a unique name.
        i = i ? i + 1 : 2;
    }
    safeName += i;
    this.dbReverse_[safeName] = true;
    return safeName;
};

/**
 * Given a proposed entity name, generate a name that conforms to the
 * [_A-Za-z][_A-Za-z0-9]* format that most languages consider legal for
 * variables.
 * @param {string} name Potentially illegal entity name.
 * @return {string} Safe entity name.
 * @private
 */
Blockly.Names.prototype.safeName_ = function (name) {
    if (!name) {
        name = 'unnamed';
    } else {
        // Unfortunately names in non-latin characters will look like
        // _E9_9F_B3_E4_B9_90 which is pretty meaningless.
        name = encodeURI(name.replace(/ /g, '_')).replace(/[^\w]/g, '_');
        // Most languages don't allow names with leading numbers.
        if ('0123456789'.indexOf(name[0]) != -1) {
            name = 'my_' + name;
        }
    }
    return name;
};

/**
 * Do the given two entity names refer to the same entity?
 * Blockly names are case-insensitive.
 * @param {string} name1 First name.
 * @param {string} name2 Second name.
 * @return {boolean} True if names are the same.
 */
Blockly.Names.equals = function (name1, name2) {
    if(name1 == null || name2 == null)
        return false;
    return name1.toLowerCase() == name2.toLowerCase();
};

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
 * @fileoverview Utility functions for handling procedures.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

Blockly.Procedures = {};

/**
 * Category to separate procedure names from variables and generated functions.
 */
Blockly.Procedures.NAME_TYPE = 'PROCEDURE';

/**
 * Find all user-created procedure definitions.
 * @return {!Array.<!Array.<!Array>>} Pair of arrays, the
 *     first contains procedures without return variables, the second with.
 *     Each procedure is defined by a three-element list of name, parameter
 *     list, and return value boolean.
 */
Blockly.Procedures.allProcedures = function () {
    var blocks = Blockly.mainWorkspace.getAllBlocks();
    var proceduresReturn = [];
    var proceduresNoReturn = [];
    for (var x = 0; x < blocks.length; x++) {
        var func = blocks[x].getProcedureDef;
        if (func) {
            var tuple = func.call(blocks[x]);
            if (tuple) {
                if (tuple[2]) {
                    proceduresReturn.push(tuple);
                } else {
                    proceduresNoReturn.push(tuple);
                }
            }
        }
    }

    proceduresNoReturn.sort(Blockly.Procedures.procTupleComparator_);
    proceduresReturn.sort(Blockly.Procedures.procTupleComparator_);
    return [proceduresNoReturn, proceduresReturn];
};

/**
 * Comparison function for case-insensitive sorting of the first element of
 * a tuple.
 * @param {!Array} ta First tuple.
 * @param {!Array} tb Second tuple.
 * @return {number} -1, 0, or 1 to signify greater than, equality, or less than.
 * @private
 */
Blockly.Procedures.procTupleComparator_ = function (ta, tb) {
    var a = ta[0].toLowerCase();
    var b = tb[0].toLowerCase();
    if (a > b) {
        return 1;
    }
    if (a < b) {
        return -1;
    }
    return 0;
};

/**
 * Ensure two identically-named procedures don't exist.
 * @param {string} name Proposed procedure name.
 * @param {!Blockly.Block} block Block to disambiguate.
 * @return {string} Non-colliding name.
 */
Blockly.Procedures.findLegalName = function (name, block) {
    if (block.isInFlyout) {
        // Flyouts can have multiple procedures called 'procedure'.
        return name;
    }
    while (!Blockly.Procedures.isLegalName(name, block.workspace, block)) {
        // Collision with another procedure.
        var r = name.match(/^(.*?)(\d+)$/);
        if (!r) {
            name += '2';
        } else {
            name = r[1] + (parseInt(r[2], 10) + 1);
        }
    }
    return name;
};

/**
 * Does this procedure have a legal name?  Illegal names include names of
 * procedures already defined.
 * @param {string} name The questionable name.
 * @param {!Blockly.Workspace} workspace The workspace to scan for collisions.
 * @param {Blockly.Block} opt_exclude Optional block to exclude from
 *     comparisons (one doesn't want to collide with oneself).
 * @return {boolean} True if the name is legal.
 */
Blockly.Procedures.isLegalName = function (name, workspace, opt_exclude) {
    var blocks = workspace.getAllBlocks();
    // Iterate through every block and check the name.
    for (var x = 0; x < blocks.length; x++) {
        if (blocks[x] == opt_exclude) {
            continue;
        }
        var func = blocks[x].getProcedureDef;
        if (func) {
            var procName = func.call(blocks[x]);
            if (Blockly.Names.equals(procName[0], name)) {
                return false;
            }
        }
    }
    return true;
};

/**
 * Rename a procedure.  Called by the editable field.
 * @param {string} text The proposed new name.
 * @return {string} The accepted name.
 * @this {!Blockly.FieldVariable}
 */
Blockly.Procedures.rename = function (text) {
    // Strip leading and trailing whitespace.  Beyond this, all names are legal.
    text = text.replace(/^[\s\xa0]+|[\s\xa0]+$/g, '');

    // Ensure two identically-named procedures don't exist.
    text = Blockly.Procedures.findLegalName(text, this.sourceBlock_);
    // Rename any callers.
    var blocks = this.sourceBlock_.workspace.getAllBlocks();
    for (var x = 0; x < blocks.length; x++) {
        var func = blocks[x].renameProcedure;
        if (func) {
            func.call(blocks[x], this.text_, text);
        }
    }
    return text;
};

/**
 * Construct the blocks required by the flyout for the procedure category.
 * @param {!Array.<!Blockly.Block>} blocks List of blocks to show.
 * @param {!Array.<number>} gaps List of widths between blocks.
 * @param {number} margin Standard margin width for calculating gaps.
 * @param {!Blockly.Workspace} workspace The flyout's workspace.
 */
Blockly.Procedures.flyoutCategory = function (blocks, gaps, margin, workspace) {
    if (Blockly.Blocks['procedures_defnoreturn']) {
        var block = Blockly.Block.obtain(workspace, 'procedures_defnoreturn');
        block.initSvg();
        blocks.push(block);
        gaps.push(margin * 2);
    }
    if (Blockly.Blocks['procedures_defreturn']) {
        var block = Blockly.Block.obtain(workspace, 'procedures_defreturn');
        block.initSvg();
        blocks.push(block);
        gaps.push(margin * 2);
    }
    if (Blockly.Blocks['procedures_ifreturn']) {
        var block = Blockly.Block.obtain(workspace, 'procedures_ifreturn');
        block.initSvg();
        blocks.push(block);
        gaps.push(margin * 2);
    }
    if (gaps.length) {
        // Add slightly larger gap between system blocks and user calls.
        gaps[gaps.length - 1] = margin * 3;
    }

    function populateProcedures(procedureList, templateName) {
        for (var x = 0; x < procedureList.length; x++) {
            var block = Blockly.Block.obtain(workspace, templateName);
            block.setFieldValue(procedureList[x][0], 'NAME');
            var tempIds = [];
            for (var t = 0; t < procedureList[x][1].length; t++) {
                tempIds[t] = 'ARG' + t;
            }
            block.setProcedureParameters(procedureList[x][1], tempIds);
            block.initSvg();
            blocks.push(block);
            gaps.push(margin * 2);
        }
    }

    var tuple = Blockly.Procedures.allProcedures();
    populateProcedures(tuple[0], 'procedures_callnoreturn');
    populateProcedures(tuple[1], 'procedures_callreturn');
};

/**
 * Find all the callers of a named procedure.
 * @param {string} name Name of procedure.
 * @param {!Blockly.Workspace} workspace The workspace to find callers in.
 * @return {!Array.<!Blockly.Block>} Array of caller blocks.
 */
Blockly.Procedures.getCallers = function (name, workspace) {
    var callers = [];
    var blocks = workspace.getAllBlocks();
    // Iterate through every block and check the name.
    for (var x = 0; x < blocks.length; x++) {
        var func = blocks[x].getProcedureCall;
        if (func) {
            var procName = func.call(blocks[x]);
            // Procedure name may be null if the block is only half-built.
            if (procName && Blockly.Names.equals(procName, name)) {
                callers.push(blocks[x]);
            }
        }
    }
    return callers;
};

/**
 * When a procedure definition is disposed of, find and dispose of all its
 *     callers.
 * @param {string} name Name of deleted procedure definition.
 * @param {!Blockly.Workspace} workspace The workspace to delete callers from.
 */
Blockly.Procedures.disposeCallers = function (name, workspace) {
    var callers = Blockly.Procedures.getCallers(name, workspace);
    for (var x = 0; x < callers.length; x++) {
        callers[x].dispose(true, false);
    }
};

/**
 * When a procedure definition changes its parameters, find and edit all its
 * callers.
 * @param {string} name Name of edited procedure definition.
 * @param {!Blockly.Workspace} workspace The workspace to delete callers from.
 * @param {!Array.<string>} paramNames Array of new parameter names.
 * @param {!Array.<string>} paramIds Array of unique parameter IDs.
 */
Blockly.Procedures.mutateCallers = function (name, workspace, paramNames, paramIds) {
    var callers = Blockly.Procedures.getCallers(name, workspace);
    for (var x = 0; x < callers.length; x++) {
        callers[x].setProcedureParameters(paramNames, paramIds);
    }
};

/**
 * Find the definition block for the named procedure.
 * @param {string} name Name of procedure.
 * @param {!Blockly.Workspace} workspace The workspace to search.
 * @return {Blockly.Block} The procedure definition block, or null not found.
 */
Blockly.Procedures.getDefinition = function (name, workspace) {
    var blocks = workspace.getAllBlocks();
    for (var x = 0; x < blocks.length; x++) {
        var func = blocks[x].getProcedureDef;
        if (func) {
            var tuple = func.call(blocks[x]);
            if (tuple && Blockly.Names.equals(tuple[0], name)) {
                return blocks[x];
            }
        }
    }
    return null;
};

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
 * @fileoverview Library for creating scrollbars.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';


/**
 * Class for a pair of scrollbars.  Horizontal and vertical.
 * @param {!Blockly.Workspace} workspace Workspace to bind the scrollbars to.
 * @constructor
 */
Blockly.ScrollbarPair = function (workspace) {
    this.workspace_ = workspace;
    this.oldHostMetrics_ = null;
    this.hScroll = new Blockly.Scrollbar(workspace, true, true);
    this.vScroll = new Blockly.Scrollbar(workspace, false, true);
    this.corner_ = Blockly.createSvgElement('rect',
        {'height': Blockly.Scrollbar.scrollbarThickness,
            'width': Blockly.Scrollbar.scrollbarThickness,
            'style': 'fill: #fff'}, null);
    Blockly.Scrollbar.insertAfter_(this.corner_, workspace.getBubbleCanvas());
};

/**
 * Dispose of this pair of scrollbars.
 * Unlink from all DOM elements to prevent memory leaks.
 */
Blockly.ScrollbarPair.prototype.dispose = function () {
    Blockly.unbindEvent_(this.onResizeWrapper_);
    this.onResizeWrapper_ = null;
    domConstruct.destroy(this.corner_);
    this.corner_ = null;
    this.workspace_ = null;
    this.oldHostMetrics_ = null;
    this.hScroll.dispose();
    this.hScroll = null;
    this.vScroll.dispose();
    this.vScroll = null;
};

/**
 * Recalculate both of the scrollbars' locations and lengths.
 * Also reposition the corner rectangle.
 */
Blockly.ScrollbarPair.prototype.resize = function () {
    // Look up the host metrics once, and use for both scrollbars.
    var hostMetrics = this.workspace_.getMetrics();
    if (!hostMetrics) {
        // Host element is likely not visible.
        return;
    }

    // Only change the scrollbars if there has been a change in metrics.
    var resizeH = false;
    var resizeV = false;
    if (!this.oldHostMetrics_ ||
        this.oldHostMetrics_.viewWidth != hostMetrics.viewWidth ||
        this.oldHostMetrics_.viewHeight != hostMetrics.viewHeight ||
        this.oldHostMetrics_.absoluteTop != hostMetrics.absoluteTop ||
        this.oldHostMetrics_.absoluteLeft != hostMetrics.absoluteLeft) {
        // The window has been resized or repositioned.
        resizeH = true;
        resizeV = true;
    } else {
        // Has the content been resized or moved?
        if (!this.oldHostMetrics_ ||
            this.oldHostMetrics_.contentWidth != hostMetrics.contentWidth ||
            this.oldHostMetrics_.viewLeft != hostMetrics.viewLeft ||
            this.oldHostMetrics_.contentLeft != hostMetrics.contentLeft) {
            resizeH = true;
        }
        if (!this.oldHostMetrics_ ||
            this.oldHostMetrics_.contentHeight != hostMetrics.contentHeight ||
            this.oldHostMetrics_.viewTop != hostMetrics.viewTop ||
            this.oldHostMetrics_.contentTop != hostMetrics.contentTop) {
            resizeV = true;
        }
    }
    if (resizeH) {
        this.hScroll.resize(hostMetrics);
    }
    if (resizeV) {
        this.vScroll.resize(hostMetrics);
    }

    // Reposition the corner square.
    if (!this.oldHostMetrics_ ||
        this.oldHostMetrics_.viewWidth != hostMetrics.viewWidth ||
        this.oldHostMetrics_.absoluteLeft != hostMetrics.absoluteLeft) {
        this.corner_.setAttribute('x', this.vScroll.xCoordinate);
    }
    if (!this.oldHostMetrics_ ||
        this.oldHostMetrics_.viewHeight != hostMetrics.viewHeight ||
        this.oldHostMetrics_.absoluteTop != hostMetrics.absoluteTop) {
        this.corner_.setAttribute('y', this.hScroll.yCoordinate);
    }

    // Cache the current metrics to potentially short-cut the next resize event.
    this.oldHostMetrics_ = hostMetrics;
};

/**
 * Set the sliders of both scrollbars to be at a certain position.
 * @param {number} x Horizontal scroll value.
 * @param {number} y Vertical scroll value.
 */
Blockly.ScrollbarPair.prototype.set = function (x, y) {
    /* HACK:
     Two scrollbars are about to have their sliders moved.  Moving a scrollbar
     will normally result in its onScroll function being called.  That function
     will update the contents.  At issue is what happens when two scrollbars are
     moved.  Calling onScroll twice may result in two rerenderings of the content
     and increase jerkiness during dragging.
     In the case of native scrollbars (currently used only by Firefox), onScroll
     is called as an event, which means two separate renderings of the content are
     performed.  However in the case of SVG scrollbars (currently used by all
     other browsers), onScroll is called as a function and the browser only
     rerenders the contents once at the end of the thread.
     */
    if (Blockly.Scrollbar === Blockly.ScrollbarNative) {
        // Native scrollbar mode.
        // Set both scrollbars and suppress their two separate onScroll events.
        this.hScroll.set(x, false);
        this.vScroll.set(y, false);
        // Redraw the surface once with the new settings for both scrollbars.
        var xyRatio = {};
        xyRatio.x = (this.hScroll.outerDiv_.scrollLeft /
            this.hScroll.innerImg_.offsetWidth) || 0;
        xyRatio.y = (this.vScroll.outerDiv_.scrollTop /
            this.vScroll.innerImg_.offsetHeight) || 0;
        this.workspace_.setMetrics(xyRatio);
    } else {
        // SVG scrollbars.
        // Set both scrollbars and allow each to call a separate onScroll execution.
        this.hScroll.set(x, true);
        this.vScroll.set(y, true);
    }
};

// --------------------------------------------------------------------

/**
 * Class for a pure SVG scrollbar.
 * This technique offers a scrollbar that is guaranteed to work, but may not
 * look or behave like the system's scrollbars.
 * @param {!Blockly.Workspace} workspace Workspace to bind the scrollbar to.
 * @param {boolean} horizontal True if horizontal, false if vertical.
 * @param {boolean} opt_pair True if the scrollbar is part of a horiz/vert pair.
 * @constructor
 */
Blockly.Scrollbar = function (workspace, horizontal, opt_pair) {
    this.workspace_ = workspace;
    this.pair_ = opt_pair || false;
    this.horizontal_ = horizontal;

    this.createDom_();

    if (horizontal) {
        this.svgBackground_.setAttribute('height',
            Blockly.Scrollbar.scrollbarThickness);
        this.svgKnob_.setAttribute('height',
                Blockly.Scrollbar.scrollbarThickness - 6);
        this.svgKnob_.setAttribute('y', 3);
    } else {
        this.svgBackground_.setAttribute('width',
            Blockly.Scrollbar.scrollbarThickness);
        this.svgKnob_.setAttribute('width',
                Blockly.Scrollbar.scrollbarThickness - 6);
        this.svgKnob_.setAttribute('x', 3);
    }
    var scrollbar = this;
    this.onMouseDownBarWrapper_ = Blockly.bindEvent_(this.svgBackground_,
        'mousedown', scrollbar, scrollbar.onMouseDownBar_);
    this.onMouseDownKnobWrapper_ = Blockly.bindEvent_(this.svgKnob_,
        'mousedown', scrollbar, scrollbar.onMouseDownKnob_);
};

/**
 * Width of vertical scrollbar or height of horizontal scrollbar.
 */
Blockly.Scrollbar.scrollbarThickness = 15;

/**
 * Dispose of this scrollbar.
 * Unlink from all DOM elements to prevent memory leaks.
 */
Blockly.Scrollbar.prototype.dispose = function () {
    this.onMouseUpKnob_();
    if (this.onResizeWrapper_) {
        Blockly.unbindEvent_(this.onResizeWrapper_);
        this.onResizeWrapper_ = null;
    }
    Blockly.unbindEvent_(this.onMouseDownBarWrapper_);
    this.onMouseDownBarWrapper_ = null;
    Blockly.unbindEvent_(this.onMouseDownKnobWrapper_);
    this.onMouseDownKnobWrapper_ = null;

    domConstruct.destroy(this.svgGroup_);
    this.svgGroup_ = null;
    this.svgBackground_ = null;
    this.svgKnob_ = null;
    this.workspace_ = null;
};

/**
 * Recalculate the scrollbar's location and its length.
 * @param {Object=} opt_metrics A data structure of from the describing all the
 * required dimensions.  If not provided, it will be fetched from the host
 * object.
 */
Blockly.Scrollbar.prototype.resize = function (opt_metrics) {
    // Determine the location, height and width of the host element.
    var hostMetrics = opt_metrics;
    if (!hostMetrics) {
        hostMetrics = this.workspace_.getMetrics();
        if (!hostMetrics) {
            // Host element is likely not visible.
            return;
        }
    }
    /* hostMetrics is an object with the following properties.
     * .viewHeight: Height of the visible rectangle,
     * .viewWidth: Width of the visible rectangle,
     * .contentHeight: Height of the contents,
     * .contentWidth: Width of the content,
     * .viewTop: Offset of top edge of visible rectangle from parent,
     * .viewLeft: Offset of left edge of visible rectangle from parent,
     * .contentTop: Offset of the top-most content from the y=0 coordinate,
     * .contentLeft: Offset of the left-most content from the x=0 coordinate,
     * .absoluteTop: Top-edge of view.
     * .absoluteLeft: Left-edge of view.
     */
    if (this.horizontal_) {
        var outerLength = hostMetrics.viewWidth;
        if (this.pair_) {
            // Shorten the scrollbar to make room for the corner square.
            outerLength -= Blockly.Scrollbar.scrollbarThickness;
        } else {
            // Only show the scrollbar if needed.
            // Ideally this would also apply to scrollbar pairs, but that's a bigger
            // headache (due to interactions with the corner square).
            this.setVisible(outerLength < hostMetrics.contentHeight);
        }
        this.ratio_ = outerLength / hostMetrics.contentWidth;
        if (this.ratio_ === -Infinity || this.ratio_ === Infinity ||
            isNaN(this.ratio_)) {
            this.ratio_ = 0;
        }
        var innerLength = hostMetrics.viewWidth * this.ratio_;
        var innerOffset = (hostMetrics.viewLeft - hostMetrics.contentLeft) *
            this.ratio_;
        this.svgKnob_.setAttribute('width', Math.max(0, innerLength));
        this.xCoordinate = hostMetrics.absoluteLeft;
        if (this.pair_ && Blockly.RTL) {
            this.xCoordinate += hostMetrics.absoluteLeft +
                Blockly.Scrollbar.scrollbarThickness;
        }
        this.yCoordinate = hostMetrics.absoluteTop + hostMetrics.viewHeight -
            Blockly.Scrollbar.scrollbarThickness;
        this.svgGroup_.setAttribute('transform',
                'translate(' + this.xCoordinate + ', ' + this.yCoordinate + ')');
        this.svgBackground_.setAttribute('width', Math.max(0, outerLength));
        this.svgKnob_.setAttribute('x', this.constrainKnob_(innerOffset));
    } else {
        var outerLength = hostMetrics.viewHeight;
        if (this.pair_) {
            // Shorten the scrollbar to make room for the corner square.
            outerLength -= Blockly.Scrollbar.scrollbarThickness;
        } else {
            // Only show the scrollbar if needed.
            this.setVisible(outerLength < hostMetrics.contentHeight);
        }
        this.ratio_ = outerLength / hostMetrics.contentHeight;
        if (this.ratio_ === -Infinity || this.ratio_ === Infinity ||
            isNaN(this.ratio_)) {
            this.ratio_ = 0;
        }
        var innerLength = hostMetrics.viewHeight * this.ratio_;
        var innerOffset = (hostMetrics.viewTop - hostMetrics.contentTop) *
            this.ratio_;
        this.svgKnob_.setAttribute('height', Math.max(0, innerLength));
        this.xCoordinate = hostMetrics.absoluteLeft;
        if (!Blockly.RTL) {
            this.xCoordinate += hostMetrics.viewWidth -
                Blockly.Scrollbar.scrollbarThickness;
        }
        this.yCoordinate = hostMetrics.absoluteTop;
        this.svgGroup_.setAttribute('transform',
                'translate(' + this.xCoordinate + ', ' + this.yCoordinate + ')');
        this.svgBackground_.setAttribute('height', Math.max(0, outerLength));
        this.svgKnob_.setAttribute('y', this.constrainKnob_(innerOffset));
    }
    // Resizing may have caused some scrolling.
    this.onScroll_();
};

/**
 * Create all the DOM elements required for a scrollbar.
 * The resulting widget is not sized.
 * @private
 */
Blockly.Scrollbar.prototype.createDom_ = function () {
    /* Create the following DOM:
     <g>
     <rect class="blocklyScrollbarBackground" />
     <rect class="blocklyScrollbarKnob" rx="7" ry="7" />
     </g>
     */
    this.svgGroup_ = Blockly.createSvgElement('g', {}, null);
    this.svgBackground_ = Blockly.createSvgElement('rect',
        {'class': 'blocklyScrollbarBackground'}, this.svgGroup_);
    var radius = Math.floor((Blockly.Scrollbar.scrollbarThickness - 6) / 2);
    this.svgKnob_ = Blockly.createSvgElement('rect',
        {'class': 'blocklyScrollbarKnob', 'rx': radius, 'ry': radius},
        this.svgGroup_);
    Blockly.Scrollbar.insertAfter_(this.svgGroup_,
        this.workspace_.getBubbleCanvas());
};

/**
 * Is the scrollbar visible.  Non-paired scrollbars disappear when they aren't
 * needed.
 * @return {boolean} True if visible.
 */
Blockly.Scrollbar.prototype.isVisible = function () {
    return this.svgGroup_.getAttribute('display') != 'none';
};

/**
 * Set whether the scrollbar is visible.
 * Only applies to non-paired scrollbars.
 * @param {boolean} visible True if visible.
 */
Blockly.Scrollbar.prototype.setVisible = function (visible) {
    if (visible == this.isVisible()) {
        return;
    }
    // Ideally this would also apply to scrollbar pairs, but that's a bigger
    // headache (due to interactions with the corner square).
    if (this.pair_) {
        throw 'Unable to toggle visibility of paired scrollbars.';
    }
    if (visible) {
        this.svgGroup_.setAttribute('display', 'block');
    } else {
        // Hide the scrollbar.
        this.workspace_.setMetrics({x: 0, y: 0});
        this.svgGroup_.setAttribute('display', 'none');
    }
};

/**
 * Scroll by one pageful.
 * Called when scrollbar background is clicked.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.Scrollbar.prototype.onMouseDownBar_ = function (e) {
    this.onMouseUpKnob_();
    if (Blockly.isRightButton(e)) {
        // Right-click.
        // Scrollbars have no context menu.
        e.stopPropagation();
        return;
    }
    var mouseXY = Blockly.mouseToSvg(e);
    var mouseLocation = this.horizontal_ ? mouseXY.x : mouseXY.y;

    var knobXY = Blockly.getSvgXY_(this.svgKnob_);
    var knobStart = this.horizontal_ ? knobXY.x : knobXY.y;
    var knobLength = parseFloat(
        this.svgKnob_.getAttribute(this.horizontal_ ? 'width' : 'height'));
    var knobValue = parseFloat(
        this.svgKnob_.getAttribute(this.horizontal_ ? 'x' : 'y'));

    var pageLength = knobLength * 0.95;
    if (mouseLocation <= knobStart) {
        // Decrease the scrollbar's value by a page.
        knobValue -= pageLength;
    } else if (mouseLocation >= knobStart + knobLength) {
        // Increase the scrollbar's value by a page.
        knobValue += pageLength;
    }
    this.svgKnob_.setAttribute(this.horizontal_ ? 'x' : 'y',
        this.constrainKnob_(knobValue));
    this.onScroll_();
    e.stopPropagation();
};

/**
 * Start a dragging operation.
 * Called when scrollbar knob is clicked.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.Scrollbar.prototype.onMouseDownKnob_ = function (e) {
    this.onMouseUpKnob_();
    if (Blockly.isRightButton(e)) {
        // Right-click.
        // Scrollbars have no context menu.
        e.stopPropagation();
        return;
    }
    // Look up the current translation and record it.
    this.startDragKnob = parseFloat(
        this.svgKnob_.getAttribute(this.horizontal_ ? 'x' : 'y'));
    // Record the current mouse position.
    this.startDragMouse = this.horizontal_ ? e.clientX : e.clientY;
    Blockly.Scrollbar.onMouseUpWrapper_ = Blockly.bindEvent_(document,
        'mouseup', this, this.onMouseUpKnob_);
    Blockly.Scrollbar.onMouseMoveWrapper_ = Blockly.bindEvent_(document,
        'mousemove', this, this.onMouseMoveKnob_);
    e.stopPropagation();
};

/**
 * Drag the scrollbar's knob.
 * @param {!Event} e Mouse up event.
 * @private
 */
Blockly.Scrollbar.prototype.onMouseMoveKnob_ = function (e) {
    var currentMouse = this.horizontal_ ? e.clientX : e.clientY;
    var mouseDelta = currentMouse - this.startDragMouse;
    var knobValue = this.startDragKnob + mouseDelta;
    // Position the bar.
    this.svgKnob_.setAttribute(this.horizontal_ ? 'x' : 'y',
        this.constrainKnob_(knobValue));
    this.onScroll_();
};

/**
 * Stop binding to the global mouseup and mousemove events.
 * @private
 */
Blockly.Scrollbar.prototype.onMouseUpKnob_ = function () {
    Blockly.removeAllRanges();
    Blockly.hideChaff(true);
    if (Blockly.Scrollbar.onMouseUpWrapper_) {
        Blockly.unbindEvent_(Blockly.Scrollbar.onMouseUpWrapper_);
        Blockly.Scrollbar.onMouseUpWrapper_ = null;
    }
    if (Blockly.Scrollbar.onMouseMoveWrapper_) {
        Blockly.unbindEvent_(Blockly.Scrollbar.onMouseMoveWrapper_);
        Blockly.Scrollbar.onMouseMoveWrapper_ = null;
    }
};

/**
 * Constrain the knob's position within the minimum (0) and maximum
 * (length of scrollbar) values allowed for the scrollbar.
 * @param {number} value Value that is potentially out of bounds.
 * @return {number} Constrained value.
 * @private
 */
Blockly.Scrollbar.prototype.constrainKnob_ = function (value) {
    if (value <= 0 || isNaN(value)) {
        value = 0;
    } else {
        var axis = this.horizontal_ ? 'width' : 'height';
        var barLength = parseFloat(this.svgBackground_.getAttribute(axis));
        var knobLength = parseFloat(this.svgKnob_.getAttribute(axis));
        value = Math.min(value, barLength - knobLength);
    }
    return value;
};

/**
 * Called when scrollbar is moved.
 * @private
 */
Blockly.Scrollbar.prototype.onScroll_ = function () {
    var knobValue = parseFloat(
        this.svgKnob_.getAttribute(this.horizontal_ ? 'x' : 'y'));
    var barLength = parseFloat(
        this.svgBackground_.getAttribute(this.horizontal_ ? 'width' : 'height'));
    var ratio = knobValue / barLength;
    if (isNaN(ratio)) {
        ratio = 0;
    }
    var xyRatio = {};
    if (this.horizontal_) {
        xyRatio.x = ratio;
    } else {
        xyRatio.y = ratio;
    }
    this.workspace_.setMetrics(xyRatio);
};

/**
 * Set the scrollbar slider's position.
 * @param {number} value The distance from the top/left end of the bar.
 * @param {boolean} fireEvents True if onScroll events should be fired.
 */
Blockly.Scrollbar.prototype.set = function (value, fireEvents) {
    // Move the scrollbar slider.
    this.svgKnob_.setAttribute(this.horizontal_ ? 'x' : 'y', value * this.ratio_);

    if (fireEvents) {
        this.onScroll_();
    }
};

/**
 * Insert a node after a reference node.
 * Contrast with node.insertBefore function.
 * @param {!Element} newNode New element to insert.
 * @param {!Element} refNode Existing element to precede new node.
 * @private
 */
Blockly.Scrollbar.insertAfter_ = function (newNode, refNode) {
    var siblingNode = refNode.nextSibling;
    var parentNode = refNode.parentNode;
    if (!parentNode) {
        throw 'Reference node has no parent.';
    }
    if (siblingNode) {
        parentNode.insertBefore(newNode, siblingNode);
    } else {
        parentNode.appendChild(newNode);
    }
};

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
 * @fileoverview Library to create tooltips for Blockly.
 * First, call Blockly.Tooltip.init() after onload.
 * Second, set the 'tooltip' property on any SVG element that needs a tooltip.
 * If the tooltip is a string, then that message will be displayed.
 * If the tooltip is an SVG element, then that object's tooltip will be used.
 * Third, call Blockly.Tooltip.bindMouseEvents(e) passing the SVG element.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

Blockly.Tooltip = {};

/**
 * Is a tooltip currently showing?
 */
Blockly.Tooltip.visible = false;

/**
 * Maximum width (in characters) of a tooltip.
 */
Blockly.Tooltip.LIMIT = 50;

/**
 * PID of suspended thread to clear tooltip on mouse out.
 * @private
 */
Blockly.Tooltip.mouseOutPid_ = 0;

/**
 * PID of suspended thread to show the tooltip.
 * @private
 */
Blockly.Tooltip.showPid_ = 0;

/**
 * Last observed location of the mouse pointer (freezes when tooltip appears).
 * @private
 */
Blockly.Tooltip.lastXY_ = {x: 0, y: 0};

/**
 * Current element being pointed at.
 * @private
 */
Blockly.Tooltip.element_ = null;

/**
 * Once a tooltip has opened for an element, that element is 'poisoned' and
 * cannot respawn a tooltip until the pointer moves over a different element.
 * @private
 */
Blockly.Tooltip.poisonedElement_ = null;

/**
 * Tooltip's SVG group element.
 * @type {Element}
 * @private
 */
Blockly.Tooltip.svgGroup_ = null;

/**
 * Tooltip's SVG text element.
 * @type {SVGTextElement}
 * @private
 */
Blockly.Tooltip.svgText_ = null;

/**
 * Tooltip's SVG background rectangle.
 * @type {Element}
 * @private
 */
Blockly.Tooltip.svgBackground_ = null;

/**
 * Tooltip's SVG shadow rectangle.
 * @type {Element}
 * @private
 */
Blockly.Tooltip.svgShadow_ = null;

/**
 * Horizontal offset between mouse cursor and tooltip.
 */
Blockly.Tooltip.OFFSET_X = 0;

/**
 * Vertical offset between mouse cursor and tooltip.
 */
Blockly.Tooltip.OFFSET_Y = 10;

/**
 * Radius mouse can move before killing tooltip.
 */
Blockly.Tooltip.RADIUS_OK = 10;

/**
 * Delay before tooltip appears.
 */
Blockly.Tooltip.HOVER_MS = 1000;

/**
 * Horizontal padding between text and background.
 */
Blockly.Tooltip.MARGINS = 5;

/**
 * Create the tooltip elements.  Only needs to be called once.
 * @return {!SVGGElement} The tooltip's SVG group.
 */
Blockly.Tooltip.createDom = function () {
    /*
     <g class="blocklyHidden">
     <rect class="blocklyTooltipShadow" x="2" y="2"/>
     <rect class="blocklyTooltipBackground"/>
     <text class="blocklyTooltipText"></text>
     </g>
     */
    var svgGroup = /** @type {!SVGGElement} */ (
        Blockly.createSvgElement('g', {'class': 'blocklyHidden'}, null));
    Blockly.Tooltip.svgGroup_ = svgGroup;
    Blockly.Tooltip.svgShadow_ = /** @type {!SVGRectElement} */ (
        Blockly.createSvgElement(
            'rect', {'class': 'blocklyTooltipShadow', 'x': 2, 'y': 2}, svgGroup));
    Blockly.Tooltip.svgBackground_ = /** @type {!SVGRectElement} */ (
        Blockly.createSvgElement(
            'rect', {'class': 'blocklyTooltipBackground'}, svgGroup));
    Blockly.Tooltip.svgText_ = /** @type {!SVGTextElement} */ (
        Blockly.createSvgElement(
            'text', {'class': 'blocklyTooltipText'}, svgGroup));
    return svgGroup;
};

/**
 * Binds the required mouse events onto an SVG element.
 * @param {!Element} element SVG element onto which tooltip is to be bound.
 */
Blockly.Tooltip.bindMouseEvents = function (element) {
    Blockly.bindEvent_(element, 'mouseover', null, Blockly.Tooltip.onMouseOver_);
    Blockly.bindEvent_(element, 'mouseout', null, Blockly.Tooltip.onMouseOut_);
    Blockly.bindEvent_(element, 'mousemove', null, Blockly.Tooltip.onMouseMove_);
};

/**
 * Hide the tooltip if the mouse is over a different object.
 * Initialize the tooltip to potentially appear for this object.
 * @param {!Event} e Mouse event.
 * @private
 */
Blockly.Tooltip.onMouseOver_ = function (e) {
    // If the tooltip is an object, treat it as a pointer to the next object in
    // the chain to look at.  Terminate when a string or function is found.
    var element = e.target;
    while (!(typeof element.tooltip  == "string") && !(typeof element.tooltip == "function")) {
        element = element.tooltip;
    }
    if (Blockly.Tooltip.element_ != element) {
        Blockly.Tooltip.hide();
        Blockly.Tooltip.poisonedElement_ = null;
        Blockly.Tooltip.element_ = element;
    }
    // Forget about any immediately preceeding mouseOut event.
    window.clearTimeout(Blockly.Tooltip.mouseOutPid_);
};

/**
 * Hide the tooltip if the mouse leaves the object and enters the workspace.
 * @param {!Event} e Mouse event.
 * @private
 */
Blockly.Tooltip.onMouseOut_ = function (e) {
    // Moving from one element to another (overlapping or with no gap) generates
    // a mouseOut followed instantly by a mouseOver.  Fork off the mouseOut
    // event and kill it if a mouseOver is received immediately.
    // This way the task only fully executes if mousing into the void.
    Blockly.Tooltip.mouseOutPid_ = window.setTimeout(function () {
        Blockly.Tooltip.element_ = null;
        Blockly.Tooltip.poisonedElement_ = null;
        Blockly.Tooltip.hide();
    }, 1);
    window.clearTimeout(Blockly.Tooltip.showPid_);
};

/**
 * When hovering over an element, schedule a tooltip to be shown.  If a tooltip
 * is already visible, hide it if the mouse strays out of a certain radius.
 * @param {!Event} e Mouse event.
 * @private
 */
Blockly.Tooltip.onMouseMove_ = function (e) {
    if (!Blockly.Tooltip.element_ || !Blockly.Tooltip.element_.tooltip) {
        // No tooltip here to show.
        return;
    } else if (Blockly.Block.dragMode_ != 0) {
        // Don't display a tooltip during a drag.
        return;
    } else if (Blockly.WidgetDiv.isVisible()) {
        // Don't display a tooltip if a widget is open (tooltip would be under it).
        return;
    }
    if (Blockly.Tooltip.visible) {
        // Compute the distance between the mouse position when the tooltip was
        // shown and the current mouse position.  Pythagorean theorem.
        var mouseXY = Blockly.mouseToSvg(e);
        var dx = Blockly.Tooltip.lastXY_.x - mouseXY.x;
        var dy = Blockly.Tooltip.lastXY_.y - mouseXY.y;
        var dr = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
        if (dr > Blockly.Tooltip.RADIUS_OK) {
            Blockly.Tooltip.hide();
        }
    } else if (Blockly.Tooltip.poisonedElement_ != Blockly.Tooltip.element_) {
        // The mouse moved, clear any previously scheduled tooltip.
        window.clearTimeout(Blockly.Tooltip.showPid_);
        // Maybe this time the mouse will stay put.  Schedule showing of tooltip.
        Blockly.Tooltip.lastXY_ = Blockly.mouseToSvg(e);
        Blockly.Tooltip.showPid_ =
            window.setTimeout(Blockly.Tooltip.show_, Blockly.Tooltip.HOVER_MS);
    }
};

/**
 * Hide the tooltip.
 */
Blockly.Tooltip.hide = function () {
    if (Blockly.Tooltip.visible) {
        Blockly.Tooltip.visible = false;
        if (Blockly.Tooltip.svgGroup_) {
            Blockly.Tooltip.svgGroup_.style.display = 'none';
        }
    }
    window.clearTimeout(Blockly.Tooltip.showPid_);
};

/**
 * Create the tooltip and show it.
 * @private
 */
Blockly.Tooltip.show_ = function () {
    Blockly.Tooltip.poisonedElement_ = Blockly.Tooltip.element_;
    if (!Blockly.Tooltip.svgGroup_) {
        return;
    }
    // Erase all existing text.
    Blockly.removeChildren(
        /** @type {!Element} */ (Blockly.Tooltip.svgText_));
    // Get the new text.
    var tip = Blockly.Tooltip.element_.tooltip;
    if (typeof(tip) == "function") {
        tip = tip();
    }
    tip = Blockly.Tooltip.wrap_(tip, Blockly.Tooltip.LIMIT);
    // Create new text, line by line.
    var lines = tip.split('\n');
    for (var i = 0; i < lines.length; i++) {
        var tspanElement = Blockly.createSvgElement('tspan',
            {'dy': '1em', 'x': Blockly.Tooltip.MARGINS}, Blockly.Tooltip.svgText_);
        var textNode = document.createTextNode(lines[i]);
        tspanElement.appendChild(textNode);
    }
    // Display the tooltip.
    Blockly.Tooltip.visible = true;
    Blockly.Tooltip.svgGroup_.style.display = 'block';
    // Resize the background and shadow to fit.
    var bBox = Blockly.Tooltip.svgText_.getBBox();
    var width = 2 * Blockly.Tooltip.MARGINS + bBox.width;
    var height = bBox.height;
    Blockly.Tooltip.svgBackground_.setAttribute('width', width);
    Blockly.Tooltip.svgBackground_.setAttribute('height', height);
    Blockly.Tooltip.svgShadow_.setAttribute('width', width);
    Blockly.Tooltip.svgShadow_.setAttribute('height', height);
    if (Blockly.RTL) {
        // Right-align the paragraph.
        // This cannot be done until the tooltip is rendered on screen.
        var maxWidth = bBox.width;
        for (var x = 0, textElement;
             textElement = Blockly.Tooltip.svgText_.childNodes[x]; x++) {
            textElement.setAttribute('text-anchor', 'end');
            textElement.setAttribute('x', maxWidth + Blockly.Tooltip.MARGINS);
        }
    }
    // Move the tooltip to just below the cursor.
    var anchorX = Blockly.Tooltip.lastXY_.x;
    if (Blockly.RTL) {
        anchorX -= Blockly.Tooltip.OFFSET_X + width;
    } else {
        anchorX += Blockly.Tooltip.OFFSET_X;
    }
    var anchorY = Blockly.Tooltip.lastXY_.y + Blockly.Tooltip.OFFSET_Y;

    var svgSize = Blockly.svgSize();
    if (anchorY + bBox.height > svgSize.height) {
        // Falling off the bottom of the screen; shift the tooltip up.
        anchorY -= bBox.height + 2 * Blockly.Tooltip.OFFSET_Y;
    }
    if (Blockly.RTL) {
        // Prevent falling off left edge in RTL mode.
        anchorX = Math.max(Blockly.Tooltip.MARGINS, anchorX);
    } else {
        if (anchorX + bBox.width > svgSize.width - 2 * Blockly.Tooltip.MARGINS) {
            // Falling off the right edge of the screen;
            // clamp the tooltip on the edge.
            anchorX = svgSize.width - bBox.width - 2 * Blockly.Tooltip.MARGINS;
        }
    }
    Blockly.Tooltip.svgGroup_.setAttribute('transform',
            'translate(' + anchorX + ',' + anchorY + ')');
};

/**
 * Wrap text to the specified width.
 * @param {string} text Text to wrap.
 * @param {number} limit Width to wrap each line.
 * @private
 */
Blockly.Tooltip.wrap_ = function (text, limit) {
    if (text.length <= limit) {
        // Short text, no need to wrap.
        return text;
    }
    // Split the text into words.
    var words = text.trim().split(/\s+/);
    // Set limit to be the length of the largest word.
    for (var i = 0; i < words.length; i++) {
        if (words[i].length > limit) {
            limit = words[i].length;
        }
    }

    var lastScore;
    var score = -Infinity;
    var lastText;
    var lineCount = 1;
    do {
        lastScore = score;
        lastText = text;
        // Create a list of booleans representing if a space (false) or
        // a break (true) appears after each word.
        var wordBreaks = [];
        // Seed the list with evenly spaced linebreaks.
        var steps = words.length / lineCount;
        var insertedBreaks = 1;
        for (var i = 0; i < words.length - 1; i++) {
            if (insertedBreaks < (i + 1.5) / steps) {
                insertedBreaks++;
                wordBreaks[i] = true;
            } else {
                wordBreaks[i] = false;
            }
        }
        wordBreaks = Blockly.Tooltip.wrapMutate_(words, wordBreaks, limit);
        score = Blockly.Tooltip.wrapScore_(words, wordBreaks, limit);
        text = Blockly.Tooltip.wrapToText_(words, wordBreaks);
        lineCount++;
    } while (score > lastScore)
    return lastText;
};

/**
 * Compute a score for how good the wrapping is.
 * @param {!Array.<string>} words Array of each word.
 * @param {!Array.<boolean>} wordBreaks Array of line breaks.
 * @param {number} limit Width to wrap each line.
 * @return {number} Larger the better.
 * @private
 */
Blockly.Tooltip.wrapScore_ = function (words, wordBreaks, limit) {
    // If this function becomes a performance liability, add caching.
    // Compute the length of each line.
    var lineLengths = [0];
    var linePunctuation = [];
    for (var i = 0; i < words.length; i++) {
        lineLengths[lineLengths.length - 1] += words[i].length;
        if (wordBreaks[i] === true) {
            lineLengths.push(0);
            linePunctuation.push(words[i].charAt(words[i].length - 1));
        } else if (wordBreaks[i] === false) {
            lineLengths[lineLengths.length - 1]++;
        }
    }
    var maxLength = Math.max.apply(Math, lineLengths);

    var score = 0;
    for (var i = 0; i < lineLengths.length; i++) {
        // Optimize for width.
        // -2 points per char over limit (scaled to the power of 1.5).
        score -= Math.pow(Math.abs(limit - lineLengths[i]), 1.5) * 2;
        // Optimize for even lines.
        // -1 point per char smaller than max (scaled to the power of 1.5).
        score -= Math.pow(maxLength - lineLengths[i], 1.5);
        // Optimize for structure.
        // Add score to line endings after punctuation.
        if ('.?!'.indexOf(linePunctuation[i]) != -1) {
            score += limit / 3;
        } else if (',;)]}'.indexOf(linePunctuation[i]) != -1) {
            score += limit / 4;
        }
    }
    // All else being equal, the last line should not be longer than the
    // previous line.  For example, this looks wrong:
    // aaa bbb
    // ccc ddd eee
    if (lineLengths.length > 1 && lineLengths[lineLengths.length - 1] <=
        lineLengths[lineLengths.length - 2]) {
        score += 0.5;
    }
    return score;
};

/**
 * Mutate the array of line break locations until an optimal solution is found.
 * No line breaks are added or deleted, they are simply moved around.
 * @param {!Array.<string>} words Array of each word.
 * @param {!Array.<boolean>} wordBreaks Array of line breaks.
 * @param {number} limit Width to wrap each line.
 * @return {!Array.<boolean>} New array of optimal line breaks.
 * @private
 */
Blockly.Tooltip.wrapMutate_ = function (words, wordBreaks, limit) {
    var bestScore = Blockly.Tooltip.wrapScore_(words, wordBreaks, limit);
    var bestBreaks;
    // Try shifting every line break forward or backward.
    for (var i = 0; i < wordBreaks.length - 1; i++) {
        if (wordBreaks[i] == wordBreaks[i + 1]) {
            continue;
        }
        var mutatedWordBreaks = [].concat(wordBreaks);
        mutatedWordBreaks[i] = !mutatedWordBreaks[i];
        mutatedWordBreaks[i + 1] = !mutatedWordBreaks[i + 1];
        var mutatedScore =
            Blockly.Tooltip.wrapScore_(words, mutatedWordBreaks, limit);
        if (mutatedScore > bestScore) {
            bestScore = mutatedScore;
            bestBreaks = mutatedWordBreaks;
        }
    }
    if (bestBreaks) {
        // Found an improvement.  See if it may be improved further.
        return Blockly.Tooltip.wrapMutate_(words, bestBreaks, limit);
    }
    // No improvements found.  Done.
    return wordBreaks;
};

/**
 * Reassemble the array of words into text, with the specified line breaks.
 * @param {!Array.<string>} words Array of each word.
 * @param {!Array.<boolean>} wordBreaks Array of line breaks.
 * @return {string} Plain text.
 * @private
 */
Blockly.Tooltip.wrapToText_ = function (words, wordBreaks) {
    var text = [];
    for (var i = 0; i < words.length; i++) {
        text.push(words[i]);
        if (wordBreaks[i] !== undefined) {
            text.push(wordBreaks[i] ? '\n' : ' ');
        }
    }
    return text.join('');
};

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
 * @fileoverview Object representing a trash can icon.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';


/**
 * Class for a trash can.
 * @param {!Blockly.Workspace} workspace The workspace to sit in.
 * @constructor
 */
Blockly.Trashcan = function (workspace) {
    this.workspace_ = workspace;
};

/**
 * URL of the trashcan image (minus lid).
 * @type {string}
 * @private
 */
Blockly.Trashcan.prototype.BODY_URL_ = 'media/trashbody.png';

/**
 * URL of the lid image.
 * @type {string}
 * @private
 */
Blockly.Trashcan.prototype.LID_URL_ = 'media/trashlid.png';

/**
 * Width of both the trash can and lid images.
 * @type {number}
 * @private
 */
Blockly.Trashcan.prototype.WIDTH_ = 47;

/**
 * Height of the trashcan image (minus lid).
 * @type {number}
 * @private
 */
Blockly.Trashcan.prototype.BODY_HEIGHT_ = 45;

/**
 * Height of the lid image.
 * @type {number}
 * @private
 */
Blockly.Trashcan.prototype.LID_HEIGHT_ = 15;

/**
 * Distance between trashcan and bottom edge of workspace.
 * @type {number}
 * @private
 */
Blockly.Trashcan.prototype.MARGIN_BOTTOM_ = 35;

/**
 * Distance between trashcan and right edge of workspace.
 * @type {number}
 * @private
 */
Blockly.Trashcan.prototype.MARGIN_SIDE_ = 35;

/**
 * Extent of hotspot on all sides beyond the size of the image.
 * @type {number}
 * @private
 */
Blockly.Trashcan.prototype.MARGIN_HOTSPOT_ = 25;

/**
 * Current open/close state of the lid.
 * @type {boolean}
 */
Blockly.Trashcan.prototype.isOpen = false;

/**
 * The SVG group containing the trash can.
 * @type {Element}
 * @private
 */
Blockly.Trashcan.prototype.svgGroup_ = null;

/**
 * The SVG image element of the trash can body.
 * @type {Element}
 * @private
 */
Blockly.Trashcan.prototype.svgBody_ = null;

/**
 * The SVG image element of the trash can lid.
 * @type {Element}
 * @private
 */
Blockly.Trashcan.prototype.svgLid_ = null;

/**
 * Task ID of opening/closing animation.
 * @type {number}
 * @private
 */
Blockly.Trashcan.prototype.lidTask_ = 0;

/**
 * Current angle of the lid.
 * @type {number}
 * @private
 */
Blockly.Trashcan.prototype.lidAngle_ = 0;

/**
 * Left coordinate of the trash can.
 * @type {number}
 * @private
 */
Blockly.Trashcan.prototype.left_ = 0;

/**
 * Top coordinate of the trash can.
 * @type {number}
 * @private
 */
Blockly.Trashcan.prototype.top_ = 0;

/**
 * Create the trash can elements.
 * @return {!Element} The trash can's SVG group.
 */
Blockly.Trashcan.prototype.createDom = function () {
    /*
     <g filter="url(#blocklyTrashcanShadowFilter)">
     <image width="47" height="45" y="15" href="media/trashbody.png"></image>
     <image width="47" height="15" href="media/trashlid.png"></image>
     </g>
     */
    this.svgGroup_ = Blockly.createSvgElement('g',
        {'filter': 'url(#blocklyTrashcanShadowFilter)'}, null);
    this.svgBody_ = Blockly.createSvgElement('image',
        {'width': this.WIDTH_, 'height': this.BODY_HEIGHT_},
        this.svgGroup_);
    this.svgBody_.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
            Blockly.pathToBlockly + this.BODY_URL_);
    this.svgBody_.setAttribute('y', this.LID_HEIGHT_);
    this.svgLid_ = Blockly.createSvgElement('image',
        {'width': this.WIDTH_, 'height': this.LID_HEIGHT_},
        this.svgGroup_);
    this.svgLid_.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
            Blockly.pathToBlockly + this.LID_URL_);
    return this.svgGroup_;
};

/**
 * Initialize the trash can.
 */
Blockly.Trashcan.prototype.init = function () {
    this.setOpen_(false);
    this.position_();
    // If the document resizes, reposition the trash can.
  Blockly.bindEvent_(window, 'resize', this, this.position_);
};

/**
 * Dispose of this trash can.
 * Unlink from all DOM elements to prevent memory leaks.
 */
Blockly.Trashcan.prototype.dispose = function () {
    if (this.svgGroup_) {
        domConstruct.destroy(this.svgGroup_);
        this.svgGroup_ = null;
    }
    this.svgBody_ = null;
    this.svgLid_ = null;
    this.workspace_ = null;
    if (this.lidTask_ != 0) {
        this.lidTask_.cancel();
        this.lidTask_ = 0;
    }
};

/**
 * Move the trash can to the bottom-right corner.
 * @private
 */
Blockly.Trashcan.prototype.position_ = function () {
    var metrics = this.workspace_.getMetrics();
    if (!metrics) {
        // There are no metrics available (workspace is probably not visible).
        return;
    }
    if (Blockly.RTL) {
        this.left_ = this.MARGIN_SIDE_;
    } else {
        this.left_ = metrics.viewWidth + metrics.absoluteLeft -
            this.WIDTH_ - this.MARGIN_SIDE_;
    }
    this.top_ = metrics.viewHeight + metrics.absoluteTop -
        (this.BODY_HEIGHT_ + this.LID_HEIGHT_) - this.MARGIN_BOTTOM_;
    this.svgGroup_.setAttribute('transform',
            'translate(' + this.left_ + ',' + this.top_ + ')');
};

/**
 * Determines if the mouse is currently over the trash can.
 * Opens/closes the lid and sets the isOpen flag.
 * @param {!Event} e Mouse move event.
 */
Blockly.Trashcan.prototype.onMouseMove = function (e) {
    /*
     An alternative approach would be to use onMouseOver and onMouseOut events.
     However the selected block will be between the mouse and the trash can,
     thus these events won't fire.
     Another approach is to use HTML5's drag & drop API, but it's widely hated.
     Instead, we'll just have the block's drag_ function call us.
     */
    if (!this.svgGroup_) {
        return;
    }
    var mouseXY = Blockly.mouseToSvg(e);
    var trashXY = Blockly.getSvgXY_(this.svgGroup_);
    var over = (mouseXY.x > trashXY.x - this.MARGIN_HOTSPOT_) &&
        (mouseXY.x < trashXY.x + this.WIDTH_ + this.MARGIN_HOTSPOT_) &&
        (mouseXY.y > trashXY.y - this.MARGIN_HOTSPOT_) &&
        (mouseXY.y < trashXY.y + this.BODY_HEIGHT_ + this.LID_HEIGHT_ +
            this.MARGIN_HOTSPOT_);
    // For bonus points we might want to match the trapezoidal outline.
    if (this.isOpen != over) {
        this.setOpen_(over);
    }
};

/**
 * Flip the lid open or shut.
 * @param {boolean} state True if open.
 * @private
 */
Blockly.Trashcan.prototype.setOpen_ = function (state) {
    if (this.isOpen == state) {
        return;
    }
    if (this.lidTask_ != 0) {
        this.lidTask_.cancel();
        this.lidTask_ = 0;
    }
    this.isOpen = state;
    this.animateLid_();
};

/**
 * Rotate the lid open or closed by one step.  Then wait and recurse.
 * @private
 */
Blockly.Trashcan.prototype.animateLid_ = function () {
    this.lidAngle_ += this.isOpen ? 10 : -10;
    this.lidAngle_ = Math.max(0, this.lidAngle_);
    this.svgLid_.setAttribute('transform', 'rotate(' +
        (Blockly.RTL ? -this.lidAngle_ : this.lidAngle_) + ', ' +
        (Blockly.RTL ? 4 : this.WIDTH_ - 4) + ', ' +
        (this.LID_HEIGHT_ - 2) + ')');
    if (this.isOpen ? (this.lidAngle_ < 45) : (this.lidAngle_ > 0)) {
        window.setTimeout(lang.hitch(this, this.animateLid_), 5);
    }
};

/**
 * Flip the lid shut.
 * Called externally after a drag.
 */
Blockly.Trashcan.prototype.close = function () {
    this.setOpen_(false);
};

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
 * @fileoverview Utility methods.
 * These methods are not specific to Blockly, and could be factored out if
 * a JavaScript framework such as Closure were used.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';


/**
 * Add a CSS class to a element.
 * @param {!Element} element DOM element to add class to.
 * @param {string} className Name of class to add.
 * @private
 */
Blockly.addClass_ = function (element, className) {
    var classes = element.getAttribute('class') || '';
    if ((' ' + classes + ' ').indexOf(' ' + className + ' ') == -1) {
        if (classes) {
            classes += ' ';
        }
        element.setAttribute('class', classes + className);
    }
};

/**
 * Remove a CSS class from a element.
 * @param {!Element} element DOM element to remove class from.
 * @param {string} className Name of class to remove.
 * @private
 */
Blockly.removeClass_ = function (element, className) {
    var classes = element.getAttribute('class');
    if ((' ' + classes + ' ').indexOf(' ' + className + ' ') != -1) {
        var classList = classes.split(/\s+/);
        for (var i = 0; i < classList.length; i++) {
            if (!classList[i] || classList[i] == className) {
                classList.splice(i, 1);
                i--;
            }
        }
        if (classList.length) {
            element.setAttribute('class', classList.join(' '));
        } else {
            element.removeAttribute('class');
        }
    }
};

/**
 * Bind an event to a function call.
 * @param {!Node} node Node upon which to listen.
 * @param {string} name Event name to listen to (e.g. 'mousedown').
 * @param {Object} thisObject The value of 'this' in the function.
 * @param {!Function} func Function to call when event is triggered.
 * @return {!Array.<!Array>} Opaque data that can be passed to unbindEvent_.
 * @private
 */
Blockly.bindEvent_ = function (node, name, thisObject, func) {
    var wrapFunc = function (e) {
        func.apply(thisObject, arguments);
    };
    node.addEventListener(name, wrapFunc, false);
    var bindData = [
        [node, name, wrapFunc]
    ];
    // Add equivalent touch event.
    if (name in Blockly.bindEvent_.TOUCH_MAP) {
        wrapFunc = function (e) {
            // Punt on multitouch events.
            if (e.changedTouches.length == 1) {
                // Map the touch event's properties to the event.
                var touchPoint = e.changedTouches[0];
                e.clientX = touchPoint.clientX;
                e.clientY = touchPoint.clientY;
            }
            func.apply(thisObject, arguments);
            // Stop the browser from scrolling/zooming the page
            e.preventDefault();
        };
        node.addEventListener(Blockly.bindEvent_.TOUCH_MAP[name],
            wrapFunc, false);
        bindData.push([node, Blockly.bindEvent_.TOUCH_MAP[name], wrapFunc]);
    }
    return bindData;
};

/**
 * The TOUCH_MAP lookup dictionary specifies additional touch events to fire,
 * in conjunction with mouse events.
 * @type {Object}
 */
Blockly.bindEvent_.TOUCH_MAP = {};
if ('ontouchstart' in document.documentElement) {
    Blockly.bindEvent_.TOUCH_MAP = {
        mousedown: 'touchstart',
        mousemove: 'touchmove',
        mouseup: 'touchend'
    };
}

/**
 * Unbind one or more events event from a function call.
 * @param {!Array.<!Array>} bindData Opaque data from bindEvent_.  This list is
 *     emptied during the course of calling this function.
 * @return {!Function} The function call.
 * @private
 */
Blockly.unbindEvent_ = function (bindData) {
    while (bindData.length) {
        var bindDatum = bindData.pop();
        var node = bindDatum[0];
        var name = bindDatum[1];
        var func = bindDatum[2];
        node.removeEventListener(name, func, false);
    }
    return func;
};

/**
 * Fire a synthetic event synchronously.
 * @param {!EventTarget} node The event's target node.
 * @param {string} eventName Name of event (e.g. 'click').
 */
Blockly.fireUiEventNow = function (node, eventName) {
    var doc = document;
    if (doc.createEvent) {
        // W3
        var evt = doc.createEvent('UIEvents');
        evt.initEvent(eventName, true, true);  // event type, bubbling, cancelable
        node.dispatchEvent(evt);
    } else if (doc.createEventObject) {
        // MSIE
        var evt = doc.createEventObject();
        node.fireEvent('on' + eventName, evt);
    } else {
        throw 'FireEvent: No event creation mechanism.';
    }
};

/**
 * Fire a synthetic event asynchronously.
 * @param {!EventTarget} node The event's target node.
 * @param {string} eventName Name of event (e.g. 'click').
 */
Blockly.fireUiEvent = function (node, eventName) {
    var fire = function () {
        Blockly.fireUiEventNow(node, eventName);
    }
    window.setTimeout(fire, 0);
};

/**
 * Don't do anything for this event, just halt propagation.
 * @param {!Event} e An event.
 */
Blockly.noEvent = function (e) {
    // This event has been handled.  No need to bubble up to the document.
    e.preventDefault();
    e.stopPropagation();
};

/**
 * Return the coordinates of the top-left corner of this element relative to
 * its parent.
 * @param {!Element} element Element to find the coordinates of.
 * @return {!Object} Object with .x and .y properties.
 * @private
 */
Blockly.getRelativeXY_ = function (element) {
    var xy = {x: 0, y: 0};
    // First, check for x and y attributes.
    var x = element.getAttribute('x');
    if (x) {
        xy.x = parseInt(x, 10);
    }
    var y = element.getAttribute('y');
    if (y) {
        xy.y = parseInt(y, 10);
    }
    // Second, check for transform="translate(...)" attribute.
    var transform = element.getAttribute('transform');
    // Note that Firefox and IE (9,10) return 'translate(12)' instead of
    // 'translate(12, 0)'.
    // Note that IE (9,10) returns 'translate(16 8)' instead of
    // 'translate(16, 8)'.
    var r = transform &&
        transform.match(/translate\(\s*([-\d.]+)([ ,]\s*([-\d.]+)\s*\))?/);
    if (r) {
        xy.x += parseInt(r[1], 10);
        if (r[3]) {
            xy.y += parseInt(r[3], 10);
        }
    }
    return xy;
};

/**
 * Return the absolute coordinates of the top-left corner of this element.
 * The origin (0,0) is the top-left corner of the Blockly svg.
 * @param {!Element} element Element to find the coordinates of.
 * @return {!Object} Object with .x and .y properties.
 * @private
 */
Blockly.getSvgXY_ = function (element) {
    var x = 0;
    var y = 0;
    do {
        // Loop through this block and every parent.
        var xy = Blockly.getRelativeXY_(element);
        x += xy.x;
        y += xy.y;
        element = element.parentNode;
    } while (element && element != Blockly.svg);
    return {x: x, y: y};
};

/**
 * Return the absolute coordinates of the top-left corner of this element.
 * The origin (0,0) is the top-left corner of the page body.
 * @param {!Element} element Element to find the coordinates of.
 * @return {!Object} Object with .x and .y properties.
 * @private
 */
Blockly.getAbsoluteXY_ = function (element) {
    var xy = Blockly.getSvgXY_(element);
    return Blockly.convertCoordinates(xy.x, xy.y, false);
};

/**
 * Helper method for creating SVG elements.
 * @param {string} name Element's tag name.
 * @param {!Object} attrs Dictionary of attribute names and values.
 * @param {Element=} opt_parent Optional parent on which to append the element.
 * @return {!SVGElement} Newly created SVG element.
 */
Blockly.createSvgElement = function (name, attrs, opt_parent) {
    var e = /** @type {!SVGElement} */ (
        document.createElementNS(Blockly.SVG_NS, name));
    for (var key in attrs) {
        e.setAttribute(key, attrs[key]);
    }
    // IE defines a unique attribute "runtimeStyle", it is NOT applied to
    // elements created with createElementNS. However, Closure checks for IE
    // and assumes the presence of the attribute and crashes.
    if (document.body.runtimeStyle) {  // Indicates presence of IE-only attr.
        e.runtimeStyle = e.currentStyle = e.style;
    }
    if (opt_parent) {
        opt_parent.appendChild(e);
    }
    return e;
};

/**
 * Is this event a right-click?
 * @param {!Event} e Mouse event.
 * @return {boolean} True if right-click.
 */
Blockly.isRightButton = function (e) {
    // Control-clicking in WebKit on Mac OS X fails to change button to 2.
    return e.button == 2 || e.ctrlKey;
};

/**
 * Convert between HTML coordinates and SVG coordinates.
 * @param {number} x X input coordinate.
 * @param {number} y Y input coordinate.
 * @param {boolean} toSvg True to convert to SVG coordinates.
 *     False to convert to mouse/HTML coordinates.
 * @return {!Object} Object with x and y properties in output coordinates.
 */
Blockly.convertCoordinates = function (x, y, toSvg) {
    if (toSvg) {
        x -= window.scrollX || window.pageXOffset;
        y -= window.scrollY || window.pageYOffset;
    }
    var svgPoint = Blockly.svg.createSVGPoint();
    svgPoint.x = x;
    svgPoint.y = y;
    var matrix = Blockly.svg.getScreenCTM();
    if (toSvg) {
        matrix = matrix.inverse();
    }
    var xy = svgPoint.matrixTransform(matrix);
    if (!toSvg) {
        xy.x += window.scrollX || window.pageXOffset;
        xy.y += window.scrollY || window.pageYOffset;
    }
    return xy;
};

/**
 * Return the converted coordinates of the given mouse event.
 * The origin (0,0) is the top-left corner of the Blockly svg.
 * @param {!Event} e Mouse event.
 * @return {!Object} Object with .x and .y properties.
 */
Blockly.mouseToSvg = function (e) {
    var scrollX = window.scrollX || window.pageXOffset;
    var scrollY = window.scrollY || window.pageYOffset;
    return Blockly.convertCoordinates(e.clientX + scrollX,
            e.clientY + scrollY, true);
};

/**
 * Given an array of strings, return the length of the shortest one.
 * @param {!Array.<string>} array Array of strings.
 * @return {number} Length of shortest string.
 */
Blockly.shortestStringLength = function (array) {
    if (!array.length) {
        return 0;
    }
    var len = array[0].length;
    for (var i = 1; i < array.length; i++) {
        len = Math.min(len, array[i].length);
    }
    return len;
};

/**
 * Given an array of strings, return the length of the common prefix.
 * Words may not be split.  Any space after a word is included in the length.
 * @param {!Array.<string>} array Array of strings.
 * @param {?number} opt_shortest Length of shortest string.
 * @return {number} Length of common prefix.
 */
Blockly.commonWordPrefix = function (array, opt_shortest) {
    if (!array.length) {
        return 0;
    } else if (array.length == 1) {
        return array[0].length;
    }
    var wordPrefix = 0;
    var max = opt_shortest || Blockly.shortestStringLength(array);
    for (var len = 0; len < max; len++) {
        var letter = array[0][len];
        for (var i = 1; i < array.length; i++) {
            if (letter != array[i][len]) {
                return wordPrefix;
            }
        }
        if (letter == ' ') {
            wordPrefix = len + 1;
        }
    }
    for (var i = 1; i < array.length; i++) {
        var letter = array[i][len];
        if (letter && letter != ' ') {
            return wordPrefix;
        }
    }
    return max;
};

/**
 * Given an array of strings, return the length of the common suffix.
 * Words may not be split.  Any space after a word is included in the length.
 * @param {!Array.<string>} array Array of strings.
 * @param {?number} opt_shortest Length of shortest string.
 * @return {number} Length of common suffix.
 */
Blockly.commonWordSuffix = function (array, opt_shortest) {
    if (!array.length) {
        return 0;
    } else if (array.length == 1) {
        return array[0].length;
    }
    var wordPrefix = 0;
    var max = opt_shortest || Blockly.shortestStringLength(array);
    for (var len = 0; len < max; len++) {
        var letter = array[0].substr(-len - 1, 1);
        for (var i = 1; i < array.length; i++) {
            if (letter != array[i].substr(-len - 1, 1)) {
                return wordPrefix;
            }
        }
        if (letter == ' ') {
            wordPrefix = len + 1;
        }
    }
    for (var i = 1; i < array.length; i++) {
        var letter = array[i].charAt(array[i].length - len - 1);
        if (letter && letter != ' ') {
            return wordPrefix;
        }
    }
    return max;
};

/**
 * Is the given string a number (includes negative and decimals).
 * @param {string} str Input string.
 * @return {boolean} True if number, false otherwise.
 */
Blockly.isNumber = function (str) {
    return !!str.match(/^\s*-?\d+(\.\d+)?\s*$/);
};

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
 * @fileoverview Utility functions for handling variables and procedure names.
 * Note that variables and procedures share the same name space, meaning that
 * one can't have a variable and a procedure of the same name.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

Blockly.Variables = {};

/**
 * Category to separate variable names from procedures and generated functions.
 */
Blockly.Variables.NAME_TYPE = 'VARIABLE';

/**
 * Find all user-created variables.
 * @param {Blockly.Block=} opt_block Optional root block.
 * @return {!Array.<string>} Array of variable names.
 */
Blockly.Variables.allVariables = function (varType, opt_block) {
    var blocks;
    if (opt_block) {
        blocks = opt_block.getDescendants();
    } else {
        blocks = Blockly.mainWorkspace.getAllBlocks();
    }
    var variableHash = Object.create(null);
    // Iterate through every block and add each variable to the hash.
    for (var x = 0; x < blocks.length; x++) {
        var func = blocks[x].getVars;
        if (func) {
            var blockVariables = func.call(blocks[x], varType);
            for (var y = 0; y < blockVariables.length; y++) {
                var varName = blockVariables[y];
                // Variable name may be null if the block is only half-built.
                if (varName) {
                    variableHash[varName.toLowerCase()] = varName;
                }
            }
        }
    }
    // Flatten the hash into a list.
    var variableList = [];
    for (var name in variableHash) {
        variableList.push(variableHash[name]);
    }
    return variableList;
};

/**
 * Find all instances of the specified variable and rename them.
 * @param {string} varType Variable type. Uses the field name.
 * @param {string} oldName Variable to rename.
 * @param {string} newName New variable name.
 */
Blockly.Variables.renameVariable = function (varType, oldName, newName) {
    var blocks = Blockly.mainWorkspace.getAllBlocks();
    // Iterate through every block.
    for (var x = 0; x < blocks.length; x++) {
        var func = blocks[x].renameVar;
        if (func) {
            func.call(blocks[x], varType, oldName, newName);
        }
    }
};

/**
 * Construct the blocks required by the flyout for the variable category.
 * @param {!Array.<!Blockly.Block>} blocks List of blocks to show.
 * @param {!Array.<number>} gaps List of widths between blocks.
 * @param {number} margin Standard margin width for calculating gaps.
 * @param {!Blockly.Workspace} workspace The flyout's workspace.
 */
Blockly.Variables.flyoutCategory = function (blocks, gaps, margin, workspace) {
    var variableList = Blockly.Variables.allVariables(this.name);
    variableList.sort(Blockly.caseInsensitiveCompare);
    // In addition to the user's variables, we also want to display the default
    // variable name at the top.  We also don't want this duplicated if the
    // user has created a variable of the same name.
    variableList.unshift(null);
    var defaultVariable = undefined;
    for (var i = 0; i < variableList.length; i++) {
        if (variableList[i] === defaultVariable) {
            continue;
        }
        var getBlock = Blockly.Blocks['variables_get'] ?
            Blockly.Block.obtain(workspace, 'variables_get') : null;
        getBlock && getBlock.initSvg();
        var setBlock = Blockly.Blocks['variables_set'] ?
            Blockly.Block.obtain(workspace, 'variables_set') : null;
        setBlock && setBlock.initSvg();
        if (variableList[i] === null) {
            defaultVariable = (getBlock || setBlock).getVars()[0];
        } else {
            getBlock && getBlock.setFieldValue(variableList[i], 'VAR');
            setBlock && setBlock.setFieldValue(variableList[i], 'VAR');
        }
        setBlock && blocks.push(setBlock);
        getBlock && blocks.push(getBlock);
        if (getBlock && setBlock) {
            gaps.push(margin, margin * 3);
        } else {
            gaps.push(margin * 2);
        }
    }
};

/**
 * Return a new variable name that is not yet being used. This will try to
 * generate single letter variable names in the range 'i' to 'z' to start with.
 * If no unique name is located it will try 'i1' to 'z1', then 'i2' to 'z2' etc.
 * @return {string} New variable name.
 */
Blockly.Variables.generateUniqueName = function () {
    var variableList = Blockly.Variables.allVariables(this.name);
    var newName = '';
    if (variableList.length) {
        variableList.sort(Blockly.caseInsensitiveCompare);
        var nameSuffix = 0, potName = 'i', i = 0, inUse = false;
        while (!newName) {
            i = 0;
            inUse = false;
            while (i < variableList.length && !inUse) {
                if (variableList[i].toLowerCase() == potName) {
                    // This potential name is already used.
                    inUse = true;
                }
                i++;
            }
            if (inUse) {
                // Try the next potential name.
                if (potName[0] === 'z') {
                    // Reached the end of the character sequence so back to 'a' but with
                    // a new suffix.
                    nameSuffix++;
                    potName = 'a';
                } else {
                    potName = String.fromCharCode(potName.charCodeAt(0) + 1);
                    if (potName[0] == 'l') {
                        // Avoid using variable 'l' because of ambiguity with '1'.
                        potName = String.fromCharCode(potName.charCodeAt(0) + 1);
                    }
                }
                if (nameSuffix > 0) {
                    potName += nameSuffix;
                }
            } else {
                // We can use the current potential name.
                newName = potName;
            }
        }
    } else {
        newName = 'i';
    }
    return newName;
};

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
 * @fileoverview Object representing a warning.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';


/**
 * Class for a warning.
 * @param {!Blockly.Block} block The block associated with this warning.
 * @extends {Blockly.Icon}
 * @constructor
 */
Blockly.Warning = function (block) {
    Blockly.Warning.superClass_.constructor.call(this, block);
    this.createIcon_();
};
Blockly.inherits(Blockly.Warning, Blockly.Icon);

/**
 * Warning text (if bubble is not visible).
 * @private
 */
Blockly.Warning.prototype.text_ = '';

/**
 * Create the icon on the block.
 * @private
 */
Blockly.Warning.prototype.createIcon_ = function () {
    Blockly.Icon.prototype.createIcon_.call(this);
    /* Here's the markup that will be generated:
     <path class="blocklyIconShield" d="..."/>
     <text class="blocklyIconMark" x="8" y="13">!</text>
     */
    var iconShield = Blockly.createSvgElement('path',
        {'class': 'blocklyIconShield',
            'd': 'M 2,15 Q -1,15 0.5,12 L 6.5,1.7 Q 8,-1 9.5,1.7 L 15.5,12 ' +
                'Q 17,15 14,15 z'},
        this.iconGroup_);
    this.iconMark_ = Blockly.createSvgElement('text',
        {'class': 'blocklyIconMark',
            'x': Blockly.Icon.RADIUS,
            'y': 2 * Blockly.Icon.RADIUS - 3}, this.iconGroup_);
    this.iconMark_.appendChild(document.createTextNode('!'));
};

/**
 * Create the text for the warning's bubble.
 * @param {string} text The text to display.
 * @return {!SVGTextElement} The top-level node of the text.
 * @private
 */
Blockly.Warning.prototype.textToDom_ = function (text) {
    var paragraph = /** @type {!SVGTextElement} */ (
        Blockly.createSvgElement(
            'text', {'class': 'blocklyText', 'y': Blockly.Bubble.BORDER_WIDTH},
            null));
    var lines = text.split('\n');
    for (var i = 0; i < lines.length; i++) {
        var tspanElement = Blockly.createSvgElement('tspan',
            {'dy': '1em', 'x': Blockly.Bubble.BORDER_WIDTH}, paragraph);
        var textNode = document.createTextNode(lines[i]);
        tspanElement.appendChild(textNode);
    }
    return paragraph;
};

/**
 * Show or hide the warning bubble.
 * @param {boolean} visible True if the bubble should be visible.
 */
Blockly.Warning.prototype.setVisible = function (visible) {
    if (visible == this.isVisible()) {
        // No change.
        return;
    }
    if (visible) {
        // Create the bubble.
        var paragraph = this.textToDom_(this.text_);
        this.bubble_ = new Blockly.Bubble(
            /** @type {!Blockly.Workspace} */ (this.block_.workspace),
            paragraph, this.block_.svg_.svgGroup_,
            this.iconX_, this.iconY_, null, null);
        if (Blockly.RTL) {
            // Right-align the paragraph.
            // This cannot be done until the bubble is rendered on screen.
            var maxWidth = paragraph.getBBox().width;
            for (var x = 0, textElement; textElement = paragraph.childNodes[x]; x++) {
                textElement.setAttribute('text-anchor', 'end');
                textElement.setAttribute('x', maxWidth + Blockly.Bubble.BORDER_WIDTH);
            }
        }
        this.updateColour();
        // Bump the warning into the right location.
        var size = this.bubble_.getBubbleSize();
        this.bubble_.setBubbleSize(size.width, size.height);
    } else {
        // Dispose of the bubble.
        this.bubble_.dispose();
        this.bubble_ = null;
        this.body_ = null;
        this.foreignObject_ = null;
    }
};

/**
 * Bring the warning to the top of the stack when clicked on.
 * @param {!Event} e Mouse up event.
 * @private
 */
Blockly.Warning.prototype.bodyFocus_ = function (e) {
    this.bubble_.promote_();
};

/**
 * Set this warning's text.
 * @param {string} text Warning text.
 */
Blockly.Warning.prototype.setText = function (text) {
    this.text_ = text;
    if (this.isVisible()) {
        this.setVisible(false);
        this.setVisible(true);
    }
};

/**
 * Dispose of this warning.
 */
Blockly.Warning.prototype.dispose = function () {
    this.block_.warning = null;
    Blockly.Icon.prototype.dispose.call(this);
};

/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2013 Google Inc.
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
 * @fileoverview A div that floats on top of Blockly.  This singleton contains
 *     temporary HTML UI widgets that the user is currently interacting with.
 *     E.g. text input areas, colour pickers, context menus.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

Blockly.WidgetDiv = {};

/**
 * The HTML container.  Set once by inject.js's Blockly.createDom_.
 * @type Element
 */
Blockly.WidgetDiv.DIV = null;

/**
 * The object currently using this container.
 * @private
 * @type Object
 */
Blockly.WidgetDiv.owner_ = null;

/**
 * Optional cleanup function set by whichever object uses the widget.
 * @private
 * @type Function
 */
Blockly.WidgetDiv.dispose_ = null;

/**
 * Initialize and display the widget div.  Close the old one if needed.
 * @param {!Object} newOwner The object that will be using this container.
 * @param {Function} dispose Optional cleanup function to be run when the widget
 *   is closed.
 */
Blockly.WidgetDiv.show = function (newOwner, dispose) {
    Blockly.WidgetDiv.hide();
    Blockly.WidgetDiv.owner_ = newOwner;
    Blockly.WidgetDiv.dispose_ = dispose;
//  Blockly.WidgetDiv.DIV.style.display = 'block';
};

/**
 * Destroy the widget and hide the div.
 */
Blockly.WidgetDiv.hide = function () {
    if (Blockly.WidgetDiv.owner_) {
//    Blockly.WidgetDiv.DIV.style.display = 'none';
        Blockly.WidgetDiv.dispose_ && Blockly.WidgetDiv.dispose_();
        Blockly.WidgetDiv.owner_ = null;
        Blockly.WidgetDiv.dispose_ = null;
//    Blockly.removeChildren(Blockly.WidgetDiv.DIV);
    }
};

/**
 * Is the container visible?
 * @return {boolean} True if visible.
 */
Blockly.WidgetDiv.isVisible = function () {
    return !!Blockly.WidgetDiv.owner_;
};

/**
 * Destroy the widget and hide the div if it is being used by the specified
 *   object.
 * @param {!Object} oldOwner The object that was using this container.
 */
Blockly.WidgetDiv.hideIfOwner = function (oldOwner) {
    if (Blockly.WidgetDiv.owner_ == oldOwner) {
        Blockly.WidgetDiv.hide();
    }
};

/**
 * Position the widget at a given location.  Prevent the widget from going
 * offscreen top or left (right in RTL).
 * @param {number} anchorX Horizontal location (window coorditates, not body).
 * @param {number} anchorY Vertical location (window coorditates, not body).
 * @param {!goog.math.Size} widowSize Height/width of window.
 * @param {!goog.math.Coordinate} scrollOffset X/y of window scrollbars.
 */
Blockly.WidgetDiv.position = function (anchorX, anchorY, windowSize, scrollOffset) {
    // Don't let the widget go above the top edge of the window.
    if (anchorY < scrollOffset.y) {
        anchorY = scrollOffset.y;
    }
    if (Blockly.RTL) {
        // Don't let the menu go right of the right edge of the window.
        if (anchorX > windowSize.width + scrollOffset.x) {
            anchorX = windowSize.width + scrollOffset.x;
        }
    } else {
        // Don't let the widget go left of the left edge of the window.
        if (anchorX < scrollOffset.x) {
            anchorX = scrollOffset.x;
        }
    }
    Blockly.WidgetDiv.DIV.style.left = anchorX + 'px';
    Blockly.WidgetDiv.DIV.style.top = anchorY + 'px';
};

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
 * @fileoverview Object representing a workspace.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * Class for a workspace.
 * @param {Function} getMetrics A function that returns size/scrolling metrics.
 * @param {Function} setMetrics A function that sets size/scrolling metrics.
 * @constructor
 */
Blockly.Workspace = function (getMetrics, setMetrics) {
    this.getMetrics = getMetrics;
    this.setMetrics = setMetrics;

    /** @type {boolean} */
    this.isFlyout = false;
    /**
     * @type {!Array.<!Blockly.Block>}
     * @private
     */
    this.topBlocks_ = [];

    /** @type {number} */
    this.maxBlocks = Infinity;

    Blockly.ConnectionDB.init(this);
};

/**
 * Angle away from the horizontal to sweep for blocks.  Order of execution is
 * generally top to bottom, but a small angle changes the scan to give a bit of
 * a left to right bias (reversed in RTL).  Units are in degrees.
 * See: http://tvtropes.org/pmwiki/pmwiki.php/Main/DiagonalBilling.
 */
Blockly.Workspace.SCAN_ANGLE = 3;

/**
 * Can this workspace be dragged around (true) or is it fixed (false)?
 * @type {boolean}
 */
Blockly.Workspace.prototype.dragMode = false;

/**
 * Current horizontal scrolling offset.
 * @type {number}
 */
Blockly.Workspace.prototype.scrollX = 0;

/**
 * Current vertical scrolling offset.
 * @type {number}
 */
Blockly.Workspace.prototype.scrollY = 0;

/**
 * The workspace's trashcan (if any).
 * @type {Blockly.Trashcan}
 */
Blockly.Workspace.prototype.trashcan = null;

/**
 * PID of upcoming firing of a change event.  Used to fire only one event
 * after multiple changes.
 * @type {?number}
 * @private
 */
Blockly.Workspace.prototype.fireChangeEventPid_ = null;

/**
 * This workspace's scrollbars, if they exist.
 * @type {Blockly.ScrollbarPair}
 */
Blockly.Workspace.prototype.scrollbar = null;

/**
 * Create the trash can elements.
 * @return {!Element} The workspace's SVG group.
 */
Blockly.Workspace.prototype.createDom = function () {
    /*
     <g>
     [Trashcan may go here]
     <g></g>
     <g></g>
     </g>
     */
    this.svgGroup_ = Blockly.createSvgElement('g', {}, null);
    this.svgBlockCanvas_ = Blockly.createSvgElement('g', {}, this.svgGroup_);
    this.svgBubbleCanvas_ = Blockly.createSvgElement('g', {}, this.svgGroup_);
    this.fireChangeEvent();
    return this.svgGroup_;
};

/**
 * Dispose of this workspace.
 * Unlink from all DOM elements to prevent memory leaks.
 */
Blockly.Workspace.prototype.dispose = function () {
    if (this.svgGroup_) {
        domConstruct.destroy(this.svgGroup_);
        this.svgGroup_ = null;
    }
    this.svgBlockCanvas_ = null;
    this.svgBubbleCanvas_ = null;
    if (this.trashcan) {
        this.trashcan.dispose();
        this.trashcan = null;
    }
};

/**
 * Add a trashcan.
 */
Blockly.Workspace.prototype.addTrashcan = function () {
    if (Blockly.hasTrashcan && !Blockly.readOnly) {
        this.trashcan = new Blockly.Trashcan(this);
        var svgTrashcan = this.trashcan.createDom();
        this.svgGroup_.insertBefore(svgTrashcan, this.svgBlockCanvas_);
        this.trashcan.init();
    }
};

/**
 * Get the SVG element that forms the drawing surface.
 * @return {!Element} SVG element.
 */
Blockly.Workspace.prototype.getCanvas = function () {
    return this.svgBlockCanvas_;
};

/**
 * Get the SVG element that forms the bubble surface.
 * @return {!SVGGElement} SVG element.
 */
Blockly.Workspace.prototype.getBubbleCanvas = function () {
    return this.svgBubbleCanvas_;
};

/**
 * Add a block to the list of top blocks.
 * @param {!Blockly.Block} block Block to remove.
 */
Blockly.Workspace.prototype.addTopBlock = function (block) {
    this.topBlocks_.push(block);
    this.fireChangeEvent();
};

/**
 * Remove a block from the list of top blocks.
 * @param {!Blockly.Block} block Block to remove.
 */
Blockly.Workspace.prototype.removeTopBlock = function (block) {
    var found = false;
    for (var child, x = 0; child = this.topBlocks_[x]; x++) {
        if (child == block) {
            this.topBlocks_.splice(x, 1);
            found = true;
            break;
        }
    }
    if (!found) {
        throw 'Block not present in workspace\'s list of top-most blocks.';
    }

    this.fireChangeEvent();
};

/**
 * Finds the top-level blocks and returns them.  Blocks are optionally sorted
 * by position; top to bottom (with slight LTR or RTL bias).
 * @param {boolean} ordered Sort the list if true.
 * @return {!Array.<!Blockly.Block>} The top-level block objects.
 */
Blockly.Workspace.prototype.getTopBlocks = function (ordered) {
    // Copy the topBlocks_ list.
    var blocks = [].concat(this.topBlocks_);
    if (ordered && blocks.length > 1) {
        var offset = Math.sin(Blockly.Workspace.SCAN_ANGLE / 180 * Math.PI);
        if (Blockly.RTL) {
            offset *= -1;
        }
        blocks.sort(function (a, b) {
            var aXY = a.getRelativeToSurfaceXY();
            var bXY = b.getRelativeToSurfaceXY();
            return (aXY.y + offset * aXY.x) - (bXY.y + offset * bXY.x);
        });
    }
    return blocks;
};

/**
 * Find all blocks in workspace.  No particular order.
 * @return {!Array.<!Blockly.Block>} Array of blocks.
 */
Blockly.Workspace.prototype.getAllBlocks = function () {
    var blocks = this.getTopBlocks(false);
    for (var x = 0; x < blocks.length; x++) {
        blocks = blocks.concat(blocks[x].getChildren());
    }
    return blocks;
};

/**
 * Dispose of all blocks in workspace.
 */
Blockly.Workspace.prototype.clear = function () {
    Blockly.hideChaff();
    while (this.topBlocks_.length) {
        this.topBlocks_[0].dispose();
    }
};

/**
 * Render all blocks in workspace.
 */
Blockly.Workspace.prototype.render = function () {
    var renderList = this.getAllBlocks();
    for (var x = 0, block; block = renderList[x]; x++) {
        if (!block.getChildren().length) {
            block.render();
        }
    }
};

/**
 * Finds the block with the specified ID in this workspace.
 * @param {string} id ID of block to find.
 * @return {Blockly.Block} The matching block, or null if not found.
 */
Blockly.Workspace.prototype.getBlockById = function (id) {
    // If this O(n) function fails to scale well, maintain a hash table of IDs.
    var blocks = this.getAllBlocks();
    for (var x = 0, block; block = blocks[x]; x++) {
        if (block.id == id) {
            return block;
        }
    }
    return null;
};

/**
 * Turn the visual trace functionality on or off.
 * @param {boolean} armed True if the trace should be on.
 */
Blockly.Workspace.prototype.traceOn = function (armed) {
    this.traceOn_ = armed;
    if (this.traceWrapper_) {
        Blockly.unbindEvent_(this.traceWrapper_);
        this.traceWrapper_ = null;
    }
    if (armed) {
        this.traceWrapper_ = Blockly.bindEvent_(this.svgBlockCanvas_,
            'blocklySelectChange', this, function () {
                this.traceOn_ = false
            });
    }
};

/**
 * Highlight a block in the workspace.
 * @param {?string} id ID of block to find.
 */
Blockly.Workspace.prototype.highlightBlock = function (id) {
    if (this.traceOn_ && Blockly.Block.dragMode_ != 0) {
        // The blocklySelectChange event normally prevents this, but sometimes
        // there is a race condition on fast-executing apps.
        this.traceOn(false);
    }
    if (!this.traceOn_) {
        return;
    }
    var block = null;
    if (id) {
        block = this.getBlockById(id);
        if (!block) {
            return;
        }
    }
    // Temporary turn off the listener for selection changes, so that we don't
    // trip the monitor for detecting user activity.
    this.traceOn(false);
    // Select the current block.
    if (block) {
        block.select();
    } else if (Blockly.selected) {
        Blockly.selected.unselect();
    }
    // Restore the monitor for user activity.
    this.traceOn(true);
};

/**
 * Fire a change event for this workspace.  Changes include new block, dropdown
 * edits, mutations, connections, etc.  Groups of simultaneous changes (e.g.
 * a tree of blocks being deleted) are merged into one event.
 * Applications may hook workspace changes by listening for
 * 'blocklyWorkspaceChange' on Blockly.mainWorkspace.getCanvas().
 */
Blockly.Workspace.prototype.fireChangeEvent = function () {
    if (this.fireChangeEventPid_) {
        window.clearTimeout(this.fireChangeEventPid_);
    }
    var canvas = this.svgBlockCanvas_;
    if (canvas) {
        this.fireChangeEventPid_ = window.setTimeout(function () {
            Blockly.fireUiEvent(canvas, 'blocklyWorkspaceChange');
        }, 0);
    }
};

/**
 * Paste the provided block onto the workspace.
 * @param {!Element} xmlBlock XML block element.
 */
// TODO Convert to JSON
Blockly.Workspace.prototype.paste = function (xmlBlock) {
    if (xmlBlock.getElementsByTagName('block').length >=
        this.remainingCapacity()) {
        return;
    }
    var block = Blockly.Json.domToBlock(this, xmlBlock);
    // Move the duplicate to original position.
    var blockX = parseInt(xmlBlock.getAttribute('x'), 10);
    var blockY = parseInt(xmlBlock.getAttribute('y'), 10);
    if (!isNaN(blockX) && !isNaN(blockY)) {
        if (Blockly.RTL) {
            blockX = -blockX;
        }
        // Offset block until not clobbering another block.
        do {
            var collide = false;
            var allBlocks = this.getAllBlocks();
            for (var x = 0, otherBlock; otherBlock = allBlocks[x]; x++) {
                var otherXY = otherBlock.getRelativeToSurfaceXY();
                if (Math.abs(blockX - otherXY.x) <= 1 &&
                    Math.abs(blockY - otherXY.y) <= 1) {
                    if (Blockly.RTL) {
                        blockX -= Blockly.SNAP_RADIUS;
                    } else {
                        blockX += Blockly.SNAP_RADIUS;
                    }
                    blockY += Blockly.SNAP_RADIUS * 2;
                    collide = true;
                }
            }
        } while (collide);
        block.moveBy(blockX, blockY);
    }
    block.select();
};

/**
 * The number of blocks that may be added to the workspace before reaching
 *     the maxBlocks.
 * @return {number} Number of blocks left.
 */
Blockly.Workspace.prototype.remainingCapacity = function () {
    if (this.maxBlocks == Infinity) {
        return Infinity;
    }
    return this.maxBlocks - this.getAllBlocks().length;
};

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
 * @fileoverview XML reader and writer.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

Blockly.Xml = {};

/**
 * Encode a block tree as XML.
 * @param {!Object} workspace The SVG workspace.
 * @return {!Element} XML document.
 */
Blockly.Xml.workspaceToDom = function (workspace) {
    var width = Blockly.svgSize().width;
    var xml = domConstruct.create('xml');
    var blocks = workspace.getTopBlocks(true);
    for (var i = 0, block; block = blocks[i]; i++) {
        var element = Blockly.Xml.blockToDom_(block);
        var xy = block.getRelativeToSurfaceXY();
        element.setAttribute('x', Blockly.RTL ? width - xy.x : xy.x);
        element.setAttribute('y', xy.y);
        xml.appendChild(element);
    }
    return xml;
};

/**
 * Encode a block subtree as XML.
 * @param {!Blockly.Block} block The root block to encode.
 * @return {!Element} Tree of XML elements.
 * @private
 */
Blockly.Xml.blockToDom_ = function (block) {
    var element = domConstruct.create('block', {type: block.type, id: block.id });
    element.setAttribute('type', block.type);
    element.setAttribute('id', block.id);
    if (block.mutationToDom) {
        // Custom data for an advanced block.
        var mutation = block.mutationToDom();
        if (mutation) {
            element.appendChild(mutation);
        }
    }
    function fieldToDom(field) {
        if (field.name && field.EDITABLE) {
            var container = domConstruct.create('field', {children: field.getValue()});
            container.setAttribute('name', field.name);
            element.appendChild(container);
        }
    }

    for (var x = 0, input; input = block.inputList[x]; x++) {
        for (var y = 0, field; field = input.fieldRow[y]; y++) {
            fieldToDom(field);
        }
    }

    if (block.comment) {
        var commentElement = domConstruct.create('comment', {children: block.comment.getText()});
        commentElement.setAttribute('pinned', block.comment.isVisible());
        var hw = block.comment.getBubbleSize();
        commentElement.setAttribute('h', hw.height);
        commentElement.setAttribute('w', hw.width);
        element.appendChild(commentElement);
    }

    var hasValues = false;
    for (var i = 0, input; input = block.inputList[i]; i++) {
        var container;
        var empty = true;
        if (input.type == Blockly.DUMMY_INPUT) {
            continue;
        } else {
            var childBlock = input.connection.targetBlock();
            if (input.type == Blockly.INPUT_VALUE) {
                container = ('value');
                hasValues = true;
            } else if (input.type == Blockly.NEXT_STATEMENT) {
                container = domConstruct.create('statement');
            }
            if (childBlock) {
                container.appendChild(Blockly.Xml.blockToDom_(childBlock));
                empty = false;
            }
        }
        container.setAttribute('name', input.name);
        if (!empty) {
            element.appendChild(container);
        }
    }
    if (hasValues) {
        element.setAttribute('inline', block.inputsInline);
    }
    if (block.isCollapsed()) {
        element.setAttribute('collapsed', true);
    }
    if (block.disabled) {
        element.setAttribute('disabled', true);
    }
    if (!block.isDeletable()) {
        element.setAttribute('deletable', false);
    }
    if (!block.isMovable()) {
        element.setAttribute('movable', false);
    }
    if (!block.isEditable()) {
        element.setAttribute('editable', false);
    }

    if (block.nextConnection) {
        var nextBlock = block.nextConnection.targetBlock();
        if (nextBlock) {
            var container = domConstruct.create('next', {children: Blockly.Xml.blockToDom_(nextBlock)});
            element.appendChild(container);
        }
    }

    return element;
};

/**
 * Converts a DOM structure into plain text.
 * Currently the text format is fairly ugly: all one line with no whitespace.
 * @param {!Element} dom A tree of XML elements.
 * @return {string} Text representation.
 */
Blockly.Xml.domToText = function (dom) {
    var oSerializer = new XMLSerializer();
    return oSerializer.serializeToString(dom);
};

/**
 * Converts a DOM structure into properly indented text.
 * @param {!Element} dom A tree of XML elements.
 * @return {string} Text representation.
 */
Blockly.Xml.domToPrettyText = function (dom) {
    // This function is not guaranteed to be correct for all XML.
    // But it handles the XML that Blockly generates.
    var blob = Blockly.Xml.domToText(dom);
    // Place every open and close tag on its own line.
    var lines = blob.split('<');
    // Indent every line.
    var indent = '';
    for (var x = 1; x < lines.length; x++) {
        var line = lines[x];
        if (line[0] == '/') {
            indent = indent.substring(2);
        }
        lines[x] = indent + '<' + line;
        if (line[0] != '/' && line.slice(-2) != '/>') {
            indent += '  ';
        }
    }
    // Pull simple tags back together.
    // E.g. <foo></foo>
    var text = lines.join('\n');
    text = text.replace(/(<(\w+)\b[^>]*>[^\n]*)\n *<\/\2>/g, '$1</$2>');
    // Trim leading blank line.
    return text.replace(/^\n/, '');
};

/**
 * Converts plain text into a DOM structure.
 * Throws an error if XML doesn't parse.
 * @param {string} text Text representation.
 * @return {!Element} A tree of XML elements.
 */
Blockly.Xml.textToDom = function (text) {
    var oParser = new DOMParser();
    var dom = oParser.parseFromString(text, 'text/xml');
    // The DOM should have one and only one top-level node, an XML tag.
    if (!dom || !dom.firstChild ||
        dom.firstChild.nodeName.toLowerCase() != 'xml' ||
        dom.firstChild !== dom.lastChild) {
        // Whatever we got back from the parser is not XML.
        throw 'Blockly.Xml.textToDom did not obtain a valid XML tree.';
    }
    return dom.firstChild;
};

/**
 * Decode an XML DOM and create blocks on the workspace.
 * @param {!Blockly.Workspace} workspace The SVG workspace.
 * @param {!Element} xml XML DOM.
 */
Blockly.Xml.domToWorkspace = function (workspace, xml) {
    var width = Blockly.svgSize().width;
    for (var x = 0, xmlChild; xmlChild = xml.childNodes[x]; x++) {
        if (xmlChild.nodeName.toLowerCase() == 'block') {
            var block = Blockly.Xml.domToBlock(workspace, xmlChild);
            var blockX = parseInt(xmlChild.getAttribute('x'), 10);
            var blockY = parseInt(xmlChild.getAttribute('y'), 10);
            if (!isNaN(blockX) && !isNaN(blockY)) {
                block.moveBy(Blockly.RTL ? width - blockX : blockX, blockY);
            }
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
Blockly.Xml.domToBlock = function (workspace, xmlBlock, opt_reuseBlock) {
    var block = null;
    var prototypeName = xmlBlock.getAttribute('type');
    if (!prototypeName) {
        throw 'Block type unspecified: \n' + xmlBlock.outerHTML;
    }
    var id = xmlBlock.getAttribute('id');
    if (opt_reuseBlock && id) {
        block = Blockly.Block.getById(id, workspace);
        // TODO: The following is for debugging.  It should never actually happen.
        if (!block) {
            throw 'Couldn\'t get Block with id: ' + id;
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
//    if (id) {
//      block.id = parseInt(id, 10);
//    }
    }
    if (!block.svg_) {
        block.initSvg();
    }

    var inline = xmlBlock.getAttribute('inline');
    if (inline) {
        block.setInputsInline(inline == 'true');
    }
    var disabled = xmlBlock.getAttribute('disabled');
    if (disabled) {
        block.setDisabled(disabled == 'true');
    }
    var deletable = xmlBlock.getAttribute('deletable');
    if (deletable) {
        block.setDeletable(deletable == 'true');
    }
    var movable = xmlBlock.getAttribute('movable');
    if (movable) {
        block.setMovable(movable == 'true');
    }
    var editable = xmlBlock.getAttribute('editable');
    if (editable) {
        block.setEditable(editable == 'true');
    }

    var blockChild = null;
    for (var x = 0, xmlChild; xmlChild = xmlBlock.childNodes[x]; x++) {
        if (xmlChild.nodeType == 3 && xmlChild.data.match(/^\s*$/)) {
            // Extra whitespace between tags does not concern us.
            continue;
        }
        var input;

        // Find the first 'real' grandchild node (that isn't whitespace).
        var firstRealGrandchild = null;
        for (var y = 0, grandchildNode; grandchildNode = xmlChild.childNodes[y];
             y++) {
            if (grandchildNode.nodeType != 3 || !grandchildNode.data.match(/^\s*$/)) {
                firstRealGrandchild = grandchildNode;
            }
        }

        var name = xmlChild.getAttribute('name');
        switch (xmlChild.nodeName.toLowerCase()) {
            case 'mutation':
                // Custom data for an advanced block.
                if (block.domToMutation) {
                    block.domToMutation(xmlChild);
                }
                break;
            case 'comment':
                block.setCommentText(xmlChild.textContent);
                var visible = xmlChild.getAttribute('pinned');
                if (visible) {
                    block.comment.setVisible(visible == 'true');
                }
                var bubbleW = parseInt(xmlChild.getAttribute('w'), 10);
                var bubbleH = parseInt(xmlChild.getAttribute('h'), 10);
                if (!isNaN(bubbleW) && !isNaN(bubbleH)) {
                    block.comment.setBubbleSize(bubbleW, bubbleH);
                }
                break;
            case 'title':
            // Titles were renamed to field in December 2013.
            // Fall through.
            case 'field':
                block.setFieldValue(xmlChild.textContent, name);
                break;
            case 'value':
            case 'statement':
                input = block.getInput(name);
                if (!input) {
                    throw 'Input ' + name + ' does not exist in block ' + prototypeName;
                }
                if (firstRealGrandchild &&
                    firstRealGrandchild.nodeName.toLowerCase() == 'block') {
                    blockChild = Blockly.Xml.domToBlock(workspace, firstRealGrandchild,
                        opt_reuseBlock);
                    if (blockChild.outputConnection) {
                        input.connection.connect(blockChild.outputConnection);
                    } else if (blockChild.previousConnection) {
                        input.connection.connect(blockChild.previousConnection);
                    } else {
                        throw 'Child block does not have output or previous statement.';
                    }
                }
                break;
            case 'next':
                if (firstRealGrandchild &&
                    firstRealGrandchild.nodeName.toLowerCase() == 'block') {
                    if (!block.nextConnection) {
                        throw 'Next statement does not exist.';
                    } else if (block.nextConnection.targetConnection) {
                        // This could happen if there is more than one XML 'next' tag.
                        throw 'Next statement is already connected.';
                    }
                    blockChild = Blockly.Xml.domToBlock(workspace, firstRealGrandchild,
                        opt_reuseBlock);
                    if (!blockChild.previousConnection) {
                        throw 'Next block does not have previous statement.';
                    }
                    block.nextConnection.connect(blockChild.previousConnection);
                }
                break;
            default:
            // Unknown tag; ignore.  Same principle as HTML parsers.
        }
    }

    var collapsed = xmlBlock.getAttribute('collapsed');
    if (collapsed) {
        block.setCollapsed(collapsed == 'true');
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

/**
 * Remove any 'next' block (statements in a stack).
 * @param {!Element} xmlBlock XML block element.
 */
Blockly.Xml.deleteNext = function (xmlBlock) {
    for (var x = 0, child; child = xmlBlock.childNodes[x]; x++) {
        if (child.nodeName.toLowerCase() == 'next') {
            xmlBlock.removeChild(child);
            break;
        }
    }
};

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
 * @fileoverview Colour blocks for Blockly.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

Blockly.Blocks.colour = {};

Blockly.Blocks['colour_picker'] = {
    /**
     * Block for colour picker.
     * @this Blockly.Block
     */
    init: function () {
        this.setHelpUrl(Blockly.Msg.COLOUR_PICKER_HELPURL);
        this.setColour(20);
        this.appendDummyInput()
            .appendField(new Blockly.FieldColour('#ff0000'), 'COLOUR');
        this.setOutput(true, 'Colour');
        this.setTooltip(Blockly.Msg.COLOUR_PICKER_TOOLTIP);
    }
};

Blockly.Blocks['colour_random'] = {
    /**
     * Block for random colour.
     * @this Blockly.Block
     */
    init: function () {
        this.setHelpUrl(Blockly.Msg.COLOUR_RANDOM_HELPURL);
        this.setColour(20);
        this.appendDummyInput()
            .appendField(Blockly.Msg.COLOUR_RANDOM_TITLE);
        this.setOutput(true, 'Colour');
        this.setTooltip(Blockly.Msg.COLOUR_RANDOM_TOOLTIP);
    }
};

Blockly.Blocks['colour_rgb'] = {
    /**
     * Block for composing a colour from RGB components.
     * @this Blockly.Block
     */
    init: function () {
        this.setHelpUrl(Blockly.Msg.COLOUR_RGB_HELPURL);
        this.setColour(20);
        this.appendValueInput('RED')
            .setCheck('Number')
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField(Blockly.Msg.COLOUR_RGB_TITLE)
            .appendField(Blockly.Msg.COLOUR_RGB_RED);
        this.appendValueInput('GREEN')
            .setCheck('Number')
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField(Blockly.Msg.COLOUR_RGB_GREEN);
        this.appendValueInput('BLUE')
            .setCheck('Number')
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField(Blockly.Msg.COLOUR_RGB_BLUE);
        this.setOutput(true, 'Colour');
        this.setTooltip(Blockly.Msg.COLOUR_RGB_TOOLTIP);
    }
};

Blockly.Blocks['colour_blend'] = {
    /**
     * Block for blending two colours together.
     * @this Blockly.Block
     */
    init: function () {
        this.setHelpUrl(Blockly.Msg.COLOUR_BLEND_HELPURL);
        this.setColour(20);
        this.appendValueInput('COLOUR1')
            .setCheck('Colour')
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField(Blockly.Msg.COLOUR_BLEND_TITLE)
            .appendField(Blockly.Msg.COLOUR_BLEND_COLOUR1);
        this.appendValueInput('COLOUR2')
            .setCheck('Colour')
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField(Blockly.Msg.COLOUR_BLEND_COLOUR2);
        this.appendValueInput('RATIO')
            .setCheck('Number')
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField(Blockly.Msg.COLOUR_BLEND_RATIO);
        this.setOutput(true, 'Colour');
        this.setTooltip(Blockly.Msg.COLOUR_BLEND_TOOLTIP);
    }
};

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
 * @fileoverview List blocks for Blockly.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

Blockly.Blocks.lists = {};


Blockly.Blocks['lists_create_empty'] = {
    /**
     * Block for creating an empty list.
     * @this Blockly.Block
     */
    init: function () {
        this.setHelpUrl(Blockly.Msg.LISTS_CREATE_EMPTY_HELPURL);
        this.setColour(260);
        this.setOutput(true, 'Array');
        this.appendDummyInput()
            .appendField(Blockly.Msg.LISTS_CREATE_EMPTY_TITLE);
        this.setTooltip(Blockly.Msg.LISTS_CREATE_EMPTY_TOOLTIP);
    }
};

Blockly.Blocks['lists_create_with'] = {
    /**
     * Block for creating a list with any number of elements of any type.
     * @this Blockly.Block
     */
    init: function () {
        this.setColour(260);
        this.appendValueInput('ADD0')
            .appendField(Blockly.Msg.LISTS_CREATE_WITH_INPUT_WITH);
        this.appendValueInput('ADD1');
        this.appendValueInput('ADD2');
        this.setOutput(true, 'Array');
        this.setMutator(new Blockly.Mutator(['lists_create_with_item']));
        this.setTooltip(Blockly.Msg.LISTS_CREATE_WITH_TOOLTIP);
        this.itemCount_ = 3;
    },
    /**
     * Create XML to represent list inputs.
     * @return {Array} XML storage element.
     * @this Blockly.Block
     */
    mutationToDom: function () {
        var container = [];
        var parameter = {};
        parameter.name = 'items';
        parameter.value = this.itemCount_;
        container.push(parameter);
        return container;
    },
    /**
     * Parse XML to restore the list inputs.
     * @param {!Element} xmlElement XML storage element.
     * @this Blockly.Block
     */
    domToMutation: function (xmlElement) {
        var elements = [].concat(xmlElement);
        for (var x = 0; x < this.itemCount_; x++) {
            this.removeInput('ADD' + x);
        }
        if (elements[0].name.toLowerCase() == 'items') {
            this.itemCount_ = parseInt(elements[0].value, 10);
        }
        for (var x = 0; x < this.itemCount_; x++) {
            var input = this.appendValueInput('ADD' + x);
            if (x == 0) {
                input.appendField(Blockly.Msg.LISTS_CREATE_WITH_INPUT_WITH);
            }
        }
        if (this.itemCount_ == 0) {
            this.appendDummyInput('EMPTY')
                .appendField(Blockly.Msg.LISTS_CREATE_EMPTY_TITLE);
        }
    },
    /**
     * Populate the mutator's dialog with this block's components.
     * @param {!Blockly.Workspace} workspace Mutator's workspace.
     * @return {!Blockly.Block} Root block in mutator.
     * @this Blockly.Block
     */
    decompose: function (workspace) {
        var containerBlock =
            Blockly.Block.obtain(workspace, 'lists_create_with_container');
        containerBlock.initSvg();
        var connection = containerBlock.getInput('STACK').connection;
        for (var x = 0; x < this.itemCount_; x++) {
            var itemBlock = Blockly.Block.obtain(workspace, 'lists_create_with_item');
            itemBlock.initSvg();
            connection.connect(itemBlock.previousConnection);
            connection = itemBlock.nextConnection;
        }
        return containerBlock;
    },
    /**
     * Reconfigure this block based on the mutator dialog's components.
     * @param {!Blockly.Block} containerBlock Root block in mutator.
     * @this Blockly.Block
     */
    compose: function (containerBlock) {
        // Disconnect all input blocks and remove all inputs.
        if (this.itemCount_ == 0) {
            this.removeInput('EMPTY');
        } else {
            for (var x = this.itemCount_ - 1; x >= 0; x--) {
                this.removeInput('ADD' + x);
            }
        }
        this.itemCount_ = 0;
        // Rebuild the block's inputs.
        var itemBlock = containerBlock.getInputTargetBlock('STACK');
        while (itemBlock) {
            var input = this.appendValueInput('ADD' + this.itemCount_);
            if (this.itemCount_ == 0) {
                input.appendField(Blockly.Msg.LISTS_CREATE_WITH_INPUT_WITH);
            }
            // Reconnect any child blocks.
            if (itemBlock.valueConnection_) {
                input.connection.connect(itemBlock.valueConnection_);
            }
            this.itemCount_++;
            itemBlock = itemBlock.nextConnection &&
                itemBlock.nextConnection.targetBlock();
        }
        if (this.itemCount_ == 0) {
            this.appendDummyInput('EMPTY')
                .appendField(Blockly.Msg.LISTS_CREATE_EMPTY_TITLE);
        }
    },
    /**
     * Store pointers to any connected child blocks.
     * @param {!Blockly.Block} containerBlock Root block in mutator.
     * @this Blockly.Block
     */
    saveConnections: function (containerBlock) {
        var itemBlock = containerBlock.getInputTargetBlock('STACK');
        var x = 0;
        while (itemBlock) {
            var input = this.getInput('ADD' + x);
            itemBlock.valueConnection_ = input && input.connection.targetConnection;
            x++;
            itemBlock = itemBlock.nextConnection &&
                itemBlock.nextConnection.targetBlock();
        }
    }
};

Blockly.Blocks['lists_create_with_container'] = {
    /**
     * Mutator block for list container.
     * @this Blockly.Block
     */
    init: function () {
        this.setColour(260);
        this.appendDummyInput()
            .appendField(Blockly.Msg.LISTS_CREATE_WITH_CONTAINER_TITLE_ADD);
        this.appendStatementInput('STACK');
        this.setTooltip(Blockly.Msg.LISTS_CREATE_WITH_CONTAINER_TOOLTIP);
        this.contextMenu = false;
    }
};

Blockly.Blocks['lists_create_with_item'] = {
    /**
     * Mutator bolck for adding items.
     * @this Blockly.Block
     */
    init: function () {
        this.setColour(260);
        this.appendDummyInput()
            .appendField(Blockly.Msg.LISTS_CREATE_WITH_ITEM_TITLE);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip(Blockly.Msg.LISTS_CREATE_WITH_ITEM_TOOLTIP);
        this.contextMenu = false;
    }
};

Blockly.Blocks['lists_repeat'] = {
    /**
     * Block for creating a list with one element repeated.
     * @this Blockly.Block
     */
    init: function () {
        this.setHelpUrl(Blockly.Msg.LISTS_REPEAT_HELPURL);
        this.setColour(260);
        this.setOutput(true, 'Array');
        this.interpolateMsg(Blockly.Msg.LISTS_REPEAT_TITLE,
            ['ITEM', null, Blockly.ALIGN_RIGHT],
            ['NUM', 'Number', Blockly.ALIGN_RIGHT],
            Blockly.ALIGN_RIGHT);
        this.setTooltip(Blockly.Msg.LISTS_REPEAT_TOOLTIP);
    }
};

Blockly.Blocks['lists_length'] = {
    /**
     * Block for list length.
     * @this Blockly.Block
     */
    init: function () {
        this.setHelpUrl(Blockly.Msg.LISTS_LENGTH_HELPURL);
        this.setColour(260);
        this.interpolateMsg(Blockly.Msg.LISTS_LENGTH_TITLE,
            ['VALUE', ['Array', 'String'], Blockly.ALIGN_RIGHT],
            Blockly.ALIGN_RIGHT);
        this.setOutput(true, 'Number');
        this.setTooltip(Blockly.Msg.LISTS_LENGTH_TOOLTIP);
    }
};

Blockly.Blocks['lists_isEmpty'] = {
    /**
     * Block for is the list empty?
     * @this Blockly.Block
     */
    init: function () {
        this.setHelpUrl(Blockly.Msg.LISTS_IS_EMPTY_HELPURL);
        this.setColour(260);
        this.interpolateMsg(Blockly.Msg.LISTS_IS_EMPTY_TITLE,
            ['VALUE', ['Array', 'String'], Blockly.ALIGN_RIGHT],
            Blockly.ALIGN_RIGHT)
        this.setInputsInline(true);
        this.setOutput(true, 'Boolean');
        this.setTooltip(Blockly.Msg.LISTS_TOOLTIP);
    }
};

Blockly.Blocks['lists_indexOf'] = {
    /**
     * Block for finding an item in the list.
     * @this Blockly.Block
     */
    init: function () {
        var OPERATORS =
            [
                [Blockly.Msg.LISTS_INDEX_OF_FIRST, 'FIRST'],
                [Blockly.Msg.LISTS_INDEX_OF_LAST, 'LAST']
            ];
        this.setHelpUrl(Blockly.Msg.LISTS_INDEX_OF_HELPURL);
        this.setColour(260);
        this.setOutput(true, 'Number');
        this.appendValueInput('VALUE')
            .setCheck('Array')
            .appendField(Blockly.Msg.LISTS_INDEX_OF_INPUT_IN_LIST);
        this.appendValueInput('FIND')
            .appendField(new Blockly.FieldDropdown(OPERATORS), 'END');
        this.setInputsInline(true);
        this.setTooltip(Blockly.Msg.LISTS_INDEX_OF_TOOLTIP);
    }
};

Blockly.Blocks['lists_getIndex'] = {
    /**
     * Block for getting element at index.
     * @this Blockly.Block
     */
    init: function () {
        var MODE =
            [
                [Blockly.Msg.LISTS_GET_INDEX_GET, 'GET'],
                [Blockly.Msg.LISTS_GET_INDEX_GET_REMOVE, 'GET_REMOVE'],
                [Blockly.Msg.LISTS_GET_INDEX_REMOVE, 'REMOVE']
            ];
        this.WHERE_OPTIONS =
            [
                [Blockly.Msg.LISTS_GET_INDEX_FROM_START, 'FROM_START'],
                [Blockly.Msg.LISTS_GET_INDEX_FROM_END, 'FROM_END'],
                [Blockly.Msg.LISTS_GET_INDEX_FIRST, 'FIRST'],
                [Blockly.Msg.LISTS_GET_INDEX_LAST, 'LAST'],
                [Blockly.Msg.LISTS_GET_INDEX_RANDOM, 'RANDOM']
            ];
        this.setHelpUrl(Blockly.Msg.LISTS_GET_INDEX_HELPURL);
        this.setColour(260);
        var modeMenu = new Blockly.FieldDropdown(MODE, function (value) {
            var isStatement = (value == 'REMOVE');
            this.sourceBlock_.updateStatement_(isStatement);
        });
        this.appendValueInput('VALUE')
            .setCheck('Array')
            .appendField(Blockly.Msg.LISTS_GET_INDEX_INPUT_IN_LIST);
        this.appendDummyInput()
            .appendField(modeMenu, 'MODE')
            .appendField('', 'SPACE');
        this.appendDummyInput('AT');
        if (Blockly.Msg.LISTS_GET_INDEX_TAIL) {
            this.appendDummyInput('TAIL')
                .appendField(Blockly.Msg.LISTS_GET_INDEX_TAIL);
        }
        this.setInputsInline(true);
        this.setOutput(true);
        this.updateAt_(true);
        // Assign 'this' to a variable for use in the tooltip closure below.
        var thisBlock = this;
        this.setTooltip(function () {
            var combo = thisBlock.getFieldValue('MODE') + '_' +
                thisBlock.getFieldValue('WHERE');
            return Blockly.Msg['LISTS_GET_INDEX_TOOLTIP_' + combo];
        });
    },
    /**
     * Create XML to represent whether the block is a statement or a value.
     * Also represent whether there is an 'AT' input.
     * @return {Array} XML storage element.
     * @this Blockly.Block
     */
    mutationToDom: function () {
        var container = [];
        var parameter = {};
        parameter.name = 'statement';
        parameter.value = !this.outputConnection;
        container.push(parameter);

        parameter.name = 'at';
        parameter.value = this.getInput('AT').type == Blockly.INPUT_VALUE;
        container.push(parameter);

        return container;
    },
    /**
     * Parse XML to restore the 'AT' input.
     * @param {!Element} xmlElement XML storage element.
     * @this Blockly.Block
     */
    domToMutation: function (xmlElement) {
        var elements = [].concat(xmlElement);
        for (var x = 0; x < elements.length; x++) {
            if (elements[x].name.toLowerCase() == 'statement') {
                this.updateStatement_(Blockly.Json.parseBoolean(elements[x].value));
            }
            if (elements[x].name.toLowerCase() == 'at') {
                this.updateAt_(Blockly.Json.parseBoolean(elements[x].value));
            }
        }
    },
    /**
     * Switch between a value block and a statement block.
     * @param {boolean} newStatement True if the block should be a statement.
     *     False if the block should be a value.
     * @private
     * @this Blockly.Block
     */
    updateStatement_: function (newStatement) {
        var oldStatement = !this.outputConnection;
        if (newStatement != oldStatement) {
            this.unplug(true, true);
            if (newStatement) {
                this.setOutput(false);
                this.setPreviousStatement(true);
                this.setNextStatement(true);
            } else {
                this.setPreviousStatement(false);
                this.setNextStatement(false);
                this.setOutput(true);
            }
        }
    },
    /**
     * Create or delete an input for the numeric index.
     * @param {boolean} isAt True if the input should exist.
     * @private
     * @this Blockly.Block
     */
    updateAt_: function (isAt) {
        // Destroy old 'AT' and 'ORDINAL' inputs.
        this.removeInput('AT');
        this.removeInput('ORDINAL', true);
        // Create either a value 'AT' input or a dummy input.
        if (isAt) {
            this.appendValueInput('AT').setCheck('Number');
            if (Blockly.Msg.ORDINAL_NUMBER_SUFFIX) {
                this.appendDummyInput('ORDINAL')
                    .appendField(Blockly.Msg.ORDINAL_NUMBER_SUFFIX);
            }
        } else {
            this.appendDummyInput('AT');
        }
        var menu = new Blockly.FieldDropdown(this.WHERE_OPTIONS, function (value) {
            var newAt = (value == 'FROM_START') || (value == 'FROM_END');
            // The 'isAt' variable is available due to this function being a closure.
            if (newAt != isAt) {
                var block = this.sourceBlock_;
                block.updateAt_(newAt);
                // This menu has been destroyed and replaced.  Update the replacement.
                block.setFieldValue(value, 'WHERE');
                return null;
            }
            return undefined;
        });
        this.getInput('AT').appendField(menu, 'WHERE');
        if (Blockly.Msg.LISTS_GET_INDEX_TAIL) {
            this.moveInputBefore('TAIL', null);
        }
    }
};

Blockly.Blocks['lists_setIndex'] = {
    /**
     * Block for setting the element at index.
     * @this Blockly.Block
     */
    init: function () {
        var MODE =
            [
                [Blockly.Msg.LISTS_SET_INDEX_SET, 'SET'],
                [Blockly.Msg.LISTS_SET_INDEX_INSERT, 'INSERT']
            ];
        this.WHERE_OPTIONS =
            [
                [Blockly.Msg.LISTS_GET_INDEX_FROM_START, 'FROM_START'],
                [Blockly.Msg.LISTS_GET_INDEX_FROM_END, 'FROM_END'],
                [Blockly.Msg.LISTS_GET_INDEX_FIRST, 'FIRST'],
                [Blockly.Msg.LISTS_GET_INDEX_LAST, 'LAST'],
                [Blockly.Msg.LISTS_GET_INDEX_RANDOM, 'RANDOM']
            ];
        this.setHelpUrl(Blockly.Msg.LISTS_SET_INDEX_HELPURL);
        this.setColour(260);
        this.appendValueInput('LIST')
            .setCheck('Array')
            .appendField(Blockly.Msg.LISTS_SET_INDEX_INPUT_IN_LIST);
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown(MODE), 'MODE')
            .appendField('', 'SPACE');
        this.appendDummyInput('AT');
        this.appendValueInput('TO')
            .appendField(Blockly.Msg.LISTS_SET_INDEX_INPUT_TO);
        this.setInputsInline(true);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip(Blockly.Msg.LISTS_SET_INDEX_TOOLTIP);
        this.updateAt_(true);
        // Assign 'this' to a variable for use in the tooltip closure below.
        var thisBlock = this;
        this.setTooltip(function () {
            var combo = thisBlock.getFieldValue('MODE') + '_' +
                thisBlock.getFieldValue('WHERE');
            return Blockly.Msg['LISTS_SET_INDEX_TOOLTIP_' + combo];
        });
    },
    /**
     * Create XML to represent whether there is an 'AT' input.
     * @return {Array} XML storage element.
     * @this Blockly.Block
     */
    mutationToDom: function () {
        var container = [];
        var parameter = {};
        parameter.name = 'at';
        parameter.value = this.getInput('AT').type == Blockly.INPUT_VALUE;
        container.push(parameter);

        return container;
    },
    /**
     * Parse XML to restore the 'AT' input.
     * @param {!Element} xmlElement XML storage element.
     * @this Blockly.Block
     */
    domToMutation: function (xmlElement) {
        var elements = [].concat(xmlElement);
        for (var x = 0; x < elements.length; x++) {
            if (elements[x].name.toLowerCase() == 'at') {
                this.updateAt_(Blockly.Json.parseBoolean(elements[x].value));
            }
        }
    },
    /**
     * Create or delete an input for the numeric index.
     * @param {boolean} isAt True if the input should exist.
     * @private
     * @this Blockly.Block
     */
    updateAt_: function (isAt) {
        // Destroy old 'AT' and 'ORDINAL' input.
        this.removeInput('AT');
        this.removeInput('ORDINAL', true);
        // Create either a value 'AT' input or a dummy input.
        if (isAt) {
            this.appendValueInput('AT').setCheck('Number');
            if (Blockly.Msg.ORDINAL_NUMBER_SUFFIX) {
                this.appendDummyInput('ORDINAL')
                    .appendField(Blockly.Msg.ORDINAL_NUMBER_SUFFIX);
            }
        } else {
            this.appendDummyInput('AT');
        }
        var menu = new Blockly.FieldDropdown(this.WHERE_OPTIONS, function (value) {
            var newAt = (value == 'FROM_START') || (value == 'FROM_END');
            // The 'isAt' variable is available due to this function being a closure.
            if (newAt != isAt) {
                var block = this.sourceBlock_;
                block.updateAt_(newAt);
                // This menu has been destroyed and replaced.  Update the replacement.
                block.setFieldValue(value, 'WHERE');
                return null;
            }
            return undefined;
        });
        this.moveInputBefore('AT', 'TO');
        if (this.getInput('ORDINAL')) {
            this.moveInputBefore('ORDINAL', 'TO');
        }

        this.getInput('AT').appendField(menu, 'WHERE');
    }
};

Blockly.Blocks['lists_getSublist'] = {
    /**
     * Block for getting sublist.
     * @this Blockly.Block
     */
    init: function () {
        this.WHERE_OPTIONS_1 =
            [
                [Blockly.Msg.LISTS_GET_SUBLIST_START_FROM_START, 'FROM_START'],
                [Blockly.Msg.LISTS_GET_SUBLIST_START_FROM_END, 'FROM_END'],
                [Blockly.Msg.LISTS_GET_SUBLIST_START_FIRST, 'FIRST']
            ];
        this.WHERE_OPTIONS_2 =
            [
                [Blockly.Msg.LISTS_GET_SUBLIST_END_FROM_START, 'FROM_START'],
                [Blockly.Msg.LISTS_GET_SUBLIST_END_FROM_END, 'FROM_END'],
                [Blockly.Msg.LISTS_GET_SUBLIST_END_LAST, 'LAST']
            ];
        this.setHelpUrl(Blockly.Msg.LISTS_GET_SUBLIST_HELPURL);
        this.setColour(260);
        this.appendValueInput('LIST')
            .setCheck('Array')
            .appendField(Blockly.Msg.LISTS_GET_SUBLIST_INPUT_IN_LIST);
        this.appendDummyInput('AT1');
        this.appendDummyInput('AT2');
        if (Blockly.Msg.LISTS_GET_SUBLIST_TAIL) {
            this.appendDummyInput('TAIL')
                .appendField(Blockly.Msg.LISTS_GET_SUBLIST_TAIL);
        }
        this.setInputsInline(true);
        this.setOutput(true, 'Array');
        this.updateAt_(1, true);
        this.updateAt_(2, true);
        this.setTooltip(Blockly.Msg.LISTS_GET_SUBLIST_TOOLTIP);
    },
    /**
     * Create XML to represent whether there are 'AT' inputs.
     * @return {Array} XML storage element.
     * @this Blockly.Block
     */
    mutationToDom: function () {
        var container = [];
        var parameter = {};
        parameter.name = 'at1';
        parameter.value = this.getInput('AT1').type == Blockly.INPUT_VALUE;
        container.push(parameter);

        parameter.name = 'at2';
        parameter.value = this.getInput('AT2').type == Blockly.INPUT_VALUE;
        container.push(parameter);

        return container;
    },
    /**
     * Parse XML to restore the 'AT' inputs.
     * @param {!Element} xmlElement XML storage element.
     * @this Blockly.Block
     */
    domToMutation: function (xmlElement) {
        var elements = [].concat(xmlElement);
        for (var x = 0; x < elements.length; x++) {
            if (elements[x].name.toLowerCase() == 'at1') {
                this.updateAt_(1, Blockly.Json.parseBoolean(elements[x].value));
            }
            if (elements[x].name.toLowerCase() == 'at2') {
                this.updateAt_(2, Blockly.Json.parseBoolean(elements[x].value));
            }
        }
    },
    /**
     * Create or delete an input for a numeric index.
     * This block has two such inputs, independant of each other.
     * @param {number} n Specify first or second input (1 or 2).
     * @param {boolean} isAt True if the input should exist.
     * @private
     * @this Blockly.Block
     */
    updateAt_: function (n, isAt) {
        // Create or delete an input for the numeric index.
        // Destroy old 'AT' and 'ORDINAL' inputs.
        this.removeInput('AT' + n);
        this.removeInput('ORDINAL' + n, true);
        // Create either a value 'AT' input or a dummy input.
        if (isAt) {
            this.appendValueInput('AT' + n).setCheck('Number');
            if (Blockly.Msg.ORDINAL_NUMBER_SUFFIX) {
                this.appendDummyInput('ORDINAL' + n)
                    .appendField(Blockly.Msg.ORDINAL_NUMBER_SUFFIX);
            }
        } else {
            this.appendDummyInput('AT' + n);
        }
        var menu = new Blockly.FieldDropdown(this['WHERE_OPTIONS_' + n],
            function (value) {
                var newAt = (value == 'FROM_START') || (value == 'FROM_END');
                // The 'isAt' variable is available due to this function being a closure.
                if (newAt != isAt) {
                    var block = this.sourceBlock_;
                    block.updateAt_(n, newAt);
                    // This menu has been destroyed and replaced.  Update the replacement.
                    block.setFieldValue(value, 'WHERE' + n);
                    return null;
                }
                return undefined;
            });
        this.getInput('AT' + n)
            .appendField(menu, 'WHERE' + n);
        if (n == 1) {
            this.moveInputBefore('AT1', 'AT2');
            if (this.getInput('ORDINAL1')) {
                this.moveInputBefore('ORDINAL1', 'AT2');
            }
        }
        if (Blockly.Msg.LISTS_GET_SUBLIST_TAIL) {
            this.moveInputBefore('TAIL', null);
        }
    }
};

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
 * @fileoverview Logic blocks for Blockly.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

Blockly.Blocks.logic = {}


Blockly.Blocks['controls_if'] = {
    /**
     * Block for if/elseif/else condition.
     * @this Blockly.Block
     */
    init: function () {
        this.setHelpUrl(Blockly.Msg.CONTROLS_IF_HELPURL);
        this.setColour(210);
        this.appendValueInput('IF0')
            .setCheck('Boolean')
            .appendField(Blockly.Msg.CONTROLS_IF_MSG_IF);
        this.appendStatementInput('DO0')
            .appendField(Blockly.Msg.CONTROLS_IF_MSG_THEN);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setMutator(new Blockly.Mutator(['controls_if_elseif',
            'controls_if_else']));
        // Assign 'this' to a variable for use in the tooltip closure below.
        var thisBlock = this;
        this.setTooltip(function () {
            if (!thisBlock.elseifCount_ && !thisBlock.elseCount_) {
                return Blockly.Msg.CONTROLS_IF_TOOLTIP_1;
            } else if (!thisBlock.elseifCount_ && thisBlock.elseCount_) {
                return Blockly.Msg.CONTROLS_IF_TOOLTIP_2;
            } else if (thisBlock.elseifCount_ && !thisBlock.elseCount_) {
                return Blockly.Msg.CONTROLS_IF_TOOLTIP_3;
            } else if (thisBlock.elseifCount_ && thisBlock.elseCount_) {
                return Blockly.Msg.CONTROLS_IF_TOOLTIP_4;
            }
            return '';
        });
        this.elseifCount_ = 0;
        this.elseCount_ = 0;
    },
    /**
     * Create XML to represent the number of else-if and else inputs.
     * @return {Element} XML storage element.
     * @this Blockly.Block
     */
    mutationToDom: function () {
        if (!this.elseifCount_ && !this.elseCount_) {
            return null;
        }

        var container = [];
        if (this.elseifCount_) {
            var parameter = {};
            parameter.name = 'elseif';
            parameter.value = this.elseifCount_;
            container.push(parameter);
        }
        if (this.elseCount_) {
            var parameter = {};
            parameter.name = 'else';
            parameter.value = this.elseCount_;
            container.push(parameter);
        }
        return container;
    },
    /**
     * Parse XML to restore the else-if and else inputs.
     * @param {!Element} xmlElement XML storage element.
     * @this Blockly.Block
     */
    domToMutation: function (xmlElement) {
        this.arguments_ = [];
        var elements = [].concat(xmlElement);
        for (var x = 0; x < elements.length; x++) {
            if (elements[x].name.toLowerCase() == 'else') {
                this.elseCount_ = parseInt(elements[x].value, 10);
            }
            if (elements[x].name.toLowerCase() == 'elseif') {
                this.elseifCount_ = parseInt(elements[x].value, 10);
            }
        }
        for (var x = 1; x <= this.elseifCount_; x++) {
            this.appendValueInput('IF' + x)
                .setCheck('Boolean')
                .appendField(Blockly.Msg.CONTROLS_IF_MSG_ELSEIF);
            this.appendStatementInput('DO' + x)
                .appendField(Blockly.Msg.CONTROLS_IF_MSG_THEN);
        }
        if (this.elseCount_) {
            this.appendStatementInput('ELSE')
                .appendField(Blockly.Msg.CONTROLS_IF_MSG_ELSE);
        }
    },
    /**
     * Populate the mutator's dialog with this block's components.
     * @param {!Blockly.Workspace} workspace Mutator's workspace.
     * @return {!Blockly.Block} Root block in mutator.
     * @this Blockly.Block
     */
    decompose: function (workspace) {
        var containerBlock = Blockly.Block.obtain(workspace, 'controls_if_if');
        containerBlock.initSvg();
        var connection = containerBlock.getInput('STACK').connection;
        for (var x = 1; x <= this.elseifCount_; x++) {
            var elseifBlock = Blockly.Block.obtain(workspace, 'controls_if_elseif');
            elseifBlock.initSvg();
            connection.connect(elseifBlock.previousConnection);
            connection = elseifBlock.nextConnection;
        }
        if (this.elseCount_) {
            var elseBlock = Blockly.Block.obtain(workspace, 'controls_if_else');
            elseBlock.initSvg();
            connection.connect(elseBlock.previousConnection);
        }
        return containerBlock;
    },
    /**
     * Reconfigure this block based on the mutator dialog's components.
     * @param {!Blockly.Block} containerBlock Root block in mutator.
     * @this Blockly.Block
     */
    compose: function (containerBlock) {
        // Disconnect the else input blocks and remove the inputs.
        if (this.elseCount_) {
            this.removeInput('ELSE');
        }
        this.elseCount_ = 0;
        // Disconnect all the elseif input blocks and remove the inputs.
        for (var x = this.elseifCount_; x > 0; x--) {
            this.removeInput('IF' + x);
            this.removeInput('DO' + x);
        }
        this.elseifCount_ = 0;
        // Rebuild the block's optional inputs.
        var clauseBlock = containerBlock.getInputTargetBlock('STACK');
        while (clauseBlock) {
            switch (clauseBlock.type) {
                case 'controls_if_elseif':
                    this.elseifCount_++;
                    var ifInput = this.appendValueInput('IF' + this.elseifCount_)
                        .setCheck('Boolean')
                        .appendField(Blockly.Msg.CONTROLS_IF_MSG_ELSEIF);
                    var doInput = this.appendStatementInput('DO' + this.elseifCount_);
                    doInput.appendField(Blockly.Msg.CONTROLS_IF_MSG_THEN);
                    // Reconnect any child blocks.
                    if (clauseBlock.valueConnection_) {
                        ifInput.connection.connect(clauseBlock.valueConnection_);
                    }
                    if (clauseBlock.statementConnection_) {
                        doInput.connection.connect(clauseBlock.statementConnection_);
                    }
                    break;
                case 'controls_if_else':
                    this.elseCount_++;
                    var elseInput = this.appendStatementInput('ELSE');
                    elseInput.appendField(Blockly.Msg.CONTROLS_IF_MSG_ELSE);
                    // Reconnect any child blocks.
                    if (clauseBlock.statementConnection_) {
                        elseInput.connection.connect(clauseBlock.statementConnection_);
                    }
                    break;
                default:
                    throw 'Unknown block type.';
            }
            clauseBlock = clauseBlock.nextConnection &&
                clauseBlock.nextConnection.targetBlock();
        }
    },
    /**
     * Store pointers to any connected child blocks.
     * @param {!Blockly.Block} containerBlock Root block in mutator.
     * @this Blockly.Block
     */
    saveConnections: function (containerBlock) {
        var clauseBlock = containerBlock.getInputTargetBlock('STACK');
        var x = 1;
        while (clauseBlock) {
            switch (clauseBlock.type) {
                case 'controls_if_elseif':
                    var inputIf = this.getInput('IF' + x);
                    var inputDo = this.getInput('DO' + x);
                    clauseBlock.valueConnection_ =
                        inputIf && inputIf.connection.targetConnection;
                    clauseBlock.statementConnection_ =
                        inputDo && inputDo.connection.targetConnection;
                    x++;
                    break;
                case 'controls_if_else':
                    var inputDo = this.getInput('ELSE');
                    clauseBlock.statementConnection_ =
                        inputDo && inputDo.connection.targetConnection;
                    break;
                default:
                    throw 'Unknown block type.';
            }
            clauseBlock = clauseBlock.nextConnection &&
                clauseBlock.nextConnection.targetBlock();
        }
    }
};

Blockly.Blocks['controls_if_if'] = {
    /**
     * Mutator block for if container.
     * @this Blockly.Block
     */
    init: function () {
        this.setColour(210);
        this.appendDummyInput()
            .appendField(Blockly.Msg.CONTROLS_IF_IF_TITLE_IF);
        this.appendStatementInput('STACK');
        this.setTooltip(Blockly.Msg.CONTROLS_IF_IF_TOOLTIP);
        this.contextMenu = false;
    }
};

Blockly.Blocks['controls_if_elseif'] = {
    /**
     * Mutator bolck for else-if condition.
     * @this Blockly.Block
     */
    init: function () {
        this.setColour(210);
        this.appendDummyInput()
            .appendField(Blockly.Msg.CONTROLS_IF_ELSEIF_TITLE_ELSEIF);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip(Blockly.Msg.CONTROLS_IF_ELSEIF_TOOLTIP);
        this.contextMenu = false;
    }
};

Blockly.Blocks['controls_if_else'] = {
    /**
     * Mutator block for else condition.
     * @this Blockly.Block
     */
    init: function () {
        this.setColour(210);
        this.appendDummyInput()
            .appendField(Blockly.Msg.CONTROLS_IF_ELSE_TITLE_ELSE);
        this.setPreviousStatement(true);
        this.setTooltip(Blockly.Msg.CONTROLS_IF_ELSE_TOOLTIP);
        this.contextMenu = false;
    }
};

Blockly.Blocks['logic_compare'] = {
    /**
     * Block for comparison operator.
     * @this Blockly.Block
     */
    init: function () {
        var OPERATORS = Blockly.RTL ? [
            ['=', 'EQ'],
            ['\u2260', 'NEQ'],
            ['>', 'LT'],
            ['\u2265', 'LTE'],
            ['<', 'GT'],
            ['\u2264', 'GTE']
        ] : [
            ['=', 'EQ'],
            ['\u2260', 'NEQ'],
            ['<', 'LT'],
            ['\u2264', 'LTE'],
            ['>', 'GT'],
            ['\u2265', 'GTE']
        ];
        this.setHelpUrl(Blockly.Msg.LOGIC_COMPARE_HELPURL);
        this.setColour(210);
        this.setOutput(true, 'Boolean');
        this.appendValueInput('A');
        this.appendValueInput('B')
            .appendField(new Blockly.FieldDropdown(OPERATORS), 'OP');
        this.setInputsInline(true);
        // Assign 'this' to a variable for use in the tooltip closure below.
        var thisBlock = this;
        this.setTooltip(function () {
            var op = thisBlock.getFieldValue('OP');
            var TOOLTIPS = {
                EQ: Blockly.Msg.LOGIC_COMPARE_TOOLTIP_EQ,
                NEQ: Blockly.Msg.LOGIC_COMPARE_TOOLTIP_NEQ,
                LT: Blockly.Msg.LOGIC_COMPARE_TOOLTIP_LT,
                LTE: Blockly.Msg.LOGIC_COMPARE_TOOLTIP_LTE,
                GT: Blockly.Msg.LOGIC_COMPARE_TOOLTIP_GT,
                GTE: Blockly.Msg.LOGIC_COMPARE_TOOLTIP_GTE
            };
            return TOOLTIPS[op];
        });
    }
};

Blockly.Blocks['logic_operation'] = {
    /**
     * Block for logical operations: 'and', 'or'.
     * @this Blockly.Block
     */
    init: function () {
        this.OPERATORS =
            [
                [Blockly.Msg.LOGIC_OPERATION_AND, 'AND'],
                [Blockly.Msg.LOGIC_OPERATION_OR, 'OR']
            ];
        this.setHelpUrl(Blockly.Msg.LOGIC_OPERATION_HELPURL);
        this.setColour(210);
        this.setOutput(true, 'Boolean');
        this.appendValueInput('IN0')
            .setCheck('Boolean');
        this.appendValueInput('IN1')
            .setCheck('Boolean')
            .appendField(new Blockly.FieldDropdown(this.OPERATORS), 'OP1');
        this.setInputsInline(true);
        this.setMutator(new Blockly.Mutator(['logic_compare_number']));
        // Assign 'this' to a variable for use in the tooltip closure below.
        var thisBlock = this;
        this.setTooltip(function () {
            var op = thisBlock.getFieldValue('OP1');
            var TOOLTIPS = {
                AND: Blockly.Msg.LOGIC_OPERATION_TOOLTIP_AND,
                OR: Blockly.Msg.LOGIC_OPERATION_TOOLTIP_OR
            };
            return TOOLTIPS[op];
        });
    },
    /**
     * Create XML to represent the number of else-if and else inputs.
     * @return {Element} XML storage element.
     * @this Blockly.Block
     */
    mutationToDom: function () {
        if (!this.opCount_) {
            return null;
        }

        var container = [];
        if (this.opCount_) {
            var parameter = {};
            parameter.name = 'operators';
            parameter.value = this.opCount_;
            container.push(parameter);
        }
        return container;
    },
    domToMutation: function (xmlElement) {
        this.arguments_ = [];
        var elements = [].concat(xmlElement);
        for (var x = 0; x < elements.length; x++) {
            if (elements[x].name.toLowerCase() == 'operators') {
                this.opCount_ = parseInt(elements[x].value, 10);
            }

            for (var x = 1; x <= this.opCount_; x++) {
                this.appendValueInput('IN' + (x+1))
                    .setCheck('Boolean')
                    .appendField(new Blockly.FieldDropdown(this.OPERATORS), 'OP' + (x+1));
            }
        }
    },
    decompose: function (workspace) {
        var containerBlock = Blockly.Block.obtain(workspace, 'logic_compare_base');
        containerBlock.initSvg();
        var connection = containerBlock.getInput('STACK').connection;
        for (var x = 1; x <= this.opCount_; x++) {
            var numberBlock = Blockly.Block.obtain(workspace, 'logic_compare_number');
            numberBlock.initSvg();
            connection.connect(numberBlock.previousConnection);
            connection = numberBlock.nextConnection;
        }
        return containerBlock;
    },
    /**
     * Reconfigure this block based on the mutator dialog's components.
     * @param {!Blockly.Block} containerBlock Root block in mutator.
     * @this Blockly.Block
     */
    compose: function (containerBlock) {
        // this.opCount_ = 0;
        // Disconnect all the input blocks and remove the inputs.
        for (var x = this.opCount_; x > 0; x--) {
            this.removeInput('IN' + (x + 1));
            this.removeInput('OP' + (x + 1));
        }
        this.opCount_ = 0;
        // Rebuild the block's optional inputs.
        var clauseBlock = containerBlock.getInputTargetBlock('STACK');
        while (clauseBlock) {
            switch (clauseBlock.type) {
                case 'logic_compare_number':
                    this.opCount_++;

                    var ifInput = this.appendValueInput('IN' + (this.opCount_ + 1))
                        .setCheck('Boolean')
                        .appendField(new Blockly.FieldDropdown(this.OPERATORS), 'OP' + (this.opCount_ + 1));

                    // Reconnect any child blocks.
                    if (clauseBlock.valueConnection_) {
                        ifInput.connection.connect(clauseBlock.valueConnection_);
                    }
                    if (clauseBlock.statementConnection_) {
                        doInput.connection.connect(clauseBlock.statementConnection_);
                    }
                    break;
                default:
                    console.log('Unknown block type ' + clauseBlock.type);
            }
            clauseBlock = clauseBlock.nextConnection &&
                clauseBlock.nextConnection.targetBlock();
        }
    },
    /**
     * Store pointers to any connected child blocks.
     * @param {!Blockly.Block} containerBlock Root block in mutator.
     * @this Blockly.Block
     */
    saveConnections: function (containerBlock) {
        var clauseBlock = containerBlock.getInputTargetBlock('STACK');
        var x = 1;
        while (clauseBlock) {
            switch (clauseBlock.type) {
                case 'logic_compare_number':
                    var inputIf = this.getInput('IN' + x);
                    var inputDo = this.getInput('OP' + x);
                    clauseBlock.valueConnection_ =
                        inputIf && inputIf.connection.targetConnection;
                    clauseBlock.statementConnection_ =
                        inputDo && inputDo.connection.targetConnection;
                    x++;
                    break;
                default:
                    throw 'Unknown block type.';
            }
            clauseBlock = clauseBlock.nextConnection &&
                clauseBlock.nextConnection.targetBlock();
        }
    }
};

Blockly.Blocks['logic_compare_base'] = {
    /**
     * Mutator block for compare container.
     * @this Blockly.Block
     */
    init: function () {
        this.setColour(210);
        this.appendDummyInput()
            .appendField("Logic Compare");
        this.appendStatementInput('STACK');
        this.setTooltip(Blockly.Msg.CONTROLS_IF_IF_TOOLTIP);
        this.contextMenu = false;
    }
};

Blockly.Blocks['logic_compare_number'] = {
    /**
     * Mutator block for additional numbers.
     * @this Blockly.Block
     */
    init: function () {
        this.setColour(210);
        this.appendDummyInput()
            .appendField("number");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip("number tooltip");
        this.contextMenu = false;
    }
};

Blockly.Blocks['logic_negate'] = {
    /**
     * Block for negation.
     * @this Blockly.Block
     */
    init: function () {
        this.setHelpUrl(Blockly.Msg.LOGIC_NEGATE_HELPURL);
        this.setColour(210);
        this.setOutput(true, 'Boolean');
        this.interpolateMsg(Blockly.Msg.LOGIC_NEGATE_TITLE,
            ['BOOL', 'Boolean', Blockly.ALIGN_RIGHT],
            Blockly.ALIGN_RIGHT);
        this.setTooltip(Blockly.Msg.LOGIC_NEGATE_TOOLTIP);
    }
};

Blockly.Blocks['logic_boolean'] = {
    /**
     * Block for boolean data type: true and false.
     * @this Blockly.Block
     */
    init: function () {
        var BOOLEANS =
            [
                [Blockly.Msg.LOGIC_BOOLEAN_TRUE, 'TRUE'],
                [Blockly.Msg.LOGIC_BOOLEAN_FALSE, 'FALSE']
            ];
        this.setHelpUrl(Blockly.Msg.LOGIC_BOOLEAN_HELPURL);
        this.setColour(210);
        this.setOutput(true, 'Boolean');
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown(BOOLEANS), 'BOOL');
        this.setTooltip(Blockly.Msg.LOGIC_BOOLEAN_TOOLTIP);
    }
};

Blockly.Blocks['logic_null'] = {
    /**
     * Block for null data type.
     * @this Blockly.Block
     */
    init: function () {
        this.setHelpUrl(Blockly.Msg.LOGIC_NULL_HELPURL);
        this.setColour(210);
        this.setOutput(true);
        this.appendDummyInput()
            .appendField(Blockly.Msg.LOGIC_NULL);
        this.setTooltip(Blockly.Msg.LOGIC_NULL_TOOLTIP);
    }
};

Blockly.Blocks['logic_ternary'] = {
    /**
     * Block for ternary operator.
     * @this Blockly.Block
     */
    init: function () {
        this.setHelpUrl(Blockly.Msg.LOGIC_TERNARY_HELPURL);
        this.setColour(210);
        this.appendValueInput('IF')
            .setCheck('Boolean')
            .appendField(Blockly.Msg.LOGIC_TERNARY_CONDITION);
        this.appendValueInput('THEN')
            .appendField(Blockly.Msg.LOGIC_TERNARY_IF_TRUE);
        this.appendValueInput('ELSE')
            .appendField(Blockly.Msg.LOGIC_TERNARY_IF_FALSE);
        this.setOutput(true);
        this.setTooltip(Blockly.Msg.LOGIC_TERNARY_TOOLTIP);
    }
};

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
 * @fileoverview Loop blocks for Blockly.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

Blockly.Blocks.loops = {};

Blockly.Blocks['controls_repeat'] = {
    /**
     * Block for repeat n times (internal number).
     * @this Blockly.Block
     */
    init: function () {
        this.setHelpUrl(Blockly.Msg.CONTROLS_REPEAT_HELPURL);
        this.setColour(120);
        this.appendDummyInput()
            .appendField(Blockly.Msg.CONTROLS_REPEAT_TITLE_REPEAT)
            .appendField(new Blockly.FieldTextInput('10',
                Blockly.FieldTextInput.nonnegativeIntegerValidator), 'TIMES')
            .appendField(Blockly.Msg.CONTROLS_REPEAT_TITLE_TIMES);
        this.appendStatementInput('DO')
            .appendField(Blockly.Msg.CONTROLS_REPEAT_INPUT_DO);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip(Blockly.Msg.CONTROLS_REPEAT_TOOLTIP);
    }
};

Blockly.Blocks['controls_repeat_ext'] = {
    /**
     * Block for repeat n times (external number).
     * @this Blockly.Block
     */
    init: function () {
        this.setHelpUrl(Blockly.Msg.CONTROLS_REPEAT_HELPURL);
        this.setColour(120);
        this.interpolateMsg(Blockly.Msg.CONTROLS_REPEAT_TITLE,
            ['TIMES', 'Number', Blockly.ALIGN_RIGHT],
            Blockly.ALIGN_RIGHT);
        this.appendStatementInput('DO')
            .appendField(Blockly.Msg.CONTROLS_REPEAT_INPUT_DO);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setInputsInline(true);
        this.setTooltip(Blockly.Msg.CONTROLS_REPEAT_TOOLTIP);
    }
};

Blockly.Blocks['controls_whileUntil'] = {
    /**
     * Block for 'do while/until' loop.
     * @this Blockly.Block
     */
    init: function () {
        var OPERATORS =
            [
                [Blockly.Msg.CONTROLS_WHILEUNTIL_OPERATOR_WHILE, 'WHILE'],
                [Blockly.Msg.CONTROLS_WHILEUNTIL_OPERATOR_UNTIL, 'UNTIL']
            ];
        this.setHelpUrl(Blockly.Msg.CONTROLS_WHILEUNTIL_HELPURL);
        this.setColour(120);
        this.appendValueInput('BOOL')
            .setCheck('Boolean')
            .appendField(new Blockly.FieldDropdown(OPERATORS), 'MODE');
        this.appendStatementInput('DO')
            .appendField(Blockly.Msg.CONTROLS_WHILEUNTIL_INPUT_DO);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        // Assign 'this' to a variable for use in the tooltip closure below.
        var thisBlock = this;
        this.setTooltip(function () {
            var op = thisBlock.getFieldValue('MODE');
            var TOOLTIPS = {
                WHILE: Blockly.Msg.CONTROLS_WHILEUNTIL_TOOLTIP_WHILE,
                UNTIL: Blockly.Msg.CONTROLS_WHILEUNTIL_TOOLTIP_UNTIL
            };
            return TOOLTIPS[op];
        });
    }
};

Blockly.Blocks['controls_for'] = {
    /**
     * Block for 'for' loop.
     * @this Blockly.Block
     */
    init: function () {
        this.setHelpUrl(Blockly.Msg.CONTROLS_FOR_HELPURL);
        this.setColour(120);
        this.appendDummyInput()
            .appendField(Blockly.Msg.CONTROLS_FOR_INPUT_WITH)
            .appendField(new Blockly.FieldVariable(null), 'VAR');
        this.interpolateMsg(Blockly.Msg.CONTROLS_FOR_INPUT_FROM_TO_BY,
            ['FROM', 'Number', Blockly.ALIGN_RIGHT],
            ['TO', 'Number', Blockly.ALIGN_RIGHT],
            ['BY', 'Number', Blockly.ALIGN_RIGHT],
            Blockly.ALIGN_RIGHT);
        this.appendStatementInput('DO')
            .appendField(Blockly.Msg.CONTROLS_FOR_INPUT_DO);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setInputsInline(true);
        // Assign 'this' to a variable for use in the tooltip closure below.
        var thisBlock = this;
        this.setTooltip(function () {
            return Blockly.Msg.CONTROLS_FOR_TOOLTIP.replace('%1',
                thisBlock.getFieldValue('VAR'));
        });
    },
    /**
     * Return all variables referenced by this block.
     * @return {!Array.<string>} List of variable names.
     * @this Blockly.Block
     */
    getVars: function () {
        return [this.getFieldValue('VAR')];
    },
    /**
     * Notification that a variable is renaming.
     * If the name matches one of this block's variables, rename it.
     * @param {string} oldName Previous name of variable.
     * @param {string} newName Renamed variable.
     * @this Blockly.Block
     */
    renameVar: function (oldName, newName) {
        if (Blockly.Names.equals(oldName, this.getFieldValue('VAR'))) {
            this.setFieldValue(newName, 'VAR');
        }
    },
    /**
     * Add menu option to create getter block for loop variable.
     * @param {!Array} options List of menu options to add to.
     * @this Blockly.Block
     */
    customContextMenu: function (options) {
        var option = {enabled: true};
        var name = this.getFieldValue('VAR');
        option.text = Blockly.Msg.VARIABLES_SET_CREATE_GET.replace('%1', name);
        var xmlField = Ext.DomHelper.createDom({tag: "field", children: name})
        xmlField.setAttribute('name', 'VAR');
        var xmlBlock = Ext.DomHelper.createDom({tag: "block", children: xmlField})
        xmlBlock.setAttribute('type', 'variables_get');
        option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
        options.push(option);
    }
};

Blockly.Blocks['controls_forEach'] = {
    /**
     * Block for 'for each' loop.
     * @this Blockly.Block
     */
    init: function () {
        this.setHelpUrl(Blockly.Msg.CONTROLS_FOREACH_HELPURL);
        this.setColour(120);
        this.appendValueInput('LIST')
            .setCheck('Array')
            .appendField(Blockly.Msg.CONTROLS_FOREACH_INPUT_ITEM)
            .appendField(new Blockly.FieldVariable(null), 'VAR')
            .appendField(Blockly.Msg.CONTROLS_FOREACH_INPUT_INLIST);
        if (Blockly.Msg.CONTROLS_FOREACH_INPUT_INLIST_TAIL) {
            this.appendDummyInput()
                .appendField(Blockly.Msg.CONTROLS_FOREACH_INPUT_INLIST_TAIL);
            this.setInputsInline(true);
        }
        this.appendStatementInput('DO')
            .appendField(Blockly.Msg.CONTROLS_FOREACH_INPUT_DO);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        // Assign 'this' to a variable for use in the tooltip closure below.
        var thisBlock = this;
        this.setTooltip(function () {
            return Blockly.Msg.CONTROLS_FOREACH_TOOLTIP.replace('%1',
                thisBlock.getFieldValue('VAR'));
        });
    },
    /**
     * Return all variables referenced by this block.
     * @return {!Array.<string>} List of variable names.
     * @this Blockly.Block
     */
    getVars: function () {
        return [this.getFieldValue('VAR')];
    },
    /**
     * Notification that a variable is renaming.
     * If the name matches one of this block's variables, rename it.
     * @param {string} oldName Previous name of variable.
     * @param {string} newName Renamed variable.
     * @this Blockly.Block
     */
    renameVar: function (oldName, newName) {
        if (Blockly.Names.equals(oldName, this.getFieldValue('VAR'))) {
            this.setFieldValue(newName, 'VAR');
        }
    },
    customContextMenu: Blockly.Blocks['controls_for'].customContextMenu
};

Blockly.Blocks['controls_flow_statements'] = {
    /**
     * Block for flow statements: continue, break.
     * @this Blockly.Block
     */
    init: function () {
        var OPERATORS =
            [
                [Blockly.Msg.CONTROLS_FLOW_STATEMENTS_OPERATOR_BREAK, 'BREAK'],
                [Blockly.Msg.CONTROLS_FLOW_STATEMENTS_OPERATOR_CONTINUE, 'CONTINUE']
            ];
        this.setHelpUrl(Blockly.Msg.CONTROLS_FLOW_STATEMENTS_HELPURL);
        this.setColour(120);
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown(OPERATORS), 'FLOW');
        this.setPreviousStatement(true);
        // Assign 'this' to a variable for use in the tooltip closure below.
        var thisBlock = this;
        this.setTooltip(function () {
            var op = thisBlock.getFieldValue('FLOW');
            var TOOLTIPS = {
                BREAK: Blockly.Msg.CONTROLS_FLOW_STATEMENTS_TOOLTIP_BREAK,
                CONTINUE: Blockly.Msg.CONTROLS_FLOW_STATEMENTS_TOOLTIP_CONTINUE
            };
            return TOOLTIPS[op];
        });
    },
    /**
     * Called whenever anything on the workspace changes.
     * Add warning if this flow block is not nested inside a loop.
     * @this Blockly.Block
     */
    onchange: function () {
        if (!this.workspace) {
            // Block has been deleted.
            return;
        }
        var legal = false;
        // Is the block nested in a control statement?
        var block = this;
        do {
            if (block.type == 'controls_repeat' ||
                block.type == 'controls_repeat_ext' ||
                block.type == 'controls_forEach' ||
                block.type == 'controls_for' ||
                block.type == 'controls_whileUntil') {
                legal = true;
                break;
            }
            block = block.getSurroundParent();
        } while (block);
        if (legal) {
            this.setWarningText(null);
        } else {
            this.setWarningText(Blockly.Msg.CONTROLS_FLOW_STATEMENTS_WARNING);
        }
    }
};

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
 * @fileoverview Math blocks for Blockly.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

Blockly.Blocks.math = {};


Blockly.Blocks['math_number'] = {
    /**
     * Block for numeric value.
     * @this Blockly.Block
     */
    init: function () {
        this.setHelpUrl(Blockly.Msg.MATH_NUMBER_HELPURL);
        this.setColour(230);
        this.appendDummyInput()
            .appendField(new Blockly.FieldTextInput('0',
                Blockly.FieldTextInput.numberValidator), 'NUM');
        this.setOutput(true, 'Number');
        this.setTooltip(Blockly.Msg.MATH_NUMBER_TOOLTIP);
    }
};

Blockly.Blocks['math_arithmetic'] = {
    /**
     * Block for basic arithmetic operator.
     * @this Blockly.Block
     */
    init: function () {
        var OPERATORS =
            [
                [Blockly.Msg.MATH_ADDITION_SYMBOL, 'ADD'],
                [Blockly.Msg.MATH_SUBTRACTION_SYMBOL, 'MINUS'],
                [Blockly.Msg.MATH_MULTIPLICATION_SYMBOL, 'MULTIPLY'],
                [Blockly.Msg.MATH_DIVISION_SYMBOL, 'DIVIDE'],
                [Blockly.Msg.MATH_POWER_SYMBOL, 'POWER']
            ];
        this.setHelpUrl(Blockly.Msg.MATH_ARITHMETIC_HELPURL);
        this.setColour(230);
        this.setOutput(true, 'Number');
        this.appendValueInput('A')
            .setCheck('Number');
        this.appendValueInput('B')
            .setCheck('Number')
            .appendField(new Blockly.FieldDropdown(OPERATORS), 'OP');
        this.setInputsInline(true);
        // Assign 'this' to a variable for use in the tooltip closure below.
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('OP');
            var TOOLTIPS = {
                ADD: Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_ADD,
                MINUS: Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_MINUS,
                MULTIPLY: Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_MULTIPLY,
                DIVIDE: Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_DIVIDE,
                POWER: Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_POWER
            };
            return TOOLTIPS[mode];
        });
    }
};

Blockly.Blocks['math_single'] = {
    /**
     * Block for advanced math operators with single operand.
     * @this Blockly.Block
     */
    init: function () {
        var OPERATORS =
            [
                [Blockly.Msg.MATH_SINGLE_OP_ROOT, 'ROOT'],
                [Blockly.Msg.MATH_SINGLE_OP_ABSOLUTE, 'ABS'],
                ['-', 'NEG'],
                ['ln', 'LN'],
                ['log10', 'LOG10'],
                ['e^', 'EXP'],
                ['10^', 'POW10']
            ];
        this.setHelpUrl(Blockly.Msg.MATH_SINGLE_HELPURL);
        this.setColour(230);
        this.setOutput(true, 'Number');
        this.interpolateMsg('%1 %2',
            ['OP', new Blockly.FieldDropdown(OPERATORS)],
            ['NUM', 'Number', Blockly.ALIGN_RIGHT],
            Blockly.ALIGN_RIGHT);
        // Assign 'this' to a variable for use in the tooltip closure below.
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('OP');
            var TOOLTIPS = {
                ROOT: Blockly.Msg.MATH_SINGLE_TOOLTIP_ROOT,
                ABS: Blockly.Msg.MATH_SINGLE_TOOLTIP_ABS,
                NEG: Blockly.Msg.MATH_SINGLE_TOOLTIP_NEG,
                LN: Blockly.Msg.MATH_SINGLE_TOOLTIP_LN,
                LOG10: Blockly.Msg.MATH_SINGLE_TOOLTIP_LOG10,
                EXP: Blockly.Msg.MATH_SINGLE_TOOLTIP_EXP,
                POW10: Blockly.Msg.MATH_SINGLE_TOOLTIP_POW10
            };
            return TOOLTIPS[mode];
        });
    }
};

Blockly.Blocks['math_trig'] = {
    /**
     * Block for trigonometry operators.
     * @this Blockly.Block
     */
    init: function () {
        var OPERATORS =
            [
                [Blockly.Msg.MATH_TRIG_SIN, 'SIN'],
                [Blockly.Msg.MATH_TRIG_COS, 'COS'],
                [Blockly.Msg.MATH_TRIG_TAN, 'TAN'],
                [Blockly.Msg.MATH_TRIG_ASIN, 'ASIN'],
                [Blockly.Msg.MATH_TRIG_ACOS, 'ACOS'],
                [Blockly.Msg.MATH_TRIG_ATAN, 'ATAN']
            ];
        this.setHelpUrl(Blockly.Msg.MATH_TRIG_HELPURL);
        this.setColour(230);
        this.setOutput(true, 'Number');
        this.appendValueInput('NUM')
            .setCheck('Number')
            .appendField(new Blockly.FieldDropdown(OPERATORS), 'OP');
        // Assign 'this' to a variable for use in the tooltip closure below.
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('OP');
            var TOOLTIPS = {
                SIN: Blockly.Msg.MATH_TRIG_TOOLTIP_SIN,
                COS: Blockly.Msg.MATH_TRIG_TOOLTIP_COS,
                TAN: Blockly.Msg.MATH_TRIG_TOOLTIP_TAN,
                ASIN: Blockly.Msg.MATH_TRIG_TOOLTIP_ASIN,
                ACOS: Blockly.Msg.MATH_TRIG_TOOLTIP_ACOS,
                ATAN: Blockly.Msg.MATH_TRIG_TOOLTIP_ATAN
            };
            return TOOLTIPS[mode];
        });
    }
};

Blockly.Blocks['math_constant'] = {
    /**
     * Block for constants: PI, E, the Golden Ratio, sqrt(2), 1/sqrt(2), INFINITY.
     * @this Blockly.Block
     */
    init: function () {
        var CONSTANTS =
            [
                ['\u03c0', 'PI'],
                ['e', 'E'],
                ['\u03c6', 'GOLDEN_RATIO'],
                ['sqrt(2)', 'SQRT2'],
                ['sqrt(\u00bd)', 'SQRT1_2'],
                ['\u221e', 'INFINITY']
            ];
        this.setHelpUrl(Blockly.Msg.MATH_CONSTANT_HELPURL);
        this.setColour(230);
        this.setOutput(true, 'Number');
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown(CONSTANTS), 'CONSTANT');
        this.setTooltip(Blockly.Msg.MATH_CONSTANT_TOOLTIP);
    }
};

Blockly.Blocks['math_number_property'] = {
    /**
     * Block for checking if a number is even, odd, prime, whole, positive,
     * negative or if it is divisible by certain number.
     * @this Blockly.Block
     */
    init: function () {
        var PROPERTIES =
            [
                [Blockly.Msg.MATH_IS_EVEN, 'EVEN'],
                [Blockly.Msg.MATH_IS_ODD, 'ODD'],
                [Blockly.Msg.MATH_IS_PRIME, 'PRIME'],
                [Blockly.Msg.MATH_IS_WHOLE, 'WHOLE'],
                [Blockly.Msg.MATH_IS_POSITIVE, 'POSITIVE'],
                [Blockly.Msg.MATH_IS_NEGATIVE, 'NEGATIVE'],
                [Blockly.Msg.MATH_IS_DIVISIBLE_BY, 'DIVISIBLE_BY']
            ];
        this.setColour(230);
        this.appendValueInput('NUMBER_TO_CHECK')
            .setCheck('Number');
        var dropdown = new Blockly.FieldDropdown(PROPERTIES, function (option) {
            var divisorInput = (option == 'DIVISIBLE_BY');
            this.sourceBlock_.updateShape_(divisorInput);
        });
        this.appendDummyInput()
            .appendField(dropdown, 'PROPERTY');
        this.setInputsInline(true);
        this.setOutput(true, 'Boolean');
        this.setTooltip(Blockly.Msg.MATH_IS_TOOLTIP);
    },
    /**
     * Create XML to represent whether the 'divisorInput' should be present.
     * @return {Array} XML storage element.
     * @this Blockly.Block
     */
    mutationToDom: function () {
        var container = [];
        var parameter = {};
        parameter.name = 'divisor_input';
        parameter.value = this.getFieldValue('PROPERTY') == 'DIVISIBLE_BY';
        container.push(parameter);

        return container;
    },
    /**
     * Parse XML to restore the 'divisorInput'.
     * @param {!Element} xmlElement XML storage element.
     * @this Blockly.Block
     */
    domToMutation: function (xmlElement) {
        var elements = [].concat(xmlElement);
        for (var x = 0; x < elements.length; x++) {
            if (elements[x].name.toLowerCase() == 'divisor_input') {
                this.updateShape_(Blockly.Json.parseBoolean(elements[x].value));
            }
        }
    },
    /**
     * Modify this block to have (or not have) an input for 'is divisible by'.
     * @param {boolean} divisorInput True if this block has a divisor input.
     * @private
     * @this Blockly.Block
     */
    updateShape_: function (divisorInput) {
        // Add or remove a Value Input.
        var inputExists = this.getInput('DIVISOR');
        if (divisorInput) {
            if (!inputExists) {
                this.appendValueInput('DIVISOR')
                    .setCheck('Number');
            }
        } else if (inputExists) {
            this.removeInput('DIVISOR');
        }
    }
};

Blockly.Blocks['math_change'] = {
    /**
     * Block for adding to a variable in place.
     * @this Blockly.Block
     */
    init: function () {
        this.setHelpUrl(Blockly.Msg.MATH_CHANGE_HELPURL);
        this.setColour(230);
        this.interpolateMsg(
            // TODO: Combine these messages instead of using concatenation.
                Blockly.Msg.MATH_CHANGE_TITLE_CHANGE + ' %1 ' +
                Blockly.Msg.MATH_CHANGE_INPUT_BY + ' %2',
            ['VAR', new Blockly.FieldVariable(Blockly.Msg.MATH_CHANGE_TITLE_ITEM)],
            ['DELTA', 'Number', Blockly.ALIGN_RIGHT],
            Blockly.ALIGN_RIGHT);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        // Assign 'this' to a variable for use in the tooltip closure below.
        var thisBlock = this;
        this.setTooltip(function () {
            return Blockly.Msg.MATH_CHANGE_TOOLTIP.replace('%1',
                thisBlock.getFieldValue('VAR'));
        });
    },
    /**
     * Return all variables referenced by this block.
     * @return {!Array.<string>} List of variable names.
     * @this Blockly.Block
     */
    getVars: function () {
        return [this.getFieldValue('VAR')];
    },
    /**
     * Notification that a variable is renaming.
     * If the name matches one of this block's variables, rename it.
     * @param {string} oldName Previous name of variable.
     * @param {string} newName Renamed variable.
     * @this Blockly.Block
     */
    renameVar: function (oldName, newName) {
        if (Blockly.Names.equals(oldName, this.getFieldValue('VAR'))) {
            this.setFieldValue(newName, 'VAR');
        }
    }
};

Blockly.Blocks['math_round'] = {
    /**
     * Block for rounding functions.
     * @this Blockly.Block
     */
    init: function () {
        var OPERATORS =
            [
                [Blockly.Msg.MATH_ROUND_OPERATOR_ROUND, 'ROUND'],
                [Blockly.Msg.MATH_ROUND_OPERATOR_ROUNDUP, 'ROUNDUP'],
                [Blockly.Msg.MATH_ROUND_OPERATOR_ROUNDDOWN, 'ROUNDDOWN']
            ];
        this.setHelpUrl(Blockly.Msg.MATH_ROUND_HELPURL);
        this.setColour(230);
        this.setOutput(true, 'Number');
        this.appendValueInput('NUM')
            .setCheck('Number')
            .appendField(new Blockly.FieldDropdown(OPERATORS), 'OP');
        this.setTooltip(Blockly.Msg.MATH_ROUND_TOOLTIP);
    }
};

Blockly.Blocks['math_on_list'] = {
    /**
     * Block for evaluating a list of numbers to return sum, average, min, max,
     * etc.  Some functions also work on text (min, max, mode, median).
     * @this Blockly.Block
     */
    init: function () {
        var OPERATORS =
            [
                [Blockly.Msg.MATH_ONLIST_OPERATOR_SUM, 'SUM'],
                [Blockly.Msg.MATH_ONLIST_OPERATOR_MIN, 'MIN'],
                [Blockly.Msg.MATH_ONLIST_OPERATOR_MAX, 'MAX'],
                [Blockly.Msg.MATH_ONLIST_OPERATOR_AVERAGE, 'AVERAGE'],
                [Blockly.Msg.MATH_ONLIST_OPERATOR_MEDIAN, 'MEDIAN'],
                [Blockly.Msg.MATH_ONLIST_OPERATOR_MODE, 'MODE'],
                [Blockly.Msg.MATH_ONLIST_OPERATOR_STD_DEV, 'STD_DEV'],
                [Blockly.Msg.MATH_ONLIST_OPERATOR_RANDOM, 'RANDOM']
            ];
        // Assign 'this' to a variable for use in the closure below.
        var thisBlock = this;
        this.setHelpUrl(Blockly.Msg.MATH_ONLIST_HELPURL);
        this.setColour(230);
        this.setOutput(true, 'Number');
        var dropdown = new Blockly.FieldDropdown(OPERATORS, function (newOp) {
            if (newOp == 'MODE') {
                thisBlock.outputConnection.setCheck('Array');
            } else {
                thisBlock.outputConnection.setCheck('Number');
            }
        });
        this.appendValueInput('LIST')
            .setCheck('Array')
            .appendField(dropdown, 'OP');
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('OP');
            var TOOLTIPS = {
                SUM: Blockly.Msg.MATH_ONLIST_TOOLTIP_SUM,
                MIN: Blockly.Msg.MATH_ONLIST_TOOLTIP_MIN,
                MAX: Blockly.Msg.MATH_ONLIST_TOOLTIP_MAX,
                AVERAGE: Blockly.Msg.MATH_ONLIST_TOOLTIP_AVERAGE,
                MEDIAN: Blockly.Msg.MATH_ONLIST_TOOLTIP_MEDIAN,
                MODE: Blockly.Msg.MATH_ONLIST_TOOLTIP_MODE,
                STD_DEV: Blockly.Msg.MATH_ONLIST_TOOLTIP_STD_DEV,
                RANDOM: Blockly.Msg.MATH_ONLIST_TOOLTIP_RANDOM
            };
            return TOOLTIPS[mode];
        });
    }
};

Blockly.Blocks['math_modulo'] = {
    /**
     * Block for remainder of a division.
     * @this Blockly.Block
     */
    init: function () {
        this.setHelpUrl(Blockly.Msg.MATH_MODULO_HELPURL);
        this.setColour(230);
        this.setOutput(true, 'Number');
        this.interpolateMsg(Blockly.Msg.MATH_MODULO_TITLE,
            ['DIVIDEND', 'Number', Blockly.ALIGN_RIGHT],
            ['DIVISOR', 'Number', Blockly.ALIGN_RIGHT],
            Blockly.ALIGN_RIGHT);
        this.setInputsInline(true);
        this.setTooltip(Blockly.Msg.MATH_MODULO_TOOLTIP);
    }
};

Blockly.Blocks['math_constrain'] = {
    /**
     * Block for constraining a number between two limits.
     * @this Blockly.Block
     */
    init: function () {
        this.setHelpUrl(Blockly.Msg.MATH_CONSTRAIN_HELPURL);
        this.setColour(230);
        this.setOutput(true, 'Number');
        this.interpolateMsg(Blockly.Msg.MATH_CONSTRAIN_TITLE,
            ['VALUE', 'Number', Blockly.ALIGN_RIGHT],
            ['LOW', 'Number', Blockly.ALIGN_RIGHT],
            ['HIGH', 'Number', Blockly.ALIGN_RIGHT],
            Blockly.ALIGN_RIGHT)
        this.setInputsInline(true);
        this.setTooltip(Blockly.Msg.MATH_CONSTRAIN_TOOLTIP);
    }
};

Blockly.Blocks['math_random_int'] = {
    /**
     * Block for random integer between [X] and [Y].
     * @this Blockly.Block
     */
    init: function () {
        this.setHelpUrl(Blockly.Msg.MATH_RANDOM_INT_HELPURL);
        this.setColour(230);
        this.setOutput(true, 'Number');
        this.interpolateMsg(Blockly.Msg.MATH_RANDOM_INT_TITLE,
            ['FROM', 'Number', Blockly.ALIGN_RIGHT],
            ['TO', 'Number', Blockly.ALIGN_RIGHT],
            Blockly.ALIGN_RIGHT);
        this.setInputsInline(true);
        this.setTooltip(Blockly.Msg.MATH_RANDOM_INT_TOOLTIP);
    }
};

Blockly.Blocks['math_random_float'] = {
    /**
     * Block for random fraction between 0 and 1.
     * @this Blockly.Block
     */
    init: function () {
        this.setHelpUrl(Blockly.Msg.MATH_RANDOM_FLOAT_HELPURL);
        this.setColour(230);
        this.setOutput(true, 'Number');
        this.appendDummyInput()
            .appendField(Blockly.Msg.MATH_RANDOM_FLOAT_TITLE_RANDOM);
        this.setTooltip(Blockly.Msg.MATH_RANDOM_FLOAT_TOOLTIP);
    }
};

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
 * @fileoverview Procedure blocks for Blockly.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

Blockly.Blocks.procedures = {};

Blockly.Blocks['procedures_defnoreturn'] = {
    /**
     * Block for defining a procedure with no return value.
     * @this Blockly.Block
     */
    init: function () {
        this.setHelpUrl(Blockly.Msg.PROCEDURES_DEFNORETURN_HELPURL);
        this.setColour(290);
        var name = Blockly.Procedures.findLegalName(
            Blockly.Msg.PROCEDURES_DEFNORETURN_PROCEDURE, this);
        this.appendDummyInput()
            .appendField(Blockly.Msg.PROCEDURES_DEFNORETURN_TITLE)
            .appendField(new Blockly.FieldTextInput(name,
                Blockly.Procedures.rename), 'NAME')
            .appendField('', 'PARAMS');
        this.appendStatementInput('STACK')
            .appendField(Blockly.Msg.PROCEDURES_DEFNORETURN_DO);
        this.setMutator(new Blockly.Mutator(['procedures_mutatorarg']));
        this.setTooltip(Blockly.Msg.PROCEDURES_DEFNORETURN_TOOLTIP);
        this.arguments_ = [];
    },
    /**
     * Update the display of parameters for this procedure definition block.
     * Display a warning if there are duplicately named parameters.
     * @private
     * @this Blockly.Block
     */
    updateParams_: function () {
        // Check for duplicated arguments.
        var badArg = false;
        var hash = {};
        for (var x = 0; x < this.arguments_.length; x++) {
            if (hash['arg_' + this.arguments_[x].toLowerCase()]) {
                badArg = true;
                break;
            }
            hash['arg_' + this.arguments_[x].toLowerCase()] = true;
        }
        if (badArg) {
            this.setWarningText(Blockly.Msg.PROCEDURES_DEF_DUPLICATE_WARNING);
        } else {
            this.setWarningText(null);
        }
        // Merge the arguments into a human-readable list.
        var paramString = '';
        if (this.arguments_.length) {
            paramString = Blockly.Msg.PROCEDURES_BEFORE_PARAMS +
                ' ' + this.arguments_.join(', ');
        }
        this.setFieldValue(paramString, 'PARAMS');
    },
    /**
     * Create XML to represent the argument inputs.
     * @return {Array} XML storage element.
     * @this Blockly.Block
     */
    mutationToDom: function () {
        var container = [];
        for (var x = 0; x < this.arguments_.length; x++) {
            var parameter = {};
            parameter.name = 'arg';
            parameter.value = this.arguments_[x];
            container.push(parameter);
        }
        return container;
    },
    /**
     * Parse XML to restore the argument inputs.
     * @param {!Element} xmlElement XML storage element.
     * @this Blockly.Block
     */
    domToMutation: function (xmlElement) {
        this.arguments_ = [];
        var elements = [].concat(xmlElement);
        for (var x = 0; x < elements.length; x++) {
            if (elements[x].name.toLowerCase() == 'arg') {
                this.arguments_.push(elements[x].value);
            }
        }
        this.updateParams_();
    },
    /**
     * Populate the mutator's dialog with this block's components.
     * @param {!Blockly.Workspace} workspace Mutator's workspace.
     * @return {!Blockly.Block} Root block in mutator.
     * @this Blockly.Block
     */
    decompose: function (workspace) {
        var containerBlock = Blockly.Block.obtain(workspace,
            'procedures_mutatorcontainer');
        containerBlock.initSvg();
        var connection = containerBlock.getInput('STACK').connection;
        for (var x = 0; x < this.arguments_.length; x++) {
            var paramBlock = Blockly.Block.obtain(workspace, 'procedures_mutatorarg');
            paramBlock.initSvg();
            paramBlock.setFieldValue(this.arguments_[x], 'NAME');
            // Store the old location.
            paramBlock.oldLocation = x;
            connection.connect(paramBlock.previousConnection);
            connection = paramBlock.nextConnection;
        }
        // Initialize procedure's callers with blank IDs.
        Blockly.Procedures.mutateCallers(this.getFieldValue('NAME'),
            this.workspace, this.arguments_, null);
        return containerBlock;
    },
    /**
     * Reconfigure this block based on the mutator dialog's components.
     * @param {!Blockly.Block} containerBlock Root block in mutator.
     * @this Blockly.Block
     */
    compose: function (containerBlock) {
        this.arguments_ = [];
        this.paramIds_ = [];
        var paramBlock = containerBlock.getInputTargetBlock('STACK');
        while (paramBlock) {
            this.arguments_.push(paramBlock.getFieldValue('NAME'));
            this.paramIds_.push(paramBlock.id);
            paramBlock = paramBlock.nextConnection &&
                paramBlock.nextConnection.targetBlock();
        }
        this.updateParams_();
        Blockly.Procedures.mutateCallers(this.getFieldValue('NAME'),
            this.workspace, this.arguments_, this.paramIds_);
    },
    /**
     * Dispose of any callers.
     * @this Blockly.Block
     */
    dispose: function () {
        var name = this.getFieldValue('NAME');
        Blockly.Procedures.disposeCallers(name, this.workspace);
        // Call parent's destructor.
        Blockly.Block.prototype.dispose.apply(this, arguments);
    },
    /**
     * Return the signature of this procedure definition.
     * @return {!Array} Tuple containing three elements:
     *     - the name of the defined procedure,
     *     - a list of all its arguments,
     *     - that it DOES NOT have a return value.
     * @this Blockly.Block
     */
    getProcedureDef: function () {
        return [this.getFieldValue('NAME'), this.arguments_, false];
    },
    /**
     * Return all variables referenced by this block.
     * @return {!Array.<string>} List of variable names.
     * @this Blockly.Block
     */
    getVars: function () {
        return this.arguments_;
    },
    /**
     * Notification that a variable is renaming.
     * If the name matches one of this block's variables, rename it.
     * @param {string} oldName Previous name of variable.
     * @param {string} newName Renamed variable.
     * @this Blockly.Block
     */
    renameVar: function (oldName, newName) {
        var change = false;
        for (var x = 0; x < this.arguments_.length; x++) {
            if (Blockly.Names.equals(oldName, this.arguments_[x])) {
                this.arguments_[x] = newName;
                change = true;
            }
        }
        if (change) {
            this.updateParams_();
            // Update the mutator's variables if the mutator is open.
            if (this.mutator.isVisible_()) {
                var blocks = this.mutator.workspace_.getAllBlocks();
                for (var x = 0, block; block = blocks[x]; x++) {
                    if (block.type == 'procedures_mutatorarg' &&
                        Blockly.Names.equals(oldName, block.getFieldValue('NAME'))) {
                        block.setFieldValue(newName, 'NAME');
                    }
                }
            }
        }
    },
    /**
     * Add custom menu options to this block's context menu.
     * @param {!Array} options List of menu options to add to.
     * @this Blockly.Block
     */
    customContextMenu: function (options) {
        // Add option to create caller.
        var option = {enabled: true};
        var name = this.getFieldValue('NAME');
        option.text = Blockly.Msg.PROCEDURES_CREATE_DO.replace('%1', name);

        var xmlMutation = Ext.DomHelper.createDom({tag: "mutation"})
        xmlMutation.setAttribute('name', name);
        for (var x = 0; x < this.arguments_.length; x++) {
            var xmlArg = Ext.DomHelper.createDom({tag: "arg"})
            xmlArg.setAttribute('name', this.arguments_[x]);
            xmlMutation.appendChild(xmlArg);
        }
        var xmlBlock = Ext.DomHelper.createDom({tag: "block", children: xmlMutation})
        xmlBlock.setAttribute('type', this.callType_);
        option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);

        options.push(option);
        // Add options to create getters for each parameter.
        for (var x = 0; x < this.arguments_.length; x++) {
            var option = {enabled: true};
            var name = this.arguments_[x];
            option.text = Blockly.Msg.VARIABLES_SET_CREATE_GET.replace('%1', name);
            var xmlField = Ext.DomHelper.createDom({tag: "field", children: name})
            xmlField.setAttribute('name', 'VAR');
            var xmlBlock = Ext.DomHelper.createDom({tag: "block", children: xmlField})
            xmlBlock.setAttribute('type', 'variables_get');
            option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
            options.push(option);
        }
    },
    callType_: 'procedures_callnoreturn'
};

Blockly.Blocks['procedures_defreturn'] = {
    /**
     * Block for defining a procedure with a return value.
     * @this Blockly.Block
     */
    init: function () {
        this.setHelpUrl(Blockly.Msg.PROCEDURES_DEFRETURN_HELPURL);
        this.setColour(290);
        var name = Blockly.Procedures.findLegalName(
            Blockly.Msg.PROCEDURES_DEFRETURN_PROCEDURE, this);
        this.appendDummyInput()
            .appendField(Blockly.Msg.PROCEDURES_DEFRETURN_TITLE)
            .appendField(new Blockly.FieldTextInput(name,
                Blockly.Procedures.rename), 'NAME')
            .appendField('', 'PARAMS');
        this.appendStatementInput('STACK')
            .appendField(Blockly.Msg.PROCEDURES_DEFRETURN_DO);
        this.appendValueInput('RETURN')
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField(Blockly.Msg.PROCEDURES_DEFRETURN_RETURN);
        this.setMutator(new Blockly.Mutator(['procedures_mutatorarg']));
        this.setTooltip(Blockly.Msg.PROCEDURES_DEFRETURN_TOOLTIP);
        this.arguments_ = [];
    },
    updateParams_: Blockly.Blocks['procedures_defnoreturn'].updateParams_,
    mutationToDom: Blockly.Blocks['procedures_defnoreturn'].mutationToDom,
    domToMutation: Blockly.Blocks['procedures_defnoreturn'].domToMutation,
    decompose: Blockly.Blocks['procedures_defnoreturn'].decompose,
    compose: Blockly.Blocks['procedures_defnoreturn'].compose,
    dispose: Blockly.Blocks['procedures_defnoreturn'].dispose,
    /**
     * Return the signature of this procedure definition.
     * @return {!Array} Tuple containing three elements:
     *     - the name of the defined procedure,
     *     - a list of all its arguments,
     *     - that it DOES have a return value.
     * @this Blockly.Block
     */
    getProcedureDef: function () {
        return [this.getFieldValue('NAME'), this.arguments_, true];
    },
    getVars: Blockly.Blocks['procedures_defnoreturn'].getVars,
    renameVar: Blockly.Blocks['procedures_defnoreturn'].renameVar,
    customContextMenu: Blockly.Blocks['procedures_defnoreturn'].customContextMenu,
    callType_: 'procedures_callreturn'
};

Blockly.Blocks['procedures_mutatorcontainer'] = {
    /**
     * Mutator block for procedure container.
     * @this Blockly.Block
     */
    init: function () {
        this.setColour(290);
        this.appendDummyInput()
            .appendField(Blockly.Msg.PROCEDURES_MUTATORCONTAINER_TITLE);
        this.appendStatementInput('STACK');
        this.setTooltip(Blockly.Msg.PROCEDURES_MUTATORCONTAINER_TOOLTIP);
        this.contextMenu = false;
    }
};

Blockly.Blocks['procedures_mutatorarg'] = {
    /**
     * Mutator block for procedure argument.
     * @this Blockly.Block
     */
    init: function () {
        this.setColour(290);
        this.appendDummyInput()
            .appendField(Blockly.Msg.PROCEDURES_MUTATORARG_TITLE)
            .appendField(new Blockly.FieldTextInput('x', this.validator_), 'NAME');
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip(Blockly.Msg.PROCEDURES_MUTATORARG_TOOLTIP);
        this.contextMenu = false;
    },
    /**
     * Obtain a valid name for the procedure.
     * Merge runs of whitespace.  Strip leading and trailing whitespace.
     * Beyond this, all names are legal.
     * @param {string} newVar User-supplied name.
     * @return {?string} Valid name, or null if a name was not specified.
     * @private
     * @this Blockly.Block
     */
    validator_: function (newVar) {
        newVar = newVar.replace(/[\s\xa0]+/g, ' ').replace(/^ | $/g, '');
        return newVar || null;
    }
};

Blockly.Blocks['procedures_callnoreturn'] = {
    /**
     * Block for calling a procedure with no return value.
     * @this Blockly.Block
     */
    init: function () {
        this.setHelpUrl(Blockly.Msg.PROCEDURES_CALLNORETURN_HELPURL);
        this.setColour(290);
        this.appendDummyInput()
            .appendField(Blockly.Msg.PROCEDURES_CALLNORETURN_CALL)
            .appendField('', 'NAME');
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        // Tooltip is set in domToMutation.
        this.arguments_ = [];
        this.quarkConnections_ = null;
        this.quarkArguments_ = null;
    },
    /**
     * Returns the name of the procedure this block calls.
     * @return {string} Procedure name.
     * @this Blockly.Block
     */
    getProcedureCall: function () {
        // The NAME field is guaranteed to exist, null will never be returned.
        return /** @type {string} */ (this.getFieldValue('NAME'));
    },
    /**
     * Notification that a procedure is renaming.
     * If the name matches this block's procedure, rename it.
     * @param {string} oldName Previous name of procedure.
     * @param {string} newName Renamed procedure.
     * @this Blockly.Block
     */
    renameProcedure: function (oldName, newName) {
        if (Blockly.Names.equals(oldName, this.getProcedureCall())) {
            this.setFieldValue(newName, 'NAME');
            this.setTooltip(
                (this.outputConnection ? Blockly.Msg.PROCEDURES_CALLRETURN_TOOLTIP
                    : Blockly.Msg.PROCEDURES_CALLNORETURN_TOOLTIP)
                    .replace('%1', newName));
        }
    },
    /**
     * Notification that the procedure's parameters have changed.
     * @param {!Array.<string>} paramNames New param names, e.g. ['x', 'y', 'z'].
     * @param {!Array.<string>} paramIds IDs of params (consistent for each
     *     parameter through the life of a mutator, regardless of param renaming),
     *     e.g. ['piua', 'f8b_', 'oi.o'].
     * @this Blockly.Block
     */
    setProcedureParameters: function (paramNames, paramIds) {
        // Data structures:
        // this.arguments = ['x', 'y']
        //     Existing param names.
        // this.quarkConnections_ {piua: null, f8b_: Blockly.Connection}
        //     Look-up of paramIds to connections plugged into the call block.
        // this.quarkArguments_ = ['piua', 'f8b_']
        //     Existing param IDs.
        // Note that quarkConnections_ may include IDs that no longer exist, but
        // which might reappear if a param is reattached in the mutator.
        if (!paramIds) {
            // Reset the quarks (a mutator is about to open).
            this.quarkConnections_ = {};
            this.quarkArguments_ = null;
            return;
        }
        if (paramIds.length != paramNames.length) {
            throw 'Error: paramNames and paramIds must be the same length.';
        }
        if (!this.quarkArguments_) {
            // Initialize tracking for this block.
            this.quarkConnections_ = {};
            if (paramNames.join('\n') == this.arguments_.join('\n')) {
                // No change to the parameters, allow quarkConnections_ to be
                // populated with the existing connections.
                this.quarkArguments_ = paramIds;
            } else {
                this.quarkArguments_ = [];
            }
        }
        // Switch off rendering while the block is rebuilt.
        var savedRendered = this.rendered;
        this.rendered = false;
        // Update the quarkConnections_ with existing connections.
        for (var x = this.arguments_.length - 1; x >= 0; x--) {
            var input = this.getInput('ARG' + x);
            if (input) {
                var connection = input.connection.targetConnection;
                this.quarkConnections_[this.quarkArguments_[x]] = connection;
                // Disconnect all argument blocks and remove all inputs.
                this.removeInput('ARG' + x);
            }
        }
        // Rebuild the block's arguments.
        this.arguments_ = [].concat(paramNames);
        this.quarkArguments_ = paramIds;
        for (var x = 0; x < this.arguments_.length; x++) {
            var input = this.appendValueInput('ARG' + x)
                .setAlign(Blockly.ALIGN_RIGHT)
                .appendField(this.arguments_[x]);
            if (this.quarkArguments_) {
                // Reconnect any child blocks.
                var quarkName = this.quarkArguments_[x];
                if (quarkName in this.quarkConnections_) {
                    var connection = this.quarkConnections_[quarkName];
                    if (!connection || connection.targetConnection ||
                        connection.sourceBlock_.workspace != this.workspace) {
                        // Block no longer exists or has been attached elsewhere.
                        delete this.quarkConnections_[quarkName];
                    } else {
                        input.connection.connect(connection);
                    }
                }
            }
        }
        // Restore rendering and show the changes.
        this.rendered = savedRendered;
        if (this.rendered) {
            this.render();
        }
    },
    /**
     * Create XML to represent the (non-editable) name and arguments.
     * @return {Array} XML storage element.
     * @this Blockly.Block
     */
    mutationToDom: function () {
        var container = [];
        for (var x = 0; x < this.arguments_.length; x++) {
            var parameter = {};
            parameter.name = 'arg';
            parameter.value = this.arguments_[x];
            container.push(parameter);
        }

        return container;
    },
    /**
     * Parse XML to restore the (non-editable) name and parameters.
     * @param {!Element} xmlElement XML storage element.
     * @this Blockly.Block
     */
    domToMutation: function (xmlElement) {
        this.arguments_ = [];
        var elements = [].concat(xmlElement);
        for (var x = 0; x < elements.length; x++) {
            if (elements[x].name.toLowerCase() == 'arg') {
                this.arguments_.push(elements[x].value);
            }
        }

        var name = xmlElement.getAttribute('name');
        this.setFieldValue(name, 'NAME');
        this.setTooltip(
            (this.outputConnection ? Blockly.Msg.PROCEDURES_CALLRETURN_TOOLTIP
                : Blockly.Msg.PROCEDURES_CALLNORETURN_TOOLTIP).replace('%1', name));
        var def = Blockly.Procedures.getDefinition(name, this.workspace);
        if (def && def.mutator.isVisible()) {
            // Initialize caller with the mutator's IDs.
            this.setProcedureParameters(def.arguments_, def.paramIds_);
        } else {
            this.arguments_ = [];
            for (var x = 0, childNode; childNode = xmlElement.childNodes[x]; x++) {
                if (childNode.nodeName.toLowerCase() == 'arg') {
                    this.arguments_.push(childNode.getAttribute('name'));
                }
            }
            // For the second argument (paramIds) use the arguments list as a dummy
            // list.
            this.setProcedureParameters(this.arguments_, this.arguments_);
        }
    },
    /**
     * Notification that a variable is renaming.
     * If the name matches one of this block's variables, rename it.
     * @param {string} oldName Previous name of variable.
     * @param {string} newName Renamed variable.
     * @this Blockly.Block
     */
    renameVar: function (oldName, newName) {
        for (var x = 0; x < this.arguments_.length; x++) {
            if (Blockly.Names.equals(oldName, this.arguments_[x])) {
                this.arguments_[x] = newName;
                this.getInput('ARG' + x).fieldRow[0].setText(newName);
            }
        }
    },
    /**
     * Add menu option to find the definition block for this call.
     * @param {!Array} options List of menu options to add to.
     * @this Blockly.Block
     */
    customContextMenu: function (options) {
        var option = {enabled: true};
        option.text = Blockly.Msg.PROCEDURES_HIGHLIGHT_DEF;
        var name = this.getProcedureCall();
        var workspace = this.workspace;
        option.callback = function () {
            var def = Blockly.Procedures.getDefinition(name, workspace);
            def && def.select();
        };
        options.push(option);
    }
};

Blockly.Blocks['procedures_callreturn'] = {
    /**
     * Block for calling a procedure with a return value.
     * @this Blockly.Block
     */
    init: function () {
        this.setHelpUrl(Blockly.Msg.PROCEDURES_CALLRETURN_HELPURL);
        this.setColour(290);
        this.appendDummyInput()
            .appendField(Blockly.Msg.PROCEDURES_CALLRETURN_CALL)
            .appendField('', 'NAME');
        this.setOutput(true);
        // Tooltip is set in domToMutation.
        this.arguments_ = [];
        this.quarkConnections_ = null;
        this.quarkArguments_ = null;
    },
    getProcedureCall: Blockly.Blocks['procedures_callnoreturn'].getProcedureCall,
    renameProcedure: Blockly.Blocks['procedures_callnoreturn'].renameProcedure,
    setProcedureParameters: Blockly.Blocks['procedures_callnoreturn'].setProcedureParameters,
    mutationToDom: Blockly.Blocks['procedures_callnoreturn'].mutationToDom,
    domToMutation: Blockly.Blocks['procedures_callnoreturn'].domToMutation,
    renameVar: Blockly.Blocks['procedures_callnoreturn'].renameVar,
    customContextMenu: Blockly.Blocks['procedures_callnoreturn'].customContextMenu
};

Blockly.Blocks['procedures_ifreturn'] = {
    /**
     * Block for conditionally returning a value from a procedure.
     * @this Blockly.Block
     */
    init: function () {
        this.setHelpUrl('http://c2.com/cgi/wiki?GuardClause');
        this.setColour(290);
        this.appendValueInput('CONDITION')
            .setCheck('Boolean')
            .appendField(Blockly.Msg.CONTROLS_IF_MSG_IF);
        this.appendValueInput('VALUE')
            .appendField(Blockly.Msg.PROCEDURES_DEFRETURN_RETURN);
        this.setInputsInline(true);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip(Blockly.Msg.PROCEDURES_IFRETURN_TOOLTIP);
        this.hasReturnValue_ = true;
    },
    /**
     * Create XML to represent whether this block has a return value.
     * @return {Array} XML storage element.
     * @this Blockly.Block
     */
    mutationToDom: function () {
        var container = [];
        var parameter = {};
        parameter.name = 'arg';
        parameter.value = Number(this.hasReturnValue_);
        container.push(parameter);

        return container;
    },
    /**
     * Parse XML to restore whether this block has a return value.
     * @param {!Element} xmlElement XML storage element.
     * @this Blockly.Block
     */
    domToMutation: function (xmlElement) {
        this.arguments_ = [];
        var elements = [].concat(xmlElement);
        for (var x = 0; x < elements.length; x++) {
            if (elements[x].name.toLowerCase() == 'value') {
                this.hasReturnValue_ = (elements[x].value == 1);
                if (!this.hasReturnValue_) {
                    this.removeInput('VALUE');
                    this.appendDummyInput('VALUE')
                        .appendField(Blockly.Msg.PROCEDURES_DEFRETURN_RETURN);
                }
            }
        }
    },
    /**
     * Called whenever anything on the workspace changes.
     * Add warning if this flow block is not nested inside a loop.
     * @this Blockly.Block
     */
    onchange: function () {
        if (!this.workspace) {
            // Block has been deleted.
            return;
        }
        var legal = false;
        // Is the block nested in a procedure?
        var block = this;
        do {
            if (block.type == 'procedures_defnoreturn' ||
                block.type == 'procedures_defreturn') {
                legal = true;
                break;
            }
            block = block.getSurroundParent();
        } while (block);
        if (legal) {
            // If needed, toggle whether this block has a return value.
            if (block.type == 'procedures_defnoreturn' && this.hasReturnValue_) {
                this.removeInput('VALUE');
                this.appendDummyInput('VALUE')
                    .appendField(Blockly.Msg.PROCEDURES_DEFRETURN_RETURN);
                this.hasReturnValue_ = false;
            } else if (block.type == 'procedures_defreturn' && !this.hasReturnValue_) {
                this.removeInput('VALUE');
                this.appendValueInput('VALUE')
                    .appendField(Blockly.Msg.PROCEDURES_DEFRETURN_RETURN);
                this.hasReturnValue_ = true;
            }
            this.setWarningText(null);
        } else {
            this.setWarningText(Blockly.Msg.PROCEDURES_IFRETURN_WARNING);
        }
    }
};

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
 * @fileoverview Text blocks for Blockly.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

Blockly.Blocks.text = {};


Blockly.Blocks['text'] = {
    /**
     * Block for text value.
     * @this Blockly.Block
     */
    init: function () {
        this.setHelpUrl(Blockly.Msg.TEXT_TEXT_HELPURL);
        this.setColour(160);
        this.appendDummyInput()
            .appendField(this.newQuote_(true))
            .appendField(new Blockly.FieldTextInput(''), 'TEXT')
            .appendField(this.newQuote_(false));
        this.setOutput(true, 'String');
        this.setTooltip(Blockly.Msg.TEXT_TEXT_TOOLTIP);
    },
    /**
     * Create an image of an open or closed quote.
     * @param {boolean} open True if open quote, false if closed.
     * @return {!Blockly.FieldImage} The field image of the quote.
     * @private
     */
    newQuote_: function (open) {
        if (open == Blockly.RTL) {
            var file = 'quote1.png';
        } else {
            var file = 'quote0.png';
        }
        return new Blockly.FieldImage(Blockly.pathToBlockly + 'media/' + file,
            12, 12, '"');
    }
};

Blockly.Blocks['text_join'] = {
    /**
     * Block for creating a string made up of any number of elements of any type.
     * @this Blockly.Block
     */
    init: function () {
        this.setHelpUrl(Blockly.Msg.TEXT_JOIN_HELPURL);
        this.setColour(160);
        this.appendValueInput('ADD0')
            .appendField(Blockly.Msg.TEXT_JOIN_TITLE_CREATEWITH);
        this.appendValueInput('ADD1');
        this.setOutput(true, 'String');
        this.setMutator(new Blockly.Mutator(['text_create_join_item']));
        this.setTooltip(Blockly.Msg.TEXT_JOIN_TOOLTIP);
        this.itemCount_ = 2;
    },
    /**
     * Create XML to represent number of text inputs.
     * @return {Element} XML storage element.
     * @this Blockly.Block
     */
    mutationToDom: function () {
        var container = document.createElement('mutation');
        container.setAttribute('items', this.itemCount_);
        return container;
    },
    /**
     * Parse XML to restore the text inputs.
     * @param {!Element} xmlElement XML storage element.
     * @this Blockly.Block
     */
    domToMutation: function (xmlElement) {
        for (var x = 0; x < this.itemCount_; x++) {
            this.removeInput('ADD' + x);
        }

        var elements = [].concat(xmlElement);
        for (var x = 0; x < elements.length; x++) {
            if (elements[x].name.toLowerCase() == 'items') {
                this.itemCount_ = parseInt(elements[x].value, 10);
            }
        }

        for (var x = 0; x < this.itemCount_; x++) {
            var input = this.appendValueInput('ADD' + x);
            if (x == 0) {
                input.appendField(Blockly.Msg.TEXT_JOIN_TITLE_CREATEWITH);
            }
        }
        if (this.itemCount_ == 0) {
            this.appendDummyInput('EMPTY')
                .appendField(new Blockly.FieldImage(Blockly.pathToBlockly +
                    'media/quote0.png', 12, 12, '"'))
                .appendField(new Blockly.FieldImage(Blockly.pathToBlockly +
                    'media/quote1.png', 12, 12, '"'));
        }
    },
    /**
     * Populate the mutator's dialog with this block's components.
     * @param {!Blockly.Workspace} workspace Mutator's workspace.
     * @return {!Blockly.Block} Root block in mutator.
     * @this Blockly.Block
     */
    decompose: function (workspace) {
        var containerBlock = Blockly.Block.obtain(workspace,
            'text_create_join_container');
        containerBlock.initSvg();
        var connection = containerBlock.getInput('STACK').connection;
        for (var x = 0; x < this.itemCount_; x++) {
            var itemBlock = Blockly.Block.obtain(workspace, 'text_create_join_item');
            itemBlock.initSvg();
            connection.connect(itemBlock.previousConnection);
            connection = itemBlock.nextConnection;
        }
        return containerBlock;
    },
    /**
     * Reconfigure this block based on the mutator dialog's components.
     * @param {!Blockly.Block} containerBlock Root block in mutator.
     * @this Blockly.Block
     */
    compose: function (containerBlock) {
        // Disconnect all input blocks and remove all inputs.
        if (this.itemCount_ == 0) {
            this.removeInput('EMPTY');
        } else {
            for (var x = this.itemCount_ - 1; x >= 0; x--) {
                this.removeInput('ADD' + x);
            }
        }
        this.itemCount_ = 0;
        // Rebuild the block's inputs.
        var itemBlock = containerBlock.getInputTargetBlock('STACK');
        while (itemBlock) {
            var input = this.appendValueInput('ADD' + this.itemCount_);
            if (this.itemCount_ == 0) {
                input.appendField(Blockly.Msg.TEXT_JOIN_TITLE_CREATEWITH);
            }
            // Reconnect any child blocks.
            if (itemBlock.valueConnection_) {
                input.connection.connect(itemBlock.valueConnection_);
            }
            this.itemCount_++;
            itemBlock = itemBlock.nextConnection &&
                itemBlock.nextConnection.targetBlock();
        }
        if (this.itemCount_ == 0) {
            this.appendDummyInput('EMPTY')
                .appendField(new Blockly.FieldImage(Blockly.pathToBlockly +
                    'media/quote0.png', 12, 12, '"'))
                .appendField(new Blockly.FieldImage(Blockly.pathToBlockly +
                    'media/quote1.png', 12, 12, '"'));
        }
    },
    /**
     * Store pointers to any connected child blocks.
     * @param {!Blockly.Block} containerBlock Root block in mutator.
     * @this Blockly.Block
     */
    saveConnections: function (containerBlock) {
        var itemBlock = containerBlock.getInputTargetBlock('STACK');
        var x = 0;
        while (itemBlock) {
            var input = this.getInput('ADD' + x);
            itemBlock.valueConnection_ = input && input.connection.targetConnection;
            x++;
            itemBlock = itemBlock.nextConnection &&
                itemBlock.nextConnection.targetBlock();
        }
    }
};

Blockly.Blocks['text_create_join_container'] = {
    /**
     * Mutator block for container.
     * @this Blockly.Block
     */
    init: function () {
        this.setColour(160);
        this.appendDummyInput()
            .appendField(Blockly.Msg.TEXT_CREATE_JOIN_TITLE_JOIN);
        this.appendStatementInput('STACK');
        this.setTooltip(Blockly.Msg.TEXT_CREATE_JOIN_TOOLTIP);
        this.contextMenu = false;
    }
};

Blockly.Blocks['text_create_join_item'] = {
    /**
     * Mutator block for add items.
     * @this Blockly.Block
     */
    init: function () {
        this.setColour(160);
        this.appendDummyInput()
            .appendField(Blockly.Msg.TEXT_CREATE_JOIN_ITEM_TITLE_ITEM);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip(Blockly.Msg.TEXT_CREATE_JOIN_ITEM_TOOLTIP);
        this.contextMenu = false;
    }
};

Blockly.Blocks['text_append'] = {
    /**
     * Block for appending to a variable in place.
     * @this Blockly.Block
     */
    init: function () {
        this.setHelpUrl(Blockly.Msg.TEXT_APPEND_HELPURL);
        this.setColour(160);
        this.appendValueInput('TEXT')
            .appendField(Blockly.Msg.TEXT_APPEND_TO)
            .appendField(new Blockly.FieldVariable(
                Blockly.Msg.TEXT_APPEND_VARIABLE), 'VAR')
            .appendField(Blockly.Msg.TEXT_APPEND_APPENDTEXT);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        // Assign 'this' to a variable for use in the tooltip closure below.
        var thisBlock = this;
        this.setTooltip(function () {
            return Blockly.Msg.TEXT_APPEND_TOOLTIP.replace('%1',
                thisBlock.getFieldValue('VAR'));
        });
    },
    /**
     * Return all variables referenced by this block.
     * @return {!Array.<string>} List of variable names.
     * @this Blockly.Block
     */
    getVars: function () {
        return [this.getFieldValue('VAR')];
    },
    /**
     * Notification that a variable is renaming.
     * If the name matches one of this block's variables, rename it.
     * @param {string} oldName Previous name of variable.
     * @param {string} newName Renamed variable.
     * @this Blockly.Block
     */
    renameVar: function (oldName, newName) {
        if (Blockly.Names.equals(oldName, this.getFieldValue('VAR'))) {
            this.setFieldValue(newName, 'VAR');
        }
    }
};

Blockly.Blocks['text_length'] = {
    /**
     * Block for string length.
     * @this Blockly.Block
     */
    init: function () {
        this.setHelpUrl(Blockly.Msg.TEXT_LENGTH_HELPURL);
        this.setColour(160);
        this.interpolateMsg(Blockly.Msg.TEXT_LENGTH_TITLE,
            ['VALUE', ['String', 'Array'], Blockly.ALIGN_RIGHT],
            Blockly.ALIGN_RIGHT);
        this.setOutput(true, 'Number');
        this.setTooltip(Blockly.Msg.TEXT_LENGTH_TOOLTIP);
    }
};

Blockly.Blocks['text_isEmpty'] = {
    /**
     * Block for is the string null?
     * @this Blockly.Block
     */
    init: function () {
        this.setHelpUrl(Blockly.Msg.TEXT_ISEMPTY_HELPURL);
        this.setColour(160);
        this.interpolateMsg(Blockly.Msg.TEXT_ISEMPTY_TITLE,
            ['VALUE', ['String', 'Array'], Blockly.ALIGN_RIGHT],
            Blockly.ALIGN_RIGHT);
        this.setOutput(true, 'Boolean');
        this.setTooltip(Blockly.Msg.TEXT_ISEMPTY_TOOLTIP);
    }
};

Blockly.Blocks['text_indexOf'] = {
    /**
     * Block for finding a substring in the text.
     * @this Blockly.Block
     */
    init: function () {
        var OPERATORS =
            [
                [Blockly.Msg.TEXT_INDEXOF_OPERATOR_FIRST, 'FIRST'],
                [Blockly.Msg.TEXT_INDEXOF_OPERATOR_LAST, 'LAST']
            ];
        this.setHelpUrl(Blockly.Msg.TEXT_INDEXOF_HELPURL);
        this.setColour(160);
        this.setOutput(true, 'Number');
        this.appendValueInput('VALUE')
            .setCheck('String')
            .appendField(Blockly.Msg.TEXT_INDEXOF_INPUT_INTEXT);
        this.appendValueInput('FIND')
            .setCheck('String')
            .appendField(new Blockly.FieldDropdown(OPERATORS), 'END');
        if (Blockly.Msg.TEXT_INDEXOF_TAIL) {
            this.appendDummyInput().appendField(Blockly.Msg.TEXT_INDEXOF_TAIL);
        }
        this.setInputsInline(true);
        this.setTooltip(Blockly.Msg.TEXT_INDEXOF_TOOLTIP);
    }
};

Blockly.Blocks['text_charAt'] = {
    /**
     * Block for getting a character from the string.
     * @this Blockly.Block
     */
    init: function () {
        this.WHERE_OPTIONS =
            [
                [Blockly.Msg.TEXT_CHARAT_FROM_START, 'FROM_START'],
                [Blockly.Msg.TEXT_CHARAT_FROM_END, 'FROM_END'],
                [Blockly.Msg.TEXT_CHARAT_FIRST, 'FIRST'],
                [Blockly.Msg.TEXT_CHARAT_LAST, 'LAST'],
                [Blockly.Msg.TEXT_CHARAT_RANDOM, 'RANDOM']
            ];
        this.setHelpUrl(Blockly.Msg.TEXT_CHARAT_HELPURL);
        this.setColour(160);
        this.setOutput(true, 'String');
        this.appendValueInput('VALUE')
            .setCheck('String')
            .appendField(Blockly.Msg.TEXT_CHARAT_INPUT_INTEXT);
        this.appendDummyInput('AT');
        this.setInputsInline(true);
        this.updateAt_(true);
        this.setTooltip(Blockly.Msg.TEXT_CHARAT_TOOLTIP);
    },
    /**
     * Create XML to represent whether there is an 'AT' input.
     * @return {Element} XML storage element.
     * @this Blockly.Block
     */
    mutationToDom: function () {
        var container = document.createElement('mutation');
        var isAt = this.getInput('AT').type == Blockly.INPUT_VALUE;
        container.setAttribute('at', isAt);
        return container;
    },
    /**
     * Parse XML to restore the 'AT' input.
     * @param {!Element} xmlElement XML storage element.
     * @this Blockly.Block
     */
    domToMutation: function (xmlElement) {
        var elements = [].concat(xmlElement);
        for (var x = 0; x < elements.length; x++) {
            if (elements[x].name.toLowerCase() == 'at') {
                this.updateAt_(Blockly.Json.parseBoolean(elements[x].value));
            }
        }
    },
    /**
     * Create or delete an input for the numeric index.
     * @param {boolean} isAt True if the input should exist.
     * @private
     * @this Blockly.Block
     */
    updateAt_: function (isAt) {
        // Destroy old 'AT' and 'ORDINAL' inputs.
        this.removeInput('AT');
        this.removeInput('ORDINAL', true);
        // Create either a value 'AT' input or a dummy input.
        if (isAt) {
            this.appendValueInput('AT').setCheck('Number');
            if (Blockly.Msg.ORDINAL_NUMBER_SUFFIX) {
                this.appendDummyInput('ORDINAL')
                    .appendField(Blockly.Msg.ORDINAL_NUMBER_SUFFIX);
            }
        } else {
            this.appendDummyInput('AT');
        }
        if (Blockly.Msg.TEXT_CHARAT_TAIL) {
            this.removeInput('TAIL', true);
            this.appendDummyInput('TAIL')
                .appendField(Blockly.Msg.TEXT_CHARAT_TAIL);
        }
        var menu = new Blockly.FieldDropdown(this.WHERE_OPTIONS, function (value) {
            var newAt = (value == 'FROM_START') || (value == 'FROM_END');
            // The 'isAt' variable is available due to this function being a closure.
            if (newAt != isAt) {
                var block = this.sourceBlock_;
                block.updateAt_(newAt);
                // This menu has been destroyed and replaced.  Update the replacement.
                block.setFieldValue(value, 'WHERE');
                return null;
            }
            return undefined;
        });
        this.getInput('AT').appendField(menu, 'WHERE');
    }
};

Blockly.Blocks['text_getSubstring'] = {
    /**
     * Block for getting substring.
     * @this Blockly.Block
     */
    init: function () {
        this.WHERE_OPTIONS_1 =
            [
                [Blockly.Msg.TEXT_GET_SUBSTRING_START_FROM_START, 'FROM_START'],
                [Blockly.Msg.TEXT_GET_SUBSTRING_START_FROM_END, 'FROM_END'],
                [Blockly.Msg.TEXT_GET_SUBSTRING_START_FIRST, 'FIRST']
            ];
        this.WHERE_OPTIONS_2 =
            [
                [Blockly.Msg.TEXT_GET_SUBSTRING_END_FROM_START, 'FROM_START'],
                [Blockly.Msg.TEXT_GET_SUBSTRING_END_FROM_END, 'FROM_END'],
                [Blockly.Msg.TEXT_GET_SUBSTRING_END_LAST, 'LAST']
            ];
        this.setHelpUrl(Blockly.Msg.TEXT_GET_SUBSTRING_HELPURL);
        this.setColour(160);
        this.appendValueInput('STRING')
            .setCheck('String')
            .appendField(Blockly.Msg.TEXT_GET_SUBSTRING_INPUT_IN_TEXT);
        this.appendDummyInput('AT1');
        this.appendDummyInput('AT2');
        if (Blockly.Msg.TEXT_GET_SUBSTRING_TAIL) {
            this.appendDummyInput('TAIL')
                .appendField(Blockly.Msg.TEXT_GET_SUBSTRING_TAIL);
        }
        this.setInputsInline(true);
        this.setOutput(true, 'String');
        this.updateAt_(1, true);
        this.updateAt_(2, true);
        this.setTooltip(Blockly.Msg.TEXT_GET_SUBSTRING_TOOLTIP);
    },
    /**
     * Create XML to represent whether there are 'AT' inputs.
     * @return {Element} XML storage element.
     * @this Blockly.Block
     */
    mutationToDom: function () {
        var container = document.createElement('mutation');
        var isAt1 = this.getInput('AT1').type == Blockly.INPUT_VALUE;
        container.setAttribute('at1', isAt1);
        var isAt2 = this.getInput('AT2').type == Blockly.INPUT_VALUE;
        container.setAttribute('at2', isAt2);
        return container;
    },
    /**
     * Parse XML to restore the 'AT' inputs.
     * @param {!Element} xmlElement XML storage element.
     * @this Blockly.Block
     */
    domToMutation: function (xmlElement) {
        var isAt1 = (xmlElement.getAttribute('at1') == 'true');
        var isAt2 = (xmlElement.getAttribute('at2') == 'true');
        this.updateAt_(1, isAt1);
        this.updateAt_(2, isAt2);
    },
    /**
     * Create or delete an input for a numeric index.
     * This block has two such inputs, independant of each other.
     * @param {number} n Specify first or second input (1 or 2).
     * @param {boolean} isAt True if the input should exist.
     * @private
     * @this Blockly.Block
     */
    updateAt_: function (n, isAt) {
        // Create or delete an input for the numeric index.
        // Destroy old 'AT' and 'ORDINAL' inputs.
        this.removeInput('AT' + n);
        this.removeInput('ORDINAL' + n, true);
        // Create either a value 'AT' input or a dummy input.
        if (isAt) {
            this.appendValueInput('AT' + n).setCheck('Number');
            if (Blockly.Msg.ORDINAL_NUMBER_SUFFIX) {
                this.appendDummyInput('ORDINAL' + n)
                    .appendField(Blockly.Msg.ORDINAL_NUMBER_SUFFIX);
            }
        } else {
            this.appendDummyInput('AT' + n);
        }
        // Move tail, if present, to end of block.
        if (n == 2 && Blockly.Msg.TEXT_GET_SUBSTRING_TAIL) {
            this.removeInput('TAIL', true);
            this.appendDummyInput('TAIL')
                .appendField(Blockly.Msg.TEXT_GET_SUBSTRING_TAIL);
        }
        var menu = new Blockly.FieldDropdown(this['WHERE_OPTIONS_' + n],
            function (value) {
                var newAt = (value == 'FROM_START') || (value == 'FROM_END');
                // The 'isAt' variable is available due to this function being a closure.
                if (newAt != isAt) {
                    var block = this.sourceBlock_;
                    block.updateAt_(n, newAt);
                    // This menu has been destroyed and replaced.  Update the replacement.
                    block.setFieldValue(value, 'WHERE' + n);
                    return null;
                }
                return undefined;
            });
        this.getInput('AT' + n)
            .appendField(menu, 'WHERE' + n);
        if (n == 1) {
            this.moveInputBefore('AT1', 'AT2');
        }
    }
};

Blockly.Blocks['text_changeCase'] = {
    /**
     * Block for changing capitalization.
     * @this Blockly.Block
     */
    init: function () {
        var OPERATORS =
            [
                [Blockly.Msg.TEXT_CHANGECASE_OPERATOR_UPPERCASE, 'UPPERCASE'],
                [Blockly.Msg.TEXT_CHANGECASE_OPERATOR_LOWERCASE, 'LOWERCASE'],
                [Blockly.Msg.TEXT_CHANGECASE_OPERATOR_TITLECASE, 'TITLECASE']
            ];
        this.setHelpUrl(Blockly.Msg.TEXT_CHANGECASE_HELPURL);
        this.setColour(160);
        this.appendValueInput('TEXT')
            .setCheck('String')
            .appendField(new Blockly.FieldDropdown(OPERATORS), 'CASE');
        this.setOutput(true, 'String');
        this.setTooltip(Blockly.Msg.TEXT_CHANGECASE_TOOLTIP);
    }
};

Blockly.Blocks['text_trim'] = {
    /**
     * Block for trimming spaces.
     * @this Blockly.Block
     */
    init: function () {
        var OPERATORS =
            [
                [Blockly.Msg.TEXT_TRIM_OPERATOR_BOTH, 'BOTH'],
                [Blockly.Msg.TEXT_TRIM_OPERATOR_LEFT, 'LEFT'],
                [Blockly.Msg.TEXT_TRIM_OPERATOR_RIGHT, 'RIGHT']
            ];
        this.setHelpUrl(Blockly.Msg.TEXT_TRIM_HELPURL);
        this.setColour(160);
        this.appendValueInput('TEXT')
            .setCheck('String')
            .appendField(new Blockly.FieldDropdown(OPERATORS), 'MODE');
        this.setOutput(true, 'String');
        this.setTooltip(Blockly.Msg.TEXT_TRIM_TOOLTIP);
    }
};

Blockly.Blocks['text_print'] = {
    /**
     * Block for print statement.
     * @this Blockly.Block
     */
    init: function () {
        this.setHelpUrl(Blockly.Msg.TEXT_PRINT_HELPURL);
        this.setColour(160);
        this.interpolateMsg(Blockly.Msg.TEXT_PRINT_TITLE,
            ['TEXT', null, Blockly.ALIGN_RIGHT],
            Blockly.ALIGN_RIGHT);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip(Blockly.Msg.TEXT_PRINT_TOOLTIP);
    }
};

Blockly.Blocks['text_prompt'] = {
    /**
     * Block for prompt function.
     * @this Blockly.Block
     */
    init: function () {
        var TYPES =
            [
                [Blockly.Msg.TEXT_PROMPT_TYPE_TEXT, 'TEXT'],
                [Blockly.Msg.TEXT_PROMPT_TYPE_NUMBER, 'NUMBER']
            ];
        // Assign 'this' to a variable for use in the closure below.
        var thisBlock = this;
        this.setHelpUrl(Blockly.Msg.TEXT_PROMPT_HELPURL);
        this.setColour(160);
        var dropdown = new Blockly.FieldDropdown(TYPES, function (newOp) {
            if (newOp == 'NUMBER') {
                thisBlock.changeOutput('Number');
            } else {
                thisBlock.changeOutput('String');
            }
        });
        this.appendDummyInput()
            .appendField(dropdown, 'TYPE')
            .appendField(this.newQuote_(true))
            .appendField(new Blockly.FieldTextInput(''), 'TEXT')
            .appendField(this.newQuote_(false));
        this.setOutput(true, 'String');
        // Assign 'this' to a variable for use in the tooltip closure below.
        var thisBlock = this;
        this.setTooltip(function () {
            return (thisBlock.getFieldValue('TYPE') == 'TEXT') ?
                Blockly.Msg.TEXT_PROMPT_TOOLTIP_TEXT :
                Blockly.Msg.TEXT_PROMPT_TOOLTIP_NUMBER;
        });
    },
    newQuote_: Blockly.Blocks['text'].newQuote_
};

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
 * @fileoverview Variable blocks for Blockly.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

Blockly.Blocks.variables = {};


Blockly.Blocks['variables_get'] = {
    /**
     * Block for variable getter.
     * @this Blockly.Block
     */
    init: function () {
        this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
        this.setColour(330);
        this.appendDummyInput()
            .appendField(Blockly.Msg.VARIABLES_GET_TITLE)
            .appendField(new Blockly.FieldVariable(
                Blockly.Msg.VARIABLES_GET_ITEM), 'VAR')
            .appendField(Blockly.Msg.VARIABLES_GET_TAIL);
        this.setOutput(true);
        this.setTooltip(Blockly.Msg.VARIABLES_GET_TOOLTIP);
        this.contextMenuMsg_ = Blockly.Msg.VARIABLES_GET_CREATE_SET;
        this.contextMenuType_ = 'variables_set';
    },
    /**
     * Return all variables referenced by this block.
     * @param {string} varType Type of variable. Uses field name.
     * @return {!Array.<string>} List of variable names.
     * @this Blockly.Block
     */
    getVars: function (varType) {
        if(varType == null)
            return [this.getFieldValue('VAR')];
        return [this.getFieldValue(varType)];
    },
    /**
     * Notification that a variable is renaming.
     * If the name matches one of this block's variables, rename it.
     * @param {string} varType Type of variable. Uses field name.
     * @param {string} oldName Previous name of variable.
     * @param {string} newName Renamed variable.
     * @this Blockly.Block
     */
    renameVar: function (varType, oldName, newName) {
        if (Blockly.Names.equals(oldName, this.getFieldValue(varType))) {
            this.setFieldValue(newName, varType);
        }
    },
    /**
     * Add menu option to create getter/setter block for this setter/getter.
     * @param {!Array} options List of menu options to add to.
     * @this Blockly.Block
     */
    customContextMenu: function (options) {
        var option = {enabled: true};
        var name = this.getFieldValue('VAR');
        option.text = this.contextMenuMsg_.replace('%1', name);
        var xmlField = Ext.DomHelper.createDom({tag: "field", children: name})
        xmlField.setAttribute('name', 'VAR');
        var xmlBlock = Ext.DomHelper.createDom({tag: "block", children: xmlField})
        xmlBlock.setAttribute('type', this.contextMenuType_);
        option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
        options.push(option);
    }
};

Blockly.Blocks['variables_set'] = {
    /**
     * Block for variable setter.
     * @this Blockly.Block
     */
    init: function () {
        this.setHelpUrl(Blockly.Msg.VARIABLES_SET_HELPURL);
        this.setColour(330);
        this.interpolateMsg(
            // TODO: Combine these messages instead of using concatenation.
                Blockly.Msg.VARIABLES_SET_TITLE + ' %1 ' +
                Blockly.Msg.VARIABLES_SET_TAIL + ' %2',
            ['VAR', new Blockly.FieldVariable(Blockly.Msg.VARIABLES_SET_ITEM)],
            ['VALUE', null, Blockly.ALIGN_RIGHT],
            Blockly.ALIGN_RIGHT);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip(Blockly.Msg.VARIABLES_SET_TOOLTIP);
        this.contextMenuMsg_ = Blockly.Msg.VARIABLES_SET_CREATE_GET;
        this.contextMenuType_ = 'variables_get';
    },
    /**
     * Return all variables referenced by this block.
     * @param {string} varType Type of variable. Uses field name.
     * @return {!Array.<string>} List of variable names.
     * @this Blockly.Block
     */
    getVars: function (varType) {
        return [this.getFieldValue(varType)];
    },
    /**
     * Notification that a variable is renaming.
     * If the name matches one of this block's variables, rename it.
     * @param {string} varType Type of variable. Uses field name.
     * @param {string} oldName Previous name of variable.
     * @param {string} newName Renamed variable.
     * @this Blockly.Block
     */
    renameVar: function (varType, oldName, newName) {
        if (Blockly.Names.equals(oldName, this.getFieldValue(varType))) {
            this.setFieldValue(newName, varType);
        }
    },
    customContextMenu: Blockly.Blocks['variables_get'].customContextMenu
};

// This file was automatically generated.  Do not modify.

'use strict';

Blockly.Msg.ADD_COMMENT = "Add Comment";
Blockly.Msg.AUTH = "Please authorize this app to enable your work to be saved and to allow it to be shared by you.";
Blockly.Msg.CHANGE_VALUE_TITLE = "Change value:";
Blockly.Msg.CHAT = "Chat with your collaborator by typing in this box!";
Blockly.Msg.COLLAPSE_ALL = "Collapse Blocks";
Blockly.Msg.COLLAPSE_BLOCK = "Collapse Block";
Blockly.Msg.COLOUR_BLEND_COLOUR1 = "colour 1";
Blockly.Msg.COLOUR_BLEND_COLOUR2 = "colour 2";
Blockly.Msg.COLOUR_BLEND_HELPURL = "http://meyerweb.com/eric/tools/color-blend/";
Blockly.Msg.COLOUR_BLEND_RATIO = "ratio";
Blockly.Msg.COLOUR_BLEND_TITLE = "blend";
Blockly.Msg.COLOUR_BLEND_TOOLTIP = "Blends two colours together with a given ratio (0.0 - 1.0).";
Blockly.Msg.COLOUR_PICKER_HELPURL = "https://en.wikipedia.org/wiki/Color";
Blockly.Msg.COLOUR_PICKER_TOOLTIP = "Choose a colour from the palette.";
Blockly.Msg.COLOUR_RANDOM_HELPURL = "http://randomcolour.com";
Blockly.Msg.COLOUR_RANDOM_TITLE = "random colour";
Blockly.Msg.COLOUR_RANDOM_TOOLTIP = "Choose a colour at random.";
Blockly.Msg.COLOUR_RGB_BLUE = "blue";
Blockly.Msg.COLOUR_RGB_GREEN = "green";
Blockly.Msg.COLOUR_RGB_HELPURL = "http://www.december.com/html/spec/colorper.html";
Blockly.Msg.COLOUR_RGB_RED = "red";
Blockly.Msg.COLOUR_RGB_TITLE = "colour with";
Blockly.Msg.COLOUR_RGB_TOOLTIP = "Create a colour with the specified amount of red, green, and blue.  All values must be between 0 and 100.";
Blockly.Msg.CONTROLS_FLOW_STATEMENTS_HELPURL = "https://code.google.com/p/blockly/wiki/Loops#Loop_Termination_Blocks";
Blockly.Msg.CONTROLS_FLOW_STATEMENTS_OPERATOR_BREAK = "break out of loop";
Blockly.Msg.CONTROLS_FLOW_STATEMENTS_OPERATOR_CONTINUE = "continue with next iteration of loop";
Blockly.Msg.CONTROLS_FLOW_STATEMENTS_TOOLTIP_BREAK = "Break out of the containing loop.";
Blockly.Msg.CONTROLS_FLOW_STATEMENTS_TOOLTIP_CONTINUE = "Skip the rest of this loop, and continue with the next iteration.";
Blockly.Msg.CONTROLS_FLOW_STATEMENTS_WARNING = "Warning: This block may only be used within a loop.";
Blockly.Msg.CONTROLS_FOREACH_HELPURL = "https://code.google.com/p/blockly/wiki/Loops#for_each for each block";
Blockly.Msg.CONTROLS_FOREACH_INPUT_INLIST = "in list";
Blockly.Msg.CONTROLS_FOREACH_INPUT_INLIST_TAIL = "";
Blockly.Msg.CONTROLS_FOREACH_INPUT_ITEM = "for each item";
Blockly.Msg.CONTROLS_FOREACH_TOOLTIP = "For each item in a list, set the variable '%1' to the item, and then do some statements.";
Blockly.Msg.CONTROLS_FOR_HELPURL = "https://code.google.com/p/blockly/wiki/Loops#count_with";
Blockly.Msg.CONTROLS_FOR_INPUT_FROM_TO_BY = "from %1 to %2 by %3";
Blockly.Msg.CONTROLS_FOR_INPUT_WITH = "count with";
Blockly.Msg.CONTROLS_FOR_TOOLTIP = "Have the variable %1 take on the values from the start number to the end number, counting by the specified interval, and do the specified blocks.";
Blockly.Msg.CONTROLS_IF_ELSEIF_TOOLTIP = "Add a condition to the if block.";
Blockly.Msg.CONTROLS_IF_ELSE_TOOLTIP = "Add a final, catch-all condition to the if block.";
Blockly.Msg.CONTROLS_IF_HELPURL = "https://code.google.com/p/blockly/wiki/If_Then";
Blockly.Msg.CONTROLS_IF_IF_TOOLTIP = "Add, remove, or reorder sections to reconfigure this if block.";
Blockly.Msg.CONTROLS_IF_MSG_ELSE = "else";
Blockly.Msg.CONTROLS_IF_MSG_ELSEIF = "else if";
Blockly.Msg.CONTROLS_IF_MSG_IF = "if";
Blockly.Msg.CONTROLS_IF_TOOLTIP_1 = "If a value is true, then do some statements.";
Blockly.Msg.CONTROLS_IF_TOOLTIP_2 = "If a value is true, then do the first block of statements.  Otherwise, do the second block of statements.";
Blockly.Msg.CONTROLS_IF_TOOLTIP_3 = "If the first value is true, then do the first block of statements.  Otherwise, if the second value is true, do the second block of statements.";
Blockly.Msg.CONTROLS_IF_TOOLTIP_4 = "If the first value is true, then do the first block of statements.  Otherwise, if the second value is true, do the second block of statements.  If none of the values are true, do the last block of statements.";
Blockly.Msg.CONTROLS_REPEAT_HELPURL = "https://en.wikipedia.org/wiki/For_loop";
Blockly.Msg.CONTROLS_REPEAT_INPUT_DO = "do";
Blockly.Msg.CONTROLS_REPEAT_TITLE = "repeat %1 times";
Blockly.Msg.CONTROLS_REPEAT_TITLE_REPEAT = "repeat";
Blockly.Msg.CONTROLS_REPEAT_TITLE_TIMES = "times";
Blockly.Msg.CONTROLS_REPEAT_TOOLTIP = "Do some statements several times.";
Blockly.Msg.CONTROLS_WHILEUNTIL_HELPURL = "https://code.google.com/p/blockly/wiki/Repeat";
Blockly.Msg.CONTROLS_WHILEUNTIL_OPERATOR_UNTIL = "repeat until";
Blockly.Msg.CONTROLS_WHILEUNTIL_OPERATOR_WHILE = "repeat while";
Blockly.Msg.CONTROLS_WHILEUNTIL_TOOLTIP_UNTIL = "While a value is false, then do some statements.";
Blockly.Msg.CONTROLS_WHILEUNTIL_TOOLTIP_WHILE = "While a value is true, then do some statements.";
Blockly.Msg.DELETE_BLOCK = "Delete Block";
Blockly.Msg.DELETE_X_BLOCKS = "Delete %1 Blocks";
Blockly.Msg.DISABLE_BLOCK = "Disable Block";
Blockly.Msg.DUPLICATE_BLOCK = "Duplicate";
Blockly.Msg.ENABLE_BLOCK = "Enable Block";
Blockly.Msg.EXPAND_ALL = "Expand Blocks";
Blockly.Msg.EXPAND_BLOCK = "Expand Block";
Blockly.Msg.EXTERNAL_INPUTS = "External Inputs";
Blockly.Msg.HELP = "Help";
Blockly.Msg.INLINE_INPUTS = "Inline Inputs";
Blockly.Msg.LISTS_CREATE_EMPTY_HELPURL = "https://en.wikipedia.org/wiki/Linked_list#Empty_lists";
Blockly.Msg.LISTS_CREATE_EMPTY_TITLE = "create empty list";
Blockly.Msg.LISTS_CREATE_EMPTY_TOOLTIP = "Returns a list, of length 0, containing no data records";
Blockly.Msg.LISTS_CREATE_WITH_CONTAINER_TITLE_ADD = "list";
Blockly.Msg.LISTS_CREATE_WITH_CONTAINER_TOOLTIP = "Add, remove, or reorder sections to reconfigure this list block.";
Blockly.Msg.LISTS_CREATE_WITH_INPUT_WITH = "create list with";
Blockly.Msg.LISTS_CREATE_WITH_ITEM_TOOLTIP = "Add an item to the list.";
Blockly.Msg.LISTS_CREATE_WITH_TOOLTIP = "Create a list with any number of items.";
Blockly.Msg.LISTS_GET_INDEX_FIRST = "first";
Blockly.Msg.LISTS_GET_INDEX_FROM_END = "# from end";
Blockly.Msg.LISTS_GET_INDEX_FROM_START = "#";
Blockly.Msg.LISTS_GET_INDEX_GET = "get";
Blockly.Msg.LISTS_GET_INDEX_GET_REMOVE = "get and remove";
Blockly.Msg.LISTS_GET_INDEX_LAST = "last";
Blockly.Msg.LISTS_GET_INDEX_RANDOM = "random";
Blockly.Msg.LISTS_GET_INDEX_REMOVE = "remove";
Blockly.Msg.LISTS_GET_INDEX_TAIL = "";
Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_GET_FIRST = "Returns the first item in a list.";
Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_GET_FROM_END = "Returns the item at the specified position in a list.  #1 is the last item.";
Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_GET_FROM_START = "Returns the item at the specified position in a list.  #1 is the first item.";
Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_GET_LAST = "Returns the last item in a list.";
Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_GET_RANDOM = "Returns a random item in a list.";
Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_GET_REMOVE_FIRST = "Removes and returns the first item in a list.";
Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_GET_REMOVE_FROM_END = "Removes and returns the item at the specified position in a list.  #1 is the last item.";
Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_GET_REMOVE_FROM_START = "Removes and returns the item at the specified position in a list.  #1 is the first item.";
Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_GET_REMOVE_LAST = "Removes and returns the last item in a list.";
Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_GET_REMOVE_RANDOM = "Removes and returns a random item in a list.";
Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_REMOVE_FIRST = "Removes the first item in a list.";
Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_REMOVE_FROM_END = "Removes the item at the specified position in a list.  #1 is the last item.";
Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_REMOVE_FROM_START = "Removes the item at the specified position in a list.  #1 is the first item.";
Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_REMOVE_LAST = "Removes the last item in a list.";
Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_REMOVE_RANDOM = "Removes a random item in a list.";
Blockly.Msg.LISTS_GET_SUBLIST_END_FROM_END = "to # from end";
Blockly.Msg.LISTS_GET_SUBLIST_END_FROM_START = "to #";
Blockly.Msg.LISTS_GET_SUBLIST_END_LAST = "to last";
Blockly.Msg.LISTS_GET_SUBLIST_HELPURL = "https://code.google.com/p/blockly/wiki/Lists#Getting_a_sublist";
Blockly.Msg.LISTS_GET_SUBLIST_START_FIRST = "get sub-list from first";
Blockly.Msg.LISTS_GET_SUBLIST_START_FROM_END = "get sub-list from # from end";
Blockly.Msg.LISTS_GET_SUBLIST_START_FROM_START = "get sub-list from #";
Blockly.Msg.LISTS_GET_SUBLIST_TAIL = "";
Blockly.Msg.LISTS_GET_SUBLIST_TOOLTIP = "Creates a copy of the specified portion of a list.";
Blockly.Msg.LISTS_INDEX_OF_FIRST = "find first occurrence of item";
Blockly.Msg.LISTS_INDEX_OF_HELPURL = "https://code.google.com/p/blockly/wiki/Lists#Getting_Items_from_a_List";
Blockly.Msg.LISTS_INDEX_OF_LAST = "find last occurrence of item";
Blockly.Msg.LISTS_INDEX_OF_TOOLTIP = "Returns the index of the first/last occurrence of the item in the list.  Returns 0 if text is not found.";
Blockly.Msg.LISTS_INLIST = "in list";
Blockly.Msg.LISTS_IS_EMPTY_HELPURL = "https://code.google.com/p/blockly/wiki/Lists#is_empty";
Blockly.Msg.LISTS_IS_EMPTY_TITLE = "%1 is empty";
Blockly.Msg.LISTS_LENGTH_HELPURL = "https://code.google.com/p/blockly/wiki/Lists#length_of";
Blockly.Msg.LISTS_LENGTH_TITLE = "length of %1";
Blockly.Msg.LISTS_LENGTH_TOOLTIP = "Returns the length of a list.";
Blockly.Msg.LISTS_REPEAT_HELPURL = "https://code.google.com/p/blockly/wiki/Lists#create_list_with";
Blockly.Msg.LISTS_REPEAT_TITLE = "create list with item %1 repeated %2 times";
Blockly.Msg.LISTS_REPEAT_TOOLTIP = "Creates a list consisting of the given value repeated the specified number of times.";
Blockly.Msg.LISTS_SET_INDEX_HELPURL = "https://code.google.com/p/blockly/wiki/Lists#in_list_..._set";
Blockly.Msg.LISTS_SET_INDEX_INPUT_TO = "as";
Blockly.Msg.LISTS_SET_INDEX_INSERT = "insert at";
Blockly.Msg.LISTS_SET_INDEX_SET = "set";
Blockly.Msg.LISTS_SET_INDEX_TOOLTIP_INSERT_FIRST = "Inserts the item at the start of a list.";
Blockly.Msg.LISTS_SET_INDEX_TOOLTIP_INSERT_FROM_END = "Inserts the item at the specified position in a list.  #1 is the last item.";
Blockly.Msg.LISTS_SET_INDEX_TOOLTIP_INSERT_FROM_START = "Inserts the item at the specified position in a list.  #1 is the first item.";
Blockly.Msg.LISTS_SET_INDEX_TOOLTIP_INSERT_LAST = "Append the item to the end of a list.";
Blockly.Msg.LISTS_SET_INDEX_TOOLTIP_INSERT_RANDOM = "Inserts the item randomly in a list.";
Blockly.Msg.LISTS_SET_INDEX_TOOLTIP_SET_FIRST = "Sets the first item in a list.";
Blockly.Msg.LISTS_SET_INDEX_TOOLTIP_SET_FROM_END = "Sets the item at the specified position in a list.  #1 is the last item.";
Blockly.Msg.LISTS_SET_INDEX_TOOLTIP_SET_FROM_START = "Sets the item at the specified position in a list.  #1 is the first item.";
Blockly.Msg.LISTS_SET_INDEX_TOOLTIP_SET_LAST = "Sets the last item in a list.";
Blockly.Msg.LISTS_SET_INDEX_TOOLTIP_SET_RANDOM = "Sets a random item in a list.";
Blockly.Msg.LISTS_TOOLTIP = "Returns true if the list is empty.";
Blockly.Msg.LOGIC_BOOLEAN_FALSE = "false";
Blockly.Msg.LOGIC_BOOLEAN_HELPURL = "https://code.google.com/p/blockly/wiki/True_False";
Blockly.Msg.LOGIC_BOOLEAN_TOOLTIP = "Returns either true or false.";
Blockly.Msg.LOGIC_BOOLEAN_TRUE = "true";
Blockly.Msg.LOGIC_COMPARE_HELPURL = "https://en.wikipedia.org/wiki/Inequality_(mathematics)";
Blockly.Msg.LOGIC_COMPARE_TOOLTIP_EQ = "Return true if both inputs equal each other.";
Blockly.Msg.LOGIC_COMPARE_TOOLTIP_GT = "Return true if the first input is greater than the second input.";
Blockly.Msg.LOGIC_COMPARE_TOOLTIP_GTE = "Return true if the first input is greater than or equal to the second input.";
Blockly.Msg.LOGIC_COMPARE_TOOLTIP_LT = "Return true if the first input is smaller than the second input.";
Blockly.Msg.LOGIC_COMPARE_TOOLTIP_LTE = "Return true if the first input is smaller than or equal to the second input.";
Blockly.Msg.LOGIC_COMPARE_TOOLTIP_NEQ = "Return true if both inputs are not equal to each other.";
Blockly.Msg.LOGIC_NEGATE_HELPURL = "https://code.google.com/p/blockly/wiki/Not";
Blockly.Msg.LOGIC_NEGATE_TITLE = "not %1";
Blockly.Msg.LOGIC_NEGATE_TOOLTIP = "Returns true if the input is false.  Returns false if the input is true.";
Blockly.Msg.LOGIC_NULL = "null";
Blockly.Msg.LOGIC_NULL_HELPURL = "https://en.wikipedia.org/wiki/Nullable_type";
Blockly.Msg.LOGIC_NULL_TOOLTIP = "Returns null.";
Blockly.Msg.LOGIC_OPERATION_AND = "and";
Blockly.Msg.LOGIC_OPERATION_HELPURL = "https://code.google.com/p/blockly/wiki/And_Or";
Blockly.Msg.LOGIC_OPERATION_OR = "or";
Blockly.Msg.LOGIC_OPERATION_TOOLTIP_AND = "Return true if both inputs are true.";
Blockly.Msg.LOGIC_OPERATION_TOOLTIP_OR = "Return true if at least one of the inputs is true.";
Blockly.Msg.LOGIC_TERNARY_CONDITION = "test";
Blockly.Msg.LOGIC_TERNARY_HELPURL = "https://en.wikipedia.org/wiki/%3F:";
Blockly.Msg.LOGIC_TERNARY_IF_FALSE = "if false";
Blockly.Msg.LOGIC_TERNARY_IF_TRUE = "if true";
Blockly.Msg.LOGIC_TERNARY_TOOLTIP = "Check the condition in 'test'. If the condition is true, returns the 'if true' value; otherwise returns the 'if false' value.";
Blockly.Msg.MATH_ADDITION_SYMBOL = "+";
Blockly.Msg.MATH_ARITHMETIC_HELPURL = "https://en.wikipedia.org/wiki/Arithmetic";
Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_ADD = "Return the sum of the two numbers.";
Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_DIVIDE = "Return the quotient of the two numbers.";
Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_MINUS = "Return the difference of the two numbers.";
Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_MULTIPLY = "Return the product of the two numbers.";
Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_POWER = "Return the first number raised to the power of the second number.";
Blockly.Msg.MATH_CHANGE_HELPURL = "https://en.wikipedia.org/wiki/Programming_idiom#Incrementing_a_counter";
Blockly.Msg.MATH_CHANGE_INPUT_BY = "by";
Blockly.Msg.MATH_CHANGE_TITLE_CHANGE = "change";
Blockly.Msg.MATH_CHANGE_TOOLTIP = "Add a number to variable '%1'.";
Blockly.Msg.MATH_CONSTANT_HELPURL = "https://en.wikipedia.org/wiki/Mathematical_constant";
Blockly.Msg.MATH_CONSTANT_TOOLTIP = "Return one of the common constants: π (3.141…), e (2.718…), φ (1.618…), sqrt(2) (1.414…), sqrt(½) (0.707…), or ∞ (infinity).";
Blockly.Msg.MATH_CONSTRAIN_HELPURL = "https://en.wikipedia.org/wiki/Clamping_%28graphics%29";
Blockly.Msg.MATH_CONSTRAIN_TITLE = "constrain %1 low %2 high %3";
Blockly.Msg.MATH_CONSTRAIN_TOOLTIP = "Constrain a number to be between the specified limits (inclusive).";
Blockly.Msg.MATH_DIVISION_SYMBOL = "÷";
Blockly.Msg.MATH_IS_DIVISIBLE_BY = "is divisible by";
Blockly.Msg.MATH_IS_EVEN = "is even";
Blockly.Msg.MATH_IS_NEGATIVE = "is negative";
Blockly.Msg.MATH_IS_ODD = "is odd";
Blockly.Msg.MATH_IS_POSITIVE = "is positive";
Blockly.Msg.MATH_IS_PRIME = "is prime";
Blockly.Msg.MATH_IS_TOOLTIP = "Check if a number is an even, odd, prime, whole, positive, negative, or if it is divisible by certain number.  Returns true or false.";
Blockly.Msg.MATH_IS_WHOLE = "is whole";
Blockly.Msg.MATH_MODULO_HELPURL = "https://en.wikipedia.org/wiki/Modulo_operation";
Blockly.Msg.MATH_MODULO_TITLE = "remainder of %1 ÷ %2";
Blockly.Msg.MATH_MODULO_TOOLTIP = "Return the remainder from dividing the two numbers.";
Blockly.Msg.MATH_MULTIPLICATION_SYMBOL = "×";
Blockly.Msg.MATH_NUMBER_HELPURL = "https://en.wikipedia.org/wiki/Number";
Blockly.Msg.MATH_NUMBER_TOOLTIP = "A number.";
Blockly.Msg.MATH_ONLIST_HELPURL = "";
Blockly.Msg.MATH_ONLIST_OPERATOR_AVERAGE = "average of list";
Blockly.Msg.MATH_ONLIST_OPERATOR_MAX = "max of list";
Blockly.Msg.MATH_ONLIST_OPERATOR_MEDIAN = "median of list";
Blockly.Msg.MATH_ONLIST_OPERATOR_MIN = "min of list";
Blockly.Msg.MATH_ONLIST_OPERATOR_MODE = "modes of list";
Blockly.Msg.MATH_ONLIST_OPERATOR_RANDOM = "random item of list";
Blockly.Msg.MATH_ONLIST_OPERATOR_STD_DEV = "standard deviation of list";
Blockly.Msg.MATH_ONLIST_OPERATOR_SUM = "sum of list";
Blockly.Msg.MATH_ONLIST_TOOLTIP_AVERAGE = "Return the average (arithmetic mean) of the numeric values in the list.";
Blockly.Msg.MATH_ONLIST_TOOLTIP_MAX = "Return the largest number in the list.";
Blockly.Msg.MATH_ONLIST_TOOLTIP_MEDIAN = "Return the median number in the list.";
Blockly.Msg.MATH_ONLIST_TOOLTIP_MIN = "Return the smallest number in the list.";
Blockly.Msg.MATH_ONLIST_TOOLTIP_MODE = "Return a list of the most common item(s) in the list.";
Blockly.Msg.MATH_ONLIST_TOOLTIP_RANDOM = "Return a random element from the list.";
Blockly.Msg.MATH_ONLIST_TOOLTIP_STD_DEV = "Return the standard deviation of the list.";
Blockly.Msg.MATH_ONLIST_TOOLTIP_SUM = "Return the sum of all the numbers in the list.";
Blockly.Msg.MATH_POWER_SYMBOL = "^";
Blockly.Msg.MATH_RANDOM_FLOAT_HELPURL = "https://en.wikipedia.org/wiki/Random_number_generation";
Blockly.Msg.MATH_RANDOM_FLOAT_TITLE_RANDOM = "random fraction";
Blockly.Msg.MATH_RANDOM_FLOAT_TOOLTIP = "Return a random fraction between 0.0 (inclusive) and 1.0 (exclusive).";
Blockly.Msg.MATH_RANDOM_INT_HELPURL = "https://en.wikipedia.org/wiki/Random_number_generation";
Blockly.Msg.MATH_RANDOM_INT_TITLE = "random integer from %1 to %2";
Blockly.Msg.MATH_RANDOM_INT_TOOLTIP = "Return a random integer between the two specified limits, inclusive.";
Blockly.Msg.MATH_ROUND_HELPURL = "https://en.wikipedia.org/wiki/Rounding";
Blockly.Msg.MATH_ROUND_OPERATOR_ROUND = "round";
Blockly.Msg.MATH_ROUND_OPERATOR_ROUNDDOWN = "round down";
Blockly.Msg.MATH_ROUND_OPERATOR_ROUNDUP = "round up";
Blockly.Msg.MATH_ROUND_TOOLTIP = "Round a number up or down.";
Blockly.Msg.MATH_SINGLE_HELPURL = "https://en.wikipedia.org/wiki/Square_root";
Blockly.Msg.MATH_SINGLE_OP_ABSOLUTE = "absolute";
Blockly.Msg.MATH_SINGLE_OP_ROOT = "square root";
Blockly.Msg.MATH_SINGLE_TOOLTIP_ABS = "Return the absolute value of a number.";
Blockly.Msg.MATH_SINGLE_TOOLTIP_EXP = "Return e to the power of a number.";
Blockly.Msg.MATH_SINGLE_TOOLTIP_LN = "Return the natural logarithm of a number.";
Blockly.Msg.MATH_SINGLE_TOOLTIP_LOG10 = "Return the base 10 logarithm of a number.";
Blockly.Msg.MATH_SINGLE_TOOLTIP_NEG = "Return the negation of a number.";
Blockly.Msg.MATH_SINGLE_TOOLTIP_POW10 = "Return 10 to the power of a number.";
Blockly.Msg.MATH_SINGLE_TOOLTIP_ROOT = "Return the square root of a number.";
Blockly.Msg.MATH_SUBTRACTION_SYMBOL = "-";
Blockly.Msg.MATH_TRIG_ACOS = "acos";
Blockly.Msg.MATH_TRIG_ASIN = "asin";
Blockly.Msg.MATH_TRIG_ATAN = "atan";
Blockly.Msg.MATH_TRIG_COS = "cos";
Blockly.Msg.MATH_TRIG_HELPURL = "https://en.wikipedia.org/wiki/Trigonometric_functions";
Blockly.Msg.MATH_TRIG_SIN = "sin";
Blockly.Msg.MATH_TRIG_TAN = "tan";
Blockly.Msg.MATH_TRIG_TOOLTIP_ACOS = "Return the arccosine of a number.";
Blockly.Msg.MATH_TRIG_TOOLTIP_ASIN = "Return the arcsine of a number.";
Blockly.Msg.MATH_TRIG_TOOLTIP_ATAN = "Return the arctangent of a number.";
Blockly.Msg.MATH_TRIG_TOOLTIP_COS = "Return the cosine of a degree (not radian).";
Blockly.Msg.MATH_TRIG_TOOLTIP_SIN = "Return the sine of a degree (not radian).";
Blockly.Msg.MATH_TRIG_TOOLTIP_TAN = "Return the tangent of a degree (not radian).";
Blockly.Msg.ME = "Me";
Blockly.Msg.NEW_VARIABLE = "New variable...";
Blockly.Msg.NEW_VARIABLE_TITLE = "New variable name:";
Blockly.Msg.ORDINAL_NUMBER_SUFFIX = "";
Blockly.Msg.PROCEDURES_BEFORE_PARAMS = "with:";
Blockly.Msg.PROCEDURES_CALLNORETURN_CALL = "";
Blockly.Msg.PROCEDURES_CALLNORETURN_HELPURL = "https://en.wikipedia.org/wiki/Procedure_%28computer_science%29";
Blockly.Msg.PROCEDURES_CALLNORETURN_TOOLTIP = "Run the user-defined function '%1'.";
Blockly.Msg.PROCEDURES_CALLRETURN_HELPURL = "https://en.wikipedia.org/wiki/Procedure_%28computer_science%29";
Blockly.Msg.PROCEDURES_CALLRETURN_TOOLTIP = "Run the user-defined function '%1' and use its output.";
Blockly.Msg.PROCEDURES_CREATE_DO = "Create '%1'";
Blockly.Msg.PROCEDURES_DEFNORETURN_DO = "";
Blockly.Msg.PROCEDURES_DEFNORETURN_HELPURL = "https://en.wikipedia.org/wiki/Procedure_%28computer_science%29";
Blockly.Msg.PROCEDURES_DEFNORETURN_PROCEDURE = "do something";
Blockly.Msg.PROCEDURES_DEFNORETURN_TITLE = "to";
Blockly.Msg.PROCEDURES_DEFNORETURN_TOOLTIP = "Creates a function with no output.";
Blockly.Msg.PROCEDURES_DEFRETURN_HELPURL = "https://en.wikipedia.org/wiki/Procedure_%28computer_science%29";
Blockly.Msg.PROCEDURES_DEFRETURN_RETURN = "return";
Blockly.Msg.PROCEDURES_DEFRETURN_TOOLTIP = "Creates a function with an output.";
Blockly.Msg.PROCEDURES_DEF_DUPLICATE_WARNING = "Warning: This function has duplicate parameters.";
Blockly.Msg.PROCEDURES_HIGHLIGHT_DEF = "Highlight function definition";
Blockly.Msg.PROCEDURES_IFRETURN_TOOLTIP = "If a value is true, then return a second value.";
Blockly.Msg.PROCEDURES_IFRETURN_WARNING = "Warning: This block may be used only within a function definition.";
Blockly.Msg.PROCEDURES_MUTATORARG_TITLE = "input name:";
Blockly.Msg.PROCEDURES_MUTATORARG_TOOLTIP = "Add an input to the function.";
Blockly.Msg.PROCEDURES_MUTATORCONTAINER_TITLE = "inputs";
Blockly.Msg.PROCEDURES_MUTATORCONTAINER_TOOLTIP = "Add, remove, or reorder inputs to this function.";
Blockly.Msg.REMOVE_COMMENT = "Remove Comment";
Blockly.Msg.RENAME_VARIABLE = "Rename variable...";
Blockly.Msg.RENAME_VARIABLE_TITLE = "Rename all '%1' variables to:";
Blockly.Msg.TEXT_APPEND_APPENDTEXT = "append text";
Blockly.Msg.TEXT_APPEND_HELPURL = "https://code.google.com/p/blockly/wiki/Text#Text_modification";
Blockly.Msg.TEXT_APPEND_TO = "to";
Blockly.Msg.TEXT_APPEND_TOOLTIP = "Append some text to variable '%1'.";
Blockly.Msg.TEXT_CHANGECASE_HELPURL = "https://code.google.com/p/blockly/wiki/Text#Adjusting_text_case";
Blockly.Msg.TEXT_CHANGECASE_OPERATOR_LOWERCASE = "to lower case";
Blockly.Msg.TEXT_CHANGECASE_OPERATOR_TITLECASE = "to Title Case";
Blockly.Msg.TEXT_CHANGECASE_OPERATOR_UPPERCASE = "to UPPER CASE";
Blockly.Msg.TEXT_CHANGECASE_TOOLTIP = "Return a copy of the text in a different case.";
Blockly.Msg.TEXT_CHARAT_FIRST = "get first letter";
Blockly.Msg.TEXT_CHARAT_FROM_END = "get letter # from end";
Blockly.Msg.TEXT_CHARAT_FROM_START = "get letter #";
Blockly.Msg.TEXT_CHARAT_HELPURL = "https://code.google.com/p/blockly/wiki/Text#Extracting_text";
Blockly.Msg.TEXT_CHARAT_INPUT_INTEXT = "in text";
Blockly.Msg.TEXT_CHARAT_LAST = "get last letter";
Blockly.Msg.TEXT_CHARAT_RANDOM = "get random letter";
Blockly.Msg.TEXT_CHARAT_TAIL = "";
Blockly.Msg.TEXT_CHARAT_TOOLTIP = "Returns the letter at the specified position.";
Blockly.Msg.TEXT_CREATE_JOIN_ITEM_TOOLTIP = "Add an item to the text.";
Blockly.Msg.TEXT_CREATE_JOIN_TITLE_JOIN = "join";
Blockly.Msg.TEXT_CREATE_JOIN_TOOLTIP = "Add, remove, or reorder sections to reconfigure this text block.";
Blockly.Msg.TEXT_GET_SUBSTRING_END_FROM_END = "to letter # from end";
Blockly.Msg.TEXT_GET_SUBSTRING_END_FROM_START = "to letter #";
Blockly.Msg.TEXT_GET_SUBSTRING_END_LAST = "to last letter";
Blockly.Msg.TEXT_GET_SUBSTRING_HELPURL = "https://code.google.com/p/blockly/wiki/Text#Extracting_a_region_of_text";
Blockly.Msg.TEXT_GET_SUBSTRING_INPUT_IN_TEXT = "in text";
Blockly.Msg.TEXT_GET_SUBSTRING_START_FIRST = "get substring from first letter";
Blockly.Msg.TEXT_GET_SUBSTRING_START_FROM_END = "get substring from letter # from end";
Blockly.Msg.TEXT_GET_SUBSTRING_START_FROM_START = "get substring from letter #";
Blockly.Msg.TEXT_GET_SUBSTRING_TAIL = "";
Blockly.Msg.TEXT_GET_SUBSTRING_TOOLTIP = "Returns a specified portion of the text.";
Blockly.Msg.TEXT_INDEXOF_HELPURL = "https://code.google.com/p/blockly/wiki/Text#Finding_text";
Blockly.Msg.TEXT_INDEXOF_INPUT_INTEXT = "in text";
Blockly.Msg.TEXT_INDEXOF_OPERATOR_FIRST = "find first occurrence of text";
Blockly.Msg.TEXT_INDEXOF_OPERATOR_LAST = "find last occurrence of text";
Blockly.Msg.TEXT_INDEXOF_TAIL = "";
Blockly.Msg.TEXT_INDEXOF_TOOLTIP = "Returns the index of the first/last occurrence of first text in the second text.  Returns 0 if text is not found.";
Blockly.Msg.TEXT_ISEMPTY_HELPURL = "https://code.google.com/p/blockly/wiki/Text#Checking_for_empty_text";
Blockly.Msg.TEXT_ISEMPTY_TITLE = "%1 is empty";
Blockly.Msg.TEXT_ISEMPTY_TOOLTIP = "Returns true if the provided text is empty.";
Blockly.Msg.TEXT_JOIN_HELPURL = "https://code.google.com/p/blockly/wiki/Text#Text_creation";
Blockly.Msg.TEXT_JOIN_TITLE_CREATEWITH = "create text with";
Blockly.Msg.TEXT_JOIN_TOOLTIP = "Create a piece of text by joining together any number of items.";
Blockly.Msg.TEXT_LENGTH_HELPURL = "https://code.google.com/p/blockly/wiki/Text#Text_modification";
Blockly.Msg.TEXT_LENGTH_TITLE = "length of %1";
Blockly.Msg.TEXT_LENGTH_TOOLTIP = "Returns the number of letters (including spaces) in the provided text.";
Blockly.Msg.TEXT_PRINT_HELPURL = "https://code.google.com/p/blockly/wiki/Text#Printing_text";
Blockly.Msg.TEXT_PRINT_TITLE = "print %1";
Blockly.Msg.TEXT_PRINT_TOOLTIP = "Print the specified text, number or other value.";
Blockly.Msg.TEXT_PROMPT_HELPURL = "https://code.google.com/p/blockly/wiki/Text#Getting_input_from_the_user";
Blockly.Msg.TEXT_PROMPT_TOOLTIP_NUMBER = "Prompt for user for a number.";
Blockly.Msg.TEXT_PROMPT_TOOLTIP_TEXT = "Prompt for user for some text.";
Blockly.Msg.TEXT_PROMPT_TYPE_NUMBER = "prompt for number with message";
Blockly.Msg.TEXT_PROMPT_TYPE_TEXT = "prompt for text with message";
Blockly.Msg.TEXT_TEXT_HELPURL = "https://en.wikipedia.org/wiki/String_(computer_science)";
Blockly.Msg.TEXT_TEXT_TOOLTIP = "A letter, word, or line of text.";
Blockly.Msg.TEXT_TRIM_HELPURL = "https://code.google.com/p/blockly/wiki/Text#Trimming_%28removing%29_spaces";
Blockly.Msg.TEXT_TRIM_OPERATOR_BOTH = "trim spaces from both sides of";
Blockly.Msg.TEXT_TRIM_OPERATOR_LEFT = "trim spaces from left side of";
Blockly.Msg.TEXT_TRIM_OPERATOR_RIGHT = "trim spaces from right side of";
Blockly.Msg.TEXT_TRIM_TOOLTIP = "Return a copy of the text with spaces removed from one or both ends.";
Blockly.Msg.VARIABLES_DEFAULT_NAME = "item";
Blockly.Msg.VARIABLES_GET_CREATE_SET = "Create 'set %1'";
Blockly.Msg.VARIABLES_GET_HELPURL = "https://code.google.com/p/blockly/wiki/Variables#Get";
Blockly.Msg.VARIABLES_GET_TAIL = "";
Blockly.Msg.VARIABLES_GET_TITLE = "";
Blockly.Msg.VARIABLES_GET_TOOLTIP = "Returns the value of this variable.";
Blockly.Msg.VARIABLES_SET_CREATE_GET = "Create 'get %1'";
Blockly.Msg.VARIABLES_SET_HELPURL = "https://code.google.com/p/blockly/wiki/Variables#Set";
Blockly.Msg.VARIABLES_SET_TAIL = "to";
Blockly.Msg.VARIABLES_SET_TITLE = "set";
Blockly.Msg.VARIABLES_SET_TOOLTIP = "Sets this variable to be equal to the input.";
Blockly.Msg.PROCEDURES_DEFRETURN_TITLE = Blockly.Msg.PROCEDURES_DEFNORETURN_TITLE;
Blockly.Msg.LISTS_GET_SUBLIST_INPUT_IN_LIST = Blockly.Msg.LISTS_INLIST;
Blockly.Msg.LISTS_SET_INDEX_INPUT_IN_LIST = Blockly.Msg.LISTS_INLIST;
Blockly.Msg.PROCEDURES_DEFRETURN_PROCEDURE = Blockly.Msg.PROCEDURES_DEFNORETURN_PROCEDURE;
Blockly.Msg.VARIABLES_SET_ITEM = Blockly.Msg.VARIABLES_DEFAULT_NAME;
Blockly.Msg.LISTS_CREATE_WITH_ITEM_TITLE = Blockly.Msg.VARIABLES_DEFAULT_NAME;
Blockly.Msg.MATH_CHANGE_TITLE_ITEM = Blockly.Msg.VARIABLES_DEFAULT_NAME;
Blockly.Msg.VARIABLES_GET_ITEM = Blockly.Msg.VARIABLES_DEFAULT_NAME;
Blockly.Msg.PROCEDURES_DEFRETURN_DO = Blockly.Msg.PROCEDURES_DEFNORETURN_DO;
Blockly.Msg.LISTS_GET_INDEX_HELPURL = Blockly.Msg.LISTS_INDEX_OF_HELPURL;
Blockly.Msg.TEXT_CREATE_JOIN_ITEM_TITLE_ITEM = Blockly.Msg.VARIABLES_DEFAULT_NAME;
Blockly.Msg.CONTROLS_IF_MSG_THEN = Blockly.Msg.CONTROLS_REPEAT_INPUT_DO;
Blockly.Msg.LISTS_INDEX_OF_INPUT_IN_LIST = Blockly.Msg.LISTS_INLIST;
Blockly.Msg.PROCEDURES_CALLRETURN_CALL = Blockly.Msg.PROCEDURES_CALLNORETURN_CALL;
Blockly.Msg.LISTS_GET_INDEX_INPUT_IN_LIST = Blockly.Msg.LISTS_INLIST;
Blockly.Msg.CONTROLS_FOR_INPUT_DO = Blockly.Msg.CONTROLS_REPEAT_INPUT_DO;
Blockly.Msg.CONTROLS_FOREACH_INPUT_DO = Blockly.Msg.CONTROLS_REPEAT_INPUT_DO;
Blockly.Msg.CONTROLS_IF_IF_TITLE_IF = Blockly.Msg.CONTROLS_IF_MSG_IF;
Blockly.Msg.CONTROLS_WHILEUNTIL_INPUT_DO = Blockly.Msg.CONTROLS_REPEAT_INPUT_DO;
Blockly.Msg.CONTROLS_IF_ELSEIF_TITLE_ELSEIF = Blockly.Msg.CONTROLS_IF_MSG_ELSEIF;
Blockly.Msg.TEXT_APPEND_VARIABLE = Blockly.Msg.VARIABLES_DEFAULT_NAME;
Blockly.Msg.CONTROLS_IF_ELSE_TITLE_ELSE = Blockly.Msg.CONTROLS_IF_MSG_ELSE;
    declare(null, {});
    return Blockly;

});
