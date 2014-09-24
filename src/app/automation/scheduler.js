/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('HABmin.scheduler', [
    'ui.router',
    'ui.bootstrap',
    'ngLocalize',
    'ui.calendar'
])

    .config(function config($stateProvider) {
        $stateProvider.state('scheduler', {
            url: '/scheduler',
            views: {
                "main": {
                    controller: 'AutomationSchedulerCtrl',
                    templateUrl: 'automation/scheduler.tpl.html'
                }
            },
            data: { pageTitle: 'Scheduler' }
        });
    })

    .controller('AutomationSchedulerCtrl',
    function AutomationSchedulerCtrl($scope, locale, growl, RuleModel, $timeout, $window) {
        var date = new Date();
        var d = date.getDate();
        var m = date.getMonth();
        var y = date.getFullYear();

        $scope.changeTo = 'Hungarian';
        /* event source that pulls from google.com */
        $scope.eventSource = {
            url: "http://www.google.com/calendar/feeds/usa__en%40holiday.calendar.google.com/public/basic",
            className: 'gcal-event',           // an option!
            currentTimezone: 'America/Chicago' // an option!
        };
        /* event source that contains custom events on the scope */
        $scope.events = [
            {title: 'All Day Event', start: new Date(y, m, 1)},
            {title: 'Long Event', start: new Date(y, m, d - 5), end: new Date(y, m, d - 2)},
            {id: 999, title: 'Repeating Event', start: new Date(y, m, d - 3, 16, 0), allDay: false},
            {id: 999, title: 'Repeating Event', start: new Date(y, m, d + 4, 16, 0), allDay: false},
            {title: 'Birthday Party', start: new Date(y, m, d + 1, 19, 0), end: new Date(y, m, d + 1, 22,
                30), allDay: false},
            {title: 'Click for Google', start: new Date(y, m, 28), end: new Date(y, m, 29), url: 'http://google.com/'}
        ];
        /* event source that calls a function on every view switch */
        $scope.eventsF = function (start, end, callback) {
            var s = new Date(start).getTime() / 1000;
            var e = new Date(end).getTime() / 1000;
            var m = new Date(start).getMonth();
            var events = [
                {title: 'Feed Me ' + m, start: s + (50000), end: s + (100000), allDay: false, className: ['customFeed']}
            ];
            callback(events);
        };

        $scope.calEventsExt = {
            color: '#f00',
            textColor: 'yellow',
            events: [
                {type: 'party', title: 'Lunch', start: new Date(y, m, d, 12, 0), end: new Date(y, m, d, 14,
                    0), allDay: false},
                {type: 'party', title: 'Lunch 2', start: new Date(y, m, d, 12, 0), end: new Date(y, m, d, 14,
                    0), allDay: false},
                {type: 'party', title: 'Click for Google', start: new Date(y, m, 28), end: new Date(y, m,
                    29), url: 'http://google.com/'}
            ]
        };
        /* alert on eventClick */
        $scope.alertOnEventClick = function (event, allDay, jsEvent, view) {
            $scope.alertMessage = (event.title + ' was clicked ');
        };
        /* alert on Drop */
        $scope.alertOnDrop = function (event, dayDelta, minuteDelta, allDay, revertFunc, jsEvent, ui, view) {
            $scope.alertMessage = ('Event Droped to make dayDelta ' + dayDelta);
        };
        /* alert on Resize */
        $scope.alertOnResize = function (event, dayDelta, minuteDelta, revertFunc, jsEvent, ui, view) {
            $scope.alertMessage = ('Event Resized to make dayDelta ' + minuteDelta);
        };
        /* add and removes an event source of choice */
        $scope.addRemoveEventSource = function (sources, source) {
            var canAdd = 0;
            angular.forEach(sources, function (value, key) {
                if (sources[key] === source) {
                    sources.splice(key, 1);
                    canAdd = 1;
                }
            });
            if (canAdd === 0) {
                sources.push(source);
            }
        };
        /* add custom event*/
        $scope.addEvent = function () {
            $scope.events.push({
                title: 'Open Sesame',
                start: new Date(y, m, 28),
                end: new Date(y, m, 29),
                className: ['openSesame']
            });
        };
        /* remove event */
        $scope.remove = function (index) {
            $scope.events.splice(index, 1);
        };
        /* Change View */
        $scope.changeView = function (view, calendar) {
            calendar.fullCalendar('changeView', view);
        };
        /* Change View */
        $scope.renderCalender = function (calendar) {
            calendar.fullCalendar('render');
        };

        var w = angular.element($window);

        /* config object */
        $scope.uiConfig = {
            calendar: {
                height: w.height() - 95,
                editable: true,
                header: {
                    left: 'agendaDay,agendaWeek,month',
                    center: 'title',
                    right: 'today prev,next'
                },
                eventLimit: true,
                eventClick: $scope.alertOnEventClick,
                eventDrop: $scope.alertOnDrop,
                eventResize: $scope.alertOnResize
            }
        };

        $scope.changeLang = function () {
            if ($scope.changeTo === 'Hungarian') {
                $scope.uiConfig.calendar.dayNames =
                    ["Vasárnap", "Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat"];
                $scope.uiConfig.calendar.dayNamesShort = ["Vas", "Hét", "Kedd", "Sze", "Csüt", "Pén", "Szo"];
                $scope.changeTo = 'English';
            } else {
                $scope.uiConfig.calendar.dayNames =
                    ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                $scope.uiConfig.calendar.dayNamesShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                $scope.changeTo = 'Hungarian';
            }
        };
        /* event sources array*/
        $scope.eventSources = [$scope.events, $scope.eventSource, $scope.eventsF];
        $scope.eventSources2 = [$scope.calEventsExt, $scope.eventsF, $scope.events];
    })


    .directive('resizePage', function ($window) {
        return function ($scope, element) {
            var w = angular.element($window);
            $scope.getWindowDimensions = function () {
                return {
                    'h': w.height()
                };
            };
            $scope.$watch($scope.getWindowDimensions, function (newValue, oldValue) {
                if($scope.calendar !== undefined) {
                    $scope.calendar.fullCalendar('option', 'height', newValue.h - 95);
                }

                $scope.windowHeight = newValue.h;
                $scope.styleList = function () {
                    return {
                        'height': (newValue.h - 140) + 'px'
                    };
                };
            }, true);

            w.bind('resize', function () {
                $scope.$apply();
            });
        };
    })
;