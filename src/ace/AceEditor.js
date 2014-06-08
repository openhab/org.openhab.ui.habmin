define([
    "dojo/_base/declare",
    "dojo/_base/lang", // lang.hitch
    "dijit/_Widget",
    "dijit/layout/_LayoutWidget",
    "dojo/dom-construct", // domConstruct.create domConstruct.place
    "dojo/dom-style", // domStyle.set
    "ace" // ace.edit
], function (declare, lang, _Widget, _LayoutWidget, domConstruct, domStyle, ace) {

    return declare(_Widget, {

        buildRendering: function () {
            this.inherited("buildRendering", arguments);
            var node = domConstruct.create('div');
            domStyle.set(node, {
                padding: "0",
                margin: "0",
                width: "100%",
                height: "100%"
            });
            this._editor = ace.edit(node);
            this._editorSession = this._editor.getSession();
            this.domNode = node;
        },

        set: function (key, value) {
            // TODO document, and wire up the rest of the ace api that makes sense
            var self = this;
            if (key == "value") {
                this._editorSession.setValue(value);
            }
            else if (key == "theme") {
                if (typeof value == "string") value = "ace/theme/" + value;
                this._editor.setTheme(value);
            }
            else if (key == "mode") {
                // TODO get mode name string from instance
                if (typeof value != "string") {
                    this._editorSession.setMode(value);
                }
                // TODO couldn't define/require return a promise?
                require(["ace/mode/" + value], function (modeModule) {
                    self._editorSession.setMode(new modeModule.Mode());
                });
            }
            else if (key == "readOnly") {
                this._editor.setReadOnly(value);
            }
            else if (key == "tabSize") {
                this._editorSession.setTabSize(value);
            }
            else if (key == "softTabs") {
                this._editorSession.setUseSoftTabs(value);
            }
            else if (key == "wordWrap") {
                // TODO this is buggy, file github issue
                this._editorSession.setUseWrapMode(value);
            }
            else if (key == "printMargin") {
                this._editor.renderer.setPrintMarginColumn(value);
            }
            else if (key == "showPrintMargin") {
                this._editor.setShowPrintMargin(value);
            }
            else if (key == "highlightActiveLine") {
                this._editor.setHighlightActiveLine(value);
            }
            else if (key == "fontSize") {
                domStyle.set(this.domNode, key, value);
            }
            else if (key == "showGutter") {
                this._editor.renderer.setShowGutter(value);
            }
            return this.inherited("set", arguments);
        },

        get: function (key) {
            if (key == "value") {
                return this._editorSession.getValue();
            }
            return this.inherited("get", arguments);
        },

        //the following 3 functions are required to make the editor play nice under a layout widget, see #4070
        startup: function () {
            // summary:
            //      Exists to make Editor work as a child of a layout widget.
            //      Developers don't need to call this method.
            // tags:
            //      protected
            //console.log('startup',arguments);
        },

        resize: function (size) {
            // summary:
            //      Resize the editor to the specified size, see `dijit.layout._LayoutWidget.resize`
            if (size) {
                // we've been given a height/width for the entire editor (toolbar + contents), calls layout()
                // to split the allocated size between the toolbar and the contents
                _LayoutWidget.prototype.resize.apply(this, arguments);
            }
            /*
             else{
             // do nothing, the editor is already laid out correctly.   The user has probably specified
             // the height parameter, which was used to set a size on the iframe
             }
             */

            var self = this;
            this._resizer = setTimeout(lang.hitch(self, function () {
                delete self._resizer;
                self._editor.resize();
            }), 10);
        },

        layout: function () {
            // summary:
            //      Called from `dijit.layout._LayoutWidget.resize`.  This shouldn't be called directly
            // tags:
            //      protected
            this._layoutMode = true;
        },

        destroy: function () {
            if (this._resizer) {
                clearTimeout(this._resizer);
                delete this._resizer;
            }
            return this.inherited("destroy", arguments);
        }

    });

});