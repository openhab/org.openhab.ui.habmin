HABmin.ApplicationRoute = Ember.Route.extend({
    model: function() {
        return {sitemaps: [
            Ember.Object.create({name: "1", label: "Sitemap 1", icon: "temperature"}),
            Ember.Object.create({name: "2", label: "Sitemap 2", icon: "heating"})
        ]
        };
//        return Ember.RSVP.hash({
  //          sitemaps: HABmin.PersistenceItemModel.all()
    //    });
    }
});


HABmin.SitemapRoute = Ember.Route.extend({
    model: function (params) {
        return Ember.$.getJSON('http://localhost:8080/rest/sitemaps/chris/00').then(
            function(response) {
                return response;
            }
        );
    }
});
