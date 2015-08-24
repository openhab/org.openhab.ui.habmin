Angular Screenfull
==================

## Install

#### Download via bower or look for the files in the dist folder

    $ bower install --save angular-screenfull

#### Import it to your page

    <script src="bower_components/screenfull/dist/screenfull.js"></script>
    <script src="bower_components/angular-screenfull/dist/angular-screenfull.min.js"></script>

Note that [screenfull](https://github.com/sindresorhus/screenfull.js) is added as a bower dependency
so if you use [main bower files](https://github.com/ck86/main-bower-files) the dependency will be added for you

#### Enable it on your app

    angular.module('myModule', ['angularScreenfull']);

## Use it

In its simplest form, you can do something like this

```html
<div ngsf-fullscreen>
    <p>This is a fullscreen element</p>
    <button ngsf-toggle-fullscreen>Toggle fullscreen</button>
</div>
```

The `ngsf-fullscreen` indicates which element is going to be the fullscreen element and the `ngsf-toggle-fullscreen`
will toggle the fullscren when clicked.

Note that you can have multiple `ngsf-fullscreen` elements living side by side, the other directives require that a
parent controller exists.

You can also expose the element controller trough its directive name. So for example you can achieve the same result
using this

```html
<div ngsf-fullscreen="fullscreenCtrl">
    <p>This is another fullscreen element</p>
    <button ng-click="fullscreenCtrl.toggleFullscreen()">Toggle fullscreen</button>
</div>
```

We also provide directives to show the elements based on the fullscreen status, so for example you can have this

```html
<div ngsf-fullscreen>
    <p>This is yet another fullscreen element</p>
    <a ngsf-toggle-fullscreen show-if-fullscreen-enabled>
        <i show-if-fullscreen=false>Icon for enter fullscreen</i>
        <i show-if-fullscreen=true>Icon for exit fullscreen</i>
    </a>
</div>
```

