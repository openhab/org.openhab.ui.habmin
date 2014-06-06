define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/topic",
        "dojo/_base/fx",
        "dojo/dom",
        "dojo/dom-construct",
        "dojo/dom-attr",
        "dojo/dom-class",

        "dojox/layout/FloatingPane",
        "dijit/form/Button",
        "dijit/Toolbar",

        "dojo/dnd/move",
        "dojo/_base/array",

        "dijit/layout/ContentPane"
    ],
    function (declare, lang, topic, fx, dom, domConstruct, domAttr, domClass, FloatingPane, Button, Toolbar, move, array, ContentPane) {
        return declare(FloatingPane, {
            title: "Dashboard Menu",
            resizable: false,
            dockable: false,
            closable: false,

            postCreate: function () {
                this.inherited(arguments);


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
                    },
                    {
                        label: "Edit",
                        menuRef: "edit",
                        iconClass: "habminIconEdit"//,
//                        select: yNew
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
//                    on(button, "click", lang.hitch(this, def.select));

                    this.toolbar.addChild(button);
                }));


                this.addChild(this.toolbar);

                this.moveable = new move.parentConstrainedMoveable(
                    this.domNode, {
                        handle: this.focusNode,
                        constraints: function () {
                            var coordsBody = dojo.coords(dojo.body());
                            // or
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

                (this.domNode, "habminFloatingMenu");
            }
        })
    });
