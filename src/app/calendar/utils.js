define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/fx",
	"dojo/store/Memory", 
    "dojo/store/Observable"],

function(
	declare,
	lang,
	fx,
	Memory,
	Observable){
	
	var utils = lang.getObject("demo.utils", true);
	
	utils.initHints = function(node){
		// Display different hint every 10 seconds 
		var hints = [
			"Hint: Create an event by clicking and dragging on the grid while maintaining the control key",
			"Hint: Move an event by clicking on it and dragging it",
			"Hint: Resize an event by clicking on one of its ends and dragging it"
		];
		
		var hintIdx = 0;
		node.innerHTML = hints[0];
								
		setInterval(function(){
			fx.fadeOut({node: node, 
				onEnd: function(){
					hintIdx = hintIdx+1>hints.length-1 ? 0 : hintIdx+1;
					node.innerHTML = hints[hintIdx];
					fx.fadeIn({node: node}).play(500); 									
				}
			}).play(500);
		}, 10000);
	};
	
	utils.getStartOfCurrentWeek = function(calendar){
		return calendar.floorToWeek(new calendar.dateClassObj());
	};
	
	utils.createDefaultStore = function(calendar){
		var modelBase = [
			{day: 1, start: [10,0], duration: 1400},
			{day: 2, start: [10,30], duration: 120},
			{day: 2, start: [12,0], duration: 240},
			{day: 3, start: [6,0], duration: 180},
			{day: 3, start: [0,0], duration: 2880, allDay: true}
		];
		
		var someData = [];
								
		var startOfWeek = utils.getStartOfCurrentWeek(calendar);
		
		for (var id=0; id<modelBase.length; id++) {
			var newObj = {
				id: id,
				summary: "New Event " + id,
				startTime: new calendar.dateClassObj(startOfWeek.getTime()),
				endTime: new calendar.dateClassObj(startOfWeek.getTime()),
				calendar: id%2 == 0 ? "cal1" : "cal2",
				allDay: modelBase[id].allDay
			};

			newObj.startTime = calendar.dateModule.add(newObj.startTime, "day", modelBase[id].day);
			newObj.startTime.setHours(modelBase[id].start[0]);
			newObj.startTime.setMinutes(modelBase[id].start[1]);

			newObj.endTime = calendar.dateModule.add(newObj.startTime, "minute", modelBase[id].duration);

			someData.push(newObj);
		}
		
		this.id = id;
		
		return new Observable(new Memory({data: someData}));
	};
	
	utils.configureInteractiveItemCreation= function(calendar){
		// Enable creation of event interactively by ctrl clicking grid.
		var createItem = function(view, d, e){
		
			// create item by maintaining control key
			if(!e.ctrlKey || e.shiftKey || e.altKey){
				return null;
			}
		
			// create a new event
			var start, end;
			var colView = calendar.columnView;
			var cal = calendar.dateModule;
			
			if(view == colView){
				start = calendar.floorDate(d, "minute", colView.timeSlotDuration);
				end = cal.add(start, "minute", colView.timeSlotDuration); 
			}else{
				start = calendar.floorToDay(d);
				end = cal.add(start, "day", 1);
			}
			
			var item = {
				id: utils.id,
				summary: "New event " + utils.id,
				startTime: start,
				endTime: end,
				calendar: "cal1",
				allDay: view.viewKind == "matrix"
			};
			
			utils.id++;	
			
			return item;							
		};
		
		calendar.set("createOnGridClick", true);
		calendar.set("createItemFunc", createItem);
	};
					
	return utils;
});
