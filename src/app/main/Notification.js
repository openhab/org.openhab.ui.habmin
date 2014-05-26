/**
 * HABmin Home Automation Administration Console
 * @author Chris Jackson
 *
 * This class implements a singleton notification system
 */
define(
    [
    "dojo/_base/declare",
    "dojox/mobile/Badge",
    "dgrowl/main",
    "dojo/dom",
    "dojo/dom-construct"
    ],function(declare, Badge, Growl, dom, domConstruct) {
        var warningCnt = 0;
        var errorCnt = 0;
        var errorBadge = null;
        var warningBadge = null;
        var growl = null;
        return declare(null, {
            ERROR: "error",
            SUCCESS: "success",
            INFO: "info",
            initialise: function () {
                growl = new Growl({region: "right", 'channels': [
                    {'name': 'success', 'pos': 3},
                    {'name': 'info', 'pos': 2},
                    {'name': 'error', 'pos': 1}
                ]});

                new Tooltip({
                    connectId: ["notificationButton"],
                    label: "Notifications"
                });
            },
            alert: function (type, string) {
                if (growl == null)
                    this.initialise();
                switch(type) {
                    case this.ERROR:
                        errorCnt++;
                        if(errorBadge == null) {
                            errorBadge = new Badge({value: "1", className: "mblDomButtonErrorBadge"});
                            dom.byId("notificationButton").appendChild(errorBadge.domNode);
                        }
                        else
                            errorBadge.setValue(errorCnt);
                        break;
                    case this.WARNING:
                        warningCnt++;
                        if(warningBadge == null) {
                            warningBadge = new Badge({value: "1", className: "mblDomButtonWarningBadge"});
                            dom.byId("notificationButton").appendChild(warningBadge.domNode);
                        }
                        else
                            warningBadge.setValue(warningCnt);
                        break;
                }
                growl.addNotification(string, {'channel': type});
//                domConstruct.destroy(warningBadge.domNode);
//                warningBadge = null;
            }

        });

/*
    var instance = null;

    function MySingleton(){
        if(instance !== null){
            throw new Error("Cannot instantiate more than one MySingleton, use MySingleton.getInstance()");
        }

        this.initialize();
    }
    MySingleton.prototype = {
        initialize: function(){
            // summary:
            //      Initializes the singleton.

            this.foo = 0;
            this.bar = 1;
        }
    };
    MySingleton.getInstance = function(){
        // summary:
        //      Gets an instance of the singleton. It is better to use
        if(instance === null){
            instance = new MySingleton();
        }
        return instance;
    };

    return MySingleton.getInstance();*/
});



    /*
    , function (declare, Badge, Growl, dom) {
    var _instance;
    function Singleton() {
    }
    Singleton.prototype = {
        initialise: function () {
            this.errorBadge = new Badge({value: "0", className: "mblDomButtonErrorBadge"});
            dom.byId("notificationButton").appendChild(this.errorBadge.domNode);
            this.warningbadge = new Badge({value: "12", className: "mblDomButtonWarningBadge"});
            dom.byId("notificationButton").appendChild(this.warningbadge.domNode);

            this.growl = new Growl({region: "right", 'channels': [
                {'name': 'success', 'pos': 3},
                {'name': 'info', 'pos': 2},
                {'name': 'error', 'pos': 1}
            ]});
            this.growl.addNotification('Ut oh, something broke!', {'channel': 'error'});
            this.growl.addNotification('But it is now fixed', {'channel': 'success'});
        },
        alert: function(type, string) {
            this.growl.addNotification('Ut oh, something broke!', {'channel': 'error'});
        }
    };
    if (!_instance) {
        _instance = new Singleton();
        _instance.initialise();
    }
    return _instance;
});
*/