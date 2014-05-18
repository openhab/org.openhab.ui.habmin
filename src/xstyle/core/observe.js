define('xstyle/core/observe', ['xstyle/core/utils'], function(utils){
	var when = utils.when;
	// An observe function, requires getter/setter support in the target (I9+ for regular objects, IE8+ for DOM nodes)
	var observe = /*Object.observe || */ function(target, property, listener){

		var proxyProperty = '_property_' + property;
		var proxy = target[proxyProperty];
		if(!proxy){
			var currentValue = target[property];
			Object.defineProperty(target, property, {
				get: function(){
					return currentValue;
				},
				set: function(value){
					currentValue = value;
					proxy.setSource(value);
				}
			});
			proxy = target[proxyProperty] = new Proxy();
			proxy.setSource(currentValue);
		}
		return proxy.observe(listener);
	};
	observe.get = function(target, property, listener){
		return observe(target, property, listener);
	};


	function Proxy(){
		// just assume everything will be observed, we could change the optimizations later
		this._listeners = [];
	}
	Proxy.prototype = {
		property: function(key){
			return (this._properties || (this._properties = {}))[key] || (this._properties[key] = new Proxy());
		},
		observe: function(listener){
			this._listeners.push(listener);
			if(this.source){
				listener(this.valueOf());
			}
			// TODO: return handle with remove method
		},
		setSource: function(source){
			var proxy = this;
			if(this.handle && this.handle.remove){
				this.handle.remove();
			}
			when(source, function(source){
				proxy.source = source;
				var listeners = proxy._listeners;
				var value = proxy.valueOf();
				for(var i = 0; i < listeners.length; i++){
					listeners[i](value);
				}
				if(source && source.observe){
					proxy.handle = source.observe(function(value){
						for(var i = 0; i < listeners.length; i++){
							listeners[i](value);
						}
					});
				}
				var properties = proxy._properties;
				for(i in properties){
					proxy.property(i).is(source && source.property && source.property(i));
				}
			});
		},
		valueOf: function(){
			var source = this.source;
			return source && source.observe ? source.valueOf() : source;
		},
		get: function(key){
			var source = this.source;
			return source && source.get && source.get(key);
		},
		put: function(value){
			var source = this.source;
			return source && source.put && source.put(value);
		}
	};
	return observe;
});