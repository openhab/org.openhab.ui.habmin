angular.module('HABmin.rules', [
  'ui.router',
  'ui.bootstrap',
  'ui.ace',
  'ngLocalize',
  'angular-growl',
  'angular-blockly',
  'HABmin.ruleModel'
]).config([
  '$stateProvider',
  function config($stateProvider) {
    $stateProvider.state('rules', {
      url: '/rules',
      views: {
        'main': {
          controller: 'AutomationRuleCtrl',
          templateUrl: 'automation/rule.tpl.html'
        }
      },
      data: { pageTitle: 'Rules' },
      resolve: {
        localisations: function (locale) {
          return locale.ready('habmin');
        }
      }
    });
  }
]).controller('AutomationRuleCtrl', [
  '$scope',
  'locale',
  'growl',
  'RuleModel',
  'Blockly',
  '$timeout',
  function AutomationRuleCtrl($scope, locale, growl, RuleModel, Blockly, $timeout) {
    var newDesign = [{
          type: 'openhab_rule',
          deletable: false,
          movable: false,
          fields: [{
              name: 'NAME',
              value: locale.getString('habmin.ruleNewRuleTitle')
            }]
        }];
    $scope.editSource = false;
    $scope.rulesTotal = -1;
    $scope.isDirty = false;
    $scope.selectedRule = null;
    var restoreRule = null;
    RuleModel.getList().then(function (rules) {
      $scope.rules = rules;
      $scope.rulesTotal = 0;
      if ($scope.rules != null) {
        $scope.rulesTotal = $scope.rules.length;
      }
    }, function (reason) {
      growl.warning('Hello world ' + reason.message);
      $scope.rulesTotal = 0;
    });
    $scope.selectRule = function (rule) {
      $scope.editSource = false;
      $scope.selectedRule = rule;
      Blockly.onChange(function () {
        $scope.isDirty = true;
        $scope.$apply();
      });
      RuleModel.getRule(rule.id).then(function (rule) {
        restoreRule = rule;
        if (rule.block === undefined || rule.block === null) {
          rule.block = newDesign;
        }
        $scope.codeEditor = rule.source;
        Blockly.setWorkspace({ block: rule.block });
        $scope.isDirty = false;
      }, function (reason) {
        growl.warning(locale.getString('habmin.ruleErrorLoadingRule', [
          rule.name,
          reason
        ]));
      });
    };
    $scope.newRule = function () {
      $scope.codeEditor = '';
      Blockly.setWorkspace({ block: newDesign });
      $scope.isDirty = false;
      $scope.selectedRule = null;
    };
    $scope.saveRule = function () {
      var rule = {};
      if (Blockly.getWorkspace() != null) {
        rule.block = Blockly.getWorkspace().block[0];
      } else {
        rule.block = newDesign;
      }
      if ($scope.selectedRule !== null) {
        rule.id = $scope.selectedRule.id;
      }
      rule.name = '';
      if (rule.block.type === 'openhab_rule') {
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
        $scope.codeEditor = '';
        $scope.selectedRule = null;
        restoreRule = null;
        $scope.isDirty = false;
      });
    };
    $scope.showSource = function () {
      if ($scope.editSource === false) {
      }
      $scope.editSource = true;
    };
    $scope.showRule = function () {
      $scope.editSource = false;
    };
  }
]).directive('resizePage', [
  '$window',
  function ($window) {
    return function ($scope, element) {
      var w = angular.element($window);
      $scope.getWindowDimensions = function () {
        return { 'h': w.height() };
      };
      $scope.$watch($scope.getWindowDimensions, function (newValue, oldValue) {
        $scope.windowHeight = newValue.h;
        $scope.styleRuleList = function () {
          return { 'height': newValue.h - 150 + 'px' };
        };
        $scope.styleEditor = function () {
          return { 'height': newValue.h - 117 + 'px' };
        };
      }, true);
      w.bind('resize', function () {
        $scope.$apply();
      });
    };
  }
]);
;