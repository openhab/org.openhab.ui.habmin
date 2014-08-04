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
    'toggle-switch',
    'ui-rangeSlider'
])

    .config(function config($stateProvider) {
        $stateProvider.state('sitemap', {
            url: '/sitemap:sitemapName',
            views: {
                "main": {
                    controller: 'SitemapCtrl',
                    templateUrl: 'sitemap/sitemap.tpl.html'
                }
            },
            data: { pageTitle: 'Sitemap' },
            controller: function ($scope, params) {
//                $scope.title = params.getData()
            }
        });
    })

    .directive('dynamicSitemap', function ($compile) {
        return {
            restrict: 'A',
            replace: true,
            scope: {
                pageTpl: '@'
            },
            link: function (scope, ele, attrs) {
                ele.html(scope.pageTpl);
//                $compile(ele.contents())(scope);
            },
            controller: ['$scope', function ($scope) {
                var pageDef = sitemap_chris;

                $scope.sitemapPageTitle = pageDef.title;

//                var pageTpl = '<div><toggle-switch model="switchStatus" on-label="ON" off-label="OFF"></toggle-switch></div>';
                var pageTpl = processWidget([].concat(pageDef.widget));
                console.log("Definition is", pageTpl);
                $scope.pageTpl = $compile(pageTpl)($scope);

                function processWidget(widgetArray) {
                    var output = "";
                    widgetArray.forEach(function (widget) {
                        // Extract the value
                        var matches = widget.label.match(/\[(.*?)\]/g);
                        var label = widget.label;

                        var value = "";
                        if (matches != null && matches.length !== 0) {
                            value = matches[matches.length - 1].substring(1, matches[matches.length - 1].length - 1);
                            label = label.substr(0, label.indexOf(matches[matches.length - 1]));
                        }
                        value = value.trim();
                        label = label.trim();

                        output += '<div class="row">';
                        // Process the widget
                        switch (widget.type) {
                            case 'Frame':
                                output += "<h4 id='" + widget.widgetId + "'><span>" + label +
                                    "</span><span class='pull-right'>" + value + "</span></h4><hr>";
                                break;
                            case 'Switch':
                                output += '<span>' + label +
                                    '</span><span class="pull-right"><toggle-switch knob-label="Hello" model="' +
                                    widget.item.name + '" on-label="ON" off-label="OFF" id="' + widget.widgetId +
                                    '"></toggle-switch></span>';
                                $scope[widget.item.name] = "On";
                                break;
                            case 'Slider':
                                output += '<span>' + label + '</span>' +
                                    '<span><div range-slider id="' + widget.widgetId + '"min="0" max="100" model-max="'+ widget.item.name +'" pin-handle="min"></div></span>';
//                                    '<span><slider id="' + widget.widgetId + '" ng-model="'+ widget.item.name +'" floor="0" ceiling="100" step="1" precision="1" stretch="1"></slider></span>';
//                                '<slider ng-model="{expression}" floor="{float}" ceiling="{float}" step="{float}" precision="{integer}" stretch="{integer}" translate-fn="{expression}" scale-fn="{expression}" inverse-scale-fn="{expression}"></slider>';
                                $scope[widget.item.name] = 40;
                                break;
                            default:
                                output += "<h6 id='" + widget.widgetId + "'><span>" + label +
                                    "</span><span class='pull-right'>" + value + "</span></h6>";
                                break;
                        }
                        output += '</div>';

                        if (widget.widget != null) {
                            output += "<div>" + processWidget([].concat(widget.widget)) + "</div>";
                        }
                    });

                    return output;
                }

//        ele.html(html);

                //                $scope.getFinancialMonthInformation = function () {
//                    $scope.financialInfo = financialInformationService.financialInfo;
//                }
            }]
        };
    })

    .controller('SitemapCtrl', function ($scope, $compile) {
//        $scope.sitemapPageTitle = "";


    });


var sitemap_chris = {"id": "01", "title": "Lights", "icon": "bedroom", "link": "http://192.168.2.2:10080/rest/sitemaps/chris/01", "parent": {"id": "chris", "title": "Chris - Main Menu", "link": "http://192.168.2.2:10080/rest/sitemaps/chris/chris", "leaf": "false"}, "leaf": "false", "widget": [
    {"widgetId": "01_0", "type": "Frame", "label": "Lounge", "icon": "frame", "widget": [
        {"widgetId": "01_0_0", "type": "Slider", "label": "Lounge Lights", "icon": "none", "switchSupport": "true", "sendFrequency": "0", "item": {"type": "DimmerItem", "name": "Lounge_Lights", "state": "15", "link": "http://192.168.2.2:10080/rest/items/Lounge_Lights"}},
        {"widgetId": "01_0_0_1", "type": "Switch", "label": "Lounge Lights", "icon": "none", "item": {"type": "DimmerItem", "name": "Lounge_Lights", "state": "15", "link": "http://192.168.2.2:10080/rest/items/Lounge_Lights"}},
        {"widgetId": "01_0_0_1_2", "type": "Slider", "label": "East Gable Lights", "icon": "none", "switchSupport": "true", "sendFrequency": "0", "item": {"type": "DimmerItem", "name": "Lounge_EastGableLights", "state": "0", "link": "http://192.168.2.2:10080/rest/items/Lounge_EastGableLights"}},
        {"widgetId": "01_0_0_1_2_3", "type": "Slider", "label": "West Gable Lights", "icon": "none", "switchSupport": "true", "sendFrequency": "0", "item": {"type": "DimmerItem", "name": "Lounge_WestGableLights", "state": "0", "link": "http://192.168.2.2:10080/rest/items/Lounge_WestGableLights"}},
        {"widgetId": "01_0_0_1_2_3_4", "type": "Switch", "label": "Firelight Power Switch", "icon": "temperature", "item": {"type": "SwitchItem", "name": "Lounge_Firelight_State", "state": "OFF", "link": "http://192.168.2.2:10080/rest/items/Lounge_Firelight_State"}}
    ]},
    {"widgetId": "01_1", "type": "Frame", "label": "Hall", "icon": "frame", "widget": [
        {"widgetId": "01_1_0", "type": "Switch", "label": "Kitchen Lights", "icon": "light-off", "item": {"type": "SwitchItem", "name": "Kitchen_Lights", "state": "OFF", "link": "http://192.168.2.2:10080/rest/items/Kitchen_Lights"}},
        {"widgetId": "01_1_0_1", "type": "Switch", "label": "Front Hall Lights", "icon": "light-off", "item": {"type": "SwitchItem", "name": "Hall_FrontLights", "state": "OFF", "link": "http://192.168.2.2:10080/rest/items/Hall_FrontLights"}},
        {"widgetId": "01_1_0_1_2", "type": "Switch", "label": "Back Hall Lights", "icon": "light-off", "item": {"type": "SwitchItem", "name": "Hall_BackLights", "state": "OFF", "link": "http://192.168.2.2:10080/rest/items/Hall_BackLights"}},
        {"widgetId": "01_1_0_1_2_3", "type": "Slider", "label": "Main Bedroom Lights", "icon": "none", "switchSupport": "false", "sendFrequency": "0", "item": {"type": "DimmerItem", "name": "Bed1_Lights", "state": "0", "link": "http://192.168.2.2:10080/rest/items/Bed1_Lights"}}
    ]},
    {"widgetId": "01_2", "type": "Frame", "label": "Outside", "icon": "frame", "widget": [
        {"widgetId": "01_2_0", "type": "Switch", "label": "Outside Lights", "icon": "light-off", "item": {"type": "SwitchItem", "name": "Outside_FrontLights", "state": "OFF", "link": "http://192.168.2.2:10080/rest/items/Outside_FrontLights"}},
        {"widgetId": "01_2_0_1", "type": "Switch", "label": "Garage Lights", "icon": "none", "item": {"type": "SwitchItem", "name": "Garage_Lights", "state": "Uninitialized", "link": "http://192.168.2.2:10080/rest/items/Garage_Lights"}}
    ]}
]};
