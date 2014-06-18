define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/topic",
        "dojo/_base/fx",
        "dojo/dom",
        "dojo/dom-construct",
        "dojo/dom-attr",
        "dojo/dom-class",
        "dojo/dom-style",

        "dijit/layout/BorderContainer",
        "dijit/layout/AccordionContainer",
        "dijit/layout/ContentPane",

        "app/automation/RuleList"
    ],
    function (declare, lang, topic, fx, dom, domConstruct, domAttr, domClass, domStyle, BorderContainer, AccordionContainer, ContentPane, RuleList) {
        return declare(BorderContainer, {
            design: 'sidebar',
            gutters: true,
            liveSplitters: true,

            postCreate: function () {
                var acc = new AccordionContainer({
                    style: "width:250px",
                    splitter: true,
                    region: 'leading'
                });

                this.addChild(acc);
                this.dashboard = new ContentPane({
                    title: "Main",
                    region: "center"
                });
                domClass.add(this.dashboard.domNode, "habminChildNoPadding");
                this.addChild(this.dashboard);

                var ruleList = new ContentPane({
                    title: "Rules",
                    iconClass: "habminButtonIcon habminIconRules",
                    content: new RuleList()
                });
                domClass.add(ruleList.domNode, "habminAccordionChild");
                acc.addChild(ruleList);

                this.topicHandler = topic.subscribe("/automation/rule", lang.hitch(this, function (type, data) {
                    switch (type) {
                        case "new":
                            domConstruct.empty(this.dashboard.domNode);

                            if (this.ruleEditor != null) {
                                this.ruleEditor.destroy();
                            }
                            console.log("Loading rule editor", ruleList);
                            require(["app/automation/RuleEditor"], lang.hitch(this, function (RuleEditor) {
                                this.ruleEditor = new RuleEditor();
                                this.ruleEditor.placeAt(this.dashboard);
                                this.ruleEditor.startup();
                                this.ruleEditor.newRule();
                            }));
                            break;
                        case "open":
                            domConstruct.empty(this.dashboard.domNode);

                            if (this.ruleEditor != null) {
                                this.ruleEditor.destroy();
                            }
                            console.log("Loading rule editor", ruleList);
                            require(["app/automation/RuleEditor"], lang.hitch(this, function (RuleEditor) {
                                this.ruleEditor = new RuleEditor();
                                this.ruleEditor.placeAt(this.dashboard);
                                this.ruleEditor.startup();
                                this.ruleEditor.loadRule(data);
                            }));
                            break;
                    }
                }));
            },
            startup: function () {
                this.inherited(arguments);
                this.resize();
            },
            destroy: function () {
                this.inherited(arguments);
                this.topicHandler.remove();
            }
        });
    });