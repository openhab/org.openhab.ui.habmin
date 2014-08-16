/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('HABmin.chart', [
    'ui.router',
    'placeholders',
    'ui.bootstrap',
    'ngLocalize',
    'angular-growl',
    'HABmin.persistenceModel',
    'nvd3ChartDirectives',
    'dygraphs-directive'
])

    .config(function config($stateProvider) {
        $stateProvider.state('chart', {
            url: '/chart',
            views: {
                "main": {
                    controller: 'DashboardChartCtrl',
                    templateUrl: 'dashboard/chart.tpl.html'
                }
            },
            data: { pageTitle: 'Charting' }
        });
    })

    .controller('DashboardChartCtrl',
    function DashboardChartCtrl($scope, locale, PersistenceItemModel, PersistenceServiceModel, PersistenceDataModel, growl) {
        var itemsLoaded = 0;
        var newChart;
        var chartDef;

        var chartData;


        $scope.graph = {
            data: [
            ],
            opts: {
                labels: ["x", "A"],
                xValueFormatter: Dygraph.date
            }

        };


        $scope.itemsTotal = 0;
        $scope.itemsSelected = 0;
        $scope.items = [
            {iconobject: "../images/light_led_stripe_rgb.svg", label: "1"}
        ];
        $scope.services = [];

        // Load the list of items
        PersistenceItemModel.query().$promise.then(
            function (data) {
                $scope.items = data.items;
                if ($scope.items != null) {
                    $scope.itemsTotal = $scope.items.length;
                }
            },
            function (reason) {
                // handle failure
                growl.warning('Hello world ' + reason.message);
            }
        );

        // Load the list of persistence services
        PersistenceServiceModel.query().$promise.then(
            function (data) {
                $scope.services = [].concat(data.services);
                $scope.services[0].selected = true;
                $scope.selectedService = $scope.services[0].name;
            },
            function (reason) {
                // handle failure
                growl.warning('Hello world ' + reason.message);
            }
        );

        $scope.doChart = function (parm) {
            console.log("doChart button clicked", parm);
            var stop = Math.round((new Date()).getTime());
            var start = stop - (86400 * 1000);

            itemsLoaded = 0;
            newChart = [];
            chartDef = {};
            chartDef.items = [];
            angular.forEach($scope.items, function (item) {
                if (item.selected === true) {
                    chartDef.items.push(item);
                    _loadItem(item.name, start, stop);
                }
            });
        };

        $scope.selectItem = function (parm) {
            parm.selected = !parm.selected;

            $scope.itemsSelected = 0;
            angular.forEach($scope.items, function (item) {
                if (item.selected === true) {
                    $scope.itemsSelected++;
                }
            });
        };

        $scope.clearList = function () {
            console.log("clearList button clicked");
            $scope.itemsSelected = 0;
            angular.forEach($scope.items, function (item) {
                item.selected = false;
            });
        };

        $scope.selectService = function (sel) {
            angular.forEach($scope.services, function (service) {
                if (service.name == sel.name) {
                    service.selected = true;
                }
                else {
                    service.selected = false;
                }
            });

        };

        $scope.filterDefaultString = locale.getString('common.filter');

        // This is what you will bind the filter to
        $scope.filterText = '';
        $scope.filterFunction = function (element) {
            if ($scope.filterText === "") {
                return true;
            }
            if (element.label == null) {
                return false;
            }
            return element.label.toLowerCase().indexOf($scope.filterText.toLowerCase()) !== -1 ? true : false;
        };

        function _loadItem(itemRef, start, stop) {
            console.log("Requesting ", itemRef);
            var parms = {};
            parms.starttime = start;
            parms.endtime = stop;

            var me = this;

            PersistenceDataModel.get($scope.selectedService, itemRef, start, stop)
                .then(
                function (response) {
                    console.log("The item definition is: ", response);
                    _addChartItem(response);
                }

//            }),
//            lang.hitch(this, function (error) {
//                console.log("An error occurred: " + error);
//            })
            );
        }

        function _addChartItem(item) {
            // Find the chart config for this item
            var itemCfg = null;
            for (var i = 0; i < chartDef.items.length; i++) {
                if (item.name == chartDef.items[i].name) {
                    itemCfg = chartDef.items[i];
                }
            }

            if (itemCfg == null) {
                console.error("Unable to find definition for ", item, chartDef);
                return;
            }

            // If there's no repeat time, then set it to 'infinity'
            // Otherwise turn into milliseconds
            if (itemCfg.repeatTime == null || itemCfg.repeatTime < 1) {
                itemCfg.repeatTime = 9007199254740000;
            }
            else {
                itemCfg.repeatTime *= 1000;
            }

            console.log("Adding", item.name, "- repeat is ", itemCfg.repeatTime);

            var data = {};
            data.key = itemCfg.name;
            data.label = itemCfg.label + itemsLoaded;
            var values = [];

            for (var cnt = 0; cnt < item.data.length; cnt++) {
                if (cnt !== 0) {
                    // Check if we want to extend the data
                    if (item.data[cnt].time - item.data[cnt - 1].time > itemCfg.repeatTime) {
                        values.push([Number(item.data[cnt].time - itemCfg.repeatTime),
                            Number(item.data[cnt].data[cnt - 1].state)]);
                    }
                }

                values.push([new Date(Number(item.data[cnt].time)), Number(item.data[cnt].state)]);
            }
            data.values = values;

            $scope.graph.data = values;

            console.log("Updating data:", data);

           // combineSeries()

//            newChart.push(data);

            /*        if (itemCfg.lineStyle != undefined && itemCfg.lineStyle.length > 0)
             plotOptions.stroke.style = itemCfg.lineStyle;
             if (itemCfg.lineWidth != undefined && itemCfg.lineWidth.length > 0)
             plotOptions.stroke.width = itemCfg.lineWidth;
             if (itemCfg.lineColor != undefined && itemCfg.lineColor.length > 0)
             plotOptions.stroke.color = itemCfg.lineColor;
             console.log("Adding item " + item.name + ":", plotOptions);
             if (itemCfg.label == null)
             this.chart.addSeries(item.name, data, plotOptions);
             else
             this.chart.addSeries(itemCfg.label, data, plotOptions);
             */


            // If everything is loaded, create the legend and render
            itemsLoaded++;
            console.log("Loaded " + itemsLoaded + " of " + $scope.itemsSelected);
            if (itemsLoaded >= $scope.itemsSelected) {
                console.log("Rendering chart", newChart);

                $scope.chartData = newChart;

                /*            if (this.chartLegend == true) {
                 this.legend = new Legend({chartRef: this.chart});
                 var pane = new ContentPane({region: "bottom", content: this.legend})
                 domClass.add(pane.domNode, "habminChartLegend");

                 this.addChild(pane);
                 this.legend.refresh();

                 // Hide the checkbox from the legend display
                 array.forEach(this.legend.legends, lang.hitch(this, function (legend, i) {
                 domStyle.set(legend.childNodes[0], "display", "none");

                 //	toggle action
                 hub.connect(legend.childNodes[2], "onclick", this, function (e) {
                 domClass.toggle(legend.childNodes[2], "habminLegendDisabled");
                 e.stopPropagation();
                 });
                 }));
                 }*/

//            if (this.chartDef.title)
//                this.chart.title = this.chartDef.title;

//            this.chart.fullRender();
            }
        }



        function combineSeries(seriesArray, newSeries) {
            var newArray = [];

//            for(var a = 0; a < seriesArray.length, function(val) {
  //              if()
    //        });


            var dyDataRows = [];

            var nextDataRowCols;
            var nextDataRowX;

            for (var seriesIdx = 0; seriesIdx < seriesArray.length; seriesIdx++) {
                var seriesData = seriesArray[seriesIdx];

                var newDyDataRows = [];

                var nextDataRowInsertIdx = 0;
                for (var dpIdx = 0; dpIdx < seriesData.length; dpIdx++) {
                    var dp = seriesData[dpIdx];

                    if (nextDataRowInsertIdx < dyDataRows.length) {
                        nextDataRowCols = dyDataRows[nextDataRowInsertIdx];
                        nextDataRowX = nextDataRowCols[0].getTime();
                    }

                    if (nextDataRowInsertIdx >= dyDataRows.length || dp.x < nextDataRowX) {
                        newDataRowCols = [new Date(dp.x)];
                        for (var colIdx = 0; colIdx < seriesIdx; colIdx++) {
                            newDataRowCols.push([null]);
                        }
                        newDataRowCols.push([dp.y]);
                        newDyDataRows.push(newDataRowCols);
                    }
                    else if (dp.x > nextDataRowX) {
                        newDataRowCols = nextDataRowCols.slice(0);
                        newDataRowCols.push([null]);
                        newDyDataRows.push(newDataRowCols);
                        nextDataRowInsertIdx++;
                        dpIdx--;
                    }
                    else {//(dp.x == nextDataRowX) {
                        newDataRowCols = nextDataRowCols.slice(0);
                        newDataRowCols.push([dp.y]);
                        newDyDataRows.push(newDataRowCols);
                        nextDataRowInsertIdx++;
                    }
                }

                //insert any remaining existing rows
                for (var i = nextDataRowInsertIdx; i < dyDataRows.length; i++) {
                    nextDataRowCols = dyDataRows[i];
                    var nextDataRowDateTm = nextDataRowCols[0];

                    var newDataRowCols = nextDataRowCols.slice(0);
                    newDataRowCols.push([null]);
                    newDyDataRows.push(newDataRowCols);
                }

                dyDataRows = newDyDataRows;
            }

            return dyDataRows;
        }
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
                $scope.windowHeight = newValue.h;
                $scope.styleList = function () {
                    return {
                        'height': (newValue.h - 210) + 'px'
                    };
                };
                $scope.styleChart = function () {
                    return {
                        'height': (newValue.h - 85) + 'px'
                    };
                };
            }, true);

            w.bind('resize', function () {
                $scope.$apply();
            });
        };
    })

;
