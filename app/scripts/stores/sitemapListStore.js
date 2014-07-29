/*App.sitemapListModel = DS.Model.extend({
 name: DS.attr('string'),
 label: DS.attr('string')
 });
 */
HABmin.sitemapListModel = Ember.ArrayController.extend({
    content: Ember.A([
        Ember.Object.create({name: "About", location: 'about', active: null}),
        Ember.Object.create({name: "Projects", location: 'projects', active: null})
    ]),
    title: "Almighty Machine"
});

/*
HABmin.sitemapListModel.pushObjects(
    [
        {name: "1", label: "Label 1"},
        {name: "2", label: "Label 2"},
        {name: "3", label: "Label 3"}
    ]
);
*/
/*
 App.sitemapListStore = DS.Store.extend({
 url: "192.168.2.2:10080/rest/sitemaps"
 });

 */