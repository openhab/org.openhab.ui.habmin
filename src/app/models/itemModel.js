/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('HABmin.itemModel', [
    'HABmin.userModel'
])

    .service('ItemModel', function ($http, $q, UserService) {
        this.url = UserService.getServer() + '/rest/items';

        this.socket = null;
        this.sendCommand = function (item, value) {
            console.log("Sending command", item, value);
            var deferred = $q.defer();
            $http.post(this.url + "/" + item, value, {
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
