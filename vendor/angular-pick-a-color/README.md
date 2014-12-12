angular-pick-a-color
====================
AngularJS directive for the pick-a-color JQuery plugin.

https://github.com/lauren/pick-a-color

usage:
Include the ```'pickAColor'``` module in your application.

```
<pick-a-color id="inputColor" ng-model="model.color" inline-dropdown="true"></pick-a-color>
```


To set default options, you can use the configuration provider in your apps config method -:

```
.config(function myAppConfig(pickAColorProvider) {
    pickAColorProvider.setOptions({
        inlineDropdown: true
    });
})
```
