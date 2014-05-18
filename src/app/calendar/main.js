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
        "app/calendar/MonthColumnViewProperties",
        "dojo/domReady!"
    ],
    function (declare, lang, fx, dom, domConstruct, domAttr, domClass, utils, Calendar, BorderContainer, AccordionContainer, ContentPane, MainProperties, ColumnViewProperties) {
        return declare(BorderContainer, {
            design: 'sidebar',
            gutters: false,

            postCreate: function() {
                var acc = new AccordionContainer({
                    splitter:false,
                    region: 'leading'
                });

                var ma1 = new ContentPane({
                    title: "Main Properties",
                    style: "width:250px",
                    content:new MainProperties({
                        style: "width:250px"
                    })
                });
                var ma2 = new ContentPane({
                    label: "Column Properties",
                    style: "width:250px",
                    content:new ColumnViewProperties({
                        style: "width:250px"
                    })
                });
                acc.addChild(ma1);
                acc.addChild(ma2);
                this.addChild(acc);

                var calendar = new Calendar({
                    style:"position:absolute;left:10px;top:10px;bottom:30px;right:10px"
                });
                var mn2 = new ContentPane({
                    region: 'center',
                    title: "Main Properties",
                    style: "width:250px",
                    splitter: false,
                    content: calendar
                });

                this.addChild(mn2);

//                utils.initHints(hint);

//                calendar.set("cssClassFunc", function (item) {
                    // Use custom css class on renderers depending of a parameter (calendar).
//                    return item.calendar == "cal1" ? "Calendar1" : "Calendar2";
//                });

//                calendar.set("store", utils.createDefaultStore(calendar));

//                calendar.set("date", utils.getStartOfCurrentWeek(calendar));
//                utils.configureInteractiveItemCreation(calendar);

//                mainProperties.set("calendar", calendar);
//                columnViewProperties.set("view", calendar.columnView);
//                matrixViewProperties.set("view", calendar.matrixView);
//                monthColumnViewProperties.set("view", calendar.monthColumnView);
            },
            startup: function() {
                this.inherited(arguments);
                this.resize();
            }
        });
    });