/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('HABmin.chartModel', [
    'ngResource',
    'HABmin.userModel'
])

    .service('ChartListModel', function ($http, $q) {
        this.url = '/services/habmin/persistence/charts';
        this.getList = function () {
            var tStart = new Date().getTime();
            var deferred = $q.defer();

            $http.get(this.url)
                .success(function (data) {
                    console.log("Fetch completed in", new Date().getTime() - tStart);

                    console.log("Store completed in", new Date().getTime() - tStart);

                    deferred.resolve(data.chart);
                })
                .error(function (data, status) {
                    deferred.reject(data);
                });

            return deferred.promise;
        };

        this.getChart = function (id) {
            var tStart = new Date().getTime();
            var deferred = $q.defer();

            $http.get(this.url + "/" + id)
                .success(function (data) {
                    console.log("Fetch completed in", new Date().getTime() - tStart);

                    console.log("Store completed in", new Date().getTime() - tStart);

                    deferred.resolve(data);
                })
                .error(function (data, status) {
                    deferred.reject(data);
                });

            return deferred.promise;
        };

        this.putChart = function (chart) {
            var tStart = new Date().getTime();
            var deferred = $q.defer();

            if (chart.id !== undefined && Number(chart.id) > 0) {
                $http.put(this.url + "/" + chart.id, chart)
                    .success(function (data) {
                        console.log("PUT completed in", new Date().getTime() - tStart);

                        deferred.resolve(data);
                    })
                    .error(function (data, status) {
                        deferred.reject(data);
                    });
            }

            return deferred.promise;
        };
    });