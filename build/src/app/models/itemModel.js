angular.module('HABmin.itemModel', []).service('ItemModel', [
  '$http',
  '$q',
  function ($http, $q) {
    this.socket = null;
    this.url = '/rest/items';
    this.sendCommand = function (item, value) {
      console.log('Sending command', item, value);
      var deferred = $q.defer();
      $http.post(this.url + '/' + item, value, { headers: { 'Content-Type': 'text/plain' } }).success(function (data, status) {
        deferred.resolve();
      }).error(function (data, status) {
        deferred.reject(data);
      });
      return deferred.promise;
    };
  }
]);