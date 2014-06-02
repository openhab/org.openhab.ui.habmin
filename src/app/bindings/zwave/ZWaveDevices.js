define([
        "dojo/_base/declare",
        "dijit/layout/BorderContainer",
        "dijit/Toolbar",
        "dijit/form/Button",
        "app/bindings/Device",
        "app/bindings/DeviceSection",
        "dijit/layout/ContentPane",
        "dojo/dnd/Source",
        "dojo/_base/array", // array.forEach array.map
        "dojo/dom-class" // domClass.remove
    ],
    function (declare, Container, Toolbar, Button, Device, Section, ContentPane, Source, array, domClass) {
        return declare(Container, {
            gutters: false,

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

            associations: {"records": [
                {"domain": "nodes/node5/associations/association1/", "name": "association1/", "label": "Switch 1", "optional": "false", "readonly": "false", "value": "0 of 5 group members", "actionlist": {"entry": {"key": "Refresh", "value": "Refresh"}}},
                {"domain": "nodes/node5/associations/association2/", "name": "association2/", "label": "Switch 2", "optional": "false", "readonly": "false", "value": "0 of 5 group members", "actionlist": {"entry": {"key": "Refresh", "value": "Refresh"}}},
                {"domain": "nodes/node5/associations/association3/", "name": "association3/", "label": "Controller Updates", "optional": "false", "readonly": "true", "value": "1 of 1 group members", "actionlist": {"entry": {"key": "Refresh", "value": "Refresh"}}}
            ]},
            status: {"records": [
                {"domain": "nodes/node5/status/LastUpdated", "name": "LastUpdated", "label": "Last Updated", "optional": "false", "readonly": "true", "value": "Tue May 20 12:35:35 BST 2014"},
                {"domain": "nodes/node5/status/LastHeal", "name": "LastHeal", "label": "Heal Status", "optional": "false", "readonly": "true", "value": "DONE @ Tue May 20 02:06:26 BST 2014"},
                {"domain": "nodes/node5/status/NodeStage", "name": "NodeStage", "label": "Node Stage", "optional": "false", "readonly": "true", "value": "Node Complete @ Mon May 19 15:43:42 BST 2014"},
                {"domain": "nodes/node5/status/Listening", "name": "Listening", "label": "Listening", "optional": "false", "readonly": "true", "value": "true"},
                {"domain": "nodes/node5/status/Routing", "name": "Routing", "label": "Routing", "optional": "false", "readonly": "true", "value": "true"},
                {"domain": "nodes/node5/status/Packets", "name": "Packets", "label": "Packet Statistics", "optional": "false", "readonly": "true", "value": "1 / 134"},
                {"domain": "nodes/node5/status/Dead", "name": "Dead", "label": "Dead", "optional": "false", "readonly": "true", "value": "false"},
                {"domain": "nodes/node5/status/Power", "name": "Power", "label": "Power", "optional": "false", "readonly": "true", "value": "Mains"},
                {"domain": "nodes/node5/status/LibType", "name": "LibType", "label": "Library Type", "optional": "false", "readonly": "true", "value": "Slave Enhanced"},
                {"domain": "nodes/node5/status/ProtocolVersion", "name": "ProtocolVersion", "label": "Protocol Version", "optional": "false", "readonly": "true", "value": "6.4"},
                {"domain": "nodes/node5/status/AppVersion", "name": "AppVersion", "label": "Application Version", "optional": "false", "readonly": "true", "value": "1.6"}
            ]},

            postCreate: function () {
                this.inherited(arguments);
                var me = this;

                var toolDefinition = [
                    {
                        label: "Heal",
                        menuRef: "heal",
                        iconClass: "habminIconHeal"
                    },
                    {
                        label: "Include",
                        menuRef: "include",
                        iconClass: "habminIconInclude"
                    },
                    {
                        label: "Exclude",
                        menuRef: "exclude",
                        iconClass: "habminIconExclude"
                    }
                ];
                var toolbar = new Toolbar({region: "top"});
                array.forEach(toolDefinition, function (def) {
                    var button = new Button({
                        // note: should always specify a label, for accessibility reasons.
                        // Just set showLabel=false if you don't want it to be displayed normally
                        label: def.label,
                        showLabel: true,
                        iconClass: "habminButtonIcon " + def.iconClass
                    });

                    toolbar.addChild(button);
                });
                this.addChild(toolbar);

                var devicePane = new ContentPane({
                    region: 'center',
                    'class': 'habminDeviceContainer'
                });
                var deviceList = new Source(devicePane.domNode);

                array.forEach(this.records, function (entry, i) {
                    console.debug(entry, "at index", i);

                    var device = new Device({
                        titleLabel: "Device",
                        title: entry.label != null ? entry.label : "",
                        typeLabel: "Type",
                        type: entry.value != null ? entry.value : "",
                        statusLabel: "Location",
                        'class': 'dojoDndItem'
                    });

                    device.setStatus(entry.state);

                    deviceList.insertNodes(false, [device.domNode]);
                });

                this.addChild(devicePane);
            },
            startup: function () {
                this.inherited(arguments);
                this.resize();
            }
        })
    })
;