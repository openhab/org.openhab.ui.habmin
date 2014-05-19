/**
 * This file is the application's main JavaScript file. It is listed as a dependency in run.js and will automatically
 * load when run.js loads.
 *
 * Because this file has the special filename `main.js`, and because we've registered the `app` package in run.js,
 * whatever object this module returns can be loaded by other files simply by requiring `app` (instead of `app/main`).
 *
 * Our first dependency is to the `dojo/has` module, which allows us to conditionally execute code based on
 * configuration settings or environmental information. Unlike a normal conditional, these branches can be compiled
 * away by the build system; see `staticHasFeatures` in app.profile.js for more information.
 *
 * Our second dependency is to the special module `require`; this allows us to make additional require calls using
 * module IDs relative to this module within the body of the define callback.
 *
 * In all cases, whatever function is passed to define() is only invoked once, and the returned value is cached.
 *
 * More information about everything described about the loader throughout this file can be found at
 * <http://dojotoolkit.org/reference-guide/loader/amd.html>.
 */
define([ 'dojo/has', 'require' ], function (has, require) {
    var app = {};

    /**
     * This main.js file conditionally executes different code depending upon the host environment it is loaded in.
     * This is an increasingly common pattern when dealing with applications that run in different environments that
     * require different functionality (i.e. client/server or desktop/tablet/phone).
     */
    if (has('host-browser')) {
        /*
         * This require call's first dependency, `./Dialog`, uses a relative module identifier; you should use this
         * type of notation for dependencies *within* a package in order to ensure the package is fully portable. It
         * works like a path, where `./` refers to the current directory and `../` refers to the parent directory. If
         * you are referring to a module in a *different* package (like `dojo` or `dijit`), you should *not* use a
         * relative module identifier.
         *
         * The second dependency is a plugin dependency; in this case, it is a dependency on the special functionality
         * of the `dojo/domReady` plugin, which simply waits until the DOM is ready before resolving.
         * The `!` after the module name indicates you want to use special plugin functionality; if you were to
         * require just `dojo/domReady`, it would load that module just like any other module, without the special
         * plugin functionality.
         */

        require([
                "app/main/onlineStatus",
                "dojox/widget/FisheyeList",
                "dojox/widget/FisheyeListItem",
                "app/main/login",
                "dijit/Tooltip",
                "dojo/dom",
                "dojo/dom-attr",
                "dojo/dom-construct",
                "dojo/_base/fx",
                "dijit/layout/BorderContainer",
                "dijit/layout/ContentPane",
                "dojo/text!app/main/HeaderTemplate.html",
                "dojo/domReady!"
            ],
            function (Status, FisheyeList, FisheyeListItem, Login, Tooltip, dom, domAttr, domConstruct, fx, BorderContainer, ContentPane, headerTemplate) {
                var currentPane = null;

                var bc = new BorderContainer({
                    gutters: false,
                    style: "height: 100%; width: 100%;"
                });

                // Create a ContentPane as the top pane in the BorderContainer
                var cp1 = new ContentPane({
                    region: "top",
                    style: "width: 100%;",
                    class: "habminHeaderbar",
                    content: headerTemplate
                });
                bc.addChild(cp1);

                // Create a ContentPane as the center pane in the BorderContainer
                var cp2 = new ContentPane({
                    region: "center",
                    id: "content",
                    class: "page"
                });
                bc.addChild(cp2);

                // put the top level widget into the document, and then call startup()
                bc.placeAt(document.body);
                bc.startup();

                var menu = new FisheyeList({
                    itemWidth: 64,
                    itemHeight: 64,
                    itemMaxWidth: 128,
                    itemMaxHeight: 128,
                    orientation: "horizontal",
                    effectUnits: 0.75,
                    itemPadding: 15,
                    attachEdge: "top",
//                    conservativeTrigger: true,
                    labelEdge: "bottom"
                }, "mainMenu");
//                menu.placeAt("mainMenu");


          //      menu.addChild(xxx);
                var xxx = new FisheyeListItem({id: "menuCharting",
                    onClick: function () {
                    },
                    label: "Item 2",
                    iconSrc: "app/images/bar_chart.png"
                });
//                xxx.parent = menu.domNode;
//                xxx.postCreate();
//                xxx.startup();
                menu.addChild(xxx);
                menu.addChild(new FisheyeListItem({id: "item3",
                    onClick: function () {
                        require(["app/bindings/zwave/ZWaveDevices"], function (ZWave) {
                            var x = new ZWave({region: "center", lass: "content", style: "opacity: 100; width: 50%; height:100%;"});
                            x.placeAt("content");
                            x.startup();
                            transition(currentPane, x);
                        });
                    },
                    label: "Configuration",
                    iconSrc: "app/images/tools_preferences.png"
                }));
                menu.addChild(new FisheyeListItem({
                    id: "menuCalendar",
                    onClick: function () {
                        require(["app/calendar/main"], function (Calendar) {
                            var x = new Calendar({region: "center", class: "content", style: "opacity: 0; width: 100%; height:100%;"});
                            x.placeAt("content");
                            x.startup();
                            transition(currentPane, x);
                        });
                    },
                    label: "Event Calendar",
                    iconSrc: "app/images/appointment.png"
                }));
                menu.addChild(new FisheyeListItem({id: "item1",
                    onClick: function () {
                    },
                    label: "Item 1",
                    iconSrc: "app/images/businessman.png"
                }));
                menu.startup();
//                menu.show();

//                menu.placeAt("mainMenu");
//                cp1.addChild(menu);
                cp1.resize();



                //               var loginDialog = new Login();
//                loginDialog.placeAt(document.body);
                //              loginDialog.startup();
                //    loginDialog.show();

//                new Status({}, "onlineStatus");



                bc.resize();

                new Tooltip({
                    connectId: ["userStatus"],
                    label: "Login Status"
                });

                // Hide and then remove the splash-screen.
                fx.fadeOut({
                        node: "splashscreen",
                        duration: 300,
                        onEnd: function () {
                            domConstruct.destroy("splashscreen");
                        } }
                ).play();
//                menu.resize();
                bc.resize();

                /*                require(["app/config/gridTest"], function (dev) {
                 var z = new dev(null);
                 z.show();
                 });*/


                function transition(fromOld, toNew) {
                    if (fromOld != null) {
                        fx.fadeOut({
                                node: fromOld.domNode,
                                duration: 500,
                                onEnd: function () {
                                    console.log("Destroying " + this.node.id);
                                    domConstruct.destroy(this.node);
                                } }
                        ).play();
                    }
                    if (toNew != null) {
                        fx.fadeIn({
                                node: toNew.domNode,
                                duration: 500,
                                onEnd: function () {
                                    console.log("Switched to " + this.node.id);
                                }
                            }
                        ).play();
                    }
                    currentPane = toNew;
                }

            });

    }
});