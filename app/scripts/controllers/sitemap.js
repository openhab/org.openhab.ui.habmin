HABmin.SitemapController = Ember.ArrayController.extend({
    actions: {
        query: function() {
            // the current value of the text field
            var query = this.get('search');
            this.transitionToRoute('search', { query: query });
        }
    }
});