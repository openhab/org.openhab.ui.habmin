define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/Deferred",
        "dojo/store/Memory",
        "dojo/request",
        "dojo/_base/array",
        "dojo/topic"
    ],
    function (declare, lang, Deferred, Memory, request, array, topic) {
        var store = null;
        return declare(null, {

            constructor: function (options) {
                declare.safeMixin(this, options);
            },

            loadStore: function () {
                var def = new Deferred();

                def.then(function (res) {
                    // This will be called when the deferred
                    // is resolved
                    console.log("Deferred is in COMPLETE");
                }, function (err) {
                    // This will be called when the deferred
                    // is rejected
                    console.log("Deferred is in ERROR");
                });

                // If the store's not loaded, load it!
                if (store == null) {
                    request("/services/habmin/config/items", {
                        timeout: 5000,
                        handleAs: 'json',
                        preventCache: true,
                        headers: {
                            "Content-Type": 'application/json; charset=utf-8',
                            "Accept": "application/json"
                        }
                    }).then(
                        lang.hitch(this, function (data) {
                            console.log("The xxxxxxxxx item model response is: ", data);

                            store = new Memory({idProperty: "name", data: data.item});

                            def.resolve();
                        }),
                        lang.hitch(this, function (error) {
                            console.log("An error occurred: " + error);

                            def.reject();
                        })
                    );
                }
                else {
                    console.log("Store is already loaded");
                    def.resolve();
                }

                return def;
            },

            getStore: function () {
                return store;
            },

            query: function (query, options) {
                return store.query(query, options);
            }
        })
    });
