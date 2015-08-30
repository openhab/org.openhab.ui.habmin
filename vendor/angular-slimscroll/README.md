angular-slimscroll
==================
This is a small directive to allow the use of jquery slimScroll plugin (https://github.com/rochal/jQuery-slimScroll) in angular.
Get more detailed information about slimScroll, please visit: http://rocha.la/jQuery-slimScroll

Usage
------------

```html
<div class="scroll-body" slimscroll="{slimscrollOption: value}">
  Scroll Content
</div>
```

Options
-------
* **noWatch** - Prevent directive from watching the option object
* **width** - Width in pixels of the visible scroll area. Stretch-to-parent if not set. Default: none
* **height** - Height in pixels of the visible scroll area. Also supports auto to set the height to same as parent container. Default: 250px
* **size** - Width in pixels of the scrollbar. Default: 7px
* **position** - left or right. Sets the position of the scrollbar. Default: right
* **color** - Color in hex of the scrollbar. Default: #000000
* **alwaysVisible** - Disables scrollbar hide. Default: false
* **distance** - Distance in pixels from the edge of the parent element where scrollbar should appear. It is used together with position property. Default:1px
* **start** - top or bottom or $(selector) - defines initial position of the scrollbar. When set to bottom it automatically scrolls to the bottom of the scrollable container. When HTML element is passed, slimScroll defaults to offsetTop of this element. Default: top.
* **wheelStep** - Integer value for mouse wheel delta. Default: 20
* **railVisible** - Enables scrollbar rail. Default: false
* **railColor** - Sets scrollbar rail color, Default: #333333
* **railOpacity** - Sets scrollbar rail opacity. Default: 0.2
* **allowPageScroll** - Checks if mouse wheel should scroll page when bar reaches top or bottom of the container. When set to true is scrolls the page.Default: false
* **scrollTo** - Jumps to the specified scroll value. Can be called on any element with slimScroll already enabled. Example: $(element).slimScroll({ scrollTo: '50px' });
* **scrollBy** - Increases/decreases current scroll value by specified amount (positive or negative). Can be called on any element with slimScroll already enabled. Example: $(element).slimScroll({ scrollBy: '60px' });
* **disableFadeOut** - Disables scrollbar auto fade. When set to true scrollbar doesn't disappear after some time when mouse is over the slimscroll div.Default: false
* **touchScrollStep** - Allows to set different sensitivity for touch scroll events. Negative number inverts scroll direction.Default: 200

License
-------
angular-slimscroll is released under the [MIT License](http://en.wikipedia.org/wiki/MIT_License). Feel free to use it in personal and commercial projects.
