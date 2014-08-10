/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('HABmin.sitemap', [
    'ui.router',
    'HABmin.itemModel',
    'HABmin.sitemapModel',
    'sitemapFrameWidget',
    'sitemapSliderWidget',
    'sitemapSelectionWidget',
    'sitemapSwitchWidget',
    'sitemapTextWidget',
    'ui.bootstrap.tooltip'
])

    .config(function config($stateProvider) {
        $stateProvider.state('sitemap', {
            url: '/sitemap',
            abstract: true,
            views: {
                "main": {
//                    controller: 'SitemapCtrl',
                    templateUrl: 'sitemap/sitemap.tpl.html'
                }
            },
            data: { pageTitle: 'Sitemap Main' },
            controller: function ($scope, params) {
                console.log("Sitemap parameters:", params);
//                $scope.title = params.getData()
            }
        });
        $stateProvider.state('sitemap.view', {
            url: '/view/:sitemapName/:sitemapPage',
            //           views: {
            //             "main": {
//                    controller: 'SitemapCtrl',
            //                   templateUrl: 'sitemap/sitemap.tpl.html'
            //           }
            //     },
            data: { pageTitle: 'Sitemap View' },
            onEnter: function () {
                console.log("onEnter");
            },
            onExit: function () {
                console.log("onExit");
            }
        });
    })

    .directive('dynamicSitemap', function ($compile, SitemapModel, $stateParams, ItemModel) {
        return {
            restrict: 'A',
            replace: true,
            scope: {
            },
            controller: function ($scope, $element, $state) {
                var widgetMap = {
                    Colorpicker: {
                        directive: "sitemap-text"
                    },
                    Chart: {
                        directive: "sitemap-text"
                    },
                    Frame: {
                        directive: "sitemap-frame"
                    },
                    Group: {
                        directive: "sitemap-frame"
                    },
                    Image: {
                        directive: "sitemap-text"
                    },
                    List: {
                        directive: "sitemap-text"
                    },
                    Selection: {
                        directive: "sitemap-selection"
                    },
                    Setpoint: {
                        directive: "sitemap-text"
                    },
                    Slider: {
                        directive: "sitemap-text"
                    },
                    Switch: {
                        directive: "sitemap-switch"
                    },
                    Text: {
                        directive: "sitemap-text"
                    },
                    Video: {
                        directive: "sitemap-text"
                    },
                    Webview: {
                        directive: "sitemap-text"
                    }
                };
                console.log("Starting dynamic-sitemap", $stateParams, $element);

                $scope.click = function (sitemapName, sitemapPage) {
                    console.log("Clicked!", sitemapName, sitemapPage);
                    $state.go('sitemap.view', {sitemapName: sitemapName, sitemapPage: sitemapPage});
                    setPage(sitemapName + '/' + sitemapPage);
                };

                console.log("Starting dynamic-sitemap", $stateParams, $element);

                $scope.$on('$destroy', function () {
                    console.log("Destroy...");
                    SitemapModel.cancelWatch();
                });

                var sitemapName = $stateParams.sitemapName;
                var sitemapPage = $stateParams.sitemapPage;

                setPage(sitemapName + '/' + sitemapPage);

                function setPage(pageAddress) {
                    SitemapModel.getPage(pageAddress).then(
                        function (data) {
                            console.log("OPEN Response is", data);
                            $element.empty();
                            $compile(processPage(data))($scope).appendTo($element);

                            SitemapModel.initWatch(pageAddress, updatePage);
                        });
                }

                function updatePage(pageDef) {
                    $element.empty();
                    $compile(processPage(pageDef))($scope).appendTo($element);
                }

                function processPage(pageDef) {
                    var pageTpl = '<div class="container sitemap-title"><div class="col-md-12">';
                    if (pageDef.parent != null) {
                        pageTpl +=
                            '<span tooltip="Back to ' + pageDef.parent.title +
                            '" tooltip-placement="bottom" ng-click="click(\'' +
                            sitemapName + '\',\'' + pageDef.parent.id +
                            '\')" class="sitemap-parent back"></span>';
                    }
                    else {
                        pageTpl += '<span class="sitemap-parent"></span>';
                    }

                    pageTpl += '<span class="sitemap-title-icon">';
                    pageTpl += '<img width="36px" src="../images/light_control.svg">';
                    pageTpl += '</span>';
                    pageTpl += pageDef.title + '</div></div>';
                    pageTpl += '<div class="sitemap-body">';
                    pageTpl += processWidget([].concat(pageDef.widget)) + "</div>";
//                    console.log("Definition is", pageTpl);

                    return pageTpl;

                    function processWidget(widgetArray) {
                        if (widgetArray == null) {
                            return "";
                        }

                        var output = "";
                        widgetArray.forEach(function (widget) {
                            if (widget == null) {
                                return;
                            }

                            // Extract the value

                            // Process the value to make it easier for the widgets
                            if (widget.label != null) {
                                var matches = widget.label.match(/\[(.*?)\]/g);
                                var label = widget.label;
                                var value = "";

                                if (matches != null && matches.length !== 0) {
                                    value = matches[matches.length - 1].substring(1,
                                            matches[matches.length - 1].length - 1);
                                    label = label.substr(0, label.indexOf(matches[matches.length - 1]));
                                }
                                widget.label = label.trim();
                                widget.value = value.trim();
                            }
                            else {
                                widget.label = "";
                                widget.value = "";
                            }


                            var state = "";
                            if (widget.item != null) {
                                state = widget.item.state;
                            }

                            var link = "";
                            if (widget.linkedPage) {
                                link = 'ng-click="click(\'' + sitemapName + '\',\'' + widget.linkedPage.id +
                                    '\')"';
                            }

                            // Create a list of CSS classes for this widget
                            var widgetClass = [];
                            if (link !== "") {
                                widgetClass.push("sitemap-link");
                            }

                            // Make sure there's a definition for this widget type!
                            if (widgetMap[widget.type] === undefined) {
                                return;
                            }

                            // Process children
                            var children = "";
                            if (widget.widget != null) {
                                children = "<div>" + processWidget([].concat(widget.widget)) + "</div>";
                            }
                            else {
                                widgetClass.push("row");
                                widgetClass.push("sitemap-row");
                            }

                            // Generate the directive definition
                            output +=
                                '<div class="' + widgetClass.join(" ") +
                                '" id="' + modelName + '"' + link + '>' +
                                '<' + widgetMap[widget.type].directive +
                                ' widget="w' + widget.widgetId + '"' +
                                ' item-model="m' + widget.widgetId + '"' +
                                '>' +
                                children +
                                '</' + widgetMap[widget.type].directive + '>' +
                                '</div>';

                            // Add the model references
                            if (widget.item !== undefined) {
                                $scope["m" + widget.widgetId] = widget.item.state;
                            }
                            $scope["w" + widget.widgetId] = widget;

                            // Set up the watch to check for changes from our user
                            if (widget.item !== undefined) {
                                $scope.$watch("m" + widget.widgetId, function (newValue, oldValue) {
                                    console.log("Change CMD '" + widget.item.name + "'  '" + newValue + "'  '" +
                                        oldValue + "'");
                                    if (newValue !== oldValue) { //$scope[modelName]) {
                                        // ItemModel.sendCmd(widget.item.name, newValue);
                                        console.log("*********** Sending command!!!");
                                    }
                                });
                            }
                        });

                        return output;
                    }
                }
            }
        };
    });

//    .controller('SitemapCtrl', function ($scope, $compile) {
//      console.log("SITEMAP Controller", $scope);
//    });
