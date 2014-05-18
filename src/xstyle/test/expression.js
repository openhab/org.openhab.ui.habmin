define([
	'intern!object',
	'intern/chai!assert',
	'xstyle/core/expression',
	'xstyle/core/base',
	'dstore/Model'
], function(registerSuite, assert, expression, base, Model){
	var rule, obj, a, b, c;
	registerSuite({
		name: 'core',
		beforeEach: function(){
			rule = base.newRule();
			rule.parent = base;
			obj = new Model();
			a = obj.property('a');
			a.put(1);
			rule.declareDefinition('a', a);
			b = obj.property('b');
			b.put(2);
			rule.declareDefinition('b', b);
			c = obj.property('c');
			c.put(3);
			rule.declareDefinition('c', c);
		},
		'evaluate sum': function(){
			var aPlusB = expression.evaluate(rule, 'a + b');
			assert.equal(aPlusB.valueOf(), 3);
			var latestSum;
			aPlusB.observe(function(value){
				latestSum = value;
			});
			assert.equal(latestSum, 3);
			b.put(3);
			assert.equal(latestSum, 4);
			var latestA;
			a.observe(function(value){
				latestA = value;
			});
			aPlusB.put(9);
			assert.equal(latestA, 6);
			var threePlusB = expression.evaluate(rule, '5 + b');
			assert.equal(threePlusB.valueOf(), 8);
			var latestB;
			b.observe(function(value){
				latestB = value;
			});
			threePlusB.put(10);
			assert.equal(latestB, 5);
		},
		'evaluate multiply': function(){
			var aTimesB = expression.evaluate(rule, 'a*b');
			assert.equal(aTimesB.valueOf(), 2);
			var latestResult;
			aTimesB.observe(function(value){
				latestResult = value;
			});
			assert.equal(latestResult, 2);
			a.put(3);
			assert.equal(latestResult, 6);
			var latestA;
			a.observe(function(value){
				latestA = value;
			});
			aTimesB.put(8);
			assert.equal(latestA, 4);
		},
		'evaluate subtract': function(){
			var aMinusB = expression.evaluate(rule, 'a -b');
			assert.equal(aMinusB.valueOf(), -1);
			var latestResult;
			aMinusB.observe(function(value){
				latestResult = value;
			});
			assert.equal(latestResult, -1);
			a.put(5);
			assert.equal(latestResult, 3);
			var latestA;
			a.observe(function(value){
				latestA = value;
			});
			aMinusB.put(9);
			assert.equal(latestA, 11);
		},
		'evaluate precedence': function(){
			var result = expression.evaluate(rule, 'a+b*c');
			assert.equal(result.valueOf(), 7);
			var result = expression.evaluate(rule, 'a*b+c');
			assert.equal(result.valueOf(), 5);
			var latestA;
			a.observe(function(value){
				latestA = value;
			});
			result.put(11);
			assert.equal(latestA, 4);
		},
		'evaluate !': function(){
			var result = expression.evaluate(rule, '!a');
			assert.equal(result.valueOf(), false);
			var latestA;
			a.observe(function(value){
				latestA = value;
			});
			result.put(true);
			assert.equal(latestA, false);

		}


		/*,
		'evaluate groups': function(){
			a.put(5);
			var result = expression.evaluate(rule, 'a*(b+c)');
			assert.equal(result.valueOf(), 25);
			var latestA;
			a.observe(function(value){
				latestA = value;
			});
			result.put(50);
			assert.equal(latestA, 10);
		}*/
	});
});