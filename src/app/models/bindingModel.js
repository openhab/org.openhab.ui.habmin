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
    'HABmin.userModel'
])

    .service('BindingModel', function ($http, $q, UserService) {
        this.url = UserService.getServer() + '/services/habmin/config/bindings';
        this.bindingList = [];
        this.bindingCfg = {
            zwave: {
                link: 'binding/zwave',
                icon: 'zwave'
            }
        };
        this.getList = function () {
            var tStart = new Date().getTime();
            var deferred = $q.defer();

            $http.get(this.url)
                .success(function (data) {
                    console.log("Fetch completed in", new Date().getTime() - tStart);

                    // Keep a local copy.
                    // This allows us to update the data later and keeps the GUI in sync.
                    this.bindingList = [].concat(data.binding);
                    console.log("Processing completed in", new Date().getTime() - tStart);

                    deferred.resolve(this.bindingList);
                })
                .error(function (data, status) {
                    deferred.reject(data);
                });

            return deferred.promise;
        };

        this.getBinding = function (binding) {
            return this.bindingCfg[binding];
        };
    })
;