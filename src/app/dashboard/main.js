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

                this.dashboard = new ContentPane({
                    title: "Main",
                    region: "center"
                });
                domClass.add(this.dashboard.domNode, "habminChildNoPadding");
                this.addChild(this.dashboard);

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

                topic.subscribe("/dashboard/set", lang.hitch(this, function(type, data) {
//                    domConstruct.empty(dashboard.domNode);
                    this.dashboard.destroyRecursive();

                    this.dashboard = new ContentPane({
                        title: "Main",
                        region: "center"
                    });
                    domClass.add(this.dashboard.domNode, "habminChildNoPadding");
                    this.addChild(this.dashboard);

                    switch(type) {
                        case "chart":
                            require(["app/dashboard/HabminChart"], lang.hitch(this, function (Chart) {
                                var chart = new Chart();
                                chart.loadChart(data);
                                chart.placeAt(this.dashboard);
                                chart.startup();
                            }));
                            break;
                        case "items":
                            require(["app/dashboard/HabminChart"], lang.hitch(this, function (Chart) {
                                var chart = new Chart();
                                chart.loadItems(data);
                                chart.placeAt(this.dashboard);
                                chart.startup();
                            }));
                            break;
                        case "newdash":
                            require(["app/dashboard/DashboardContainer"], lang.hitch(this, function (Dashboard) {
                                var dash = new Dashboard();
                                dash.placeAt(this.dashboard);
                                dash.startup();
                                dash.loadDashboard();
                            }));
                            break;
                    }
                }));
            },
            startup: function() {
                this.inherited(arguments);
                this.resize();
            }
        });
    });