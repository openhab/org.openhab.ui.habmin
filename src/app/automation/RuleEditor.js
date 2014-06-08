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

                this.editorPane = new CodeEditor({
                    region:'center'
                });
                domClass.add(this.editorPane.domNode, "habminChildNoPadding");

                this.addChild(this.editorPane);
            },
            startup: function () {
                this.inherited(arguments);
                this.resize();

                request("/services/habmin/config/rules/model/source/habmin-autorules", {
                    timeout: 5000,
                    handleAs: 'json',
                    preventCache: true,
                    headers: {
                        "Content-Type": 'application/json; charset=utf-8',
                        "Accept": "application/json"
                    }
                }).then(
                    lang.hitch(this, function (data) {
                        console.log("The (Rule Source) response is: ", data);
                        this.editorPane.setCode(data.source);
                    }),
                    lang.hitch(this, function (error) {
                        console.log("An error occurred with rule source response: " + error);
                    })
                );

            }
        })
    });


