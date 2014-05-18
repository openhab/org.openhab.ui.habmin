define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",           
	"dijit/_WidgetBase",	
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dojo/text!./templates/MainProperties.html",
	"app/calendar/DatePicker",
	"dijit/TitlePane",  
	"dijit/form/CheckBox", 
	"dijit/form/TextBox",
	"dijit/form/DateTextBox", 
	"dijit/form/TimeTextBox", 
	"dijit/form/Button", 
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
					
	return declare("demo.MainProperties", [_WidgetBase,_TemplatedMixin,_WidgetsInTemplateMixin], {
		
		templateString: template,
		
		postCreate: function(){
			
			this.inherited(arguments);
			
			var self = this;
			
			var mergeDateTime = function(isStart){
				var dateEditor = isStart ? self.itemStartDateEditor : self.itemEndDateEditor;
				var timeEditor = isStart ? self.itemStartTimeEditor : self.itemEndTimeEditor;
				var date = dateEditor.get("value");
				var time = timeEditor.get("value");
				date.setHours(time.getHours());
				date.setMinutes(time.getMinutes());
				return date;
			};
			
			this.updateItemButton.on("click", function(value){
				
				if (self.editedItem != null) {
					self.editedItem.summary = self.itemSummaryEditor.get("value");
					if(self.allDayCB.get("value")){
						if(!self.calendar.isStartOfDay(self.editedItem.startTime)){
							self.editedItem.startTime = self.calendar.floorToDay(self.itemStartDateEditor.get("value"), true);
						}
						if(!self.calendar.isStartOfDay(self.editedItem.endTime)){
							self.editedItem.endTime = self.calendar.floorToDay(self.itemEndDateEditor.get("value"), true);
						}			
						self.editedItem.allDay = true;						
					}else{
						self.editedItem.startTime = mergeDateTime(true);
						self.editedItem.endTime = mergeDateTime(false);
						delete self.editedItem.allDay;
					}
					
					var calValue = self.calendarEditor.get("value");
					self.editedItem.calendar = calValue == "Calendar 1" ? "cal1" : "cal2";
					self.calendar.store.put(self.editedItem);
				}
				
			});
			
			this.deleteItemButton.on("click", function(value){
				if (self.editedItem != null) {
					self.calendar.store.remove(self.editedItem.id);
				}
			});
																							
			// Synchronize date picker.																	
			
			this.datePicker.on("change", function(e){
				var d = self.datePicker.get("value");
				self.calendar.set("date", d);
			});						
							
			this.calendar1CB.on("change", function(v){
				self.calendarVisibility[0] = v;
				self.calendar.currentView.invalidateLayout();
			});
			
			this.calendar2CB.on("change", function(v){
				self.calendarVisibility[1] = v;
				self.calendar.currentView.invalidateLayout();
			});		
			
			this.allDayCB.on("change", function(value){
				
				self.itemStartTimeEditor.set("disabled", value);
				self.itemEndTimeEditor.set("disabled", value);
				
				var d;
				if(value){
					d = self.itemStartTimeEditor.get("value");
					calendar.floorToDay(d, true);
					self.itemStartTimeEditor.set("value", d);
					d = self.itemEndTimeEditor.get("value");
					calendar.floorToDay(d, true);
					self.itemEndTimeEditor.set("value", d);
					
					if(!calendar.isStartOfDay(self.editedItem.endTime)){
						d = self.itemEndDateEditor.get("value");
						calendar.floorToDay(d, true);
						d = calendar.dateModule.add(d, "day", 1);
						self.itemEndDateEditor.set("value", d);
					}
					
				}else{
					self.editedItem.startTime.setHours(8);
					self.editedItem.endTime.setHours(9);
					self.itemStartTimeEditor.set("value", self.editedItem.startTime);
					self.itemEndTimeEditor.set("value", self.editedItem.endTime);
					d = self.itemEndDateEditor.get("value");
					calendar.floorToDay(d, true);
					d = self.calendar.dateModule.add(d, "day", -1);
					self.itemEndDateEditor.set("value", d);
				}				
			});
		},
		
		calendar: null,
		
		_setCalendarAttr: function(value){
			this._set("calendar", value);
			this.configureCalendar(value);
		},
		
		selectionChanged: function(item){
			
			var itemNull = item == null;
			
			var widgets = [this.itemSummaryEditor, this.itemStartDateEditor, 
			               this.itemStartTimeEditor, this.itemEndDateEditor,
			               this.itemEndTimeEditor, this.calendarEditor, 
			               this.allDayCB, this.deleteItemButton, this.updateItemButton];
			
			arr.forEach(widgets, function(w){
				w.set("disabled", itemNull);
				w.set("value", null, false);
			});
			
			this.editedItem = itemNull ? null : lang.mixin({}, item); 
			
			if(!itemNull){
			
				var allDay = item.allDay === true;
				
				this.itemStartTimeEditor.set("disabled", allDay);
				this.itemEndTimeEditor.set("disabled", allDay);
												
				this.itemSummaryEditor.set("value", item.summary);
				this.itemStartDateEditor.set("value", item.startTime);
				this.itemStartTimeEditor.set("value", item.startTime);
				this.itemEndDateEditor.set("value", item.endTime);
				this.itemEndTimeEditor.set("value", item.endTime);
				this.calendarEditor.set("value", item.calendar == "cal1" ? "Calendar 1" : "Calendar 2");																					
				this.allDayCB.set("checked", allDay, false);
			}																						
		},
		
		configureCalendar: function(calendar){
			
			var self = this;
			
			this.datePicker.set("value", calendar.get("date"));
			
			calendar.on("change", function(e){							
				self.selectionChanged(e.newValue);							
			});	
			
			calendar.on("itemEditEnd", function(e){
				self.selectionChanged(e.item);
			});
			
			var updateDatePicker = function(startTime, endTime){
				
				self.datePicker.set("currentFocus", startTime, false);							
				self.datePicker.set("minDate", startTime);
				self.datePicker.set("maxDate", endTime);
				self.datePicker._populateGrid();
				
			};
			
			
			// configure item properties panel
			calendar.on("timeIntervalChange", function(e){
				updateDatePicker(e.startTime, e.endTime);
			});
								
			// filter out event according to their calendar
			this.calendarVisibility = [true, true];
			
			var itemToRendererKindFunc = function(item){
				if(item.cssClass == "Calendar1" && self.calendarVisibility[0] ||
					item.cssClass == "Calendar2" && self.calendarVisibility[1]){
						return this._defaultItemToRendererKindFunc(item);
					}
				return null;
			};
			
			calendar.columnView.set("itemToRendererKindFunc", itemToRendererKindFunc);
			calendar.columnView.secondarySheet.set("itemToRendererKindFunc", itemToRendererKindFunc);
			calendar.matrixView.set("itemToRendererKindFunc", itemToRendererKindFunc);					
		}
	});
});
