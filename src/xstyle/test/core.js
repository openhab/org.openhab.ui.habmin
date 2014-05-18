define([
	'intern!object',
	'intern/chai!assert',
	'xstyle/util/getComputedStyle',
	'xstyle/main',
	'xstyle/main!./core.css',
	'dojo/domReady!'
], function(registerSuite, assert, getComputedStyle, xstyle){
	var put = xstyle.generate;

	registerSuite({
		name: 'core',
		component: function(){
			var testComponent = put(document.body, 'test-component');
			assert.equal(testComponent.tagName, 'SECTION');
			var componentStyle = getComputedStyle(testComponent);
			assert.equal(componentStyle.borderWidth, '4px');
			assert.equal(componentStyle.borderColor, 'rgb(0, 0, 255)');
			assert.equal(componentStyle.color, 'rgb(0, 0, 255)');
			assert.equal(componentStyle.backgroundColor, 'rgb(221, 221, 221)');
			var testHeader = testComponent.firstChild;
			assert.equal(testHeader.tagName, 'H1');
			assert.equal(testHeader.innerHTML, 'Label');
			var headerStyle = getComputedStyle(testHeader);
			assert.equal(headerStyle.color, 'rgb(255, 0, 0)');
			var testContent = testHeader.nextSibling;
			assert.equal(testContent.innerHTML, 'The default content');
			var contentStyle = getComputedStyle(testContent);
			assert.equal(contentStyle.color, 'rgb(0, 128, 0)');
			assert.equal(contentStyle.width, '163px');
			var testDiv = testContent.nextSibling;
			assert.equal(testDiv.innerHTML, 'test');
		},

		'extend-by-property': function(){
			var testComponent = put(document.body, '.with-content');
			var componentStyle = getComputedStyle(testComponent);
			assert.equal(componentStyle.borderWidth, '4px');
			assert.equal(componentStyle.borderColor, 'rgb(170, 170, 170)');
			assert.equal(componentStyle.color, 'rgb(170, 170, 170)');
			assert.equal(componentStyle.backgroundColor, 'rgb(255, 255, 0)');
			var testHeader = testComponent.firstChild;
			assert.equal(testHeader.tagName, 'H1');
			assert.equal(testHeader.innerHTML, 'test');
			var headerStyle = getComputedStyle(testHeader);
			assert.equal(headerStyle.color, 'rgb(255, 0, 0)');
			var testContent = testHeader.nextSibling;
			assert.equal(testContent.innerHTML, 'The default content');
			var contentStyle = getComputedStyle(testContent);
			assert.equal(contentStyle.color, 'rgb(0, 128, 0)');
			assert.equal(contentStyle.width, '163px');
			var testDiv = testContent.nextSibling;
			assert.equal(testDiv.innerHTML, 'test');
		},	
		'extend-by-selector': function(){
			var testComponent = put(document.body, 'hello-world');
			var componentStyle = getComputedStyle(testComponent);
			assert.equal(componentStyle.borderWidth, '4px');
			assert.equal(componentStyle.borderColor, 'rgb(136, 136, 136)');
			assert.equal(componentStyle.color, 'rgb(136, 136, 136)');
			assert.equal(componentStyle.backgroundColor, 'rgb(255, 170, 170)');
			var testHeader = testComponent.firstChild;
			assert.equal(testHeader.tagName, 'H1');
			assert.equal(testHeader.innerHTML, 'Hello world');
			var headerStyle = getComputedStyle(testHeader);
			assert.equal(headerStyle.color, 'rgb(255, 0, 0)');
			var testContent = testHeader.nextSibling;
			assert.equal(testContent.innerHTML, 'The default content');
			var contentStyle = getComputedStyle(testContent);
			assert.equal(contentStyle.color, 'rgb(0, 128, 0)');
			assert.equal(contentStyle.width, '163px');
			var testDiv = testContent.nextSibling;
			assert.equal(testDiv.innerHTML, 'test');
		}

	});
});