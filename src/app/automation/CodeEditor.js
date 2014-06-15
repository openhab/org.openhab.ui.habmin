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

            postCreate: function () {
                this.inherited(arguments);
            },

            startup: function () {
                if (this.initialized)
                    return;

                this.editor = CodeMirror(this.domNode, {
                    mode: "javascript",
                    theme: "eclipse",
                    lineNumbers: true,
                    foldGutter: true,
                    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
                });

                this.initialized = true;
            },

            getCode: function () {
                return this.editor.getValue();
            },

            setCode: function (code) {
                this.editor.setValue(code);
            },

            resize: function() {
                this.inherited(arguments);

                this.editor.refresh();
            }
        })
    });
