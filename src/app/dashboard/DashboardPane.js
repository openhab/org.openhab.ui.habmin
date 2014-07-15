define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dijit/layout/ContentPane",
        "dijit/_TemplatedMixin",
        "dojo/dnd/Moveable",
        "dojox/layout/ResizeHandle",
        "dojo/request",
        "dojo/_base/array",
        "dojo/dom-construct",
        "dojo/dom-class",
        "dojo/dom-geometry",
        "dojo/dom-style",
        "dojo/topic",
        "dojo/on"
    ],
    function (declare, lang, ContentPane, TemplatedMixin, Moveable, ResizeHandle, request, array, domConstruct, domClass, domGeometry, domStyle, topic, on) {
        return declare([ ContentPane], { //, TemplatedMixin ], {
            // contentClass: String
            //		The className to give to the inner node which has the content
            contentClass: "dojoxFloatingPaneContent",

            dashboardContainer: null,
            resizeCallback: null,
            moveCallback: null,

            class: "habminDashboardPane",

            gridT: 0,
            gridL: 0,
            gridW: 0,
            gridH: 0,

            postCreate: function () {
//                this.node = this.domNode;
                this.inherited(arguments);
            },
            startup: function () {
                if (this._started)
                    return;

                this.inherited(arguments);

                this._started = true;
            },
            editEnable: function (enable) {
                if (enable == true) {
                    var me = this;

                    this.moveable = new Moveable(this.domNode, {
                        handle: this.domNode
                    });

                    this.moveable.onMove = function (/*Mover*/ mover, /*Object*/ leftTop) {
                        console.log("Dashboard pane MOVE ", mover, leftTop);
                        if (me.moveCallback != null) {
                            leftTop = me.moveCallback(me, leftTop.l, leftTop.t);
                        }

                        var c = this.constraintBox;
                        var s = mover.node.style;
                        this.onMoving(mover, leftTop);
                        leftTop.l = leftTop.l < c.l ? c.l : c.r < leftTop.l ? c.r : leftTop.l;
                        leftTop.t = leftTop.t < c.t ? c.t : c.b < leftTop.t ? c.b : leftTop.t;

                        s.left = leftTop.l + "px";
                        s.top = leftTop.t + "px";
                        this.onMoved(mover, leftTop);
                    };
                    this.moveable.onFirstMove = function (/*Mover*/ mover) {
                        // summary:
                        //		called during the very first move notification;
                        //		can be used to initialize coordinates, can be overwritten.
                        var n = me.domNode.parentNode;
                        var s = domStyle.getComputedStyle(n);
                        var c = this.constraintBox = domGeometry.getMarginBox(n, s);

                        c.r = c.l + c.w;
                        c.b = c.t + c.h;
                        var mb = domGeometry.getMarginSize(mover.node);
                        c.r -= mb.w;
                        c.b -= mb.h;
                    };

                    this.resizeHandle = domConstruct.place("<div class='habminDashboardPaneResizeHandle'></div>", this.domNode, "last");

                    this._resizeHandle = new ResizeHandle({
                        targetId: this.id,
                        resizeAxis: "xy",
                        minHeight: 20,
                        minWidth: 20,
                        intermediateChanges: true
                    }, this.resizeHandle);

                    this._resizeHandle._checkConstraints = function (newW, newH) {
                        var pos = domGeometry.getMarginBox(me.domNode);
                        if (me.resizeCallback != null) {
                            return me.resizeCallback(me, pos.l, pos.t, newW, newH);
                        }

                        return { w: newW, h: newH }; // Object
                    };

                    this._resizeHandle._updateSizing = function (/*Event*/ e) {
                        // summary:
                        //		called when moving the ResizeHandle ... determines
                        //		new size based on settings/position and sets styles.
                        console.log("Dashboard pane UPDATE SIZING ", e);

                        if (this.activeResize) {
                            this._changeSizing(e);
                        } else {
                            console.log("Resize - getting new coordinates");
                            var tmp = this._getNewCoords(e, 'border', this._resizeHelper.startPosition);
                            if (tmp === false) {
                                return;
                            }
                            this._resizeHelper.resize(tmp);
                        }
                        e.preventDefault();
                    };
                }
                else {
                    if (this._resizeHandle) {
                        this._resizeHandle.destroy();
                        this._resizeHandle = null;
                    }
                    if (this.moveable) {
                        this.moveable.destroy();
                        this.moveable = null;
                    }
                }
            },

            destroy: function () {
                if (this._resizeHandle) {
                    this._resizeHandle.destroy();
                }
                this.inherited(arguments);
            },

            resize: function () {
                this.inherited(arguments);
                this.getChildren().forEach(function (child) {
                    if (child.resize != undefined)
                        child.resize();
                });
            }
        });
    });