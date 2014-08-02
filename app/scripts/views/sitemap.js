HABmin.SitemapView = Ember.ContainerView.extend({
    didInsertElement: function () {
/*        var resizeHandler = function () {
            $("#itemList").height($(window).height() - 210);
        };

        this.set('resizeHandler', resizeHandler);
        $(window).bind('resize', this.get('resizeHandler'));

        resizeHandler();*/


        var containerView = Ember.View.views['sitemap']
        var childView = containerView.createChildView(HABmin.SitemapBaseWidgetComponent);
        containerView.get('childViews').pushObject(childView);

    },

    willDestroy: function () {
//        $(window).unbind('resize', this.get('resizeHandler'));
    }
});
