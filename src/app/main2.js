/**
 * This file is the application's main JavaScript file. It is listed as a dependency in run.js and will automatically
 * load when run.js loads.
 *
 * Because this file has the special filename `main.js`, and because we've registered the `app` package in run.js,
 * whatever object this module returns can be loaded by other files simply by requiring `app` (instead of `app/main`).
 *
 * Our first dependency is to the `dojo/has` module, which allows us to conditionally execute code based on
 * configuration settings or environmental information. Unlike a normal conditional, these branches can be compiled
 * away by the build system; see `staticHasFeatures` in app.profile.js for more information.
 *
 * Our second dependency is to the special module `require`; this allows us to make additional require calls using
 * module IDs relative to this module within the body of the define callback.
 *
 * In all cases, whatever function is passed to define() is only invoked once, and the returned value is cached.
 *
 * More information about everything described about the loader throughout this file can be found at
 * <http://dojotoolkit.org/reference-guide/loader/amd.html>.
 */
define([ 'dojo/has', 'require' ], function (has, require) {
	var app = {};

	/**
	 * This main.js file conditionally executes different code depending upon the host environment it is loaded in.
	 * This is an increasingly common pattern when dealing with applications that run in different environments that
	 * require different functionality (i.e. client/server or desktop/tablet/phone).
	 */
	if (has('host-browser')) {
		/*
		 * This require call's first dependency, `./Dialog`, uses a relative module identifier; you should use this
		 * type of notation for dependencies *within* a package in order to ensure the package is fully portable. It
		 * works like a path, where `./` refers to the current directory and `../` refers to the parent directory. If
		 * you are referring to a module in a *different* package (like `dojo` or `dijit`), you should *not* use a
		 * relative module identifier.
		 *
		 * The second dependency is a plugin dependency; in this case, it is a dependency on the special functionality
		 * of the `dojo/domReady` plugin, which simply waits until the DOM is ready before resolving.
		 * The `!` after the module name indicates you want to use special plugin functionality; if you were to
		 * require just `dojo/domReady`, it would load that module just like any other module, without the special
		 * plugin functionality.
		 */

        require([
            "dijit/layout/BorderContainer",
            "dijit/layout/AccordionContainer",
            "dijit/layout/ContentPane",
            "dijit/layout/TabContainer",
            "dgrowl/main",
            "dojo/domReady!"
        ], function(BorderContainer, AccordionContainer, ContentPane, TabContainer, dGrowl){
            // create a BorderContainer as the top widget in the hierarchy
            var bc = new BorderContainer({
                style: "height: 100%; width: 100%;",
                persist: true//,
//                splitter: true
            }, document.body);

            // create a ContentPane as the left pane in the BorderContainer
            var aContainer = new AccordionContainer({style:"width: 300px; height:500px;",
                splitter: true,
                region: "left"});
            aContainer.addChild(new ContentPane({
                title: "This is a content pane",
                content: "Hi!",
                iconClass:"dijitPlIcon"
            }));
            aContainer.addChild(new ContentPane({
                title:"This is as well",
                content:"Hi how are you?"
            }));
            aContainer.addChild(new ContentPane({
                title:"This too",
                content:"Hello im fine.. thnx"
            }));
            aContainer.startup();
            bc.addChild(aContainer);

            // create a TabContainer as the center pane in the BorderContainer,
            // which itself contains two children
            var tc = new TabContainer({region: "center"//,
//                splitter: true
            });
            var tab1 = new ContentPane({title: "tab 1",
                    iconClass:"dijitPlIcon",
                tooltip: "XXXXX"}),
                tab2 = new ContentPane({title: "tab 2"}),
                tab3 = new ContentPane({title: "tab 3"});
            tc.addChild( tab1 );
            tc.addChild( tab2 );
            tc.addChild( tab3 );
            bc.addChild(tc);

            bc.startup();

            var dg2 = new dGrowl({region:"right", 'channels':[{'name':'info','pos':2},{'name':'error', 'pos':1}]});
            dg2.addNotification('Ut oh, something broke!',{'channel':'error'});
            dg2.addNotification('Ut oh, something broke!',{'channel':'info'});
        });


/*
        require(["dijit/layout/AccordionContainer", "dijit/layout/ContentPane", "dojo/domReady!"],
            function(AccordionContainer, ContentPane){
                app.aContainer = new AccordionContainer({style:"width: 300px; height:500px;"}, document.body);
                app.aContainer.addChild(new ContentPane({
                    title: "This is a content pane",
                    content: "Hi!"
                }));
                app.aContainer.addChild(new ContentPane({
                    title:"This is as well",
                    content:"Hi how are you?"
                }));
                app.aContainer.addChild(new ContentPane({
                    title:"This too",
                    content:"Hello im fine.. thnx"
                }));
                app.aContainer.startup();
            });

*/
	}
	else {
		// TODO: Eventually, the Boilerplate will actually have a useful server implementation here :)
		console.log('Hello from the server!');
	}
});