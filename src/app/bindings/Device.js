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
        "dojo/_base/event",
        "dojo/Evented",
        "dijit/_WidgetsInTemplateMixin",
        "dijit/_Container",
        "dijit/_TemplatedMixin",
        "dijit/_CssStateMixin",
        "dijit/layout/ContentPane",
        "dijit/layout/ContentPane",
        "dijit/form/TextBox",
        "dijit/form/Button",
        "dijit/Tooltip",
        "dijit/TitlePane",
        "dojo/text!app/bindings/DeviceHeader.html",
        "dijit/a11yclick"
    ],
    function (require, array, declare, fx, dom, domAttr, domClass, domConstruct, domGeometry, keys, lang, has, topic, focus, manager, query, event, Evented, WidgetMixin, _Container, _TemplatedMixin, _CssStateMixin, StackContainer, ContentPane, TextBox, Button, Tooltip, TitlePane, template) {
        return declare([ContentPane, _TemplatedMixin, Evented, WidgetMixin], {
            node5: {"records": [
                {"domain": "nodes/node5/Name", "name": "Name", "label": "Name", "optional": "false", "readonly": "false"},
                {"domain": "nodes/node5/Location", "name": "Location", "label": "Location", "optional": "false", "readonly": "false"},
                {"domain": "nodes/node5/Manufacturer", "name": "Manufacturer", "label": "Manufacturer", "optional": "false", "readonly": "true", "value": "Fibaro System"},
                {"domain": "nodes/node5/Product", "name": "Product", "label": "Product", "optional": "false", "readonly": "true", "value": "FGD211 Universal Dimmer 500W"},
                {"domain": "nodes/node5/parameters/", "label": "Configuration Parameters", "optional": "false", "readonly": "true", "actionlist": {"entry": {"key": "Refresh", "value": "Refresh"}}},
                {"domain": "nodes/node5/associations/", "label": "Association Groups", "optional": "false", "readonly": "true", "actionlist": {"entry": {"key": "Refresh", "value": "Refresh"}}},
                {"domain": "nodes/node5/neighbors/", "label": "Neighbors", "optional": "false", "readonly": "true", "actionlist": {"entry": {"key": "Refresh", "value": "Refresh"}}},
                {"domain": "nodes/node5/status/", "label": "Status", "optional": "false", "readonly": "true"}
            ]},

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

            baseClass: "",

            _expanded: false,
            _built: false,

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
//                this.titleNode = this.categoriesNode;
                this.containerNode = this.categoriesNode;
            },

            postCreate: function() {
                this.connect(this.deleteButton, "onClick", "onDelete");
                this.connect(this.healButton, "onClick", "onHeal");
            },

            onDelete: function(evt) {
                console.log("onDelete");
                event.stop(evt);
            },

            onHeal: function(evt) {
                console.log("onHeal");
                event.stop(evt);
            },

            getTitleHeight: function () {
                // summary:
                //		Returns the height of the title dom node.
                return domGeometry.getMarginSize(this.domNode).h;	// Integer
            },

            setStatus: function(status) {
                switch(status) {
                    case "INITIALIZING":
                        domClass.add(this.titleNode, "habminDeviceStatusError");
                        break;
                }
            },

            _onHover: function() {
                domClass.add(this.titleNode, "dijitTitlePaneTitleHover");
            },

            _onUnhover: function() {
                domClass.remove(this.titleNode, "dijitTitlePaneTitleHover");
            },

            // into the button widget?
            _onTitleClick: function (evt) {
                console.log("clicky ", evt);
                var me = this;
                if (this._expanded) {
                    this._expanded = false;
                    fx.wipeOut({node: this.containerNode, duration: 400,
                        onEnd: function () {
                            domClass.remove(me.titleNode, "habminDeviceOpen");
                            domClass.remove(me.titleNode, "dijitTitlePaneTitleOpen");
                        }
                    }).play();
                }
                else {
                    if (this._built == false) {
                        this._built = true;
                        array.forEach(this.node5.records, function (entry, i) {
                            if (entry.domain.indexOf("/", entry.domain.length - 1) !== -1) {
                                var icon = "<img src='app/images/gear.png' width='16' height='16'>&nbsp;";
                                var section = new TitlePane({open: false, title: icon + entry.label});
                                //domClass.add(section.get('', "habminIconConfig"));
                                me.addChild(section);
                            }
                        });
                    }

//                    this.healButton.set('disabled', true);
//                    domClass.add(this.healButton.domNode, "habminDevice dijitToolbar dijitButton dijitButtonNode");


                    this._expanded = true;
                    domClass.add(this.titleNode, "habminDeviceOpen");
                    domClass.add(this.titleNode, "dijitTitlePaneTitleOpen");
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
