define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",           
	"dijit/_WidgetBase",	
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dojo/text!./templates/ColumnViewProperties.html",
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
	template){
					
	return declare("demo.ColumnViewProperties", [_WidgetBase,_TemplatedMixin,_WidgetsInTemplateMixin], {
		
		templateString: template,
		
		postCreate: function(){
			
			this.inherited(arguments);
			
			var self = this;
			
			this.dateFormatButton.on("click", function(value){
				self.colView.set("rowHeaderTimePattern", self.rowHeaderFormatEditor.value);
				self.colView.set("columnHeaderDatePattern", self.columnHeaderFormatEditor.value);
			});
			
			this.overlapEditor.on("change", function(value){
				self.colView.set('percentOverlap', value);
				self.hGapEditor.set("disabled", value!=0);
			});
			
			this.minHoursEditor.on("change", function(value){
				self.colView.set('minHours', value);
			});
			
			this.maxHoursEditor.on("change", function(value){
				self.colView.set('maxHours', value);
			});
			
			this.hourSizeEditor.on("change", function(value){
				self.colView.set('hourSize', value);
			});
			
			this.timeSlotEditor.on("change", function(value){
				self.colView.set('timeSlotDuration', value);
			});
			
			this.rhgtimeSlotEditor.on("change", function(value){
				self.colView.set('rowHeaderGridSlotDuration', value);
			});
			
			this.rhltimeSlotEditor.on("change", function(value){
				self.colView.set('rowHeaderLabelSlotDuration', value);
			});
			
			this.rhoEditor.on("change", function(value){
				self.colView.set('rowHeaderLabelOffset', value);
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
