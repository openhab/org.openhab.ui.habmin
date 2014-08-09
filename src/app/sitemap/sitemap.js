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
    'HABmin.sitemapModel',
    'sitemapSliderWidget',
    'sitemapTextWidget',
    'toggle-switch',
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

    .directive('dynamicSitemap', function ($compile, SitemapModel, $stateParams) {
        return {
            restrict: 'A',
            replace: true,
            scope: {
            },
            controller: function ($scope, $element, $state) {
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
                            '<span tooltip="Hello" tooltip-trigger="mouseenter" tooltip-animation="false" ng-click="click(\'' +
                            sitemapName + '\',\'' + pageDef.parent.id +
                            '\')" class="sitemap-parent back">';
                    }
                    else {
                        pageTpl += '<span class="sitemap-parent">';
                    }
                    pageTpl += '</span>';

                    pageTpl += '<img src="../images/light_control.svg">' +
                        pageDef.title + '</div></div>';
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
                            var label = "";
                            var value = "";

                            if (widget.label != null) {
                                var matches = widget.label.match(/\[(.*?)\]/g);
                                label = widget.label;

                                if (matches != null && matches.length !== 0) {
                                    value = matches[matches.length - 1].substring(1,
                                            matches[matches.length - 1].length - 1);
                                    label = label.substr(0, label.indexOf(matches[matches.length - 1]));
                                }
                                value = value.trim();
                                label = label.trim();
                            }

                            var modelName = "W" + widget.widgetId;
                            var state = "";
                            if (widget.item != null) {
                                state = widget.item.state;
                            }

                            var valueColor = "";
                            if (widget.valuecolor) {
                                valueColor = 'style="color:' + widget.valuecolor + '"';
                            }

                            var link = "";
                            if (widget.linkedPage) {
                                link = 'ng-click="click(\'' + sitemapName + '\',\'' + widget.linkedPage.id +
                                    '\')"';
                            }

                            var widgetClass = [];
                            if (link !== "") {
                                widgetClass.push("sitemap-link");
                            }

                            // Process the widget
                            switch (widget.type) {
                                case 'Frame':
                                    output += '<div class="col-md-4"' + modelName + '>';
                                    output +=
                                        '<div class="sitemap-frame"><span><img src="../images/light_outdoor.svg">' +
                                        label +
                                        '</span><span class="pull-right">' + value + '</span></div>';

                                    if (widget.widget != null) {
                                        output += "<div>" + processWidget([].concat(widget.widget)) + "</div>";
                                    }
                                    output += '</div>';
                                    break;
                                case 'Switch':
                                    output += '<div class="row sitemap-row"' + modelName + '>';
                                    output += '<span>' + label + '</span>' +
                                        '<span class="pull-right"><toggle-switch model="' + modelName +
                                        '" on-label="ON" off-label="OFF"></toggle-switch></span>';
                                    output += '</div>';

                                    if (widget.item) {
                                        // Handle state translation
                                        switch (widget.item.type) {
                                            case "DimmerItem":
                                                if (parseInt(state, 10) > 0) {
                                                    state = true;
                                                }
                                                else {
                                                    state = false;
                                                }
                                                break;
                                            case "SwitchItem":
                                                if (state == "ON") {
                                                    state = true;
                                                }
                                                else {
                                                    state = false;
                                                }
                                        }

                                        $scope[modelName] = state;
                                    }
                                    break;
                                case 'Slider':
                                    output +=
                                        '<div class="' + widgetClass.join(" ") +
                                        '" id="' + modelName + '"' + link + '>' +
                                        '<sitemap-slider' +
                                        (label !== "" ?
                                            (' label="' + label + '"') : "") +
                                        (value !== "" ?
                                            (' value="' + value + '"') : "") +
                                        (widget.icon !== undefined ?
                                            (' icon="' + widget.icon + '"') : "") +
                                        (widget.labelcolor !== undefined ?
                                            (' label-color="' + widget.labelcolor + '"') : "") +
                                        (widget.valuecolor !== undefined ?
                                            (' value-color="' + widget.valuecolor + '"') : "") +
                                        (widget.sendFrequency !== undefined ?
                                            (' send-frequency="' + widget.sendFrequency + '"') : "") +
                                        (widget.switchSupport !== undefined ?
                                            (' switch-support="' + widget.switchSupport + '"') : "") +
                                        ' />' +
                                        '</div>';
                                    break;
                                case 'Text':
                                    widgetClass.push("row");
                                    widgetClass.push("sitemap-row");
                                    output +=
                                        '<div class="' + widgetClass.join(" ") +
                                        '" id="' + modelName + '"' + link + '>' +
                                        '<sitemap-text' +
                                        (label !== undefined ?
                                            (' label="' + label + '"') : "") +
                                        (value !== undefined ?
                                            (' value="' + value + '"') : "") +
                                        (widget.icon !== undefined ?
                                            (' icon="' + widget.icon + '"') : "") +
                                        (widget.labelcolor !== undefined ?
                                            (' label-color="' + widget.labelcolor + '"') : "") +
                                        (widget.valuecolor !== undefined ?
                                            (' value-color="' + widget.valuecolor + '"') : "") +
                                        ' />' +
                                        '</div>';
                                    break;
                                default:
                                    output += '<div class="row sitemap-row" ' + link + '>';
                                    output += "<h6 id='" + widget.widgetId + "'><span>" + label +
                                        "</span><span class='pull-right' " + valueColor + ">" + value + "</span></h6>";

                                    output += '</div>';
                                    break;
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
