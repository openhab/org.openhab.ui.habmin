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
    'ngLocalize',
    'angular-growl',
    'ngVis',
    'ResizePanel'
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
            data: {pageTitle: 'Charting'},
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
        $scope.data = [];
        $scope.countLines = 0;
        $scope.countEntries = 0;
        $scope.showOption = "TIMELINE";

        $scope.file_changed = function (element) {
            loadLog(element.files[0]);
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
                        $scope.data.push(d);
                        $scope.countEntries++;
                    }
                });

                reader.getNextBatch();
            });

            reader.getNextBatch();
        };

        var packetTypes = {
            2: "SerialApiGetInitData",									// Request initial information about devices in networkSerialApiApplicationNodeInfo(0x03,"SerialApiApplicationNodeInfo"),					// Set controller node information
            4: "ApplicationCommandHandler",						// Handle application command
            5: "GetControllerCapabilities",						// Request controller capabilities (primary role, SUC/SIS availability)
            6: "SerialApiSetTimeouts",									// Set Serial API timeouts
            7: "SerialApiGetCapabilities",							// Request Serial API capabilities
            8: "SerialApiSoftReset",										// Soft reset. Restarts Z-Wave chip
            19: "SendData",															// Send data.
            21: "GetVersion",														// Request controller hardware version
            22: "SendDataAbort",												// Abort Send data.
            32: "MemoryGetId",
            64: "SetLearnNodeState",    									// ???
            65: "IdentifyNode",    												// Get protocol info (baud rate, listening, etc.) for a given node
            66: "SetDefault",    													// Reset controller and node info to default (original) values
            70: "AssignReturnRoute",										// Assign a return route from the specified node to the controller
            71: "DeleteReturnRoute",										// Delete all return routes from the specified node
            72: "RequestNodeNeighborUpdate",						// Ask the specified node to update its neighbors (then read them from the controller)
            73: "ApplicationUpdate",										// Get a list of supported (and controller) command classes
            74: "AddNodeToNetwork",											// Control the addnode (or addcontroller) process...start, stop, etc.
            75: "RemoveNodeFromNetwork",								// Control the removenode (or removecontroller) process...start, stop, etc.
            80: "SetLearnMode",													// Put a controller into learn mode for replication/ receipt of configuration info
            81: "AssignSucReturnRoute",									// Assign a return route to the SUC
            82: "EnableSuc",														// Make a controller a Static Update Controller
            84: "SetSucNodeID",													// Identify a Static Update Controller node id
            85: "DeleteSUCReturnRoute",									// Remove return routes to the SUC
            86: "GetSucNodeId",													// Try to retrieve a Static Update Controller node id (zero if no SUC present)
            87: "SendSucId",
            96: "RequestNodeInfo",
            97: "RemoveFailedNodeID",
            98: "IsFailedNodeID",
            128: "GetRoutingInfo"
        };

        var processList = [
            {
                string: "Z-Wave binding has been started.",
                ref: "Start",
                processor: null,
                message: "Binding Started"
            },
            {
                string: "Receive Message = ",
                ref: "RXPacket",
                processor: processPacket
            },
            {
                string: "Sending REQUEST Message = ",
                ref: "TXPacket",
                processor: processPacket
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
            }
        ];

        var nodes = {};
        var config = {};

        function addNodeInfo(id, type, value) {
            if(nodes.id == undefined) {
                nodes.id = {};
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

        function processStage(node, process, message) {
            var stage = message.substr(message.indexOf(" to ") + 4);
            return {
                stage: stage,
                message: "Stage advanced to " + stage
            };
        }

        function processResponseTime(node, process, message) {
            var response = parseInt(message.substr(message.indexOf("after ") + 6), 10);
            return null;
        }

        function processConfig(node, process, message) {
            var cfg = message.substr(message.indexOf("Update config, ") + 15).split("=");
            if(cfg == null || cfg.length != 2) {
                return null;
            }
            config[cfg[0].trim()] = cfg[1].trim();
            return null;
        }

        function processPacket(node, process, message) {
            var bytes = message.substr(message.indexOf(" = ") + 3).split(' ');
            var packet = {};

            // Frame starts with 01
            if (HEX2DEC(bytes[0]) != 1) {
                return;
            }

            packet.length = HEX2DEC(bytes[1]);
            packet.type = HEX2DEC(bytes[3]);
            packet.class = packetTypes[packet.type];
            if (packet.class == undefined) {
                packet.class = bytes[3] + " (" + packet.type + ")";
            }

            packet.message = "Packet "
            packet.message += process.ref == "RXPacket" ? "received" : "sent";
            packet.message += ": " + packet.class;

            return packet;
        }

        function logProcessLine(line) {
            if (line == null || line.length == 0) {
                return;
            }

            // Parse the time
            var time = moment(line, "HH:mm:ss.SSS");
            var message = line.substr(line.indexOf("] - ") + 4);
            var node = 0;

            // See if this line includes a node ID
            if(message.indexOf("NODE ") == 0) {
                node = parseInt(message.slice(5), 10);
            }

            var log = null;
            var direction = "";

            angular.forEach(processList, function(process) {
                if(message.indexOf(process.string) != -1) {
                    log = {};
                    if(process.processor != null) {
                        log = process.processor(node, process, message);
                    }
                    if(log != null) {
                        log.ref = process.ref;

                        if(process.message !== undefined) {
                            log.message = process.message;
                        }
                    }
                }
            });

            if (log != null) {
                if(log.node != 0) {
                    log.node = node;
                }
                else if(log.node == 255) {
                    log.node = "CTRL";
                }
                else {
                    log.node = "";
                }
                log.time = line.substr(0,12);
                log.millis = time.valueOf();

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

    .directive('fixedHeadersXXX', function ($window) {
        return {
            restrict: 'AC',
            link: function ($scope, element, attrs) {
                var top = element[0].offsetTop;
                var w = angular.element($window);
                $scope.getWindowDimensions = function () {
                    if ($(element).is(":visible") == false) {
//                        console.log("Div is hidden!!", element);
                        return;
                    }

                    var table = element.parent('.table');
                    var table_height = table.height();
                    var thead = element.children('.thead');
                    var thead_height = thead.height();
                    var tbody = element.children('.tbody');
                    var tbody_height = tbody.height();
                    var h1 = element[0].offsetHeight;
                    $scope.headerSize = h - h1;

                    var pHeight = (w.height() - $scope.headerSize - top - 25);
                    pa.css('height', pHeight + 'px');
                    return {
                        'h': w.height()
                    };
                };
                $scope.$watch($scope.getWindowDimensions, function (newValue, oldValue) {
                }, true);

                w.bind('resize', function () {
                    $scope.$apply();
                });
            }
        };
    })
;





