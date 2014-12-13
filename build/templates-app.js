angular.module('templates-app', ['automation/rule.tpl.html', 'automation/scheduler.tpl.html', 'binding/zwave.tpl.html', 'dashboard/chart.tpl.html', 'dashboard/chartSave.tpl.html', 'dashboard/chartSaveAxis.tpl.html', 'dashboard/chartSaveGeneral.tpl.html', 'dashboard/chartSaveItem.tpl.html', 'dashboard/dashboard.tpl.html', 'home/home.tpl.html', 'sitemap/sitemap.tpl.html', 'user/userChart.tpl.html', 'user/userGeneral.tpl.html']);

angular.module("automation/rule.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("automation/rule.tpl.html",
    "<div class=\"col-sm-4\">\n" +
    "    <div class=\"panel panel-default\">\n" +
    "        <!-- Header -->\n" +
    "        <div class=\"panel-heading\">\n" +
    "            <button type=\"button\" class=\"btn btn-default\"\n" +
    "                    ng-confirm-click=\"newRule()\" ng-confirm-if=\"isDirty\"\n" +
    "                    data-i18n-attr=\"{'ngConfirmMessage': 'habmin.ruleUnsavedChangesCheck','ngConfirmTitle': 'habmin.ruleUnsavedChangesTitle','ngConfirmNoBtn': 'common.no', 'ngConfirmYesBtn': 'common.yes'}\"\n" +
    "                    rulename={{selectedRule.name}}\">\n" +
    "                <span class=\"fa fa-plus\"></span>\n" +
    "                <span i18n=\"common.new\"></span>\n" +
    "            </button>\n" +
    "            <button type=\"button\" ng-confirm-click=\"deleteRule()\"\n" +
    "                    ng-class=\"{'btn btn-default':true, 'disabled':!selectedRule}\"\n" +
    "                    data-i18n-attr=\"{'ngConfirmMessage': 'habmin.ruleDeleteRuleCheck','ngConfirmTitle': 'habmin.ruleDeleteRuleTitle','ngConfirmNoBtn': 'common.no', 'ngConfirmYesBtn': 'common.yes'}\"\n" +
    "                    rulename={{selectedRule.name}}\">\n" +
    "                <span class=\"fa fa-trash-o\"></span>\n" +
    "                <span i18n=\"common.delete\"></span>\n" +
    "            </button>\n" +
    "        </div>\n" +
    "\n" +
    "        <!-- Body -->\n" +
    "        <div class=\"list-group\" ng-style=\"styleRuleList()\" ng-if=\"!selectCharts\" resize-page>\n" +
    "            <div ng-repeat=\"choice in rules\">\n" +
    "                <a role=\"presentation\" ng-class=\"{'list-group-item':true, 'active':choice.id==selectedRule.id}\"\n" +
    "                   ng-confirm-click=\"selectRule(choice)\" ng-confirm-if=\"$parent.isDirty\"\n" +
    "                   data-i18n-attr=\"{'ngConfirmMessage': 'habmin.ruleUnsavedChangesCheck','ngConfirmTitle': 'habmin.ruleUnsavedChangesTitle','ngConfirmNoBtn': 'common.no', 'ngConfirmYesBtn': 'common.yes'}\"\n" +
    "                   rulename={{selectedRule.name}}\">\n" +
    "                    <span>{{choice.name}}</span>\n" +
    "                </a>\n" +
    "            </div>\n" +
    "\n" +
    "            <!-- Cover options for loading, and no rules -->\n" +
    "            <div ng-if=\"rulesTotal==-1\" class=\"list-group-item text-center\">\n" +
    "                <span class=\"fa fa-spin fa-refresh\"></span>\n" +
    "                <span i18n=\"common.loading\"></span>\n" +
    "            </div>\n" +
    "            <div ng-if=\"rulesTotal==0\" class=\"list-group-item text-center\">\n" +
    "                <span class=\"fa fa-exclamation-triangle\"></span>\n" +
    "                <span i18n=\"habmin.ruleNoRules\"></span>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"panel-footer panel-footer-small\">\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"col-sm-8\">\n" +
    "    <div class=\"panel panel-default\" ng-style=\"styleEditor()\" resize-page>\n" +
    "        <div class=\"panel-heading\" style=\"padding:3px;\">\n" +
    "            <button type=\"button\" ng-class=\"{'btn btn-sm btn-default':true, 'disabled':!isDirty}\" ng-click=\"saveRule()\">\n" +
    "                <span class=\"fa fa-floppy-o\"></span>\n" +
    "                <span i18n=\"common.save\"></span>\n" +
    "            </button>\n" +
    "            <button type=\"button\" ng-class=\"{'btn btn-sm btn-default':true, 'disabled':!isDirty}\"\n" +
    "                    ng-click=\"cancelRule()\">\n" +
    "                <span class=\"fa fa-times\"></span>\n" +
    "                <span i18n=\"common.cancel\"></span>\n" +
    "            </button>\n" +
    "\n" +
    "            <div class=\"pull-right\">\n" +
    "                <button ng-class=\"{'btn btn-sm btn-default':true, 'active':editSource==false}\" ng-click=\"showRule()\">\n" +
    "                    <span class=\"fa fa-puzzle-piece\"></span>\n" +
    "                    <span i18n=\"habmin.ruleRule\"></span>\n" +
    "                </button>\n" +
    "                <button ng-class=\"{'btn btn-sm btn-default':true, 'active':editSource==true}\" ng-click=\"showSource()\">\n" +
    "                    <span class=\"fa fa-code\"></span>\n" +
    "                    <span i18n=\"habmin.ruleSource\"></span>\n" +
    "                </button>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "        <ng-blockly ng-show=\"!editSource\">\n" +
    "        </ng-blockly>\n" +
    "\n" +
    "        <div ng-show=\"editSource\" ng-model=\"codeEditor\" ui-ace=\"{\n" +
    "              useWrapMode : true,\n" +
    "              showGutter: true,\n" +
    "              theme:'tomorrow_night_bright',\n" +
    "              mode: 'openhabrules',\n" +
    "              firstLineNumber: 5\n" +
    "             }\"\n" +
    "             ng-style=\"styleEditor()\">\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("automation/scheduler.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("automation/scheduler.tpl.html",
    "<div class=\"col-sm-4\">\n" +
    "    <div class=\"panel panel-default\">\n" +
    "        <!-- Header -->\n" +
    "        <div class=\"panel-heading\">\n" +
    "            <button type=\"button\" class=\"btn btn-default\">\n" +
    "                <span class=\"fa fa-folder-o\"></span>\n" +
    "                <span i18n=\"common.new\"></span>\n" +
    "            </button>\n" +
    "            <button type=\"button\" class=\"btn btn-default disabled\">\n" +
    "                <span class=\"fa fa-trash-o\"></span>\n" +
    "                <span i18n=\"common.delete\"></span>\n" +
    "            </button>\n" +
    "        </div>\n" +
    "\n" +
    "        <!-- Body -->\n" +
    "        <div class=\"list-group habmin-list\" ng-style=\"styleList()\" resize-page>\n" +
    "        </div>\n" +
    "\n" +
    "        <!-- Footer -->\n" +
    "\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"col-sm-8\">\n" +
    "    <div class=\"panel panel-default\">\n" +
    "        <div class=\"panel-heading\">\n" +
    "            <button type=\"button\" class=\"btn btn-default\" ng-click=\"stepDate('today')\">\n" +
    "                <span i18n1=\"common.new\">today</span>\n" +
    "            </button>\n" +
    "\n" +
    "            <div class=\"btn-group\">\n" +
    "                <button type=\"button\" class=\"btn btn-default\" ng-click=\"stepDate('prev')\">\n" +
    "                    <span class=\"fa fa-angle-left\"></span>\n" +
    "                </button>\n" +
    "                <button type=\"button\" class=\"btn btn-default\" ng-click=\"stepDate('next')\">\n" +
    "                    <span class=\"fa fa-angle-right\"></span>\n" +
    "                </button>\n" +
    "            </div>\n" +
    "\n" +
    "            <!--            <div style=\"width:100%\" class=\"h4 fillspace\" ng-bind-html=\"title\"></div> -->\n" +
    "\n" +
    "            <div class=\"pull-right btn-group\">\n" +
    "                <button type=\"button\" class=\"btn btn-default\">\n" +
    "                    <span class=\"fa fa-list\"></span>\n" +
    "                    <span i18n1=\"common.new\">List</span>\n" +
    "                </button>\n" +
    "                <button type=\"button\" class=\"btn btn-default\" ng-click=\"changeView('agendaDay')\">\n" +
    "                    <span class=\"fa fa-calendar-o\"></span>\n" +
    "                    <span i18n1=\"common.new\">Day</span>\n" +
    "                </button>\n" +
    "                <button type=\"button\" class=\"btn btn-default\" ng-click=\"changeView('agendaWeek')\">\n" +
    "                    <span class=\"fa fa-calendar-o\"></span>\n" +
    "                    <span i18n1=\"common.delete\">Week</span>\n" +
    "                </button>\n" +
    "                <!--            <button type=\"button\" class=\"btn btn-default\" ng-click=\"changeView('month')\">\n" +
    "                                    <span class=\"fa fa-calendar-o\"></span>\n" +
    "                                    <span i18n1=\"common.delete\">Month</span>\n" +
    "                                </button> -->\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div ui-calendar=\"uiConfig.calendar\" ng-model=\"eventSources\" calendar=\"calendar\" resize-page>\n" +
    "\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("binding/zwave.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("binding/zwave.tpl.html",
    "<!-- Device List -->\n" +
    "<div class=\"col-sm-4\">\n" +
    "    <div class=\"panel panel-default\">\n" +
    "        <!-- Header -->\n" +
    "        <div class=\"panel-heading\">\n" +
    "            <!-- Network tools dropdown -->\n" +
    "            <div class=\"btn-group dropdown\">\n" +
    "                <button type=\"button\" class=\"btn btn-default dropdown-toggle\" data-toggle=\"dropdown\">\n" +
    "                    <span class=\"fa fa-cog\"></span>\n" +
    "                    <span i18n=\"zwave.zwaveNetworkTools\"></span>\n" +
    "                    <span class=\"caret\"></span>\n" +
    "                    <span class=\"sr-only\">Dropdown</span>\n" +
    "                </button>\n" +
    "                <ul class=\"dropdown-menu\" role=\"menu\">\n" +
    "                    <li><a ng-click=\"zwaveAction('binding/network', 'Heal')\">\n" +
    "                        <span class=\"fa fa-fw fa-ambulance\"></span>\n" +
    "                        <span i18n=\"zwave.zwaveNetworkHeal\"></span>\n" +
    "                    </a></li>\n" +
    "                    <li role=\"presentation\" class=\"divider\"></li>\n" +
    "                    <li><a ng-click=\"zwaveAction('binding/network', 'Include')\">\n" +
    "                        <span class=\"fa fa-fw fa-sign-in\"></span>\n" +
    "                        <span i18n=\"zwave.zwaveNetworkInclude\"></span>\n" +
    "                    </a></li>\n" +
    "                    <li><a ng-click=\"zwaveAction('binding/network', 'Exclude')\">\n" +
    "                        <span class=\"fa fa-fw fa-sign-out\"></span>\n" +
    "                        <span i18n=\"zwave.zwaveNetworkExclude\"></span>\n" +
    "                    </a></li>\n" +
    "                    <li role=\"presentation\" class=\"divider\"></li>\n" +
    "                    <li><a ng-confirm-click=\"zwaveAction('binding/network', 'SoftReset')\"\n" +
    "                           data-i18n-attr=\"{'ngConfirmMessage': 'zwave.zwaveSoftResetConfirmMessage','ngConfirmTitle': 'zwave.zwaveSoftResetConfirmTitle','ngConfirmNoBtn': 'common.cancel', 'ngConfirmYesBtn': 'common.ok'}\"\n" +
    "                            >\n" +
    "                        <span class=\"fa fa-fw fa-power-off\"></span>\n" +
    "                        <span i18n=\"zwave.zwaveNetworkReset\"></span>\n" +
    "                    </a></li>\n" +
    "                    <li><a ng-click=\"networkReplicate()\">\n" +
    "                        <span class=\"fa fa-fw fa-copy fa-fw\"></span>\n" +
    "                        <span i18n=\"zwave.zwaveNetworkReplicate\"></span>\n" +
    "                    </a></li>\n" +
    "                </ul>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "        <!-- Body -->\n" +
    "        <div class=\"list-group habmin-list\" ng-style=\"styleList()\" resize-page1>\n" +
    "            <div ng-repeat=\"choice in devices\">\n" +
    "                <a role=\"presentation\" ng-class=\"{'list-group-item':true, 'active': choice.device==devEdit.device}\"\n" +
    "                   ng-click=\"selectDevice(choice)\">\n" +
    "                    <habmin-icon class=\"icon-lg\" icon=\"{{choice.icon}}\"></habmin-icon>\n" +
    "                    <span>{{choice.label}}</span>\n" +
    "                    <span class=\"pull-right\">\n" +
    "                        <span popover=\"{{stateHeal(choice)}}\" popover-trigger=\"mouseenter\" popover-placement=\"top\"\n" +
    "                              popover-append-to-body=\"true\" popover-popup-delay=\"500\">\n" +
    "                            <span ng-class=\"{'text-success': choice.healState=='RUN','text-danger': choice.healState =='ERROR','text-warning': choice.healState =='WAIT','text-muted': choice.healState =='OK'}\">\n" +
    "                                <span class=\"fa fa-ambulance\"></span>\n" +
    "                            </span>\n" +
    "                        </span>\n" +
    "                        <span popover=\"{{stateOnline(choice)}}\" popover-trigger=\"mouseenter\" popover-placement=\"top\"\n" +
    "                              popover-append-to-body=\"true\" popover-popup-delay=\"500\">\n" +
    "                            <span ng-class=\"{'text-success': choice.state=='OK','text-danger': choice.state=='ERROR','text-warning': choice.state =='WARNING','text-muted': choice.state =='INITIALIZING'}\">\n" +
    "                                <span class=\"fa fa-rss\"></span>\n" +
    "                            </span>\n" +
    "                        </span>\n" +
    "                    </span>\n" +
    "                    <br>\n" +
    "                    <span ng-class=\"{'small': true, 'text-warning': choice.typeUnknown}\">{{choice.type}}</span>\n" +
    "                    <span class=\"pull-right\">\n" +
    "                        <span popover=\"{{choice.powerInfo}}\" popover-trigger=\"mouseenter\" popover-placement=\"top\"\n" +
    "                              popover-append-to-body=\"true\" popover-popup-delay=\"500\">\n" +
    "                            <span ng-class=\"{'text-success': choice.batteryLevel>='40','text-danger': choice.batteryLevel=='0','text-warning': choice.batteryLevel =='20','text-muted': choice.batteryLevel =='-1'}\">\n" +
    "                                <span ng-class=\"choice.batteryIcon\"></span>\n" +
    "                            </span>\n" +
    "                        </span>\n" +
    "                    </span>\n" +
    "                </a>\n" +
    "            </div>\n" +
    "\n" +
    "            <!-- Cover options for loading, and no devices -->\n" +
    "            <div ng-if=\"deviceCnt==-1\" class=\"list-group-item text-center\">\n" +
    "                <span class=\"fa fa-spin fa-refresh\"></span>\n" +
    "                <span i18n=\"common.loading\"></span>\n" +
    "            </div>\n" +
    "            <div ng-if=\"deviceCnt==0\" class=\"list-group-item text-center\">\n" +
    "                <span class=\"fa fa-exclamation-triangle\"></span>\n" +
    "                <span i18n=\"zwave.zwaveNoDevices\"></span>\n" +
    "            </div>\n" +
    "\n" +
    "        </div>\n" +
    "\n" +
    "        <!-- Footer -->\n" +
    "        <div class=\"panel-footer panel-footer-small\">\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "<!-- Device Configuration -->\n" +
    "<div class=\"col-sm-8\">\n" +
    "    <div class=\"panel panel-default\">\n" +
    "        <!-- Header -->\n" +
    "        <div class=\"panel-heading\">\n" +
    "            <div class=\"btn-group dropdown\">\n" +
    "                <button type=\"button\" ng-class=\"{'disabled': !devEdit.label}\"\n" +
    "                        class=\"btn btn-default dropdown-toggle\"\n" +
    "                        data-toggle=\"dropdown\">\n" +
    "                    <span class=\"fa fa-cog\"></span>\n" +
    "                    <span i18n=\"zwave.zwaveDeviceTools\"></span>\n" +
    "                    <span class=\"caret\"></span>\n" +
    "                    <span class=\"sr-only\">Dropdown</span>\n" +
    "                </button>\n" +
    "                <ul class=\"dropdown-menu\" role=\"menu\">\n" +
    "                    <li>\n" +
    "                        <a ng-click=\"setView('CONFIG')\">\n" +
    "                            <span class=\"fa fa-fw fa-wrench\"></span>\n" +
    "                            <span i18n=\"zwave.zwaveDeviceConfiguration\"></span>\n" +
    "                        </a>\n" +
    "                    </li>\n" +
    "                    <li>\n" +
    "                        <a ng-click=\"setView('NETWORK')\">\n" +
    "                            <span class=\"fa fa-fw fa-sitemap\"></span>\n" +
    "                            <span i18n=\"zwave.zwaveDeviceNetworkDiagram\"></span>\n" +
    "                        </a>\n" +
    "                    </li>\n" +
    "                    <li role=\"presentation\" class=\"divider\"></li>\n" +
    "                    <li>\n" +
    "                        <a ng-click=\"zwaveAction('nodes/'+devEdit.device+'/', 'Heal')\">\n" +
    "                            <span class=\"fa fa-fw fa-ambulance\"></span>\n" +
    "                            <span i18n=\"zwave.zwaveDeviceHeal\"></span>\n" +
    "                        </a>\n" +
    "                    </li>\n" +
    "                    <li ng-class=\"{'disabled':devEdit.nodeStage!='FAILED'}\">\n" +
    "                        <a ng-confirm-click=\"zwaveAction('nodes/'+devEdit.device+'/', 'Delete')\"\n" +
    "                           data-i18n-attr=\"{'ngConfirmMessage': 'zwave.zwaveRemoveFailedText','ngConfirmTitle': 'zwave.zwaveRemoveFailedTitle','ngConfirmNoBtn': 'common.no', 'ngConfirmYesBtn': 'common.yes'}\"\n" +
    "                           nodenumber=\"{{devEdit.id}}\">\n" +
    "                            <span class=\"fa fa-fw fa-trash-o\"></span>\n" +
    "                            <span i18n=\"zwave.zwaveDeviceKill\"></span>\n" +
    "                        </a>\n" +
    "                    </li>\n" +
    "                    <li>\n" +
    "                        <a ng-click=\"zwaveAction('nodes/'+devEdit.device+'/parameters/', 'Refresh');zwaveAction('nodes/'+devEdit.device+'/associations/', 'Refresh')\">\n" +
    "                            <span class=\"fa fa-fw fa-refresh\"></span>\n" +
    "                            <span i18n=\"zwave.zwaveDeviceRefresh\"></span>\n" +
    "                        </a>\n" +
    "                    </li>\n" +
    "                </ul>\n" +
    "                <button ng-show=\"deviceDisplay=='CONFIG'\" type=\"button\" ng-click=\"deviceSave()\" ng-class=\"{'btn btn-default':true, 'disabled':!isDirty}\">\n" +
    "                    <span class=\"fa fa-floppy-o\"></span>\n" +
    "                    <span class=\"hidden-xs\" i18n=\"common.save\"></span>\n" +
    "                </button>\n" +
    "                <button ng-show=\"deviceDisplay=='CONFIG'\" type=\"button\" ng-click=\"deviceCancel()\" ng-class=\"{'btn btn-default':true, 'disabled':!isDirty}\">\n" +
    "                    <span class=\"fa fa-times\"></span>\n" +
    "                    <span class=\"hidden-xs\" i18n=\"common.cancel\"></span>\n" +
    "                </button>\n" +
    "            </div>\n" +
    "\n" +
    "            <div ng-hide=\"!devEdit.label\" class=\"btn-group pull-right\">\n" +
    "                <div class=\"text-right\">{{devEdit.label}}</div>\n" +
    "                <div class=\"text-right small\"><span>{{devEdit.label}}</span>&nbsp;<span class=\"hidden-xs\">{{devEdit.type}}</span></div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "        <!-- Body -->\n" +
    "        <div ng-show=\"deviceDisplay=='CONFIG'\" class=\"list-group habmin-list\" ng-style=\"styleList()\">\n" +
    "            <!-- CONFIGURATION -->\n" +
    "            <div ng-show=\"devEdit.configuration\">\n" +
    "                <a role=\"presentation\" class=\"list-group-item\" ng-click=\"showPanel('CONFIG')\">\n" +
    "                    <span class=\"fa fa-fw fa-wrench\"></span>\n" +
    "                    <span i18n=\"zwave.zwaveConfiguration\"></span>\n" +
    "                </a>\n" +
    "            </div>\n" +
    "            <div ng-show=\"devEdit.configuration\" collapse=\"panelDisplayed!='CONFIG'\">\n" +
    "                <binding-config template=\"{{devEdit.configuration}}\" binding-change=\"changeNotification\">\n" +
    "                </binding-config>\n" +
    "            </div>\n" +
    "\n" +
    "            <!-- ASSOCIATIONS -->\n" +
    "            <div ng-show=\"devEdit.associations\">\n" +
    "                <a role=\"presentation\" class=\"list-group-item\" ng-click=\"showPanel('ASSOC')\">\n" +
    "                    <span class=\"fa fa-fw fa-link\"></span>\n" +
    "                    <span i18n=\"zwave.zwaveAssociations\"></span>\n" +
    "                </a>\n" +
    "            </div>\n" +
    "            <div ng-show=\"devEdit.associations\" collapse=\"panelDisplayed!='ASSOC'\">\n" +
    "                <div ng-repeat=\"choice in devEdit.associations\">\n" +
    "                    {{choice.label}}\n" +
    "                    <binding-config template=\"{{choice.associations}}\">\n" +
    "                    </binding-config>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "\n" +
    "            <!-- WAKEUP -->\n" +
    "            <div ng-show=\"devEdit.wakeup\">\n" +
    "                <a role=\"presentation\" class=\"list-group-item\" ng-click=\"showPanel('WAKE')\">\n" +
    "                    <span class=\"fa fa-fw fa-moon-o\"></span>\n" +
    "                    <span i18n=\"zwave.zwaveWakeup\"></span>\n" +
    "                </a>\n" +
    "            </div>\n" +
    "            <div ng-show=\"devEdit.wakeup\" collapse=\"panelDisplayed!='WAKE'\">\n" +
    "                <binding-config template=\"{{devEdit.wakeup}}\">\n" +
    "                </binding-config>\n" +
    "            </div>\n" +
    "\n" +
    "            <!-- INFORMATION -->\n" +
    "            <div ng-show=\"devEdit.information\">\n" +
    "                <a role=\"presentation\" class=\"list-group-item\" ng-click=\"showPanel('INFO')\">\n" +
    "                    <span class=\"fa fa-fw fa-info\"></span>\n" +
    "                    <span i18n=\"zwave.zwaveInformation\"></span>\n" +
    "                </a>\n" +
    "            </div>\n" +
    "            <div ng-show=\"devEdit.information\" collapse=\"panelDisplayed!='INFO'\">\n" +
    "                <binding-config template=\"{{devEdit.information}}\" ng-model=\"formData\">\n" +
    "                </binding-config>\n" +
    "            </div>\n" +
    "\n" +
    "            <!-- TEST!!!!!!!!!!!!!!!!!!!! -->\n" +
    "            <div>\n" +
    "                <a role=\"presentation\" class=\"list-group-item\" ng-click=\"showPanel('TEST')\">\n" +
    "                    <span class=\"fa fa-fw fa-paw\"></span>\n" +
    "                    <span>TESTING AREA</span>\n" +
    "                </a>\n" +
    "            </div>\n" +
    "            <div collapse=\"panelDisplayed!='TEST'\">\n" +
    "\n" +
    "                <form class=\"panel-form form-horizontal\" role=\"form\">\n" +
    "\n" +
    "                    <div class=\"form-group\">\n" +
    "                        <label class=\"control-label\">\n" +
    "                            <span i18n=\"habmin.chartSaveAxesLabel\"></span>\n" +
    "                            <span class=\"label label-warning\">pending...</span>\n" +
    "                        </label>\n" +
    "                        <select selectpicker class=\"form-control\" multiple max-options=\"3\"\n" +
    "                                title=\"select...\"\n" +
    "                                >\n" +
    "                            <optgroup label=\"Node 1: Lounge\">\n" +
    "                                <option value=\"1\">BLAH 1</option>\n" +
    "                                <option value=\"2\">BLAH 2</option>\n" +
    "                            </optgroup>\n" +
    "                            <optgroup label=\"Node 2: Bedroom\">\n" +
    "                                <option value=\"1\">BLAH 1</option>\n" +
    "                                <option value=\"2\">BLAH 2</option>\n" +
    "                            </optgroup>\n" +
    "                        </select>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"form-group\">\n" +
    "                        <label class=\"control-label\">\n" +
    "                            <span i18n=\"habmin.chartSaveAxesLabel\"></span>\n" +
    "                        </label>\n" +
    "                        <span style=\"margin-top:9px;\" class=\"pull-right label label-warning\">update pending...</span>\n" +
    "\n" +
    "\n" +
    "                        <select selectpicker class=\"form-control\" multiple max-options=\"3\"\n" +
    "                                title=\"select...\"\n" +
    "                                >\n" +
    "                            <optgroup label=\"Node 1: Lounge\">\n" +
    "                                <option value=\"1\">BLAH 1</option>\n" +
    "                                <option value=\"2\">BLAH 2</option>\n" +
    "                            </optgroup>\n" +
    "                            <optgroup label=\"Node 2: Bedroom\">\n" +
    "                                <option value=\"1\">BLAH 1</option>\n" +
    "                                <option value=\"2\">BLAH 2</option>\n" +
    "                            </optgroup>\n" +
    "                        </select>\n" +
    "                    </div>\n" +
    "                </form>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div ng-show=\"deviceDisplay=='NETWORK'\" ng-style=\"styleList()\">\n" +
    "            <vis-network data=\"networkNodes\" options=\"networkOptions\" events=\"networkEvents\"></vis-network>\n" +
    "        </div>\n" +
    "\n" +
    "        <!-- Footer -->\n" +
    "        <div class=\"panel-footer panel-footer-small\">\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("dashboard/chart.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("dashboard/chart.tpl.html",
    "<!-- Chart and Item Lists -->\n" +
    "<div class=\"col-sm-4\">\n" +
    "    <div class=\"panel panel-default\">\n" +
    "        <!-- Header -->\n" +
    "        <div class=\"panel-heading\">\n" +
    "            <!-- Button to select items or chart mode -->\n" +
    "            <div class=\"btn-group dropdown\">\n" +
    "                <button type=\"button\" class=\"btn btn-default dropdown-toggle\" data-toggle=\"dropdown\">\n" +
    "                    <span i18n=\"habmin.chartChartList\" ng-show=\"selectCharts\"></span>\n" +
    "                    <span i18n=\"habmin.chartItemList\" ng-show=\"!selectCharts\"></span>\n" +
    "                    <span class=\"caret\"></span>\n" +
    "                    <span class=\"sr-only\">Dropdown</span>\n" +
    "                </button>\n" +
    "                <ul class=\"dropdown-menu\" role=\"menu\">\n" +
    "                    <li><a ng-click=\"setType(true)\">\n" +
    "                        <span class=\"fa fa-pie-chart\"></span>\n" +
    "                        <span i18n=\"habmin.chartChartList\"></span>\n" +
    "                            <span class=\"pull-right\">\n" +
    "                                <span ng-if=\"selectCharts\" class=\"fa fa-check-square-o\"></span>\n" +
    "                            </span>\n" +
    "                    </a></li>\n" +
    "                    <li><a ng-click=\"setType(false)\">\n" +
    "                        <span class=\"fa fa-list-alt\"></span>\n" +
    "                        <span i18n=\"habmin.chartItemList\"></span>\n" +
    "                            <span class=\"pull-right\">\n" +
    "                                <span ng-if=\"!selectCharts\" class=\"fa fa-check-square-o\"></span>\n" +
    "                            </span>\n" +
    "                    </a></li>\n" +
    "                </ul>\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"pull-right\">\n" +
    "                <div class=\"btn-group dropdown\">\n" +
    "                    <button type=\"button\" ng-if=\"!selectCharts\"\n" +
    "                            ng-class=\"{'btn btn-default': true, 'disabled': !itemsSelected}\">\n" +
    "                        <a ng-click=\"doChart()\">\n" +
    "                            <span class=\"fa fa-play\"></span>\n" +
    "                        </a>\n" +
    "                    </button>\n" +
    "                    <button type=\"button\" ng-if=\"!selectCharts\"\n" +
    "                            ng-class=\"{'btn btn-default': true, 'disabled': !itemsSelected}\">\n" +
    "                        <a ng-click=\"clearList()\">\n" +
    "                            <span class=\"fa fa-times\"></span>\n" +
    "                        </a>\n" +
    "                    </button>\n" +
    "\n" +
    "                    <!-- Tools menu -->\n" +
    "                    <button type=\"button\" class=\"btn btn-default dropdown-toggle\" data-toggle=\"dropdown\">\n" +
    "                        <span class=\"fa fa-cog\"></span>\n" +
    "                    </button>\n" +
    "                    <ul class=\"dropdown-menu\" role=\"menu\">\n" +
    "                        <li ng-repeat=\"choice in services\">\n" +
    "                            <a role=\"presentation\" ng-click=\"selectService(choice)\">\n" +
    "                                <span>{{choice.name}}</span>\n" +
    "                                <span ng-if=\"choice.selected\" class=\"pull-right fa fa-check-square-o\"></span>\n" +
    "                            </a>\n" +
    "                        </li>\n" +
    "                        <li role=\"presentation\" class=\"divider\"></li>\n" +
    "                        <li ng-if=\"!selectCharts\" ng-class=\"{'disabled': !itemsSelected}\">\n" +
    "                            <a ng-click=\"saveChart()\">\n" +
    "                                <span i18n=\"habmin.chartSaveChart\"></span>\n" +
    "                            </a>\n" +
    "                        </li>\n" +
    "                        <li ng-if=\"selectCharts\" ng-class=\"{'disabled': !selectedChart}\">\n" +
    "                            <a ng-click=\"editChart()\">\n" +
    "                                <span i18n=\"habmin.chartEditChart\"></span>\n" +
    "                            </a>\n" +
    "                        </li>\n" +
    "                        <li ng-if=\"selectCharts\" ng-class=\"{'disabled': !selectedChart}\">\n" +
    "                            <a ng-confirm-click=\"deleteChart()\"\n" +
    "                               data-i18n-attr=\"{'ngConfirmMessage': 'habmin.chartDeleteChartCheck','ngConfirmTitle': 'habmin.chartDeleteChart','ngConfirmNoBtn': 'common.no', 'ngConfirmYesBtn': 'common.yes'}\"\n" +
    "                               chartname=\"{{selectedChart.name}}\">\n" +
    "                                <span i18n=\"habmin.chartDeleteChart\"></span>\n" +
    "                            </a>\n" +
    "                        </li>\n" +
    "                    </ul>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "\n" +
    "            <!-- FILTER BOX -->\n" +
    "            <div id=\"custom-search-form\" class=\"input-group input-group-sm\" ng-if=\"!selectCharts\">\n" +
    "                <span class=\"input-group-addon\"><span class=\" fa fa-filter\"></span></span>\n" +
    "                <input type=\"text\" class=\"form-control\" placeholder={{filterDefaultString}} ng-model=\"filter.text\"\n" +
    "                       ng-model-options=\"{debounce: 1000}\">\n" +
    "                <span class=\"input-group-addon\"><span class=\"fa fa-minus-circle\"></span></span>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "        <!-- Display the list of items -->\n" +
    "        <div id=\"itemList\" class=\"list-group habmin-list\" ng-style=\"styleItemList()\" ng-if=\"!selectCharts\"\n" +
    "             resize-page>\n" +
    "            <div ng-if=\"itemsTotal>0\" ng-repeat=\"choice in items | filter:filterFunction\">\n" +
    "                <a role=\"presentation\" ng-hide=\"choice.filter\"\n" +
    "                   ng-class=\"{'list-group-item': true, 'active':choice.selected}\"\n" +
    "                   ng-click=\"selectItem(choice)\">\n" +
    "                    <habmin-icon class=\"icon-lg\" icon=\"{{choice.icon}}\"></habmin-icon>\n" +
    "                    <span>{{choice.label}}</span>\n" +
    "                    <span class=\"pull-right\">\n" +
    "                        <span ng-if=\"choice.selected\" class=\"fa fa-check-square-o\"></span>\n" +
    "                    </span>\n" +
    "                </a>\n" +
    "            </div>\n" +
    "\n" +
    "            <!-- Cover options for loading, and no items -->\n" +
    "            <div ng-if=\"itemsTotal==-1\" class=\"list-group-item text-center\">\n" +
    "                <span class=\"fa fa-spin fa-refresh\"></span>\n" +
    "                <span i18n=\"common.loading\"></span>\n" +
    "            </div>\n" +
    "            <div ng-if=\"itemsTotal==0\" class=\"list-group-item text-center\">\n" +
    "                <span class=\"fa fa-exclamation-triangle\"></span>\n" +
    "                <span i18n=\"habmin.chartNoItems\"></span>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "        <!-- Display the list of predefined charts -->\n" +
    "        <div id=\"chartList\" class=\"list-group habmin-list\" ng-style=\"styleChartList()\" ng-if=\"selectCharts\"\n" +
    "             resize-page>\n" +
    "            <div ng-if=\"chartsTotal>0\" ng-repeat=\"choice in charts\">\n" +
    "                <a role=\"presentation\" class=\"list-group-item\" ng-class=\"{'active':choice.selected=='yes'}\"\n" +
    "                   ng-click=\"selectChart(choice)\">\n" +
    "                    <habmin-icon class=\"icon-lg\" icon=\"{{choice.icon}}\"></habmin-icon>\n" +
    "                    <span>{{choice.name}}</span>\n" +
    "                    <span class=\"pull-right\">\n" +
    "                        <span ng-class=\"{'fa': true, 'fa-check-square-o': choice.selected=='yes', 'fa-spinner fa-spin': choice.selected=='loading'}\"></span>\n" +
    "                    </span>\n" +
    "                </a>\n" +
    "            </div>\n" +
    "\n" +
    "            <!-- Cover options for loading, and no charts -->\n" +
    "            <div ng-if=\"chartsTotal==-1\" class=\"list-group-item text-center\">\n" +
    "                <span class=\"fa fa-spin fa-refresh\"></span>\n" +
    "                <span i18n=\"common.loading\"></span>\n" +
    "            </div>\n" +
    "            <div ng-if=\"chartsTotal==0\" class=\"list-group-item text-center\">\n" +
    "                <span class=\"fa fa-exclamation-triangle\"></span>\n" +
    "                <span i18n=\"habmin.chartNoCharts\"></span>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "        <!-- Add a footer to the panel -->\n" +
    "        <div class=\"panel-footer panel-footer-small\">\n" +
    "            <div class=\"row\" ng-if=\"!selectCharts\">\n" +
    "                <div class=\"col-xs-6\">\n" +
    "                    <h6 class=\"text-center\">\n" +
    "                        <span i18n=\"habmin.chartTotalItems\"></span>\n" +
    "                        <span class=\"label label-info\">{{itemsTotal}}</span>\n" +
    "                    </h6>\n" +
    "                </div>\n" +
    "                <div class=\"col-xs-6\">\n" +
    "                    <h6 class=\"text-center\">\n" +
    "                        <span i18n=\"habmin.chartSelectedItems\"></span>\n" +
    "                        <span class=\"label label-success\">{{itemsSelected}}</span>\n" +
    "                    </h6>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"col-sm-8\">\n" +
    "    <div class=\"panel panel-default\" ng-style=\"styleChartPanel()\" resize-page>\n" +
    "        <div class=\"panel-heading\" style=\"padding:3px;\" time-navigation>\n" +
    "            <div class=\"btn-group btn-group-sm\">\n" +
    "                <button type=\"button\" class=\"btn btn-default\" ng-disabled=\"!graphLoaded||calendarOpen\"\n" +
    "                        ng-click=\"stepWindow(-1)\">\n" +
    "                    <span class=\"fa fa-backward\"></span>\n" +
    "                </button>\n" +
    "                <button type=\"button\" class=\"btn btn-default\" ng-disabled=\"!graphLoaded||calendarOpen\"\n" +
    "                        ng-click=\"stepWindow(1)\">\n" +
    "                    <span class=\"fa fa-forward\"></span>\n" +
    "                </button>\n" +
    "                <button type=\"button\" class=\"btn btn-default\" ng-disabled=\"!graphLoaded||calendarOpen\"\n" +
    "                        ng-click=\"setNow()\">\n" +
    "                    <span class=\"fa fa-fast-forward\"></span>\n" +
    "                </button>\n" +
    "                <button type=\"button\" class=\"btn btn-default\" ng-disabled=\"!graphLoaded||calendarOpen\"\n" +
    "                        ng-click=\"zoomWindow(0.10)\">\n" +
    "                    <span class=\"fa fa-search-minus\"></span>\n" +
    "                </button>\n" +
    "                <button type=\"button\" class=\"btn btn-default\" ng-disabled=\"!graphLoaded||calendarOpen\"\n" +
    "                        ng-click=\"zoomWindow(-0.10)\">\n" +
    "                    <span class=\"fa fa-search-plus\"></span>\n" +
    "                </button>\n" +
    "            </div>\n" +
    "            <div ng-class=\"{'btn-group btn-group-sm dropdown': true, 'open': calendarOpen}\">\n" +
    "                <button type=\"button\" class=\"btn btn-default\" ng-disabled=\"!graphLoaded||calendarOpen\"\n" +
    "                        ng-class=\"{active:graphWindow=='day'}\" ng-click=\"setWindow('day')\">\n" +
    "                        <span class=\"calendar-stack\">\n" +
    "                            <span class=\"fa fa-calendar-o\"></span>\n" +
    "                            <span class=\"calendar-day\">1</span>\n" +
    "                        </span>\n" +
    "                    <span>Day</span>\n" +
    "                </button>\n" +
    "                <button type=\"button\" class=\"btn btn-default\" ng-disabled=\"!graphLoaded||calendarOpen\"\n" +
    "                        ng-class=\"{active:graphWindow=='week'}\" ng-click=\"setWindow('week')\">\n" +
    "                        <span class=\"calendar-stack\">\n" +
    "                            <span class=\"fa fa-calendar-o\"></span>\n" +
    "                            <span class=\"calendar-day\">7</span>\n" +
    "                        </span>\n" +
    "                    <span>Week</span>\n" +
    "                </button>\n" +
    "                <button type=\"button\" class=\"btn btn-default\" ng-disabled=\"!graphLoaded||calendarOpen\"\n" +
    "                        ng-class=\"{active:graphWindow=='month'}\" ng-click=\"setWindow('month')\">\n" +
    "                        <span class=\"calendar-stack\">\n" +
    "                            <span class=\"fa fa-calendar-o\"></span>\n" +
    "                            <span class=\"calendar-day\">30</span>\n" +
    "                        </span>\n" +
    "                    <span>Month</span>\n" +
    "                </button>\n" +
    "                <button type=\"button\" class=\"btn btn-default dropdown\" ng-disabled=\"!graphLoaded\"\n" +
    "                        ng-init=\"calendarOpen=false\" ng-click=\"calendarOpen=!calendarOpen\">\n" +
    "                    <span class=\"fa fa-clock-o\"></span>&nbsp;Custom\n" +
    "                </button>\n" +
    "                <div class=\"dropdown-menu dropdown_dialog\">\n" +
    "                    <table>\n" +
    "                        <tr>\n" +
    "                            <td align=\"center\" style=\"padding-right: 3px;\">\n" +
    "                                <span>Start Date</span>\n" +
    "                            </td>\n" +
    "                            <td align=\"center\" style=\"padding-left: 3px;\">\n" +
    "                                <span>End Date</span>\n" +
    "                            </td>\n" +
    "                        </tr>\n" +
    "                        <tr>\n" +
    "                            <td style=\"padding-right: 3px;\">\n" +
    "                                <datepicker ng-model=\"startTime\" max-date=\"stopTime\" max-mode=\"day\" show-weeks=\"true\"></datepicker>\n" +
    "                            </td>\n" +
    "                            <td style=\"padding-left: 3px;\">\n" +
    "                                <datepicker ng-model=\"stopTime\" min-date=\"startTime\" max-date=\"timeNow\" max-mode=\"day\" show-weeks=\"true\"></datepicker>\n" +
    "                            </td>\n" +
    "                        </tr>\n" +
    "                    </table>\n" +
    "                    <div class=\"modal-footer\">\n" +
    "                    <button class=\"btn btn-sm btn-primary\" ng-click=\"setDateRange();calendarOpen=false;\">OK</button>\n" +
    "                    <button class=\"btn btn-sm btn-warning\" ng-click=\"calendarOpen=false;\">Cancel</button>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"btn-group btn-group-sm dropdown\">\n" +
    "                <button type=\"button\" class=\"btn btn-default dropdown-toggle\" data-toggle=\"dropdown\"\n" +
    "                        ng-disabled=\"!graphLoaded||calendarOpen\">\n" +
    "                    <span class=\"fa fa-retweet\"></span>\n" +
    "                    <span>Auto Update</span>\n" +
    "                    <span class=\"caret\"></span>\n" +
    "                </button>\n" +
    "                <ul class=\"dropdown-menu\" role=\"menu\">\n" +
    "                    <li>\n" +
    "                        <a ng-click=\"setRefresh('0')\">\n" +
    "                            <span ng-class=\"{'fa fa-fw': true, 'fa fa-check-square-o':refreshPeriod=='0'}\"></span>\n" +
    "                            <span i18n=\"common.disabled\"></span>\n" +
    "                        </a>\n" +
    "                    </li>\n" +
    "                    <li role=\"presentation\" class=\"divider\"></li>\n" +
    "                    <li>\n" +
    "                        <a ng-click=\"setRefresh('1.m')\">\n" +
    "                            <span ng-class=\"{'fa fa-fw': true, 'fa fa-check-square-o':refreshPeriod=='1.m'}\"></span>\n" +
    "                            <span i18n=\"habmin.period1Minute\"></span>\n" +
    "                        </a>\n" +
    "                    </li>\n" +
    "                    <li>\n" +
    "                        <a ng-click=\"setRefresh('2.m')\">\n" +
    "                            <span ng-class=\"{'fa fa-fw': true, 'fa fa-check-square-o':refreshPeriod=='2.m'}\"></span>\n" +
    "                            <span i18n=\"habmin.period2Minutes\"></span>\n" +
    "                        </a>\n" +
    "                    </li>\n" +
    "                    <li>\n" +
    "                        <a ng-click=\"setRefresh('5.m')\">\n" +
    "                            <span ng-class=\"{'fa fa-fw': true, 'fa fa-check-square-o':refreshPeriod=='5.m'}\"></span>\n" +
    "                            <span i18n=\"habmin.period5Minutes\"></span>\n" +
    "                        </a>\n" +
    "                    </li>\n" +
    "                    <li>\n" +
    "                        <a ng-click=\"setRefresh('10.m')\">\n" +
    "                            <span ng-class=\"{'fa fa-fw': true, 'fa fa-check-square-o':refreshPeriod=='10.m'}\"></span>\n" +
    "                            <span i18n=\"habmin.period10Minutes\"></span>\n" +
    "                        </a>\n" +
    "                    </li>\n" +
    "                    <li>\n" +
    "                        <a ng-click=\"setRefresh('15.m')\">\n" +
    "                            <span ng-class=\"{'fa fa-fw': true, 'fa fa-check-square-o':refreshPeriod=='15.m'}\"></span>\n" +
    "                            <span i18n=\"habmin.period15Minutes\"></span>\n" +
    "                        </a>\n" +
    "                    </li>\n" +
    "                    <li>\n" +
    "                        <a ng-click=\"setRefresh('20.m')\">\n" +
    "                            <span ng-class=\"{'fa fa-fw': true, 'fa fa-check-square-o':refreshPeriod=='20.m'}\"></span>\n" +
    "                            <span i18n=\"habmin.period20Minutes\"></span>\n" +
    "                        </a>\n" +
    "                    </li>\n" +
    "                    <li>\n" +
    "                        <a ng-click=\"setRefresh('30.m')\">\n" +
    "                            <span ng-class=\"{'fa fa-fw': true, 'fa fa-check-square-o':refreshPeriod=='30.m'}\"></span>\n" +
    "                            <span i18n=\"habmin.period30Minutes\"></span>\n" +
    "                        </a>\n" +
    "                    </li>\n" +
    "                    <li>\n" +
    "                        <a ng-click=\"setRefresh('1.h')\">\n" +
    "                            <span ng-class=\"{'fa fa-fw': true, 'fa fa-check-square-o':refreshPeriod=='1.h'}\"></span>\n" +
    "                            <span i18n=\"habmin.period1Hour\"></span>\n" +
    "                        </a>\n" +
    "                    </li>\n" +
    "                </ul>\n" +
    "            </div>\n" +
    "\n" +
    "            <div ng-show=\"graphLoaded\" class=\"pull-right\">\n" +
    "                <h6>{{graphTimeline}}</h6>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"panel-body\" ng-style=\"styleChart()\" style=\"padding:3px;\">\n" +
    "            <vis-graph2d ng-show=\"graphLoaded\" data=\"graphData\" options=\"graphOptions\"\n" +
    "                         events=\"graphEvents\"></vis-graph2d>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("dashboard/chartSave.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("dashboard/chartSave.tpl.html",
    "<div class=\"modal-header\">\n" +
    "    <h3 class=\"modal-title\" i18n=\"habmin.chartSaveChartTitle\"></h3>\n" +
    "</div>\n" +
    "<div class=\"modal-body\">\n" +
    "    <div class=\"row\">\n" +
    "        <div class=\"col-xs-6\">\n" +
    "            <ul class=\"nav nav-pills nav-stacked\">\n" +
    "                <li ng-class=\"{'active':showTab==0}\">\n" +
    "                    <a ng-click=\"showTab=0\">\n" +
    "                        <span i18n=\"habmin.chartSaveGeneral\"></span>\n" +
    "                    </a>\n" +
    "                </li>\n" +
    "                <li ng-class=\"{'active':showTab==1}\"><a ng-click=\"showTab=1\">\n" +
    "                    <span i18n=\"habmin.chartSaveLeftAxis\"></span>\n" +
    "                </a>\n" +
    "                </li>\n" +
    "                <li ng-class=\"{'active':showTab==2}\">\n" +
    "                    <a ng-click=\"showTab=2\">\n" +
    "                        <span i18n=\"habmin.chartSaveRightAxis\"></span>\n" +
    "                    </a>\n" +
    "                </li>\n" +
    "                <li ng-class=\"{'active':showTab==choice.item}\" ng-repeat=\"choice in items\">\n" +
    "                    <a ng-click=\"$parent.showTab=choice.item\">\n" +
    "                        <span></span>\n" +
    "                        <span>{{choice.item}}</span>\n" +
    "                    </a>\n" +
    "                </li>\n" +
    "            </ul>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"col-xs-6\">\n" +
    "            <chart-save-general ng-show=\"showTab==0\" model=\"general\"></chart-save-general>\n" +
    "            <chart-save-axis ng-show=\"showTab==1\" model=\"leftaxis\"></chart-save-axis>\n" +
    "            <chart-save-axis ng-show=\"showTab==2\" model=\"rightaxis\"></chart-save-axis>\n" +
    "            <chart-save-item ng-repeat=\"choice in items\" model=\"choice\"\n" +
    "                             ng-show=\"showTab==choice.item\"></chart-save-item>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "<div class=\"modal-footer\">\n" +
    "    <button class=\"btn btn-primary\" ng-click=\"ok()\" i18n=\"common.save\"></button>\n" +
    "    <button class=\"btn btn-warning\" ng-click=\"cancel()\" i18n=\"common.cancel\"></button>\n" +
    "</div>\n" +
    "");
}]);

angular.module("dashboard/chartSaveAxis.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("dashboard/chartSaveAxis.tpl.html",
    "<form class=\"form-horizontal\" role=\"form\">\n" +
    "    <div class=\"form-group\">\n" +
    "        <label for=\"inputLabel\" class=\"control-label\" i18n=\"habmin.chartSaveAxesLabel\"></label>\n" +
    "        <div>\n" +
    "            <input type=\"text\" ng-model=\"model.label\" class=\"form-control\" id=\"inputLabel\" placeholder=\"Label\">\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "        <label for=\"inputDecimalPlaces\" class=\"control-label\" i18n=\"habmin.chartSaveAxesDecimals\"></label>\n" +
    "        <div>\n" +
    "            <input type=\"number\" class=\"form-control\" id=\"inputDecimalPlaces\" ng-model=\"model.format\" placeholder=\"format\">\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "        <label for=\"inputMinimum\" class=\"control-label\" i18n=\"habmin.chartSaveAxesMinimum\"></label>\n" +
    "        <div>\n" +
    "            <input type=\"number\" ng-model=\"model.minimum\" class=\"form-control\" id=\"inputMinimum\" placeholder=\"minimum\">\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "        <label for=\"inputMaximum\" class=\"control-label\" i18n=\"habmin.chartSaveAxesMaximum\"></label>\n" +
    "        <div>\n" +
    "            <input type=\"number\" ng-model=\"model.maximum\" class=\"form-control\" id=\"inputMaximum\" placeholder=\"maximum\">\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "        <label class=\"control-label\" i18n=\"habmin.chartSaveAxesTextColor\"></label>\n" +
    "        <div>\n" +
    "            <pick-a-color id=\"inputColor\" ng-model=\"model.textColor\"></pick-a-color>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "        <label class=\"control-label\" i18n=\"habmin.chartSaveAxesLineColor\"></label>\n" +
    "        <div>\n" +
    "            <pick-a-color id=\"inputLineColor\" ng-model=\"model.lineColor\"></pick-a-color>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "        <label class=\"control-label\" i18n=\"habmin.chartSaveAxesLineStyle\">Line Style</label>\n" +
    "        <div>\n" +
    "            <select-line-style id=\"inputLineStyle\" ng-model=\"model.lineStyle\"></select-line-style>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</form>\n" +
    "");
}]);

angular.module("dashboard/chartSaveGeneral.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("dashboard/chartSaveGeneral.tpl.html",
    "<form class=\"form-horizontal\" role=\"form\">\n" +
    "    <div class=\"form-group\">\n" +
    "        <label for=\"inputName\" class=\"control-label\" i18n=\"habmin.chartSaveName\"></label>\n" +
    "        <div>\n" +
    "            <input type=\"text\" ng-model=\"model.name\" class=\"form-control\" id=\"inputName\" placeholder=\"Name\">\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "        <label for=\"inputTitle\" class=\"control-label\" i18n=\"habmin.chartSaveTitle\"></label>\n" +
    "        <div>\n" +
    "            <input type=\"text\" ng-model=\"model.title\" class=\"form-control\" id=\"inputTitle\" placeholder=\"Title\">\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "        <label for=\"inputPeriod\" class=\"control-label\" i18n=\"habmin.chartSavePeriod\"></label>\n" +
    "        <div>\n" +
    "            <select selectpicker ng-model=\"model.period\" class=\"form-control\" id=\"inputPeriod\">\n" +
    "                <option value=\"3600\" i18n=\"habmin.period1Hour\"></option>\n" +
    "                <option value=\"7200\" i18n=\"habmin.period2Hours\"></option>\n" +
    "                <option value=\"10800\" i18n=\"habmin.period3Hours\"></option>\n" +
    "                <option value=\"14400\" i18n=\"habmin.period4Hours\"></option>\n" +
    "                <option value=\"21600\" i18n=\"habmin.period6Hours\"></option>\n" +
    "                <option value=\"32400\" i18n=\"habmin.period9Hours\"></option>\n" +
    "                <option value=\"43200\" i18n=\"habmin.period12Hours\"></option>\n" +
    "                <option value=\"86400\" i18n=\"habmin.period1Day\"></option>\n" +
    "                <option value=\"172800\" i18n=\"habmin.period2Days\"></option>\n" +
    "                <option value=\"259200\" i18n=\"habmin.period3Days\"></option>\n" +
    "                <option value=\"345600\" i18n=\"habmin.period4Days\"></option>\n" +
    "                <option value=\"432000\" i18n=\"habmin.period5Days\"></option>\n" +
    "                <option value=\"604800\" i18n=\"habmin.period1Week\"></option>\n" +
    "                <option value=\"1209600\" i18n=\"habmin.period2Weeks\"></option>\n" +
    "                <option value=\"1814400\" i18n=\"habmin.period3Weeks\"></option>\n" +
    "                <option value=\"2419200\" i18n=\"habmin.period1Month\"></option>\n" +
    "                <option value=\"5184000\" i18n=\"habmin.period2Months\"></option>\n" +
    "                <option value=\"7776000\" i18n=\"habmin.period3Months\"></option>\n" +
    "                <option value=\"10454400\" i18n=\"habmin.period4Months\"></option>\n" +
    "                <option value=\"15724800\" i18n=\"habmin.period6Months\"></option>\n" +
    "                <option value=\"23095800\" i18n=\"habmin.period9Months\"></option>\n" +
    "                <option value=\"31536000\" i18n=\"habmin.period1Year\"></option>\n" +
    "            </select>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</form>");
}]);

angular.module("dashboard/chartSaveItem.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("dashboard/chartSaveItem.tpl.html",
    "<form class=\"form-horizontal\" role=\"form\">\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "        <label for=\"inputLabel\" class=\"control-label\" i18n=\"habmin.chartSaveItemLabel\"></label>\n" +
    "        <div>\n" +
    "            <input type=\"text\" ng-model=\"model.label\" class=\"form-control\" id=\"inputLabel\" placeholder=\"Label\">\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "        <label for=\"inputDecimalPlaces\" class=\"control-label\" i18n=\"habmin.chartSaveItemDecimals\"></label>\n" +
    "        <div>\n" +
    "            <input type=\"number\" class=\"form-control\" id=\"inputDecimalPlaces\" ng-model=\"model.format\" placeholder=\"format\">\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "            <label for=\"inputAxis\" class=\"control-label\" i18n=\"habmin.chartSaveItemAxes\"></label>\n" +
    "        <div>\n" +
    "            <select ng-model=\"model.axis\" class=\"form-control\" id=\"inputAxis\">\n" +
    "                <option value=\"left\" i18n=\"habmin.chartItemLeftAxis\"></option>\n" +
    "                <option value=\"right\" i18n=\"habmin.chartItemRightAxis\"></option>\n" +
    "            </select>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "        <label class=\"control-label\" i18n=\"habmin.chartSaveItemLineColor\"></label>\n" +
    "        <div>\n" +
    "            <pick-a-color id=\"inputColor\" ng-model=\"model.lineColor\"></pick-a-color>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "        <label for=\"inputLineWidth\" class=\"control-label\" i18n=\"habmin.chartSaveItemLineWidth\"></label>\n" +
    "        <div>\n" +
    "            <input type=\"number\" class=\"form-control\" id=\"inputLineWidth\" ng-model=\"model.lineWidth\" placeholder=\"width\">\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "        <label class=\"control-label\" i18n=\"habmin.chartSaveItemLineStyle\"></label>\n" +
    "        <div>\n" +
    "            <select-line-style id=\"inputLineStyle\" ng-model=\"model.lineStyle\"></select-line-style>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "        <label for=\"inputFill\" class=\"control-label\" i18n=\"habmin.chartSaveItemFill\"></label>\n" +
    "        <div>\n" +
    "            <select ng-model=\"model.axis\" class=\"form-control\" id=\"inputFill\">\n" +
    "                <option value=\"none\" i18n=\"habmin.chartItemFillNone\"></option>\n" +
    "                <option value=\"top\" i18n=\"habmin.chartItemFillTop\"></option>\n" +
    "                <option value=\"bottom\" i18n=\"habmin.chartItemFillBottom\"></option>\n" +
    "            </select>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "        <label class=\"control-label\" i18n=\"habmin.chartSaveItemFillColor\"></label>\n" +
    "        <div>\n" +
    "            <pick-a-color id=\"fillColor\" ng-model=\"model.fillColor\"></pick-a-color>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "        <label for=\"inputPoints\" class=\"control-label\" i18n=\"habmin.chartSaveItemPointType\"></label>\n" +
    "        <div>\n" +
    "            <select ng-model=\"model.axis\" class=\"form-control\" id=\"inputPoints\">\n" +
    "                <option value=\"none\" i18n=\"habmin.chartItemPointsNone\"></option>\n" +
    "                <option value=\"circle\" i18n=\"habmin.chartItemPointsCircle\"></option>\n" +
    "                <option value=\"square\" i18n=\"habmin.chartItemPointsSquare\"></option>\n" +
    "            </select>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "        <label for=\"inputPointSize\" class=\"control-label\" i18n=\"habmin.chartSaveItemPointSize\"></label>\n" +
    "        <div>\n" +
    "            <input type=\"number\" class=\"form-control\" id=\"inputPointSize\" ng-model=\"model.pointsSize\" placeholder=\"size\">\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "        <label for=\"inputRepeatTime\" class=\"control-label\" i18n=\"habmin.chartSaveItemRepeatTime\"></label>\n" +
    "        <div>\n" +
    "            <input type=\"number\" class=\"form-control\" id=\"inputRepeatTime\" placeholder=\"repeat time\">\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</form>\n" +
    "");
}]);

angular.module("dashboard/dashboard.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("dashboard/dashboard.tpl.html",
    "<div ng-if=\"editMode\" class=\"page-header\">\n" +
    "    <a class=\"pull-right btn btn-primary\" ng-click=\"editEnd()\"><i class=\"glyphicon glyphicon-plus\"></i> End Edit</a>\n" +
    "    <a class=\"pull-right btn btn-primary\" ng-click=\"addWidget()\"><i class=\"glyphicon glyphicon-plus\"></i> Add Widget</a>\n" +
    "    <a class=\"pull-right btn btn-warning\" ng-click=\"clear()\"><i class=\"glyphicon glyphicon-trash\"></i> Clear</a>\n" +
    "</div>\n" +
    "<div gridster=\"gridsterOptions\">\n" +
    "    <ul>\n" +
    "        <li gridster-item=\"widget\" ng-repeat=\"widget in dashboard.widgets\">\n" +
    "            <div ng-class=\"{'box':true, 'box-edit':editMode}\" ng-controller=\"CustomWidgetCtrl\">\n" +
    "                <div ng-if=\"editMode\" class=\"box-header\">\n" +
    "                    <div class=\"box-header-btns pull-right\">\n" +
    "                        <a title=\"settings\" ng-click=\"openSettings(widget)\"><span class=\"fa fa-cog\"></span></a>\n" +
    "                        <a title=\"Remove widget\" ng-click=\"remove(widget)\"><span class=\"fa fa-trash\"></span></a>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"box-content\">\n" +
    "                    <div style=\"height:145px;\">\n" +
    "                    <ng-dial-gauge\n" +
    "                          ng-model=\"widget.value\" options=\"widget.options\">\n" +
    "                        </ng-dial-gauge>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </li>\n" +
    "    </ul>\n" +
    "</div>\n" +
    "");
}]);

angular.module("home/home.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("home/home.tpl.html",
    "<div class=\"jumbotron\">\n" +
    "    <h1 class=\"text-center\">HABmin</h1>\n" +
    "\n" +
    "    <p class=\"text-center lead\">\n" +
    "        A graphical user interface for the OpenHAB Home Automation System.\n" +
    "    </p>\n" +
    "\n" +
    "    <div class=\"text-center\">\n" +
    "        <div class=\"btn-group\">\n" +
    "            <a href=\"https://github.com/cdjackson/HABmin/wiki\" class=\"btn btn-large btn-default\">\n" +
    "                <i class=\"fa fa-book\"></i>\n" +
    "                Read the Docs\n" +
    "            </a>\n" +
    "            <a href=\"https://github.com/cdjackson/HABmin\" class=\"btn btn-large btn-success\">\n" +
    "                <i class=\"fa fa-download\"></i>\n" +
    "                Download\n" +
    "            </a>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"marketing\">\n" +
    "    <div class=\"row\">\n" +
    "        <div class=\"col-xs-12 col-sm-6 col-md-4\">\n" +
    "            <h4><i class=\"fa fa-thumbs-up\"></i> Good to Go!</h4>\n" +
    "\n" +
    "            <p>\n" +
    "                Responsive interface to meet all your openHAB needs.\n" +
    "            </p>\n" +
    "        </div>\n" +
    "        <div class=\"col-xs-12 col-sm-6 col-md-4\">\n" +
    "            <h4><i class=\"fa fa-area-chart\"></i> Charting</h4>\n" +
    "\n" +
    "            <p>\n" +
    "                Graphing of your openHAB persistence store.\n" +
    "            </p>\n" +
    "        </div>\n" +
    "        <div class=\"col-xs-12 col-sm-6 col-md-4\">\n" +
    "            <h4><i class=\"fa fa-puzzle-piece\"></i> Graphical Rule Editor</h4>\n" +
    "\n" +
    "            <p>\n" +
    "                Supports a structure that maintains separation of concerns while\n" +
    "                ensuring maximum code reuse.\n" +
    "            </p>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "");
}]);

angular.module("sitemap/sitemap.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("sitemap/sitemap.tpl.html",
    "<div><div dynamic-sitemap></div></div>\n" +
    "");
}]);

angular.module("user/userChart.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("user/userChart.tpl.html",
    "<div class=\"modal-header\">\n" +
    "    <h3 class=\"modal-title\" i18n=\"habmin.userChartPrefTitle\"></h3>\n" +
    "</div>\n" +
    "<div class=\"modal-body\">\n" +
    "    <form class=\"form-horizontal\" role=\"form\">\n" +
    "\n" +
    "        <div class=\"form-group\">\n" +
    "            <label for=\"inputDefaultPeriod\" class=\"col-sm-3 control-label\" i18n=\"habmin.userChartPeriod\"></label>\n" +
    "\n" +
    "            <div class=\"col-sm-9\">\n" +
    "                <select class=\"form-control\" id=\"inputDefaultPeriod\"\n" +
    "                        ng-model=\"selected\"\n" +
    "                        ng-option=\"c.value as c.label for c in periodOptions\"\n" +
    "                        selectpicker=\"xx\" toggle-dropdown live-search=\"false\">\n" +
    "                    <option value=\"-1\">hello</option>\n" +
    "                    <option value=\"3600\" i18n=\"habmin.period1Hour\"></option>\n" +
    "                    <option value=\"1\">hello 2</option>\n" +
    "                </select>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"form-group\">\n" +
    "            <label for=\"inputDefaultPeriod\" class=\"col-sm-3 control-label\" i18n=\"habmin.userChartLegend\"></label>\n" +
    "\n" +
    "            <div class=\"col-sm-9\">\n" +
    "                <input type=\"checkbox\">\n" +
    "            </div>\n" +
    "            {{test}}\n" +
    "            {{periodOptions}}\n" +
    "        </div>\n" +
    "    </form>\n" +
    "\n" +
    "</div>\n" +
    "<div class=\"modal-footer\">\n" +
    "    <button class=\"btn btn-primary\" ng-click=\"ok()\" i18n=\"common.save\"></button>\n" +
    "    <button class=\"btn btn-warning\" ng-click=\"cancel()\" i18n=\"common.cancel\"></button>\n" +
    "</div>\n" +
    "");
}]);

angular.module("user/userGeneral.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("user/userGeneral.tpl.html",
    "<div class=\"modal-header\">\n" +
    "    <h3 class=\"modal-title\" i18n=\"habmin.userGeneralPrefTitle\"></h3>\n" +
    "</div>\n" +
    "<div class=\"modal-body\">\n" +
    "    <form class=\"form-horizontal\" role=\"form\">\n" +
    "{{embedded}}\n" +
    "        <div ng-show=\"embedded\" class=\"form-group\">\n" +
    "            <label for=\"inputEmail2\" class=\"col-sm-3 control-label\">Name</label>\n" +
    "\n" +
    "            <div class=\"col-sm-9\">\n" +
    "                <input type=\"email\" class=\"form-control\" id=\"inputEmail2\" placeholder=\"Name\">\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"form-group\">\n" +
    "            <label for=\"inputEmail2\" class=\"col-sm-3 control-label\">Name</label>\n" +
    "\n" +
    "            <div class=\"col-sm-9\">\n" +
    "                <input type=\"email\" class=\"form-control\" id=\"inputEmail2\" placeholder=\"Name\">\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"form-group\">\n" +
    "            <label for=\"inputEmail3\" class=\"col-sm-3 control-label\">Email</label>\n" +
    "\n" +
    "            <div class=\"col-sm-9\">\n" +
    "                <input type=\"email\" class=\"form-control\" id=\"inputEmail3\" placeholder=\"Email\">\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"form-group\">\n" +
    "            <label for=\"inputPassword3\" class=\"col-sm-3 control-label\">Password</label>\n" +
    "\n" +
    "            <div class=\"col-sm-9\">\n" +
    "                <input type=\"password\" class=\"form-control\" id=\"inputPassword3\" placeholder=\"Password\">\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"form-group\">\n" +
    "            <label for=\"inputMobile\" class=\"col-sm-3 control-label\">Mobile</label>\n" +
    "\n" +
    "            <div class=\"col-sm-9\">\n" +
    "                <input type=\"password\" class=\"form-control\" id=\"inputMobile\" placeholder=\"Phone\">\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"form-group\">\n" +
    "            <div class=\"col-sm-offset-3 col-sm-10\">\n" +
    "                <div class=\"checkbox\">\n" +
    "                    <label>\n" +
    "                        <input type=\"checkbox\"> Remember me\n" +
    "                    </label>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </form>\n" +
    "\n" +
    "</div>\n" +
    "<div class=\"modal-footer\">\n" +
    "    <button class=\"btn btn-primary\" ng-click=\"ok()\" i18n=\"common.save\"></button>\n" +
    "    <button class=\"btn btn-warning\" ng-click=\"cancel()\" i18n=\"common.cancel\"></button>\n" +
    "</div>\n" +
    "");
}]);
