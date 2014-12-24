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
    'HABmin.ruleModel',
    'ResizePanel'
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
            data: {pageTitle: 'Rules'},
            resolve: {
                // Make sure the localisation files are resolved before the controller runs
                localisations: function (locale) {
                    return locale.ready('habmin');
                }
            }
        });
    })

    .controller('AutomationRuleCtrl',
    function AutomationRuleCtrl($scope, locale, growl, RuleModel, Blockly, $timeout) {
        var newDesign = [
            {
                type: 'openhab_rule',
                deletable: false,
                movable: false,
                fields: [
                    {name: "NAME", value: locale.getString('habmin.ruleNewRuleTitle')}
                ]
            }
        ];

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

            Blockly.onChange(function () {
                $scope.isDirty = true;
                $scope.$apply();
            });

            RuleModel.getRule(rule.id).then(
                function (rule) {
                    restoreRule = rule;
                    if (rule.block === undefined || rule.block === null) {
                        rule.block = newDesign;
                    }
                    $scope.codeEditor = rule.source;
                    Blockly.setWorkspace({block: rule.block});
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
            Blockly.setWorkspace({block: newDesign});
            $scope.isDirty = false;
            $scope.selectedRule = null;
        };

        $scope.saveRule = function () {
            var rule = {};
            // Read the blocks. If it's not defined, then set to a new rule
            if (Blockly.getWorkspace() != null) {
                rule.block = Blockly.getWorkspace().block[0];
            }
            else {
                rule.block = newDesign;
            }
            if ($scope.selectedRule !== null) {
                rule.id = $scope.selectedRule.id;
            }

            rule.name = "";
            if (rule.block.type === "openhab_rule") {
                rule.name = rule.block.fields[0].value;
            }

            RuleModel.putRule(rule).then(function (result) {
                $scope.selectedRule = result;
                $scope.isDirty = false;
            });
        };

        $scope.cancelRule = function () {
            if (restoreRule == null) {
                return;
            }
            $scope.codeEditor = restoreRule.source;
            Blockly.setWorkspace(restoreRule);
            $scope.isDirty = false;
        };

        $scope.deleteRule = function () {
            RuleModel.deleteRule($scope.selectedRule.id).then(function () {
                Blockly.clearWorkspace();
                $scope.codeEditor = "";
                $scope.selectedRule = null;
                restoreRule = null;
                $scope.isDirty = false;
            });
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


    })

;


/*

 renameVariableCallback = function (prompt, value, callback) {
 $scope.dlg = {};
 $scope.dlg.title = prompt;
 $scope.dlg.value = value;

 var controller = function ($modalInstance) {
 $scope.dlg.ok = function () {
 callback($scope.dlg.value);
 $modalInstance.close();
 };
 $scope.dlg.cancel = function () {
 $modalInstance.dismiss();
 };
 };

 $modal.open({
 backdrop: 'static',
 keyboard: true,
 scope: $scope,
 modalFade: true,
 template: '<div class="modal-header">' +
 '<h3 class="modal-title">{{dlg.title}}</h3>' +
 '</div>' +
 '<div class="modal-body">' +
 '<form class="form-horizontal" role="form">' +
 '<div class="form-group">' +
 '<label for="inputOption" class="col-sm-3 control-label" i18n="habmin.ruleValue"></label>' +
 '<div class="col-sm-9">' +
 '<input type="text" class="form-control" ng-model="dlg.value">' +
 '</div>' +
 '</div>' +
 '</div>' +
 '</form>' +
 '</div>' +
 '<div class="modal-footer">' +
 '<button class="btn btn-primary" ng-click="dlg.ok()" i18n="common.save"></button>' +
 '<button class="btn btn-warning" ng-click="dlg.cancel()" i18n="common.cancel"></button>' +
 '</div>',
 controller: controller
 });
 };
 */