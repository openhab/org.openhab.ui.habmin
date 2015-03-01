/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('HABmin.bindingModel', [
    'HABmin.userModel',
    'HABmin.restModel'
])

    .service('BindingModel', function ($http, $q, UserService, RestService) {
        var svcName = "bindings";
        var bindingList = [];
        var bindingCfg = {
            zwave: {
                link: 'binding/zwave',
                icon: 'zwave'
            }
        };
        this.getList = function () {
            var tStart = new Date().getTime();
            var deferred = $q.defer();

            RestService.getService(svcName).then(
                function (url) {
                    $http.get(url)
                        .success(function (data) {
                            console.log("Fetch completed in", new Date().getTime() - tStart);

                            // Keep a local copy.
                            // This allows us to update the data later and keeps the GUI in sync.
                            if(data.binding) {      // OH1
                                bindingList = [].concat(data.binding);
                            }
                            else {                  // OH2
                                bindingList = [].concat(data);
                            }
                            console.log("Processing completed in", new Date().getTime() - tStart);

                            deferred.resolve(bindingList);
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

        this.getBinding = function (binding) {
            return bindingCfg[binding];
        };
    })
;