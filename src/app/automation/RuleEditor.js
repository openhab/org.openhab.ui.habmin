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

        "app/automation/CodeEditor",
        "app/automation/BlockEditor",

        "dojo/i18n!dijit/nls/common"
    ],
    function (declare, lang, on, array, domClass, domStyle, domConstruct, domGeometry, query, TabContainer, Toolbar, Button, request, CodeEditor, BlockEditor, langCommon) {
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
            newruleCode:'// Imports\n\n\n// Rule\nrule "New Rule"\nwhen\n\nthen\n\nend\n',

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
                            workspacechanged: function() {
                                console.log("Workspace changed :)");
                            }
                        },
                        toolboxCategories: [
                            {name: "Procedures", title: "Procedures", tooltip: "Hello there"},
                            {name: "Math", title: "Math", icon: "sum.png", tooltip: "Hello there math"}
                        ],
                        toolboxTools: [
                            {category: "Procedures", block: {type: "controls_if"}, name: "X"},
                            {category: "Procedures", block: {type: 'variables_get'}},
                            {category: "Procedures", block: {type: 'logic_operation'}},

                            {category: "Procedures", block: {type: "controls_if", mutation: {name: "elseif", value: 2}}, name: "X"},
                            {category: "Procedures", block: {type: "text"}, name: "X"}/*,
                             {category: "Math", block: "<xml><block type='controls_if'><mutation elseif='1'></mutation></block></xml>", name: "X"},
                             {category: "Procedures", block: "<xml><block type='controls_if'></block></xml>", name: "X"},
                             {category: "Math", block: "<xml><block type='controls_if'></block></xml>", name: "X"},
                             {category: "Procedures", block: "<xml><block type='math_arithmetic'></block></xml>", name: "X"},
                             {category: "Math", block: "<xml><block type='controls_repeat_ext'></block></xml>", name: "X"},
                             {category: "Math", block: "<xml><block type='variables_set'></block></xml>", name: "X"}*/
                        ],
                        trashcan: true,
                        blocks: {"block": [
                            {"type": "controls_if", "id": "6", "children": [
                                {"type": "value", "name": "IF0", "block": {"type": "logic_operation", "id": "9", "mutation": [
                                    {"name": "operators", "value": 2}
                                ], "fields": [
                                    {"name": "OP1", "value": "AND"},
                                    {"name": "OP2", "value": "AND"},
                                    {"name": "OP3", "value": "AND"}
                                ], "inline": true}}
                            ], "inline": false, "movable": false, "x": 0, "y": 0}
                        ]},
                        path: "dblockly/"
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
                // available to all editor.
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
//                        disabled: true,
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
                    var blocks = this.blockEditor.getBlocks();

                    request("/services/habmin/config/designer/" + this.ruleId, {
                        method: this.ruleId == null ? 'POST' : 'PUT',
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
            },
            alignTabs: function () {
                var tabListNode = this.tablist.domNode;
                var tabStripNode = query("div.nowrapTabStrip", tabListNode)[0];

                var tabListCoords = domGeometry.position(tabListNode);
                var tabStripCoords = domGeometry.position(tabStripNode);

                var tabStripLeft = (-tabStripCoords.w + tabListCoords.w) + "px";
                console.log("Align Editor Tabs ", tabStripLeft);

                domStyle.set(tabStripNode, "width", tabListCoords.w + "px");
                domStyle.set(tabStripNode, "textAlign", "right");

                // Calculate the sizes of all tabs and subtract this off the size of the toolbar
                var tabList = query("div.dijitTab", tabListNode);
                var tabWidth = 5;
                array.forEach(tabList, lang.hitch(this, function (tab) {
                    var coords = domGeometry.position(tab);
                    tabWidth += coords.w;
                }));
                domStyle.set(this.toolbar.domNode, "width", (tabListCoords.w - tabWidth) + "px");
            },
            startup: function () {
                if (this.initialized == true)
                    return;

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
            loadRule: function(ruleId) {
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
