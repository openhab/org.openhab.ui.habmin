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

