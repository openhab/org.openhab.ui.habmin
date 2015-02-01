/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('SidepanelService', [
    'ngAnimate'
])
    .service("SidepanelService", function ($resource, $rootScope) {
        var currentPanel = "";

        this.getPanel = function () {
            return currentPanel;
        };

        this.showPanel = function (panel) {
            console.log("showPanel", panel);
            if(panel != currentPanel) {
                console.log("showPanel change to", panel);
                currentPanel = panel;
                this._notifyPanel();
            }
        };

        this._notifyPanel = function () {
            $rootScope.$broadcast('sidepanelChange', currentPanel);
        };
    })

    .directive('sidepanelToggle', function (SidepanelService) {
        return {
            restrict: 'EA',
            transclude: false,
            link: function (scope, element, attr) {
                if(attr.sidepanelToggle == null || attr.sidepanelToggle.length === 0) {
                    return;
                }

                var options = attr.sidepanelToggle.split(",");
                if(options.length === 0) {
                    return;
                }

                var panels = [];
                // Build an array of panels
                angular.forEach(options, function(option) {
                    panels.push(option.trim());
                });

                // Handle the click event
                element.on("click", function(event) {
                    for(var c = 0; c < panels.length; c++) {
                        if(panels[c] == SidepanelService.getPanel()) {
                            // We have the current panel, so step to the next one
                            c++;
                            if(c == panels.length) {
                                // We're on the last panel, go back to the first
                                c = 0;
                            }
                            SidepanelService.showPanel(panels[c]);
                        }
                    }
                });
            }
        };
    })

    .directive('sidepanelClick', function (SidepanelService) {
        return {
            restrict: 'EA',
            transclude: false,
            link: function (scope, element, attr) {
                // Handle the click event
                element.on("click", function(event) {
                    if(SidepanelService.getPanel() == 'all') {
                        return;
                    }
                    SidepanelService.showPanel(attr.sidepanelClick);
                });
            }
        };
    })

    .directive('sidepanelClass', function (SidepanelService) {
        return {
            restrict: 'EA',
            transclude: false,
            link: function (scope, element, attr) {
                if(attr.sidepanelClass == null || attr.sidepanelClass.length === 0) {
                    return;
                }

                var options = attr.sidepanelClass.split(",");
                if(options.length === 0) {
                    return;
                }

                var classes = [];
                // Build an array of classes versus panel
                angular.forEach(options, function(option) {
                    var v = option.split(':');
                    v.panel = v[0].trim();
                    v.class = v[1].trim();
                    classes.push(v);

                    if(SidepanelService.getPanel() == v.panel) {
                        element.addClass(v.class);
                    }
                });

                scope.$on("sidepanelChange", function(event, panel) {
                    console.log("Panel class change to " + panel + " is " + classes[panel]);
                    angular.forEach(classes, function(c) {
                        if(panel == c.panel) {
                            element.addClass(c.class);
                        }
                        else {
                            element.removeClass(c.class);
                        }
                    });
                });
            }
        };
    })

    .directive('sidepanelPane', function ($animate, SidepanelService) {
        return {
            restrict: 'EA',
            transclude: false,
            link: function (scope, element, attr) {
                if(SidepanelService.getPanel() != 'all' && SidepanelService.getPanel() != attr.sidepanelPane) {
                    element.addClass('ng-hide');
                }

                scope.$on("sidepanelChange", function(event, panel) {
                    console.log("Panel change (" + attr.sidepanelPane + ") to " + panel);
                    var state = false;
                    if(panel == 'all' || panel == attr.sidepanelPane) {
                        state = true;
                    }

//                    state = !state;

//                    if(state) {
//                        $animate[state ? 'removeClass' : 'addClass'](element, 'ng-hide');//, {
//                            tempClasses: 'ng-hide-animate'
  //                      });



                    if(state) {
//                        element.addClass('view-animate rtr');//.then(function () {
                        element.removeClass('ng-hide');
//                            $animate.addClass(element, 'am-slide-right');//.then(function () {
//                            tempClasses: 'ng-hide'
//                        });
                    }
                    else {
//                        element.addClass('view-animate rtr');//.then(function () {
                        element.addClass('ng-hide');
//                            $animate.addClass(element, 'ng-hide');//.then(function () {
//                            tempClasses: 'ng-hide'
//                        });
                    }
                });
            }
        };
    })
;
