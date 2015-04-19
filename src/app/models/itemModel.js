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

    .service('ItemModel', function ($http, $q, UserService, RestService) {
        var svcName = "items";
        var itemList = [];
        var url = UserService.getServer() + '/rest/items';
        var eventSrc;

        var me = this;

        this.listen = function () {
            eventSrc = new EventSource("/rest/events?topics=smarthome/items/*");

            eventSrc.addEventListener('message', function (event) {
                console.log(event.type);
                console.log(event.data);

                var evt = angular.fromJson(event.data);
                var item = evt.object[0];

                if (evt.topic.indexOf("smarthome/items/added") == 0) {
                    itemList.push(item);
                }
                else if (evt.topic.indexOf("smarthome/items/removed") == 0) {
                    for (var i = 0; i < itemList.length; i++) {
                        if (itemList[i].name == item.name) {
                            itemList.splice(i, 1);
                            break;
                        }
                    }
                }
                else if (evt.topic.indexOf("smarthome/items/updated") == 0) {
                    item = evt.object[1];
                    for (var i = 0; i < itemList.length; i++) {
                        if (itemList[i].name == item.name) {
                            itemList[i] = item;
                            break;
                        }
                    }
                }
            });
        };

        this.getList = function () {
            var tStart = new Date().getTime();
            var deferred = $q.defer();

            if (eventSrc == null) {
                me.listen();
            }

            RestService.getService(svcName).then(
                function (url) {
                    $http.get(url)
                        .success(function (data) {
                            console.log("Fetch completed in", new Date().getTime() - tStart);

                            // Keep a local copy.
                            // This allows us to update the data later and keeps the GUI in sync.
                            // Handle difference between OH1 and OH2
                            if(data.item != null) {
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
                    $http.delete(url + "/", item.name)
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
