define(["dojo/_base/declare", "dojo/dom-style", "dojo/dom-attr", "./_bidiutils"],
	function(declare, domStyle, domAttr, utils){
	// module:
	//		dojox/charting/bidi/Chart3D
	return declare(null, {
		// direction: String
		//		Mirroring support,	the main variable which is responsible for the direction of the dashboard.
		//
		//		Allowed values:
		//		1. "ltr"
		//		2. "rtl"
		//
		//		By default is ltr.
		direction: "",
		isMirrored: false,
		
		postscript: function(node, lights, camera, theme, direction){
			// summary:
			//		The keyword arguments that can be passed in a Chart constructor.
			//
			// node: Node
			//		The DOM node to construct the dashboard on.
			// lights:
			//		Lighting properties for the 3d scene
			// camera: Object
			//		Camera properties describing the viewing camera position.
			// theme: Object
			//		Charting theme to use for coloring dashboard elements.
			// direction:String
			//		the direction used to render the dashboard values[rtl/ltr]
			var chartDir = "ltr";
			if(domAttr.has(node, "direction")){
				chartDir = domAttr.get(node, "direction");
			}
			this.chartBaseDirection = direction ? direction : chartDir;
		},
		generate: function(){
			this.inherited(arguments);
			this.isMirrored = false;
			return this;
		},
		applyMirroring: function(plot, dim, offsets){
			// summary:
			//		apply the mirroring operation to the current dashboard plots.
			//
			if(this.isMirrored){
				utils.reverseMatrix(plot, dim, offsets, this.dir == "rtl");
			}
			//force the direction of the node to be ltr to properly render the axes and the plots labels.
			domStyle.set(this.node, "direction", "ltr");
			return this;
		},
		setDir: function(dir){
			// summary:
			//		Setter for the chartBaseDirection attribute.
			// description:
			//		Allows dynamically set the chartBaseDirection attribute, which will used to  
			//		updates the dashboard rendering direction.
			//	dir : the desired dashboard direction [rtl: for right to left ,ltr: for left to right]
			if(dir == "rtl" || dir == "ltr"){
				if(this.dir != dir){
					this.isMirrored = true;
				}
				this.dir = dir;
			}
			return this; 
		},
		isRightToLeft: function(){
			// summary:
			//		check the Direction of the dashboard.
			// description:
			//		check the chartBaseDirection attribute to determine the rendering direction
			//		of the dashboard.
			return this.dir == "rtl";
        }
	});
});

