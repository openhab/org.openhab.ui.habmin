/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('HABmin.inboxModel', [
    'HABmin.userModel',
    'HABmin.restModel',
    'angular-growl',
    'ngLocalize'
])

    .service('InboxModel', function ($http, $q, growl, locale, UserService, RestService) {
        var inboxContents = [];
        var svcName = "inbox";
        var eventSrc;

        var me = this;

        this.listen = function () {
            return;
            eventSrc = new EventSource("/rest/events?topics=smarthome/inbox/*");

            eventSrc.addEventListener('message', function (event) {
                console.log(event.data);

                var evt = angular.fromJson(event.data);
                var payload = angular.fromJson(evt.payload);
                var topic = evt.topic.split("/");

                switch (evt.type) {
                    case 'InboxRemovedEvent':
                        for (var a = 0; a < inboxContents.length; a++) {
                            if (inboxContents[a].thingUID == topic[2]) {
                                inboxContents.splice(a, 1);
                                break;
                            }
                        }
                        break;
                    case 'InboxAddedEvent':
                        inboxContents.push(payload);
                        growl.success(locale.getString('discovery.NewThing', {name: payload.label}));
                        break;
                }

                /*
                 if (evt.topic.indexOf("smarthome/inbox/added") === 0) {
                 inboxContents.push(evt.object);
                 growl.success(locale.getString('discovery.NewThing', {name: evt.object.label}));
                 }
                 else if (evt.topic.indexOf("smarthome/inbox/removed") === 0) {
                 for (var a = 0; a < inboxContents.length; a++) {
                 if (inboxContents[a].thingUID == evt.object.thingUID) {
                 inboxContents.splice(a, 1);
                 break;
                 }
                 }
                 }
                 else if (evt.topic.indexOf("smarthome/inbox/updated") === 0) {
                 for (var b = 0; b < inboxContents.length; b++) {
                 if (inboxContents[b].thingUID == evt.object.thingUID) {
                 inboxContents[b] = evt.object;
                 break;
                 }
                 }
                 }
                 */
            });
        };

        this.getInbox = function () {
            if (inboxContents.length === 0) {
                me.refreshInbox();
            }
            return inboxContents;
        };

        this.refreshInbox = function () {
            var tStart = new Date().getTime();
            var deferred = $q.defer();

            if (eventSrc == null) {
                me.listen();
            }

            RestService.getService(svcName).then(
                function (url) {
                    if (url == null) {
                        deferred.resolve(null);
                        return;
                    }
                    $http.get(url)
                        .success(function (data) {
                            console.log("Fetch completed in", new Date().getTime() - tStart);

                            // Keep a local copy.
                            // This allows us to update the data later and keeps the GUI in sync.
                            // We take care here to keep the original reference so that
                            // any references to this model are updated.
                            inboxContents.length = 0;
                            inboxContents.push.apply(inboxContents, data);

                            console.log("Processing completed in", new Date().getTime() - tStart);

                            deferred.resolve(inboxContents);
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

        this.thingIgnore = function (uid) {
            var deferred = $q.defer();

            RestService.getService(svcName).then(
                function (url) {
                    if (url == null) {
                        deferred.resolve(false);
                        return;
                    }

                    $http.post(url + "/" + uid + "/ignore/")
                        .success(function (data) {
                            deferred.resolve(true);
                        })
                        .error(function (data, status) {
                            deferred.reject(false);
                        });
                },
                function () {
                    deferred.reject(false);
                }
            );

            return deferred.promise;
        };

        this.thingUnignore = function (uid) {
            var deferred = $q.defer();

            RestService.getService(svcName).then(
                function (url) {
                    if (url == null) {
                        deferred.resolve(false);
                        return;
                    }

                    $http.post(url + "/" + uid + "/unignore/")
                        .success(function (data) {
                            deferred.resolve(true);
                        })
                        .error(function (data, status) {
                            deferred.reject(false);
                        });
                },
                function () {
                    deferred.reject(false);
                }
            );

            return deferred.promise;
        };

        this.thingApprove = function (uid, name) {
            var deferred = $q.defer();

            RestService.getService(svcName).then(
                function (url) {
                    if (url == null) {
                        deferred.resolve(false);
                        return;
                    }

                    $http.post(url + "/" + uid + "/approve/", name,
                        {
                            headers: {
                                'Content-Type': 'text/plain'
                            }
                        })
                        .success(function (data) {
                            deferred.resolve(true);
                        })
                        .error(function (data, status) {
                            deferred.reject(false);
                        });
                },
                function () {
                    deferred.reject(false);
                }
            );

            deferred.resolve(true);

            return deferred.promise;
        };

        this.thingDelete = function (uid) {
            var deferred = $q.defer();

            RestService.getService(svcName).then(
                function (url) {
                    if (url == null) {
                        deferred.resolve(false);
                        return;
                    }

                    $http['delete'](url + "/" + uid, {thingUID: uid})
                        .success(function (data) {
                            deferred.resolve(true);
                        })
                        .error(function (data, status) {
                            deferred.reject(false);
                        });
                },
                function () {
                    deferred.reject(false);
                }
            );

            return deferred.promise;
        };
    })
;