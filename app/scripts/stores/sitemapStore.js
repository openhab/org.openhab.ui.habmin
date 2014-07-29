HABmin.ApplicationAdapter = DS.RESTAdapter.extend({
    headers: function() {
        return {
            "API_KEY": Ember.get(document.cookie.match(/apiKey\=([^;]*)/), "1"),
            "ANOTHER_HEADER": "Some header value"
        };
    }.property().volatile()
});