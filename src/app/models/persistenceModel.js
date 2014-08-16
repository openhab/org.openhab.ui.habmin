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
    'ngResource'
])

    .factory("PersistenceItemModel", function ($resource) {
        return $resource('/services/habmin/persistence/items',
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

    .service('PersistenceDataModel', function ($http, $q) {
        this.socket = null;
        this.url = '/services/habmin/persistence/services/';
        this.get = function (service, item, start, stop) {
            var deferred = $q.defer();
            var parms = {};

            $http.get(this.url + service + "/" + item,
                {
                    starttime: start,
                    endtime: stop
                },
                {
//                    headers: {'Content-Type': 'text/plain'}
                }
            ).success(function (data, status) {
                    // Some extra manipulation on data if you want...
                    deferred.resolve(data);
                }).error(function (data, status) {
                    deferred.reject(data);
                });

            return deferred.promise;
        };
    });
