/**
 * HABmin Home Automation Administration Console
 * @author Chris Jackson
 *
 * This class implements a periodical polling, and if there's a timeout
 * updates the status indicator.
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/request",
        "dojo/dom-class",
        "dojox/timing",
        "app/main/Notification",
        "dijit/Tooltip"
    ],
    function (declare, lang, request, domClass, Timing, Notification, Tooptip) {
        return declare(null, {
            period: 5000,
            timeout: 2500,
            status: null,
            errorMax: 0,
            errorCnt: 0,
            constructor: function (/*Object?*/params, /*DomNode?*/node) {
                if (params) {
                    lang.mixin(this, params);
                }

                new Tooltip({
                    connectId: ["onlineStatus"],
                    label: "Online Status"
                });

                // Initialise the notification system
                this.notification = Notification();

                // Create the periodic timer
                this.timer = new Timing.Timer(this.period);

                // Set up the callback functions
                this.timer.onTick = lang.hitch(this, function () {
                    // Stop the timer
                    // We'll restart it again after the request.
                    // This just ensures that we only make one request every 'period'
                    this.timer.stop();
                    request("helloworld.txt", {
                        timeout: this.timeout,
                        handleAs: 'json'
                    }).then(
                        lang.hitch(this, function (text) {
                            console.log("The file's contents is: " + text);
                            this.errorCnt = 0;
                            if (this.status != true) {
                                this.status = true;
                                domClass.remove(node);
                                domClass.add(node, "status-online");
                            }
                            this.timer.start();
                        }),
                        lang.hitch(this, function (error) {
                            console.log("An error occurred: " + error);
                            this.errorCnt++;
                            if (this.errorCnt >= this.errorMax && this.status != false) {
                                this.status = false;
                                domClass.remove(node);
                                domClass.add(node, "status-offline");
                                this.notification.alert(this.notification.ERROR, "Server disconnected!")
                            }
                            this.timer.start();
                        })
                    );
                });

                // And finally, set ourselves running
                this.timer.start();
            }
        });
    });