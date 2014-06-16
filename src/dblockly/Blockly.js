/**
 * This file contains a Dojo AMD port of the Blockly library
 * @author Chris Jackson
 */

define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/dom-geometry",
        "dijit/layout/BorderContainer",
        "dijit/layout/ContentPane",
        "dijit/layout/AccordionContainer",
        "dojo/dnd/Source",
        "dblockly/BlocklyLib"
    ],
    function (declare, lang, array, domGeometry, Border, ContentPane, Accordion, Source, Blockly) {
        return declare(Border, {
            design: 'sidebar',
            gutters: true,
            liveSplitters: true,
            style: "height:100%;width:100%;",
            blockly: {
                collapse: true,
                trashcan: true,
                path: "../"
            },

            postCreate: function () {
                // Create a content pane to hold the Blockly editor
                this.blocklyPane = new ContentPane({
                    style: "height:100%;width:100%;padding:0px",
                    region: "center",
                    splitter: true,
                    resize: function (size) {
                        domGeometry.setContentSize(this.domNode, size);
                        if (Blockly.svg != null) {
                            Blockly.svgResize();
                        }
                    }
                });
                this.addChild(this.blocklyPane);

                // Create the accordion to hold the toolbox panes
                var acc = new Accordion({
                    style: "height:100%;width:300px;",
                    splitter: true,
                    region: 'leading'
                });

                this.toolboxGrids = [];

                // Do we want to show the toolbox?
                if (this.blockly.toolbox == true) {
                    var len = 0;
                    if(this.blockly.toolboxCategories != null)
                        len = this.blockly.toolboxCategories.length;
                    // Create an array of category stores and grids.
                    for (var i = 0; i < len; i++) {
                        // We create separate lists for each accordion.
                        var cat = {};
                        cat.store = [];

                        // Load any blocks specified in the toolboxTool array
                        // These will be added to any from the categories
                        for (var t = 0; t < this.blockly.toolboxTools.length; t++) {
                            if (this.blockly.toolboxTools[t].category === this.blockly.toolboxCategories[i].name) {
                                cat.store.push(this.blockly.toolboxTools[t]);
                            }
                        }

                        // Create a pane to hold this category
                        var pane = new ContentPane({
                            title: this.blockly.toolboxCategories[i].title,
                            iconClass: this.blockly.toolboxCategories[i].icon,
                            category: this.blockly.toolboxCategories[i].name
                        });
                        // Create the list for the category
                        cat.grid = new Source(pane.domNode, {copyOnly: true, accept: []});
                        acc.addChild(pane);

                        this.toolboxGrids.push(cat);
                    }
                }

                // Add the accordion to the display
                this.addChild(acc);
                acc.startup();
            },
            startup: function () {
                this.inherited(arguments);
                this.show();

                console.log("Blockly Pane is", this.blocklyPane);
                if(document.getElementById(this.blocklyPane.domNode.id) == null) {
                    console.error("Blockly Pane is not in DOM: ",this.blocklyPane.domNode.id);
                    return;
                }

                // Initialise Blockly
                Blockly.inject(document.getElementById(this.blocklyPane.domNode.id), {
                    path: this.blockly.path,
                    collapse: this.blockly.collapse,
                    trashcan: this.blockly.trashcan
                });
                this.resize();

                // Loop through all records in the toolbox and create the SVG graphic
                for (var i = 0; i < this.toolboxGrids.length; i++) {
                    array.forEach(this.toolboxGrids[i].store, lang.hitch(this, function (record) {
                        var block = Blockly.Json.domToBlock(Blockly.getMainWorkspace(), record.block);
                        if (block == null) {
                            console.log("Unable to load block '" + record.block + "'.");
                        }
                        else {
                            var svg = '<svg height="' + block.getHeightWidth().height + '" width="' + (block.getHeightWidth().width + 10) + '"><g transform=\"translate(10)\">' + block.getSvgRoot().outerHTML + "</g></svg>";
                            record.svg = svg;
                            Blockly.getMainWorkspace().clear();

                            this.toolboxGrids[i].grid.insertNodes(false, [
                                "<div class='habminWidget'>" + svg + "</div>"]);

                        }
                    }));

//                    this.toolboxGrids.grid.renderArray(this.data);
                }

                // Load the design into the workspace
                if (this.blockly.blocks != null && this.blockly.blocks != "")
                    this.setBlocks(this.blockly.blocks);

                // If a change listener is specified, add it

            },
            setBlocks: function (blocks) {
                // Clear any existing workspace
                if(Blockly.getMainWorkspace() != null)
                    Blockly.getMainWorkspace().clear();

                Blockly.Json.setWorkspace(Blockly.getMainWorkspace(), blocks);
                Blockly.getMainWorkspace().render();
            },
            getBlocks: function() {
                return Blockly.Json.getWorkspace(Blockly.getMainWorkspace());
            },
            destroy: function() {
                this.inherited(arguments);
                if(Blockly != null && Blockly.getMainWorkspace() != null)
                    Blockly.getMainWorkspace().dispose();
            }
    });
    });
