/*
 * This is a very simple AMD module loader so that xstyle can be used standalone
 */

(function(){
	var doc = document;
	// find a script to go off of
	var scripts = doc.scripts;
	var baseScript = scripts[scripts.length-1];
	var baseUrl = baseScript.src.replace(/[^\/]+\/xstyle[^\/]*js/,'');
	// a very simple AMD loader
	define = function(id, deps, factory){
		if(!factory){
			factory = deps;
			deps = id;
			id = 'put-selector/put';
		}
		var waiting = 1;
		for(var i = 0;i < deps.length; i++){
			var dep = deps[i];
			var module = modules[dep];
			if(!module){
				// inject script tag
				module = modules[dep] = {callbacks: []};
				var node = doc.createElement('script');
				node.src = baseUrl + dep + '.js';
				baseScript.parentNode.insertBefore(node, baseScript);
			}
			if(module.callbacks){
				// add a callback for this waiting module
				waiting++;
				module.callbacks.push((function(i){
					return function(value){
						deps[i] = value;
						loaded();
					};
				})(i));
			}else{
				deps[i] = module.result;
			} 
		}
		module = modules[id] || (modules[id] = {callbacks: []});
		loaded();
		function loaded(){
			if(--waiting < 1){
				// done loading, run the factory
				var result = module.result = factory && factory.apply(this, deps);
				var callbacks = module.callbacks;
				for(var i = 0 ; i < callbacks.length; i++){
					callbacks[i](result);
				}
				module.callbacks = 0;
			}
		}
	};
	
	require = function(deps, factory){
		define("", deps, factory);
	};
	
	var modules = {require: {result: require}};
})();
(function(define){
var forDocument, fragmentFasterHeuristic = /[-+,> ]/; // if it has any of these combinators, it is probably going to be faster with a document fragment 
define([], forDocument = function(doc, newFragmentFasterHeuristic){
"use strict";
	// module:
	//		put-selector/put
	// summary:
	//		This module defines a fast lightweight function for updating and creating new elements
	//		terse, CSS selector-based syntax. The single function from this module creates
	// 		new DOM elements and updates existing elements. See README.md for more information.
	//	examples:
	//		To create a simple div with a class name of "foo":
	//		|	put("div.foo");
	fragmentFasterHeuristic = newFragmentFasterHeuristic || fragmentFasterHeuristic;
	var selectorParse = /(?:\s*([-+ ,<>]))?\s*(\.|!\.?|#)?([-\w%$|]+)?(?:\[([^\]=]+)=?['"]?([^\]'"]*)['"]?\])?/g,
		undefined, namespaceIndex, namespaces = false,
		doc = doc || document,
		ieCreateElement = typeof doc.createElement == "object"; // telltale sign of the old IE behavior with createElement that does not support later addition of name 
	function insertTextNode(element, text){
		element.appendChild(doc.createTextNode(text));
	}
	function put(topReferenceElement){
		var fragment, lastSelectorArg, nextSibling, referenceElement, current,
			args = arguments,
			returnValue = args[0]; // use the first argument as the default return value in case only an element is passed in
		function insertLastElement(){
			// we perform insertBefore actions after the element is fully created to work properly with 
			// <input> tags in older versions of IE that require type attributes
			//	to be set before it is attached to a parent.
			// We also handle top level as a document fragment actions in a complex creation 
			// are done on a detached DOM which is much faster
			// Also if there is a parse error, we generally error out before doing any DOM operations (more atomic) 
			if(current && referenceElement && current != referenceElement){
				(referenceElement == topReferenceElement &&
					// top level, may use fragment for faster access 
					(fragment || 
						// fragment doesn't exist yet, check to see if we really want to create it 
						(fragment = fragmentFasterHeuristic.test(argument) && doc.createDocumentFragment()))
							// any of the above fails just use the referenceElement  
							 ? fragment : referenceElement).
								insertBefore(current, nextSibling || null); // do the actual insertion
			}
		}
		for(var i = 0; i < args.length; i++){
			var argument = args[i];
			if(typeof argument == "object"){
				lastSelectorArg = false;
				if(argument instanceof Array){
					// an array
					current = doc.createDocumentFragment();
					for(var key = 0; key < argument.length; key++){
						current.appendChild(put(argument[key]));
					}
					argument = current;
				}
				if(argument.nodeType){
					current = argument;
					insertLastElement();
					referenceElement = argument;
					nextSibling = 0;
				}else{
					// an object hash
					for(var key in argument){
						current[key] = argument[key];
					}				
				}
			}else if(lastSelectorArg){
				// a text node should be created
				// take a scalar value, use createTextNode so it is properly escaped
				// createTextNode is generally several times faster than doing an escaped innerHTML insertion: http://jsperf.com/createtextnode-vs-innerhtml/2
				lastSelectorArg = false;
				insertTextNode(current, argument);
			}else{
				if(i < 1){
					// if we are starting with a selector, there is no top element
					topReferenceElement = null;
				}
				lastSelectorArg = true;
				var leftoverCharacters = argument.replace(selectorParse, function(t, combinator, prefix, value, attrName, attrValue){
					if(combinator){
						// insert the last current object
						insertLastElement();
						if(combinator == '-' || combinator == '+'){
							// + or - combinator, 
							// TODO: add support for >- as a means of indicating before the first child?
							referenceElement = (nextSibling = (current || referenceElement)).parentNode;
							current = null;
							if(combinator == "+"){
								nextSibling = nextSibling.nextSibling;
							}// else a - operator, again not in CSS, but obvious in it's meaning (create next element before the current/referenceElement)
						}else{
							if(combinator == "<"){
								// parent combinator (not really in CSS, but theorized, and obvious in it's meaning)
								referenceElement = current = (current || referenceElement).parentNode;
							}else{
								if(combinator == ","){
									// comma combinator, start a new selector
									referenceElement = topReferenceElement;
								}else if(current){
									// else descendent or child selector (doesn't matter, treated the same),
									referenceElement = current;
								}
								current = null;
							}
							nextSibling = 0;
						}
						if(current){
							referenceElement = current;
						}
					}
					var tag = !prefix && value;
					if(tag || (!current && (prefix || attrName))){
						if(tag == "$"){
							// this is a variable to be replaced with a text node
							insertTextNode(referenceElement, args[++i]);
						}else{
							// Need to create an element
							tag = tag || put.defaultTag;
							var ieInputName = ieCreateElement && args[i +1] && args[i +1].name;
							if(ieInputName){
								// in IE, we have to use the crazy non-standard createElement to create input's that have a name 
								tag = '<' + tag + ' name="' + ieInputName + '">';
							}
							// we swtich between creation methods based on namespace usage
							current = namespaces && ~(namespaceIndex = tag.indexOf('|')) ?
								doc.createElementNS(namespaces[tag.slice(0, namespaceIndex)], tag.slice(namespaceIndex + 1)) : 
								doc.createElement(tag);
						}
					}
					if(prefix){
						if(value == "$"){
							value = args[++i];
						}
						if(prefix == "#"){
							// #id was specified
							current.id = value;
						}else{
							// we are in the className addition and removal branch
							var currentClassName = current.className;
							// remove the className (needed for addition or removal)
							// see http://jsperf.com/remove-class-name-algorithm/2 for some tests on this
							var removed = currentClassName && (" " + currentClassName + " ").replace(" " + value + " ", " ");
							if(prefix == "."){
								// addition, add the className
								current.className = currentClassName ? (removed + value).substring(1) : value;
							}else{
								// else a '!' class removal
								if(argument == "!"){
									var parentNode;
									// special signal to delete this element
									if(ieCreateElement){
										// use the ol' innerHTML trick to get IE to do some cleanup
										put("div", current, '<').innerHTML = "";
									}else if(parentNode = current.parentNode){ // intentional assigment
										// use a faster, and more correct (for namespaced elements) removal (http://jsperf.com/removechild-innerhtml)
										parentNode.removeChild(current);
									}
								}else{
									// we already have removed the class, just need to trim
									removed = removed.substring(1, removed.length - 1);
									// only assign if it changed, this can save a lot of time
									if(removed != currentClassName){
										current.className = removed;
									}
								}
							}
							// CSS class removal
						}
					}
					if(attrName){
						if(attrValue == "$"){
							attrValue = args[++i];
						}
						// [name=value]
						if(attrName == "style"){
							// handle the special case of setAttribute not working in old IE
							current.style.cssText = attrValue;
						}else{
							var method = attrName.charAt(0) == "!" ? (attrName = attrName.substring(1)) && 'removeAttribute' : 'setAttribute';
							attrValue = attrValue === '' ? attrName : attrValue;
							// determine if we need to use a namespace
							namespaces && ~(namespaceIndex = attrName.indexOf('|')) ?
								current[method + "NS"](namespaces[attrName.slice(0, namespaceIndex)], attrName.slice(namespaceIndex + 1), attrValue) :
								current[method](attrName, attrValue);
						}
					}
					return '';
				});
				if(leftoverCharacters){
					throw new SyntaxError("Unexpected char " + leftoverCharacters + " in " + argument);
				}
				insertLastElement();
				referenceElement = returnValue = current || referenceElement;
			}
		}
		if(topReferenceElement && fragment){
			// we now insert the top level elements for the fragment if it exists
			topReferenceElement.appendChild(fragment);
		}
		return returnValue;
	}
	put.addNamespace = function(name, uri){
		if(doc.createElementNS){
			(namespaces || (namespaces = {}))[name] = uri;
		}else{
			// for old IE
			doc.namespaces.add(name, uri);
		}
	};
	put.defaultTag = "div";
	put.forDocument = forDocument;
	return put;
});
})(function(id, deps, factory){
	factory = factory || deps;
	if(typeof define === "function"){
		// AMD loader
		define([], function(){
			return factory();
		});
	}else if(typeof window == "undefined"){
		// server side JavaScript, probably (hopefully) NodeJS
		require("./node-html")(module, factory);
	}else{
		// plain script in a browser
		put = factory();
	}
});
define('xstyle/core/observe', [], function(){
	// An observe function, requires getter/setter support in the target (I9+ for regular objects, IE8+ for DOM nodes)
	var observe = /*Object.observe || */ function(target, property, listener){
		var listenersProperty = '_listeners_' + property;
		var listeners = target[listenersProperty];
		if(!listeners){
			var currentValue = target[property];
			Object.defineProperty(target, property, {
				get: function(){
					return currentValue;
				},
				set: function(value){
					currentValue = value;
					for(var i = 0, l = listeners.length;i < l; i++){
						listeners[i].call(this, value);
					}
				}
			});
			listeners = target[listenersProperty] = [];
		}
		listeners.push(listener);
		// TODO: return handle with remove method
	};
	observe.get = function(target, property, listener){
		listener(target[property]);
		return observe(target, property, listener);
	};
	return observe;
});define("xstyle/core/Rule", ["xstyle/core/expression", "put-selector/put", "xstyle/core/utils"], function(evaluateExpression, put, utils){

	// define the Rule class, our abstraction of a CSS rule		
	var create = Object.create || function(base){
		function Base(){}
		Base.prototype = base;
		return new Base;
	}

	var operatorMatch = {
		'{': '}',
		'[': ']',
		'(': ')'
	};
	var testDiv = put("div");
	function Rule(){}
	Rule.prototype = {
		eachProperty: function(onProperty){
			// iterate through each property on the rule
			var values = this.values || 0;
			for(var i = 0; i < values.length; i++){
				var name = values[i];
				onProperty.call(this, name || 'unnamed', values[name]);
			}
		},
		fullSelector: function(){
			// calculate the full selector, in case this is a nested rule we determine the full selector using parent rules 
			return (this.parent ? this.parent.fullSelector() : "") + (this.selector || "") + " ";  
		},
		newRule: function(name){
			// called by the parser when a new child rule is encountered 
			var rule = (this.rules || (this.rules = {}))[name] = new Rule();
			rule.disabled = this.disabled;
			return rule;
		},
		newCall: function(name, sequence, rule){
			// called by the parser when a function call is encountered
				var call = new Call(name);
				return call; 
			},
		addSheetRule: function(selector, cssText){
			// Used to add a new rule
			if(cssText &&
				selector.charAt(0) != '@'){ // for now just ignore and don't add at-rules
				var styleSheet = this.styleSheet;
				var cssRules = styleSheet.cssRules || styleSheet.rules;
				var ruleNumber = this.ruleIndex > -1 ? this.ruleIndex : cssRules.length;
				styleSheet.addRule(selector, cssText, ruleNumber);
				return cssRules[ruleNumber];
			}
		},
		onRule: function(){
			// called by parser once a rule is finished parsing
			var cssRule = this.getCssRule();
			if(this.installStyles){
				for(var i = 0; i < this.installStyles.length;i++){
					var pair = this.installStyles[i];
					cssRule.style[pair[0]] = pair[1];
				}
			}
		},
		setStyle: function(name, value){
			if(this.cssRule){
				this.cssRule.style[name] = value;
			}/*else if("ruleIndex" in this){
				// TODO: inline this
				this.getCssRule().style[name] = value;
			}*/else{
				(this.installStyles || (this.installStyles = [])).push([name, value]);
			}
		},
		getCssRule: function(){
			if(!this.cssRule){
				this.cssRule =this.addSheetRule(this.selector, this.cssText);
			}
			return this.cssRule;
		},
		get: function(key){
			// TODO: need to add inheritance? or can this be removed
			return this.values[key];
		},
		elements: function(callback){
			var rule = this;
			require(["xstyle/core/elemental"], function(elemental){
				elemental.addRenderer(rule, function(element){
					callback(element);
				});
			});
		},
		declareProperty: function(name, value, conditional){
			// called by the parser when a variable assignment is encountered
			if(this.disabled){
				return;
			}
			if(value.length){
				if(value[0].toString().charAt(0) == '>'){
					// this is used to indicate that generation should be triggered
					if(!name){
						this.generator = value;
						var rule = this;
						require(["xstyle/core/generate", "xstyle/core/elemental"], function(generate, elemental){
							value = generate.forSelector(value, rule);
							elemental.addRenderer(rule, value);
						});
						return;
					}
				}else{
					// add it to the definitions for this rule
					var propertyExists = name in testDiv.style || this.getDefinition(name);
					if(!conditional || !propertyExists){
						var definitions = (this.definitions || (this.definitions = {}));
						var first = value[0];
						if(first.indexOf && first.indexOf(',') > -1){
							// handle multiple values
							var parts = value.join('').split(/\s*,\s*/);
							var definition = [];
							for(var i = 0;i < parts.length; i++){
								definition[i] = evaluateExpression(this, name, parts[i]);
							}
						}
						if(value[0] && value[0].operator == '{'){ // see if it is a rule
							definition = value[0];
						}else if(value[1] && value[1].operator == '{'){
							definition = value[1];
						}
						definitions[name] = definition || evaluateExpression(this, name, value);
						if(propertyExists){
							console.warn('Overriding existing property "' + name + '"');
						}
					}
				}
			}else{
				var definitions = (this.definitions || (this.definitions = {}));
				definitions[name] = value;
			}
		},
		onCall: function(call, name, value){
			var handler = call.ref;
			if(handler && typeof handler.call == 'function'){
				return handler.call(call, this, name, value);
			}
		},
		setValue: function(name, value, scopeRule){
			// called by the parser when a property is encountered
			if(this.disabled){
				// TODO: eventually we need to support reenabling
				return;
			}
			var values = (this.values || (this.values = []));
			values.push(name);
			values[name] = value;
			var calls = value.calls;
			if(calls){
				for(var i = 0; i < calls.length; i++){
					var call = calls[i];
					this.onCall(calls[i], name, value);
				}
			}
			// called when each property is parsed, and this determines if there is a handler for it
			//TODO: delete the property if it one that the browser actually uses
			// this is called for each CSS property
			if(name){
				var propertyName = name;
				do{
					// check for the handler
					var target = (scopeRule || this).getDefinition(name);
					if(target){
						var rule = this;
						return utils.when(target, function(target){
							// call the handler to handle this rule
							target = target.splice ? target : [target];
							for(var i = 0; i < target.length; i++){
								var segment = target[i];
								var returned;
								utils.when(segment, function(segment){
									returned = segment.put && segment.put(value, rule, propertyName);
								});
								if(returned){
									return returned;
								}
							}
						});
					}
					// we progressively go through parent property names. For example if the 
					// property name is foo-bar-baz, it first checks for foo-bar-baz, then 
					// foo-bar, then foo
					name = name.substring(0, name.lastIndexOf("-"));
					// try shorter name
				}while(name);
			}
		},
		put: function(value, rule){
			// rules can be used as properties, in which case they act as mixins
			// first extend
			this.extend(rule);
			if(value == 'defaults'){
				// this indicates that we should leave the mixin properties as is.
				return;
			}
			if(value && typeof value == 'string' && this.values){
				// then apply properties with comma delimiting
				var parts = value.toString().split(/,\s*/);
				for(var i = 0; i < parts.length; i++){
					// TODO: take the last part and don't split on spaces
					var name = this.values[i];
					name && rule.setValue(name, parts[i], this);
				}
			}
		},
		extend: function(derivative, fullExtension){
			// we might consider removing this if it is only used from put
			var base = this;
			var newText = base.cssText;
			if(derivative.cssRule){
				// already have a rule, we use a different mechanism here
				var baseStyle = base.cssRule.style;
				var derivativeStyle = derivative.cssRule.style;
				var inheritedStyles = derivative.inheritedStyles || (derivative.inheritedStyles = {});
				// now we iterate through the defined style properties, and copy them to the derivitative
				for(var i = 0; i < baseStyle.length; i++){
					var name = baseStyle[i];
					// if the derivative has a style, we assume it is set in the derivative rule. If we 
					// inherit a rule, we have to mark it as inherited so higher precedence rules
					// can override it without thinking it came from the derivative. 
					if(!derivativeStyle[name] || inheritedStyles[name]){
						derivativeStyle[name] = baseStyle[name];
						inheritedStyles[name] = true;
					}
				}
			}else{
				derivative.cssText += newText;
			}
			'values,variables,calls'.replace(/\w+/g, function(property){
				var set = base[property];
				if(set){
					// TODO: need to mixin this in, if it already exists
					derivative[property] = create(set);
				}
			});
			if(fullExtension){
				var definitions = base.definitions;
				if(definitions){
					// TODO: need to mixin this in, if it already exists
					derivative.definitions = create(definitions);
				}
				derivative.tagName = base.tagName || derivative.tagName;
			}
			derivative.base = base;
			
	//		var ruleStyle = derivative.getCssRule().style;
			base.eachProperty(function(name, value){
				derivative.setValue(name, value);
		/*		if(name){
					name = convertCssNameToJs(name);
					if(!ruleStyle[name]){
						ruleStyle[name] = value;
					}
				}*/
			});
			if(base.generator){
				derivative.declareProperty(null, base.generator);
			}
			
		},
		getDefinition: function(name, searchRules){
			// lookup a definition by name, which used for handling properties and other thingsss
			var parentRule = this;
			do{
				var target = parentRule.definitions && parentRule.definitions[name] ||
					(searchRules && parentRule.rules && parentRule.rules[name]);
				parentRule = parentRule.parent;
			}while(!target && parentRule);
			return target;
		},
		appendTo: function(target, beforeElement){
			return put(beforeElement || target, (beforeElement ? '-' : '') + (this.tagName || 'span') + (this.selector || ''));
		},
		cssText: ""
	};
	// a class representing function calls
	function Call(value){
		// we store the caller and the arguments
		this.caller = value;
		this.args = [];
	}
	var CallPrototype = Call.prototype = new Rule;
	CallPrototype.declareProperty = CallPrototype.setValue = function(name, value){
		// handle these both as addition of arguments
		this.args.push(value);
	};
	CallPrototype.toString = function(){
		var operator = this.operator;
		return operator + this.args + operatorMatch[operator]; 
	};
	return Rule;
});define("xstyle/core/expression", ["xstyle/core/utils"], function(utils){
	// handles the creation of reactive expressions
	var jsKeywords = {
		'true': true, 'false': false, 'null': 'null', 'typeof': 'typeof', or: '||', and: '&&'
	};
	var nextId = 1;
	function get(target, path, callback){
		return utils.when(target, function(target){
			var name = path[0];
			if(!target){
				return callback(name || target);
			}
			if(name && target.get){
				return get(target.get(name), path.slice(1), callback);
			}
			if(target.receive){
				return target.receive(name ? function(value){
					get(value, path, callback);
				} : callback);
			}
			if(name){
				return get(target[name], path.slice(1), callback);
			}
			return callback(target);
		});
	}
	function set(target, path, value){
		get(target, path.slice(0, path.length - 1), function(target){
			var property = path[path.length - 1];
			target.set ?
				target.set(property, value) :
				target[property] = value;
		});
	}
	return function(rule, name, value){
		// evaluate a binding
		var binding = rule["var-expr-" + name];
		if(variables){
			return binding;
		}
		var variables = [], isElementDependent;
		variables.id = nextId++;
		var target, parameters = [], id = 0, callbacks = [],
			attributeParts, expression = value.join ? value.join("") : value.toString(),
			simpleExpression = expression.match(/^[\w_$\/\.-]*$/); 
		// Do the parsing and function creation just once, and adapt the dependencies for the element at creation time
		// deal with an array, converting strings to JS-eval'able strings
			// find all the variables in the expression
		expression = expression.replace(/("[^\"]*")|([\w_$\.\/-]+)/g, function(t, string, variable){
			if(variable){
				if(jsKeywords.hasOwnProperty(variable)){
					return jsKeywords[variable];
				}
				// for each reference, we break apart into variable reference and property references after each dot				
				attributeParts = variable.split('/');
				var parameterName = attributeParts.join('_').replace(/-/g,'_');
				parameters.push(parameterName);
				variables.push(attributeParts);
				// first find the rule that is being referenced
				var firstReference = attributeParts[0];
				var target = rule.getDefinition(firstReference);
				if(typeof target == 'string' || target instanceof Array){
					target = evaluateExpression(rule, firstReference, target);
				}else if(!target){
					throw new Error('Could not find reference "' + firstReference + '"');					
				}
				if(target.forElement){
					isElementDependent = true;
				}
				attributeParts[0] = target;
				// we will reference the variable a function argument in the function we will create
				return parameterName;
			}
			return t;
		})
	
		if(simpleExpression){
			// a direct reversible reference
			// no forward reactive needed
			if(name){
				// create the reverse function
				var reversal = function(element, name, value){
					utils.when(findAttributeInAncestors(element, attributeParts[0], attributeParts[1]), function(target){
						for(var i = 2; i < attributeParts.length -1; i++){
							var name = attributeParts[i];
							target = target.get ?
								target.get(name) :
								target[name];
						}
						var name = attributeParts[i];
						if(target.set){
							target.set(name, value);
						}else{
							target[name] = value;
						}
					});
				};
				reversal.rule = rule;
//				(reversalOfAttributes[name] || (reversalOfAttributes[name] = [])).push(reversal);
			}
		}else{
			// it's a full expression, so we create a time-varying bound function with the expression
			var reactiveFunction = Function.apply(this, parameters.concat(['return (' + expression + ')']));
		}
		variables.func = reactiveFunction;
		rule["var-expr-" + name] = variables;
		function getComputation(){
			var waiting = variables.length + 1;
			var values = [], callbacks = [];
			var result, isResolved, stopped;
			var done = function(i){
				return function(value){
					if(stopped){
						return;
					}
					values[i] = value;
					waiting--;
					if(waiting <= 0){
						isResolved = true;
						result = reactiveFunction ? reactiveFunction.apply(this, values) : values[0];
						for(var j = 0; j < callbacks.length;j++){
							callbacks[j](result);
						}
					}
				};
			};
			if(reactiveFunction){
				for(var i = 0; i < variables.length; i++){
					var variable = variables[i];
					get(variable[0], variable.slice(1), done(i));
				}
			}else{
				var variable = variables[0];
				var value = {
					then: function(callback){
						callbacks ? 
							callbacks.push(callback) :
							callback(value); // immediately available
					}
				}
				utils.when(variable[0], function(resolved){
					value = resolved;
					for(var j = 1; j < variable.length; j++){
						if(value && value.get){
							value = value.get(variable[j]);
						}else{
							value = {
								receive: function(callback){
									get(resolved, variable.slice(1), callback);
								},
								put: function(value){
									set(resolved, variable.slice(1), value);
								}
							};
							break;
						}
					}
					for(var j = 0; j < callbacks.length; j++){
						callbacks[j](value);
					}
					// accept no more callbacks, since we have resolved
					callbacks = null;
				});
				return value;
				if(first && first.then){
					return {
						then: function(callback){
							get(variable[0], variable.slice(1), callback);
						}
					};
				}else{
					return variable;
				}
			}
			done(-1)();
			if(result && result.then){
				return result;
			}
			return {
				receive: function(callback){
					if(callbacks){
						callbacks.push(callback);
					}
					if(isResolved){
						callback(result);
					}
				},
				stop: function(){
					// TODO: this is not the right way to do this, we need to remove
					// all the variable listeners and properly destroy this
					stopped = true;
				}
			}
		}
		return rule["var-expr-" + name] = isElementDependent ? {
			forElement: function(element){
				// TODO: at some point may make this async
				var callbacks = [];
				var mostSpecificElement;
				var elementVariables = [];
				// now find the element that matches that rule, in case we are dealing with a child
				var parentElement;
				for(var i = 0; i < variables.length; i++){
					var variable = variables[i];
					var target = variable[0];
					// now find the element that is keyed on
					if(target.forElement){
						target = variable[0] = target.forElement(element, variable.length == 1);
					}
					// we need to find the most parent element that we need to vary on for this computation 
					var varyOnElement = parentElement = target.element;
					if(mostSpecificElement){
						// check to see if one its parent is the mostSpecificElement
						while(parentElement && parentElement != mostSpecificElement){
							parentElement = parentElement.parentNode;
						}
						// if so, we have a new most specific
					}	
					if(parentElement){
						mostSpecificElement = varyOnElement;
					}
				}
				// make sure we indicate the store we are keying off of
				var computation = mostSpecificElement["expr-result-" + variables.id];
				if(!computation){
					mostSpecificElement["expr-result-" + variables.id] = computation = getComputation();
					computation.element = mostSpecificElement;
				}
				return computation;
			}
		} : getComputation();
	}
	
});define("xstyle/core/generate", [
	"xstyle/core/elemental",
	"put-selector/put",
	"xstyle/core/utils",
	"xstyle/core/expression",
	"xstyle/core/base",
	"xstyle/core/observe"],
		function(elemental, put, utils, evaluateExpression, root, observe){
	// this module is responsible for generating elements with xstyle's element generation
	// syntax and handling data bindings
	// selection of default children for given elements
	var nextId = 0;
	var childTagForParent = {
		"TABLE": "tr",
		"TBODY": "tr",
		"TR": "td",
		"UL": "li",
		"OL": "li",
		"SELECT": "option"
	};
	var inputs = {
		"INPUT": 1,
		"TEXTAREA": 1,
		"SELECT": 1
	};
	function receive(target, callback, rule, name){
		if(target && target.receive){
			target.receive(callback, rule, name);
		}else{
			callback(target);
		}
	}
	var doc = document;	
	function forSelector(generatingSelector, rule){
		// this is responsible for generation of DOM elements for elements matching generative rules
		var id = nextId++;
		// normalize to array
		generatingSelector = generatingSelector.sort ? generatingSelector : [generatingSelector];
		// return a function that can do the generation for each element that matches
		return function(element, item, beforeElement){
			var lastElement = element;
			var subId = 0;
			element._defaultBinding = false;
			if(element._contentNode){
				// if we are rendering on a node that has already been rendered with a content
				// node, we need to nest inside that
				element = element._contentNode;
			}else{
				if(beforeElement === undefined){
					var childNodes = element.childNodes;
					var childNode = childNodes[0], contentFragment;
					// move the children out and record the contents in a fragment
					if(childNode){
						contentFragment = doc.createDocumentFragment();
						do{
							contentFragment.appendChild(childNode);
						}while(childNode = childNodes[0]);
					}
				}
				// temporarily store it on the element, so it can be accessed as an element-property
				// TODO: remove it after completion
				element.content = contentFragment;
			}
			var indentationLevel = 0;
			var indentationLevels = [element];
			for(var i = 0, l = generatingSelector.length;i < l; i++){
				// go through each part in the selector/generation sequence
				var lastPart = part,
					part = generatingSelector[i];
				try{
					if(part.eachProperty){
						// it's a rule or call
						if(part.args){
							if(part.operator == '('){ // a call (or at least parans), for now we are assuming it is a binding
								var nextPart = generatingSelector[i+1];
								if(nextPart && nextPart.eachProperty){
									// apply the class for the next part so we can reference it properly
									put(lastElement, nextPart.selector);
								}
								// TODO: make sure we only do this only once
								var expression = part.args.toString();
								var apply = evaluateExpression(part.parent, 0, expression);
								
								(function(element, nextPart){
									utils.when(apply, function(apply){
										// TODO: assess how we could propagate changes categorically
										if(apply.forElement){
											apply = apply.forElement(element);
											// now apply.element should indicate the element that it is actually keying or varying on
										}
										receive(apply, function(value){
											element.content = value;
										}, rule, expression);
									});
									if(!('_defaultBinding' in element)){
										// if we don't have any handle for content yet, we install this default handling
										element._defaultBinding = true;
										var textNode = element.appendChild(doc.createTextNode("Loading"));
										observe.get(element, 'content', function(value){
											if(element._defaultBinding){ // the default binding can later be disabled
												if(value && value.sort){
													if(textNode){
														// remove the loading node
														textNode.parentNode.removeChild(textNode);
														textNode = null;
													}
													if(value.isSequence){
														generate(value, part.parent)(element, item, beforeElement);
													}else{
														element.innerHTML = '';
														// if it is an array, we do iterative rendering
														var eachHandler = nextPart && nextPart.eachProperty && nextPart.each;
														// if "each" is defined, we will use it render each item 
														if(eachHandler){
															eachHandler = generate(eachHandler, nextPart);
														}else{
															eachHandler = function(element, value, beforeElement){
																// if there no each handler, we use the default tag name for the parent 
																return put(beforeElement || element, (beforeElement ? '-' : '') + (childTagForParent[element.tagName] || 'span'), '' + value);
															}
														}
														var rows = value.map(function(value){
															// TODO: do this inside generate
															return eachHandler(element, value, null);
														});
														if(value.observe){
															value.observe(function(object, previousIndex, newIndex){
																if(previousIndex > -1){
																	var oldElement = rows[previousIndex];
																	oldElement.parentNode.removeChild(oldElement);
																	rows.splice(previousIndex, 1);
																}
																if(newIndex > -1){
																	rows.splice(newIndex, 0, eachHandler(element, object, rows[newIndex] || null));
																}
															}, true);
														}
													}
												}else if(value && value.nodeType){
													if(textNode){
														// remove the loading node
														textNode.parentNode.removeChild(textNode);
														textNode = null;
													}
													element.appendChild(value);
												}else{
													value = value === undefined ? '' : value;
													if(element.tagName in inputs){
														// add the text
														element.value = value;
														// we are going to store the variable computation on the element
														// so that on a change we can quickly do a put on it
														// we might want to consider changing that in the future, to
														// reduce memory, but for now this probably has minimal cost
														element['-x-variable'] = apply; 
													}else{
														// put text in for Loading until we are ready
														// TODO: we should do this after setting up the receive in case we synchronously get the data 
														// if not an array, render as plain text
														textNode.nodeValue = value;
													}
												}
											}
										});
									}
								})(lastElement, nextPart);
							}else{// brackets
								put(lastElement, part.toString());
							}
						}else{
							// it is plain rule (not a call), we need to apply the auto-generated selector, so CSS is properly applied
							put(lastElement, part.selector);
							// do any elemental updates
							elemental.update(lastElement, part.selector);
						}
					}else if(typeof part == 'string'){
						// actual CSS selector syntax, we generate the elements specified
						if(part.charAt(0) == '='){
							part = part.slice(1); // remove the '=' at the beginning					
						}
				
						// TODO: inline our own put-selector code, and handle bindings
/*								child = child.replace(/\([^)]*\)/, function(expression){
									reference = expression;
								});
								/*if(!/^\w/.test(child)){
									// if it could be interpreted as a modifier, make sure we change it to really create a new element
									child = '>' + child;
								}*/
						var nextElement = lastElement;
						var nextPart = generatingSelector[i + 1];
						// parse for the sections of the selector
						var parts = [];
						part.replace(/([,\n]+)?([\t ]+)?(\.|#)?([-\w%$|\.\#]+)(?:\[([^\]=]+)=?['"]?([^\]'"]*)['"]?\])?/g, function(){
							parts.push(arguments);
						});
						// now iterate over these
						for(var j = 0;j < parts.length; j++){
							(function(t, nextLine, indentation, prefix, value, attrName, attrValue){
								if(indentation){
									if(nextLine){
										var newIndentationLevel = indentation.length;
										if(newIndentationLevel > indentationLevel){
											// a new child
											indentationLevels[newIndentationLevel] = nextElement;
										}else{
											// returning to an existing parent
											nextElement = indentationLevels[newIndentationLevel] || nextElement;
										}
										indentationLevel = newIndentationLevel;
									}
	//								nextElement = element;
								}
								nextElement = nextElement._contentNode || nextElement;
								var selector;
								if(prefix){// we don't want to modify the current element, we need to create a new one
										selector = (lastPart && lastPart.args ?
											'' : // if the last part was brackets or a call, we can continue modifying the same element
											'span') + prefix + value;
								}else{
									var tagName = value.match(/^[-\w]+/)[0];
									var target = rule.getDefinition(tagName);
									// see if we have a definition for the element
									if(target && target.appendTo){
										nextElement = target.appendTo(nextElement, beforeElement);
										// apply the rest of the selector
										value = value.slice(tagName.length);
										if(value){
											put(nextElement, value);
										}
									}else{
										selector = value;
									}
								}
								if(selector){
									nextElement = put(beforeElement || nextElement, (beforeElement ? '-' : '') + selector);
								}
								beforeElement = null;
								if(attrName){
									attrValue = attrValue === '' ? attrName : attrValue;
									nextElement.setAttribute(attrName, attrValue);
								}
								if(item){
									// set the item property, so the item reference will work
									nextElement.item = item;
								}
								if(j < parts.length - 1 || (nextElement != lastElement && nextElement != element &&// avoid infinite loop if it is a nop selector
									(!nextPart || !nextPart.base) // if the next part is a rule, than it should be extending it already, so we don't want to double apply
									)){
									elemental.update(nextElement);
								}
								lastElement = nextElement;
							}).apply(this, parts[j]);
						}
					}else{
						// a string literal
						lastElement.appendChild(doc.createTextNode(part.value));
					}
				}catch(e){
					console.error(e, e.stack);
					lastElement.appendChild(doc.createTextNode(e));
				}
			}
			return lastElement;
		}
	}
	function generate(parentElement, selector){
		return forSelector(selector, root)(parentElement);
	}
	generate.forSelector = forSelector;
	return generate;
});define("xstyle/core/elemental", ["put-selector/put"], function(put){
	// using delegation, listen for any input changes in the document and "put" the value  
	// TODO: add a hook so one could add support for IE8, or maybe this event delegation isn't really that useful
	var doc = document;
	var nextId = 1;
	var hasAddEventListener = !!doc.addEventListener;
	on(doc, 'change', null, function(event){
		var element = event.target;
		// get the variable computation so we can put the value
		var variable = element['-x-variable'];
		if(variable && variable.put){ // if it can be put, we do so
			variable.put(element.value);
		}
	});
	function on(target, event, selector, listener){
		// this function can be overriden to provide better event handling
		hasAddEventListener ? 
			target.addEventListener(event, select, false) :
			target.attachEvent(event, select);
		function select(event){
			// do event delegation
			if(!selector || matchesSelector.call(event.target, selector)){
				listener(event);	
			}
		}
	}

	// elemental section, this code is for property handlers that need to mutate the DOM for elements
	// that match it's rule
	var testDiv = doc.createElement("div");
	var features = {
		"dom-qsa2.1": !!testDiv.querySelectorAll
	};
	function has(feature){
		return features[feature];
	}
	// get the matches function, whatever it is called in this browser	
	var matchesSelector = testDiv.matches || testDiv.matchesSelector || testDiv.webkitMatchesSelector || testDiv.mozMatchesSelector || testDiv.msMatchesSelector || testDiv.oMatchesSelector;
	var selectorRenderers = [];
	var classHash = {}, propertyHash = {};
	var renderQueue = [];
	var documentQueried;
	// probably want to inline our own DOM readiness code
	function domReady(callback){
		// TODO: support IE7-8
		if(/e/.test(doc.readyState||'')){
			// TODO: fix the issues with sync so this can be run immediately
			setTimeout(callback, 200);
		}else{
			doc.addEventListener("DOMContentLoaded", callback);
		}
	}
	domReady(function(){
		if(!documentQueried){
			documentQueried = true;
			if(has("dom-qsa2.1")){
				// if we have a query engine, it is fastest to use that
				for(var i = 0, l = selectorRenderers.length; i < l; i++){
					// find the matches and register the renderers
					findMatches(selectorRenderers[i]);
				}
				// render all the elements that are queued up
				renderWaiting();
			}else{
			//else rely on css expressions (or maybe we should use document.all and just scan everything)
				var all = doc.all;
				for(var i = 0, l = all.length; i < l; i++){
					update(all[i]);
				}
			}
		}
	});
	function findMatches(renderer){
		// find the elements for a given selector and apply the renderers to it
		var toRender = [];
		var results = doc.querySelectorAll(renderer.selector);
		var name = renderer.name;
		for(var i = 0, l = results.length; i < l; i++){
			var element = results[i];
			var currentStyle = element.elementalStyle;
			var currentSpecificities = element.elementalSpecificities;
			if(!currentStyle){
				currentStyle = element.elementalStyle = {};
				currentSpecificities = element.elementalSpecificities = {};
			}
			// TODO: only override if the selector is equal or higher specificity
			// var specificity = renderer.selector.match(/ /).length;
			if(true || currentSpecificities[name] <= renderer.specificity){ // only process changes
				var elementRenderings = element.renderings;
				if(!elementRenderings){
					// put it in the queue
					elementRenderings = element.renderings = [];
					renderQueue.push(element);
				}
				
				elementRenderings.push({
					name: name,
					rendered: currentStyle[name] == renderer.propertyValue,
					renderer: renderer
				});
				currentStyle[name] = renderer.propertyValue;
			} 
		}
		
	}
	var isCurrent;
	function renderWaiting(){
		// render all the elements in the queue to be rendered
		for(var i = 0; i < renderQueue.length; i++){
			var element = renderQueue[i];
			var renderings = element.renderings, currentStyle = element.elementalStyle;
			delete element.renderings;
			for(var j = 0; j < renderings.length; j++){
				var rendering = renderings[j];
				var renderer = rendering.renderer;
				var rendered = renderer.rendered;
				isCurrent = currentStyle[rendering.name] == renderer.propertyValue; // determine if this renderer matches the current computed style
				if(!rendered && isCurrent){
					try{
						renderer.render(element);
					}catch(e){
						console.error(e, e.stack);
						put(element, "div.error", e.toString());
					}
				}
				if(rendered && !isCurrent && renderer.unrender){
					renderer.unrender(element);
					renderings.splice(j--, 1); // TODO: need to remove duplicate rendered items as well
				}
			}
		}
		renderQueue = [];
	}
	function apply(element, renderers){
		// an element was found that matches a selector, so we apply the renderers
		for(var i = 0, l = renderers.length; i < l; i++){
			renderers[i](element);
		}
	}
	function update(element, selector){
	/* At some point, might want to use getMatchedCSSRules for faster access to matching rules 			
	 	if(typeof getMatchedCSSRules != "undefined"){
			// webkit gives us fast access to which rules apply
			getMatchedCSSRules(element);
		}else{*/
			for(var i = 0, l = selectorRenderers.length; i < l; i++){
			var renderer = selectorRenderers[i];
			if((!selector || (selector == renderer.selector)) &&
				(matchesSelector ?
					// use matchesSelector if available
					matchesSelector.call(element, renderer.selector) : // TODO: determine if it is higher specificity that other  same name properties
					// else use IE's custom css property inheritance mechanism
					element.currentStyle[renderer.id])){
				renderer.render(element);
			}
		}
	}
	return {
		ready: domReady,
		on: on,
		addRenderer: function(rule, handler){
			var renderer = {
				selector: rule.selector,
				render: handler
			};
			if(!matchesSelector){
				// so we can match this rule by checking inherited styles
				rule.setStyle(renderer.id = ('x' + nextId++), 'true'); 
			}
			// the main entry point for adding elemental handlers for a selector. The handler
			// will be called for each element that is created that matches a given selector
			selectorRenderers.push(renderer);
			if(documentQueried){
				findMatches(renderer);
			}
			renderWaiting();
			/*if(!matchesSelector){
				// create a custom property to identify this rule in created elements
				return (renderers.triggerProperty = 'selector_' + encodeURIComponent(selector).replace(/%/g, '/')) + ': 1;' +
					(document.querySelectorAll ? '' : 
						// we use css expressions for IE6-7 to find new elements that match the selector, since qSA is not available, wonder if it is better to just use document.all...
						 'zoom: expression(cssxRegister(this,"' + selector +'"));');
			}*/
		},
		update: update, // this should be called for newly created dynamic elements to ensure the proper rules are applied
		clearRenderers: function(){
			// clears all the renderers in use
			selectorRenderers = [];
		}
	};
});define("xstyle/core/base", ["xstyle/core/elemental", "xstyle/core/expression", "xstyle/core/utils", "put-selector/put", "xstyle/core/Rule", "xstyle/core/observe"], 
function(elemental, evaluateExpression, utils, put, Rule, observe){
	// this module defines the base definitions intrisincally available in xstyle stylesheets
	var truthyConversion = {
		'': 0,
		'false': 0,
		'true': 1
	};
	var styleSubstitutes = {
		display: ['none',''],
		visibility: ['hidden', 'visible'],
		'float': ['none', 'left']
	};
	var testDiv = put("div");
	var ua = navigator.userAgent;
	var vendorPrefix = ua.indexOf("WebKit") > -1 ? "-webkit-" :
		ua.indexOf("Firefox") > -1 ? "-moz-" :
		ua.indexOf("MSIE") > -1 ? "-ms-" :
		ua.indexOf("Opera") > -1 ? "-o-" : "";
	// we treat the stylesheet as a "root" rule; all normal rules are children of it
	var target, root = new Rule;
	root.root = true;
	function elementProperty(property, appendTo){
		// definition bound to an element's property
		// TODO: allow it be bound to other names, and use prefixing to not collide with element names
		return {
			forElement: function(element, directReference){
				var contentElement = element;
				if(appendTo){
					// content needs to start at the parent
					element = element.parentNode;
				}
				// we find the parent element with an item property, and key off of that 
				while(!(property in element)){
					element = element.parentNode;
					if(!element){
						throw new Error(property + " not found");
					}
				}
				// provide a means for being able to reference the target node,
				// this primarily used by the generate model to nest content properly
				if(directReference){
					element['_' + property + 'Node'] = contentElement;
				} 
				return {
					element: element, // indicates the key element
					receive: function(callback, rule){// handle requests for the data
						observe.get(property in element ? element : rule, property, callback);
					},
					appendTo: appendTo
				};
			},
			put: function(value, rule){
				rule[property] = value;
			}
		};
	}
	// the root has it's own intrinsic variables that provide important base and bootstrapping functionality 
	root.definitions = {
		Math: Math, // just useful
		module: function(mid, lazy){
			// require calls can be used to load in data in
			if(!lazy){
				require([mid]);
			}
			return {
				then: function(callback){
					require([mid], callback);
				}
			};
		},
		// TODO: add url()
		// adds support for referencing each item in a list of items when rendering arrays 
		item: elementProperty('item'),
		// adds referencing to the prior contents of an element
		content: elementProperty('content', function(target){
			target.appendChild(this.element);
		}),
		element: {
			// definition to reference the actual element
			forElement: function(element){
				return {
					element: element, // indicates the key element
					receive: function(callback){// handle requests for the data
						callback(element);
					},
					get: function(property){
						return this.element[property];
					}
				};				
			}
		},
		event: {
			receive: function(callback){
				callback(currentEvent);
			}
		},
		each: {
			put: function(value, rule, name){
				rule.each = value;
			}
		},
		prefix: {
			put: function(value, rule, name){
				// add a vendor prefix
				// check to see if the browser supports this feature through vendor prefixing
				if(typeof testDiv.style[vendorPrefix + name] == "string"){
					// if so, handle the prefixing right here
					// TODO: switch to using getCssRule, but make sure we have it fixed first
					rule.setStyle(vendorPrefix + name, value);
					return true;
				}
			}
		},
		// provides CSS variable support
		'var': {
			// setting the variables
			put: function(value, rule, name){
				(rule.variables || (rule.variables = {}))[name] = value;
				// TODO: can we reuse something for this?
				var variableListeners = rule.variableListeners;
				variableListeners = variableListeners && variableListeners[name] || 0;
				for(var i = 0;i < variableListeners.length;i++){
					variableListeners[i](value);
				}
			},
			// referencing variables
			call: function(call, rule, name, value){
				this.receive(function(resolvedValue){
					var resolved = value.toString().replace(/var\([^)]+\)/g, resolvedValue);
					// now check if the value if we should do subsitution for truthy values
					var truthy = truthyConversion[resolved];
					if(truthy > -1){
						var substitutes = styleSubstitutes[name];
						if(substitutes){
							resolved = substitutes[truthy];
						}
					}
					rule.setStyle(name, resolved);
				}, rule, call.args[0]);
			},
			// variable properties can also be referenced in property expressions
			receive: function(callback, rule, name){
				var parentRule = rule;
				do{
					var target = parentRule.variables && parentRule.variables[name] || 
						(parentRule.definitions && parentRule.definitions[name]); // we can reference definitions as well
					if(target){
						if(target.receive){
							// if it has its own receive capabilities, use that
							return target.receive(callback, rule, name);
						}
						var variableListeners = parentRule.variableListeners || (parentRule.variableListeners = {});
						(variableListeners[name] || (variableListeners[name] = [])).push(callback);
						return callback(target);
					}
					parentRule = parentRule.parent;
				}while(parentRule);
				callback();
			}
		},
		'extends': {
			call: function(call, rule){
				// TODO: this is duplicated in the parser, should consolidate
				var args = call.args;
				for(var i = 0; i < args.length; i++){ // TODO: merge possible promises
					return utils.extend(rule, args[i], console.error);
				}
			}
		},
		on: {
			put: function(value, rule, name){
				// add listener
				elemental.on(document, name.slice(3), rule.selector, function(event){
					currentEvent = event;
					var computation = evaluateExpression(rule, name, value);
					if(computation.forElement){
						computation = computation.forElement(event.target);
					}
					computation && computation.stop && computation.stop();
					currentEvent = null;
				});
			}
		},
		'@supports': {
			selector: function(rule){
				function evaluateSupport(expression){
					var parsed;
					if(parsed = expression.match(/^\s*not(.*)/)){
						return !evaluateSupport(parsed[1]);
					}
					if(parsed = expression.match(/\((.*)\)/)){
						return evaluateSupport(parsed[1]);
					}
					if(parsed = expression.match(/([^:]*):(.*)/)){
						// test for support for a property
						var name = utils.convertCssNameToJs(parsed[1]);
						var value = testDiv.style[name] = parsed[2];
						return testDiv.style[name] == value;
					}
					if(parsed = expression.match(/\w+\[(.*)=(.*)\]/)){
						// test for attribute support
						return put(parsed[0])[parsed[1]] == parsed[2];
					}
					if(parsed = expression.match(/\w+/)){
						// test for attribute support
						return utils.isTagSupported(parsed);
					}
					throw new Error("can't parse @supports string");
				}
				
				if(evaluateSupport(rule.selector.slice(10))){
				rule.selector = '';
				}else{
					rule.disabled = true;
				}
			}
		}
	};
	return root;
});define("xstyle/core/parser", ["xstyle/core/utils"], function(utils){
	// regular expressions used to parse CSS
	var singleQuoteScan = /((?:\\.|[^'])*)'/g;
	var doubleQuoteScan = /((?:\\.|[^"])*)"/g;
	var commentScan = /\/\*[\w\W]*?\*\//g; // preserve carriage returns to retain line numbering once we do line based error reporting 
	var operatorMatch = {
		'{': '}',
		'[': ']',
		'(': ')'
	};
	var nextId = 0;
	var trim = ''.trim ? function (str){
		return str.trim();
	} : function(str){
		return str.replace(/^\s+|\s+$/g, '');
	};
	
	function Sequence(){
		this.push.apply(this, arguments);
	}
	var SequencePrototype = Sequence.prototype = [];
	SequencePrototype.toString = function(){
		return this.join('');
	};
	SequencePrototype.isSequence = true;
	function LiteralString(string){
		this.value = string;
	}
	LiteralString.prototype.toString = function(){
		return '"' + this.value.replace(/["\\\n\r]/g, '\\$&') + '"';
	}
	
	function parse(model, textToParse, styleSheet){
		var mainScan;
		var cssScan = mainScan = /(\s*)((?:[^{\}\[\]\(\)\\'":=;]|\[(?:[^\]'"]|'(?:\\.|[^'])*'|"(?:\\.|[^"])*")\])*)([=:]\??\s*([^{\}\[\]\(\)\\'":;]*))?(?:([{\}\[\]\(\)\\'":;])(\/\d+)?|$)/g;
									// name: value 	operator
		// tracks the stack of rules as they get nested
		var stack = [model];
		var ruleMap = {};
		model.parse = parseSheet;
		parseSheet(textToParse, styleSheet);
		function parseSheet(textToParse, styleSheet){
			// parse the CSS, finding each rule
			textToParse = textToParse.replace(commentScan, function(comment){
				// keep the line returns for proper line attribution in errors
				return comment.replace(/[^\n]/g, '');
			});
			function resumeOnComplete(promise){
				continuing = false;
				var lastIndex = cssScan.lastIndex;
				promise.then(function(){
					continuing = true;
					if(nextTurn){
						cssScan.lastIndex = lastIndex;
						resume();
					}
				});
				var nextTurn = true;
			}
			var target = model; // start at root
			cssScan.lastIndex = 0; // start at zero
			var continuing;
			var ruleIndex = 0, browserUnderstoodRule = true, selector = '', assignNextName = true;
			resume();
			function resume(){
				function addInSequence(operand){
					if(operand && typeof operand == 'string' && whitespace){
						operand = whitespace + operand; 
					}
					if(sequence){
						// we had a string so we are accumulated sequences now
						sequence.push ?
							typeof sequence[sequence.length - 1] == 'string' && typeof operand == 'string' ?
								sequence[sequence.length - 1] += operand : // just append the string to last segment
								operand && sequence.push(operand) : // add to the sequence
							typeof sequence == 'string' && typeof operand == 'string' ?
								sequence += operand : // keep appending to the string
								sequence = new Sequence(sequence, operand); // start a new sequence array
					}else{
						sequence = operand;
					}
				}
				continuing = true;
				while(continuing){
					// parse the next block in the CSS
					// we could perhaps use a simplified regex when we are in a property value 
					var match = cssScan.exec(textToParse);
					// the next block is parsed into several parts that comprise some operands and an operator
					if(!match){
						// done
						return;
					}
					var operator = match[5],
						whitespace = match[1],
						first = match[2],
						assignment = match[3],
						value = match[4],
						assignmentOperator, name, sequence,
						conditionalAssignment;
					value = value && trim(value);
					
					first = first && trim(first);
					if(assignNextName){
						// we are at the beginning of a new property
						if(assignment){
							// remember the name, so can assign to it
							name = first;
							//	selector = match[1] + assignment;
							// remember the operator (could be ':' for a property assignment or '=' for a property declaration)
							assignmentOperator = assignment.charAt(0);
							conditionalAssignment = assignment.charAt(1) == '?';
							if(assignment.indexOf('\n') > -1){
								// need to preserve whitespace if there is a return
								value = assignment.slice(1);
							}
						}else{
							value = first;
						}
						// store in the sequence, the sequence can contain values from multiple rounds of parsing
						sequence = value;
						// we have the assigned property name now, and don't need to assign again
						assignNextName = false;
					}else{
						// subsequent part of a property
						value = assignment ? first + assignment : first;
						// add to the current sequence
						addInSequence(value);	
					}
					if(operator != '{'){
						selector += match[0];
					}
					switch(operator){
						case "'": case '"':
							// encountered a quoted string, parse through to the end of the string and add to the current sequence
							var quoteScan = operator == "'" ? singleQuoteScan : doubleQuoteScan;
							quoteScan.lastIndex = cssScan.lastIndex; // find our current location in the parsing
							var parsed = quoteScan.exec(textToParse);
							if(!parsed){ // no match for the end of the string
								error("unterminated string");
							}
							var str = parsed[1]; // the contents of the string
							// move the css parser up to the end of the string position
							cssScan.lastIndex = quoteScan.lastIndex; 
							// push the string on the current value and keep parsing
							addInSequence(new LiteralString(str));
							selector += parsed[0];
							continue;
						case '\\':
							// escaping
							var lastIndex = quoteScan.lastIndex++;
							// add the escaped character to the sequence
							addInSequence(textToParse.charAt(lastIndex));
							continue;
						case '(': case '{': case '[':
							// encountered a new contents of a rule or a function call
							var newTarget;
							var doExtend = false;
							if(operator == '{'){
								// it's a rule
								assignNextName = true; // enter into the beginning of property mode
								// normalize the selector
								if(assignmentOperator == ':' && assignment){
									first += assignment;
								}
								selector = trim((selector + first).replace(/\s+/g, ' ').replace(/([\.#:])\S+|\w+/g,function(t, operator){
									// make tag names be lower case 
									return operator ? t : t.toLowerCase();
								}));
								// check to see if it is a correlator rule, from the build process
								// add this new rule to the current parent rule
								addInSequence(newTarget = target.newRule(selector));
								
								// todo: check the type
								if(assignmentOperator == '='){
									browserUnderstoodRule = false;
									sequence.creating = true;
									if(value){
										// extend the referenced target value
										doExtend = true;
									}
								}
								if(assignmentOperator == ':' && !target.root){
									// we will assume that we are in a property in this case. We will need to do some adjustments to support nested pseudo selectors
									sequence.creating = true;
								}
								var nextRule = null;
								var lastRuleIndex = ruleIndex;
								if(match[6]){
									// when we are using built stylesheets, we make numeric references to the rules, by index
									var cssRules = styleSheet.cssRules || styleSheet.rules;
									if(newTarget.cssRule = nextRule = cssRules[match[6].slice(1)]){
										selector = nextRule.selectorText;
									}
								}
								if(target.root && browserUnderstoodRule){
									// we track the native CSSOM rule that we are attached to so we can add properties to the correct rule
									var cssRules = styleSheet.cssRules || styleSheet.rules;
									while((nextRule = cssRules[ruleIndex++])){									
										if(nextRule.selectorText == selector){
											// found it
											newTarget.cssRule = nextRule;
											break;
										}
									}
								}
								if(!nextRule){
									// didn't find it
									newTarget.ruleIndex = ruleIndex = lastRuleIndex;
									newTarget.styleSheet = styleSheet;									
									//console.warn("Unable to find rule ", selector, "existing rule did not match", nextRule.selectorText); 
								}
								if(sequence.creating){
									// in generation, we auto-generate selectors so we can reference them
									newTarget.selector = '.' + (assignmentOperator == '=' ? first.match(/[\w-]*$/g,'')[0] : '') + '-x-' + nextId++;
									newTarget.creating = true;
								}else{						
									newTarget.selector = target.root ? selector : target.selector + ' ' + selector;
								}
								selector = '';
							}else{
								// it's a call, add it in the current sequence
								var callParts = value.match(/(.*?)([\w-]*)$/);
								addInSequence(newTarget = target.newCall(callParts[2], sequence, target));
								newTarget.ref = target.getDefinition(callParts[2]);
								(sequence.calls || (sequence.calls = [])).push(newTarget);
							}
							// make the parent reference
							newTarget.parent = target;
							if(doExtend){
	//							value.replace(/(?:^|,|>)\s*([\w-]+)/g, function(t, base){
								value.replace(/\s*([\w-]+)\s*$/g, function(t, base){
									var result = utils.extend(newTarget, base, error);
									if(result && result.then){
										resumeOnComplete(result);
									}
								});
							}
							
							// store the current state information so we can restore it when exiting this rule or call
							target.currentName = name;
							target.currentSequence = sequence;
							target.assignmentOperator = assignmentOperator;
							var selectorTrigger;
							// if it has a pseudo or directive, call the handler
							if(operator == '{' && (selectorTrigger = newTarget.selector.match(/[@:]\w+/))){
								// TODO: use when()
								selectorTrigger = selectorTrigger[0];
								var selectorHandler = target.getDefinition(selectorTrigger);
								if(selectorHandler && selectorHandler.selector){
									selectorHandler.selector(newTarget);
								}
							}
	
							// add to the stack
							stack.push(target = newTarget);
							target.operator = operator;
							target.start = cssScan.lastIndex;
							name = null;
							sequence = null;
							continue;
					}
					if(sequence){
						// now see if we need to process an assignment or directive
						var first = typeof sequence == 'string' ? sequence: sequence[0];
						if(first.charAt && first.charAt(0) == "@"){
							// it's a directive
							var directive = first.match(/\w+/)[0];
							if(directive == "import"){
								// get the stylesheet
								var importedSheet = parse.getStyleSheet((styleSheet.cssRules || styleSheet.imports)[ruleIndex++], sequence, styleSheet);
								//waiting++;
								// preserve the current index, as we are using a single regex to be shared by all parsing executions
								var currentIndex = cssScan.lastIndex;
								// parse the imported stylesheet
								parseSheet(importedSheet.localSource, importedSheet);
								// now restore our state
								cssScan.lastIndex = currentIndex;
							}else if(directive == 'xstyle'){
								if(first.slice(8,13) == 'start'){
									// start a new nested rule for the new scope
									var newTarget = target ? target.newRule('') : lastRootTarget;
									newTarget.root = target.root;
									newTarget.parent = target;
									stack.push(target = newTarget);
								}else{
									// end of scope, store the scope, and pop it
									var lastRootTarget = target || lastRootTarget;
									stack.pop();
									target = stack[stack.length - 1];
								}
								cssScan = target ? mainScan : /(@[\w\s])/g;
							}else if(directive == 'supports'){
								// TODO: implement this
							}
						}else if(assignmentOperator){
							// need to do an assignment
							try{
								var result = target[assignmentOperator == ':' ? 'setValue' : 'declareProperty'](name, sequence, conditionalAssignment);
								if(result && result.then){
									resumeOnComplete(result);
								}
							}catch(e){
								error(e);
							}
						}
					}
					switch(operator){
						case ':':
							// assignment can happen after a property declaration
							if(assignmentOperator == '='){
								assignNextName = true;
								assignmentOperator = ':';
							}else{
								// a double pseudo
								addInSequence(':');
							}
							break;
						case '}': case ')': case ']':
							// end of a rule or function call
							// clear the name now
							if(operatorMatch[target.operator] != operator){
								error('Incorrect opening operator ' + target.operator + ' with closing operator ' + operator); 
							}
							name = null;
							// record the cssText
							var ruleCssText = textToParse.slice(target.start, cssScan.lastIndex - 1);
							target.cssText = target.cssText ? 
								target.cssText + ';' + ruleCssText : ruleCssText;
								
							if(operator == '}'){
								
								if(lastOperator == '}'){
									var parentSelector = target.parent.selector;
									if(parentSelector && !parentSelector.charAt(0) == '@'){
										// we throw an error for this because it so catastrophically messes up the browser's CSS parsing, not because we can't handle it fine
										error("A nested rule must end with a semicolon");
									}
								}
								if(target.root){
									error("Unmatched " + operator);
								}else{
									// if it is rule, call the rule handler
									try{ 
										target.onRule(target.selector, target);
									}catch(e){
										error(e);
									}
									
									// TODO: remove this conditional, now that we use assignment
									/*if(target.selector.slice(0,2) != "x-"){// don't trigger the property for the property registration
										target.eachProperty(onProperty);
									}*/
									browserUnderstoodRule = true;
								}
								selector = '';
							}
							// now pop the call or rule off the stack and restore the state
							if(operator == ')' && !assignmentOperator){
								// call handler
								// immediately call this, since it isn't a part of a property
								target.args = sequence.isSequence ? sequence : [sequence];
								var result = stack[stack.length - 2].onCall(target);
								if(result && result.then){
									resumeOnComplete(result);
								}
							}
							stack.pop();
							target = stack[stack.length - 1];				
							sequence = target.currentSequence;
							name = target.currentName;
							assignmentOperator = target.assignmentOperator;
							if(target.root && operator == '}'){
								// CSS ASI
								if(assignmentOperator){
									// may still need to do an assignment
									try{
										target[assignmentOperator == ':' ? 'setValue' : 'declareProperty'](name, sequence[1] || sequence, conditionalAssignment);
									}catch(e){
										error(e);
									}
								}
								assignNextName = true;
								assignmentOperator = false;
							}
							break;
						case "": case undefined:
							// no operator means we have reached the end of the text to parse
							return;
						case ';':
							// end of a property, end the sequence return to the beginning of propery mode
							sequence = null;
							assignNextName = true;
							browserUnderstoodRule = false;
							assignmentOperator = false;
							selector = '';
					}
					var lastOperator = operator;
				}
			}
			function error(e){
				console.error(e.message || e, (styleSheet.href || "in-page stylesheet") + ':' + textToParse.slice(0, cssScan.lastIndex).split('\n').length);
				if(e.stack){
					console.error(e.stack);
				}			
			}
		}
	}
	return parse;
});define("xstyle/main", [
		"require",
		"xstyle/core/parser",
		"xstyle/core/base",
		"xstyle/core/elemental",
		"xstyle/core/generate"], // eventually we might split generate.js, to just load the actual string parsing segment
		function (require, parser, ruleModel, elemental, generate) {
	"use strict";
	function search(tag){
		// used to search for link and style tags
		var elements = document.getElementsByTagName(tag);
		for(var i = 0; i < elements.length; i++){
			checkImports(elements[i]);
		}
	}
	elemental.ready(function(){
		// search the document for <link> and <style> elements to potentially parse.
		search('link');
		search('style');
	});
	// traverse the @imports to load the sources 
	function checkImports(element, callback, fixedImports){
		var sheet = element.sheet || element.styleSheet || element;
		var needsParsing = sheet.needsParsing, // load-imports can check for the need to parse when it does it's recursive look at imports 
			cssRules = sheet.rules || sheet.cssRules;
		function fixImports(){
			// need to fix imports, applying load-once semantics for all browsers, and flattening for IE to fix nested @import bugs
			require(["xstyle/core/load-imports"], function(load){
				load(element, function(){
					checkImports(element, callback, true);
				});
			});
		}
		function checkForInlinedExtensions(sheet){
			var cssRules = sheet.cssRules;
			for(var i = 0; i < cssRules.length; i++){								
				var rule = cssRules[i];
				if(rule.selectorText && rule.selectorText.substring(0,2) == "x-"){
					// an extension is used, needs to be parsed
					needsParsing = true;
					if(/^'/.test(rule.style.content)){
						// this means we are in a built sheet, and can directly parse it
						parse(eval(rule.style.content), sheet, callback);
						return true;
					}
				}
			}
		}
		if((sheet.href || (sheet.imports && sheet.imports.length)) && !fixedImports){
			// this is how we check for imports in IE
			return fixImports();
		}
		if(!needsParsing){
			for(var i = 0; i < cssRules.length; i++){								
				var rule = cssRules[i];
				if(rule.href && !fixedImports){
					// it's an import (for non-IE browsers)
					if(!checkForInlinedExtensions(rule.styleSheet)){
						return fixImports();
					}
					return;
				}
			}
		}
		// ok, determined that CSS extensions are in the CSS, need to get the source and really parse it
		parse(sheet.localSource || (sheet.ownerNode || sheet.owningElement).innerHTML, sheet, callback);
	}
	parser.getStyleSheet = function(importRule, sequence){
		return importRule.styleSheet || importRule;
	};
	function parse(textToParse, styleSheet, callback) {
		// this function is responsible for parsing a stylesheet with all of xstyle's syntax rules
		
		// normalize the stylesheet.
		if(!styleSheet.addRule){
			// only FF doesn't have this
			styleSheet.addRule = function(selector, style, index){
				return this.insertRule(selector + "{" + style + "}", index >= 0 ? index : this.cssRules.length);
			}
		}
		if(!styleSheet.deleteRule){
			styleSheet.deleteRule = styleSheet.removeRule;
		}
	

		var waiting = 1;
		// determine base url
		var baseUrl = (styleSheet.href || location.href).replace(/[^\/]+$/,'');

		// keep references
		ruleModel.css = textToParse;		
		
		// call the parser
		parser(ruleModel, textToParse, styleSheet);
		
		function finishedLoad(){
			// this is called after each asynchronous action is completed, allowing us to determine
			// when everything is complete
			if(--waiting == 0){
				if(callback){
					callback(styleSheet);
				}
			}
		}
		// synchronous completion
		finishedLoad(ruleModel);
		return ruleModel;
	}
	
	var xstyle =  {
		process: checkImports,
		parse: parse,
			// summary:
			// 		put-selector like functionality, but returned element will be processed by
			//	 	xstyle, with any applicable rules handling the new or updated element
			//	parentElement:
			// 		a parent element must be provided
			//	selector:
			// 		CSS selector syntax for creating a new element
		generate: generate,
		load:  function(resourceDef, require, callback, config){
			// support use an AMD plugin loader
			require(['xstyle/css'], function(plugin){
				plugin.load(resourceDef, require, callback, config);
			});
		}
	};
	return xstyle;

});
