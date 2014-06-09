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
