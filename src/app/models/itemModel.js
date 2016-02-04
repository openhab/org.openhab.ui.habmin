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
        var svcNameLinks = "links";
        var itemList = [];
        var url = UserService.getServer() + '/rest/items';
        var eventSrc;

        var me = this;

        this.addOrUpdateItem = function (newItem) {
            // If this is a new thing, add it to the list
            /*            if(itemList[newItem.name] === undefined) {
             itemList[newItem.name] = {};
             }
             var item = itemList[newItem.name];*/

            var item = me.getItem(newItem.name);
            if (item == null) {
                item = newItem;
                itemList.push(item);
            }

            if (item.label == null) {
//                                    item.stateDescription = {
//                                        pattern: ""
//                                    };
                item.label = item.name;
//                return;
            }
            var title = item.label;
            var pntStart = item.label.indexOf("[");
            if (pntStart != -1) {
                title = item.label.substr(0, pntStart).trim();
                //    var pntFinish = item.label.lastIndexOf("]");
            }
            item.label = title;

            // Aggregate the data - only update what we've been given
            for (var i in newItem) {
                item[i] = newItem[i];
            }

            return item;
        };

        this.listen = function () {
            eventSrc = new EventSource("/rest/events?topics=smarthome/items/*");

            eventSrc.addEventListener('message', function (event) {
                console.log(event.data);

                var evt = angular.fromJson(event.data);
                var payload = angular.fromJson(evt.payload);
                var topic = evt.topic.split("/");

                switch (evt.type) {
                    case 'ItemStateEvent':
                        // Broadcast an event so we update any widgets or listeners
                        $rootScope.$broadcast(evt.topic, payload);
                        if (itemList[topic[2]] === undefined) {
                            break;
                        }
                        itemList[topic[2]].state = payload.value;
                        break;
                    case 'ItemUpdatedEvent':
                        me.addOrUpdateItem(payload[0]);
                        break;
                    case 'ItemAddedEvent':
                        me.addOrUpdateItem(payload);
                        break;
                    case 'ItemRemovedEvent':
                        for (var i = 0; i < itemList.length; i++) {
                            if (itemList[i].name == topic[2]) {
                                itemList.splice(i, 1);
                                break;
                            }
                        }
                        break;
                }
//                $rootScope.$apply();
            });
        };

        this.getList = function (refresh) {
            // TODO: Only get the list once, then rely on SSE unless we refresh
            var tStart = new Date().getTime();
            var deferred = $q.defer();

            // TODO: Need to work out how to reconnect
            if (eventSrc == null) {
                me.listen();
            }

            // Just return the current list unless it's empty, or we explicitly want to refresh
            if (itemList.length != 0 && refresh != true) {
                deferred.resolve(itemList);
                return deferred.promise;
            }

            RestService.getService(svcName).then(
                function (url) {
                    $http.get(url)
                        .success(function (data) {
                            console.log("Fetch completed in", new Date().getTime() - tStart);

                            // Handle difference between OH1 and OH2
                            if (data.item != null) {
                                data = [].concat(data.item);
                            }
                            else {
                                data = [].concat(data);
                            }

                            // Add every item in the root items list to our local copy
                            angular.forEach(data, function (item) {
                                me.addOrUpdateItem(item);
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
            for (var i = 0; i < itemList.length; i++) {
                if (itemList[i].name == itemName) {
                    return itemList[i];
                }
            }

            return null;
            return itemList[itemName];

            var tStart = new Date().getTime();
            var deferred = $q.defer();

            // First try and get our local copy
            for (var b = 0; b < itemList.length; b++) {
                if (itemList[b].name == itemName) {
                    deferred.resolve(itemList[b]);
                    return deferred.promise;
                }
            }

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

        this.getGroupMembers = function (group) {
            var members = [];

            for (var i = 0; i < itemList.length; i++) {
                if (itemList[i].groupNames != null && itemList[i].groupNames.indexOf(group) != -1) {
                    members.push(itemList[i]);
                }
            }

            return members;
        };

        this.getParentThingItem = function (item) {
            for (var i = 0; i < itemList.length; i++) {
                if (itemList[i].tags.indexOf("thing") == -1) {
                    continue;
                }
                if (item.groupNames.indexOf(itemList[i].name) != -1) {
                    return itemList[i];
                }
            }

            return null;
        };

        this.putItem = function (item) {
            if(item.tags === undefined) {
                item.tags = [];
            }
            if(item.groups == undefined) {
                item.groups = [];
            }
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

        this.linkItem = function (thing, channel, item) {
            var deferred = $q.defer();
            RestService.getService(svcNameLinks).then(
                function (url) {
                    $http.put(url + "/" + item.name + "/" + thing.UID + ':' + channel.id)
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
                    $http['delete'](url + "/" + item.name)
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
            if (typeof value === 'number') {
                value = value + '';
            }
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
