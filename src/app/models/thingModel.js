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

    .service('ThingModel', function ($http, $q, $rootScope, UserService, RestService) {
        var thingList = [];
        var svcName = "things";
        var svcSetup = "setup";
        var svcTypes = "thing-types";
        var eventSrc;

        var me = this;

        this.listen = function () {
            eventSrc = new EventSource("/rest/events?topics=smarthome/things/*");

            eventSrc.addEventListener('message', function (event) {
                console.log(event.type);
                console.log(event.data);

                var evt = angular.fromJson(event.data);
                var payload = angular.fromJson(evt.payload);
                var topic = evt.topic.split("/");

                switch(evt.type) {
                    case 'ThingStatusInfoEvent':
                        for (var c = 0; c < thingList.length; c++) {
                            if (thingList[c].UID == topic[2]) {
                                thingList[c].statusInfo = payload;
                                $rootScope.$apply();
                                break;
                            }
                        }
                        break;
                    case 'ThingUpdatedEvent':
                        for (var b = 0; b < thingList.length; b++) {
                            if (thingList[b].UID == topic[2]) {
                                // Aggregate the data - only update what we've been given
                                for(var i in payload[0]){
                                    thingList[b][i] = payload[0][i];
                                }
                                $rootScope.$apply();
                                break;
                            }
                        }
                        break;
                    case 'ThingRemovedEvent':
                        for (var a = 0; a < thingList.length; a++) {
                            if (thingList[a].UID == topic[2]) {
                                thingList.splice(a, 1);
                                break;
                            }
                        }
                        break;
                    case 'ThingAddedEvent':
                        payload.binding = payload.UID.split(":")[0];
                        thingList.push(payload);
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
            if(thingList.length != 0 && refresh != true) {
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
                            thingList = [].concat(data);
                            console.log("Processing completed in", new Date().getTime() - tStart);

                            // Derive the binding ID so we can use this to filter things
                            angular.forEach(thingList, function (thing) {
                                thing.binding = thing.UID.split(":")[0];
                            });
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
            var tStart = new Date().getTime();
            var deferred = $q.defer();

            RestService.getService(svcName).then(
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

        this.putThing = function (thing) {
            var tStart = new Date().getTime();
            var deferred = $q.defer();

            RestService.getService(svcSetup).then(
                function (url) {
                    // If the UID ends with a colon, then it's new
                    if (thing.UID.slice(-1) == ':') {
                        thing.UID += new Date().getTime().toString(16);
                        $http.post(url + "/things", thing)
                            .success(function (data) {
                                deferred.resolve(data);
                            })
                            .error(function (data, status) {
                                deferred.reject(data);
                            });
                    }
                    else {
                        $http.put(url + "/things", thing)
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

        this.putConfig = function (thing, cfg) {
            var tStart = new Date().getTime();
            var deferred = $q.defer();

            RestService.getService(svcName).then(
                function (url) {
                        $http.put(url + "/" + thing.UID + "/config", cfg)
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

        this.deleteThing = function (thing) {
            var tStart = new Date().getTime();
            var deferred = $q.defer();

            RestService.getService(svcSetup).then(
                function (url) {
                    $http['delete'](url + "/things/" + thing.UID)
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
            if(thingType.channels == []) {
                return "";
            }

            var categories = {};
            angular.forEach(thingType.channels, function(channel) {
                if(channel.category == null || channel.category == "") {
                    return;
                }
                if(categories[channel.category] == null) {
                    categories[channel.category] = 1;
                }
                else {
                    categories[channel.category]++;
                }
            });

            var category = "";
            var max = 0;
            angular.forEach(categories, function(val, key) {
                if(val > max) {
                    category = key;
                    max = val;
                }
            });

            return category;
        };

    })
;
