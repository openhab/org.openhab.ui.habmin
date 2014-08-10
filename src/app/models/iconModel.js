/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014 Chris Jackson (chris@cd-jackson.com)
 *
 * Some parts of this code from -:
 * * SVGInjector v1.1.0 - Fast, caching, dynamic inline SVG DOM injection library
 * * https://github.com/iconic/SVGInjector
 * *
 * * Copyright (c) 2014 Waybury <hello@waybury.com>
 * * @license MIT
 */

angular.module('HABmin.iconModel', [
])
        .service("ImgFactory", function ($resource) {
            this._lookupTable = {
                bath: {icon: ""},
                bedroom: {icon: ""},
                chart: {icon: ""},
                climate: {icon: ""},
                colorwheel: {icon: ""},
                energy: {icon: ""},
                fire: {icon: ""},
                garage: {icon: ""},
                garagedoor: {icon: ""},
                garden: {icon: "scene_garden.svg"},
                heating: {icon: "sani_heating.svg"},
                kitchen: {icon: "scene_microwave_oven.svg"},
                light: {icon: "light_ceiling_light.svg"},
                network: {icon: ""},
                outdoorlight: {icon: "light_outdoor.svg"},
                raingauge: {icon: "weather_rain_gauge.svg"},
                slider: {icon: ""},
                socket: {icon: "message_socket.svg"},
                "switch": {icon: ""},
                temperature: {icon: "temp_inside.svg"},
                weather: {icon: "weather_cloudy.svg"}
            };

            this.lookupImage = function(src) {
                if(this._lookupTable[src] === undefined) {
                    return "";
                }
                return "../../images/" + this._lookupTable[src].icon;
            };
        });

            /*
    .directive('imgTransform', function () {
        return {
            restrict: 'A',
            controller: function ($scope, $element, $attrs) {
                $attrs.$set('ngSrc', 'someOtherValue');
            }
        };
    });


    .factory("PersistenceItemModel", function ($resource) {
 var folder = "../images/svg/";

 // Image Cache
 var svgCache = {};

 // Request Queue
 var requestQueue = [];

 function queueRequest(url, callback) {
 requestQueue[url] = requestQueue[url] || [];
 requestQueue[url].push(callback);
 };

 var processRequestQueue = function (url) {
 for (var i = 0, len = requestQueue[url].length; i < len; i++) {

 }
 };

 return {
 load: function (url) {
 var loadSvg = function (url, callback) {
 if (svgCache[url] !== undefined) {
 if (svgCache[url] instanceof SVGSVGElement) {
 // We already have it in cache, so use it
 callback(cloneSvg(svgCache[url]));
 }
 else {
 // We don't have it in cache yet, but we are loading it, so queue this request
 queueRequest(url, callback);
 }
 }
 else {
 // Seed the cache to indicate we are loading this URL already
 svgCache[url] = {};
 queueRequest(url, callback);

 httpRequest.onreadystatechange = function () {
 // readyState 4 = complete
 if (httpRequest.readyState === 4) {

 // Handle status
 if (httpRequest.status === 404 || httpRequest.responseXML === null) {
 callback('Unable to load SVG file: ' + url);

 if (isLocal) callback('Note: SVG injection ajax calls do not work locally without adjusting security setting in your browser. Or consider using a local webserver.');

 callback();
 return false;
 }

 // 200 success from server, or 0 when using file:// protocol locally
 if (httpRequest.status === 200 || (isLocal && httpRequest.status === 0)) {

 // globals Document
 if (httpRequest.responseXML instanceof Document) {
 // Cache it
 svgCache[url] = httpRequest.responseXML.documentElement;
 }
 // globals -Document

 // IE9 doesn't create a responseXML Document object from loaded SVG,
 // and throws a "DOM Exception: HIERARCHY_REQUEST_ERR (3)" error when injected.
 //
 // So, we'll just create our own manually via the DOMParser using
 // the the raw XML responseText.
 //
 // :NOTE: IE8 and older doesn't have DOMParser, but they can't do SVG either, so...
 else if (DOMParser && (DOMParser instanceof Function)) {
 var xmlDoc;
 try {
 var parser = new DOMParser();
 xmlDoc = parser.parseFromString(httpRequest.responseText, 'text/xml');
 }
 catch (e) {
 xmlDoc = undefined;
 }

 if (!xmlDoc || xmlDoc.getElementsByTagName('parsererror').length) {
 callback('Unable to parse SVG file: ' + url);
 return false;
 }
 else {
 // Cache it
 svgCache[url] = xmlDoc.documentElement;
 }
 }

 // We've loaded a new asset, so process any requests waiting for it
 processRequestQueue(url);
 }
 else {
 callback('There was a problem injecting the SVG: ' + httpRequest.status + ' ' +
 httpRequest.statusText);
 return false;
 }
 }
 };

 httpRequest.open('GET', url);

 // Treat and parse the response as XML, even if the
 // server sends us a different mimetype
 if (httpRequest.overrideMimeType) httpRequest.overrideMimeType('text/xml');

 httpRequest.send();
 }
 };
 }
 }

 });*/
