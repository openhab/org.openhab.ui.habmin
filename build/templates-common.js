angular.module('templates-common', ['ngCron.tpl.html']);

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
