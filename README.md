HABmin2
=======

HABmin version2 - ultimately targeted toward openHAB2.

**BREAKING CHANGE:** I've now added ZWave support for the OpenHAB1 binding and therefore until there is a native
OpenHAB2 ZWave binding, the OpenHAB1 ZWave binding must be installed for HABmin2 to work under OpenHAB2.

An **OpenHAB2** bundle is now available with initial support for charting and some OH2 features such
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
* **Theme-able**. Multiple themes are available - take your pick (currently 3 themes). If you want a different look, we're using [bootswatch](http://www.bootswatch.com) themes - vote for your favourite by [raising an issue](https://github.com/cdjackson/HABmin2/issues/new).
* **Charting**. Modern, fast charting of historical data.
* **Graphical rule editor**. No need to learn rule syntax.
* **International support**. Currently translated in English, Deutsch, Français. Add support for your language...
* Available as native app for **Android**.


Installation
============

### OpenHAB-2
For openHAB-2, download the _org.openhab.ui.habmin_ JAR file from either the
[releases folder](https://github.com/cdjackson/HABmin2/releases) or you can use the latest snapshot in the
the [working folder](https://github.com/cdjackson/HABmin2/tree/master/output) and place it in the ```addons``` folder.

**NOTE**. Currently HABmin2 supports a backward compatible mode for the OpenHAB1 ZWave binding. Therefore
  you must also install the OpenHAB1 zwave JAR into the ```addons``` folder. As soon as a OpenHAB2 ZWave binding
  is available, this dependency will be removed.

Then open your browser at http://openhab server/habmin/index.html or follow the link from the OpenHAB dashboard.

### OpenHAB-1
You need to install the [HABmin JAR](https://github.com/cdjackson/HABmin/blob/master/addons/org.openhab.io.habmin-1.7.0-SNAPSHOT.jar?raw=true) **AND** the [ZWave JAR](https://github.com/cdjackson/HABmin/blob/master/addons/org.openhab.binding.zwave-1.7.0-SNAPSHOT.jar?raw=true) from the [HABmin-1 repository](https://github.com/cdjackson/HABmin) and add them to your openHAB ```addons``` folder  (note that you can use any other recent zwave binding if you prefer). These files are needed no matter what installation you choose next - if you don't install these files, some things may work, but most won't (eg sitemaps might work, but charting etc won't). Note that the zwave binding is needed even if you don't have zwave installed - it won't do anything, but is needed to resolve some dependancies - this will be removed in openHAB2.  You also (currently) need to install HABmin version 1 since the HABmin JAR is using a few files in this repository (I know this is bad - I should remove this dependancy soon).

Packages are available for easy install - either for a web server (ie. installation into openHAB so you can use a browser), or as an Android app.

* You can download either the release version - grab the latest from the [releases folder](https://github.com/cdjackson/HABmin2/releases).
* Or, if you want the latest snapshot, grab it from the [working folder](https://github.com/cdjackson/HABmin2/tree/master/output).

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


Dashboard view (Paper theme, French localisation)...

![dashboard](https://github.com/cdjackson/HABmin2/wiki/screenshots/dashboard.png)


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

## Development Environment Setup
To set up a development environment, clone the repository to your computer.
Install ```npm``` (node package manager) and run ```npm install``` to install all the development dependencies.
Note that  I am currently keeping the dependancies in the repository. This is because in some cases I've modified them
so I think it's easier/safer to store everything used to generate the code.

For mobile app compilation, you need to install ```cordova``` and ```ant``` and the android developers kits and set paths appropriately.

To compile for debug, run ```grunt build```. This will generate a debug build in the ```build`` folder
and also put a zipped ```debug``` version into the ```output``` folder.

To compile for mobile releases (currently only Android supported), run ```grunt mobile```

To compile for release, run ```grunt compile```. This will generate a minified version in the ```bin``` folder
and also put a zipped ```debug``` and ```release``` versions into the ```output``` folder.

## Language Translations
If you want to add a translation for your language, then you need to copy the files in ```/src/app/languages```
and copy the folder ```en-GB``` and rename it to your language (eg ```de-DE```). The folder name is
```language-country``` and you should be able find the
[language](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) and
[country](https://en.wikipedia.org/wiki/ISO_3166-1) codes from these links.

The language translation files accept special characters in UTF-8 format.

In ```app.js```, you should then add your language to the list of supported locales in the ```localeSupported``` array.

```javascript
    .value('localeSupported', {
        'en-GB': {name: "English", desc: "United Kingdom"},
        'de-DE': {name: "Deutsch", desc: "Deutschland"},
        'fr-FR': {name: "Fran&ccedil;ais", desc: "France"}
    })
```

The idea is that languages are hierarchical. So we might have ```de-CH```
for Swiss German, and strings defined for this locale will use Swiss localisation as first priority.
If no string is available, then it should fall back to the default German localisation, and if no string
is found here, it will fall back to the default localisation - English.

Note that in the above special characters aren't supported natively as they are embedded in the code.
To provide support for this, these strings will be treated as HTML, so you can use the html character escape codes as seen above for French.

This should allow regional overrides of specific strings without having to override the whole file. Overrides are
defined in the ```localeFallbacks``` array.

```javascript
    .value('localeFallbacks', {
        'en': 'en-GB'
    })
```

There is a Grunt task to check how complete the translations are - as HABmin is evolving, and new strings are continually being added, it's worth checking this periodically.

To run the check, run ```grunt check_languages```. This will print the number of translations compared to the number of strings in the ```en-GB``` file.
If you add the option ```--lang=<language>``` (eg ```grunt check_languages --lang=de-DE```) then the system will list all missing strings for the specified language.


## OpenHAB-2 Bundle
The HABmin JAR for OpenHAB-2 is included in this repository.

To develop HABmin in Eclipse as part of the OpenHAB-2 development environment, you need to import the project
into your OpenHAB-2 environment using the ```File | Import``` menu, then selecting ```Existing Projects into Workspace```.
Select the ```HABmin2/openhab2``` folder and in the ```Projects``` list you should see a single project listed (if you see
two, then you've probably selectd the HABmin2 root folder, and it will then pick up the Android development environment
as well - you don't want this!). Click ```Finish``` and the project should be imported.

Note that git will not consider HABmin as part of openHAB, so when you commit changes, it won't commit anything
to HABmin. You need to commit HABmin changes separately into your HABmin2 repository.


## Commit Messages
I am using the conventional changelog, and this requires that commit messages be in a certain format for them to be used to generate the change log.
So, for any messages that you want to appear in the changelog, please use the convention here [conventional-changelog/CONVENTIONS.md](https://github.com/ajoslin/conventional-changelog/blob/master/CONVENTIONS.md) for a synposis of the conventions with commit examples.

I am using the following ```scope``` options -:
* Dashboard: For dashboard specific changes
* Chart: For the interactive charting
* Items: For item management and configuration
* Mobile: When related specifically to mobile app generation
* Rules: For anything to do with rules and rule editing
* Sitemap: For sitemap changes
* Things: For OpenHAB2 thing management
* UI: for the majority of general changes
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
for tags, or merge your commits before creating the pull request.
Anything not tagged in the above format will simply not appear in the changelog, so you can choose yourself if it
shows up (again, be considerate).

