HABmin.SitemapBaseWidgetComponent = Ember.Component.extend({
    sitemap: {},

    _pageId: "",
    _children: [],

    _sitemapComponents: {
        Chart: HABmin.SitemapTextWidgetComponent,
        Frame: HABmin.SitemapTextWidgetComponent,
        Text: HABmin.SitemapTextWidgetComponent,
        Setpoint: HABmin.SitemapTextWidgetComponent,
        Switch: HABmin.SitemapTextWidgetComponent
    },

    /**
     Data Observer
     */
    dataDidChange: function() {
        this._element = this.get('element');

        console.log("Sitemap update!", this.sitemap);
        console.log("Rendering to", this._element);

        // Sitemap has changed. First check to see if the page has changed
        if(this.sitemap.id != this._pageId) {
            console.log("Sitemap is a new page -", this.sitemap.title);

            // Reset the page definition
            this._pageId = this.sitemap.id;
            this._children = [];
        }

        this._updateWidgets(this.sitemap.widget);



//        var self = this;
//        var chart = self.get('chart');
//        chart.load(self.get('data'));
    }.observes('sitemap').on('didInsertElement'),

    _updateWidgets: function (widgets) {
        // Remember who I am!
        var me = this;

        console.log("Updating widgets", widgets, this);
//        widgets.forEach(function(widget, index){
        var widget = widgets[0];
            console.log("Updating widget", widget);

            // Find the ID in the sitemap Components array
            if(me._children.contains(widget.widgetId)) {
                // Widget already exists
                console.log("Updating widget", widget.widgetId);
            }
            else {
                console.log("New widget", widget.widgetId);
                me._children.push(widget.widgetId);

//                var newComponent = me._sitemapComponents[widget.type].create();
                var newComponent = HABmin.SitemapTextWidgetComponent.create({label: widget.label});
                me._children.push(newComponent);
                newComponent.appendTo($(me._element));
            }
//        });
    },

    createWidget: function () {

    },
    updateWidget: function () {

    },

    addChild: function() {

    },
    actions: {
        clear: function () {
            this.set('number', 0);
        }
    }
});
