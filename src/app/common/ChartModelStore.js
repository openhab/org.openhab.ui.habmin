define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/Deferred",
        "dojo/Evented",
        "dojo/store/Memory",
        "dojo/request",
        "dojo/_base/array",
        "dojo/topic"
    ],
    function (declare, lang, Deferred, Evented, Memory, request, array, topic) {
        var store = null;
        var def = null;
        return declare([Evented], {
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
                request("/services/habmin/persistence/charts", {
                    timeout: 5000,
                    handleAs: 'json',
                    preventCache: true,
                    headers: {
                        "Content-Type": 'application/json; charset=utf-8',
                        "Accept": "application/json"
                    }
                }).then(
                    lang.hitch(this, function (data) {
                        console.log("The chart model response is: ", data);

                        store = new Memory({idProperty: "name", data: data.chart});
                        this.emit("reload", store);
                        def.resolve();
                    }),
                    lang.hitch(this, function (error) {
                        console.log("An error occurred: " + error);
                        def.reject();
                    })
                );
            },

            delete: function (chartId) {
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

                request("/services/habmin/persistence/charts/" + chartId, {
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
                        this._reload();
                    }),
                    lang.hitch(this, function (error) {
                        def.reject();
                        console.log("An error occurred with delete response: " + error);
                    })
                );

                return def;
            },

            add: function (chartRef) {
                return this._writeRecord(chartRef, "POST", "");
            },

            update: function (chartRef, chartId) {
                return this._writeRecord(chartRef, "PUT", "/" + chartId);
            },

            _writeRecord: function (chartRef, method, chartId) {
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

                request("/services/habmin/persistence/charts" + chartId, {
                    method: method,
                    timeout: 5000,
                    data: chartRef,
                    handleAs: 'json',
                    preventCache: true,
                    headers: {
                        "Content-Type": 'application/json; charset=utf-8',
                        "Accept": "application/json"
                    }
                }).then(
                    lang.hitch(this, function (data) {
                        console.log("The chart save response is: ", data);
                        this._reload();
//                        this.dfd.resolve();
                    }),
                    lang.hitch(this, function (error) {
                        console.log("An error occurred with chart save response: " + error);
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
