define(['xstyle/core/base', 'xstyle/core/Proxy', 'xstyle/core/parser', 'xstyle/main', 'dojo/domReady!'], function(base, Proxy, parse){
	var contentText = document.getElementsByTagName('pre')[0].innerHTML,
		body = document.body,
		entities = {
			'&lt;': '<',
			'&gt;': '>',
			'&amp;': '&'
		};
	
	body._contentNode = body;
	body.innerHTML = '';
	contentText = contentText.replace(/&\w+;/g, function(entity){
		return entities[entity];
	});

	var content = eval('(' + contentText + ')');
	(body['page-content'] || (body['page-content'] = new Proxy())).setSource(content);
	/*base.newRule('content');
	
	parse(contentRule, contentText, {
			rules: [], 
			addRule: function(){}
		});*/
	
});