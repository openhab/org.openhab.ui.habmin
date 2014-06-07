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
        "dojo/on",
        "dojo/dom-geometry",
        "dojo/text!app/dashboard/DashboardPane.html"
    ],
    function (declare, lang, ContentPane, TemplatedMixin, Moveable, ResizeHandle, request, array, domConstruct, domClass, domGeometry, domStyle, topic, on, domGeometry, template) {
        return declare([ ContentPane, TemplatedMixin ], {
            // contentClass: String
            //		The className to give to the inner node which has the content
            contentClass: "dojoxFloatingPaneContent",

            templateString: template,

            dashboardContainer: null,
            resizeCallback: null,

            postCreate: function () {
                var me = this;

                this.node = this.domNode;
                this.inherited(arguments);
                this.moveable = new Moveable(this.domNode, {
                    handle: this.headerNode
                });

                this.moveable.onMove = function (/*Mover*/ mover, /*Object*/ leftTop) {
                    console.log("My override");
                    if (me.resizeCallback != null) {
                        leftTop = me.moveCallback(this, leftTop.l, leftTop.t);
                    }

//                    return;
                    // summary:
                    //		called during every move notification;
                    //		should actually move the node; can be overwritten.
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

                this._resizeHandle = new ResizeHandle({
                    targetId: this.id,
                    resizeAxis: "xy",
                    minHeight: 20,
                    minWidth: 20,
//                    activeResize: true,
                    intermediateChanges: true,
                    onResize: this.resize

                }, this.resizeHandle);

                this._resizeHandle._checkConstraints = function (newW, newH) {
                    if (me.resizeCallback != null) {
                        return me.resizeCallback(this, newW, newH);
                    }

                    return { w: newW, h: newH }; // Object
                };

                this._resizeHandle._updateSizing = function (/*Event*/ e) {
                    // summary:
                    //		called when moving the ResizeHandle ... determines
                    //		new size based on settings/position and sets styles.
                    console.log("dddddsds ", this);

                    if (this.activeResize) {
                        this._changeSizing(e);
                    } else {
                        var tmp = this._getNewCoords(e, 'border', this._resizeHelper.startPosition);
                        if (tmp === false) {
                            return;
                        }
                        this._resizeHelper.resize(tmp);
                    }
                    e.preventDefault();
                };
            },

            resize: function (/* Object */dim) {
                console.log("Resize ", dim);
                // summary:
                //		Size the Pane and place accordingly
                dim = dim || this._naturalState;
                this._currentState = dim;

                // From the ResizeHandle we only get width and height information
                var dns = this.domNode.style;
                if ("t" in dim) {
                    dns.top = dim.t + "px";
                }
                else if ("y" in dim) {
                    dns.top = dim.y + "px";
                }
                if ("l" in dim) {
                    dns.left = dim.l + "px";
                }
                else if ("x" in dim) {
                    dns.left = dim.x + "px";
                }
                dns.width = dim.w + "px";
                dns.height = dim.h + "px";

                // Now resize canvas
//                var mbCanvas = { l: 0, t: 0, w: dim.w, h: (dim.h - this.domNode.offsetHeight) };
                var mbCanvas = { w: dim.w, h: (dim.h - this.domNode.offsetHeight) };
                domGeometry.setMarginBox(this.domNode, mbCanvas);

                // If the single child can resize, forward resize event to it so it can
                // fit itself properly into the content area
                //         this._checkIfSingleChild();
                //               if(this._singleChild && this._singleChild.resize){
                //                 this._singleChild.resize(mbCanvas);
                //           }

            },
            _snapToGrid: function (xVal, gridPattern) {
                var xMod = xVal % gridPattern;
                if (xMod == 0) //no transform
                    return(xVal);
                if (xMod < gridPattern / 2) //snap no number below
                    return(xVal - xMod);
                return(xVal + (gridPattern - xMod));
            },
            destroy: function () {
                // summary:
                //		Destroy this FloatingPane completely
                this._allFPs.splice(arrayUtil.indexOf(this._allFPs, this), 1);
                if (this._resizeHandle) {
                    this._resizeHandle.destroy();
                }
                this.inherited(arguments);
            }
        })
    });