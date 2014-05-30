define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/fx",
        "dojo/dom",
        "dojo/dom-construct",
        "dojo/dom-attr",
        "dojo/dom-class",
        "app/calendar/utils",
        "app/calendar/ExtendedCalendar",

        "dijit/layout/BorderContainer",
        "dijit/layout/AccordionContainer",
        "dijit/layout/ContentPane",
        "app/calendar/MainProperties",
        "app/calendar/ColumnViewProperties",
        "app/calendar/MatrixViewProperties",
        "app/calendar/MonthColumnViewProperties"
    ],
    function (declare, lang, fx, dom, domConstruct, domAttr, domClass, utils, Calendar, BorderContainer, AccordionContainer, ContentPane, MainProperties, ColumnViewProperties, MatrixViewProperties, MonthColumnViewProperties) {
        return declare(BorderContainer, {
            design: 'sidebar',
            gutters: true,

            postCreate: function() {
                this.inherited(arguments);
                var acc = new AccordionContainer({
                    style: "width:275px",
                    splitter:false,
                    region: 'leading'
                });

                var mainProperties = new ContentPane({
                    title: "Main Properties",
                    style: "width:250px",
                    content:new MainProperties()
                });
                acc.addChild(mainProperties);

                var columnViewProperties = new ContentPane({
                    title: "Column Properties",
                    style: "width:250px",
                    content:new ColumnViewProperties()
                });
                acc.addChild(columnViewProperties);

                var matrixViewProperties = new ContentPane({
                    title:"Matrix view properties",
                    style: "width:250px",
                    content:new MatrixViewProperties()
                });
                acc.addChild(matrixViewProperties);

                var monthColumnViewProperties = new ContentPane({
                    title: "Month column view properties",
                    style: "width:250px",
                    content:new MonthColumnViewProperties()
                });
                acc.addChild(monthColumnViewProperties);


                this.addChild(acc);

                var calendar = new Calendar({
                });
                var mn2 = new ContentPane({
                    region: 'center',
                    style: "border:none;",
                    splitter: false,
                    content: calendar
                });
                domClass.add(mn2.domNode, "habminChildNoPadding");

                this.addChild(mn2);

                calendar.set("cssClassFunc", function (item) {
                    // Use custom css class on renderers depending of a parameter (calendar).
                    return item.calendar == "cal1" ? "Calendar1" : "Calendar2";
                });

                calendar.set("store", utils.createDefaultStore(calendar));

                calendar.set("date", utils.getStartOfCurrentWeek(calendar));
                utils.configureInteractiveItemCreation(calendar);

                mainProperties.set("calendar", calendar);
                columnViewProperties.set("view", calendar.columnView);
                matrixViewProperties.set("view", calendar.matrixView);
                monthColumnViewProperties.set("view", calendar.monthColumnView);
            },
            startup: function() {
                this.inherited(arguments);
                this.resize();
            }
        });
    });