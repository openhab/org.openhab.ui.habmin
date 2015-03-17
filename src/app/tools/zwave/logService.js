/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
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
        var txQueueLen = 0;

        var packetsSent = 0;
        var packetsRecv = 0;
        var timeStart;

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
            // Calculate some overall statistics
            addNodeInfo(255, "Frames Sent", packetsSent);
            addNodeInfo(255, "Frames Received", packetsRecv);
            addNodeInfo(255, "Frame Period", Math.floor((logTime - timeStart) / (packetsRecv + packetsSent)));

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
                if (node.responseTimeCnt === 0) {
                    node.responseTimeMin = "-";
                    node.responseTimeAvg = "-";
                    node.responseTimeMax = "-";
                }
                else {
                    node.responseTimeAvg =
                        Math.round(node.responseTimeAvg / node.responseTimeCnt);
                }

                if (node.messagesSent == null || node.messagesSent === 0) {
                    node.retryPercent = 0;
                }
                else {
                    node.retryPercent = Math.ceil(node.responseTimeouts * 100 / node.messagesSent);
                }

                // Process any errors/warnings for battery devices
                if (node.isListening === false) {
                    if (node.wakeupCnt == null || node.wakeupCnt === 0) {
                        node.warnings.push("Device appears to be battery operated, but has not woken up");
                    }
                    if (node.wakeupNode != null && nodes[255] != null && node.wakeupNode != nodes[255].controllerID) {
                        node.errors.push("Wakeup node is not set to the controller");
                    }
                    if (node.wakeupInterval != null && node.wakeupInterval === 0) {
                        node.errors.push("Wakeup interval is set to 0");
                    }
                }

                if (nodes[255] != null && node.id == nodes[255].controllerID) {
                    if (node.isListening === false) {
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
                            else if (nodes[neighbour].isListening === true) {
                                node.neighboursListening++;
                            }
                        }
                    });
                }

                if (node.neighboursTotal != null) {
                    if (node.neighboursTotal === 0) {
                        node.errors.push("Node has no neighbours");
                    }
                    else if (node.neighboursTotal < 4) {
                        node.warnings.push("Node only has " + node.neighboursTotal + " neighbours");
                    }

                    if (node.neighboursListening != node.neighboursTotal) {
                        if (node.neighboursListening === 0) {
                            node.errors.push("Node has no listening neighbours");
                        }
                        else if (node.neighboursListening < 4) {
                            node.warnings.push("Node only has " + node.neighboursListening + " listening neighbours");
                        }
                    }
                }

                if (node.responseTimeAvg > 1000) {
                    node.errors.push("Average response time is very high (" + node.responseTimeAvg + "mS)");
                }
                else if (node.responseTimeAvg > 500) {
                    node.warnings.push("Average response time is high (" + node.responseTimeAvg + "mS)");
                }

                if (node.messagesSent > 40 && node.retryPercent > 15) {
                    node.errors.push("Node has a very high timeout ratio (" + node.retryPercent + "%)");
                }
                else if (node.messagesSent > 20 && node.retryPercent > 5) {
                    node.warnings.push("Node has a high timeout ratio (" + node.retryPercent + "%)");
                }
            });

            nodeInfoProcessed = true;
        }

        var deviceClassBasic = {
            1: {
                name: "CONTROLLER"
            },
            2: {
                name: "STATIC_CONTROLLER"
            },
            3: {
                name: "SLAVE"
            },
            4: {
                name: "ROUTING_SLAVE"
            }
        };

        var deviceClass = {
            0x00: {
                name: "NOT_KNOWN"
            },
            0x01: {
                name: "REMOTE_CONTROLLER",
                specific: {
                    1: "PORTABLE_REMOTE_CONTROLLER",
                    2: "PORTABLE_SCENE_CONTROLLER",
                    3: "PORTABLE_INSTALLER_TOOL"
                }
            },
            0x02: {
                name: "STATIC_CONTOLLER",
                specific: {
                    1: "PC_CONTROLLER",
                    2: "SCENE_CONTROLLER",
                    3: "INSTALLER_TOOL"
                }
            },
            0x03: {
                name: "AV_CONTROL_POINT",
                specific: {
                    4: "SATELLITE_RECEIVER",
                    17: "SATELLITE_RECEIVER_V2",
                    18: "DOORBELL"
                }
            },
            0x06: {
                name: "DISPLAY",
                specific: {
                    1: "SIMPLE_DISPLAY"
                }
            },
            0x07: {
                name: "GARAGE_DOOR",
                specific: {
                    1: "SIMPLE_GARAGE_DOOR"
                }
            },
            0x08: {
                name: "THERMOSTAT",
                specific: {
                    1: "THERMOSTAT_HEATING",
                    2: "THERMOSTAT_GENERAL",
                    3: "SETBACK_SCHEDULE_THERMOSTAT",
                    4: "SETPOINT_THERMOSTAT",
                    5: "SETBACK_THERMOSTAT",
                    6: "THERMOSTAT_GENERAL_V2"
                }
            },
            0x09: {
                name: "WINDOW_COVERING",
                specific: {
                    1: "SIMPLE_WINDOW_COVERING"
                }
            },
            0x0f: {
                name: "REPEATER_SLAVE",
                specific: {
                    1: "BASIC_REPEATER_SLAVE"
                }
            },
            0x10: {
                name: "BINARY_SWITCH",
                specific: {
                    1: "POWER_SWITCH_BINARY",
                    2: "SCENE_SWITCH_BINARY_DISCONTINUED",
                    3: "SCENE_SWITCH_BINARY",
                    5: "SIREN_SWITCH_BINARY"
                },
                class: "SWITCH_BINARY"
            },
            0x11: {
                name: "MULTILEVEL_SWITCH",
                specific: {
                    1: "POWER_SWITCH_MULTILEVEL",
                    2: "SCENE_SWITCH_MULTILEVEL_DISCONTINUED",
                    3: "MOTOR_MULTIPOSITION",
                    4: "SCENE_SWITCH_MULTILEVEL",
                    5: "MOTOR_CONTROL_CLASS_A",
                    6: "MOTOR_CONTROL_CLASS_B",
                    7: "MOTOR_CONTROL_CLASS_C"
                },
                class: "SWITCH_MULTILEVEL"
            },
            0x12: {
                name: "REMOTE_SWITCH",
                specific: {
                    1: "SWITCH_REMOTE_BINARY",
                    2: "SWITCH_REMOTE_MULTILEVEL",
                    3: "SWITCH_REMOTE_TOGGLE_BINARY",
                    4: "SWITCH_REMOTE_TOGGLE_MULTILEVEL"
                }
            },
            0x13: {
                name: "TOGGLE_SWITCH",
                specific: {
                    1: "SWITCH_TOGGLE_BINARY",
                    2: "SWITCH_TOGGLE_MULTILEVEL"
                }
            },
            0x14: {
                name: "Z_IP_GATEWAY"
            },
            0x15: {
                name: "Z_IP_NODE"
            },
            0x16: {
                name: "VENTILATION",
                specific: {
                    1: "RESIDENTIAL_HEAT_RECOVERY_VENTILATION"
                }
            },
            0x18: {
                name: "REMOTE_SWITCH_2",
                specific: {
                    1: "SWITCH_REMOTE2_MULTILEVEL"
                },
                class: "SWITCH_MULTILEVEL"
            },
            0x20: {
                name: "BINARY_SENSOR",
                specific: {
                    1: "ROUTING_SENSOR_BINARY"
                },
                class: "SENSOR_BINARY"
            },
            0x21: {
                name: "MULTILEVEL_SENSOR",
                specific: {
                    1: "ROUTING_SENSOR_MULTILEVEL"
                },
                class: "SENSOR_MULTILEVEL"
            },
            0x22: {
                name: "WATER_CONTROL"
            },
            0x30: {
                name: "PULSE_METER",
                class: "METER_PULSE"
            },
            0x31: {
                name: "METER",
                specific: {
                    1: "SIMPLE_METER"
                },
                class: "METER"
            },
            0x40: {
                name: "ENTRY_CONTROL",
                specific: {
                    1: "DOOR_LOCK",
                    2: "ADVANCED_DOOR_LOCK",
                    3: "SECURE_KEYPAD_DOOR_LOCK"
                },
                class: "LOCK"
            },
            0x50: {
                name: "SEMI_INTEROPERABLE"
            },
            0xa1: {
                name: "ALARM_SENSOR",
                specific: {
                    1: "ALARM_SENSOR_ROUTING_BASIC",
                    2: "ALARM_SENSOR_ROUTING",
                    3: "ALARM_SENSOR_ZENSOR_BASIC",
                    4: "ALARM_SENSOR_ZENSOR",
                    5: "ALARM_SENSOR_ZENSOR_ADVANCED",
                    6: "SMOKE_SENSOR_ROUTING_BASIC",
                    7: "SMOKE_SENSOR_ROUTING",
                    8: "SMOKE_SENSOR_ZENSOR_BASIC",
                    9: "SMOKE_SENSOR_ZENSOR",
                    10: "SMOKE_SENSOR_ZENSOR_ADVANCED"
                },
                class: "BASIC"
            },
            0xff: {
                name: "NON_INTEROPERABLE"
            }
        };

        function getDeviceClass(basic, generic, specific) {
            var devClass;
            if (deviceClassBasic[basic] != null) {
                devClass = deviceClassBasic[basic].name + ":";
            }
            else {
                devClass = basic + ":";
            }
            if (deviceClass[generic] != null) {
                if (deviceClass[generic].specific != null && deviceClass[generic].specific[specific] != null) {
                    devClass += deviceClass[generic].specific[specific];
                }
                else {
                    devClass += deviceClass[generic].name + ":" + specific;
                }
            }
            else {
                devClass += generic + ":" + specific;
            }
            return devClass;
        }

        function getDeviceCommand(generic) {
            if (deviceClass[generic] != null) {
                return deviceClass[generic].class;
            }

            return null;
        }

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
                },
                processor: processSensorBinary
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
                },
                processor: processMeter
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
            86: {
                name: "CRC_16_ENCAP"
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
                        name: "MULTI_CHANNEL_CAPABILITY_REPORT",
                        processor: processMultiChannelReport
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
                        name: "CONFIGURATION_SET"
                    },
                    5: {
                        name: "CONFIGURATION_GET"
                    },
                    6: {
                        name: "CONFIGURATION_REPORT"
                    }
                },
                processor: processConfiguration
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
            115: {
                name: "POWERLEVEL"
            },
            122: {
                name: "FIRMWARE_UPDATE_MD"
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
                        name: "VERSION_COMMAND_CLASS_GET"
                    },
                    20: {
                        name: "VERSION_COMMAND_CLASS_REPORT"
                    }
                },
                processor: processVersion
            },
            135: {
                name: "INDICATOR",
                processor: null
            },
            138: {
                name: "TIME"
            },
            139: {
                name: "TIME_PARAMETERS"
            },
            142: {
                name: "MULTI_INSTANCE_ASSOCIATION"
            },
            143: {
                name: "MULTI_CMD",
                commands: {
                    1: {
                        name: "MULTI_COMMMAND_ENCAP"
                    }
                }
            },
            145: {
                name: "MANUFACTURER_PROPRIETARY"
            },
            152: {
                name: "SECURITY"
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
                string: "internalReceiveCommand",
                ref: "Cmd",
                processor: processCommand
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
                string: "Took message from queue for sending",
                processor: processTxQueueLength
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

        function getCommandClassName(cmdCls, cmdCmd) {
            if (commandClasses[cmdCls].commands[cmdCmd] == null) {
                return commandClasses[cmdCls].name + "[" + cmdCmd + "]";
            }
            else {
                return commandClasses[cmdCls].commands[cmdCmd].name;
            }
        }

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
                    items: [],
                    classes: {},
                    control: {},
                    endpoints: {},
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
            if (id === 0) {
                console.log("Trying to save data for node 0", type, value);
                return;
            }
            createNode(id);
            nodes[id][type] = value;
        }

        function addNodeEndpointInfo(id, endpoint, type, value) {
            if (id === 0) {
                console.log("Trying to save data for node 0", type, value);
                return;
            }
            createNode(id);
            if(nodes[id].endpoints[endpoint] == null) {
                nodes[id].endpoints[endpoint] = {};
            }
            nodes[id].endpoints[endpoint][type] = value;
        }

        function incNodeInfo(id, type) {
            if (id === 0) {
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

        function addNodeItem(id, endpoint, name, cmd, item) {
            createNode(id);
            var msg = name + " = " + id + ":";
            if (endpoint !== 0) {
                msg += endpoint + ":";
            }
            if(cmd !== "") {
                msg += "command=" + cmd;
            }
            if (item != null) {
                msg += "," + item;
            }
            // Check if the item exists
            if(nodes[id].items.indexOf(msg) != -1) {
                return;
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
            if (!/^[0-9A-Fa-f]{1,10}$/.test(number)) {
                return '#NUM!';
            }

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

        function processCommand(node, process, message) {
            var data = {
                result: INFO
            };
            data.content = "Incoming Command: Item '" + message.slice(message.indexOf("itemname = ") + 11, message.indexOf(',')) +
                "' to '" + message.slice(message.indexOf("Command = ") + 10, -1) + "'";
            return data;
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

        function processTxQueueLength(node, process, message) {
            txQueueLen = parseInt(message.substr(message.indexOf("Queue length = ") + 15), 10);
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
            };
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
            };
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
            };
        }

        function processRetry(node, process, message) {
            var count = parseInt(message.substr(message.indexOf("Requeueing - ") + 13), 10);
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
            };
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
                    if (interval === 0) {
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
            var data = {
                result: SUCCESS,
                node: node
            };

            var cmdCls = HEX2DEC(bytes[0]);
            var cmdCmd = HEX2DEC(bytes[1]);
            data.content = commandClasses[cmdCls].commands[cmdCmd].name;
            switch (cmdCmd) {
                case 2:             // ASSOCIATIONCMD_GET
                    var groupGet = HEX2DEC(bytes[2]);
                    data.content += " Group:" + groupGet;
                    break;
                case 3:             // ASSOCIATIONCMD_REPORT
                    var groupReport = HEX2DEC(bytes[2]);
                    var maxNodes = HEX2DEC(bytes[3]);
                    var following = HEX2DEC(bytes[4]);
                    data.content += " Group:" + groupReport + " Max:" + maxNodes + " [";
                    for(var a = 5; a < bytes.length; a++) {
                        if(a != 5) {
                            data.content += ",";
                        }
                        data.content += HEX2DEC(bytes[a]);
                    }
                    data.content += "]";
                    break;
                case 6:             // ASSOCIATIONCMD_GROUPINGSREPORT
                    var groupCnt = HEX2DEC(bytes[2]);
                    addNodeInfo(node, "associationGroups", groupCnt);
                    data.content += " Supports " + groupCnt + " groups";
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
                case 4:             // SENSOR_ALARM_SUPPORTED_REPORT
                    for (var i = 0; i < bytes.length - 3; ++i) {
                        var a = HEX2DEC(bytes[i + 3]);
                        for (var bit = 0; bit < 8; ++bit) {
                            if ((a & (1 << bit) ) === 0) {
                                continue;
                            }
                            var index = (i * 8 ) + bit;

                            var name = "UNKNOWN!";
                            if (alarmSensors[index] != null) {
                                name = alarmSensors[index];
                            }

                            // Add to list of supported sensors
                            addNodeItem(node, endpoint, name, commandClasses[cmdCls].name,
                                "alarm_type=" + index);
                        }
                    }
                    break;
            }

            return data;
        }

        var binarySensors = {
            0: "Unknown",
            1: "General",
            2: "Smoke",
            3: "Carbon Monoxide",
            4: "Carbon Dioxide",
            5: "Heat",
            6: "Water",
            7: "Freeze",
            8: "Tamper",
            9: "Aux",
            10: "Door/Window",
            11: "Tilt",
            12: "Motion",
            13: "Glass Break"
        };

        function processSensorBinary(node, endpoint, bytes) {
            var data = {result: SUCCESS};

            var cmdCls = HEX2DEC(bytes[0]);
            var cmdCmd = HEX2DEC(bytes[1]);
            data.content = getCommandClassName(cmdCls, cmdCmd);
            switch (cmdCmd) {
                case 2:				// SENSOR_BINARY_GET
                    if (bytes.length >= 3) {
                        var typeGet = HEX2DEC(bytes[2]);
                        if (binarySensors[typeGet] == null) {
                            data.content += "::" + typeGet;
                        }
                        else {
                            data.content += "::" + binarySensors[typeGet];
                        }
                    }
                    break;
                case 3:				// SENSOR_BINARY_REPORT
                    if(bytes.length > 3) {
                        var typeReport = HEX2DEC(bytes[2]);
                        var scale = HEX2DEC(bytes[3]);
                        var value = HEX2DEC(bytes[4]);
                        var name = "";
                        if (binarySensors[typeReport] == null) {
                            data.content += "::" + typeReport + "(" + scale + ") = " + value;
                            name = commandClasses[cmdCls].name + " " + typeReport;
                        }
                        else {
                            data.content += "::" + binarySensors[typeReport] + "(" + scale + ") = " + value;
                            name = commandClasses[cmdCls].name + " " + binarySensors[typeReport];
                        }
                        addNodeItem(node, endpoint, name, commandClasses[cmdCls].name, "sensor_type=" + typeReport);
                    }
                    else {
                        var value = HEX2DEC(bytes[2]);
                        data.content += "=" + value;
                        addNodeItem(node, endpoint, name, commandClasses[cmdCls].name);
                    }
                    break;
            }

            return data;
        }

        var meterSensors = {
            0: "Unknown",
            1: "Electric",
            2: "Gas",
            3: "Water"
        };

        function processMeter(node, endpoint, bytes) {
            var data = {result: SUCCESS};

            var cmdCls = HEX2DEC(bytes[0]);
            var cmdCmd = HEX2DEC(bytes[1]);
            data.content = getCommandClassName(cmdCls, cmdCmd);
            switch (cmdCmd) {
                case 4:             // METER_SUPPORTED_REPORT
                    for (var i = 0; i < bytes.length - 3; ++i) {
                        var a = HEX2DEC(bytes[i + 2]);
                        for (var bit = 0; bit < 8; ++bit) {
                            if ((a & (1 << bit) ) === 0) {
                                continue;
                            }
                            var index = (i * 8 ) + bit + 1;

                            var name = "UNKNOWN!";
                            if (meterSensors[index] != null) {
                                name = meterSensors[index];
                            }

                            // Add to list of supported sensors
                            addNodeItem(node, endpoint, name, commandClasses[cmdCls].name,
                                "meter_type=" + index);
                        }
                    }
                    break;
                case 1:				// METER_GET
                    if (bytes.length >= 3) {
                        var typeGet = HEX2DEC(bytes[2]);
                        if (meterSensors[typeGet] == null) {
                            data.content += "::" + typeGet;
                        }
                        else {
                            data.content += "::" + meterSensors[typeGet];
                        }
                    }
                    break;
                case 2:				// METER_REPORT
                    var typeReport = HEX2DEC(bytes[2]);
                    var scale = HEX2DEC(bytes[3]);
                    if (meterSensors[typeReport] == null) {
                        data.content += "::" + typeReport + "=" + scale;
                    }
                    else {
                        data.content += "::" + meterSensors[typeReport] + "=" + scale;
                    }
                    addNodeItem(node, endpoint, name, commandClasses[cmdCls].name, "sensor_type=" + typeReport);
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
            data.content = getCommandClassName(cmdCls, cmdCmd);
            switch (cmdCmd) {
                case 2:             // SENSOR_MULTI_LEVEL_SUPPORTED_REPORT 
                    for (var i = 0; i < bytes.length - 3; ++i) {
                        var a = HEX2DEC(bytes[i + 2]);
                        for (var bit = 0; bit < 8; ++bit) {
                            if ((a & (1 << bit) ) === 0) {
                                continue;
                            }
                            var index = (i * 8 ) + bit + 1;

                            var name = "UNKNOWN!";
                            if (multilevelSensors[index] != null) {
                                name = multilevelSensors[index];
                            }

                            // Add to list of supported sensors
                            addNodeItem(node, endpoint, name, commandClasses[cmdCls].name,
                                "sensor_type=" + index);
                        }
                    }
                    break;
                case 4:				// SENSOR_MULTI_LEVEL_GET
                    if (bytes.length >= 3) {
                        var typeGet = HEX2DEC(bytes[2]);
                        if (multilevelSensors[typeGet] == null) {
                            data.content += "::" + typeGet;
                        }
                        else {
                            data.content += "::" + multilevelSensors[typeGet];
                        }
                    }
                    break;
                case 5:				// SENSOR_MULTI_LEVEL_REPORT
                    var typeReport = HEX2DEC(bytes[2]);
                    var scale = HEX2DEC(bytes[3]);
                    if (multilevelSensors[typeReport] == null) {
                        data.content += "::" + typeReport + "=" + scale;
                    }
                    else {
                        data.content += "::" + multilevelSensors[typeReport] + "=" + scale;
                    }
                    addNodeItem(node, endpoint, name, commandClasses[cmdCls].name, "sensor_type=" + typeReport);
                    break;
            }

            return data;
        }

        function processMultilevelSensor(node, endpoint, bytes) {
            var data = {result: SUCCESS};

            var cmdCls = HEX2DEC(bytes[0]);
            var cmdCmd = HEX2DEC(bytes[1]);
            data.content = getCommandClassName(cmdCls, cmdCmd);
            switch (cmdCmd) {
                case 2:             // SENSOR_MULTI_LEVEL_SUPPORTED_REPORT
                    for (var i = 0; i < bytes.length - 3; ++i) {
                        var a = HEX2DEC(bytes[i + 2]);
                        for (var bit = 0; bit < 8; ++bit) {
                            if ((a & (1 << bit) ) === 0) {
                                continue;
                            }
                            var index = (i * 8 ) + bit + 1;

                            var name = "UNKNOWN!";
                            if (multilevelSensors[index] != null) {
                                name = multilevelSensors[index];
                            }

                            // Add to list of supported sensors
                            addNodeItem(node, endpoint, name, commandClasses[cmdCls].name,
                                "sensor_type=" + index);
                        }
                    }
                    break;
                case 4:				// SENSOR_MULTI_LEVEL_GET
                    if (bytes.length >= 3) {
                        var typeGet = HEX2DEC(bytes[2]);
                        if (multilevelSensors[typeGet] == null) {
                            data.content += "::" + typeGet;
                        }
                        else {
                            data.content += "::" + multilevelSensors[typeGet];
                        }
                    }
                    break;
                case 5:				// SENSOR_MULTI_LEVEL_REPORT
                    var typeReport = HEX2DEC(bytes[2]);
                    var scale = HEX2DEC(bytes[3]);
                    if (multilevelSensors[typeReport] == null) {
                        data.content += "::" + typeReport + "=" + scale;
                    }
                    else {
                        data.content += "::" + multilevelSensors[typeReport] + "=" + scale;
                    }
                    addNodeItem(node, endpoint, name, commandClasses[cmdCls].name, "sensor_type=" + typeReport);
                    break;
            }

            return data;
        }

        function processVersion(node, endpoint, bytes) {
            var data = {result: SUCCESS};

            var cmdCls = HEX2DEC(bytes[0]);
            var cmdCmd = HEX2DEC(bytes[1]);
            var cmdPrm = HEX2DEC(bytes[2]);

            data.content = getCommandClassName(cmdCls, cmdCmd);
            switch (cmdCmd) {
                case 19:
                    data.content += " (" + commandClasses[cmdPrm].name + ")";
                    break;
                case 20:
                    var version = HEX2DEC(bytes[3]);
                    data.content += " (" + commandClasses[cmdPrm].name + "=V" + version + ")";
                    break;
            }

            return data;
        }

        function processConfiguration(node, endpoint, bytes) {
            var data = {result: SUCCESS};

            var cmdCls = HEX2DEC(bytes[0]);
            var cmdCmd = HEX2DEC(bytes[1]);
            var cmdCfg = HEX2DEC(bytes[2]);

            data.content = getCommandClassName(cmdCls, cmdCmd);
            data.content += "::" + cmdCfg;

            if(cmdCmd == 4) {       // SET
            }
            else if(cmdCmd == 5) {  // GET
            }
            else if(cmdCmd == 6) {  // REPORT
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

        function processSwitchBinary(node, endpoint, bytes) {
            var cmdCls = HEX2DEC(bytes[0]);
            var cmdCmd = HEX2DEC(bytes[1]);

            if(cmdCmd == 6) {       // REPORT
                addNodeItem(node, endpoint, "SWITCH", commandClasses[cmdCls].name);
            }

            return {result: SUCCESS};
        }

        function processMultiChannelReport(node, endpoint, bytes) {
            var data = {result: SUCCESS};

            data.endPoint = HEX2DEC(bytes[2]) & 0x7f;
            var generic = HEX2DEC(bytes[3]);
            var specific = HEX2DEC(bytes[4]);

            data.content = "MULTI_CHANNEL_CAPABILITY_REPORT::" + data.endPoint;

            var devClass = getDeviceClass(getNodeInfo(node, "basicClass"), generic, specific);
            addNodeEndpointInfo(node, data.endPoint, "deviceClass", devClass);
            var cmdClass = getDeviceCommand(generic);

            addNodeItem(node, data.endPoint, data.endPoint, cmdClass);
            return data;
        }

        function processMultiChannelEncap(node, endpoint, bytes) {
            var data = {result: SUCCESS};

            data.endPoint = HEX2DEC(bytes[2]);
            data.endClassCode = HEX2DEC(bytes[4]);
            data.endClassPacket = processCommandClass(data.node, data.endPoint, bytes.slice(4));

            data.content = "MULTI_CHANNEL_CAPABILITY_GET::" + data.endPoint;
            if (data.endClassPacket != null) {
                data.content += "::" + data.endClassPacket.funct;
            }
            return data;
        }

        function processCommandClass(node, endpoint, bytes) {
            var cmdClass = {result: SUCCESS};
            if (bytes == null || bytes.length === 0) {
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
            if (commandClasses[cmdCls] === undefined) {
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
                    cmdClass.funct = commandClasses[cmdCls].commands[cmdCmd].name;
                }
                else if (commandClasses[cmdCls].processor) {
                    cmdClass = commandClasses[cmdCls].processor(node, endpoint, bytes);
                }
                else {
                    if (cmdCmd != null) {
                        cmdClass.funct = bytes[1];
                    }
                }
                cmdClass.class = commandClasses[cmdCls].name;
                cmdClass.name = commandClasses[cmdCls].name;

                if (cmdClass.content == null) {
                    // Check if the function contains the class name
                    if (cmdClass.funct != null && cmdClass.funct.indexOf(cmdClass.name) == -1) {
                        // No - we need to have both
                        cmdClass.content = cmdClass.class + "::" + cmdClass.funct;
                    }
                    else if (cmdClass.funct != null) {
                        cmdClass.content = cmdClass.funct;
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
                    getNodeInfo(data.node, "controllerID");
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

                    var basic = HEX2DEC(bytes[3])
                    var generic = HEX2DEC(bytes[4]);
                    var specific = HEX2DEC(bytes[5]);

                    var a = HEX2DEC(bytes[0]);
                    addNodeInfo(data.node, "isListening", (a & 0x80) !== 0 ? true : false);
                    addNodeInfo(data.node, "isRouting", (a & 0x40) !== 0 ? true : false);
                    addNodeInfo(data.node, "version", (a & 0x07) + 1);
                    a = HEX2DEC(bytes[1]);
                    addNodeInfo(data.node, "isFLiRS", (a & 0x60) ? true : false);
                    addNodeInfo(data.node, "basicClass", basic);
                    addNodeInfo(data.node, "genericClass", generic);
                    addNodeInfo(data.node, "specificClass", specific);

                    var cmdClass = getDeviceCommand(generic);
                    addNodeItem(data.node, 0, 0, cmdClass);

                    var devClass = getDeviceClass(basic, generic, specific);
                    addNodeInfo(data.node, "deviceClass", devClass);
                    data.content = "IdentifyNode: " + devClass + ". Listening:" + getNodeInfo(data.node, "isListening");
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

        var appUpdateState = {
            0x84: "NODE_INFO_RECEIVED",
            0x82: "NODE_INFO_REQ_DONE",
            0x81: "NODE_INFO_REQ_FAILED",
            0x80: "ROUTING_PENDING",
            0x40: "NEW_ID_ASSIGNED",
            0x20: "DELETE_DONE",
            0x10: "SUC_ID"
        };
        function processAppUpdate(node, direction, type, bytes, len) {
            var data = {result: SUCCESS};
            if (direction == "TX") {
            } else {
                if (type == REQUEST) {
                    var state = HEX2DEC(bytes[0]);
                    data.node = HEX2DEC(bytes[1]);
                    data.content = "ApplicationUpdate::";
                    if(appUpdateState[state] != null) {
                        data.content += appUpdateState[state];
                    }
                    else {
                        data.content += bytes[0];
                    }
                    switch(state) {
                        case 0x84:
                            createNode(data.node);
                            var cntrl = false;
                            for(var c = 6; c < bytes.length; c++) {
                                var id = HEX2DEC(bytes[c]);
                                if (id == 0xEF) {
                                    cntrl = true;
                                    continue;
                                }

                                // If we know the command class name, use it
                                if(commandClasses[id] != null) {
                                    id = commandClasses[id].name;
                                }
                                if(cntrl == false) {
                                    if (nodes[data.node].classes[id] == null) {
                                        nodes[data.node].classes[id] = 0;
                                    }
                                }
                                else {
                                    if (nodes[data.node].control[id] == null) {
                                        nodes[data.node].control[id] = 0;
                                    }
                                }
                            }
                            break;
                    }
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
                    var nodeLoop = 0;
                    var neighbours = [];
                    for (var i = 0; i < 29; i++) {
                        var incomingByte = HEX2DEC(bytes[i]);
                        // loop bits in byte
                        for (var j = 0; j < 8; j++) {
                            nodeLoop++;
                            var b1 = incomingByte & Math.pow(2, j);
                            var b2 = Math.pow(2, j);
                            if (b1 == b2) {
                                cntTotal++;
                                neighbours.push(nodeLoop);
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
                    data = processCommandClass(HEX2DEC(bytes[1]), 0, bytes.slice(3));

                    createNode(data.node);
                    if (nodes[data.node].classes[data.class] == null) {
                        nodes[data.node].classes[data.class] = 0;
                    }
                    nodes[data.node].classes[data.class]++;
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
                data.content = "Check if node " + data.node + " is failed";

                lastCmd = {
                    node: data.node
                };
            } else {
                data.node = lastCmd.node;
                if (type == RESPONSE) {
                    if (HEX2DEC(bytes[0]) === 0) {
                        data.content = "Node is marked as HEALTHY by controller";
                    }
                    else {
                        data.content = "Node is marked as FAILED by controller";
                        setStatus(data, WARNING);
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
                var callbackTx = HEX2DEC(bytes[bytes.length - 1]);

                // Save information on this transaction
                callbackCache[callbackTx] = {
                    time: logTime,
                    cmd: cmdClass,
                    node: node
                };

                setStatus(sendData, cmdClass.result);
                sendData.node = node;
                sendData.callback = callbackTx;
                sendData.cmdClass = cmdClass;
                sendData.content = "SendData (" + callbackTx + "). Sent: " + cmdClass.content;

                lastSendData.node = node;
                lastSendData.callback = callbackTx;

                incNodeInfo(node, 'messagesSent');
            }
            else {
                // Handle response from network
                if (type == REQUEST) {
                    var callbackRx = HEX2DEC(bytes[0]);
                    var status = HEX2DEC(bytes[1]);

                    sendData.callback = callbackRx;

                    // Recover the data on the original message
                    var callbackData = {};
                    if (callbackCache[callbackRx] == null) {
                        sendData.content = "No callback ID found (" + bytes[0] + ")";
                        // TODO: Add error
                        sendData.responseTime = "Unknown";
                        setStatus(sendData, ERROR);
                    }
                    else {
                        callbackData = callbackCache[callbackRx];
                        node = callbackData.node;
                        sendData.node = callbackData.node;
                        sendData.responseTime = logTime - callbackData.time;
                    }

                    sendData.content = "SendData (" + callbackRx + "). ";

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
            packetsSent++;
            lastPacketTx = processPacket("TX", node, process, message);
            lastPacketTx.queueLen = txQueueLen;
            return lastPacketTx;
        }

        function processPacketRX(node, process, message) {
            packetsRecv++;
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
            packet.reqType = HEX2DEC(bytes[2]) === 0 ? REQUEST : RESPONSE;
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
            if (line == null || line.length === 0) {
                return;
            }

            // Parse the time
            var time = moment(line.substr(0, 23), "YYYY-MM-DD HH:mm:ss.SSS");
            if (time.isValid() === false) {
                time = moment(line.substr(0, 12), "HH:mm:ss.SSS");
            }
            var node = 0;

            logTime = time.valueOf();

            if(timeStart == 0) {
                timeStart = logTime;
            }

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
                        if (process.status !== undefined) {
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
                else if (node === 0) {
                    // If node is 0, then assume this is the controller
                    log.node = 255;
                }
                else {
                    log.node = node;
                }
                if (log.node !== undefined && log.node !== 0 && log.node != 255) {
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
            txQueueLen = 0;
            packetsSent = 0;
            packetsRecv = 0;
            timeStart = 0;

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