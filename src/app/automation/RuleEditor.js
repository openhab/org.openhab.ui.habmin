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

        "app/automation/Codemirror",
        "app/automation/BlockEditor"
    ],
    function (declare, lang, on, array, domClass, domStyle, domConstruct, domGeometry, query, Container, TabContainer, Toolbar, Button, request, CodeEditor, BlockEditor) {
        return declare(Container, {
            chartLegend: true,
            tooltips: true,

            gutters: false,
            postCreate: function () {
                domClass.add(this.domNode, "habminChildNoPadding");

                // Create the tab container
                this.tabContainer = new TabContainer({
                    style: "height: 100%; width: 100%;",
                    region: 'center'
                });
                domClass.add(this.tabContainer.domNode, "habminChildNoPadding");

                // Add the block editor to the tab
                this.blockPane = new BlockEditor({
                    title: "Rule",
                    iconClass: "habminButtonIcon habminIconBlock"
                });
                domClass.add(this.blockPane.domNode, "habminChildNoPadding");
                this.tabContainer.addChild(this.blockPane);

                // Add the code editor to the tab
                this.editorPane = new CodeEditor({
                    title: "Source",
                    iconClass: "habminButtonIcon habminIconEdit"
                });
                domClass.add(this.editorPane.domNode, "habminChildNoPadding");
                this.tabContainer.addChild(this.editorPane);

                // Now add the tab container
                this.addChild(this.tabContainer);

                on(this.tabContainer, "resize", lang.hitch(this, this.alignTabs));

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

                var tabStripNode = query("div.dijitTabListWrapper", this.tabContainer.tablist.domNode)[0];

                domConstruct.place(this.toolbar.domNode, tabStripNode, "before");

            },
            alignTabs: function() {
                var tabListNode = this.tabContainer.tablist.domNode;
                var tabStripNode = query("div.nowrapTabStrip", tabListNode)[0];

                var tabListCoords = domGeometry.position(tabListNode);
                var tabStripCoords = domGeometry.position(tabStripNode);

                var tabStripLeft = (-tabStripCoords.w + tabListCoords.w) + "px";
                console.log("Align Editor Tabs ", tabStripLeft);

                domStyle.set(tabStripNode, "textAlign", "right");
                domStyle.set(tabStripNode, "left", tabStripLeft);
            },
            startup: function () {
                this.inherited(arguments);
//                this.tabContainer.startup();
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

            }
        })
    });


