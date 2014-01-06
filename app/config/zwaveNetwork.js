/**
 * HABmin - the openHAB admin interface
 *
 * openHAB, the open Home Automation Bus.
 * Copyright (C) 2010-2013, openHAB.org <admin@openhab.org>
 *
 * See the contributors.txt file in the distribution for a
 * full listing of individual contributors.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as
 * published by the Free Software Foundation; either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, see <http://www.gnu.org/licenses>.
 *
 * Additional permission under GNU GPL version 3 section 7
 *
 * If you modify this Program, or any covered work, by linking or
 * combining it with Eclipse (or a modified version of that library),
 * containing parts covered by the terms of the Eclipse Public License
 * (EPL), the licensors of this Program grant you additional permission
 * to convey the resulting work.
 */

/**
 * OpenHAB Admin Console HABmin
 *
 * @author Chris Jackson
 */


Ext.define('openHAB.config.zwaveNetwork', {
    itemId: 'zwaveNetworkDiagramPanel',
    extend: 'Ext.panel.Panel',
    layout: 'fit',
    icon: 'images/application-list.png',
    title: 'Network',
    border: false,
    networkDiagram: null,
    networkData: null,
    selectedNode: null,
    items: [
        {

            border: false,
            itemId: 'jitIsHere',
            id: 'jitIsHere',
            listeners: {
                resize: function (comp, width, height, oldWidth, oldHeight, eOpts) {
                    var self = this.up('#zwaveNetworkDiagramPanel');
                    if (self.networkDiagram == null)
                        return;

                    self.networkDiagram.canvas.resize(width, height, true);
                },

                render: function () {
                    var self = this.up('#zwaveNetworkDiagramPanel');

                    var json = [
                        //"root" node is invisible
                        {
                            "id": "node0",
                            "name": "",
                            "data": {
                                "$type": "none"
                            },
                            "adjacencies": [
                                {
                                    "nodeTo": "node1",
                                    "data": {
                                        '$type': 'none'
                                    }
                                },
                                {
                                    "nodeTo": "node2",
                                    "data": {
                                        '$type': 'none'
                                    }
                                },
                                {
                                    "nodeTo": "node3",
                                    "data": {
                                        '$type': 'none'
                                    }
                                },
                                {
                                    "nodeTo": "node4",
                                    "data": {
                                        "$type": "none"
                                    }
                                },
                                {
                                    "nodeTo": "node5",
                                    "data": {
                                        "$type": "none"
                                    }
                                },
                                {
                                    "nodeTo": "node6",
                                    "data": {
                                        "$type": "none"
                                    }
                                },
                                {
                                    "nodeTo": "node7",
                                    "data": {
                                        "$type": "none"
                                    }
                                },
                                {
                                    "nodeTo": "node8",
                                    "data": {
                                        "$type": "none"
                                    }
                                },
                                {
                                    "nodeTo": "node9",
                                    "data": {
                                        "$type": "none"
                                    }
                                },
                                {
                                    "nodeTo": "node10",
                                    "data": {
                                        "$type": "none"
                                    }
                                }
                            ]
                        },
                        {
                            "id": "node1",
                            "name": "node 1",
                            "data": {
                                "$angularWidth": 13.00,
                                "$color": "#33a",
                                "$height": 70
                            },
                            "adjacencies": [
                                {
                                    "nodeTo": "node3",
                                    "data": {
                                        "$color": "#ddaacc",
                                        "$lineWidth": 4
                                    }
                                },
                                {
                                    "nodeTo": "node5",
                                    "data": {
                                        "$color": "#ccffdd",
                                        "$lineWidth": 4
                                    }
                                },
                                {
                                    "nodeTo": "node7",
                                    "data": {
                                        "$color": "#dd99dd",
                                        "$lineWidth": 4
                                    }
                                },
                                {
                                    "nodeTo": "node8",
                                    "data": {
                                        "$color": "#dd99dd",
                                        "$lineWidth": 4
                                    }
                                },
                                {
                                    "nodeTo": "node10",
                                    "data": {
                                        "$color": "#ddaacc",
                                        "$lineWidth": 4
                                    }
                                }
                            ]
                        },
                        {
                            "id": "node2",
                            "name": "node 2",
                            "data": {
                                "$angularWidth": 24.90,
                                "$color": "#55b",
                                "$height": 30
                            },
                            "adjacencies": [
                                "node8", "node9", "node10"
                            ]
                        },
                        {
                            "id": "node3",
                            "name": "node 3",
                            "data": {
                                "$angularWidth": 10.50,
                                "$color": "#77c",
                                "$height": 30
                            },
                            "adjacencies": [
                                "node8", "node9", "node10"
                            ]
                        },
                        {
                            "id": "node4",
                            "name": "node 4",
                            "data": {
                                "$angularWidth": 5.40,
                                "$color": "#99d",
                                "$height": 30
                            },
                            "adjacencies": [
                                "node8", "node9", "node10"
                            ]
                        },
                        {
                            "id": "node5",
                            "name": "node 5",
                            "data": {
                                "$angularWidth": 32.26,
                                "$color": "#aae",
                                "$height": 30
                            },
                            "adjacencies": [
                                "node8", "node9", "node10"
                            ]
                        },
                        {
                            "id": "node6",
                            "name": "node 6",
                            "data": {
                                "$angularWidth": 24.90,
                                "$color": "#bf0",
                                "$height": 30
                            },
                            "adjacencies": [
                                "node8", "node9", "node10"
                            ]
                        },
                        {
                            "id": "node7",
                            "name": "node 7",
                            "data": {
                                "$angularWidth": 14.90,
                                "$color": "#cf5",
                                "$height": 30
                            },
                            "adjacencies": [
                                "node8", "node9", "node10"
                            ]
                        },
                        {
                            "id": "node8",
                            "name": "node 8",
                            "data": {
                                "$angularWidth": 34.90,
                                "$color": "#dfa",
                                "$height": 30
                            },
                            "adjacencies": [
                                "node9", "node10"
                            ]
                        },
                        {
                            "id": "node9",
                            "name": "node 9",
                            "data": {
                                "$angularWidth": 42.90,
                                "$color": "#CCC",
                                "$height": 30
                            },
                            "adjacencies": [
                                "node10"
                            ]
                        },
                        {
                            "id": "node10",
                            "name": "node 10",
                            "data": {
                                "$angularWidth": 100.90,
                                "$color": "#C37",
                                "$height": 30
                            },
                            "adjacencies": []
                        }
                    ];

                    self.networkDiagram = new $jit.Sunburst({
                        //id container for the visualization
                        injectInto: 'jitIsHere-innerCt',
                        height: 400,
                        width: 400,
                        levelDistance: 100,
                        //Change node and edge styles such as
                        //color, width, lineWidth and edge types
                        Node: {
                            overridable: true,
                            type: 'gradient-multipie'
                        },
                        Edge: {
                            overridable: true,
                            type: 'hyperline',
                            lineWidth: 2,
                            color: '#777'
                        },
                        Label: {
                            type: 'Native'
                        },
                        //Add animations when hovering and clicking nodes
                        NodeStyles: {
                            enable: true,
                            type: 'Native',
                            stylesClick: {
                                'color': '#33dddd'
                            },
                            stylesHover: {
                                'color': '#dd3333'
                            },
                            duration: 700
                        },
                        Events: {
                            enable: true,
                            type: 'Native',
                            //List node connections onClick
                            onClick: function (node, eventInfo, e) {
                                if (!node)
                                    return;

                                self.selectedNode = node;
                                eventInfo.getNode();

                                var html = "<h4>" + node.name + " connections</h4><ul><li>", ans = [];
                                node.eachAdjacency(function (adj) {
                                    // if on the same level i.e siblings
                                    if (adj.nodeTo._depth == node._depth) {
                                        ans.push(adj.nodeTo.name);
                                    }
                                });

                                self.networkDiagram.rotate(node, 'animate', {
                                    duration: 1000,
                                    transition: $jit.Trans.Quart.easeInOut
                                });
//                                $jit.id('inner-details').innerHTML = html + ans.join("</li><li>") + "</li></ul>";
                            }
                        },
                        onBeforePlotLine: function (adj) {
                            if(self.selectedNode == null)
                                return;

                            var validRoute = false;
                            for(var i = 1; i < self.networkData.length; i++) {
                                if(self.networkData[i].id == self.selectedNode.id) {
                                    for(var r = 0; r < self.networkData[i].adjacencies.length; r++) {
                                        if(self.networkData[i].adjacencies[r].nodeTo == adj.nodeFrom.id ||
                                                self.networkData[i].adjacencies[r].nodeTo == adj.nodeTo.id)
                                            validRoute = true;
                                    }
                                }
                            }
                            if (validRoute == true) {
                                // override the line properties
                                adj.data.$color = '#0f0';
                                adj.data.$lineWidth = 4;
                            } else {
                                // reset the line properties
                                delete adj.data.$color;
                                adj.data.$lineWidth = 2;
                            }
                        },
                        onBeforePlotNode: function (node) {

                        }

                    });

                    // load JSON data.
                    self.networkDiagram.loadJSON(self.networkData);

                    // compute positions and plot.
                    self.networkDiagram.refresh();
                }
            }
        }
    ],

    initComponent: function () {
        var self = this;

        // Get the nodes list
        Ext.Ajax.request({
            url: HABminBaseURL + '/zwave/nodes/',
            method: 'GET',
            headers: {'Accept': 'application/json'},
            success: function (response, opts) {
                var json = Ext.decode(response.responseText);

                self.networkData = [];
                self.networkData[0] = {};
                self.networkData[0].id = "root";
                self.networkData[0].adjacencies = [];
                self.networkData[0].data = {'$type': 'none'};
                for (var i = 0; i < json.records.length; i++) {
                    self.networkData[0].adjacencies[i] = {};
                    self.networkData[0].adjacencies[i].nodeTo = json.records[i].domain;
                    self.networkData[0].adjacencies[i].data = {'$type': 'none'};
                }

                for (var i = 0; i < json.records.length; i++) {
                    self.networkData[i + 1] = {};
                    self.networkData[i + 1].id = json.records[i].domain;
                    self.networkData[i + 1].name = json.records[i].label;
                    self.networkData[i + 1].data = {
                        //   "$angularWidth": 45.00,
                        "$color": "#33a",
                        "$height": 70};

                    self.networkData[i + 1].adjacencies = [];

                    // Request the neighbors list for this node
                    Ext.Ajax.request({
                        url: HABminBaseURL + '/zwave/' + json.records[i].domain + "neighbors/",
                        method: 'GET',
                        headers: {'Accept': 'application/json'},
                        success: function (response, opts) {
                            var json = Ext.decode(response.responseText);
                            if (json == null)
                                return;
                            if (json.records == null)
                                return;

                            var node = 0;
                            for (var i = 0; i < self.networkData.length; i++) {
                                if (response.request.options.url === HABminBaseURL + '/zwave/' + self.networkData[i].id + "neighbors/")
                                    node = i;
                            }

                            if (i != 0) {
                                for (var i = 0; i < json.records.length; i++) {
                                    self.networkData[node].adjacencies[i] = {};
                                    self.networkData[node].adjacencies[i].nodeTo = "nodes/" + json.records[i].name + "/";
                                    self.networkData[node].adjacencies[i].data = {
                                        "$color": "#ddaacc",
                                        "$lineWidth": 4
                                    }
                                }
                            }
                        },
                        failure: function () {
                        }
                    });
                }
            },
            failure: function () {
//                            handleStatusNotification(NOTIFICATION_ERROR, "Error sending updated value to the server!");
            }
        });


        this.callParent();
    }
})
;