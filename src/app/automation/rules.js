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
            data: { pageTitle: 'Rules' },
            resolve: {
                // Make sure the localisation files are resolved before the controller runs
                localisations: function (locale) {
                    return locale.ready('habmin');
                }
            }
        });
    })

    .controller('AutomationRuleCtrl',
    function AutomationRuleCtrl($scope, locale, growl, RuleModel, $timeout) {
        $scope.editSource = false;
        $scope.rulesTotal = -1;
        $scope.isDirty = false;
        $scope.selectedRule = null;

        var restoreRule = null;

        // ------------------------------------------------
        // Load model data

        // Load the list of rules
        RuleModel.getList().then(
            function (rules) {
                $scope.rules = rules;
                $scope.rulesTotal = 0;
                if ($scope.rules != null) {
                    $scope.rulesTotal = $scope.rules.length;
                }
            },
            function (reason) {
                // handle failure
                growl.warning('Hello world ' + reason.message);
                $scope.rulesTotal = 0;
            }
        );

        // ------------------------------------------------
        // Event Handlers

        $scope.selectRule = function (rule) {
            $scope.editSource = false;
            $scope.selectedRule = rule;

            RuleModel.getRule(rule.id).then(
                function (rule) {
                    restoreRule = rule;
                    $scope.codeEditor = rule.source;
                    $scope.blockEditor = rule;
                    $scope.isDirty = false;
                },
                function (reason) {
                    // handle failure
                    growl.warning(locale.getString('habmin.ruleErrorLoadingRule', [rule.name, reason]));
                }
            );
        };

        $scope.newRule = function () {
            $scope.codeEditor = "";
            $scope.blockEditor = {
                    block: [
                        {
                            type: 'openhab_rule',
                            deletable: false,
                            movable: false,
                            fields: [
                                {name: "NAME", value: locale.getString('habmin.ruleNewRuleTitle')}
                            ]
                        }
                    ]

            };
            $scope.isDirty = false;
            $scope.selectedRule = null;
        };

        $scope.saveRule = function (rule) {
            RuleModel.putRule(rule).then(function() {
                $scope.isDirty = false;
            });
        };

        $scope.cancelRule = function (rule) {
            if (restoreRule == null) {
                return;
            }
            $scope.codeEditor = "";
            $scope.blockEditor = {};

            $timeout(function () {
                $scope.codeEditor = restoreRule.source;
                $scope.blockEditor = restoreRule;
                $scope.isDirty = false;
            });
        };

        $scope.deleteRule = function () {
            RuleModel.deleteRule($scope.selectedRule.id);
        };

        $scope.showSource = function () {
            // When switching from blocks to source, compile through the server
            if ($scope.editSource === false) {
            }

            $scope.editSource = true;
        };

        $scope.showRule = function () {
            $scope.editSource = false;
        };


        // ------------------------------------------------
        // Private functions

        $scope.workspaceChanged = function () {
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
                        'height': (newValue.h - 150) + 'px'
                    };
                };
                $scope.styleEditor = function () {
                    return {
                        'height': (newValue.h - 117) + 'px'
                    };
                };
            }, true);

            w.bind('resize', function () {
                $scope.$apply();
            });
        };
    })

;
