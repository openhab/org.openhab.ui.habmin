define([
    "require",
    "dojo/_base/array", // array.forEach array.map
    "dojo/_base/declare", // declare
    "dojo/_base/fx", // fx.Animation
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
    "dojo/ready",
    "dijit/_Widget",
    "dijit/_Container",
    "dijit/_TemplatedMixin",
    "dijit/_CssStateMixin",
//    "dojox/layout/TableContainer",
    "dijit/layout/LayoutContainer",
//    "dijit/layout/StackContainer",
    "dijit/layout/ContentPane",
    "dojo/text!app/bindings/DeviceHeader.html",
    "dijit/a11yclick",
    "dojo/domReady!"
// AccordionButton template uses ondijitclick; not for keyboard, but for responsive touch.
], function(require, array, declare, fx, dom, domAttr, domClass, domConstruct, domGeometry, keys, lang, has, topic,
            focus, manager, ready, _Widget, _Container, _TemplatedMixin, _CssStateMixin, StackContainer, ContentPane, template){
//    var DeviceContainer = declare("app.bindings.DeviceContainer", StackContainer, {
    return declare(StackContainer, {

        // summary:
        //		Holds a set of panes where every pane's title is visible, but only one pane's content is visible at a time,
        //		and switching between panes is visualized by sliding the other panes up/down.
        // example:
        //	|	<div data-dojo-type="dijit/layout/DeviceContainer">
        //	|		<div data-dojo-type="dijit/layout/ContentPane" title="pane 1">
        //	|		</div>
        //	|		<div data-dojo-type="dijit/layout/ContentPane" title="pane 2">
        //	|			<p>This is some text</p>
        //	|		</div>
        //	|	</div>

        // duration: Integer
        //		Amount of time (in ms) it takes to slide panes
        duration: manager.defaultDuration,

        baseClass: "habminDeviceContainer",

        buildRendering: function(){
            this.inherited(arguments);
            this.domNode.style.overflow = "hidden";		// TODO: put this in dijit.css
 //           this.domNode.setAttribute("role", "tablist");
        },

        layout: function(){
            // Implement _LayoutWidget.layout() virtual method.
            // Set the height of the open pane based on what room remains.
        },

        removeChild: function(child){
            // Overrides _LayoutWidget.removeChild().

            // Destroy wrapper widget first, before StackContainer.getChildren() call.
            // Replace wrapper widget with true child widget (ContentPane etc.).
            // This step only happens if the DeviceContainer has been started; otherwise there's no wrapper.
            // (TODO: since StackContainer destroys child._wrapper, maybe it can do this step too?)
            if(child._wrapperWidget){
                domConstruct.place(child.domNode, child._wrapperWidget.domNode, "after");
                child._wrapperWidget.destroy();
                delete child._wrapperWidget;
            }

            domClass.remove(child.domNode, "dijitHidden");

            this.inherited(arguments);
        },

        getChildren: function(){
            // Overrides _Container.getChildren() to return content panes rather than internal DeviceInnerContainer panes
            return array.map(this.inherited(arguments), function(child){
                return child.declaredClass == "app/bindings/DeviceInnerContainer" ? child.contentWidget : child;
            }, this);
        },

        destroy: function(){
            if(this._animation){
                this._animation.stop();
            }
            array.forEach(this.getChildren(), function(child){
                // If DeviceContainer has been started, then each child has a wrapper widget which
                // also needs to be destroyed.
                if(child._wrapperWidget){
                    child._wrapperWidget.destroy();
                }else{
                    child.destroyRecursive();
                }
            });
            this.inherited(arguments);
        },

        _showChild: function(child){
            // Override StackContainer._showChild() to set visibility of _wrapperWidget.containerNode
            child._wrapperWidget.containerNode.style.display = "block";
            return this.inherited(arguments);
        },

        _hideChild: function(child){
            // Override StackContainer._showChild() to set visibility of _wrapperWidget.containerNode
            child._wrapperWidget.containerNode.style.display = "none";
            this.inherited(arguments);
        },

        _transition: function(/*dijit/_WidgetBase?*/ newWidget, /*dijit/_WidgetBase?*/ oldWidget, /*Boolean*/ animate){

            if(has("ie") < 8){
                // workaround animation bugs by not animating; not worth supporting animation for IE6 & 7
                animate = false;
            }

            if(this._animation){
                // there's an in-progress animation.  speedily end it so we can do the newly requested one
                this._animation.stop(true);
                delete this._animation;
            }

            var self = this;

            if(newWidget){
                newWidget._wrapperWidget.set("selected", true);

                var d = this._showChild(newWidget);	// prepare widget to be slid in

                // Size the new widget, in case this is the first time it's being shown,
                // or I have been resized since the last time it was shown.
                // Note that page must be visible for resizing to work.
                if(this.doLayout && newWidget.resize){
                    newWidget.resize(this._containerContentBox);
                }
            }

            if(oldWidget){
                oldWidget._wrapperWidget.set("selected", false);
                if(!animate){
                    this._hideChild(oldWidget);
                }
            }

            if(animate){
                var newContents = newWidget._wrapperWidget.containerNode,
                    oldContents = oldWidget._wrapperWidget.containerNode;

                // During the animation we will be showing two dijitAccordionChildWrapper nodes at once,
                // which on claro takes up 4px extra space (compared to stable DeviceContainer).
                // Have to compensate for that by immediately shrinking the pane being closed.
                var wrapperContainerNode = newWidget._wrapperWidget.containerNode,
                    wrapperContainerNodeMargin = domGeometry.getMarginExtents(wrapperContainerNode),
                    wrapperContainerNodePadBorder = domGeometry.getPadBorderExtents(wrapperContainerNode),
                    animationHeightOverhead = wrapperContainerNodeMargin.h + wrapperContainerNodePadBorder.h;

                oldContents.style.height = (self._verticalSpace - animationHeightOverhead) + "px";

                this._animation = new fx.Animation({
                    node: newContents,
                    duration: this.duration,
                    curve: [1, this._verticalSpace - animationHeightOverhead - 1],
                    onAnimate: function(value){
                        value = Math.floor(value);	// avoid fractional values
                        newContents.style.height = value + "px";
                        oldContents.style.height = (self._verticalSpace - animationHeightOverhead - value) + "px";
                    },
                    onEnd: function(){
                        delete self._animation;
                        newContents.style.height = "auto";
                        oldWidget._wrapperWidget.containerNode.style.display = "none";
                        oldContents.style.height = "auto";
                        self._hideChild(oldWidget);
                    }
                });
                this._animation.onStop = this._animation.onEnd;
                this._animation.play();
            }

            return d;	// If child has an href, promise that fires when the widget has finished loading
        },

        // note: we are treating the container as controller here
        _onKeyDown: function(/*Event*/ e, /*dijit/_WidgetBase*/ fromTitle){
            // summary:
            //		Handle keydown events
            // description:
            //		This is called from a handler on DeviceContainer.domNode
            //		(setup in StackContainer), and is also called directly from
            //		the click handler for accordion labels
            if(this.disabled || e.altKey || !(fromTitle || e.ctrlKey)){
                return;
            }
            var c = e.keyCode;
            if((fromTitle && (c == keys.LEFT_ARROW || c == keys.UP_ARROW)) ||
                (e.ctrlKey && c == keys.PAGE_UP)){
                this._adjacent(false)._buttonWidget._onTitleClick();
                e.stopPropagation();
                e.preventDefault();
            }else if((fromTitle && (c == keys.RIGHT_ARROW || c == keys.DOWN_ARROW)) ||
                (e.ctrlKey && (c == keys.PAGE_DOWN || c == keys.TAB))){
                this._adjacent(true)._buttonWidget._onTitleClick();
                e.stopPropagation();
                e.preventDefault();
            }
        }
    });

    // For monkey patching
    DeviceContainer._InnerContainer = DeviceInnerContainer;
    DeviceContainer._Button = AccordionButton;

    return DeviceContainer;
});
