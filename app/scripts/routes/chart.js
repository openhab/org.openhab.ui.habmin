HABmin.ChartRoute = Ember.Route.extend({
    model: function () {
        return {

            selectedStore: "mysql",
            items:
                [{label:"1"},{ label:"2"},{ label:"3"}]

        }
    }
});
