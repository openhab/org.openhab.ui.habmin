define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/topic",
        "dojo/_base/fx",
        "dojo/dom",
        "dojo/dom-construct",
        "dojo/dom-attr",
        "dojo/dom-class",

        "dijit/layout/BorderContainer",
        "dijit/layout/AccordionContainer",
        "dijit/layout/ContentPane",

        "app/automation/RuleList"
    ],
    function (declare, lang, topic, fx, dom, domConstruct, domAttr, domClass, BorderContainer, AccordionContainer, ContentPane, RuleList) {
        return declare(BorderContainer, {
            design: 'sidebar',
            gutters: true,
            liveSplitters:true,

            postCreate: function() {
                var acc = new AccordionContainer({
                    style: "width:250px",
                    splitter:true,
                    region: 'leading'
                });

                this.addChild(acc);
                var dashboard = new ContentPane({
                    title: "Main",
                    region: "center"
                });
                domClass.add(dashboard.domNode, "habminChildNoPadding");
                this.addChild(dashboard);

                var ruleList = new ContentPane({
                    title: "Rules",
                    iconClass:"habminButtonIcon habminIconRules",
                    content: new RuleList()
                });
                domClass.add(ruleList.domNode, "habminAccordionChild");
                acc.addChild(ruleList);

                topic.subscribe("/automation/set", function(type, data) {
                    switch(type) {
                        case "editor":
                            domConstruct.empty(dashboard.domNode);
                            require(["ace/AceEditor"], function (AceEditor) {
                                var chart = new AceEditor();
                                chart.loadChart(data);
                                chart.placeAt(dashboard);
                                chart.startup();
                            });
                            break;
                        case "blocks":
                            break;
                    }
                });
            },
            startup: function() {
                this.inherited(arguments);
                this.resize();
            }
        });
    });