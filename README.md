HABmin2
=======

HABmin version2 - ultimately targeted toward openHAB2

## Features
* Responsive. Should work well on all devices. Of course some functions may be removed or be difficult to use on small devices (eg the graphical rule editor).
* Theme-able. Multiple themes are available - take your pick.
* Charting. Modern, fast charting of historical data.
* Graphical rule editor. No need to learn rule syntax.
* Available as native apps for Android.

Installation
============

To test, you need to grab the habmin JAR from the HABmin repository (https://github.com/cdjackson/HABmin/blob/master/addons/org.openhab.io.habmin-1.7.0-SNAPSHOT.jar) and add it to your addons folder along with the zwave binding from the same site (or any other recent zwave binding if you prefer).

Then grab the appropriate ZIP file, generally the release version, from https://github.com/cdjackson/HABmin2/output and unzip it into a folder webapps/habmin2 in your openhab installation.

Then open the browser at http://openhab server/habmin2.

Screenshots
===========
The following images show a selection of screenshots. Note that the theme is user selectable, although most images are shown with a dark theme (except the mobile sitemap image).

Graphing a saved chart...

![charting](https://raw.github.com/wiki/cdjackson/HABmin2/screenshots/charting-saved.png)


Editing a saved chart...

![charting-editor](https://raw.github.com/wiki/cdjackson/HABmin2/screenshots/charting-edit.png)


Editing rules (graphical editor)...

![rules-block](https://raw.github.com/wiki/cdjackson/HABmin2/screenshots/rules-blocks.png)


Editing rules (text editor)...

![rules-source](https://raw.github.com/wiki/cdjackson/HABmin2/screenshots/rules-source.png)


ZWave device configuration...

![zwave-config](https://raw.github.com/wiki/cdjackson/HABmin2/screenshots/zwave-config.png)


ZWave network routing diagram...

![zwave-network](https://raw.github.com/wiki/cdjackson/HABmin2/screenshots/zwave-network.png)


Sitemaps (mobile view using ```yeti``` theme)...

![sitemap](https://raw.github.com/wiki/cdjackson/HABmin2/screenshots/sitemap-mobile-yeti.png)




Contributing
============
Clone the repository to your computer.
install ```npm``` (node package manager) and run ```npm install``` to install all the development dependencies.

For mobile app compilation, you need to install ```cordova``` and ```ant``` and the android developers kits and set paths appropriately.

To compile for debug, run ```grunt build```. This will generate a debug build in the ```build`` folder
and also put a zipped ```debug``` version into the ```output``` folder.

To compile for mobile releases (currently only Android supported), run ```grunt mobile```

To compile for release, run ```grunt compile```. This will generate a minified version in the ```bin``` folder
and also put a zipped ```debug``` and ```release``` versions into the ```output``` folder.

## Commit Messages
I am using the conventional changelog, and this requires that commit messages be in a certain format for them to be used to generate the change log.
So, for any messages that you want to appear in the changelog, please use the convention here [conventional-changelog/CONVENTIONS.md](https://github.com/ajoslin/conventional-changelog/blob/master/CONVENTIONS.md) for a synposis of the conventions with commit examples.

I am using the following ```scope``` options -:
* UI: for the majority of general changes
* Mobile: When related specifically to mobile app generation
* ZWave: For zwave specific changes

eg:
* feat(UI): Add theme switching
* feat(Mobile): Persist server address to local storage
* fix(ZWave): Fix network diagram resizing

Anything not using the standard format will not be placed in the changelog, and if you don't want something in the changelog
then feel free to write what you like (just don't start the line as above).

Clearly we can use more options than this, and for binding/hardware specific issues, we should standardise other options as per the
ZWave option.

If unsure, please contact me as I'd like to keep this reasonably clean if possible to ensure we have a good change record.
Also, please don't tag the same thing multiple times. If you're like me, and you commit often, that's fine, but when writing
your commit tag, consider what it will look like in the changelog and if you're working on a feature, don't use this format
for tags. Anything not tagged in the above format will simply not appear in the changelog, so you can choose yourself if it
shows up (again, be considerate).

