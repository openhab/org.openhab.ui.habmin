angular.module('HABmin.ruleModel', ['HABmin.userModel']).service('RuleModel', [
  '$http',
  '$q',
  function ($http, $q) {
    this.url = '/services/habmin/config/designer';
    this.ruleList = [];
    this.getList = function () {
      var tStart = new Date().getTime();
      var deferred = $q.defer();
      $http.get(this.url).success(function (data) {
        console.log('Fetch completed in', new Date().getTime() - tStart);
        this.ruleList = data.designs;
        console.log('Processing completed in', new Date().getTime() - tStart);
        deferred.resolve(this.ruleList);
      }).error(function (data, status) {
        deferred.reject(data);
      });
      return deferred.promise;
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
    this.putRule = function (rule) {
      var tStart = new Date().getTime();
      var deferred = $q.defer();
      if (rule.id !== undefined && Number(rule.id) > 0) {
        $http.put(this.url + '/' + rule.id, rule).success(function (data) {
          console.log('PUT completed in', new Date().getTime() - tStart);
          angular.forEach(this.ruleList, function (r) {
            if (r.id === rule.id) {
              r.name = rule.name;
            }
          });
          deferred.resolve(data);
        }).error(function (data, status) {
          deferred.reject(data);
        });
      } else {
        $http.post(this.url + '/', rule).success(function (data) {
          console.log('POST completed in', new Date().getTime() - tStart);
          this.ruleList.push(data);
          deferred.resolve(data);
        }).error(function (data, status) {
          deferred.reject(data);
        });
      }
      return deferred.promise;
    };
    this.deleteRule = function (id) {
      var tStart = new Date().getTime();
      var deferred = $q.defer();
      if (id !== undefined && Number(id) > 0) {
        $http['delete'](this.url + '/' + id).success(function (data) {
          console.log('DELETE completed in', new Date().getTime() - tStart);
          var ref = 0;
          angular.forEach(this.ruleList, function (r, key) {
            if (r.id === id) {
              ref = key;
            }
          });
          if (ref !== 0) {
            this.ruleList.splice(ref, 1);
          }
          deferred.resolve(data);
        }).error(function (data, status) {
          deferred.reject(data);
        });
      } else {
        deferred.reject(data);
      }
      return deferred.promise;
    };
  }
]);
;