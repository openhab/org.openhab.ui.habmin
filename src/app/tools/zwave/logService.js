/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('ZWaveLogReader', [])

    .service('ZWaveLogReader', function ($q, $timeout) {
        // Constant definitions
        var REQUEST = "Request";
        var RESPONSE = "Response";
        var ERROR = "danger";
        var WARNING = "warning";
        var INFO = "info";
        var SUCCESS = "";
        var fileName = "";

        // Some globals used by the processor
        var logTime = 0;
        var lastNode = 0;
        var lastCmd = {};
        var lastSendData = {};
        var lastPacketRx = null;
        var lastPacketTx = null;

        var countLines = 0;
        var countEntries = 0;
        var loadProgress = 0;
        var nodeInfoProcessed = false;
        var data = [];

        this.getData = function () {
            return data;
        };

        this.getLinesProcessed = function () {
            return countLines;
        };

        this.getFileName = function () {
            return fileName;
        };

        this.getNodes = function () {
            return nodes;
        };

        /**
         * Process the node information looking for errors etc
         */
        function processDeviceInformation() {
            angular.forEach(nodes, function (node) {
                if (node.responseTimeMin < 0) {
                    node.responseTimeMin = 0;
                }
                if (node.responseTimeAvg < 0) {
                    node.responseTimeAvg = 0;
                }
                if (node.responseTimeMax < 0) {
                    node.responseTimeMax = 0;
                }
                if (node.responseTimeCnt == 0) {
                    node.responseTimeMin = "-";
                    node.responseTimeAvg = "-";
                    node.responseTimeMax = "-";
                }
                else {
                    node.responseTimeAvg =
                        Math.round(node.responseTimeAvg / node.responseTimeCnt);
                }

                if (node.messagesSent == null || node.messagesSent == 0) {
                    node.retryPercent = 0;
                }
                else {
                    node.retryPercent = Math.ceil(node.responseTimeouts * 100 / node.messagesSent);
                }

                // Process any errors/warnings for battery devices
                if (node.isListening == false) {
                    if (node.wakeupCnt == null || node.wakeupCnt == 0) {
                        node.warnings.push("Device appears to be battery operated, but has not woken up")
                    }
                    if (node.wakeupNode != null && nodes[255] != null && node.wakeupNode != nodes[255].controllerID) {
                        node.errors.push("Wakeup node is not set to the controller")
                    }
                    if (node.wakeupInterval != null && node.wakeupInterval == 0) {
                        node.errors.push("Wakeup interval is set to 0")
                    }
                }

                if (nodes[255] != null && node.id == nodes[255].controllerID) {
                    if (node.isListening == false) {
                        node.errors.push("Device is the controller, but it's not listening");
                    }
                }

                if (node.neighboursList != null) {
                    node.neighboursUnknown = 0;
                    node.neighboursListening = 0;
                    angular.forEach(node.neighboursList, function (neighbour) {
                        if (nodes[neighbour] != null) {
                            if (nodes[neighbour].isListening == null) {
                                node.neighboursUnknown++;
                            }
                            else if (nodes[neighbour].isListening == true) {
                                node.neighboursListening++;
                            }
                        }
                    });
                }

                if (node.neighboursTotal != null) {
                    if (node.neighboursTotal == 0) {
                        node.errors.push("Node has no neighbours");
                    }
                    else if (node.neighboursTotal < 4) {
                        node.warnings.push("Node only has " + node.neighboursTotal + " neighbours");
                    }

                    if (node.neighboursListening != node.neighboursTotal) {
                        if (node.neighboursListening == 0) {
                            node.errors.push("Node has no listening neighbours");
                        }
                        else if (node.neighboursListening < 4) {
                            node.warnings.push("Node only has " + node.neighboursListening + " listening neighbours");
                        }
                    }
                }

                if (node.responseTimeAvg > 1000) {
                    node.errors.push("Average response time is very high (" + node.responseTimeAvg + ")");
                }
                else if (node.responseTimeAvg > 500) {
                    node.warnings.push("Average response time is high (" + node.responseTimeAvg + ")");
                }

                if (node.messagesSent > 40 && node.retryPercent > 15) {
                    node.errors.push("Node has a very high timeout ratio (" + node.retryPercent + "%)");
                }
                else if (node.messagesSent > 20 && node.retryPercent > 5) {
                    node.warnings.push("Node has a high timeout ratio (" + node.retryPercent + "%)");
                }
            });

            nodeInfoProcessed = true;
        };

        // Packet type definitions
        var packetTypes = {
            2: {
                name: "SerialApiGetInitData",
                processor: processInitData
            },
            4: {
                name: "ApplicationCommandHandler",
                processor: processApplicationCommand
            },
            5: {
                name: "GetControllerCapabilities",
                processor: null
            },
            6: {
                name: "SerialApiSetTimeouts",
                processor: null
            },
            7: {
                name: "SerialApiGetCapabilities",
                processor: processControllerInfo
            },
            8: {
                name: "SerialApiSoftReset",
                processor: null
            },
            19: {
                name: "SendData",
                processor: processSendData
            },
            21: {
                name: "GetVersion",
                processor: processGetVersion
            },
            22: {
                name: "SendDataAbort",
                status: WARNING,
                processor: null
            },
            32: {
                name: "MemoryGetId",
                processor: processMemoryGetId
            },
            64: {
                name: "SetLearnNodeState",
                processor: null
            },
            65: {
                name: "IdentifyNode",
                processor: processIdentifyNode
            },
            66: {
                name: "SetDefault",
                processor: null
            },
            70: {
                name: "AssignReturnRoute",
                processor: processControllerCmd
            },
            71: {
                name: "DeleteReturnRoute",
                processor: processControllerCmd
            },
            72: {
                name: "RequestNodeNeighborUpdate",
                processor: processNodeNeighborUpdate
            },
            73: {
                name: "ApplicationUpdate",
                processor: processAppUpdate
            },
            74: {
                name: "AddNodeToNetwork",
                processor: null
            },
            75: {
                name: "RemoveNodeFromNetwork",
                processor: null
            },
            80: {
                name: "SetLearnMode",
                processor: null
            },
            81: {
                name: "AssignSucReturnRoute",
                processor: null
            },
            82: {
                name: "EnableSuc",
                processor: null
            },
            84: {
                name: "SetSucNodeID",
                processor: null
            },
            85: {
                name: "DeleteSUCReturnRoute",
                processor: null
            },
            86: {
                name: "GetSucNodeId",
                processor: processSucNodeId
            },
            87: {
                name: "SendSucId",
                processor: null
            },
            96: {
                name: "RequestNodeInfo",
                processor: processControllerCmd
            },
            97: {
                name: "RemoveFailedNodeID",
                processor: null
            },
            98: {
                name: "IsFailedNodeID",
                processor: processFailedNode
            },
            128: {
                name: "GetRoutingInfo",
                processor: processRoutingInfo
            }
        };

        // Command class definitions
        var commandClasses = {
            0: {
                name: "NO_OPERATION",
                processor: null
            },
            32: {
                name: "BASIC",
                commands: {
                    1: {
                        name: "BASIC_SET"
                    },
                    2: {
                        name: "BASIC_GET"
                    },
                    3: {
                        name: "BASIC_REPORT"
                    }
                }
            },
            34: {
                name: "APPLICATION_STATUS",
                processor: null
            },
            37: {
                name: "SWITCH_BINARY",
                commands: {
                    1: {
                        name: "SWITCH_BINARY_SET"
                    },
                    2: {
                        name: "SWITCH_BINARY_GET"
                    },
                    3: {
                        name: "SWITCH_BINARY_REPORT"
                    }
                }
            },
            38: {
                name: "SWITCH_MULTILEVEL",
                commands: {
                    1: {
                        name: "SWITCH_MULTILEVEL_SET"
                    },
                    2: {
                        name: "SWITCH_MULTILEVEL_GET"
                    },
                    3: {
                        name: "SWITCH_MULTILEVEL_REPORT"
                    },
                    4: {
                        name: "SWITCH_MULTILEVEL_START_LEVEL_CHANGE"
                    },
                    5: {
                        name: "SWITCH_MULTILEVEL_STOP_LEVEL_CHANGE"
                    },
                    6: {
                        name: "SWITCH_MULTILEVEL_SUPPORTED_GET"
                    },
                    7: {
                        name: "SWITCH_MULTILEVEL_SUPPORTED_REPORT"
                    }
                }
            },
            39: {
                name: "SWITCH_ALL",
                processor: null
            },
            40: {
                name: "SWITCH_TOGGLE_BINARY",
                commands: {
                    1: {
                        name: "SWITCH_TOGGLE_BINARY_SET"
                    },
                    2: {
                        name: "SWITCH_TOGGLE_BINARY_GET"
                    },
                    3: {
                        name: "SWITCH_TOGGLE_BINARY_REPORT"
                    }
                }
            },
            43: {
                name: "SCENE_ACTIVATION",
                processor: null
            },
            48: {
                name: "SENSOR_BINARY",
                commands: {
                    2: {
                        name: "SENSOR_BINARY_GET"
                    },
                    3: {
                        name: "SENSOR_BINARY_REPORT"
                    }
                }
            },
            49: {
                name: "SENSOR_MULTILEVEL",
                commands: {
                    1: {
                        name: "SENSOR_MULTI_LEVEL_SUPPORTED_GET"
                    },
                    2: {
                        name: "SENSOR_MULTI_LEVEL_SUPPORTED_REPORT"
                    },
                    4: {
                        name: "SENSOR_MULTI_LEVEL_GET"
                    },
                    5: {
                        name: "SENSOR_MULTI_LEVEL_REPORT"
                    }
                },
                processor: processMultilevelSensor
            },
            50: {
                name: "METER",
                commands: {
                    1: {
                        name: "METER_GET"
                    },
                    2: {
                        name: "METER_REPORT"
                    },
                    3: {
                        name: "METER_SUPPORTED_GET"
                    },
                    4: {
                        name: "METER_SUPPORTED_REPORT"
                    },
                    5: {
                        name: "METER_RESET"
                    }
                }
            },
            64: {
                name: "THERMOSTAT_MODE",
                processor: null
            },
            66: {
                name: "THERMOSTAT_OPERATING_STATE",
                processor: null
            },
            67: {
                name: "THERMOSTAT_SETPOINT",
                processor: null
            },
            68: {
                name: "THERMOSTAT_FAN_MODE",
                commands: {
                    1: {
                        name: "THERMOSTAT_FAN_MODE_SET"
                    },
                    2: {
                        name: "THERMOSTAT_FAN_MODE_GET"
                    },
                    3: {
                        name: "THERMOSTAT_FAN_MODE_REPORT"
                    },
                    4: {
                        name: "THERMOSTAT_FAN_MODE_SUPPORTED_GET"
                    },
                    5: {
                        name: "THERMOSTAT_FAN_MODE_SUPPORTED_REPORT"
                    }
                }
            },
            69: {
                name: "THERMOSTAT_FAN_STATE",
                commands: {
                    2: {
                        name: "THERMOSTAT_FAN_STATE_GET"
                    },
                    3: {
                        name: "THERMOSTAT_FAN_STATE_REPORT"
                    }
                }
            },
            70: {
                name: "CLIMATE_CONTROL_SCHEDULE",
                processor: null
            },
            96: {
                name: "MULTI_INSTANCE",
                commands: {
                    4: {
                        name: "MULTI_INSTANCE_GET"
                    },
                    5: {
                        name: "MULTI_INSTANCE_REPORT"
                    },
                    6: {
                        name: "MULTI_INSTANCE_ENCAP"
                    },
                    7: {
                        name: "MULTI_CHANNEL_ENDPOINT_GET"
                    },
                    8: {
                        name: "MULTI_CHANNEL_ENDPOINT_REPORT"
                    },
                    9: {
                        name: "MULTI_CHANNEL_CAPABILITY_GET"
                    },
                    10: {
                        name: "MULTI_CHANNEL_CAPABILITY_REPORT"
                    },
                    11: {
                        name: "MULTI_CHANNEL_ENDPOINT_FIND"
                    },
                    12: {
                        name: "MULTI_CHANNEL_ENDPOINT_FIND_REPORT"
                    },
                    13: {
                        name: "MULTI_CHANNEL_ENCAP",
                        processor: processMultiChannelEncap
                    }
                }
            },
            99: {
                name: "USER_CODE",
                processor: null
            },
            112: {
                name: "CONFIGURATION",
                commands: {
                    4: {
                        name: "SWITCH_BINARY_GET"
                    },
                    5: {
                        name: "SWITCH_BINARY_SET"
                    },
                    6: {
                        name: "SWITCH_BINARY_REPORT"
                    }
                }
            },
            113: {
                name: "ALARM",
                processor: null
            },
            114: {
                name: "MANUFACTURER_SPECIFIC",
                commands: {
                    4: {
                        name: "MANUFACTURER_SPECIFIC_GET"
                    },
                    5: {
                        name: "MANUFACTURER_SPECIFIC_REPORT",
                        processor: processManufacturer
                    }
                }
            },
            128: {
                name: "BATTERY",
                commands: {
                    2: {
                        name: "BATTERY_GET"
                    },
                    3: {
                        name: "BATTERY_REPORT"
                    }
                }
            },
            130: {
                name: "HAIL",
                processor: null
            },
            132: {
                name: "WAKE_UP",
                commands: {
                    4: {
                        name: "WAKE_UP_INTERVAL_SET"
                    },
                    5: {
                        name: "WAKE_UP_INTERVAL_GET"
                    },
                    6: {
                        name: "WAKE_UP_INTERVAL_REPORT"
                    },
                    7: {
                        name: "WAKE_UP_NOTIFICATION"
                    },
                    8: {
                        name: "WAKE_UP_NO_MORE_INFORMATION"
                    },
                    9: {
                        name: "WAKE_UP_INTERVAL_CAPABILITIES_GET"
                    },
                    10: {
                        name: "WAKE_UP_INTERVAL_CAPABILITIES_REPORT"
                    }
                },
                processor: processWakeup
            },
            133: {
                name: "ASSOCIATION",
                commands: {
                    1: {
                        name: "ASSOCIATIONCMD_SET"
                    },
                    2: {
                        name: "ASSOCIATIONCMD_GET"
                    },
                    3: {
                        name: "ASSOCIATIONCMD_REPORT"
                    },
                    4: {
                        name: "ASSOCIATIONCMD_REMOVE"
                    },
                    5: {
                        name: "ASSOCIATIONCMD_GROUPINGSGET"
                    },
                    6: {
                        name: "ASSOCIATIONCMD_GROUPINGSREPORT"
                    }
                },
                processor: processAssociation
            },
            134: {
                name: "VERSION",
                commands: {
                    17: {
                        name: "VERSION_GET"
                    },
                    18: {
                        name: "VERSION_REPORT"
                    },
                    19: {
                        name: "VERSION_COMMAND_CLASS_GET",
                        processor: processVersion
                    },
                    20: {
                        name: "VERSION_COMMAND_CLASS_REPORT"
                    }
                }
            },
            135: {
                name: "INDICATOR",
                processor: null
            },
            143: {
                name: "MULTI_CMD",
                processor: null
            },
            145: {
                name: "MANUFACTURER_PROPRIETARY"
            },
            156: {
                name: "SENSOR_ALARM",
                commands: {
                    1: {
                        name: "SENSOR_ALARM_GET"
                    },
                    2: {
                        name: "SENSOR_ALARM_REPORT"
                    },
                    3: {
                        name: "SENSOR_ALARM_SUPPORTED_GET"
                    },
                    4: {
                        name: "SENSOR_ALARM_SUPPORTED_REPORT"
                    }
                },
                processor: processAlarmSensor
            }
        };

        // Definition of strings to search for in the log
        var processList = [
            {
                string: "Z-Wave binding",
                ref: "Info",
                status: INFO,
                processor: processBindingStart
            },
            {
                string: "Starting Z-Wave receive thread",
                ref: "Info",
                content: "Receive thread started",
                status: INFO
            },
            {
                string: "Deserializing from file",
                ref: "Info",
                content: "Restoring node from file",
                processor: processDeserialiser
            },
            {
                string: "Error deserializing from file",
                ref: "Info",
                processor: processDeserialiserError
            },
            {
                string: "Receive Message = ",
                ref: "RXPacket",
                processor: processPacketRX
            },
            {
                string: "Sending REQUEST Message = ",
                ref: "TXPacket",
                processor: processPacketTX
            },
            {
                string: "Sending ABORT Message = ",
                ref: "SendAbort",
                content: "Sending data abort",
                status: WARNING
            },
            {
                string: "Response processed after ",
                ref: "PktStat",
                processor: processResponseTime
            },
            {
                string: "Update config, ",
                ref: "Config",
                processor: processConfig
            },
            {
                string: "Node advancer - advancing to ",
                ref: "NodeState",
                processor: processStage
            },
            {
                string: "Stage set to",
                ref: "NodeState",
                processor: processAlive     // TODO: Rationalise this!
            },
            {
                string: "Is awake with",
                ref: "Wakeup",
                content: "Node is AWAKE",
                status: INFO
            },
            {
                string: "Went to sleep",
                ref: "Wakeup",
                content: "Node is ASLEEP",
                status: INFO
            },
            {
                string: "Timeout while sending message. Requeueing",
                ref: "Timeout",
                processor: processRetry
            },
            {
                string: "Retry count exceeded",
                ref: "Timeout",
                processor: processTimeout
            },
            {
                string: "transaction complete!",
                processor: processTransactionComplete
            },
            {
                string: "NETWORK HEAL - ",
                ref: "Heal",
                processor: processHealState
            },
            {
                string: "(CAN)",
                error: "Message cancelled by controller",
                processor: processTxMessageError,
                status: ERROR
            },
            {
                string: "(NAK)",
                error: "Message rejected by controller",
                processor: processTxMessageError,
                status: ERROR
            },
            {
                string: "Message is not valid, discarding",
                error: "Message is invalid",
                processor: processTxMessageError,
                status: ERROR
            }
        ];

        // Array of node information
        var nodes = {};

        // Binding configuration parameters
        var config = {};

        function createNode(id) {
            if (nodes[id] == null) {
                nodes[id] = {
                    id: id,
                    warnings: [],
                    errors: [],
                    computed: false,
                    responseTime: [],
                    responseTimeouts: 0,
                    classes: [],
                    responseTimeMin: 9999,
                    responseTimeAvg: 0,
                    responseTimeMax: 0,
                    responseTimeCnt: 0
                };
                for (var cnt = 0; cnt < 100; cnt++) {
                    nodes[id].responseTime[cnt] = 0;
                }
            }
        }

        function addNodeInfo(id, type, value) {
            if (id == 0) {
                console.log("Trying to save data for node 0", type, value);
                return;
            }
            createNode(id);
            nodes[id][type] = value;
        }

        function incNodeInfo(id, type) {
            if (id == 0) {
                console.log("Trying to save data for node 0", type, value);
                return;
            }
            createNode(id);
            if (nodes[id][type] == null) {
                nodes[id][type] = 1;
            }
            else {
                nodes[id][type]++;
            }
        }

        function addNodeWarning(id, msg) {
            createNode(id);
            nodes[id].warnings.push(msg);
        }

        function addNodeError(id, msg) {
            createNode(id);
            nodes[id].errors.push(msg);
        }

        function addNodeItem(node, endpoint, name, cmd, item) {
            createNode(id);
            var msg = name + " = " + node + ":";
            if (endpoint != 0) {
                msg += endpoint + ":";
            }
            msg += "command=" + cmd;
            if (item != null) {
                msg += "," + item;
            }
            nodes[id].items.push(msg);
        }

        function getNodeInfo(id, type) {
            if (nodes[id] == null) {
                return null;
            }
            return nodes[id][type];
        }

        function updateNodeResponse(id, time) {
            createNode(id);
            if (time == -1) {
                // Timeout
                nodes[id].responseTimeouts++;
            }
            else {
                nodes[id].responseTime[Math.floor(time / 50)]++;
            }

            if (time < nodes[id].responseTimeMin) {
                nodes[id].responseTimeMin = time;
            }
            if (time > nodes[id].responseTimeMax) {
                nodes[id].responseTimeMax = time;
            }

            nodes[id].responseTimeAvg += time;
            nodes[id].responseTimeCnt++;
        }

        function HEX2DEC(number) {
            // Return error if number is not hexadecimal or contains more than ten characters (10 digits)
            if (!/^[0-9A-Fa-f]{1,10}$/.test(number)) return '#NUM!';

            // Convert hexadecimal number to decimal
            var decimal = parseInt(number, 16);

            // Return decimal number
            return (decimal >= 549755813888) ? decimal - 1099511627776 : decimal;
        }

        function setStatus(cfg, status) {
            if (cfg.result == ERROR) {
                return;
            }
            if (status == ERROR) {
                cfg.result = ERROR;
                return;
            }

            if (cfg.result == WARNING) {
                return;
            }
            if (status == WARNING) {
                cfg.result = WARNING;
                return;
            }

            if (cfg.result == INFO) {
                return;
            }
            if (status == INFO) {
                cfg.result = INFO;
                return;
            }

            cfg.result = SUCCESS;
        }

        function processTransactionComplete(node, process, message) {
            if (lastPacketRx != null) {
                lastPacketRx.successFlag = true;
                lastPacketRx = null;
            }
        }

        function processBindingStart(node, process, message) {
            var data = {
                result: INFO
            };

            if (message.indexOf("started") != -1) {
                data.content = "Binding started. Version " + message.substr(message.indexOf("Version") + 8);
            }
            else if (message.indexOf("stopped") != -1) {
                data.content = "Binding stopped.";
            }

            return data;
        }

        var lastRestore = null;

        function processDeserialiser(node, process, message) {
            var data = {
                result: SUCCESS,
                node: node,
                content: process.content
            };

            lastRestore = data;
            return data;
        }

        function processDeserialiserError(node, process, message) {
            if (lastRestore != null) {
                lastRestore.warnFlag = true;
                lastRestore.warnMessage = "Failed to restore state";
                lastRestore = null;
            }
        }

        function processRxMessageError(node, process, message) {
            if (lastPacketRx != null) {
                lastPacketRx.errorFlag = true;
                lastPacketRx.errorMessage = process.error;
                setStatus(lastPacketRx, process.status);
                lastPacketRx = null;
            }
        }

        function processTxMessageError(node, process, message) {
            if (lastPacketTx != null) {
                lastPacketTx.errorFlag = true;
                lastPacketTx.errorMessage = process.error;
                setStatus(lastPacketTx, process.status);
                lastPacketTx = null;

                if (message.indexOf("(CAN)")) {
                    incNodeInfo(255, "txErrorCan");
                }
                else if (message.indexOf("(NAK)")) {
                    incNodeInfo(255, "txErrorNak");
                }
            }
        }

        function processHealState(node, process, message) {
            var stage = message.substr(message.indexOf(" HEAL - ") + 8);
            return {
                node: node,
                healstage: stage,
                content: "Heal stage advanced to " + stage
            }
        }

        function processStage(node, process, message) {
            var stage = message.substr(message.indexOf(" to ") + 4);
            var point = stage.indexOf(".");
            if (point !== -1) {
                stage = stage.substr(0, point);
            }
            addNodeInfo(node, "Stage", stage);
            return {
                stage: stage,
                content: "Stage advanced to " + stage
            }
        }

        function processAlive(node, process, message) {
            var stage = message.substr(message.indexOf(" Stage set to ") + 14);
            var point = stage.indexOf(".");
            if (point !== -1) {
                stage = stage.substr(0, point);
            }
            addNodeInfo(node, "Stage", stage);
            return {
                stage: stage,
                content: "Stage set to " + stage
            }
        }

        function processRetry(node, process, message) {
            var count = parseInt(message.substr(message.indexOf("Requeueing - ") + 13));
            return {
                retry: count,
                result: WARNING,
                content: "Message retry (" + count + " attempts remaining)"
            };
        }

        function processTimeout(node, process, message) {
            addNodeInfo(node, "Stage", "DEAD");
            return {
                result: ERROR,
                content: "Message timeout!"
            }
        }

        function processResponseTime(node, process, message) {
            var response = parseInt(message.substr(message.indexOf("after ") + 6), 10);
            return null;
        }

        function processConfig(node, process, message) {
            var cfg = message.substr(message.indexOf("Update config, ") + 15).split("=");
            if (cfg == null || cfg.length != 2) {
                return null;
            }
            config[cfg[0].trim()] = cfg[1].trim();
            return null;
        }

        /**
         * Command Class Processors
         */

        function processWakeup(node, endpoint, bytes) {
            var data = {result: SUCCESS};

            var cmdCmd = HEX2DEC(bytes[1]);
            switch (cmdCmd) {
                case 6:             // WAKE_UP_INTERVAL_REPORT
                    var interval = HEX2DEC(bytes[2]) * 65536 + HEX2DEC(bytes[3]) * 256 + HEX2DEC(bytes[4]);
                    addNodeInfo(node, "wakeupInterval", interval);
                    addNodeInfo(node, "wakeupNode", HEX2DEC(bytes[5]));
                    data.content = "Wakeup period: " + getNodeInfo(node, "wakeupInterval") + "(s), reporting to node " +
                    getNodeInfo(node, "wakeupNode");
                    if (interval == 0) {
                        data.errorMessage = "Wakeup interval is not set";
                    }
                    break;
                case 7:
                    incNodeInfo(node, "wakeupCnt");
                    break;
            }

            return data;
        }

        function processAssociation(node, endpoint, bytes) {
            var data = {result: SUCCESS};

            var cmdCls = HEX2DEC(bytes[0]);
            var cmdCmd = HEX2DEC(bytes[1]);
            data.content = commandClasses[cmdCls].commands[cmdCmd].name;
            switch (cmdCmd) {
                case 2:             // GET
                    var group = HEX2DEC(bytes[2]);
                    data.content += " Group " + group;
                    break;
                case 3:             // REPORT
                    var group = HEX2DEC(bytes[2]);
                    data.content += " Group " + group;
                    break;
            }

            return data;
        }

        var alarmSensors = {
            0: "General",
            1: "Smoke",
            2: "Carbon Monoxide",
            3: "Carbon Dioxide",
            4: "Heat",
            5: "Flood",
            6: "Access Control",
            7: "Burglar",
            8: "Power Management",
            9: "System",
            10: "Emergency",
            11: "Count"
        };

        function processAlarmSensor(node, endpoint, bytes) {
            var data = {result: SUCCESS};

            var cmdCls = HEX2DEC(bytes[0]);
            var cmdCmd = HEX2DEC(bytes[1]);
            data.content = commandClasses[cmdCls].commands[cmdCmd].name;
            switch (cmdCmd) {
                case 1:             // GET
                    if (bytes.length >= 3) {
                        var getType = HEX2DEC(bytes[2]);
                        if (alarmSensors[getType] == null) {
                            data.content += "::" + getType;
                        }
                        else {
                            data.content += "::" + alarmSensors[getType];
                        }
                    }
                    break;
                case 2:             // REPORT
                    var repSource = HEX2DEC(bytes[2]);
                    var repType = HEX2DEC(bytes[3]);
                    var repValue = HEX2DEC(bytes[4]);
                    if (alarmSensors[repType] == null) {
                        data.content += "::" + repType + "=" + repValue;
                    }
                    else {
                        data.content += "::" + alarmSensors[repType] + "=" + repValue;
                    }
                    break;
            }

            return data;
        }

        var multilevelSensors = {
            1: "Temperature",
            2: "General",
            3: "Luminance",
            4: "Power",
            5: "RelativeHumidity",
            6: "Velocity",
            7: "Direction",
            8: "AtmosphericPressure",
            9: "BarometricPressure",
            10: "SolarRadiation",
            11: "DewPoint",
            12: "RainRate",
            13: "TideLevel",
            14: "Weight",
            15: "Voltage",
            16: "Current",
            17: "CO2",
            18: "AirFlow",
            19: "TankCapacity",
            20: "Distance",
            21: "AnglePosition",
            22: "Rotation",
            23: "WaterTemperature",
            24: "SoilTemperature",
            25: "SeismicIntensity",
            26: "SeismicMagnitude",
            27: "Ultraviolet",
            28: "ElectricalResistivity",
            29: "ElectricalConductivity",
            30: "Loudness",
            31: "Moisture",
            32: "MaxType"
        };

        function processMultilevelSensor(node, endpoint, bytes) {
            var data = {result: SUCCESS};

            var cmdCls = HEX2DEC(bytes[0]);
            var cmdCmd = HEX2DEC(bytes[1]);
            data.content = commandClasses[cmdCls].commands[cmdCmd].name;
            switch (cmdCmd) {
                case 2:             // SENSOR_MULTI_LEVEL_SUPPORTED_REPORT 
                    for (var i = 0; i < bytes.length - 3; ++i) {
                        var a = HEX2DEC(bytes[i + 2]);
                        for (var bit = 0; bit < 8; ++bit) {
                            if ((a & (1 << bit) ) == 0) {
                                continue;
                            }
                            var index = (i * 8 ) + bit + 1;

                            if (multilevelSensors[index] == null) {
                                // Add to list of supported sensors
                                addNodeItem(node, endpoint, multilevelSensors[index], commandClasses[cmdCls].name,
                                    "sensor_type=" + index);
                            }
                        }
                    }
                    break;
                case 4:				// SENSOR_MULTI_LEVEL_GET
                    if (bytes.length >= 3) {
                        var type = HEX2DEC(bytes[2]);
                        if (multilevelSensors[type] == null) {
                            data.content += "::" + type;
                        }
                        else {
                            data.content += "::" + multilevelSensors[type];
                        }
                    }
                    break;
                case 5:				// SENSOR_MULTI_LEVEL_REPORT
                    var type = HEX2DEC(bytes[2]);
                    var scale = HEX2DEC(bytes[3]);
                    if (multilevelSensors[type] == null) {
                        data.content += "::" + type + "=" + scale;
                    }
                    else {
                        data.content += "::" + multilevelSensors[type] + "=" + scale;
                    }
                    break;
            }

            return data;
        }

        function processVersion(node, endpoint, bytes) {
            var data = {result: SUCCESS};

            var cmdCls = HEX2DEC(bytes[0]);
            var cmdCmd = HEX2DEC(bytes[1]);
            var cmdPrm = HEX2DEC(bytes[2]);

            data.content = commandClasses[cmdCls].commands[cmdCmd].name;
            switch (cmdCmd) {
                case 19:
                    data.content += " (" + commandClasses[cmdPrm].name + ")";
                    break;
            }

            return data;
        }

        function processManufacturer(node, endpoint, bytes) {
            var data = {result: SUCCESS};
            addNodeInfo(node, "manufacturer", bytes[2] + bytes[3]);
            addNodeInfo(node, "deviceType", bytes[4] + bytes[5]);
            addNodeInfo(node, "deviceID", bytes[6] + bytes[7]);
            data.content = "Manufacturer Info: " + getNodeInfo(node, "manufacturer") + ":" +
            getNodeInfo(node, "deviceType") + ":" + getNodeInfo(node, "deviceID");

            return data;
        }

        function processMultiChannelEncap(node, endpoint, bytes) {
            var data = {result: SUCCESS};

            data.endPoint = HEX2DEC(bytes[2]);
            data.endClassCode = HEX2DEC(bytes[4]);
            data.endClassPacket = processCommandClass(data.node, data.endPoint, bytes.slice(4));

            data.content = "MULTI_CHANNEL_CAPABILITY_GET::" + data.endPoint;
            if (data.endClassPacket != null) {
                data.content += "::" + data.endClassPacket.function;
            }
            return data;
        }

        function processCommandClass(node, endpoint, bytes) {
            var cmdClass = {result: SUCCESS};
            if (bytes == null || bytes.length == 0) {
                cmdClass.content = "Zero length frame in command class";
                setStatus(cmdClass, ERROR);
                return cmdClass;
            }

            // Handle our requests
            var cmdCls = HEX2DEC(bytes[0]);
            var cmdCmd = null;

            cmdClass.id = cmdCls;

            if (bytes.length > 1) {
                cmdCmd = HEX2DEC(bytes[1]);
            }

            // Process the command class
            if (commandClasses[cmdCls] == undefined) {
                cmdClass.content = "Unknown command class " + bytes[0];
                setStatus(cmdClass, WARNING);
            }
            else {
                // If we've defined a command/function within the class, then process this
                if (commandClasses[cmdCls].commands != null &&
                    commandClasses[cmdCls].commands[cmdCmd] != null) {
                    if (commandClasses[cmdCls].commands[cmdCmd].processor != null) {
                        cmdClass = commandClasses[cmdCls].commands[cmdCmd].processor(node, endpoint, bytes);
                    }
                    else if (commandClasses[cmdCls].processor) {
                        cmdClass = commandClasses[cmdCls].processor(node, endpoint, bytes);
                    }
                    cmdClass.function = commandClasses[cmdCls].commands[cmdCmd].name;
                }
                else if (commandClasses[cmdCls].processor) {
                    cmdClass = commandClasses[cmdCls].processor(node, endpoint, bytes);
                }
                else {
                    if (cmdCmd != null) {
                        cmdClass.function = bytes[1];
                    }
                }
                cmdClass.class = commandClasses[cmdCls].name;
                cmdClass.name = commandClasses[cmdCls].name;

                if (cmdClass.content == null) {
                    // Check if the function contains the class name
                    if (cmdClass.function != null && cmdClass.function.indexOf(cmdClass.name) == -1) {
                        // No - we need to have both
                        cmdClass.content = cmdClass.class + "::" + cmdClass.function;
                    }
                    else if (cmdClass.function != null) {
                        cmdClass.content = cmdClass.function;
                    }
                    else {
                        cmdClass.content = cmdClass.class;
                    }
                }
            }

            cmdClass.node = node;
            return cmdClass;
        }

        function processSucNodeId(node, direction, type, bytes, len) {
            var data = {result: SUCCESS};
            if (direction == "TX") {
            } else {
                if (type == REQUEST) {
                }
                else {
                    data.node = 255;
                    addNodeInfo(data.node, "sucID", HEX2DEC(bytes[0]));
                    data.content = "SUC ID: " + getNodeInfo(255, "sucID");
                }
            }

            return data;
        }

        function processMemoryGetId(node, direction, type, bytes, len) {
            var data = {result: SUCCESS};
            if (direction == "TX") {
            } else {
                if (type == REQUEST) {
                    setStatus(data, ERROR);
                }
                else {
                    data.node = 255;
                    addNodeInfo(data.node, "homeID", bytes[0] + bytes[1] + bytes[2] + bytes[3]);
                    addNodeInfo(data.node, "controllerID", HEX2DEC(bytes[4]));
                    data.content = "MemoryGetId: HomeID=" + getNodeInfo(data.node, "homeID") + ", Controller=" +
                    getNodeInfo(data.node, "controllerID")
                }
            }

            return data;
        }

        function processIdentifyNode(node, direction, type, bytes, len) {
            var data = {result: SUCCESS};
            if (direction == "TX") {
                data.node = HEX2DEC(bytes[0]);
                createNode(data.node);

                lastCmd = {
                    node: data.node
                };
            } else {
                if (type == REQUEST) {
                    setStatus(data, ERROR);
                }
                else {
                    data.node = lastCmd.node;

                    var a = HEX2DEC(bytes[0]);
                    addNodeInfo(data.node, "isListening", (a & 0x80) != 0 ? true : false);
                    addNodeInfo(data.node, "isRouting", (a & 0x40) != 0);
                    addNodeInfo(data.node, "version", (a & 0x07) + 1);
                    a = HEX2DEC(bytes[1]);
                    addNodeInfo(data.node, "isFLiRS", (a & 0x60) ? true : false);
                    addNodeInfo(data.node, "basicClass", HEX2DEC(bytes[3]));
                    addNodeInfo(data.node, "genericClass", HEX2DEC(bytes[4]));
                    addNodeInfo(data.node, "specificClass", HEX2DEC(bytes[5]));
                    data.content = "IdentifyNode: Listening:" + getNodeInfo(data.node, "isListening");
                }
            }

            return data;
        }

        function processNodeNeighborUpdate(node, direction, type, bytes, len) {
            var data = {result: SUCCESS};
            if (direction == "TX") {
                data.node = HEX2DEC(bytes[0]);
                createNode(data.node);

                lastCmd = {
                    node: data.node
                };
            } else {
                if (type == REQUEST) {
                    data.node = lastCmd.node;

                    data.content = "Neighbor update ";
                    switch (HEX2DEC(bytes[1])) {
                        case 33:
                            data.content += "STARTED";
                            break;
                        case 34:
                            data.content += "DONE";
                            break;
                        case 35:
                            data.content += "FAILED";
                            setStatus(data, WARNING);
                            break;
                        default:
                            data.content += "UNKNOWN (" + bytes(1) + ")";
                            setStatus(data, WARNING);
                            break;
                    }
                }
                else {
                    data.node = lastCmd.node;
                }
            }

            return data;
        }

        function processAppUpdate(node, direction, type, bytes, len) {
            var data = {result: SUCCESS};
            if (direction == "TX") {
            } else {
                if (type == REQUEST) {
                    data.node = HEX2DEC(bytes[1]);
                }
                else {
                }
            }

            return data;
        }

        function processGetVersion(node, direction, type, bytes, len) {
            var data = {result: SUCCESS};
            if (direction == "RX" && type == RESPONSE) {
                data.node = 255;
                data.zwaveVersion = "";
                for (var i = 0; i < 11; i++) {
                    data.zwaveVersion += String.fromCharCode(HEX2DEC(bytes[i]));
                }
                addNodeInfo(data.node, "zwaveVersion", data.zwaveVersion);
            }

            return data;
        }

        function processRoutingInfo(node, direction, type, bytes, len) {
            var data = {result: SUCCESS};
            if (direction == "TX") {
                data.node = HEX2DEC(bytes[0]);
                createNode(data.node);

                lastCmd = {
                    node: data.node
                };
            } else {
                if (type == REQUEST) {
                    data.node = lastCmd.node;
                }
                else {
                    data.node = lastCmd.node;

                    var cntTotal = 0;
                    var cntListening = 0;
                    var node;
                    var neighbours = [];
                    for (var i = 0; i < 29; i++) {
                        var incomingByte = HEX2DEC(bytes[i]);
                        // loop bits in byte
                        for (var j = 0; j < 8; j++) {
                            node++;
                            var b1 = incomingByte & Math.pow(2, j);
                            var b2 = Math.pow(2, j);
                            if (b1 == b2) {
                                cntTotal++;
                                neighbours.push(node);
                            }
                        }
                    }

                    addNodeInfo(data.node, "neighboursList", neighbours);
                    addNodeInfo(data.node, "neighboursTotal", cntTotal);

                    data.content = "RoutingInfo: Found " + getNodeInfo(data.node, "neighboursTotal") + " neighbours";
                }
            }

            return data;
        }

        function processControllerCmd(node, direction, type, bytes, len) {
            var data = {result: SUCCESS};
            if (direction == "TX") {
                data.node = HEX2DEC(bytes[0]);
                createNode(data.node);

                lastCmd = {
                    node: data.node
                };
            } else {
                if (type == REQUEST) {
                    data.node = lastCmd.node;
                }
                else {
                    data.node = lastCmd.node;
                }
            }

            return data;
        }

        function processControllerCallbackCmd(node, direction, type, bytes, len) {
            var data = {result: SUCCESS};
            if (direction == "TX") {
                data.node = HEX2DEC(bytes[0]);
                createNode(data.node);

                lastCmd = {
                    node: data.node
                };
            } else {
                if (type == REQUEST) {
                    data.node = lastCmd.node;
                }
                else {
                    data.node = lastCmd.node;
                }
            }

            return data;
        }

        function processInitData(node, direction, type, bytes, len) {
            var data = {result: SUCCESS};
            if (direction == "TX") {
            } else {
                if (type == REQUEST) {
                    setStatus(data, ERROR);
                }
                else {
                    data.node = 255;
                    var cnt = 0;
                    for (var i = 3; i < 3 + 29; i++) {
                        var incomingByte = HEX2DEC(bytes[i]);
                        // loop bits in byte
                        for (var j = 0; j < 8; j++) {
                            var b1 = incomingByte & Math.pow(2, j);
                            var b2 = Math.pow(2, j);
                            if (b1 == b2) {
                                cnt++;
                            }
                        }
                    }

                    data.content = "SerialApiGetInitData: Found " + cnt + " nodes";
                }
            }

            return data;
        }

        function processControllerInfo(node, direction, type, bytes, len) {
            var data = {result: SUCCESS};
            if (direction == "RX" && type == RESPONSE) {
                data.node = 255;
                addNodeInfo(data.node, "serialApiVersion", bytes[0] + '.' + bytes[1]);
                addNodeInfo(data.node, "manufacturer", bytes[2] + bytes[3]);
                addNodeInfo(data.node, "deviceType", bytes[4] + bytes[5]);
                addNodeInfo(data.node, "deviceID", bytes[6] + bytes[7]);
                data.content = "Controller Info: " + getNodeInfo(data.node, "manufacturer") + ":" +
                getNodeInfo(data.node, "deviceType") + ":" + getNodeInfo(data.node, "deviceID");
            }

            return data;
        }

        function processApplicationCommand(node, direction, type, bytes, len) {
            var data = {result: SUCCESS};
            if (direction == "TX") {
                setStatus(data, ERROR);
            } else {
                if (type == REQUEST) {
                    data.node = HEX2DEC(bytes[1]);
                    data = processCommandClass(data.node, 0, bytes.slice(3));

                    createNode(node);
                    if (nodes[node].classes[data.id] == undefined) {
                        nodes[node].classes[data.id] = 0;
                    }
                    nodes[node].classes[data.id]++;
                }
                else {
                    setStatus(data, ERROR);
                }
            }

            return data;
        }

        function processFailedNode(node, direction, type, bytes, len) {
            var data = {result: SUCCESS};

            if (direction == "TX") {
                data.node = HEX2DEC(bytes[0]);
                data.name = "Check if node " + data.node + " is failed";

                lastCmd = {
                    node: data.node
                };
            } else {
                if (type == REQUEST) {
                    data = processCommandClass(HEX2DEC(bytes[1]), 0, bytes.slice(3));

                    if (data == null) {
                        data = {
                            result: WARNING,
                            node: HEX2DEC(bytes[1]),
                            content: "Unprocessed command class: " + bytes[3]
                        };
                    }
                    else {
                        createNode(data.node);
                        if (nodes[data.node].classes[data.id] == undefined) {
                            nodes[data.node].classes[data.id] = 0;
                        }
                        nodes[data.node].classes[data.id]++;
                    }
                }
                else {
                    setStatus(data, ERROR);
                }
            }

            return data;
        }

        var callbackCache = {};

        function processSendData(node, direction, type, bytes, len) {
            var sendData = {result: SUCCESS};

            if (direction == "TX") {
                node = HEX2DEC(bytes[0]);
                // Remove the transmit options and callback id
                var cmdClass = processCommandClass(node, 0, bytes.slice(2, -2));
                // Get the callback ID
                var callback = HEX2DEC(bytes[bytes.length - 1]);

                // Save information on this transaction
                callbackCache[callback] = {
                    time: logTime,
                    cmd: cmdClass,
                    node: node
                };

                setStatus(sendData, cmdClass.result);
                sendData.node = node;
                sendData.callback = callback;
                sendData.cmdClass = cmdClass;
                sendData.content = "SendData (" + callback + "). Sent: " + cmdClass.content;

                lastSendData.node = node;
                lastSendData.callback = callback;

                incNodeInfo(node, 'messagesSent');
            }
            else {
                // Handle response from network
                if (type == REQUEST) {
                    var callback = HEX2DEC(bytes[0]);
                    var status = HEX2DEC(bytes[1]);

                    sendData.callback = callback;

                    // Recover the data on the original message
                    var callbackData = {};
                    if (callbackCache[callback] == null) {
                        sendData.content = "No callback ID found (" + bytes[0] + ")";
                        // TODO: Add error
                        sendData.responseTime = "Unknown";
                        setStatus(sendData, ERROR);
                    }
                    else {
                        callbackData = callbackCache[callback];
                        node = callbackData.node;
                        sendData.node = callbackData.node;
                        sendData.responseTime = logTime - callbackData.time;
                    }

                    sendData.content = "SendData (" + callback + "). ";

                    switch (status) {
                        case 0:		// COMPLETE_OK
                            // If we know the response, update stats
                            if (sendData.responseTime != "Unknown") {
                                updateNodeResponse(node, sendData.responseTime);
                            }
                            sendData.content += "ACK'd by device in " + sendData.responseTime +
                            "ms";
                            break;
                        case 1:		// COMPLETE_NO_ACK
                            updateNodeResponse(node, -1);
                            setStatus(sendData, WARNING);
                            sendData.content += "No ACK after " + sendData.responseTime + "ms";
                            sendData.warnFlag = true;
                            sendData.warnMessage = "No ack received from device";
                            break;
                        case 2:		// COMPLETE_FAIL
                            updateNodeResponse(node, -1);
                            setStatus(sendData, ERROR);
                            sendData.content += "Failed in " + sendData.responseTime + "ms";
                            break;
                        case 3:		// COMPLETE_NOT_IDLE
                            updateNodeResponse(node, -1);
                            break;
                        case 4:		// COMPLETE_NOROUTE
                            break;
                    }
                }
                else {
                    // There's no node ID, so use the last node
                    sendData.node = lastSendData.node;
                    // This is just the response to say it was sent
                    if (HEX2DEC(bytes[0]) > 0) {
                        // Success
                        sendData.content = "SendData (" + lastSendData.callback + "). Sent OK";
                        setStatus(sendData, SUCCESS);
                    }
                    else {
                        // Error
                        setStatus(sendData, ERROR);
                        sendData.content = "SendData (" + lastSendData.callback + "). Not sent!";
                    }
                }
            }

            return sendData;
        }

        function processPacketTX(node, process, message) {
            lastPacketTx = processPacket("TX", node, process, message);
            return lastPacketTx;
        }

        function processPacketRX(node, process, message) {
            var data = processPacket("RX", node, process, message);
            // Check for duplicates
            if (lastPacketRx != null) {
                // If we receive the same packet then mark it as a duplicate
                // Maybe this should check time, but it's not currently available here
                if (lastPacketRx.packetData == data.packetData) {
                    data.duplicate = true;
                }
            }
            lastPacketRx = data;

            return data;
        }

        function processPacket(direction, node, process, message) {
            var packet = {
                direction: direction
            };
            packet.packetData = message.substr(message.indexOf(" = ") + 3).trim();
            var bytes = packet.packetData.split(' ');

            // Frame starts with 01
            if (HEX2DEC(bytes[0]) != 1) {
                return;
            }

            packet.length = HEX2DEC(bytes[1]);
            packet.reqType = HEX2DEC(bytes[2]) == 0 ? REQUEST : RESPONSE;
            packet.pktType = HEX2DEC(bytes[3]);
            if (packetTypes[packet.pktType] === undefined) {
                packet.class = "Unknown " + bytes[3] + " (" + packet.pktType + ")";
                setStatus(packet, WARNING);
            }
            else {
                packet.class = packetTypes[packet.pktType].name;

                if (packetTypes[packet.pktType].processor != null) {
                    // Process the frame if we have a processor function
                    packet.packet =
                        packetTypes[packet.pktType].processor(node, direction, packet.reqType, bytes.slice(4, -1),
                            packet.length - 4);

                    packet.node = packet.packet.node;
                    setStatus(packet, packet.packet.result);			// Bubble status
                    packet.warnFlag = packet.packet.warnFlag;
                    packet.warnMessage = packet.packet.warnMessage;
                    packet.errorFlag = packet.packet.errorFlag;
                    packet.errorMessage = packet.packet.errorMessage;
                }

                // Set the minimum status if we defined it in the packet definition
                if (packetTypes[packet.pktType].result != null) {
                    setStatus(packet, packetTypes[packet.pktType].result);
                }
            }

            packet.content = process.ref == "RXPacket" ? "RX" : "TX";
            packet.content += " (" + packet.reqType + "): ";
            if (packet.packet != null && packet.packet.content != null) {
                packet.content += packet.packet.content;
            }
            else {
                packet.content += packet.class;
            }

            return packet;
        }

        function logProcessLine(line) {
            if (line == null || line.length == 0) {
                return;
            }

            // Parse the time
            var time = moment(line.substr(0, 23), "YYYY-MM-DD HH:mm:ss.SSS");
            if (time.isValid() == false) {
                var time = moment(line.substr(0, 12), "HH:mm:ss.SSS");
            }
            var node = 0;

            logTime = time.valueOf();

            // See if this line includes a node ID
            var nodeOffset = line.indexOf("- NODE ");
            if (nodeOffset !== -1) {
                node = parseInt(line.slice(nodeOffset + 7), 10);
                lastNode = node;
            }

            var log = null;

            angular.forEach(processList, function (process) {
                if (line.indexOf(process.string) != -1) {
                    log = {};
                    if (process.processor != null) {
                        log = process.processor(node, process, line);
                    }
                    if (log != null) {
                        log.ref = process.ref;

                        // If the packet provides a node, use it!
//                        if(log.node !== undefined) {
//                            node = log.node;
                        //                      }

                        if (process.content !== undefined) {
                            log.content = process.content;
                        }
                        if (process.status != undefined) {
                            setStatus(log, process.status);
                        }
                    }
                }
            });

            if (log != null) {
                // Add node information
                if (log.packet != null && log.packet.node != null) {
                    // Use the node from the processed data if there is one
                    log.node = log.packet.node;
                }
                else if (node == 0) {
                    // If node is 0, then assume this is the controller
                    log.node = 255;
                }
                else {
                    log.node = node;
                }
                if (log.node != undefined && log.node != 0 && log.node != 255) {
                    log.stage = getNodeInfo(log.node, "Stage");
                }

                log.time = time.format("HH:mm:ss.SSS");
                log.start = time.valueOf();

                return log;
            }

            return null;
        }

        this.loadLogfile = function (file) {
            fileName = file.name;
            var deferred = $q.defer();

            lastPacketRx = null;
            nodeInfoProcessed = false;
            countLines = 0;
            countEntries = 0;
            data = [];
            nodes = [];

            // Check for the various File API support.
            if (window.FileReader) {
                // FileReader are supported.
                getAsText(file);
            } else {
                alert('FileReader is not supported in this browser.');
            }

            return deferred.promise;

            function getAsText(fileToRead) {
                var reader = new FileReader();
                // Read file into memory as UTF-8
                reader.readAsText(fileToRead);
                // Handle errors load
                reader.onload = loadHandler;
                reader.onerror = errorHandler;
            }

            function loadHandler(event) {
                var csv = event.target.result;
                processData(csv);
            }

            function processData(csv) {
                var allTextLines = csv.split(/\r\n|\n/);
                for (var i = 0; i < allTextLines.length; i++) {
                    countLines++;
                    var d = logProcessLine(allTextLines[i]);
                    if (d != null && d.ref != null) {
                        d.id = countEntries++;
                        data.push(d);
                    }
                }

                processDeviceInformation();
                deferred.resolve();
            }

            function errorHandler(evt) {
                if (evt.target.error.name == "NotReadableError") {
                    alert("Cannot read file !");
                }
            }
        };
    })
;