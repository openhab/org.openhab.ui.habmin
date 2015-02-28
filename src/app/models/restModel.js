/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('HABmin.restModel', [
    'HABmin.userModel'
])

    .service('RestService', function ($http, $q, UserService) {
        // Service defaults. We default this to OH1 since OH2 provides the information
        var serviceList = {
            'habmin/designer': '/services/habmin/config/designer'
        };

        this.isServiceSupported = function(svc) {
            if(serviceList[svc] == null) {
                return false
            }
            return true;
        };

        this.updateServices = function () {
            var tStart = new Date().getTime();
            var deferred = $q.defer();

            var url = UserService.getServer() + '/rest';
            $http.get(url)
                .success(function (data) {
                    console.log("Fetch completed in", new Date().getTime() - tStart);

                    // Copy all the service links into the service list
                    angular.forEach(data.links, function(svc) {
                        //  create an anchor element (note: no need to append this element to the document)
                        var link = document.createElement('a');

                        //  set href to any path
                        link.setAttribute('href', svc.url);

                        serviceList[svc.type] = link.pathname;

                        //  cleanup for garbage collection
                        link = null;
                    });
                    console.log("Processing completed in", new Date().getTime() - tStart);

                    deferred.resolve(this.chartList);
                })
                .error(function (data, status) {
                    deferred.reject(data);
                });

            return deferred.promise;
        };

        // Return a url to the requested service
        this.getService = function(svc) {
            if(serviceList[svc] == null) {
                console.log("Request for unknown service", svc);
                return null;
            }
            return UserService.getServer() + serviceList[svc];
        }
    });