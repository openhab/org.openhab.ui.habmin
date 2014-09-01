/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('HABmin.rules', [
    'ui.router',
    'ui.bootstrap',
    'ui.ace',
    'ngLocalize',
    'angular-growl',
    'angular-blockly',
    'HABmin.ruleModel'
])

    .config(function config($stateProvider) {
        $stateProvider.state('rules', {
            url: '/rules',
            views: {
                "main": {
                    controller: 'AutomationRuleCtrl',
                    templateUrl: 'automation/rule.tpl.html'
                }
            },
            data: { pageTitle: 'Rules' }
        });
    })

    .controller('AutomationRuleCtrl',
    function AutomationRuleCtrl($scope, locale, growl, RuleModel) {
        $scope.editSource = false;
        $scope.rulesTotal = 0;
        $scope.isDirty = false;

        // ------------------------------------------------
        // Load model data

        // Load the list of rules
        RuleModel.getList().then(
            function (rules) {
                $scope.rules = rules;
                if ($scope.rules != null) {
                    $scope.rulesTotal = $scope.rules.length;
                }
            },
            function (reason) {
                // handle failure
                growl.warning('Hello world ' + reason.message);
            }
        );

        // ------------------------------------------------
        // Event Handlers

        $scope.selectRule = function (rule) {
            $scope.editSource = false;

            RuleModel.getRule(rule.id).then(
                function (rule) {
                    $scope.codeEditor = rule.source;
                    $scope.blockEditor = rule;
                    $scope.isDirty = false;
                },
                function (reason) {
                    // handle failure
                    growl.warning('Hello world ' + reason.message);
                }
            );
        };

        $scope.showSource = function () {
            // When switching from blocks to source, compile through the server
            if($scope.editSource === false) {
            }

            $scope.editSource = true;
        };

        $scope.showRule = function () {
            $scope.editSource = false;
        };


        // ------------------------------------------------
        // Private functions

        $scope.workspaceChanged = function() {
            $scope.isDirty = true;
        };

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
                $scope.styleRuleList = function () {
                    return {
                        'height': (newValue.h - 145) + 'px'
                    };
                };
                $scope.styleEditor = function () {
                    return {
                        'height': (newValue.h - 127) + 'px'
                    };
                };
            }, true);

            w.bind('resize', function () {
                $scope.$apply();
            });
        };
    })

;
