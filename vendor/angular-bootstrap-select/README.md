angular-bootstrap-select
========================

Directive to wrap [bootstrap-select](http://silviomoreto.github.io/bootstrap-select/). This directive aims to proxy the behavior of the plugin bootstrap-select, in the AngularJS style, see the documentation on the [plugin page](http://silviomoreto.github.io/bootstrap-select/).

## Requirements
- ([jQuery](http://jquery.com/))
- ([bootstrap-select](http://silviomoreto.github.io/bootstrap-select/))
- ([AngularJS](http://angularjs.org/))

## Install

```bash
$ bower install angular-bootstrap-select
```

## Examples

### [Live demo](http://joaoneto.github.io/angular-bootstrap-select/)

### Demo in `demo/index.html` folder

### Html snippet

```html
<script src="../bower_components/angular-bootstrap-select/build/angular-bootstrap-select.min.js"></script>

<select class="selectpicker">
  <option>Mustard</option>
  <option>Ketchup</option>
  <option>Relish</option>
</select>
```

## TODO

Implement ngOptions with selectpicker
```html
<select ng-model="form" class="selectpicker" ng-options="color.name for color in colors"></select>
```

## Testing

```bash
$ npm install
$ bower install
$ grunt
```

## License
The MIT License (MIT)

Copyright (c) 2014 João Pinto Neto

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
