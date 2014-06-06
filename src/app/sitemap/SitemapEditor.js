define([
        "dojo/_base/declare", // declare
        "dojo/_base/array", // array.map
        "dijit/layout/BorderContainer",
        "app/sitemap/WidgetList",
        "app/sitemap/SitemapWindow",
        "dojo/dnd/Source",
        "dojo/date",
        "dojo/date/locale",
        "dojo/dom-attr", // domAttr.get
        "dojo/dom-class", // domClass.add domClass.contains domClass.remove domClass.toggle
        "dojo/_base/kernel", // kernel.deprecated
        "dojo/keys", // keys
        "dojo/_base/lang", // lang.hitch
        "dojo/on",
        "dijit/_Widget",
        "dijit/_CssStateMixin",
        "dijit/_TemplatedMixin"
    ],
    function (declare, array, BorderContainer, WidgetList, Sitemap, Source, date, local, domAttr, domClass, kernel, keys, lang, on, has, _Widget, _CssStateMixin, _TemplatedMixin, DropDownButton) {
        return declare(BorderContainer, {
            design: 'sidebar',
            gutters: true,
            liveSplitters:true,

            postCreate: function() {
                var widgetPane = new WidgetList({
                    style: "width:150px;height:100%",
                    splitter:true,
                    region: 'leading'
                });
                this.addChild(widgetPane);

                var sitemapPane = new Sitemap({
                    style: "height:100%",
                    splitter:true,
                    region: 'center'
                });
                this.addChild(sitemapPane);

                // Create the widgets bar

                // Create the sitemap container

                // Create the property editor
            },
            startup: function() {
                this.inherited(arguments);
                this.resize();
            }
        });
    });
