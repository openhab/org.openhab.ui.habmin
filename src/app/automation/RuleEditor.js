define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/on",
        "dojo/_base/array",
        "dojo/dom-class",
        "dojo/dom-style",
        "dojo/dom-construct",
        "dojo/dom-geometry",
        "dojo/query",
        "dijit/layout/TabContainer",
        "dijit/Toolbar",
        "dijit/form/Button",
        "dojo/request",
        "dojo/json",
        "dojox/string/sprintf",

        "app/automation/CodeEditor",
        "app/automation/BlockEditor",

        "app/main/Notification",

        "dojo/i18n!dijit/nls/common",
        "dojo/i18n!app/nls/Automation"
    ],
    function (declare, lang, on, array, domClass, domStyle, domConstruct, domGeometry, query, TabContainer, Toolbar, Button, request, json, sprintf, CodeEditor, BlockEditor, Notification, langCommon, langAutomation) {
        return declare(TabContainer, {
            initialized: false,
            chartLegend: true,
            tooltips: true,
            newruleBlocks: {
                block: [
                    {
                        type: 'openhab_rule',
                        deletable: false,
                        movable: false,
                        fields: [
                            {name: "NAME", value: "New Rule"}//language.rule_DesignerNewRule}
                        ]
                    }
                ]},
            newruleCode: '// Imports\n\n\n// Rule\nrule "New Rule"\nwhen\n\nthen\n\nend\n',

            postCreate: function () {
                domClass.add(this.domNode, "habminChildNoPadding");

                // Add the block editor to the tab
                this.blockEditor = new BlockEditor({
                    title: "Rule",
                    iconClass: "habminButtonIcon habminIconBlock",
                    style: "width:100%;height:100%;overflow:hidden;",
                    blockly: {
                        toolbox: true,
                        collapse: true,
                        listeners: {
                            workspacechanged: lang.hitch(this, function () {
                                console.log("Block editor updated");
                                // Enable the toolbar
                                this.toolbar.getChildren()[0].set("disabled", false);
                                this.toolbar.getChildren()[1].set("disabled", false);
                            })
                        },
                        trashcan: true
                    }
                });
                domClass.add(this.blockEditor.domNode, "habminChildNoPadding");
                this.addChild(this.blockEditor);

                // Add the code editor to the tab
                this.codeEditor = new CodeEditor({
                    title: "Source",
                    style: "height: 100%; width: 100%;",
                    iconClass: "habminButtonIcon habminIconEdit"
                });
                domClass.add(this.codeEditor.domNode, "habminChildNoPadding");
                this.addChild(this.codeEditor);

                // Create the toolbar. This will be placed into the tab container so it's
                // available to all editors.
                var toolDefinition = [
                    {
                        label: langCommon.buttonCancel,
                        menuRef: "cancel",
                        iconClass: "habminIconCancel",
                        select: menuCancel
                    },
                    {
                        label: langCommon.buttonSave,
                        menuRef: "save",
                        iconClass: "habminIconSave",
                        select: menuSave
                    }
                ];
                this.toolbar = new Toolbar({region: "top"});
                array.forEach(toolDefinition, lang.hitch(this, function (def) {
                    var button = new Button({
                        label: def.label,
                        showLabel: true,
                        disabled: true,
                        iconClass: "habminButtonIcon " + def.iconClass
                    });
                    on(button, "click", lang.hitch(this, def.select));

                    this.toolbar.addChild(button);
                }));
                domClass.add(this.toolbar.domNode, "habminToolbarTab");

                // Add the toolbar into the tab container
                var tabStripNode = query("div.dijitTabListWrapper", this.tablist.domNode)[0];
                domConstruct.place(this.toolbar.domNode, tabStripNode, "first");

                function menuCancel() {

                }

                function menuSave() {
                    var rule = this.blockEditor.getBlocks();

                    if (rule == null || rule.block == null || rule.block.length == 0) {
                        this.notification.alert(this.notification.ERROR, langAutomation.ErrorReadingRule);
                        return;
                    }

                    // Get the rule name
                    if (rule.block[0].fields == null || rule.block[0].fields.length == 0) {
                        this.notification.alert(this.notification.ERROR, langAutomation.ErrorReadingRuleName);
                        return;
                    }

                    var ruleName;
                    for (var v = 0; v < rule.block[0].fields.length; v++) {
                        if (rule.block[0].fields[v].name == "NAME") {
                            ruleName = rule.block[0].fields[v].value;
                            break;
                        }
                    }

                    // Check that we have a name!
                    if (ruleName == null || ruleName == "") {
                        this.notification.alert(this.notification.ERROR, langAutomation.ErrorReadingRuleName);
                        return;
                    }

                    var bean = {};
                    if (this.ruleId != null)
                        bean.id = this.ruleId;
                    bean.block = rule.block[0];
                    bean.name = ruleName;

                    var jsonData = json.stringify(bean);

                    request("/services/habmin/config/designer/" + + (this.ruleId == null ? "" : this.ruleId), {
                        method: this.ruleId == null ? 'POST' : 'PUT',
                        timeout: 5000,
                        data: jsonData,
                        handleAs: 'json',
                        preventCache: true,
                        headers: {
                            "Content-Type": 'application/json; charset=utf-8',
                            "Accept": "application/json"
                        }
                    }).then(
                        lang.hitch(this, function (data) {
                            this.notification.alert(this.notification.SUCCESS,
                                sprintf(langAutomation.RuleSavedOk, ruleName));

                            console.log("The rule source response is: ", data);
                            this.blockEditor.setBlocks(data);
                            this.codeEditor.setCode(data.source);

                            // Enable the toolbar
                            this.toolbar.getChildren()[0].set("disabled", true);
                            this.toolbar.getChildren()[1].set("disabled", true);
                        }),
                        lang.hitch(this, function (error) {
                            this.notification.alert(this.notification.ERROR,
                                sprintf(langAutomation.ErrorSavingRule, ruleName));
                            console.log("An error occurred with rule source response: " + error);
                        })
                    );

                }
            },
            alignTabs: function () {
                var tabListNode = this.tablist.domNode;
                var tabStripNode = query("div.nowrapTabStrip", tabListNode)[0];

                var tabListCoords = domGeometry.position(tabListNode);
                var tabStripCoords = domGeometry.position(tabStripNode);

                // Calculate the sizes of all tabs and subtract this off the size of the toolbar
                var tabList = query("div.dijitTab", tabListNode);
                var tabWidth = 5;
                array.forEach(tabList, lang.hitch(this, function (tab) {
                    var coords = domGeometry.position(tab);
                    tabWidth += coords.w;
                }));
                domStyle.set(this.toolbar.domNode, "width", (tabListCoords.w - tabWidth) + "px");

                var tabStripLeft = (-tabStripCoords.w + tabListCoords.w) + "px";
                console.log("Align Editor Tabs ", tabStripLeft);

                domStyle.set(tabStripNode, "left", (tabListCoords.w - tabWidth) + "px");
                domStyle.set(tabStripNode, "width", tabWidth + "px");
                domStyle.set(tabStripNode, "textAlign", "right");
            },
            startup: function () {
                if (this.initialized == true)
                    return;

                // Initialise the notification system
                this.notification = Notification();

                this.inherited(arguments);
                this.resize();
                this.alignTabs();

                this.initialized = true;
            },
            resize: function (size) {
                this.inherited(arguments);
                this.alignTabs();
            },
            newRule: function () {
                this.blockEditor.setBlocks(this.newruleBlocks);
                this.codeEditor.setCode(this.newruleCode);
            },
            loadRule: function (ruleId) {
                this.ruleId = ruleId;
                request("/services/habmin/config/designer/" + ruleId, {
                    timeout: 5000,
                    handleAs: 'json',
                    preventCache: true,
                    headers: {
                        "Content-Type": 'application/json; charset=utf-8',
                        "Accept": "application/json"
                    }
                }).then(
                    lang.hitch(this, function (data) {
                        console.log("The rule source response is: ", data);
                        this.blockEditor.setBlocks(data);
                        this.codeEditor.setCode(data.source);
                    }),
                    lang.hitch(this, function (error) {
                        console.log("An error occurred with rule source response: " + error);

                    })
                );
            }
        })
    });
