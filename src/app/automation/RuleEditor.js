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
        "dijit/layout/BorderContainer",
        "dijit/layout/TabContainer",
        "dijit/Toolbar",
        "dijit/form/Button",
        "dojo/request",

        "app/automation/CodeEditor",
        "app/automation/BlockEditor"
    ],
    function (declare, lang, on, array, domClass, domStyle, domConstruct, domGeometry, query, Container, TabContainer, Toolbar, Button, request, CodeEditor, BlockEditor) {
        return declare(TabContainer, {
            initialized: false,
            chartLegend: true,
            tooltips: true,

            postCreate: function () {
                domClass.add(this.domNode, "habminChildNoPadding");

                // Add the block editor to the tab
                this.blockPane = new BlockEditor({
                    title: "Rule",
                    iconClass: "habminButtonIcon habminIconBlock",
                    style: "width:100%;height:100%",
                    blockly: {
                        toolbox: true,
                        collapse: true,
                        toolboxCategories: [
                            {name: "Procedures", title: "Procedures", tooltip: "Hello there"},
                            {name: "Math", title: "Math", icon: "sum.png", tooltip: "Hello there math"}
                        ],
                        toolboxTools: [
                            {category: "Procedures", block: {type: "controls_if"}, name: "X"},
                            {category: "Procedures", block: {type:'variables_get'}},
                            {category: "Procedures", block: {type:'logic_operation'}},

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
                        blocks: {"block":[{"type":"controls_if","id":"6","children":[{"type":"value","name":"IF0","block":{"type":"logic_operation","id":"9","mutation":[{"name":"operators","value":2}],"fields":[{"name":"OP1","value":"AND"},{"name":"OP2","value":"AND"},{"name":"OP3","value":"AND"}],"inline":true}}],"inline":false,"movable":false,"x":0,"y":0}]},
                        path: "dblockly/"
                    }
                });
                domClass.add(this.blockPane.domNode, "habminChildNoPadding");
//                this.tabContainer.addChild(this.blockPane);
                this.addChild(this.blockPane);

                // Add the code editor to the tab
                this.editorPane = new CodeEditor({
                    title: "Source",
                    style: "height: 100%; width: 100%;",
                    iconClass: "habminButtonIcon habminIconEdit"
                });
                domClass.add(this.editorPane.domNode, "habminChildNoPadding");
//                this.tabContainer.addChild(this.editorPane);
                this.addChild(this.editorPane);

                // Now add the tab container
//                this.addChild(this.tabContainer);

 //               on(this.tabContainer, "resize", lang.hitch(this, this.alignTabs));

                // Create the toolbar. This will be placed into the tab container so it's
                // available to all editor.
                var toolDefinition = [
                    {
                        label: "New",
                        menuRef: "new",
                        iconClass: "habminIconNew"//,
//                        select: menuNew
                    },
                    {
                        label: "Delete",
                        menuRef: "delete",
                        iconClass: "habminIconDelete"//,
//                        select: xNew
                    }
                ];
                this.toolbar = new Toolbar({region: "top"});
                array.forEach(toolDefinition, lang.hitch(this, function (def) {
                    var button = new Button({
                        // note: should always specify a label, for accessibility reasons.
                        // Just set showLabel=false if you don't want it to be displayed normally
                        label: def.label,
                        showLabel: true,
//                        disabled: true,
                        iconClass: "habminButtonIcon " + def.iconClass
                    });
                    on(button, "click", lang.hitch(this, def.select));

                    this.toolbar.addChild(button);
                }));
                domClass.add(this.toolbar.domNode, "habminToolbarTab");

//                var tabStripNode = query("div.dijitTabListWrapper", this.tabContainer.tablist.domNode)[0];
                var tabStripNode = query("div.dijitTabListWrapper", this.tablist.domNode)[0];

                domConstruct.place(this.toolbar.domNode, tabStripNode, "first");
            },
            alignTabs: function() {
                var tabListNode = this.tablist.domNode;
                var tabStripNode = query("div.nowrapTabStrip", tabListNode)[0];

                var tabListCoords = domGeometry.position(tabListNode);
                var tabStripCoords = domGeometry.position(tabStripNode);

                var tabStripLeft = (-tabStripCoords.w + tabListCoords.w) + "px";
                console.log("Align Editor Tabs ", tabStripLeft);

                domStyle.set(tabStripNode, "width", tabListCoords.w + "px");
                domStyle.set(tabStripNode, "textAlign", "right");

                var tabList = query("div.dijitTab", tabListNode);
                var tabWidth = 5;
                array.forEach(tabList, lang.hitch(this, function (tab) {
                    var coords = domGeometry.position(tab);
                    tabWidth += coords.w;
                }));

                domStyle.set(this.toolbar.domNode, "width", (tabListCoords.w - tabWidth) + "px");

    //            domStyle.set(this.toolbar.domNode, "width", tabListCoords.w - 400 + "px");
            },
            startup: function () {
                if(this.initialized == true)
                    return;

                this.inherited(arguments);
                this.resize();
                this.alignTabs();

                request("/services/habmin/config/rules/model/source/habmin-autorules", {
                    timeout: 5000,
                    handleAs: 'json',
                    preventCache: true,
                    headers: {
                        "Content-Type": 'application/json; charset=utf-8',
                        "Accept": "application/json"
                    }
                }).then(
                    lang.hitch(this, function (data) {
                        console.log("The (Rule Source) response is: ", data);
                        this.editorPane.setCode(data.source);
                    }),
                    lang.hitch(this, function (error) {
                        console.log("An error occurred with rule source response: " + error);
                    })
                );

                this.initialized = true;
            },
            resize: function(size) {
                this.inherited(arguments);
                this.alignTabs();
                this.blockPane.resize(size);
            }
        })
    });


