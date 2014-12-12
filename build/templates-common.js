angular.module('templates-common', ['multiselect/multiselect.tpl.html', 'multiselect/singleselect.tpl.html', 'ngCron.tpl.html']);

angular.module("multiselect/multiselect.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("multiselect/multiselect.tpl.html",
    "<div class=\"btn-group\">\n" +
    "    <button type=\"button\" class=\"btn btn-default dropdown-toggle\" ng-click=\"toggleSelect()\" ng-disabled=\"disabled\"\n" +
    "            ng-class=\"{'error': !valid()}\">\n" +
    "        {{header}} <span class=\"caret\"></span>\n" +
    "    </button>\n" +
    "    <ul class=\"dropdown-menu\">\n" +
    "        <li ng-show=\"search\">\n" +
    "            <input class=\"form-control input-sm\" type=\"text\" ng-model=\"searchText.label\" autofocus=\"autofocus\"\n" +
    "                   placeholder=\"Filter\"/>\n" +
    "        </li>\n" +
    "        <li ng-show=\"multiple\" role=\"presentation\" class=\"\">\n" +
    "            <button class=\"btn btn-link btn-xs\" ng-click=\"checkAll()\" type=\"button\">\n" +
    "                <span class=\"fa fa-fw fa-check-circle-o\"></span>\n" +
    "                <span>Check all</span>\n" +
    "            </button>\n" +
    "            <button class=\"btn btn-link btn-xs\" ng-click=\"uncheckAll()\" type=\"button\">\n" +
    "                <span class=\"fa fa-fw fa-times-circle-o\"></span>\n" +
    "                <span>Uncheck all</span>\n" +
    "            </button>\n" +
    "        </li>\n" +
    "        <li role=\"presentation\" class=\"divider\"></li>\n" +
    "        <li ng-repeat=\"i in items | filter:searchText\">\n" +
    "            <a ng-click=\"select(i); focus()\">\n" +
    "                <span ng-class=\"{'fa fa-fw fa-check-square-o': i.checked, 'fa fa-fw': !i.checked}\"></span>\n" +
    "                <span>{{i.label}}</span>\n" +
    "            </a>\n" +
    "        </li>\n" +
    "    </ul>\n" +
    "</div>\n" +
    "");
}]);

angular.module("multiselect/singleselect.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("multiselect/singleselect.tpl.html",
    "<div class=\"dropdown\">\n" +
    "  <button class=\"btn\" ng-click=\"toggleSelect()\" ng-disabled=\"disabled\" ng-class=\"{'error': !valid()}\">\n" +
    "    <span class=\"pull-left\">{{header}}</span>\n" +
    "    <span class=\"caret pull-right\"></span>\n" +
    "  </button>\n" +
    "  <ul class=\"dropdown-menu\">\n" +
    "    <li ng-repeat=\"i in items | filter:searchText\">\n" +
    "      <a ng-click=\"select(i); focus()\">\n" +
    "        <i ng-class=\"{'icon-ok': i.checked, 'icon-empty': !i.checked}\"></i>{{i.label}}</a>\n" +
    "    </li>\n" +
    "  </ul>\n" +
    "</div>");
}]);

angular.module("ngCron.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("ngCron.tpl.html",
    "<form class=\"form-horizontal\" role=\"form\">\n" +
    "    <div class=\"form-group\">\n" +
    "        <label for=\"inputStart\" class=\"control-label\" i18n1=\"habmin.chartSaveName\">Start</label>\n" +
    "\n" +
    "        <div>\n" +
    "            <input type=\"text\" ng-model=\"model.name\" class=\"form-control\" id=\"inputStart\" placeholder=\"Name\">\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "        <label for=\"inputRepeat\" class=\"control-label\" i18n1=\"habmin.chartSavePeriod\">Repeat</label>\n" +
    "\n" +
    "        <div>\n" +
    "            <select ng-model=\"model.period\" class=\"form-control\" id=\"inputRepeat\">\n" +
    "                <option value=\"0\" i18n1=\"habmin.never\">Never</option>\n" +
    "                <option value=\"0\" i18n1=\"habmin.period1Hour\">every Minute</option>\n" +
    "                <option value=\"0\" i18n1=\"habmin.period1Hour\">every Hour</option>\n" +
    "                <option value=\"0\" i18n1=\"habmin.period1Hour\">every Hour</option>\n" +
    "                <option value=\"0\" i18n1=\"habmin.period1Hour\">every Hour</option>\n" +
    "                <option value=\"0\" i18n1=\"habmin.period1Hour\">every Hour</option>\n" +
    "                <option value=\"0\" i18n1=\"habmin.period1Hour\">every Hour</option>\n" +
    "                <option value=\"0\" i18n1=\"habmin.period1Hour\">every Hour</option>\n" +
    "            </select>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</form>");
}]);
