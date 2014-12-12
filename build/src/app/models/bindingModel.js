angular.module('HABmin.bindingModel', ['HABmin.userModel']).service('BindingModel', [
  '$http',
  '$q',
  function ($http, $q) {
    this.url = '/services/habmin/config/bindings';
    this.bindingList = [];
    this.bindingCfg = {
      zwave: {
        link: 'binding/zwave',
        icon: 'zwave'
      }
    }, this.getList = function () {
      var tStart = new Date().getTime();
      var deferred = $q.defer();
      $http.get(this.url).success(function (data) {
        console.log('Fetch completed in', new Date().getTime() - tStart);
        this.bindingList = data.binding;
        console.log('Processing completed in', new Date().getTime() - tStart);
        deferred.resolve(this.bindingList);
      }).error(function (data, status) {
        deferred.reject(data);
      });
      return deferred.promise;
    };
    this.getBinding = function (binding) {
      return this.bindingCfg[binding];
    };
    this.getRule = function (id) {
      var tStart = new Date().getTime();
      var deferred = $q.defer();
      $http.get(this.url + '/' + id).success(function (data) {
        console.log('Fetch completed in', new Date().getTime() - tStart);
        console.log('Store completed in', new Date().getTime() - tStart);
        deferred.resolve(data);
      }).error(function (data, status) {
        deferred.reject(data);
      });
      return deferred.promise;
    };
    this.putChart = function (chart) {
      var tStart = new Date().getTime();
      var deferred = $q.defer();
      if (chart.id !== undefined && Number(chart.id) > 0) {
        $http.put(this.url + '/' + chart.id, chart).success(function (data) {
          console.log('PUT completed in', new Date().getTime() - tStart);
          angular.forEach(this.chartList, function (c) {
            if (c.id === chart.id) {
              c.name = chart.name;
            }
          });
          deferred.resolve(data);
        }).error(function (data, status) {
          deferred.reject(data);
        });
      }
      return deferred.promise;
    };
  }
]);
;