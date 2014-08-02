HABmin.ChartRoute = Ember.Route.extend({
    model: function() {
        return {items: [
            Ember.Object.create({name: "1", label: "Hello 1", icon: "temperature", selected: false}),
                Ember.Object.create({name: "2", label: "Hello 2", icon: "heating", selected: true})
        ]
        }
//            return Ember.RSVP.hash({
  //          items: [{name:"1", label:"Hello 1", icon:"temperature", selected: false},{name:"2", label:"Hello 2", icon:"heating", selected:true}]
//            items: HABmin.PersistenceItemModel.all()//,
//            services: this.store.find('persistence')

 //       })
    }
});



/*
HABmin.Chart1Route = Em.Route.extend({
    model: function (params) {
        var itemsPromise = Ember.$.getJSON('http://localhost:8080/services/habmin/persistence/items').then(
            function (response) {
                me.model.items = response.items;
            }
        );

        var servicePromise = Ember.$.getJSON('http://localhost:8080/services/habmin/persistence/services').then(
            function (response) {
                me.model.services = response.services;
            }
        );

        this.items = [];
        this.services = [];

        regions = [];

        chartPeriod = 86400;

        data = //{columns: []};
        {
            xs: {
                'data1': 'x1',
                'data2': 'x2'
            },
            columns: [
                ['x1', 1000, 3000, 4500, 5000, 7000, 10000],
                ['x2', 30, 50, 75, 100, 1000],
                ['data1', 30, 200, 100, 400, 150, 250],
                ['data2', 20, 180, 240, 100, 190]
            ],
            type: 'spline'
        };

        this.axis = {
            x: {
//                type: 'timeseries',
                tick: {
                    format: '%H:%S',
                    values: [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000]
                }
            }
        };

        return Em.RSVP.hash({
                items: itemsPromise,
                services: servicePromise
            }
        );
    },

    setupController: function (controller, model) {
        // You can use model.post to get post, etc
        // Since the model is a plain object you can just use setProperties
        controller.setProperties(model);
    }
});

HABmin.Chart1Route = Em.Route.extend({
    model: function (params) {
    }
});

HABmin.ChartItemsModel1 = Em.Route.extend({
    model: function (params) {
        return Ember.$.getJSON('http://localhost:8080/services/habmin/persistence/items').then(
            function (response) {
                return response.items;
            }
        );
    }
});

HABmin.ChartServicesModel1 = Em.Route.extend({
    model: function (params) {
        return Ember.$.getJSON('http://localhost:8080/services/habmin/persistence/services').then(
            function (response) {
                return response.services;
            }
        );
    }
});
*/