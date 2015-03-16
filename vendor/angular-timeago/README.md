# angular-timeago [![Analytics](https://ga-beacon.appspot.com/UA-2694988-7/angular-timeago/readme?pixel)](https://github.com/yaru22/angular-timeago)
Angular directive/filter/service for formatting date so that it displays how long ago the given time was compared to now.

## Disclaimer
This project is based off of [a thread](https://groups.google.com/forum/#!topic/angular/o7vl4tsg53w) on Angular Google Groups. The person who started the thread, [@lrlopez](https://github.com/lrlopez), gave me permission to start a repo using the code he wrote initially. Thanks to [@lrlopez](https://github.com/lrlopez) and other contributors in the thread.

## Demo
Check out the demo [here](http://www.brianpark.ca/projects/angular_timeago/demo/).

## Usage
**Filter**
```
{{myDate | timeAgo}}
```
Displays time ago since `myDate`. `myDate` can be time in **milliseconds since January 1st 1970** (see [MDN Date.prototype.getTime](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTime)) or an **ISO 8601** string (see [MDN Date.prototype.toISOString](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString))

**Language support**
angular-timeago currently supports: `en_US`, `de_DE`, `he_IL`, `pt_BR`. If you want more languages: feel free to contribute!
The language is determined by the string in `document.documentElement.lang` which you can set in your HTML markup:
```
<html lang="en_US"></html>
```
Or directly in JS:
```
window.document.documentElement.lang = 'en_US';
```
You can also add additional or alter existing languages at runtime by extending the service:
```
timeAgo.settings.strings.en_US = {
  // appropriate keys here
};
```
For more details refer to the [source code](https://github.com/yaru22/angular-timeago/blob/master/src/timeAgo.js#L47).
  


## Testing

In order to run the e2e tests you might need to install a Selenium server via:

```
./node_modules/grunt-protractor-runner/scripts/webdriver-manager-update```

And then use grunt to run all tests (unit and e2e):

```
grunt test
