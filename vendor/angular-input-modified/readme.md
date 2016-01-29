<p align="center">
  <img src="https://raw.githubusercontent.com/betsol/angular-input-modified/master/emblem/emblem.png" alt="Angular Input Modified">
</p>

# angular-input-modified

[![Bower version](https://badge.fury.io/bo/angular-input-modified.svg)](http://badge.fury.io/bo/angular-input-modified)
[![npm version](https://badge.fury.io/js/angular-input-modified.svg)](http://badge.fury.io/js/angular-input-modified)


This Angular.js module adds additional properties and methods to the `ngModel` and `ngForm` controllers,
as well as CSS classes to the underlying form elements
to provide end-user with facilities to detect and indicate changes in form data.

This extra functionality allows you to provide better usability with forms.
For example, you can add decorations to the form elements that are actually changed.
That way, user will see what values has changed since last edit.

Also, you can reset an entire form or just a single field to it's initial state
(cancel all user edits) with just a single call to the `reset()` method or
lock new values (preserve new state) just by calling overloaded `$setPristine()`
method.


## Demos and examples

Please see [the demos][gh-pages] hosted on our GitHub Pages or
[open them locally][faq-local-demos].

Also, feel free to play with our [Plunk][plunk]!


## Decorations and animation

This module adds `ng-modified` and `ng-not-modified` CSS classes (names are customizable) to the input fields to indicate their state.
Use them in your CSS to decorate input fields. You can combine multiple classes in the same selector.
For example, use this convenient CSS selector to decorate modified elements as valid:

```css
/** Decorating only modified inputs as valid */
input.ng-valid.ng-modified {
    border-color: green;
}
```

This way end user will see what elements were actually changed.

This module also supports animations if `ngAnimate` module is available.


## Installation

### Install library with Bower

`bower install --save angular-input-modified`


### Install library with NPM

`npm install --save angular-input-modified`


### Add library to your page

``` html
<script src="/bower_components/angular-input-modified/dist/angular-input-modified.js"></script>
```

You should use minified version (`angular-input-modified.min.js`) in production.


### Add dependency in your application's module definition

``` javascript
var application = angular.module('application', [
  // ...
  'ngInputModified'
]);
```


## Usage

Please see our [demos and examples](#demos-and-examples) as well as [API documentation](#api).


### Form initialization

Starting from version `2.0.0` form must be synchronously initialized during
controller execution. If you need some data to be fetched prior to form
initialization — the best approach is to
[resolve](https://docs.angularjs.org/api/ngRoute/provider/$routeProvider)
this data using your router.

However, if you really need to re-initialize form after controller execution —
please use the approach shown in this demo:
[Delayed Initialization][demo-delayed-init].


### Excluding some fields

Input modified module provides you with the ability to control which input elements
will exhibit modifiable behavior and which will not.

By default all form fields in your application will support modifiable behavior,
after input modified module is added to the application. You can control this
via `enableGlobally()` and `disableGlobally()` methods of the `inputModifiedConfigProvider`.
This gives you the overall top-level switch to control modifiable behavior.

Also, we provide you with special directive called `bsModifiable` that allows you
to control which fields will support the behavior. It gives you are more granular
control over your forms. This directive works in a recursive manner and can be applied
to any HTML element. For example, you can apply it to an entire form:
`<form name="myForm" bs-modifiable="true">` in order to enable modifiable behavior
on all it's fields.

`bs-modifiable` attribute can be set to `true` or to `false`, depending on what
you are trying to achieve.

You can exercise the **exclusion** policy by excluding only specific fields or you
can exercise the **inclusion** policy by disabling the behavior globally and then
adding modifiable behavior only to the required forms or form fields.
It's all up to you!

Please see [the special demo][demo-excluded-elements].


## API

### inputModifiedConfigProvider

Use this provider to configure behavior of this module.
Every setter of this provider supports methods chaining.
See example:

```javascript
angular.module('Application', ['ngInputModified'])
  .config(function(inputModifiedConfigProvider) {
    inputModifiedConfigProvider
      .disableGlobally()
      .setModifiedClassName('my-changed')
      .setNotModifiedClassName('my-clear')
    ;
  })
;
```


| Method                                       | Description
|----------------------------------------------|-------------------------------------------------------------
| enableGlobally()                             | Enables modifiable behavior globally for all form elements (this is default)
| disableGlobally()                            | Disables modifiable behavior globally for all form elements
| setModifiedClassName({string} className)     | Provides CSS class name that will be added to modified elements. `ng-modified` is the default one
| setNotModifiedClassName({string} className)  | Provides CSS class name that will be added to unmodified elements. `ng-not-modified` is the default one


### ngModel


| Property     | Type       | Description
|--------------|------------|---------------------------------------------------------
| masterValue  | `mixed`    | Initial value of the form field
| modified     | `boolean`  | Flag that indicates whether the form field was modified


| Method          | Description
|-----------------|------------------------------------------
| reset()         | Resets input value to it's initial state
| $setPristine()  | Makes form field pristine by preserving current value as a new master value


### ngForm


| Property                 | Type       | Description
|--------------------------|------------|--------------------------------------------------
| modified                 | `boolean`  | Flag that indicates whether the form is modified
| modifiedCount            | `integer`  | The number of modified form fields
| modifiedModels           | `array`    | The list of modified model controllers
| modifiedChildFormsCount  | `integer`  | The number of modified child forms
| modifiedChildForms       | `array`    | The list of modified child form controllers


| Method          | Description
|-----------------|------------------------------------------------------------------------
| reset()         | Resets all input fields of the form to their initial states
| $setPristine()  | Makes form pristine by making all child forms and form fields pristine


### bsModifiable

This directive can be applied to any element on the page. All descendant form
fields (recursively) will respect it.


| Attribute      | Type      | Description
|----------------|-----------|-----------------------------------------------------------------------------------------
| bs-modifiable  | `string`  | Either "true" or "false", see ["excluding some fields" chapter](#excluding-some-fields)


## Changelog

Please see the [complete changelog][changelog] for list of changes.


## Feedback

If you have found a bug or have another issue with the library —
please [create an issue][new-issue].

If you have a question regarding the library or it's integration with your project —
consider asking a question at [StackOverflow][so-ask] and sending me a
link via [E-Mail][email]. I will be glad to help.

Have any ideas or propositions? Feel free to contact me by [E-Mail][email].

Cheers!


## FAQ

### How do I access demos locally?

Node.js must be installed in your OS.

- Install [Gulp][gulp] by running `npm install -g gulp`
- clone the repo
- run `gulp demo` in the repo's root directory
- open `http://localhost:8888/`


## Developer guide

Fork, clone, create a feature branch, commit, create a PR.

Run:

- `npm install && bower install` to initialize the project
- `gulp build` to re-build the dist files
- `gulp demo` to run local webserver with demos
- `gulp demo-deploy` to deploy GitHub Pages

Do not add dist files to the PR itself.
We will re-compile the module manually each time before releasing.


## Support

If you like this library consider to add star on [GitHub repository][repo-gh].

Thank you!


## License

The MIT License (MIT)

Copyright (c) 2014 - 2015 Slava Fomin II, BETTER SOLUTIONS

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

  [changelog]: changelog.md
  [so-ask]:    http://stackoverflow.com/questions/ask?tags=angularjs,javascript,forms
  [email]:     mailto:s.fomin@betsol.ru
  [plunker]:   http://plnkr.co/
  [new-issue]: https://github.com/betsol/angular-input-modified/issues/new
  [gh-pages]:  http://betsol.github.io/angular-input-modified/
  [plunk]:     http://plnkr.co/edit/g2MDXv81OOBuGo6ORvdt?p=preview
  [gulp]:      http://gulpjs.com/
  [repo-gh]:   https://github.com/betsol/angular-input-modified

  [demo-delayed-init]: http://betsol.github.io/angular-input-modified/delayed-init/
  [demo-excluded-elements]: http://betsol.github.io/angular-input-modified/excluded-elements/

  [faq-local-demos]: #how-do-i-access-demos-locally
