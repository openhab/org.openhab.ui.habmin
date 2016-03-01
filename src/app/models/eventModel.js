/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('HABmin.eventModel', [])

    .service('EventModel', function ($rootScope) {
        var eventSrc;

        this.listen = function () {
            return;
            eventSrc = new EventSource("/rest/events?topics=smarthome/update/*");
            eventSrc.addEventListener('message', function (event) {
                console.log(event.type);
                console.log(event.data);

                var evt = angular.fromJson(event.data);

                // Broadcast an event so we update any widgets or listeners
                $rootScope.$broadcast(evt.topic, evt.object);
            });
        };
    })
;
