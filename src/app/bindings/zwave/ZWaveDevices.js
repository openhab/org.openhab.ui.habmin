define([
        "dojo/_base/declare",
        "dijit/layout/ContentPane",
        "app/bindings/Device",
        "dijit/layout/ContentPane",
        "dojo/_base/array" // array.forEach array.map
    ],
    function (declare, Container, Device, Pane, array) {
        return declare(Container, {
            records: [
                {"domain": "nodes/node1/", "label": "Node 1", "optional": "false", "readonly": "true", "state": "OK", "value": "Z-Stick S2 Z-Wave USB Controller", "actionlist": {"entry": {"key": "Heal", "value": "Heal Node"}}},
                {"domain": "nodes/node33/", "label": "Node 33", "optional": "false", "readonly": "true", "state": "INITIALIZING", "value": "FGMS01 Movement Sensor", "actionlist": {"entry": [
                    {"key": "Delete", "value": "Delete Node"},
                    {"key": "Heal", "value": "Heal Node"}
                ]}},
                {"domain": "nodes/node5/", "label": "Node 5", "optional": "false", "readonly": "true", "state": "OK", "value": "FGD211 Universal Dimmer 500W", "actionlist": {"entry": {"key": "Heal", "value": "Heal Node"}}},
                {"domain": "nodes/node6/", "label": "Node 6", "optional": "false", "readonly": "true", "state": "OK", "value": "FGD211 Universal Dimmer 500W", "actionlist": {"entry": {"key": "Heal", "value": "Heal Node"}}},
                {"domain": "nodes/node7/", "label": "Node 7", "optional": "false", "readonly": "true", "state": "OK", "value": "FGD211 Universal Dimmer 500W", "actionlist": {"entry": {"key": "Heal", "value": "Heal Node"}}},
                {"domain": "nodes/node8/", "label": "Node 8", "optional": "false", "readonly": "true", "state": "OK", "value": "FGS221 Double Relay Switch 2x1.5kW", "actionlist": {"entry": {"key": "Heal", "value": "Heal Node"}}},
                {"domain": "nodes/node9/", "label": "Node 9", "optional": "false", "readonly": "true", "state": "OK", "value": "FGS221 Double Relay Switch 2x1.5kW", "actionlist": {"entry": {"key": "Heal", "value": "Heal Node"}}},
                {"domain": "nodes/node10/", "label": "Node 10", "optional": "false", "readonly": "true", "state": "OK", "value": "FGS221 Double Relay Switch 2x1.5kW", "actionlist": {"entry": {"key": "Heal", "value": "Heal Node"}}},
                {"domain": "nodes/node11/", "label": "Node 11", "optional": "false", "readonly": "true", "state": "OK", "value": "FGD211 Universal Dimmer 500W", "actionlist": {"entry": {"key": "Heal", "value": "Heal Node"}}},
                {"domain": "nodes/node14/", "label": "Node 14", "optional": "false", "readonly": "true", "state": "INITIALIZING", "actionlist": {"entry": [
                    {"key": "Delete", "value": "Delete Node"},
                    {"key": "Heal", "value": "Heal Node"}
                ]}},
                {"domain": "nodes/node15/", "label": "Node 15", "optional": "false", "readonly": "true", "state": "INITIALIZING", "actionlist": {"entry": [
                    {"key": "Delete", "value": "Delete Node"},
                    {"key": "Heal", "value": "Heal Node"}
                ]}},
                {"domain": "nodes/node16/", "label": "Node 16", "optional": "false", "readonly": "true", "state": "OK", "value": "ZG8101 Garage Door Tilt Sensor", "actionlist": {"entry": {"key": "Heal", "value": "Heal Node"}}},
                {"domain": "nodes/node18/", "label": "Node 18", "optional": "false", "readonly": "true", "state": "OK", "value": "FGK101 Door Opening Sensor", "actionlist": {"entry": {"key": "Heal", "value": "Heal Node"}}}
            ],

            content: "BLAH",
            postCreate: function () {
                var me = this;
                array.forEach(this.records, function (entry, i) {
                    console.debug(entry, "at index", i);

                    var device = new Device({
                        titleLabel: "Devicexxx",
                        title: entry.label,
                        typeLabel: "Type",
                        type: entry.value,
                        statusLabel: "Location"
                    });
                    device.addChild(new Pane({content: "<p>Optionally set new content now 1</p>"}));
//                    x.addChild(new Pane({content: "<p>Optionally set new content now 2</p>"}));
                    //this.addChild(device);

                });
                /*                var x = new Device({
                 title: "This is a content pane",
                 titleLabel: "Node",
                 content: "Hi 1!"
                 });
                 me.container.addChild(x);*/
                //  me.container.placeAt("content");
            },
            startup: function () {
                this.inherited(arguments);
                this.resize();
            }
        })
    })
;