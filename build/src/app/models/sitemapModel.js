angular.module('HABmin.sitemapModel', []).service('SitemapModel', [
  '$http',
  '$q',
  function ($http, $q) {
    this.socket = null;
    this.url = '/rest/sitemaps';
    this.getList = function () {
      var deferred = $q.defer();
      $http.get(this.url).success(function (data, status) {
        deferred.resolve(data.sitemap);
      }).error(function (data, status) {
        deferred.reject(data);
      });
      return deferred.promise;
    };
    this.getPage = function (page) {
      var deferred = $q.defer();
      $http.get(this.url + '/' + page).success(function (data, status) {
        deferred.resolve(data);
      }).error(function (data, status) {
        deferred.reject(data);
      });
      return deferred.promise;
    };
    this.initWatch = function (page, onData) {
      if (this.socket != null) {
        this.cancelWatch();
      }
      var request = {
          url: this.url + '/' + page,
          headers: { 'Accept': 'application/json' },
          disableCaching: true,
          maxRequest: 256,
          method: 'GET',
          logLevel: 'debug',
          transport: 'long-polling',
          attachHeadersAsQueryString: true,
          reconnectInterval: 5000,
          timeout: 59000
        };
      if ($http.defaults.headers.common['Authorization'] !== undefined) {
        request.headers['Authorization'] = $http.defaults.headers.common['Authorization'];
      }
      request.onOpen = function (response) {
        console.log('onOpen', response);
      };
      request.onClientTimeout = function (response) {
        console.log('onClientTimeout', response);
        setTimeout(function () {
        }, request.reconnectInterval);
      };
      request.onReopen = function (response) {
        console.log('onReopen', response);
      };
      request.onTransportFailure = function (errorMsg, request) {
        console.log('onTransportFailure', errorMsg, request);
      };
      request.onMessage = function (response) {
        console.log('onMessage', response);
        onData(angular.fromJson(response.responseBody));
      };
      request.onClose = function (response) {
        console.log('onClose', response);
      };
      request.onError = function (response) {
        console.log('onError', response);
      };
      request.onReconnect = function (request, response) {
        console.log('Reconnect', request, response);
      };
      console.log('Socket request is:', request);
      this.socket = $.atmosphere.subscribe(request);
      console.log('Socket response is:', this.socket);
    };
    this.cancelWatch = function () {
      if (this.socket != null) {
        this.socket.close();
        this.socket = null;
      }
    };
  }
]);