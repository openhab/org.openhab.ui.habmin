/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('HABmin.bindingModel', [
    'HABmin.userModel',
    'HABmin.restModel'
])

    .service('BindingModel', function ($http, $q, UserService, RestService) {
        var svcBind = "bindings";
        var svcDisc = "discovery";
        var bindingList = {
            sonos: {icon: "soundcloud"},
            yahooweather: {icon: "weather"},
            zwave: {icon: "zwave"}
        };

        this.getList = function () {
            var tStart = new Date().getTime();
            var deferred = $q.defer();

            var defBind = $q.defer();
            RestService.getService(svcBind).then(
                function (url) {
                    if (url == null) {
                        deferred.resolve(null);
                        return;
                    }

                    $http.get(url)
                        .success(function (data) {
                            console.log("Fetch completed in", new Date().getTime() - tStart);

                            var newList = {};

                            // OH1 detection
                            if (data.binding != null) {
                                data = data.binding;
                            }

                            // Keep a local copy.
                            // This allows us to update the data later and keeps the GUI in sync.
                            angular.forEach(data, function (binding) {
                                // OH1 detection
                                if (binding.pid != null) {
                                    binding.id = binding.pid;
                                }

                                if (bindingList[binding.id] != null) {
                                    binding.icon = bindingList[binding.id].icon;
                                    binding.discovery = bindingList[binding.id].discovery;
                                }

                                if (binding.id !== undefined) {
                                    newList[binding.id] = binding;
                                }
                            });
                            bindingList = newList;

                            console.log("Processing completed in", new Date().getTime() - tStart);

                            defBind.resolve();
                        })
                        .error(function (data, status) {
                            defBind.reject();
                        });
                },
                function () {
                    defBind.reject();
                }
            );

            var defDisc = $q.defer();
            RestService.getService(svcDisc).then(
                function (url) {
                    if (url == null) {
                        defDisc.resolve();
                        return;
                    }

                    $http.get(url)
                        .success(function (data) {
                            console.log("Fetch completed in", new Date().getTime() - tStart);

                            // Keep a local copy.
                            // This allows us to update the data later and keeps the GUI in sync.
                            angular.forEach(data, function (binding) {
                                if (bindingList[binding] == null) {
                                    bindingList[binding] = {};
                                }
                                bindingList[binding].discovery = true;
                            });

                            console.log("Processing completed in", new Date().getTime() - tStart);

                            defDisc.resolve();
                        })
                        .error(function (data, status) {
                            defDisc.reject();
                        });
                },
                function () {
                    defDisc.reject();
                }
            );

            $q.all([defBind.promise, defDisc.promise]).then(
                function () {
                    deferred.resolve(bindingList);
                }
            );

            return deferred.promise;
        };

        this.startDiscovery = function (binding) {
            var deferred = $q.defer();

            RestService.getService(svcDisc).then(
                function (url) {
                    if (url == null) {
                        deferred.resolve(false);
                        return;
                    }

                    $http.post(url + "/scan/" + binding, {bindingId: binding})
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
