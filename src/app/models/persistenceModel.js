/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copywrite of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('HABmin.Persistence', [
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
    });