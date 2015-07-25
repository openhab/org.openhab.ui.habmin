/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('HABmin.itemModel', [
    'HABmin.userModel'
])

    .service('ItemModel', function ($http, $q, $rootScope, UserService, RestService) {
        var svcName = "items";
        var itemList = [];
        var url = UserService.getServer() + '/rest/items';
        var eventSrc;

        var me = this;

        this.listen = function () {
            eventSrc = new EventSource("/rest/events?topics=smarthome/items/*");

            eventSrc.addEventListener('message', function (event) {
                console.log(event.data);

                var evt = angular.fromJson(event.data);
                var payload = angular.fromJson(evt.payload);
                var topic = evt.topic.split("/");

                switch(evt.type) {
                    case 'ItemStateEvent':
                        // Broadcast an event so we update any widgets or listeners
                        $rootScope.$broadcast(evt.topic, payload);
                        break;
                    case 'ItemUpdatedEvent':
                        for (var b = 0; b < itemList.length; b++) {
                            if (itemList[b].name == topic[2]) {
                                // Aggregate the data - only update what we've been given
                                for(var i in payload[0]){
                                    itemList[b][i] = payload[0][i];
                                }
                                $rootScope.$apply();
                                break;
                            }
                        }
                        break;
                    case 'ItemAddedEvent':
                        itemList.push(payload);
                        break;
                    case 'ItemRemovedEvent':
                        for (var a = 0; a < itemList.length; a++) {
                            if (itemList[a].name == topic[2]) {
                                itemList.splice(a, 1);
                                break;
                            }
                        }
                        break;
                }
            });
        };

        this.getList = function (refresh) {
            // TODO: Only get the list once, then rely on SSE unless we refresh
            var tStart = new Date().getTime();
            var deferred = $q.defer();

            if (eventSrc == null) {
                me.listen();
            }

            // Just return the current list unless it's empty, or we explicitly want to refresh
            if(itemList.length != 0 && refresh != true) {
                deferred.resolve(itemList);
                return deferred.promise;
            }

            RestService.getService(svcName).then(
                function (url) {
                    $http.get(url)
                        .success(function (data) {
                            console.log("Fetch completed in", new Date().getTime() - tStart);

                            // Keep a local copy.
                            // This allows us to update the data later and keeps the GUI in sync.
                            // Handle difference between OH1 and OH2
                            if (data.item != null) {
                                itemList = [].concat(data.item);
                            }
                            else {
                                itemList = [].concat(data);
                            }
                            // Remove the formatting part off the end.
                            // For OH2 we should ultimately use the stateDescription
                            angular.forEach(itemList, function (item) {
                                if (item.label == null) {
//                                    item.stateDescription = {
//                                        pattern: ""
//                                    };
                                    item.label = item.name;
                                    return;
                                }
                                var title = item.label;
                                var pntStart = item.label.indexOf("[");
                                if (pntStart != -1) {
                                    title = item.label.substr(0, pntStart).trim();
                                    //    var pntFinish = item.label.lastIndexOf("]");
                                }
                                item.label = title;
                            });
                            console.log("Processing completed in", new Date().getTime() - tStart);

                            deferred.resolve(itemList);
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

        this.getItem = function (itemName) {
            var tStart = new Date().getTime();
            var deferred = $q.defer();

            RestService.getService(svcName).then(
                function (url) {
                    $http.get(url + "/" + itemName)
                        .success(function (data) {
                            console.log("Fetch completed in", new Date().getTime() - tStart);

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

        this.putItem = function (item) {
            var deferred = $q.defer();
            RestService.getService(svcName).then(
                function (url) {
                    $http.put(url + "/" + item.name, item)
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

        this.deleteItem = function (item) {
            var tStart = new Date().getTime();
            var deferred = $q.defer();

            RestService.getService(svcName).then(
                function (url) {
                    $http['delete'](url + "/", item.name)
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

        this.sendCommand = function (item, value) {
            console.log("Sending command", item, value);
            var deferred = $q.defer();
            $http.post(url + "/" + item, value, {
                    headers: {'Content-Type': 'text/plain'}
                }
            ).success(function (data, status) {
                    // Some extra manipulation on data if you want...
                    deferred.resolve([].concat(data));
                }).error(function (data, status) {
                    deferred.reject(data);
                });

            return deferred.promise;
        };

    });
