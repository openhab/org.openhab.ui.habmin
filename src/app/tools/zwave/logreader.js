/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('ZWave.logReader', [
    'ui.router',
    'ui.bootstrap',
    'angular-growl',
    'ngVis',
    'ngLocalize',
    'ResizePanel',
    'checklist-model'
])

    .config(function config($stateProvider) {
        $stateProvider.state('/tools/zwave/logreader', {
            url: '/tools/zwave/logreader',
            views: {
                "main": {
                    controller: 'ZWaveLogReaderCtrl',
                    templateUrl: 'tools/zwave/logreader.tpl.html'
                }
            },
            data: {pageTitle: 'ZWave Log Reader'},
            resolve: {
                // Make sure the localisation files are resolved before the controller runs
                localisations: function (locale) {
                    return locale.ready('common');
                }
            }
        });
    })

    .controller('ZWaveLogReaderCtrl',
    function DashboardChartCtrl($scope, locale, PersistenceItemModel, PersistenceServiceModel, PersistenceDataModel, ChartListModel, ChartSave, SidepanelService, growl, VisDataSet, $interval, $timeout) {
        // Constant definitions
        var REQUEST = "Request";
        var RESPONSE = "Response";
        var ERROR = "danger";
        var WARNING = "warning";
        var INFO = "info";
        var SUCCESS = "";

        // Some globals used by the processor
        var logTime = 0;
        var lastNode = 0;
        var lastSendData = {};

        $scope.data = [];
        $scope.countLines = 0;
        $scope.countEntries = 0;
        $scope.showOption = "LIST";//"TIMELINE";
        $scope.processFilter = ['Start','RXPacket','TXPacket','Wakeup','Sleep','Timeout','CAN'];
        $scope.nodeFilter = [];

        $scope.checkAllNodes = function() {
            for (var key in $scope.nodes) {
                $scope.nodeFilter.push(parseInt(key));
            }
        };

        $scope.fileChanged = function (element) {
            loadLog(element.files[0]);
        };

        $scope.filterFunction = function(element) {
            if($scope.processFilter.indexOf(element.ref) === -1) {
                return false;
            }

            if(element.node === undefined) {
                return true;
            }
            return $scope.nodeFilter.indexOf(element.node) === -1 ? false : true;
        };

        function loadLog(file) {
            var reader = new FileLineStreamer();

            $scope.data = [];
            $scope.countLines = 0;
            $scope.countEntries = 0;

            reader.open(file, function (lines, err) {
                if (err != null) {
                    return;
                }
                if (lines == null) {
                    return;
                }

                // output every line
                lines.forEach(function (line) {
                    $scope.countLines++;

                    var d = logProcessLine(line);
                    if (d != null) {
                        $scope.data.id = $scope.countEntries;
                        $scope.data.push(d);
                        $scope.countEntries++;
                    }
                });

                reader.getNextBatch();
            });

            reader.getNextBatch();
        }

        var packetTypes = {
            2: {
                name: "SerialApiGetInitData",
                processor: null
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
                processor: null
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
                processor: null
            },
            22: {
                name: "SendDataAbort",
                status: WARNING,
                processor: null
            },
            32: {
                name: "MemoryGetId",
                processor: null
            },
            64: {
                name: "SetLearnNodeState",
                processor: null
            },
            65: {
                name: "IdentifyNode",
                processor: null
            },
            66: {
                name: "SetDefault",
                processor: null
            },
            70: {
                name: "AssignReturnRoute",
                processor: null
            },
            71: {
                name: "DeleteReturnRoute",
                processor: null
            },
            72: {
                name: "RequestNodeNeighborUpdate",
                processor: null
            },
            73: {
                name: "ApplicationUpdate",
                processor: null
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
                processor: null
            },
            87: {
                name: "SendSucId",
                processor: null
            },
            96: {
                name: "RequestNodeInfo",
                processor: null
            },
            97: {
                name: "RemoveFailedNodeID",
                processor: processFailedNode
            },
            98: {
                name: "IsFailedNodeID",
                processor: null
            },
            128: {
                name: "GetRoutingInfo",
                processor: null
            }
        };

        var commandClasses = {
            0: {
                name: "NO_OPERATION",
                processor: null
            },
            32: {
                name: "BASIC",
                processor: null
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
            43: {
                name: "SCENE_ACTIVATION",
                processor: null
            },
            48: {
                name: "SENSOR_BINARY",
                commands: {
                    1: {
                        name: "SENSOR_BINARY_GET"
                    },
                    2: {
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
                }
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
                        name: "MULTI_CHANNEL_ENCAP"
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
                        name: "MANUFACTURER_SPECIFIC_REPORT"
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
                        name: "WAKE_UP_INTERVAL_SET"
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
                }
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
                }
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
            156: {
                name: "SENSOR_ALARM",
                processor: null
            }
        };

        $scope.processList = [
            {
                string: "Z-Wave binding has been started.",
                ref: "Start",
                processor: null,
                content: "Binding Started",
                status: INFO
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
                ref: "NodeStage",
                processor: processStage
            },
            {
                string: "Received WAKE_UP_NOTIFICATION",
                ref: "Wakeup",
                content: "Node is AWAKE",
                status: INFO
            },
            {
                string: "Went to sleep",
                ref: "Sleep",
                content: "Node is ASLEEP",
                status: INFO
            },
            {
                string: "Timeout while sending message. Requeueing",
                ref: "Retry",
                processor: processRetry
            },
            {
                string: "Retry count exceeded",
                ref: "Timeout",
                processor: processTimeout
            },
            {
                string: "NETWORK HEAL - ",
                ref: "Heal"
            },
            {
                string: "Message cancelled by controller (CAN)",
                ref: "CAN",
                content: "Message cancelled by controller",
                status: ERROR
            }
        ];

        $scope.nodes = {};
        var config = {};

        function createNode(id) {
            if ($scope.nodes[id] == undefined) {
                $scope.nodes[id] = {
                    id: id,
                    responseTime: [],
                    timeouts: 0,
                    classes: []
                };
                for (var cnt = 0; cnt < 100; cnt++) {
                    $scope.nodes[id].responseTime[cnt] = 0;
                }
            }
//            if ($scope.nodeFilter[id] == undefined) {
//                $scope.nodeFilter[id] = {
//                    id: id
//                }
//            }
        }

        function addNodeInfo(id, type, value) {
            createNode(id);
            $scope.nodes[id][type] = value;
        }

        function getNodeInfo(id, type) {
            if ($scope.nodes[id] == undefined) {
                return undefined;
            }
            return $scope.nodes[id][type];
        }

        function updateNodeResponse(id, time) {
            createNode(id);
            if (time == -1) {
                // Timeout
                $scope.nodes[id].timeouts++;
            }
            else {
                $scope.nodes[id].responseTime[Math.floor(time / 50)]++;
            }
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

        function processStage(node, process, message) {
            var stage = message.substr(message.indexOf(" to ") + 4);
            addNodeInfo(node, "Stage", stage);
            return {
                stage: stage,
                content: "Stage advanced to " + stage
            };
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

        function processCommandClass(bytes) {
            // Handle our requests
            var cmdCls = HEX2DEC(bytes[0]);
            var cmdCmd = HEX2DEC(bytes[1]);

            // Process the command class
            var cmdClass = {result: SUCCESS, id: cmdCls};
            if (commandClasses[cmdCls] == undefined) {
                cmdClass.content = "Unknown command class " + bytes[0];
                setStatus(cmdClass, ERROR);
            }
            else {
                // If we've defined a command within the class, then process this
                if (commandClasses[cmdCls].commands != null &&
                    commandClasses[cmdCls].commands[cmdCmd] != null) {
                    cmdClass.content = commandClasses[cmdCls].name + ": " + commandClasses[cmdCls].commands[cmdCmd].name;
                    if (commandClasses[cmdCls].commands[cmdCmd].processor != null) {
                        cmdClass = commandClasses[cmdCls].commands[cmdCmd].processor(bytes.slice(0, -2));
                    }
                    else {
                        cmdClass.content =
                            commandClasses[cmdCls].name + ": " + commandClasses[cmdCls].commands[cmdCmd].name;
                        cmdClass.class = commandClasses[cmdCls].commands[cmdCmd].name;
                    }
                }
                else if(commandClasses[cmdCls].processor) {
                    cmdClass = commandClasses[cmdCls].processor(bytes.slice(0, -2));
                }
                else {
                    cmdClass.content = commandClasses[cmdCls].name;
                }
                cmdClass.name = commandClasses[cmdCls].name;
            }

            return cmdClass;
        }

        function processTemplate(node, direction, type, bytes, len) {
            if (direction == "TX") {

            } else {
                if (type == REQUEST) {
                }
                else {
                }
            }
        }

        function processApplicationCommand(node, direction, type, bytes, len) {
            var data = {result: SUCCESS};
            if (direction == "TX") {
                setStatus(data, ERROR);
            } else {
                if (type == REQUEST) {
                    var data = processCommandClass(bytes.slice(3, -1));
                    data.node = HEX2DEC(bytes[1]);

                    createNode(node);
                    if ($scope.nodes[node].classes[data.id] == undefined) {
                        $scope.nodes[node].classes[data.id] = 0;
                    }
                    $scope.nodes[node].classes[data.id]++;
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
                data.name = "Check if node is failed: " + HEX2DEC(bytes[0]);
            } else {
                if (type == REQUEST) {
                    setStatus(data, ERROR);
                }
                else {
                    // This is just the response to say it was sent
                    if (HEX2DEC(bytes[0]) > 0) {
                        // Success
                        data.content = "Node is failed";
                        setStatus(data, ERROR);
                    }
                    else {
                        // Error
                        setStatus(data, SUCCESS);
                    }
                }
            }

            return data;
        }

        var callbackCache = {};
        function processSendData(node, direction, type, bytes, len) {
            var sendData = {result: SUCCESS};

            if (direction == "TX") {
                node = HEX2DEC(bytes[0]);
                var cmdClass = processCommandClass(bytes.slice(2, -3));

                // Get the callback ID
                var callback = HEX2DEC(bytes[len - 1]);

                // Save information on this transaction
                callbackCache[callback] = {
                    time: logTime,
                    cmd: cmdClass,
                    node: node
                };

                setStatus(sendData, cmdClass.status);
                sendData.node = node;
                sendData.callback = callback;
                sendData.cmdClass = cmdClass;
                sendData.content = "SendData: " + cmdClass.message;

                lastSendData.node = node;
                lastSendData.callback = callback;
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
                        sendData.status = "No callback ID found (" + bytes[0] + ")";
                        sendData.responseTime = "Unknown";
                        setStatus(sendData, ERROR);
                    }
                    else {
                        callbackData = callbackCache[callback];
                        sendData.node = callbackData.node;
                        sendData.responseTime = logTime - callbackData.time;
                    }

                    switch (status) {
                        case 0:		// COMPLETE_OK
                            // If we know the response, update stats
                            if (sendData.responseTime != "Unknown") {
                                updateNodeResponse(node, sendData.responseTime);
                            }
                            sendData.content = "Message (" + callback + ") completed OK in " + sendData.responseTime + "ms";
                            break;
                        case 1:		// COMPLETE_NO_ACK
                            updateNodeResponse(node, -1);
                            setStatus(sendData, WARNING);
                            sendData.content = "Message (" + callback + ") completed in " + sendData.responseTime + "ms. NO ACK!";
                            break;
                        case 2:		// COMPLETE_FAIL
                            updateNodeResponse(node, -1);
                            setStatus(sendData, ERROR);
                            sendData.content = "Message (" + callback + ") failed in " + sendData.responseTime + "ms";
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
                        sendData.content = "Message (" + lastSendData.callback + ") sent OK";
                        setStatus(sendData, SUCCESS);
                    }
                    else {
                        // Error
                        setStatus(sendData, ERROR);
                        sendData.content = "Message (" + lastSendData.callback + ") not sent!";
                    }
                }
            }

            return sendData;
        }

        function processPacketTX(node, process, message) {
            return processPacket("TX", node, process, message);
        }

        function processPacketRX(node, process, message) {
            return processPacket("RX", node, process, message);
        }

        function processPacket(direction, node, process, message) {
            var bytes = message.substr(message.indexOf(" = ") + 3).split(' ');
            var packet = {
                direction: direction
            };

            // Frame starts with 01
            if (HEX2DEC(bytes[0]) != 1) {
                return;
            }

            packet.length = HEX2DEC(bytes[1]);
            packet.reqType = HEX2DEC(bytes[2]) == 0 ? REQUEST : RESPONSE;
            packet.pktType = HEX2DEC(bytes[3]);
            packet.class = packetTypes[packet.pktType].name;
            if (packet.class == undefined) {
                packet.class = "Unknown " + bytes[3] + " (" + packet.pktType + ")";
                setStatus(log.result, WARNING);
            }
            else if (packetTypes[packet.pktType].processor != null) {
                // Process the frame if we have a processor function
                packet.packet = packetTypes[packet.pktType].processor(node, direction, packet.reqType, bytes.slice(4, -1),
                    packet.length - 3);
                packet.node = packet.packet.node;
                setStatus(packet, packet.packet);			// Bubble status
            }

            // Set the minimum status if we defined it in the packet definition
            if(packetTypes[packet.pktType].status != null) {
                setStatus(packet, packetTypes[packet.pktType].status);
            }

            packet.content = "Packet ";
            packet.content += process.ref == "RXPacket" ? "received" : "sent";

            if(packet.packet != null) {
                packet.content += ": " + packet.packet.content;
            }
            else {
                packet.content += ": " + packet.class;
            }

            return packet;
        }

        function logProcessLine(line) {
            if (line == null || line.length == 0) {
                return;
            }

            // Parse the time
            var time = moment(line.substr(0,23), "YYYY-MM-DD HH:mm:ss.SSS");
            var message = line.substr(line.indexOf("] - ") + 4);
            var node = 0;

            logTime = time.valueOf();

            // See if this line includes a node ID
            if (message.indexOf("NODE ") == 0) {
                node = parseInt(message.slice(5), 10);
                lastNode = node;
            }

            var log = null;

            angular.forEach($scope.processList, function (process) {
                if (message.indexOf(process.string) != -1) {
                    log = {};
                    if (process.processor != null) {
                        log = process.processor(node, process, message);
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
                if(node != 0) {
                    log.node = node;
                }
                if(log.node != undefined && log.node != 0 && log.node != 255) {
                    log.stage = getNodeInfo(log.node, "Stage");
                }

                log.group = log.node;
                if (log.node != 0) {
                    //                   log.group = node;
                }
                else if (log.node == 255) {
                    //                 log.group = "CTRL";
                }
                else {
                    //               log.group = "0";
                }
                log.time = time.format("HH:mm:ss.SSS");
                log.start = time.valueOf();

                return log;
            }

            return null;
        }

        function FileLineStreamer() {
            var loopholeReader = new FileReader();
            var chunkReader = new FileReader();
            var delimiter = "\n".charCodeAt(0);

            var expectedChunkSize = 15000000; // Slice size to read
            var loopholeSize = 200;         // Slice size to search for line end

            var file = null;
            var fileSize;
            var loopholeStart;
            var loopholeEnd;
            var chunkStart;
            var chunkEnd;
            var lines;
            var thisForClosure = this;
            var handler;

            // Reading of loophole ended
            loopholeReader.onloadend = function (evt) {
                // Read error
                if (evt.target.readyState != FileReader.DONE) {
                    handler(null, new Error("Not able to read loophole (start: )"));
                    return;
                }
                var view = new DataView(evt.target.result);

                var realLoopholeSize = loopholeEnd - loopholeStart;

                for (var i = realLoopholeSize - 1; i >= 0; i--) {
                    if (view.getInt8(i) == delimiter) {
                        chunkEnd = loopholeStart + i + 1;
                        var blob = file.slice(chunkStart, chunkEnd);
                        chunkReader.readAsText(blob);
                        return;
                    }
                }

                // No delimiter found, looking in the next loophole
                loopholeStart = loopholeEnd;
                loopholeEnd = Math.min(loopholeStart + loopholeSize, fileSize);
                thisForClosure.getNextBatch();
            };

            // Reading of chunk ended
            chunkReader.onloadend = function (evt) {
                // Read error
                if (evt.target.readyState != FileReader.DONE) {
                    handler(null, new Error("Not able to read loophole"));
                    return;
                }

                lines = evt.target.result.split(/\r?\n/);
                // Remove last new line in the end of chunk
                if (lines.length > 0 && lines[lines.length - 1] == "") {
                    lines.pop();
                }

                chunkStart = chunkEnd;
                chunkEnd = Math.min(chunkStart + expectedChunkSize, fileSize);
                loopholeStart = Math.min(chunkEnd, fileSize);
                loopholeEnd = Math.min(loopholeStart + loopholeSize, fileSize);

                thisForClosure.getNextBatch();
            };

            this.getProgress = function () {
                if (file == null)
                    return 0;
                if (chunkStart == fileSize)
                    return 100;
                return Math.round(100 * (chunkStart / fileSize));
            }

            // Public: open file for reading
            this.open = function (fileToOpen, linesProcessed) {
                file = fileToOpen;
                fileSize = file.size;
                loopholeStart = Math.min(expectedChunkSize, fileSize);
                loopholeEnd = Math.min(loopholeStart + loopholeSize, fileSize);
                chunkStart = 0;
                chunkEnd = 0;
                lines = null;
                handler = linesProcessed;
            };

            // Public: start getting new line async
            this.getNextBatch = function () {
                // File wasn't open
                if (file == null) {
                    handler(null, new Error("You must open a file first"));
                    return;
                }
                // Some lines available
                if (lines != null) {
                    var linesForClosure = lines;
                    setTimeout(function () {
                        handler(linesForClosure, null)
                    }, 0);
                    lines = null;
                    return;
                }
                // End of File
                if (chunkStart == fileSize) {

                    var groups = new VisDataSet();
                    for (var key in $scope.nodes) {
                        groups.add({id: key, content: "Node " + key});
                    }

                    // create a dataset with items
                    var items = new VisDataSet();
                    items.add($scope.data);

                    $scope.timelineOptions= {
                        height: '100%',
                        width: '100%'
                    };

                    $scope.timelineData = {
                        items: items,
                        groups: groups
                    };

                    // Display all nodes to start
                    $scope.checkAllNodes();


                    $scope.$apply();


                    handler(null, null);
                    return;
                }
                // File part bigger than expectedChunkSize is left
                if (loopholeStart < fileSize) {
                    var blob = file.slice(loopholeStart, loopholeEnd);
                    loopholeReader.readAsArrayBuffer(blob);
                }
                // All file can be read at once
                else {
                    chunkEnd = fileSize;
                    var blob = file.slice(chunkStart, fileSize);
                    chunkReader.readAsText(blob);
                }
            };
        };

    })
;
