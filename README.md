HABmin2
=======

HABmin version2 - ultimately targeted toward openHAB2.

An **OPENHAB2** bundle is now available with initial support for charting and some OH2 features such
as listing the newly discovered devices. I hope to keep a single source base that supports as many
OH1 and OH2 features as possible while OH2 is being developped.

The goal of HABmin2 is to provide a modern, professional and portable user interface for openHAB,
providing both user and administrative functions (eg sitemaps for users, and configuration utilities
to aid setup). It is written in such a way that it can be compiled as a native application for mobile
devices using [Apache Cordova](http://cordova.apache.org/). This provides a portable application that
with a small amount of work should run as a native application on a diverse range of devices.

To get a feel for the interface, check out an online version [here](http://cdjackson.github.io/HABmin2/#/home).
Note that this is a static site, so there will be errors, and dynamic content such as graphs etc won't work.

HABmin is intended as a complete GUI for the openHAB Home Automation system. It is in early and
[active development](https://github.com/cdjackson/HABmin2/blob/master/CHANGELOG.md), and as the
ultimate target is openHAB2, which is also being actively developed, features are varied.
In general, I'm focusing on features that I don't anticipate will change too much in OH2, or where
the changes on the server side will not greatly impact the client.


Features
========
* **Responsive**. Should work well on all devices. Of course some functions may be removed or be difficult to use on small devices (eg the graphical rule editor).
* **Theme-able**. Multiple themes are available - take your pick.
* **Charting**. Modern, fast charting of historical data.
* **Graphical rule editor**. No need to learn rule syntax.
* Available as native app for **Android**.

Installation
============

### OpenHAB-2
For openhab 2, simply add the _org.openhab.ui.habmin_ JAR file to your addons folder.

### OpenHAB-1
To test, you need to install the [HABmin JAR](https://github.com/cdjackson/HABmin/blob/master/addons/org.openhab.io.habmin-1.7.0-SNAPSHOT.jar?raw=true) **AND** the [ZWave JAR](https://github.com/cdjackson/HABmin/blob/master/addons/org.openhab.binding.zwave-1.7.0-SNAPSHOT.jar?raw=true) from the [HABmin repository](https://github.com/cdjackson/HABmin) and add them to your openHAB ```addons``` folder  (note that you can use any other recent zwave binding if you prefer). These files are needed no matter what installation you choose next - if you don't install these files, some things may work, but most won't (eg sitemaps might work, but charting etc won't). Note that the zwave binding is needed even if you don't have zwave installed - it won't do anything, but is needed to resolve some dependancies - this will be removed in openHAB2.  You also (currently) need to install HABmin version 1 since the HABmin JAR is using a few files in this repository (I know this is bad - I should remove this dependancy soon).

Packages are available for easy install - either for a web server (ie. installation into openHAB so you can use a browser), or as an Android app.

* You can download either the release version - grab the latest from the [releases folder](https://github.com/cdjackson/HABmin2/releases).
* Or, if you want the latest snapshot, grab it from the [working folder](https://github.com/cdjackson/HABmin2/tree/master/output).

### Web interface
Then grab the appropriate ZIP file from the [releases folder](https://github.com/cdjackson/HABmin2/releases) or the latest snapshot from the [working folder](https://github.com/cdjackson/HABmin2/tree/master/output). Generally the ```-release``` version, however a ```-debug``` version is also supplied.  Unzip the file into a folder webapps/habmin2 in your openhab installation folder.

Then open the browser at http://openhab server/habmin2.

### Android
The release also contains an Android package (```apk``` file) - this can be downloaded to an Android device - no further installation is required in openhab (other than the JAR files mentioned above). When the app starts, it should ask you for server and login credentials. I'm still trying to get the reconnection sorted, so it's possible that you may need to log out, and log on to get the connect back when you start again. Please feel free to open an issue and report your findings.

Screenshots
===========
The following images show a selection of screenshots. Note that the theme is user selectable, although most images are shown with a dark (*slate*) theme (except the mobile sitemap image).

Graphing a saved chart...

![charting](https://github.com/cdjackson/HABmin2/wiki/screenshots/charting-saved.png)


Editing a saved chart...

![charting-editor](https://github.com/cdjackson/HABmin2/wiki/screenshots/charting-edit.png)


Editing rules (graphical editor)...

![rules-block](https://github.com/cdjackson/HABmin2/wiki/screenshots/rules-blocks.png)


Editing rules (text editor)...

![rules-source](https://github.com/cdjackson/HABmin2/wiki/screenshots/rules-source.png)


ZWave device configuration...

![zwave-config](https://github.com/cdjackson/HABmin2/wiki/screenshots/zwave-config.png)


ZWave network routing diagram...

![zwave-network](https://github.com/cdjackson/HABmin2/wiki/screenshots/zwave-network.png)


Sitemaps (mobile view using *yeti* theme)...

![sitemap](https://github.com/cdjackson/HABmin2/wiki/screenshots/sitemap-mobile-yeti.png)




Contributing
============
There are a number of ways you can contribute - obviously code additions to add new features or correct bugs
are very welcome, but it would also be great to get some translations to support other languages.

## Language Translations
If you want to add a translation for your language, then you need to copy the files in ```/src/app/languages```
and copy the folder ```en-GB``` and rename it to your language (eg ```de-DE```). The folder name is
```language-country``` and you should be able find the
[language](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) and
[country](https://en.wikipedia.org/wiki/ISO_3166-1) codes from these links.


In ```app.js```, you should then add your language to the list of supported locales in the ```localeSupported``` array.

```javascript
    .value('localeSupported', {
        'en-GB': "English (United Kingdom)"
    })
```

The idea is that languages will be hierarchical (although this isn't implemented yet). So we might have ```de-CH```
for Swiss German, and strings defined for this locale will use Swiss localisation. If no string is available,
then it should fall back to the default German localisation, and if no string is found here, it will fall back
to the default localisation - English.

This should allow regional overrides of specific strings without having to override the whole file. Overrides are
defined in the ```localeFallbacks``` array.

```javascript
    .value('localeFallbacks', {
        'en': 'en-GB'
    })
```

## Development Environment Setup
To set up a development environment, clone the repository to your computer.
Install ```npm``` (node package manager) and run ```npm install``` to install all the development dependencies.

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

