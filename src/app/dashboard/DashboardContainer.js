define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dijit/layout/BorderContainer",
        "app/dashboard/DashboardPane",
        "dojo/request",
        "dojo/_base/array",
        "dojo/dom-construct",
        "dojo/dom-class",
        "dojo/topic",
        "dojo/on",
        "dojo/dom-geometry"
    ],
    function (declare, lang, Container, DashboardPane, request, array, domConstruct, domClass, topic, on, domGeometry) {
        return declare(Container, {
            gridX: 12,
            gridY: 8,

            buildRendering: function () {
                this.inherited(arguments);

                // Hook the resize event
                on(this, "resize", this._resize());

                this._resize();
            },
            postCreate: function () {
                domClass.add(this.domNode, "habminChildNoPadding");
            },

            _snapToGrid: function (xVal, gridPattern) {
                var xMod = xVal % gridPattern;
                if (xMod == 0) //no transform
                    return(xVal);
                if (xMod < gridPattern / 2) //snap no number below
                    return(xVal - xMod);
                return(xVal + (gridPattern - xMod));
            },

            addContainer: function (id, left, top, width, height) {
                this._resize();
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

                return newContainer;
            },

            _containerMove: function (panel, newL, newT) {
                console.log("_containerMove");
                newL = this._snapToGrid(newL, this.gridXpx);
                newT = this._snapToGrid(newT, this.gridYpx);
                return{l: newL, t: newT};
            },

            _containerResize: function (panel, newW, newH) {
                console.log("_containerResize");
                newW = this._snapToGrid(newW, this.gridXpx);
                if (newW < this.gridXpx)
                    newW = this.gridXpx;
                newH = this._snapToGrid(newH, this.gridYpx);
                if (newH < this.gridYpx)
                    newH = this.gridYpx;
                return{w: newW, h: newH};
            },

            _resize: function (evt) {
                var contentBox = domGeometry.getContentBox(this.domNode);
                this.gridXpx = contentBox.w / this.gridX;
                this.gridYpx = contentBox.h / this.gridY;

            },

            _enableMove: function () {

            }
        })
    });