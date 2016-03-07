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

            // Get the thing from the list - don't use the new one!
            var thing = me.getThing(newThing.UID);
            if (thing == null) {
                // Didn't exist, so add it.
                thing = newThing;
                thingList.push(thing);
            }
            else {
                // Aggregate the data - only update what we've been given
                for (var i in newThing) {
                    thing[i] = newThing[i];
                }
            }
            return thing;
        };

        this.getChannelFromThing = function (channelUID) {
            for (var a = 0; a < thingList.length; a++) {
                for (var b = 0; b < thingList[a].channels.length; b++) {
                    if (thingList[a].UID + ":" + thingList[a].channels[b].id == channelUID) {
                        return thingList[a].channels[b];
                    }
                }
            }

            return null;
        };

        this.listen = function () {
            // Things event listener
            eventSrc = new EventSource("/rest/events?topics=smarthome/things/*");
            eventSrc.addEventListener('message', function (event) {
                console.debug("Received thing event in thingModel", event);

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
            });

            // Channel link event listener
            eventSrc = new EventSource("/rest/events?topics=smarthome/links/*");
            eventSrc.addEventListener('message', function (event) {
                console.debug("Received link event in thingModel", event.data);

                var evt = angular.fromJson(event.data);
                var payload = angular.fromJson(evt.payload);
                var topic = evt.topic.split("/");

                var channel = me.getChannelFromThing(payload.channelUID);
                if(channel == null) {
                    return;
                }

                switch (evt.type) {
                    case 'ItemChannelLinkAddedEvent':
                        channel.linkedItems = [].concat(channel.linkedItems);
                        channel.linkedItems.push(payload.itemName);
                        break;
                    case 'ItemChannelLinkRemovedEvent':
                        for (var i = 0; i < channel.linkedItems.length; i++) {
                            if(channel.linkedItems[i] == payload.itemName) {
                                channel.linkedItems.splice(i, 1);
                                break;
                            }
                        }
                        break;
                }
                $rootScope.$apply();
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
            RestService.getService(svcName).then(
                function (url) {
                    $http.put(url + "/" + thing.UID, thing)
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

        this.postThing = function (thing) {
            var tStart = new Date().getTime();
            var deferred = $q.defer();

            RestService.getService(svcName).then(
                function (url) {
                    $http.post(url, thing)
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
            RestService.getService(svcName).then(
                function (url) {
                    $http['delete'](url + '/' + thing.UID + options)
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
                    if (value == "false") {
                        return false;
                    }
                    if (value == "true") {
                        return true;
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
            var retValue = null;
            if (multiple) {
                retValue = [].concat(value);
            }
            if (angular.isArray(value)) {
                angular.forEach(value, function (val) {
                    val = _convertType(type, val);
                });
            }
            else {
                retValue = _convertType(type, value);
            }

            return retValue;
        };

    })
;
