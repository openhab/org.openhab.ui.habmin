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
        "app/dashboard/ItemList",
        "app/dashboard/DashboardList"
    ],
    function (declare, lang, topic, fx, dom, domConstruct, domAttr, domClass, BorderContainer, AccordionContainer, ContentPane, ChartList, ItemList, DashList) {
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

                var dashList = new ContentPane({
                    title: "Dashboards",
                    iconClass:"habminButtonIcon habminIconDashboard",
                    content: new DashList()
                });
                domClass.add(dashList.domNode, "habminAccordionChild");
                acc.addChild(dashList);

                var chartList = new ContentPane({
                    title: "Charts",
                    iconClass:"habminButtonIcon habminIconChart",
                    content: new ChartList()
                });
                domClass.add(chartList.domNode, "habminAccordionChild");
                acc.addChild(chartList);

                var itemList = new ContentPane({
                    title: "Items",
                    iconClass:"habminButtonIcon habminIconItems",
                    content: new ItemList()
                });
                domClass.add(itemList.domNode, "habminAccordionChild");
                acc.addChild(itemList);

                topic.subscribe("/dashboard/set", function(type, data) {
                    switch(type) {
                        case "chart":
                            domConstruct.empty(dashboard.domNode);
                            require(["app/dashboard/HabminChart"], function (Chart) {
                                var chart = new Chart();
                                chart.loadChart(data);
                                chart.placeAt(dashboard);
                                chart.startup();
                            });
                            break;
                        case "items":
                            domConstruct.empty(dashboard.domNode);
                            require(["app/dashboard/HabminChart"], function (Chart) {
                                var chart = new Chart();
                                chart.loadItems(data);
                                chart.placeAt(dashboard);
                                chart.startup();
                            });
                            break;
                        case "newdash":
                            domConstruct.empty(dashboard.domNode);
                            require(["app/dashboard/DashboardContainer","app/dashboard/HabminChart"], function (Dashboard, Chart) {
                                var dash = new Dashboard();
                                dash.placeAt(dashboard);
                                dash.startup();
                                var x = dash.addContainer(1, 0, 0, 6, 2);
                                dash.addContainer(2, 1, 2, 4, 1);
                                var chart = new Chart();
                                chart.loadChart("5");
                                chart.placeAt(x.domNode);
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