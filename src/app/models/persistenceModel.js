/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('HABmin.persistenceModel', [
    'ngResource',
    'HABmin.userModel'
])

    .service('PersistenceItemModel', function ($http, $q, $indexedDB) {
        this.url = '/services/habmin/persistence/items';
        this.get = function () {
            var tStart = new Date().getTime();
            var deferred = $q.defer();

            $http.get(this.url)
                .success(function (data) {
                    console.log("Fetch completed in", new Date().getTime() - tStart);


                    console.log("Store completed in", new Date().getTime() - tStart);

                    deferred.resolve(data.items);
                })
                .error(function (data, status) {
                    deferred.reject(data);
                });

            return deferred.promise;
        };

    })

    .factory("PersistenceServiceModel", function ($resource) {
        return $resource('/services/habmin/persistence/services',
            {
                //              bookId: '@bookId'
            },
            {
                query: {
                    method: 'GET',
//                    params: { bookId: '@bookI  d' },
                    isArray: false//,
//                    headers: { 'auth-token': 'C3PO R2D2' }
                }
            }
        );
    })

    .service('PersistenceDataModel', function ($http, $q, UserService, $indexedDB) {
        this.url = '/services/habmin/persistence/services/';
        this.get = function (service, item, start, stop) {
            var deferred = $q.defer();
            var parms = {};

            var tStart = new Date().getTime();

            // The store is made up of a hash of the persistence store used in OH, the item, and the data type
            var storeName = service + "." + item + '.raw';

            var x = localStorage.getItem(storeName);

            console.log("Fetch completed in", new Date().getTime() - tStart);

            if(x != null) {
                deferred.resolve(angular.fromJson(x));
                console.log("deJSON completed in", new Date().getTime() - tStart);
                return deferred.promise;
            }


            $http.get(this.url + service + "/" + item,
                {
                    starttime: start,
                    endtime: stop
                },
                {
//                    headers: {'Content-Type': 'text/plain'}
                }
            ).success(function (data, status) {
                    console.log("HTML GET completed in", new Date().getTime() - tStart);

                    localStorage.setItem(storeName, angular.toJson(data));

                    console.log("Store completed in", new Date().getTime() - tStart);

                    deferred.resolve(data);
                }).error(function (data, status) {
                    deferred.reject(data);
                });

            return deferred.promise;
        };
    });
