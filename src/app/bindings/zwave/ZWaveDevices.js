define([
        "dojo/_base/declare",
        "dijit/layout/BorderContainer",
        "dijit/Toolbar",
        "dijit/form/Button",
        "app/bindings/Device",
        "app/bindings/DeviceSection",
        "dijit/layout/ContentPane",
        "dojo/_base/array", // array.forEach array.map
        "dojo/dom-class" // domClass.remove
    ],
    function (declare, Container, Toolbar, Button, Device, Section, Pane, array, domClass) {
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

            parameters: {"records":[{"domain":"nodes/node5/parameters/configuration1","name":"configuration1","label":"1: Enable/Disable ALL ON/OFF","description":"Activate/Deactive ALL ON/OFF","optional":"false","readonly":"false","type":"LIST","value":"-1","valuelist":{"entry":[{"key":"2","value":"ALL ON active / ALL OFF disabled"},{"key":"1","value":"ALL ON disabled/ ALL OFF active"},{"key":"0","value":"ALL ON disabled/ ALL OFF disabled"},{"key":"255","value":"ALL ON active / ALL OFF active"}]}},{"domain":"nodes/node5/parameters/configuration6","name":"configuration6","label":"6: Separation of association sending (key 1)","description":"Activate/Deactivate association sending for group\n\t\t\t\t1 - Also see param #16","optional":"false","readonly":"false","type":"LIST","value":"0","valuelist":{"entry":[{"key":"2","value":"Map OFF status to all devices in group 1, Double click on key 1 will send ON to all devices in group 1, all dimmers set to 100%"},{"key":"1","value":"Map OFF status to all devices in group 1, Double click on key 1 will send ON to all devices in group 1, all dimmers set to prev.value"},{"key":"0","value":"Map status to all devices in group 1"}]}},{"domain":"nodes/node5/parameters/configuration7","name":"configuration7","label":"7: Control key #2 behaviour","description":"Key no.2 is not represented by any physical device - only\n\t\t\t\tdevices in the association list.\n\t\t\t\tThis functionality prevents of lack of reaction on pressing key no.2\n\t\t\t\tthrough polling devices\n\t\t\t\tfrom association list one by one and checking their actual statuses.","optional":"false","readonly":"false","type":"LIST","value":"1","valuelist":{"entry":[{"key":"1","value":"Device status is checked"},{"key":"0","value":"Device status is not checked"}]}},{"domain":"nodes/node5/parameters/configuration8","name":"configuration8","label":"8: Dimming step at automatic control","description":"","optional":"false","readonly":"false","type":"BYTE","value":"1","minimum":"1","maximum":"99"},{"domain":"nodes/node5/parameters/configuration9","name":"configuration9","label":"9: Time of MANUALLY moving between the extreme dimming values","description":"Options for changing parameter 1-255 (10ms - 2,5s)","optional":"false","readonly":"false","type":"BYTE","value":"5","minimum":"1","maximum":"255"},{"domain":"nodes/node5/parameters/configuration10","name":"configuration10","label":"10: Time of AUTOMATIC moving between the extreme dimming values","description":"Options for changing parameter 1-255 (10ms - 2,5s) - 0: this value disables the smooth change in light intensity. NOTE: value 0 is required for inductive and capacitive devices unsuitable for dimming (e.g. fluorescent lamps, motors, etc...)","optional":"false","readonly":"false","type":"BYTE","value":"1","minimum":"0","maximum":"255"},{"domain":"nodes/node5/parameters/configuration11","name":"configuration11","label":"11: Dimming step at manual control","description":"Options for changing parameter 1-99","optional":"false","readonly":"false","type":"BYTE","value":"1","minimum":"1","maximum":"99"},{"domain":"nodes/node5/parameters/configuration12","name":"configuration12","label":"12: Maximum dimmer level control","description":"Options for changing parameter 2-99","optional":"false","readonly":"false","type":"BYTE","value":"99","minimum":"2","maximum":"99"},{"domain":"nodes/node5/parameters/configuration13","name":"configuration13","label":"13: Minimum dimmer level control","description":"Options for changing parameter 1-98","optional":"false","readonly":"false","type":"BYTE","value":"2"},{"domain":"nodes/node5/parameters/configuration14","name":"configuration14","label":"14: Inputs Button/Switch configuration","description":"Binary inputs type configuration","optional":"false","readonly":"false","type":"LIST","value":"0","valuelist":{"entry":[{"key":"1","value":"Bi-stable input (switch)"},{"key":"0","value":"Mono-stable input (button)"}]}},{"domain":"nodes/node5/parameters/configuration15","name":"configuration15","label":"15: Parm 15","description":"Double-click set lighting at 100%","optional":"false","readonly":"false","type":"LIST","value":"1","valuelist":{"entry":[{"key":"1","value":"Enable double click"},{"key":"0","value":"Disable double click"}]}},{"domain":"nodes/node5/parameters/configuration16","name":"configuration16","label":"16: Saving state before power failure","description":"Saving state before power failure","optional":"false","readonly":"false","type":"LIST","value":"1","valuelist":{"entry":[{"key":"1","value":"State saved at power failure, all outputs are set to previous state upon power restore"},{"key":"0","value":"State NOT saved at power failure, all outputs are set to OFF upon power restore"}]}},{"domain":"nodes/node5/parameters/configuration17","name":"configuration17","label":"17: 3-way switch","description":"The function of 3-way switch provides the option to double key no. 1. The dimmer may control two bi-stable push-buttons or an infinite number of mono-stable push-buttons. (default value 0)","optional":"false","readonly":"false","type":"LIST","value":"0","valuelist":{"entry":{"key":"0","value":"Enable"}}},{"domain":"nodes/node5/parameters/configuration18","name":"configuration18","label":"18: Synchronizing light level for associated devices","description":"The dimmer communicate the level to the associated devices. (default value 0)","optional":"false","readonly":"false","type":"LIST","value":"0","valuelist":{"entry":{"key":"0","value":"Enable"}}},{"domain":"nodes/node5/parameters/configuration19","name":"configuration19","label":"19: Change [On-Off] bi-stable keys","description":"This function allow user to change [On-Off] bi-stable keys (parameter no. 14) (default value 0)","optional":"false","readonly":"false","type":"LIST","value":"0","valuelist":{"entry":{"key":"0","value":"Enable"}}},{"domain":"nodes/node5/parameters/configuration20","name":"configuration20","label":"20: Parm 20","description":"This function will enable decreasing the minimum level of the Dimmer by extending the control impulse.[100 - 170]\n      By changing the minimem level, the user may completely dim LED bulbs. \n      Not all LED bulbs available on the market have the dimmming option.<BR/>\n      <B>WARNING:</B> Wrong setting of the function may cause incorrect operation of the Dimmer.","optional":"false","readonly":"false","type":"BYTE","value":"110","minimum":"100","maximum":"170"},{"domain":"nodes/node5/parameters/configuration30","name":"configuration30","label":"30: Relay 1: Response to General Alarm","description":"","optional":"false","readonly":"false","type":"LIST","value":"3","valuelist":{"entry":[{"key":"3","value":"ALARM FLASHING - relay will turn ON and OFF periodically (see param.39)"},{"key":"2","value":"ALARM RELAY OFF - relay will turn OFF upon receipt of alarm frame"},{"key":"1","value":"ALARM RELAY ON - relay will turn ON upon receipt of alarm frame"},{"key":"0","value":"DEACTIVATION - no response to alarm frames"}]}},{"domain":"nodes/node5/parameters/configuration39","name":"configuration39","label":"39: ALARM FLASHING alarm time","description":"Amount of time (ms) the device keeps on flashing after receipt of Alarm Frame","optional":"false","readonly":"false","type":"SHORT","value":"600"}]},
            associations: {"records":[{"domain":"nodes/node5/associations/association1/","name":"association1/","label":"Switch 1","optional":"false","readonly":"false","value":"0 of 5 group members","actionlist":{"entry":{"key":"Refresh","value":"Refresh"}}},{"domain":"nodes/node5/associations/association2/","name":"association2/","label":"Switch 2","optional":"false","readonly":"false","value":"0 of 5 group members","actionlist":{"entry":{"key":"Refresh","value":"Refresh"}}},{"domain":"nodes/node5/associations/association3/","name":"association3/","label":"Controller Updates","optional":"false","readonly":"true","value":"1 of 1 group members","actionlist":{"entry":{"key":"Refresh","value":"Refresh"}}}]},
            status: {"records":[{"domain":"nodes/node5/status/LastUpdated","name":"LastUpdated","label":"Last Updated","optional":"false","readonly":"true","value":"Tue May 20 12:35:35 BST 2014"},{"domain":"nodes/node5/status/LastHeal","name":"LastHeal","label":"Heal Status","optional":"false","readonly":"true","value":"DONE @ Tue May 20 02:06:26 BST 2014"},{"domain":"nodes/node5/status/NodeStage","name":"NodeStage","label":"Node Stage","optional":"false","readonly":"true","value":"Node Complete @ Mon May 19 15:43:42 BST 2014"},{"domain":"nodes/node5/status/Listening","name":"Listening","label":"Listening","optional":"false","readonly":"true","value":"true"},{"domain":"nodes/node5/status/Routing","name":"Routing","label":"Routing","optional":"false","readonly":"true","value":"true"},{"domain":"nodes/node5/status/Packets","name":"Packets","label":"Packet Statistics","optional":"false","readonly":"true","value":"1 / 134"},{"domain":"nodes/node5/status/Dead","name":"Dead","label":"Dead","optional":"false","readonly":"true","value":"false"},{"domain":"nodes/node5/status/Power","name":"Power","label":"Power","optional":"false","readonly":"true","value":"Mains"},{"domain":"nodes/node5/status/LibType","name":"LibType","label":"Library Type","optional":"false","readonly":"true","value":"Slave Enhanced"},{"domain":"nodes/node5/status/ProtocolVersion","name":"ProtocolVersion","label":"Protocol Version","optional":"false","readonly":"true","value":"6.4"},{"domain":"nodes/node5/status/AppVersion","name":"AppVersion","label":"Application Version","optional":"false","readonly":"true","value":"1.6"}]},

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
                var toolbar = new Toolbar({region:"top"});
                array.forEach(toolDefinition, function(def){
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

                var pane = new Pane({region:"center"})

                array.forEach(this.records, function (entry, i) {
                    console.debug(entry, "at index", i);

                    var device = new Device({
                        titleLabel: "Device",
                        title: entry.label != null ? entry.label : "",
                        typeLabel: "Type",
                        type: entry.value != null ? entry.value : "",
                        statusLabel: "Location",
                        baseClass: ""
                    });

                    device.setStatus(entry.state);

                    pane.addChild(device);
                });

                this.addChild(pane);
            },
            startup: function () {
                this.inherited(arguments);
                this.resize();
            }
        })
    })
;