/*
HABmin.ChartView = Ember.View.extend({
    init: function () {
        var view = this;

        var resizeHandler = function () {
            view.rerender();
        };

        this.set('resizeHandler', resizeHandler);
        $(window).bind('resize', this.get('resizeHandler'));
    },

    willDestroy: function () {
        $(window).unbind('resize', this.get('resizeHandler'));
    }
});



*/