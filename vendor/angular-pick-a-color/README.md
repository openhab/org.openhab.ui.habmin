angular-pick-a-color
====================
AngularJS directive for the pick-a-color JQuery plugin.

https://github.com/lauren/pick-a-color

Installation:
Install with bower:
```
bower install angular-pick-a-color --save
```

This should grab all the dependancies. Alternatively, download the files from this repo (angular-pick-a-color.js) and also grab the js file and css from the pick-a-color repo…

Then, in your index file, you need to add the following lines -:

   <script type="text/javascript" src="vendor/tinycolor/tinycolor.js"></script>    
   <script type="text/javascript" src="vendor/pick-a-color/src/js/pick-a-color.js"></script>
   <script type="text/javascript" src="vendor/angular-pick-a-color/src/angular-pick-a-color.js"></script>

   <link rel="stylesheet" type="text/css" href="vendor/pick-a-color/src/js/pick-a-color.css"/>

(obviously change the folder names and the pick-a-color css file might have a version number - take a look at the pick-a-color site).


Usage:
Include the ```'pickAColor'``` module in your application and use the following directive in your html. 
pick-a-color options can be placed in the definition as shown below.

```
<pick-a-color id="inputColor" ng-model="color" inline-dropdown="true"></pick-a-color>
```


To set default options, you can use the configuration provider in your apps config method -:

```
.config(function myAppConfig(pickAColorProvider) {
    pickAColorProvider.setOptions({
        inlineDropdown: true
    });
})
```
