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

        "app/dashboard/ChartList",
        "app/dashboard/HabminChart"
    ],
    function (declare, lang, topic, fx, dom, domConstruct, domAttr, domClass, BorderContainer, AccordionContainer, ContentPane, ChartList, Chart) {
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

                var chartList = new ContentPane({
                    title: "Charts",
                    iconClass:"habminButtonIcon habminIconChart",
                    content: new ChartList()
                });
                domClass.add(chartList.domNode, "habminAccordionChild");
                acc.addChild(chartList);

                topic.subscribe("/dashboard/set", function(type, data) {
                    switch(type) {
                        case "chart":
                            domConstruct.empty(dashboard.domNode);
                            require(["app/dashboard/HabminChart"], function (Dashboard) {
                                var chart = new Chart();
                                chart.loadChart(data);
                                chart.placeAt(dashboard);
                                chart.startup();
                            });
                            break;
                    }
                });
            },
            startup: function() {

                this.inherited(arguments);
                this.resize();
//                x.resize();
            }
        });
    });