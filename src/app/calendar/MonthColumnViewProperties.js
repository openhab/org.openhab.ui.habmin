define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",           
	"dijit/_WidgetBase",	
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dojo/text!./templates/MonthColumnViewProperties.html",	
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
					
	return declare("demo.MonthColumnViewProperties", [_WidgetBase,_TemplatedMixin,_WidgetsInTemplateMixin], {
		
		templateString: template,
		
		postCreate: function(){
			
			this.inherited(arguments);
			
			var self = this;
			
			this.daySizeEditor.on("change", function(value){
				self.colView.set('daySize', value);							
			});
			
			this.overlapEditor.on("change", function(value){
				self.colView.set('percentOverlap', value);
				self.hGapEditor.set("disabled", value!=0);				
			});
			
			this.hGapEditor.on("change", function(value){
				self.colView.set('horizontalGap', value);							
			});
								
		},
		
		view: null,
		
		_setViewAttr: function(value){
			this._set("view", value);
			this.colView = value;				
		}
		
	});
});
