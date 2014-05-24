define([
        "require",
        "dojo/_base/array", // array.forEach array.map
        "dojo/_base/declare", // declare
        "dojo/fx", // fx.Animation
        "dojo/dom", // dom.setSelectable
        "dojo/dom-attr", // domAttr.attr
        "dojo/dom-class", // domClass.remove
        "dojo/dom-construct", // domConstruct.place
        "dojo/dom-geometry",
        "dojo/keys", // keys
        "dojo/_base/lang", // lang.getObject lang.hitch
        "dojo/sniff", // has("ie") has("dijit-legacy-requires")
        "dojo/topic", // publish
        "dijit/focus", // focus.focus()
        "dijit/_base/manager", // manager.defaultDuration
        "dojo/query",
        "dijit/_Widget",
        "dijit/_Container",
        "dijit/_TemplatedMixin",
        "dijit/_CssStateMixin",
        "dijit/layout/ContentPane",
        "dijit/layout/ContentPane",
        "dijit/form/TextBox",
        "dojo/text!app/bindings/DeviceHeader.html",
        "dijit/a11yclick",
        "dojo/domReady!"
    ],
    function (require, array, declare, fx, dom, domAttr, domClass, domConstruct, domGeometry, keys, lang, has, topic, focus, manager, query, _Widget, _Container, _TemplatedMixin, _CssStateMixin, StackContainer, ContentPane, TextBox, template) {
        return declare([ContentPane, _TemplatedMixin], {
            // summary:
            //		The title bar to click to open up an accordion pane.
            //		Internal widget used by DeviceContainer.
            // tags:
            //		private

            templateString: template,

            // label: String
            //		Title of the pane
            title: "",
            _setTitleAttr: {node: "titleTextNode", type: "innerHTML" },

            type: "",
            _setTypeAttr: {node: "typeTextNode", type: "innerHTML" },

            status: "",
            _setStatusAttr: {node: "statusTextNode", type: "innerHTML" },

            titleLabel: "",
            _setTitleLabelAttr: {node: "titleLabelNode", type: "innerHTML" },

            typeLabel: "",
            _setTypeLabelAttr: {node: "typeLabelNode", type: "innerHTML" },

            statusLabel: "",
            _setStatusLabelAttr: {node: "statusLabelNode", type: "innerHTML" },

            _setCategoriesAttr: {node: "categoriesNode", type: "innerHTML" },

            // iconClassAttr: String
            //		CSS class for icon to left of label
            iconClassAttr: "",
            _setIconClassAttr: { node: "iconNode", type: "img" },

            baseClass: "dijitTitlePaneTitle",

            _expanded: false,


            getParent: function () {
                // summary:
                //		Returns the Device parent.
                // tags:
                //		private
                return this.parent;
            },

            buildRendering: function () {
                this.inherited(arguments);
                var textNodeId = this.id.replace(' ', '_');
                domAttr.set(this.titleTextNode, "id", textNodeId + "_title");
                domAttr.set(this.typeTextNode, "id", textNodeId + "_type");
                domAttr.set(this.statusTextNode, "id", textNodeId + "_status");
                domAttr.set(this.titleLabelNode, "id", textNodeId + "_titleLabel");
                domAttr.set(this.typeLabelNode, "id", textNodeId + "_typeLabel");
                domAttr.set(this.statusLabelNode, "id", textNodeId + "_statusLabel");
                domAttr.set(this.categoriesNode, "id", textNodeId + "_categories");
                this.containerNode = this.categoriesNode;
            },

            getTitleHeight: function () {
                // summary:
                //		Returns the height of the title dom node.
                return domGeometry.getMarginSize(this.domNode).h;	// Integer
            },

            // into the button widget?
            _onTitleClick: function () {
                console.log("clicky");
                if (this._expanded) {
                    this._expanded = false;
                    fx.wipeOut({node: this.containerNode, duration: 400}).play();
                }
                else {
                    this._expanded = true;
                    fx.wipeIn({node: this.containerNode, duration: 400}).play();
                }
            },

            _onTitleKeyDown: function (/*Event*/ evt) {
                return this.getParent()._onKeyDown(evt, this.contentWidget);
            },

            _setSelectedAttr: function (/*Boolean*/ isSelected) {
                return;
                this._set("selected", isSelected);
                this.focusNode.setAttribute("aria-expanded", isSelected ? "true" : "false");
                this.focusNode.setAttribute("aria-selected", isSelected ? "true" : "false");
                this.focusNode.setAttribute("tabIndex", isSelected ? "0" : "-1");
            }
        });
    });
