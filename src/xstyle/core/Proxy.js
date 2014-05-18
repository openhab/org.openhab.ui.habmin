define('xstyle/core/Proxy', ['xstyle/core/utils'], function(utils){
	var when = utils.when;

	function Proxy(value){
		// just assume everything will be observed, we could change the optimizations later
		if(value !== undefined){
			this.setSource(value);
		}
	}
	Proxy.prototype = {
		property: function(key){
			var properties = this.hasOwnProperty('_properties') ?
				this._properties : (this._properties = {});
			var proxy = properties[key];
			if(proxy){
				return proxy;
			}
			proxy = properties[key] = new Proxy(this.get(key));
			proxy.parent = this;
			proxy.name = key;
			return proxy;
		},
		observe: function(listener){
			(this._listeners || (this._listeners = [])).push(listener);
			if(this.source !== undefined){
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
				var listeners = proxy._listeners || 0;
				var value = proxy.valueOf();
				for(var i = 0; i < listeners.length; i++){
					listeners[i](value);
				}
				if(source && source.observe){
					proxy.handle = source.observe(function(value){
						var listeners = proxy._listeners || 0;
						for(var i = 0; i < listeners.length; i++){
							listeners[i](value);
						}
					});
				}
				var properties = proxy._properties;
				for(i in properties){
					proxy.property(i).setSource(source && source.property && source.property(i));
				}
			});
		},
		valueOf: function(){
			var source = this.source;
			return source && source.observe ? source.valueOf() : source;
		},
		get: function(key){
			var source = this.source;
			return source ?
				source.get ? source.get(key) : source[key] :
				this['value-' + key];
		},
		set: function(key, value){
			var source = this.source;
			if(source){
				source[key] = value;
			}else{
				this['value-' + key] = value;
			}
			var property = this._properties && this._properties[key];
			if(property){
				property.put(value);
			}
		},
		put: function(value){
			var source = this.source;
			if(source && source.put){
				return source.put(value);
			}else if(this.parent){
				this.parent[this.name] = value;
			}
			return this.setSource(value);
		}
	};
	return Proxy;
});