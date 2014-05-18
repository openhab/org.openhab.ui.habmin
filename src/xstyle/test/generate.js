define([
	'intern!object',
	'intern/chai!assert',
	'xstyle/util/getComputedStyle',
	'xstyle/main',
	'xstyle/main!./core.css',
	'dojo/domReady!'
], function(registerSuite, assert, getComputedStyle, xstyle){
	var put = xstyle.generate;
	var id = 0;
	function testGenerator (params) {
		return function(){
			var elementId = 'generate-' + id++;
			xstyle.parse('#' + elementId + '{=>\n' + params.generator + '}', {cssRules: [], insertRule: function(){}});
			var newElement = put(document.body, '#' + elementId);
			assert.equal(newElement.innerHTML.toUpperCase(), params.html);
		};
	}
	registerSuite({
		name: 'generate',
		simple: testGenerator({
			generator: 'div',
			html: '<DIV></DIV>'
		})
	});
});