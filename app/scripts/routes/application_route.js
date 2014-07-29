HABmin.ApplicationRoute = Ember.Route.extend({
    // admittedly, this should be in IndexRoute and not in the
    // top level ApplicationRoute; we're in transition... :-)
    model: function() {
        return Ember.$.getJSON('http://localhost:8080/rest/sitemaps').then(
            function(response) {
                return response.sitemap;
            }
        );
    }
});


HABmin.SitemapRoute = Ember.Route.extend({
    model: function (params) {
        return Ember.$.getJSON('http://localhost:8080/rest/sitemaps/chris/00').then(
            function(response) {
                return response.widget;
            }
        );
    }
});
