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

        "app/dashboard/HabminChart"
    ],
    function (declare, lang, Container, DashboardPane, DashboardToolbar, request, array, domConstruct, domClass, topic, domGeometry, domStyle, Chart) {
        return declare(Container, {
            gridX: 12,
            gridY: 8,
            style:"width:100%;height:100%;",
            childWidgets: [],

            buildRendering: function () {
                this.inherited(arguments);
            },
            postCreate: function () {
                domClass.add(this.domNode, "habminChildNoPadding");
                var toolbar = DashboardToolbar();
                toolbar.placeAt(this.domNode);
            },
            loadDashboard: function (dashId) {
                var x = this._addContainer(1, 0, 0, 6, 2);
                this._addContainer(2, 1, 2, 4, 1);
                var chart = new Chart();
                chart.loadChart("5");
                chart.placeAt(x.domNode);
                chart.startup();
            },
            startup: function() {
                if(this._started)
                    return;

                this.inherited(arguments);

                this.resize();

                this._started = true;
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
//                var newContainer = new ContentPane({style: style, dockable: false, resizable: true});
                var newContainer = new DashboardPane({
                    moveCallback: lang.hitch(this, this._containerMove),
                    resizeCallback: lang.hitch(this, this._containerResize),
                    style: style
                });
//                newContainer.dashboardContainer = this;
//                newContainer.set("content", style);
                domConstruct.place(newContainer.domNode, this.domNode);
                domClass.add(newContainer.domNode, "habminDashboardContainer");
                newContainer.startup();
//                on(newContainer, "resize", this._containerResize);
//                on(newContainer.headerNode, "mousedown", this._containerResize);
//                this.connect(newContainer.headerNode,"onmousedown","bringToTop");

                // Remember the size!
                newContainer.gridT = top;
                newContainer.gridL = left;
                newContainer.gridW =width;
                newContainer.gridH =height;

                this.childWidgets.push(newContainer);
                return newContainer;
            },
            _removeContainer: function(container) {

            },

            _containerMove: function (panel, newL, newT) {
                console.log("_containerMove");
                newL = this._snapToGrid(newL, this.gridXpx);
                newT = this._snapToGrid(newT, this.gridYpx);

                // Set the grid in the panel
                panel.gridT = newL / this.gridXpx;
                panel.gridL = newT / this.gridYpx;

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
                array.forEach(this.childWidgets, lang.hitch(this, function(child) {
                    console.log("Resizing ", child.domNode, {
                        top: this.gridYpx * child.gridT,
                        left: this.gridXpx * child.gridL
                    });
                    domStyle.set(child.domNode.id, {
                        top: this.gridYpx * child.gridT + "px",
                        left: this.gridXpx * child.gridL + "px",
                        width: this.gridXpx * child.gridW + "px",
                        height: this.gridYpx * child.gridH + "px"
                    });
                }));
            },

            _enableEditing: function () {

            }


        })
    });