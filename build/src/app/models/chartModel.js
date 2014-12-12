angular.module('HABmin.chartModel', ['HABmin.userModel']).service('ChartListModel', [
  '$http',
  '$q',
  function ($http, $q) {
    this.url = '/services/habmin/persistence/charts';
    this.chartList = [];
    this.getList = function () {
      var tStart = new Date().getTime();
      var deferred = $q.defer();
      $http.get(this.url).success(function (data) {
        console.log('Fetch completed in', new Date().getTime() - tStart);
        this.chartList = data.chart;
        console.log('Processing completed in', new Date().getTime() - tStart);
        deferred.resolve(this.chartList);
      }).error(function (data, status) {
        deferred.reject(data);
      });
      return deferred.promise;
    };
    this.getChart = function (id) {
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
      } else {
        $http.post(this.url, chart).success(function (data) {
          console.log('POST completed in', new Date().getTime() - tStart);
          this.chartList.push(chart);
          deferred.resolve(data);
        }).error(function (data, status) {
          deferred.reject(data);
        });
      }
      return deferred.promise;
    };
    this.deleteChart = function (id) {
      var tStart = new Date().getTime();
      var deferred = $q.defer();
      if (id !== undefined && Number(id) > 0) {
        $http['delete'](this.url + '/' + id).success(function (data) {
          console.log('DELETE completed in', new Date().getTime() - tStart);
          var ref = 0;
          angular.forEach(this.chartList, function (c, key) {
            if (c.id === id) {
              ref = key;
            }
          });
          if (ref !== 0) {
            this.chartList.splice(ref, 1);
          }
          deferred.resolve(data);
        }).error(function (data, status) {
          deferred.reject(data);
        });
      }
    };
  }
]);