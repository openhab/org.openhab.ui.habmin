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
    });