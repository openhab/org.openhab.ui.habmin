define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/topic",
        "dojo/_base/fx",
        "dojo/dom",
        "dojo/dom-construct",
        "dojo/dom-attr",
        "dojo/dom-class",
        "dojo/dom-geometry",
        "dojo/on",
        "dojo/query",

        "dojox/layout/FloatingPane",
        "dijit/form/Button",
        "dijit/Toolbar",
        "dijit/form/TextBox",

        "dojo/dnd/move",
        "dojo/_base/array",

        "dijit/layout/ContentPane",

        "dgrid/Grid",
        "dgrid/Selection",
        "dgrid/Keyboard"

    ],
    function (declare, lang, topic, fx, dom, domConstruct, domAttr, domClass, domGeometry, on, query, FloatingPane, Button, Toolbar, TextBox, move, array, ContentPane, Grid, Selection, Keyboard) {
        return declare([FloatingPane], {
            title: "Dashboard Editing Menu",
            resizable: false,
            dockable: false,
            closable: false,
            baseClass: "habminDashboardToolbar",

            postCreate: function () {
                this.inherited(arguments);

                var toolDefinition = [
                    {
                        label: "New",
                        menuRef: "new",
                        iconClass: "habminIconNew",
                        select: yNew
                    },
                    {
                        label: "Delete",
                        menuRef: "delete",
                        iconClass: "habminIconDelete",
                        select: deleteButton
                    },
                    {
                        label: "Edit",
                        menuRef: "edit",
                        iconClass: "habminIconEdit",
                        select: yNew
                    },
                    {
                        label: "Save",
                        menuRef: "save",
                        iconClass: "habminIconSave",
                        select: yNew
                    },
                    {
                        label: "Close",
                        menuRef: "close",
                        iconClass: "habminIconClose",
                        select: closeButton
                    }
                ];
                this.toolbar = new Toolbar({style: "border: 1px;"});
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

                var cp = new ContentPane({content: this.toolbar});
                domClass.add(cp.domNode, "habminChildNoPadding");

                this.set("content", cp);

                this.moveable = new move.parentConstrainedMoveable(
                    this.domNode, {
                        handle: this.focusNode,
                        within: true
                    });

                function deleteButton() {
                    var grid = new (declare([Grid, Selection, Keyboard]))({
                        getBeforePut: false,
                        columns: {label: 'Email', field: 'email'},
                        selectionMode: "none"
                    });

                    var cp = new ContentPane({content: this.toolbar});
                    domClass.add(cp.domNode, "habminChildNoPadding");
                    cp.domNode.appendChild(grid.domNode);
                    cp.startup();
                    this.set("content", cp);

                    // Calculate size and resize content
                    var ct = domGeometry.getContentBox(grid.domNode);
                    this.tb = domGeometry.getContentBox(this.toolbar.domNode);
                    this.resize({h: 21 + this.tb.h + ct.h, w: Math.max(this.tb.w, ct.w)});

                }

                function yNew() {
                    var filterBox = new TextBox({
                        name: "filter",
                        intermediateChanges: true,
                        placeHolder: "Filter items",
                        style: "width:100%"
                    });

                    var cp = new ContentPane({content: this.toolbar});
                    domClass.add(cp.domNode, "habminChildNoPadding");
                    cp.domNode.appendChild(filterBox.domNode);
                    cp.startup();
                    this.set("content", cp);

                    // Calculate size and resize content
                    var ct = domGeometry.getContentBox(filterBox.domNode);
                    this.tb = domGeometry.getContentBox(this.toolbar.domNode);
                    this.resize({h: 21 + this.tb.h + ct.h, w: Math.max(this.tb.w, ct.w)});
                }

                // Close the toolbar and remove the editing functionality
                function closeButton() {
                    this.destroyRecursive();
                }
            }
        })
    });
