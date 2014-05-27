define(["dojo/_base/declare", "./Default"], 
  function(declare, Default){

	return declare("dojox.charting.plot2d.Areas", Default, {
		// summary:
		//		Represents an area dashboard.  See dojox/charting/plot2d/Default for details.
		constructor: function(){
			// summary:
			//		The constructor for an Area dashboard.
			this.opt.lines = true;
			this.opt.areas = true;
		}
	});
});
