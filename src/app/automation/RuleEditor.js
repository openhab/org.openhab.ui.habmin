define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/dom-class",
        "dijit/layout/BorderContainer",
        "dijit/Toolbar",
        "dijit/form/Button",
        "dojo/request",

        "app/automation/Codemirror"
    ],
    function (declare, lang, array, domClass, Container, Toolbar, Button, request, CodeEditor) {
        return declare(Container, {
            chartLegend: true,
            tooltips: true,

            gutters: false,
            postCreate: function () {
                domClass.add(this.domNode, "habminChildNoPadding");

                var editorPane = new CodeEditor({region:'center'
                });
                domClass.add(editorPane.domNode, "habminChildNoPadding");


                this.addChild(editorPane);
            },
            startup: function () {
                this.inherited(arguments);
                this.resize();
            }
        })
    });
