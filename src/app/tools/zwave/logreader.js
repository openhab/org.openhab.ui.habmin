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
    'checklist-model',
    'rt.popup'
])

    .config(function config($stateProvider) {
        $stateProvider.state('tools/zwave/logreader', {
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
    function ZWaveLogReaderCtrl($scope, locale, PersistenceItemModel, PersistenceServiceModel, PersistenceDataModel, ChartListModel, ChartSave, SidepanelService, growl, VisDataSet, $interval, $timeout) {
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
        var lastCmd = {};
        var lastSendData = {};
        var lastPacketRx = null;
        var lastPacketTx = null;


        /**
         * Function called when a line is clicked so we can add data to the popup
         * @param selected
         */
        $scope.onPopupShown = function (selected) {
            $scope.selectedPkt = selected;
            $scope.selectedNode = $scope.nodes[selected.node];
            if ($scope.selectedNode != null) {
            }
        };

        $scope.changePanel = function(panel) {
            $scope.showOption = panel;
            $timeout(function () {
                $(window).trigger('resize');
            }, 0);
        };

        $scope.logState = "empty";
        $scope.logName = " ";

        $scope.data = [];
        $scope.countLines = 0;
        $scope.countEntries = 0;
        $scope.selectedNode = {};
        $scope.showOption = "LIST";//"TIMELINE";
        $scope.processFilter = ['Start', 'RXPacket', 'TXPacket', 'Wakeup', 'Timeout', 'SendAbort'];
        $scope.processFilterOptions = [
            {
                ref: 'Info',
                name: 'Binding Information'
            },
            {
                ref: 'RXPacket',
                name: 'Packets Received'
            },
            {
                ref: 'TXPacket',
                name: 'Packets Sent'
            },
            {
                ref: 'Wakeup',
                name: 'Device Wakeup/Sleep'
            },
            {
                ref: 'Timeout',
                name: 'Timeouts and Retries'
            },
            {
                ref: 'SendAbort',
                name: 'Abort Messages'
            },
            {
                ref: 'NodeState',
                name: 'Node State Changes'
            }
        ];
        $scope.nodeFilter = [];

        /**
         * Select a node in the node list
         * We do some analyses here rather than at the end of the load function.
         * @param node
         */
        $scope.selectNode = function(node) {
            if(node.computed == false) {

            }
            $scope.selectedNode = node;
        };

        /**
         * Compute some statistics on a node
         */
        function computeNodeStats (node) {
        }

        /**
         * Marks all nodes as selected in the node filter
         * @param state
         */
        $scope.checkAllNodes = function (state) {
            $scope.nodeFilter = null;
            $scope.nodeFilter = [];
            if (state === false) {
                return;
            }
            for (var key in $scope.nodes) {
                $scope.nodeFilter.push(parseInt(key));
            }
            $scope.nodeFilter.push(255);
        };

        $scope.fileChanged = function (element) {
            loadLog(element.files[0]);
        };

        $scope.filterFunction = function (element) {
            if ($scope.processFilter.indexOf(element.ref) === -1) {
                return false;
            }

            if (element.node === undefined) {
                return true;
            }
            return $scope.nodeFilter.indexOf(element.node) === -1 ? false : true;
        };

        /**
         * Perform any calculations etc on the completion of loading a file
         */
        function loadComplete() {
            /*            var groups = new VisDataSet();
             for (var key in $scope.nodes) {
             groups.add({id: key, content: "Node " + key});
             }

             // Create a dataset with items
             var items = new VisDataSet();
             items.add($scope.data);

             // create visualization
             $scope.timelineOptions = {
             height:"100%",
             groupOrder: 'content'  // groupOrder can be a property name or a sorting function
             };

             $scope.timelineEvents = {};
             //                rangechange: $scope.onRangeChange,
             //              rangechanged: $scope.onRangeChanged,
             //            onload: $scope.onLoaded
             //      };

             $scope.timelineData = {
             items: items,
             groups: groups
             };*/

            // Display all nodes to start
            $scope.checkAllNodes();

            // Calculate node statistics
            for (var key in $scope.nodes) {
                if ($scope.nodes[key].responseTimeMin < 0) {
                    $scope.nodes[key].responseTimeMin = 0;
                }
                if ($scope.nodes[key].responseTimeAvg < 0) {
                    $scope.nodes[key].responseTimeAvg = 0;
                }
                if ($scope.nodes[key].responseTimeMax < 0) {
                    $scope.nodes[key].responseTimeMax = 0;
                }
                if ($scope.nodes[key].responseTimeCnt == 0) {
                    $scope.nodes[key].responseTimeMin = "-";
                    $scope.nodes[key].responseTimeAvg = "-";
                    $scope.nodes[key].responseTimeMax = "-";
                }
                else {
                    $scope.nodes[key].responseTimeAvg =
                        Math.round($scope.nodes[key].responseTimeAvg / $scope.nodes[key].responseTimeCnt);
                }
            }

            $scope.logState = "loaded";
        }

        /**
         * Load the log - called when the user selects a file
         */
        function loadLog(file) {
            // Initialise variables for loading
            $scope.data = [];
            $scope.nodes = {};
            $scope.countLines = 0;
            $scope.countEntries = 0;
            $scope.loadProgress = 0;
            $scope.logState = "loading";
            $scope.logName = file.name;

            lastPacketRx = null;

            var reader = new FileLineStreamer();

            // Putting this in a $timeout allows the digest to complete.
            // This allows the UI to update before we start loading the file.
            $timeout(function () {
                reader.open(file, function (lines, err) {
                    if (err != null) {
                        return;
                    }
                    if (lines == null) {
                        return;
                    }

                    // Process every line
                    lines.forEach(function (line) {
                        $scope.countLines++;

                        var d = logProcessLine(line);
                        if (d != null && d.ref != null) {
                            $scope.data.id = $scope.countEntries;
                            $scope.data.push(d);
                            $scope.countEntries++;
                        }

                        $scope.loadProgress = reader.getProgress();
                    });

                    reader.getNextBatch();
                });

                reader.getNextBatch();
            });
        }

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
                processor: processControllerCmd
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
                processor: null
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
                processor: processControllerCmd
            }
        };

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
            156: {
                name: "SENSOR_ALARM",
                processor: null
            }
        };

        $scope.processList = [
            {
                string: "Z-Wave binding has been started.",
                ref: "Start",
                content: "Binding Started",
                status: INFO
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
                ref: "Heal"
            },
            {
                string: "controller (CAN)",
                error: "Message cancelled by controller",
                processor: processTxMessageError,
                status: ERROR
            },
            {
                string: "controller (NAK)",
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

        $scope.nodes = {};
        var config = {};

        function createNode(id) {
            if ($scope.nodes[id] == null) {
                $scope.nodes[id] = {
                    id: id,
                    computed: false,
                    responseTime: [],
                    responseTimeouts: 0,
                    classes: [],
                    responseTimeMin: 9999,
                    responseTimeAvg: 0,
                    responseTimeMax: 0,
                    responseTimeCnt: 0,
                    messagesSent: 0
                };
                for (var cnt = 0; cnt < 100; cnt++) {
                    $scope.nodes[id].responseTime[cnt] = 0;
                }
            }
        }

        function addNodeInfo(id, type, value) {
            createNode(id);
            $scope.nodes[id][type] = value;
        }

        function getNodeInfo(id, type) {
            if ($scope.nodes[id] == null) {
                return null;
            }
            return $scope.nodes[id][type];
        }

        function updateNodeResponse(id, time) {
            createNode(id);
            if (time == -1) {
                // Timeout
                $scope.nodes[id].responseTimeouts++;
            }
            else {
                $scope.nodes[id].responseTime[Math.floor(time / 50)]++;
            }

            if (time < $scope.nodes[id].responseTimeMin) {
                $scope.nodes[id].responseTimeMin = time;
            }
            if (time > $scope.nodes[id].responseTimeMax) {
                $scope.nodes[id].responseTimeMax = time;
            }

            $scope.nodes[id].responseTimeAvg += time;
            $scope.nodes[id].responseTimeCnt++;
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

        function processVersion(node, bytes) {
            var data = {result: SUCCESS};

            var cmdCls = HEX2DEC(bytes[1]);
            var cmdCmd = HEX2DEC(bytes[2]);
            var cmdPrm = HEX2DEC(bytes[3]);

            data.content = commandClasses[cmdCls].name + "::" + commandClasses[cmdCls].commands[cmdCmd].name;
            switch (cmdCmd) {
                case 19:
                    data.content += " (" + commandClasses[cmdPrm].name + ")";
                    break;
            }

            return data;
        }

        function processManufacturer(node, bytes) {
            var data = {result: SUCCESS};
            addNodeInfo(node, "Manufacturer", bytes[3] + bytes[4]);
            addNodeInfo(node, "DeviceType", bytes[5] + bytes[6]);
            addNodeInfo(node, "DeviceID", bytes[7] + bytes[8]);
            data.content = "Manufacturer Info: " + getNodeInfo(node, "Manufacturer") + ":" +
            getNodeInfo(node, "DeviceType") + ":" + getNodeInfo(node, "DeviceID");

            return data;
        }

        function processCommandClass(node, bytes) {
            var cmdClass = {result: SUCCESS};
            if (bytes == null || bytes.length == 0) {
                cmdClass.content = "Zero length frame in command class";
                setStatus(cmdClass, ERROR);
                return;
            }

            // Handle our requests
            var cmdCls = HEX2DEC(bytes[1]);
            var cmdCmd = null;

            cmdClass.id = cmdCls;

            if (bytes.length > 1) {
                cmdCmd = HEX2DEC(bytes[2]);
            }

            // Process the command class
            if (commandClasses[cmdCls] == undefined) {
                cmdClass.content = "Unknown command class " + bytes[1];
                setStatus(cmdClass, WARNING);
            }
            else {
                // If we've defined a command/function within the class, then process this
                if (commandClasses[cmdCls].commands != null &&
                    commandClasses[cmdCls].commands[cmdCmd] != null) {
                    if (commandClasses[cmdCls].commands[cmdCmd].processor != null) {
                        cmdClass = commandClasses[cmdCls].commands[cmdCmd].processor(node, bytes);//.slice(0, 0));
                    }
                    cmdClass.function = commandClasses[cmdCls].commands[cmdCmd].name;
                }
                else if (commandClasses[cmdCls].processor) {
                    cmdClass = commandClasses[cmdCls].processor(node, bytes);//.slice(0, 0));
                }
                else {
                    if (cmdCmd != null) {
                        cmdClass.function = bytes[2];
                    }
                }
                cmdClass.class = commandClasses[cmdCls].name;
                cmdClass.name = commandClasses[cmdCls].name;

                if (cmdClass.content == null) {
                    cmdClass.content = cmdClass.class;
                    if (cmdClass.function != null) {
                        cmdClass.content += "::" + cmdClass.function;
                    }
                }
            }

            cmdClass.node = node;
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

        function processMemoryGetId(node, direction, type, bytes, len) {
            var data = {result: SUCCESS};
            if (direction == "TX") {
            } else {
                if (type == REQUEST) {
                    setStatus(data, ERROR);
                }
                else {
                    addNodeInfo(node, "HomeID", bytes[0] + bytes[1] + bytes[2] + bytes[3]);
                    addNodeInfo(node, "ControllerID", HEX2DEC(bytes[4]));
                    data.content = "MemoryGetId: HomeID=" + getNodeInfo(node, "HomeID") + ", Controller=" +
                    getNodeInfo(node, "ControllerID")
                }
            }

            return data;
        }

        function processIdentifyNode(node, direction, type, bytes, len) {
            var data = {result: SUCCESS};
            if (direction == "TX") {
                data.node = HEX2DEC(bytes[0]);

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
                    addNodeInfo(node, "Listening", a | 0x80 == 0 ? false : true);
                    addNodeInfo(node, "Routing", a | 0x40 == 0 ? false : true);
                    addNodeInfo(node, "Version", (a | 0x07) + 1);
                    a = HEX2DEC(bytes[1]);
                    addNodeInfo(node, "FLiRS", a | 0x60);
                    addNodeInfo(node, "BasicClass", HEX2DEC(bytes[3]));
                    addNodeInfo(node, "GenericClass", HEX2DEC(bytes[4]));
                    addNodeInfo(node, "SpecificClass", HEX2DEC(bytes[5]));
                    data.content = "IdentifyNode: Listening:" + getNodeInfo(node, "Listening");
                }
            }

            return data;
        }

        function processNodeNeighborUpdate(node, direction, type, bytes, len) {
            var data = {result: SUCCESS};
            if (direction == "TX") {
                data.node = HEX2DEC(bytes[0]);

                lastCmd = {
                    node: data.node
                };
            } else {
                if (type == REQUEST) {
                    data.node = lastCmd.node;

                    data.content = "Neighbor update ";
                    switch(HEX2DEC(bytes[1])) {
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

        function processControllerCallbackCmd(node, direction, type, bytes, len) {
            var data = {result: SUCCESS};
            if (direction == "TX") {
                data.node = HEX2DEC(bytes[0]);

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

        function processAppUpdate(node, direction, type, bytes, len) {
            var data = {result: SUCCESS};
            if (direction == "TX") {
            } else {
                if (type == REQUEST) {
                    data.node = HEX2DEC(bytes[0]);
                }
                else {
                }
            }

            return data;
        }

        function processControllerCmd(node, direction, type, bytes, len) {
            var data = {result: SUCCESS};
            if (direction == "TX") {
                data.node = HEX2DEC(bytes[0]);

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

        function processApplicationCommand(node, direction, type, bytes, len) {
            var data = {result: SUCCESS};
            if (direction == "TX") {
                setStatus(data, ERROR);
            } else {
                if (type == REQUEST) {
                    data.node = HEX2DEC(bytes[1]);
                    var data = processCommandClass(data.node, bytes.slice(2));

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
                data.node = HEX2DEC(bytes[0]);
                data.name = "Check if node " + data.node + " is failed";

                lastCmd = {
                    node: data.node
                };
            } else {
                if (type == REQUEST) {
                    setStatus(data, ERROR);
                }
                else {
                    data.node = lastCmd.node;

                    // This is just the response to say it was sent
                    if (HEX2DEC(bytes[0]) > 0) {
                        // Success
                        data.content = "Node " + data.node + " is failed!";
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
                // Remove the transmit options and callback id
                var cmdClass = processCommandClass(node, bytes.slice(1, -2));
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
                sendData.content = "SendData: Message (" + callback + "). Sent: " + cmdClass.content;

                lastSendData.node = node;
                lastSendData.callback = callback;

                createNode(node);
                $scope.nodes[node].messagesSent++
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
                        sendData.responseTime = "Unknown";
                        setStatus(sendData, ERROR);
                    }
                    else {
                        callbackData = callbackCache[callback];
                        node = callbackData.node;
                        sendData.node = callbackData.node;
                        sendData.responseTime = logTime - callbackData.time;
                    }

                    switch (status) {
                        case 0:		// COMPLETE_OK
                            // If we know the response, update stats
                            if (sendData.responseTime != "Unknown") {
                                updateNodeResponse(node, sendData.responseTime);
                            }
                            sendData.content =
                                "SendData: Message (" + callback + "). ACK'd by device in " + sendData.responseTime +
                                "ms";
                            break;
                        case 1:		// COMPLETE_NO_ACK
                            updateNodeResponse(node, -1);
                            setStatus(sendData, WARNING);
                            sendData.content =
                                "SendData: Message (" + callback + "). No ACK after " + sendData.responseTime + "ms";
                            sendData.warnFlag = true;
                            sendData.warnMessage = "No ack received from device";
                            break;
                        case 2:		// COMPLETE_FAIL
                            updateNodeResponse(node, -1);
                            setStatus(sendData, ERROR);
                            sendData.content =
                                "SendData: Message (" + callback + ") failed in " + sendData.responseTime + "ms";
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
                        sendData.content = "SendData: Message (" + lastSendData.callback + ") sent OK";
                        setStatus(sendData, SUCCESS);
                    }
                    else {
                        // Error
                        setStatus(sendData, ERROR);
                        sendData.content = "SendData: Message (" + lastSendData.callback + ") not sent!";
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
            else if (packetTypes[packet.pktType].processor != null) {
                packet.class = packetTypes[packet.pktType].name;

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

                // Set the minimum status if we defined it in the packet definition
                if (packetTypes[packet.pktType].result != null) {
                    setStatus(packet, packetTypes[packet.pktType].result);
                }
            }

            packet.content = "Packet ";
            packet.content += process.ref == "RXPacket" ? "RX" : "TX";
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

            angular.forEach($scope.processList, function (process) {
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
                    log.node = log.packet.node;
                }
                else if (node != 0) {
                    log.node = node;
                }
                if (log.node != undefined && log.node != 0 && log.node != 255) {
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
                if (file == null) {
                    return 0;
                }
                if (chunkStart == fileSize) {
                    return 100;
                }
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
                    loadComplete();

                    $scope.$apply();

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
