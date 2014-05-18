define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",           
	"dijit/_WidgetBase",	
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dojo/text!./templates/MatrixViewProperties.html",
	"dojo/store/Memory",
	"dijit/form/CheckBox", 
	"dijit/form/TextBox",
	"dijit/form/Button", 
	"dijit/form/NumberSpinner",
	"dijit/form/ComboBox"
],

function(
	declare,
	lang,
	arr,
	_WidgetBase,
	_TemplatedMixin,
	_WidgetsInTemplateMixin,
	template,
	Memory){
					
	return declare("demo.MatrixViewProperties", [_WidgetBase,_TemplatedMixin,_WidgetsInTemplateMixin], {
		
		templateString: template,
		
		postCreate: function(){
			
			this.inherited(arguments);
			
			var self = this;
			
			this.dateFormatButton.on("click", function(){
				self.matrixView.set("rowHeaderDatePattern", self.rowHeaderFormatEditor.value);				
				self.matrixView.set("cellHeaderLongPattern", self.cellLongFormatEditor.value);
				self.matrixView.set("cellHeaderShortPattern", self.cellShortFormatEditor.value);
			});
			
			this.roundToDayCB.on("change", function(value){
				self.matrixView.set("roundToDay", value);
			});

			this.overlapEditor.on("change", function(value){
				self.matrixView.set("percentOverlap", this.value);
				self.vGapEditor.set("disabled", value!=0);
			});
			
			// the item to renderer kind functions.
			var itemToRendererKindFuncs = [
				null, 
				function(item){ return "horizontal"; },
				function(item){ return item.allDay ? "horizontal" : "label";},
				function(item){ return "label";}
			]; 
			
			this.rendererKindEditor.set("store", new Memory({data:[
				{id:0, label: "default"},
				{id:1, label: "All horizontals"},
				{id:2, label: "Only all day horizontals"},
				{id:3, label: "All labels"}
			]}));
			
			this.rendererKindEditor.watch("item", function(prop, oldValue, newValue){
				self.matrixView.set("itemToRendererKindFunc", itemToRendererKindFuncs[newValue.id]);
			});
			
			this.overlapEditor.on("change", function(value){
				self.matrixView.set('percentOverlap', value);
				self.vGapEditor.set("disabled", value!=0);
			});
			
			this.vGapEditor.on("change", function(value){
				self.matrixView.set('verticalGap', value);				
			});
			
			this.hRendererHeightEditor.on("change", function(value){
				self.matrixView.set('horizontalRendererHeight', value);				
			});
			
			this.hRendererHeightEditor.on("change", function(value){
				self.matrixView.set('horizontalRendererHeight', value);				
			});
			
			this.lRendererHeightEditor.on("change", function(value){
				self.matrixView.set('labelRendererHeight', value);				
			});
			
			this.hRendererHeightEditor.on("change", function(value){
				self.matrixView.set('horizontalRendererHeight', value);				
			});
			
			this.eRendererHeightEditor.on("change", function(value){
				self.matrixView.set('expandRendererHeight', value);				
			});
			
			this.eRendererHeightEditor.on("change", function(value){
				self.matrixView.set('expandRendererHeight', value);				
			});
			
			this.eRendererHeightEditor.on("change", function(value){
				self.matrixView.set('expandRendererHeight', value);				
			});

		},
		
		view: null,
		
		_setViewAttr: function(value){
			this._set("view", value);
			this.matrixView = value;				
		}
		
	});
});
