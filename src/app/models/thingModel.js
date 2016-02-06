/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('HABmin.thingModel', [
    'HABmin.userModel',
    'HABmin.restModel'
])

/**
 * thingList is an object. This allows us to perform fast lookups without looping through the array.
 *
 */
    .service('ThingModel', function ($http, $q, $rootScope, ItemModel, UserService, RestService) {
        var thingList = [];
        var svcName = "things";
        var svcSetup = "setup";
        var svcTypes = "thing-types";
        var svcConfig = "config-descriptions";
        var eventSrc;
        var eventSrcLink;

        var me = this;

        this.addOrUpdateThing = function (newThing) {
            // If this is a new thing, add it to the list
            /*            if (thingList[newThing.UID] === undefined) {
             thingList[newThing.UID] = {};
             // For convenience we keep the binding name
             thingList[newThing.UID].binding = newThing.UID.split(":")[0];
             }
             var thing = thingList[newThing.UID];*/

            var thing = me.getThing(newThing.UID);
            if (thing == null) {
                thing = newThing;
                thingList.push(thing);
            }

            // Aggregate the data - only update what we've been given
            for (var i in newThing) {
                thing[i] = newThing[i];

                // If any items are updated, link to the item from the items list
                if (i == "item") {
                    thing.item = ItemModel.getItem(thing.item.name);
                }
            }
            return thing;
        };

        this.listen = function () {
            eventSrc = new EventSource("/rest/events?topics=smarthome/things/*");
            eventSrc.addEventListener('message', function (event) {
                console.log(event.type);
                console.log(event.data);

                var evt = angular.fromJson(event.data);
                var payload = angular.fromJson(evt.payload);
                var topic = evt.topic.split("/");

                switch (evt.type) {
                    case 'ThingStatusInfoEvent':
                        var thing = me.getThing(topic[2]);
                        if (thing == null) {
                            break;
                        }
                        thing.statusInfo = payload;
                        break;
                    case 'ThingUpdatedEvent':
                        me.addOrUpdateThing(payload[0]);
                        break;
                    case 'ThingRemovedEvent':
                        for (var i = 0; i < thingList.length; i++) {
                            if (thingList[i].UID == topic[2]) {
                                thingList.splice(i, 1);
                                break;
                            }
                        }
                        break;
                    case 'ThingAddedEvent':
                        me.addOrUpdateThing(payload);
                        break;
                }
//                $rootScope.$apply();
            });

            eventSrcLink = new EventSource("/rest/events?topics=smarthome/links/*");
            eventSrcLink.addEventListener('message', function (event) {
                console.log(event.type);
                console.log(event.data);

                var evt = angular.fromJson(event.data);
                var payload = angular.fromJson(evt.payload);
                var topic = evt.topic.split("/");
                var thing = me.getThing(payload.thingUID);
                if (thing == null) {
                    return;
                }

                switch (evt.type) {
                    case 'ItemThingLinkAddedEvent':
                        thing.item = ItemModel.getItem(payload.itemName);
                        break;
                    case 'ItemThingLinkRemovedEvent':
                        thing.item = null;
                        break;
                }

            });
        };

        this.getList = function (refresh) {
            var tStart = new Date().getTime();
            var deferred = $q.defer();

            if (eventSrc == null) {
                me.listen();
            }

            // Just return the current list unless it's empty, or we explicitly want to refresh
            if (thingList.length != 0 && refresh != true) {
                deferred.resolve(thingList);
                return deferred.promise;
            }

            RestService.getService(svcName).then(
                function (url) {
                    $http.get(url)
                        .success(function (data) {
                            console.log("Fetch completed in", new Date().getTime() - tStart);

                            // Keep a local copy.
                            // This allows us to update the data later and keeps the GUI in sync.
                            data = [].concat(data);

                            angular.forEach(data, function (thing) {
                                me.addOrUpdateThing(thing);
                            });
                            console.log("Processing completed in", new Date().getTime() - tStart);
                            deferred.resolve(thingList);
                        })
                        .error(function (data, status) {
                            deferred.reject(data);
                        });
                },
                function () {
                    deferred.reject(null);
                }
            );

            return deferred.promise;
        };

        this.getThingInfo = function (uid) {
            var tStart = new Date().getTime();
            var deferred = $q.defer();

            RestService.getService(svcTypes).then(
                function (url) {
                    $http.get(url + "/" + uid)
                        .success(function (data) {
                            deferred.resolve(data);
                        })
                        .error(function (data, status) {
                            deferred.reject(data);
                        });
                },
                function () {
                    deferred.reject(null);
                }
            );

            return deferred.promise;
        };

        this.getThingTypes = function () {
            var tStart = new Date().getTime();
            var deferred = $q.defer();

            RestService.getService(svcTypes).then(
                function (url) {
                    $http.get(url)
                        .success(function (data) {
                            //                        angular.forEach(thingList, function(thing) {
                            //                              thing.binding = thing.UID.split(":")[0];
//                            });
                            deferred.resolve(data);
                        })
                        .error(function (data, status) {
                            deferred.reject(data);
                        });
                },
                function () {
                    deferred.reject(null);
                }
            );

            return deferred.promise;
        };

        this.getThing = function (uid) {
            for (var i = 0; i < thingList.length; i++) {
                if (thingList[i].UID == uid) {
                    return thingList[i];
                }
            }

            return null;


            var tStart = new Date().getTime();
            var deferred = $q.defer();

            RestService.getService(svcName).then(
                function (url) {
                    $http.get(url + "/" + uid)
                        .success(function (data) {
                            var thing = me.addOrUpdateThing(data);
                            deferred.resolve(thing);
                        })
                        .error(function (data, status) {
                            deferred.reject(data);
                        });
                },
                function () {
                    deferred.reject(null);
                }
            );

            return deferred.promise;
        };

        this.putThing = function (thing) {
            var tStart = new Date().getTime();
            var deferred = $q.defer();


            // If the UID ends with a colon, then it's new
            // This is temporary until ESH supports thing labels
            if (thing.UID.slice(-1) == ':') {
                RestService.getService(svcSetup).then(
                    function (url) {
                        thing.UID += new Date().getTime().toString(16);
                        $http.post(url + "/things", thing)
                            .success(function (data) {
                                deferred.resolve(data);
                            })
                            .error(function (data, status) {
                                deferred.reject(data);
                            });
                    });
                return;
            }

            RestService.getService(svcName).then(
                function (url) {
                    // If the UID ends with a colon, then it's new
                    if (thing.UID.slice(-1) == ':') {
                        thing.UID += new Date().getTime().toString(16);
                        $http.post(url, thing)
                            .success(function (data) {
                                deferred.resolve(data);
                            })
                            .error(function (data, status) {
                                deferred.reject(data);
                            });
                    }
                    else {
                        $http.put(url + "/" + thing.UID, thing)
                            .success(function (data) {
                                deferred.resolve(data);
                            })
                            .error(function (data, status) {
                                deferred.reject(data);
                            });
                    }
                },
                function () {
                    deferred.reject(null);
                }
            );

            return deferred.promise;
        };

        this.getConfig = function (thingUID) {
            var tStart = new Date().getTime();
            var deferred = $q.defer();

            RestService.getService(svcConfig).then(
                function (url) {
                    $http.get(url + "/thing:" + thingUID)
                        .success(function (data) {
                            deferred.resolve(data);
                        })
                        .error(function (data, status) {
                            deferred.reject(data);
                        });
                },
                function () {
                    deferred.reject(null);
                }
            );

            return deferred.promise;
        };

        this.putConfig = function (thing, cfg) {
            var tStart = new Date().getTime();
            var deferred = $q.defer();

            RestService.getService(svcName).then(
                function (url) {
                    $http.put(url + "/" + thing.UID + "/config", cfg)
                        .success(function (thing) {
                            me.addOrUpdateThing(thing);
                            deferred.resolve(thing);
                        })
                        .error(function (data, status) {
                            deferred.reject(data);
                        });
                },
                function () {
                    deferred.reject(null);
                }
            );

            return deferred.promise;
        };

        this.deleteThing = function (thing, force) {
            var tStart = new Date().getTime();
            var deferred = $q.defer();

            var options = "";
            if (force == true) {
                options = "?force=true";
            }
            RestService.getService(svcSetup).then(
                function (url) {
                    $http['delete'](url + "/things/" + thing.UID + options)
                        .success(function (data) {
                            deferred.resolve(data);
                        })
                        .error(function (data, status) {
                            deferred.reject(data);
                        });
                },
                function () {
                    deferred.reject(null);
                }
            );

            return deferred.promise;
        };

        this.enableChannel = function (channel) {
            var tStart = new Date().getTime();
            var deferred = $q.defer();

            RestService.getService(svcSetup).then(
                function (url) {
                    $http.put(url + "/things/channels/" + channel, {channelUID: channel})
                        .success(function (data) {
                            deferred.resolve(data);
                        })
                        .error(function (data, status) {
                            deferred.reject(data);
                        });
                },
                function () {
                    deferred.reject(null);
                }
            );

            return deferred.promise;
        };

        this.disableChannel = function (channel) {
            var tStart = new Date().getTime();
            var deferred = $q.defer();

            RestService.getService(svcSetup).then(
                function (url) {
                    $http['delete'](url + "/things/channels/" + channel, {channelUID: channel})
                        .success(function (data) {
                            deferred.resolve(data);
                        })
                        .error(function (data, status) {
                            deferred.reject(data);
                        });
                },
                function () {
                    deferred.reject(null);
                }
            );

            return deferred.promise;
        };

        /**
         * Use the channel categories to determine the thing-type category
         * @param thingType
         */
        this.getThingTypeCategory = function (thingType) {
            if (thingType.channels == []) {
                return "";
            }

            var categories = {};
            angular.forEach(thingType.channels, function (channel) {
                if (channel.category == null || channel.category == "") {
                    return;
                }
                if (categories[channel.category] == null) {
                    categories[channel.category] = 1;
                }
                else {
                    categories[channel.category]++;
                }
            });

            var category = "";
            var max = 0;
            angular.forEach(categories, function (val, key) {
                if (val > max) {
                    category = key;
                    max = val;
                }
            });

            return category;
        };

        function _convertType(type, value) {
            switch (type) {
                case "INTEGER":
                    if (value == null) {
                        return 0;
                    }
                    return Number(value);
                case "TEXT":
                    if (value == undefined) {
                        return "";
                    }
                    return value.toString();
                case "BOOLEAN":
                    if (value == undefined) {
                        return false;
                    }
                    return Boolean(value);
                case "DECIMAL":
                    if (value == undefined) {
                        return 0.0;
                    }
                    break;
            }
        }

        this.convertType = function (type, value, multiple) {
            if (multiple) {
                value = [].concat(value);
            }
            if (angular.isArray(value)) {
                angular.forEach(value, function (val) {
                    val = _convertType(type, val);
                });
            }
            else {
                value = _convertType(type, value);
            }

            return value;
        };

    })
;
