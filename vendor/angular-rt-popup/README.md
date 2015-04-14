# angular-rt-popup

> A better version of the Bootstrap popover, for Angular.JS

[![Build Status](https://travis-ci.org/rubenv/angular-rt-popup.png?branch=master)](https://travis-ci.org/rubenv/angular-rt-popup)

## Installation
Add angular-rt-popup to your project:

```
bower install --save angular-rt-popup
```

Add it to your HTML file:

```html
<script src="bower_components/angular-rt-popup/dist/angular-rt-popup.min.js"></script>
```

Reference it as a dependency for your app module:

```js
angular.module('myApp', ['rt.popup']);
```

### Requirements

This module requires:

* Angular.JS (obviously)
* JQuery (mainly for `$.contains`)

## Usage

Use the `popup-show` directive to show a popup:

```html
<a popup-show="popup.html" class="btn btn-primary">Show popup!</a>
```

This will load `popup.html` and show it in the popup. Use [Bootstrap](http://getbootstrap.com/) classes for styling the popup (I recommend that you load the Bootstrap CSS to make it look pretty).

Here's an example:

```html
<h3 class="popover-title">Hello!</h3>

<div class="popover-content">
    <p>This is a popup</p>

    <a ng-click="hidePopover()" class="btn btn-primary">Go away!</a>
</div>
```

You can use `hidePopover()` inside the popup to hide the popover. Any click outside the popup also closes it.

### `popup-placement`

You can control the placement of the popup by adding a `popup-placement` attribute.

```html
<a popup-show="popup.html" popup-placement="right">Show popup!</a>
```

Supported values: `right`, `left`, `bottom`, `bottom-left`, `top`.

### `popup-placement-fn`

A function that can control the placement of a popup based on the given screen location. It receives an anchor object and should return `right`, `left`, `bottom`, `bottom-left` or `top`.

The anchor object has the following properties: `top`, `left`, `width`, `height`.

If this function is defined it will override the placement attribute.

```html
<a popup-show="popup.html" popup-placement-fn="placement">Show popup!</a>
```

```javascript
scope.placement = function (anchor) {
    return anchor.left < $window.width / 2 ? "right" : "left";
};
```

### `popup-if`

Popups can be made conditional by adding a `popup-if` attribute. The popup will only be shown if the expression is true.

```html
<a popup-show="popup.html" popup-if="showInPopup">Show popup!</a>
```

### `popup-class`

Adds extra classes to the popover wrapper.

```html
<a popup-show="popup.html" popup-class="custom-style">Show popup!</a>
```

### `popup-shown`

A function that will be called when the popup is shown.

```html
<a popup-show="popup.html" popup-shown="onShown()">Show popup!</a>
```

### `popup-hidden`

A function that will be called when the popup is hidden.

```html
<a popup-show="popup.html" popup-hidden="onHidden()">Show popup!</a>
```

### `popup-auto-show`

Will auto show the popup when it evaluates to true.

```html
<a popup-show="popup.html" popup-auto-show="showIt">Show popup!</a>
```

### `popup-overlap`

You can control the overlap position with the anchor element by adding a `popup-overlap` attribute.

```html
<a popup-show="popup.html" popup-overlap="10">Show popup!</a>
```

## License

    (The MIT License)

    Copyright (C) 2014-2015 by Ruben Vermeersch <ruben@rocketeer.be>

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
