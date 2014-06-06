define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/topic",
        "dojo/_base/fx",
        "dojo/dom",
        "dojo/dom-construct",
        "dojo/dom-attr",
        "dojo/dom-class",
        "dojo/on",

        "dojox/layout/FloatingPane",
        "dijit/form/Button",
        "dijit/Toolbar",
        "dijit/form/TextBox",

        "dojo/dnd/move",
        "dojo/_base/array",

        "dijit/layout/ContentPane",
        "dojo/text!app/dashboard/DashboardToolbar.html"

    ],
    function (declare, lang, topic, fx, dom, domConstruct, domAttr, domClass, on, FloatingPane, Button, Toolbar, TextBox, move, array, ContentPane, template) {
        return declare([FloatingPane], {
            title: "Dashboard Editing Menu",
            resizable: false,
            dockable: false,
            closable: false,

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
                        select: yNew
                    },
                    {
                        label: "Edit",
                        menuRef: "edit",
                        iconClass: "habminIconEdit",
                        select: yNew
                    }
                ];
                this.toolbar = new Toolbar({region: "top", style: "border: 1px;"});
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
                this.set("content", cp);

                this.moveable = new move.parentConstrainedMoveable(
                    this.domNode, {
                        handle: this.focusNode,
                        constraints: function () {
                            var coordsWindow = {
                                l: 0,
                                t: 0,
                                w: window.innerWidth,
                                h: window.innerHeight
                            };

                            return coordsWindow;
                        },
                        within: true
                    });

                function yNew() {
                    var filterBox = new TextBox({
                        name: "filter",
                        intermediateChanges: true,
                        placeHolder: "Filter items",
                        style: "width:100%"
                    });

                    var cp = new ContentPane({content: this.toolbar});
                    cp.domNode.appendChild(filterBox.domNode);
                    this.set("content", cp);

                    // Calculate size and resize content
                    this.resize({h:110, w:200});
                }
            }
        })
    });
