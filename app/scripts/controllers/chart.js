HABmin.ChartController = Ember.Controller.extend({
    selectedStore: "mysql",
    init: function (params) {
        var me = this;

        this.items = [];
        this.services = [];

        this.chart = {
            columns: [
                ['data1', 30, 20, 50, 40, 60, 50],
                ['data2', 200, 130, 90, 240, 130, 220],
                ['data3', 300, 200, 160, 400, 250, 250],
                ['data4', 200, 130, 90, 240, 130, 220],
                ['data5', 130, 120, 150, 140, 160, 150],
                ['data6', 90, 70, 20, 50, 60, 120]
            ],
                type: 'bar',
                types: {
                data3: 'spline',
                    data4: 'line',
                    data6: 'area'
            },
            groups: [
                ['data1', 'data2']
            ]
        };

        Ember.$.getJSON('http://localhost:8080/services/habmin/persistence/items').then(
            function (response) {
                me.set("items", response.items);
            }
        );

        Ember.$.getJSON('http://localhost:8080/services/habmin/persistence/services').then(
            function (response) {
                me.set("services", response.services);
            }
        );
    },

    actions: {
        changeStore: function (model, select) {
            this.set("selectedStore", select);
        }
    }
});
