define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dijit/layout/ContentPane",
        "app/dashboard/DashboardPane",
        "app/dashboard/DashboardToolbar",
        "dojo/request",
        "dojo/_base/array",
        "dojo/dom-construct",
        "dojo/dom-class",
        "dojo/topic",
        "dojo/dom-geometry",
        "dojo/dom-style",

        "app/dashboard/HabminChart",
        "app/dashboard/CircularGauge"
    ],
    function (declare, lang, Container, DashboardPane, DashboardToolbar, request, array, domConstruct, domClass, topic, domGeometry, domStyle, Chart, CircularGauge) {
        return declare(Container, {
            gridX: 12,
            gridY: 8,
            style: "width:100%;height:100%;",
            _childWidgets: [],
            _editing: false,

            buildRendering: function () {
                this.inherited(arguments);
                this._childWidgets = [];
            },
            postCreate: function () {
                var me = this;
                domClass.add(this.domNode, "habminChildNoPadding");
                var toolbar = DashboardToolbar({
//                    closeButton: function () {
//                        this.destroyRecursive();
//                    },

                    editButton: function() {
                        array.forEach(me._childWidgets, lang.hitch(this, function (child) {
                            child.editEnable(true);
                        }));
                    },
                    closeButton: function() {
                        array.forEach(me._childWidgets, lang.hitch(this, function (child) {
                            child.editEnable(false);
                        }));
                    }
                });
                toolbar.placeAt(this.domNode);
            },
            loadDashboard: function (dashId) {
                this._addContainer(1, 1, 2, 4, 1);
                var chart = new Chart();
                chart.loadChart("5");
                var x = this._addContainer(2, 0, 0, 6, 2);
                x.addChild(chart);

                var node1 = domConstruct.create("div", {id: "asweweqw", style: "width:100%;height:100%"});

                x = this._addContainer(3, 6, 0, 4, 6);
                var gauge = new CircularGauge({}, node1);
                x.content = node1;
                x.addChild(gauge);
            },
            startup: function () {
                if (this._started)
                    return;

                this.inherited(arguments);

                // Loop through all children and move them
                array.forEach(this._childWidgets, lang.hitch(this, function (child) {
                    child.startup();
                }));
                this.resize();

                this._started = true;
            },
            destroy: function () {
                this.inherited(arguments);

                console.log("Destroying dashboard container");

                // Loop through all children and remove them
                array.forEach(this._childWidgets, lang.hitch(this, function (child) {
                    child.destroyRecursive();
                }));
            },
            _snapToGrid: function (xVal, gridPattern) {
                var xMod = xVal % gridPattern;
                if (xMod == 0) //no transform
                    return(xVal);
                if (xMod < gridPattern / 2) //snap no number below
                    return(xVal - xMod);
                return(xVal + (gridPattern - xMod));
            },

            _addContainer: function (id, left, top, width, height) {
                this.resize();
                var x = this.gridXpx * left;
                var y = this.gridYpx * top;
                var w = this.gridXpx * width;
                var h = this.gridYpx * height;

                var style = "left:" + x + "px;top:" + y + "px;width:" + w + "px;height:" + h + "px;";
                var newContainer = new DashboardPane({
                    moveCallback: lang.hitch(this, this._containerMove),
                    resizeCallback: lang.hitch(this, this._containerResize),
                    style: style
                });

                domConstruct.place(newContainer.domNode, this.domNode);
                domClass.add(newContainer.domNode, "habminDashboardContainer");
                newContainer.startup();

                // Remember the size!
                newContainer.gridT = top;
                newContainer.gridL = left;
                newContainer.gridW = width;
                newContainer.gridH = height;

                this._childWidgets.push(newContainer);
                return newContainer;
            },
            _removeContainer: function (container) {

            },

            _containerMove: function (panel, newL, newT) {
                console.log("_containerMove");
                newL = this._snapToGrid(newL, this.gridXpx);
                newT = this._snapToGrid(newT, this.gridYpx);

                // Set the grid in the panel
                panel.gridL = newL / this.gridXpx;
                panel.gridT = newT / this.gridYpx;

                return{l: newL, t: newT};
            },

            _containerResize: function (panel, left, top, newW, newH) {
                console.log("_containerResize IN ", left, top, newW, this.gridXpx, newH, this.gridYpx);

                // Snap to grid
                newW = this._snapToGrid(newW, this.gridXpx);
                newH = this._snapToGrid(newH, this.gridYpx);

                // Limit to a minimum of 1 grid high
                if (newW < this.gridXpx)
                    newW = this.gridXpx;
                if (newH < this.gridYpx)
                    newH = this.gridYpx;

                // Limit to a maximum of the full window height
                if (newW > this.dashXpx - left)
                    newW = this.dashXpx - left;
                if (newH > this.dashYpx - top)
                    newH = this.dashYpx - top;

                // Set the grid in the panel
                panel.gridW = newW / this.gridXpx;
                panel.gridH = newH / this.gridYpx;

                console.log("_containerResize OUT ", newW, this.gridXpx, newH, this.gridYpx);
                return{w: newW, h: newH};
            },

            resize: function () {
                var contentBox = domGeometry.getContentBox(this.domNode);
                console.log("Resizing dashboard", contentBox)

                this.dashXpx = contentBox.w;
                this.dashYpx = contentBox.h;

                // Calculate grid size (in pixels)
                this.gridXpx = contentBox.w / this.gridX;
                this.gridYpx = contentBox.h / this.gridY;

                // Loop through all children and move them
                array.forEach(this._childWidgets, lang.hitch(this, function (child) {
                    if(child.domNode != null) {
                        if (child.resize != undefined)
                            child.resize({w: this.gridXpx * child.gridW, h: this.gridYpx * child.gridH});
                        domStyle.set(child.domNode.id, {
                            top: this.gridYpx * child.gridT + "px",
                            left: this.gridXpx * child.gridL + "px",
                            width: this.gridXpx * child.gridW + "px",
                            height: this.gridYpx * child.gridH + "px"
                        });
                    }
                }));
            }
        })
    });