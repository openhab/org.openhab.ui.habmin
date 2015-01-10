/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('HABmin.sitemapModel', [
    'HABmin.userModel'
//    'ngResource'
])
    .service('SitemapModel', function ($http, $q, UserService) {
        this.url = UserService.getServer() + '/rest/sitemaps';
        this.socket = null;
        this.getList = function () {
            var deferred = $q.defer();
            $http.get(this.url).success(function (data, status) {
                deferred.resolve([].concat(data.sitemap));
            }).error(function (data, status) {
                deferred.reject(data);
            });

            return deferred.promise;
        };

        this.getPage = function (page) {
            var deferred = $q.defer();
            $http.get(this.url + "/" + page).success(function (data, status) {
                // Some extra manipulation on data if you want...
                deferred.resolve(data);
            }).error(function (data, status) {
                deferred.reject(data);
            });

            return deferred.promise;
        };

        this.initWatch = function (page, onData) {
            if(this.socket != null) {
                this.cancelWatch();
            }

            var request = {
                url: this.url + "/" + page,
//            contentType: 'application/json',
                headers: {'Accept': 'application/json'},
                disableCaching: true,
                maxRequest: 256,
                method: "GET",
//            fallbackMethod: "GET",
//            dropHeaders: false,
                logLevel: 'debug',
//            force_transport: 'websocket',
//            fallbackProtocol: 'streaming',
                transport: 'long-polling',
//            fallbackTransport: 'polling',
                attachHeadersAsQueryString: true,
//            trackMessageLength: false,
                reconnectInterval: 5000,
//            enableXDR: true,
                timeout: 59000//,
//            connectTimeout: 3000,
//            pollingInterval: 60000
            };

            if($http.defaults.headers.common['Authorization'] !== undefined) {
                request.headers['Authorization'] = $http.defaults.headers.common['Authorization'];
            }

            request.onOpen = function (response) {
                console.log("onOpen", response);
            };

            request.onClientTimeout = function (response) {
                console.log("onClientTimeout", response);
                setTimeout(function () {
//                socket = atmosphere.init(request);
                }, request.reconnectInterval);
            };

            request.onReopen = function (response) {
                console.log("onReopen", response);
            };

            //For demonstration of how you can customize the fallbackTransport using the onTransportFailure function
            request.onTransportFailure = function (errorMsg, request) {
                console.log("onTransportFailure", errorMsg, request);
            };

            request.onMessage = function (response) {
                console.log("onMessage", response);
                onData(angular.fromJson(response.responseBody));
            };

            request.onClose = function (response) {
                console.log("onClose", response);
            };

            request.onError = function (response) {
                console.log("onError", response);
            };

            request.onReconnect = function (request, response) {
                console.log("Reconnect", request, response);
            };

            console.log("Socket request is:", request);
            this.socket = $.atmosphere.subscribe(request);
            console.log("Socket response is:", this.socket);
        };

        this.cancelWatch = function () {
            if(this.socket != null) {
                this.socket.close();
                this.socket = null;
            }
        };

    });


/*
 .factory('DocumentsList', function($http, $q){
 var d = $q.defer();
 $http.get('/DocumentsList').success(function(data){
 d.resolve(data);
 });
 return d.promise;
 });*/