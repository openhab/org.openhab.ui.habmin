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

                                // Remember the selected node so we can highlight the routes
                                self.selectedNode = node;

                                // Rotate the diagram
                                self.networkDiagram.rotate(node, 'animate', {
                                    duration: 1000,
                                    transition: $jit.Trans.Quart.easeInOut
                                });
                            }
                        },
                        onBeforePlotLine: function (adj) {
                            if(self.selectedNode == null)
                                return;

                            // Navigate through the neighbors list to see if it's valid
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

                            // Override the line properties if this is a neighbor
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
//              handleStatusNotification(NOTIFICATION_ERROR, "Error sending updated value to the server!");
            }
        });

        this.callParent();
    }
})
;