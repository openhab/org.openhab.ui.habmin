define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/fx",
        "dojo/dom",
        "dojo/dom-construct",
        "dojo/dom-attr",
        "dojo/dom-class",
        "app/dashboard/ChartList",

        "dijit/layout/BorderContainer",
        "dijit/layout/AccordionContainer",
        "dijit/layout/ContentPane"
    ],
    function (declare, lang, fx, dom, domConstruct, domAttr, domClass, ChartList, BorderContainer, AccordionContainer, ContentPane) {
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

                var mn1 = new ContentPane({
                    title: "Charts",
                    content: new ChartList()
                });
                domClass.add(mn1.domNode, "habminAccordionChild");
                acc.addChild(mn1);

                this.addChild(acc);

                var mn2 = new ContentPane({
                    title: "Main",
                    region: "center"
                });
                this.addChild(mn2);
            },
            startup: function() {
                this.inherited(arguments);
                this.resize();
            }
        });
    });