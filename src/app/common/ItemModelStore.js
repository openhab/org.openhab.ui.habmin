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
    function (declare, lang, Deferred, Observable, Memory, request) {
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

            _reload: function() {
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
                            console.log("The item model response is: ", data);

                            if(store == null)
                                store = new Observable(new Memory({idProperty: "name", data: data.item}));
                            else
                                store.setData(data.item);
                            def.resolve();
                        }),
                        lang.hitch(this, function (error) {
                            console.log("An error occurred: " + error);
                            def.reject();
                        })
                    );
            },

            delete: function (itemId) {
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

                request("/services/habmin/config/items/" + itemId, {
                    method: 'DELETE',
                    timeout: 5000,
                    handleAs: 'json',
                    preventCache: true,
                    headers: {
                        "Content-Type": 'application/json; charset=utf-8',
                        "Accept": "application/json"
                    }
                }).then(
                    lang.hitch(this, function () {
                        console.log("Delete completed ok");
                        store.remove(itemId);
                        def.resolve();
                    }),
                    lang.hitch(this, function (error) {
                        def.reject();
                        console.log("An error occurred with delete response: " + error);
                    })
                );

                return def;
            },

            add: function (itemRef) {
                return this._writeRecord(itemRef, "POST", "");
            },

            update: function (itemRef, itemId) {
                return this._writeRecord(itemRef, "PUT", "/" + itemId);
            },

            _writeRecord: function (itemRef, method, itemId) {
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

                request("/services/habmin/config/items" + itemId, {
                    method: method,
                    timeout: 5000,
                    data: itemRef,
                    handleAs: 'json',
                    preventCache: true,
                    headers: {
                        "Content-Type": 'application/json; charset=utf-8',
                        "Accept": "application/json"
                    }
                }).then(
                    lang.hitch(this, function (data) {
                        console.log("The item save response is: ", data);
                        store.put(data);
//                        this._reload();
                        def.resolve();
                    }),
                    lang.hitch(this, function (error) {
                        console.log("An error occurred with item save response: " + error);
                        def.reject();
                    })
                );

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
