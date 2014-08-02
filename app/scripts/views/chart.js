HABmin.ChartView = Ember.View.extend({
    didInsertElement: function () {
        var resizeHandler = function () {
            $("#itemList").height($(window).height() - 210);
        };

        this.set('resizeHandler', resizeHandler);
        $(window).bind('resize', this.get('resizeHandler'));

        resizeHandler();
    },

    willDestroy: function () {
        $(window).unbind('resize', this.get('resizeHandler'));
    }
});
