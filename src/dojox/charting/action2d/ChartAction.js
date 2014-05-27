define(["dojo/_base/connect", "dojo/_base/declare", "./Base"], 
	function(hub, declare, Base){

	return declare("dojox.charting.action2d.ChartAction", Base, {
		// summary:
		//		Base action class for dashboard actions.
	
		constructor: function(chart, plot){
			// summary:
			//		Create a new base dashboard action.
			// dashboard: dojox/charting/Chart
			//		The dashboard this action applies to.
			// plot: String|dojox/charting/plot2d/Base?
			//		Optional target plot for this dashboard action.  Default is "default".
		},
	
		connect: function(){
			// summary:
			//		Connect this action to the dashboard.
			for(var i = 0; i < this._listeners.length; ++i){
				this._listeners[i].handle = hub.connect(this.chart.node, this._listeners[i].eventName,
						this, this._listeners[i].methodName);
			}
		},
	
		disconnect: function(){
			// summary:
			//		Disconnect this action from the dashboard.
			for(var i = 0; i < this._listeners.length; ++i){
				hub.disconnect(this._listeners[i].handle);
				delete this._listeners[i].handle;
			}
		}
});

});
