define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/Deferred",
        "dojo/store/Observable",
        "dojo/store/Memory",
        "dojo/request",
        "dojo/_base/array",
        "dojo/topic"
    ],
    function (declare, lang, Deferred, Observable, Memory, request, array) {
        var store = null;
        var def = null;
        return declare(null, {
            constructor: function (options) {
                declare.safeMixin(this, options);
            },

            loadStore: function (reload) {
                def = new Deferred();
                def.then(function (res) {
                    // This will be called when the deferred
                    // is resolved
                    console.log("Deferred is in COMPLETE");
                }, function (err) {
                    // This will be called when the deferred
                    // is rejected
                    console.log("Deferred is in ERROR");
                });

                if (reload)
                    store = null;

                if (store == null) {
                    this._reload();
                }
                else {
                    console.log("Store is already loaded");
                    def.resolve();
                }

                return def;
            },

            _reload: function () {
                // If the store's not loaded, load it!
                request("/services/habmin/config/icons", {
                    timeout: 5000,
                    handleAs: 'json',
                    preventCache: true,
                    headers: {
                        "Content-Type": 'application/json; charset=utf-8',
                        "Accept": "application/json"
                    }
                }).then(
                    lang.hitch(this, function (data) {
                        console.log("The icon model response is: ", data);

                        // Create a field to be used in UIs
                        array.forEach(data.icon, lang.hitch(this, function (icon, i) {
                            data.icon[i].rendered =
                                "<img width='14px' height='14px' src='../images/" + icon.name + ".png'/>" + icon.label;
                        }));

                        if (store == null)
                            store = new Observable(new Memory({idProperty: "name", data: data.icon}));
                        else
                            store.setData(data.icon);
                        def.resolve();
                    }),
                    lang.hitch(this, function (error) {
                        console.log("An error occurred: " + error);
                        def.reject();
                    })
                );
            },

            getStore: function () {
                return store;
            },

            query: function (query, options) {
                return store.query(query, options);
            }
        })
    });
