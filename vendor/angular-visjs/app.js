'use strict';

// TODO
// Use grunt or gulp for minimizing and distribution
// Documentation

var ngVisApp = angular.module('ngVisApp', ['ngVis']);

ngVisApp.controller('appController', function ($scope, $location, $timeout, visDataSet) {

  $scope.logs = {};

  $scope.defaults = {
    orientation: ['top', 'bottom'],
    autoResize: [true, false],
    showCurrentTime: [true, false],
    showCustomTime: [true, false],
    showMajorLabels: [true, false],
    showMinorLabels: [true, false],
    align: ['left', 'center', 'right'],
    stack: [true, false],

    moveable: [true, false],
    zoomable: [true, false],
    selectable: [true, false],
    editable: [true, false]
  };

  var options = {
    align: 'center', // left | right (String)
    autoResize: true, // false (Boolean)
    editable: true,
    selectable: true,
    // start: null,
    // end: null,
    // height: null,
    // width: '100%',
    // margin: {
    //   axis: 20,
    //   item: 10
    // },
    // min: null,
    // max: null,
    // maxHeight: null,
    orientation: 'bottom',
    // padding: 5,
    showCurrentTime: true,
    showCustomTime: true,
    showMajorLabels: true,
    showMinorLabels: true
    // type: 'box', // dot | point
    // zoomMin: 1000,
    // zoomMax: 1000 * 60 * 60 * 24 * 30 * 12 * 10,
    // groupOrder: 'content'
  };

  var now = moment().minutes(0).seconds(0).milliseconds(0);

  var sampleData = function () {
    return visDataSet([
      { id: 1,
        content: '<i class="fi-flag"></i> item 1',
        start: moment().add('days', 1),
        className: 'magenta' },
      { id: 2,
        content: '<a href="http://visjs.org" target="_blank">visjs.org</a>',
        start: moment().add('days', 2) },
      { id: 3,
        content: 'item 3',
        start: moment().add('days', -2) },
      { id: 4,
        content: 'item 4',
        start: moment().add('days', 1),
        end: moment().add('days', 3),
        type: 'range' },
      { id: 7,
        content: '<i class="fi-anchor"></i> item 7',
        start: moment().add('days', -3),
        end: moment().add('days', -2),
        type: 'range',
        className: 'orange' },
      { id: 5,
        content: 'item 5',
        start: moment().add('days', -1),
        type: 'point' },
      { id: 6,
        content: 'item 6',
        start: moment().add('days', 4),
        type: 'point' }
    ]);
  };

  $scope.setExample = function (example) {
    $scope.example = example;

    $timeout(function () { $scope.timeline.clear({options: true}) });

    switch (example) {

      case 'basicUsage':
        $scope.data = sampleData();

        $scope.options = angular.extend(options, {});
        break;

      case 'groups':
        $scope.data = visDataSet({
          groups: [
            {id: 0, content: 'First', value: 1},
            {id: 1, content: 'Third', value: 3},
            {id: 2, content: 'Second', value: 2}
          ],
          items: [
            {id: 0, group: 0, content: 'item 0', start: new Date(2014, 3, 17), end: new Date(2014, 3, 21)},
            {id: 1, group: 0, content: 'item 1', start: new Date(2014, 3, 19), end: new Date(2014, 3, 20)},
            {id: 2, group: 1, content: 'item 2', start: new Date(2014, 3, 16), end: new Date(2014, 3, 24)},
            {id: 3, group: 1, content: 'item 3', start: new Date(2014, 3, 23), end: new Date(2014, 3, 24)},
            {id: 4, group: 1, content: 'item 4', start: new Date(2014, 3, 22), end: new Date(2014, 3, 26)},
            {id: 5, group: 2, content: 'item 5', start: new Date(2014, 3, 24), end: new Date(2014, 3, 27)}
          ]
        });

        var orderedContent = 'content';
        var orderedSorting = function (a, b) {
          // option groupOrder can be a property name or a sort function
          // the sort function must compare two groups and return a value
          //     > 0 when a > b
          //     < 0 when a < b
          //       0 when a == b
          return a.value - b.value;
        };

        $scope.options = angular.extend(options, {
          groupOrder: orderedContent,
          editable: true
        });
        break;


      case 'points':
        $scope.data = visDataSet([
          {start: new Date(1939, 8, 1), content: 'German Invasion of Poland'},
          {start: new Date(1940, 4, 10), content: 'Battle of France and the Low Countries'},
          {start: new Date(1940, 7, 13), content: 'Battle of Britain - RAF vs. Luftwaffe'},
          {start: new Date(1941, 1, 14), content: 'German Afrika Korps arrives in North Africa'},
          {start: new Date(1941, 5, 22), content: 'Third Reich Invades the USSR'},
          {start: new Date(1941, 11, 7), content: 'Japanese Attack Pearl Harbor'},
          {start: new Date(1942, 5, 4), content: 'Battle of Midway in the Pacific'},
          {start: new Date(1942, 10, 8), content: 'Americans open Second Front in North Africa'},
          {start: new Date(1942, 10, 19), content: 'Battle of Stalingrad in Russia'},
          {start: new Date(1943, 6, 5), content: 'Battle of Kursk - Last German Offensive on Eastern Front'},
          {start: new Date(1943, 6, 10), content: 'Anglo-American Landings in Sicily'},
          {start: new Date(1944, 2, 8), content: 'Japanese Attack British India'},
          {start: new Date(1944, 5, 6), content: 'D-Day - Allied Invasion of Normandy'},
          {start: new Date(1944, 5, 22), content: 'Destruction of Army Group Center in Byelorussia'},
          {start: new Date(1944, 7, 1), content: 'The Warsaw Uprising in Occupied Poland'},
          {start: new Date(1944, 9, 20), content: 'American Liberation of the Philippines'},
          {start: new Date(1944, 11, 16), content: 'Battle of the Bulge in the Ardennes'},
          {start: new Date(1944, 1, 19), content: 'American Landings on Iwo Jima'},
          {start: new Date(1945, 3, 1), content: 'US Invasion of Okinawa'},
          {start: new Date(1945, 3, 16), content: 'Battle of Berlin - End of the Third Reich'}
        ]);

        $scope.options = angular.extend(options, {
          // Set global item type. Type can also be specified for items individually
          // Available types: 'box' (default), 'point', 'range', 'rangeoverflow'
          type: 'point',
          showMajorLabels: false
        });
        break;


      case 'aLotOfGroupedData':
        $scope.groupCountValue = $scope.groupCountValue || 100;

        $scope.groupCount = function (count) {
          var data = {
            groups: [
              {id: 1, content: 'Truck&nbsp;1'},
              {id: 2, content: 'Truck&nbsp;2'},
              {id: 3, content: 'Truck&nbsp;3'},
              {id: 4, content: 'Truck&nbsp;4'}
            ],
            items: []
          };

          var order = 1;
          var truck = 1;

          for (var j = 0; j < 4; j++) {
            var date = new Date();

            for (var i = 0; i < count / 4; i++) {
              date.setHours(date.getHours() + 4 * (Math.random() < 0.2));
              var start = new Date(date);
              date.setHours(date.getHours() + 2 + Math.floor(Math.random() * 4));
              var end = new Date(date);

              data.items.push({
                id: order,
                group: truck,
                start: start,
                end: end,
                content: 'Order ' + order
              });

              order++;
            }

            truck++;
          }

          $scope.data = visDataSet(data);
        };

        $scope.groupCount($scope.groupCountValue);

        $scope.options = angular.extend(options, {
          stack: false,
          start: new Date(),
          end: new Date(1000 * 60 * 60 * 24 + (new Date()).valueOf()),
          editable: true,
          margin: {
            item: 10, // minimal margin between items
            axis: 5   // minimal margin between items and the axis
          },
          orientation: 'top'
        });
        break;


      case 'dataSerialization':
        $scope.data = visDataSet([
          {"id": 1, "content": "item 1<br>start", "start": "2014-01-23"}
//          ,
//          {"id": 2, "content": "item 2", "start": "2014-01-18"},
//          {"id": 3, "content": "item 3", "start": "2014-01-21"},
//          {"id": 4, "content": "item 4", "start": "2014-01-19", "end": "2014-01-24"},
//          {"id": 5, "content": "item 5", "start": "2014-01-28", "type": "point"},
//          {"id": 6, "content": "item 6", "start": "2014-01-26"}
        ]);

        $scope.options = angular.extend(options, {
          editable: true
        });

        $scope.loadData = function () {
          var data = $scope.data.load.get({
            type: {
              start: 'ISODate',
              end: 'ISODate'
            }
          });

          $timeout(function () {
            $scope.serialized = JSON.stringify(data, null, 2);
          });
        };

        $scope.saveData = function () {
          var txtData = document.getElementById('data');
          var data = JSON.parse(txtData.value);

          $scope.data.load.clear();
          $scope.data.load.update(data);

          $scope.timeline.fit();
        };

        $scope.loadData();
        break;
    }

    $timeout(function () { $scope.timeline.fit() });
  };

  $scope.setView = function (view) {
    $scope.page = {
      introduction: false,
      options: false,
      events: false,
      navigation: false
    };

    $scope.page[view] = true;

    switch (view) {
      case 'introduction':
        $scope.setExample('basicUsage');
        break;
      case 'options':
        $scope.setExample('basicUsage');
        break;
      case 'events':
        $scope.data = sampleData();

        $scope.options = angular.extend(options, {
          editable: true,

          onAdd: function (item, callback) {
            item.content = prompt('Enter text content for new item:', item.content);

            if (item.content != null) {
              callback(item); // send back adjusted new item
            }
            else {
              callback(null); // cancel item creation
            }
          },

          onMove: function (item, callback) {
            if (confirm('Do you really want to move the item to\n' +
              'start: ' + item.start + '\n' +
              'end: ' + item.end + '?')) {
              callback(item); // send back item as confirmation (can be changed
            }
            else {
              callback(null); // cancel editing item
            }
          },

          onUpdate: function (item, callback) {
            item.content = prompt('Edit items text:', item.content);

            if (item.content != null) {
              callback(item); // send back adjusted item
            }
            else {
              callback(null); // cancel updating the item
            }
          },

          onRemove: function (item, callback) {
            if (confirm('Remove item ' + item.content + '?')) {
              callback(item); // confirm deletion
            }
            else {
              callback(null); // cancel deletion
            }
          }
        });
        break;
      case 'navigation':
        $scope.setExample('basicUsage');
        break;
    }

    $location.hash(view);
  };

  $scope.setView($location.hash() || 'introduction');

  $timeout(function () {
    $scope.events = {
      rangechange: function (properties) {
        $timeout(function () {
          $scope.logs.rangechange = properties;
        });
      },
      rangechanged: function (properties) {
        $timeout(function () {
          $scope.logs.rangechanged = properties;
        });
      },
      timechange: function (properties) {
        $timeout(function () {
          $scope.logs.timechange = properties;
        });
      },
      timechanged: function (properties) {
        $timeout(function () {
          $scope.logs.timechanged = properties;
        });
      },
      select: function (properties) {
        $timeout(function () {
          $scope.logs.select = properties;
        });
      }
    };

    $scope.data.load.on('*', function (event, properties) {
      $timeout(function () {
        $scope.logs.items = {
          event: event,
          properties: properties
        };
      });
    });
  });
});







//case 'customTimeBar':
//$scope.customTime = moment().year() + '-' +
//  parseInt(moment().month() + 1) + '-' +
//  parseInt(moment().date() + 2);
//
//$scope.getCustomTime = function () {
//  $scope.logs.customTime = $scope.timeline.getCustomTime();
//};
//
//$scope.data = visDataSet([]);
//
//$scope.options = angular.extend(options, {
//  showCurrentTime: true,
//  showCustomTime: true,
//  start: new Date(Date.now() - 1000 * 60 * 60 * 24),
//  end: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6)
//});
//break;








//case 'pastAndFuture':
//$scope.data = visDataSet([
//  {
//    id: 1,
//    start: new Date((new Date()).getTime() - 60 * 1000),
//    end: new Date(),
//    content: 'Dynamic event'
//  }
//]);
//
//$scope.options = angular.extend(options, {
//  showCurrentTime: true,
//  showCustomTime: true
//});
//
//$scope.events = {
//  timechange: function (event) {
//    $timeout(function () {
//      $scope.logs.timechange = event.time;
//
//      var item = $scope.data.load.get(1);
//
//      if (moment(event.time).unix() > moment(item.start).unix()) {
//        item.end = new Date(event.time);
//
//        var now = new Date();
//
//        if (event.time < now) {
//          item.content = "Dynamic event (past)";
//          item.className = 'past';
//        }
//        else if (event.time > now) {
//          item.content = "Dynamic event (future)";
//          item.className = 'future';
//        }
//        else {
//          item.content = "Dynamic event (now)";
//          item.className = 'now';
//        }
//
//        $scope.data.load.update(item);
//      }
//    });
//  }
//};
//
//$timeout(function () {
//  // set a custom range from -2 minute to +3 minutes current time
//  $scope.timeline.setWindow({
//    start: new Date((new Date()).getTime() - 2 * 60 * 1000),
//    end: new Date((new Date()).getTime() + 3 * 60 * 1000)
//  });
//});
//break;