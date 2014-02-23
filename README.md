Updates
-------
* 02-02-2014: Updated item editing to extend toolbar across all tabs. Added a filter option to filter listed items.
* 20-01-2014: Added ability to save and restore charts. This allows considerable customisation of the graphs.


Overview
--------
_HABmin_ is a web administration console for openHAB. It aims to provide a complete interface to administer openHAB, including the following features -:
* General configuration (openHAB.cfg)
* Configure bindings
* Configure items
* Configure mapping
* Configure sitemaps
* Configure ZWave network
* Configure rules and notifications
* Query and graph data from persistence stores
* View OSGi binding status
* View log files

The interface is a modern browser based system providing point and click, and drag and drop input. As features are added, the wiki is being updated - please take a look. The interface supports multiple languages - please help with translations.


![Item Config Screen](https://raw.github.com/wiki/cdjackson/HABmin/habmin_itemconfig.png)

_HABmin_ interfaces to OpenHAB through a RESTful style interface - this is implemented as a separate bundle to the openHAB REST interfaces that support the standard user interface.

![Sitemap Config Screen](https://raw.github.com/wiki/cdjackson/HABmin/habmin_sitemap.png)

In addition to the REST interface, it is possible to define files that describe the configurable features of OpenHAB. These files describe the configuration required for a binding or an item and are used within openHAB and exposed through the _HABmin_ REST interface. The files are defined in XML format and are not directly accessed by _HABmin_.


![Graph Screen](https://raw.github.com/wiki/cdjackson/HABmin/habmin_graph.png)

While _HABmin_ is a supporting project to OpenHAB,  providing access to openHAB's features, since the existing REST interface does not support most of the functionality required by _HABmin_, _HABmin_ may drive this part of openHAB to some extent. It is also expected that as functionality is added to openHAB, _HABmin_ will need to have its backend modified to reflect the final interfaces implemented in openHAB.

![Binding Config Screen](https://raw.github.com/wiki/cdjackson/HABmin/habmin_bindingconfig.png)


###Status
The project is just getting started. Currently implemented are the following -:
* Graphing of data from the persistence store including saving and restoring charts.
* Item editor
* Sitemap editor
* General binding configuration (ie binding configuration in the openhab.cfg file)
* OSGI bundle status viewer
* Rule editor with syntax highlighting
* Item rule library (initial test phase)
* ZWave configuration interface (note: work in progress still)

Additionally, lot of the initial user interface has been boilerplated.

Technology
----------
_HABmin_ is an open source project. It makes use of a number of libraries under GPL license. The following major libraries are used -:
* ExtJS from Sencha
* Highcharts from Highsoft
* moment.js for time management
* JIT for some special charts

![Bundles Screen](https://raw.github.com/wiki/cdjackson/HABmin/habmin_systembundles.png)

Installation
------------
Note that _HABmin_ requires version 1.4 or above of openHAB.
You can either use the compiled release version, or the source version. It's also possible to use a combination of the two if you know what you're doing - be careful though since the compiled version does merge some files to speed things up.

The release version is a compiled, minified version which increases the loading speed, and reduces the space used on the disk (useful if you're running on an embedded system like the Pi).
To install, simply unzip from the openHAB main directory. This will put the _HABmin_ files in the webapps directory, and the plugins in the adons directory.

Alternatively, installing the source code version is done as follows -:
* Download the project zip file from GitHub and unzip files in the directory webapps/habmin (you will need to create this directory - note that the directory name must be **lower case**).
* Place the org.openhab.io.habmin*.jar file into the addons directory (this is stored in the addons directory in the repository).
* Place the org.openhab.binding.zwave*.jar into the addons directory (this is stored in the addons directory in the repository). Note that this bundle is currently required for _HABmin_ to start, but if you don't have zwave then it won't actually run if it's not configured. In the longer term this dependency will be removed.

Either way, you will probably need to restart openHAB for the new interfaces to take affect.

You can then start _HABmin_ at the address [http://localhost:8080/habmin/index.html](http://localhost:8080/habmin/index.html) (assuming openHAB is running on your local computer using the default port - if this is not the case, you will need to adjust the address accordingly).

Contributing
------------
If you wish to help with this project, please feel free to clone the repository and work on some features. I would like to maintain a top level TODO/Issues list which lists the main features that require work. Please feel free to add to this list, or discuss implementation issues within the issue. If you are going to work on a feature please make it known so we can avoid duplication.
