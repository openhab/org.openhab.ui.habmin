/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2016 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('HABmin.extensionModel', [
    'HABmin.userModel',
    'HABmin.restModel'
])

    .service('ExtensionModel', function ($http, $q, UserService, RestService) {
        var svcExtensions = "/extensions";
        var extensionTypeList = [];

        this.getTypes = function () {
            var tStart = new Date().getTime();
            var deferred = $q.defer();

            RestService.getService(svcExtensions).then(
                function (url) {
                    if (url == null) {
                        deferred.resolve(null);
                        return;
                    }

                    $http.get(url + "/types")
                        .success(function (data) {
                            console.log("Fetch completed in", new Date().getTime() - tStart);

                            // Keep a local copy.
                            // This allows us to update the data later and keeps the GUI in sync.
                            angular.forEach(data, function (newType) {
                                var found = false;
                                angular.forEach(extensionTypeList, function (extensionType) {
                                    if (extensionType.id == newType.id) {
                                        for (var i in newType) {
                                            extensionType[i] = newType[i];
                                        }
                                        found = true;
                                    }
                                });

                                // Is this a new binding we've not seen before?
                                if (found == false) {
                                    extensionTypeList.push(newType);
                                }
                            });

                            console.log("Processing completed in", new Date().getTime() - tStart);

                            deferred.resolve(extensionTypeList);
                        })
                        .error(function (data, status) {
                            deferred.reject();
                        });
                },
                function () {
                    deferred.reject();
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
                        return deferred.promise;
                    }

                    $http.post(url + "/bindings/" + binding + "/scan") //, {bindingId: binding})
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
