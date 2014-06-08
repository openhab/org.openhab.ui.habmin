define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/dom-class",
        "dijit/layout/ContentPane"/*),
        "codemirror/lib/codemirror.js"/*,


        //<link rel="stylesheet" href="../lib/codemirror.css">
        //<link rel="stylesheet" href="../addon/fold/foldgutter.css" />
        "codemirror/addon/fold/foldcode.js",
        "codemirror/addon/fold/foldgutter.js",
        "codemirror/addon/fold/brace-fold.js",
        "codemirror/addon/fold/xml-fold.js",
        "codemirror/addon/fold/markdown-fold.js",
        "codemirror/addon/fold/comment-fold.js",
        "codemirror/mode/javascript/javascript.js",
        "codemirror/mode/xml/xml.js",
        "codemirror/mode/markdown/markdown.js"*/
    ],
    function (declare, lang, array, domClass, Container) {
        return declare(Container, {
            initialized: false,

            type: 'xml',
            options: {
                stylesheet: "",
                path: "/static/codemirror/js/",
                parserfiles: [],
                basefiles: ["codemirror_iframe.js"],
                linesPerPass: 15,
                passDelay: 200,
                continuousScanning: false,
                saveFunction: function () {
                    console.log('save');
                },
                content: " ",
                undoDepth: 20,
                undoDelay: 800,
                disableSpellcheck: true,
                textWrapping: true,
                readOnly: false,
                width: "100%",
                height: "100%",
                parserConfig: null
            },

            postMixInProperties: function () {
                this.options.stylesheet = "/static/codemirror/css/" + this.type + "colors.css";
                this.options.parserfiles = ["parse" + this.type + ".js"];
            },

            postCreate: function () {
                this.inherited(arguments);
            },

            startup: function () {
//                if (dijit._isElementShown(this.domNode.parentNode))
                    this.initialize();
            },

            initialize: function () {
                if (this.initialized)
                    return;

                this.editor = CodeMirror(this.domNode, {
                    mode: "javascript",
                    lineNumbers: true,
    //                lineWrapping: true,
      //              extraKeys: {"Ctrl-Q": function(cm){ cm.foldCode(cm.getCursor()); }},
                    foldGutter: true,
                    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
                });
            //    this.editor.foldCode(CodeMirror.Pos(13, 0));


                return;

                var frame = document.createElement("IFRAME");
                frame.style.border = "0";
                frame.style.width = this.options.width;
                frame.style.height = this.options.height;
// display: block occasionally suppresses some Firefox bugs, so we
// always add it, redundant as it sounds.
                frame.style.display = "block";

                this.domNode.appendChild(frame);

// Link back to this object, so that the editor can fetch options
// and add a reference to itself.
                frame.CodeMirror = this;
                this.win = frame.contentWindow;

                var _this = this;
                var html = [""];
                dojo.forEach(this.options.basefiles.concat(this.options.parserfiles), function (file) {
                    html.push(file);
//                    html.push("");
                });
                html.push("");

                var doc = this.win.document;
                doc.open();
                doc.write(html.join(""));
                doc.close();

                this.initialized = true;
            },

            getCode: function () {
                return this.editor.getCode();
            },

            setCode: function (code) {
                this.editor.importCode(code);
            },

            focus: function () {
                this.win.focus();
            },

            jumpToChar: function (start, end) {
                this.editor.jumpToChar(start, end);
                this.focus();
            },

            jumpToLine: function (line) {
                this.editor.jumpToLine(line);
                this.focus();
            },

            currentLine: function () {
                return this.editor.currentLine();
            },

            selection: function () {
                return this.editor.selectedText();
            },

            reindent: function () {
                this.editor.reindent();
            },

            replaceSelection: function (text, focus) {
                this.editor.replaceSelection(text);
                if (focus) this.focus();
            },

            replaceChars: function (text, start, end) {
                this.editor.replaceChars(text, start, end);
            },

            getSearchCursor: function (string, fromCursor) {
                return this.editor.getSearchCursor(string, fromCursor);
            }
        })
    });
