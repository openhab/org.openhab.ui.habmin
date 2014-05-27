define(["dojo/_base/lang", "dojo/_base/declare", "dojo/Evented"],
	function(lang, declare, Evented){

	return declare("dojox.charting.action2d.Base", Evented, {
		// summary:
		//		Base action class for plot and dashboard actions.
	
		constructor: function(chart, plot){
			// summary:
			//		Create a new base action.  This can either be a plot or a dashboard action.
			// dashboard: dojox/charting/Chart
			//		The dashboard this action applies to.
			// plot: String|dojox/charting/plot2d/Base?
			//		Optional target plot for this action.  Default is "default".
			this.chart = chart;
			this.plot = plot ? (lang.isString(plot) ? this.chart.getPlot(plot) : plot) : this.chart.getPlot("default");
		},
	
		connect: function(){
			// summary:
			//		Connect this action to the plot or the dashboard.
		},
	
		disconnect: function(){
			// summary:
			//		Disconnect this action from the plot or the dashboard.
		},
		
		destroy: function(){
			// summary:
			//		Do any cleanup needed when destroying parent elements.
			this.disconnect();
		}
	});

});
