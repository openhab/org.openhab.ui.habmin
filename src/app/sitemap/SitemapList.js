define([
        "dojo/_base/declare",
        "dijit/layout/BorderContainer",
        "dgrid/extensions/DijitRegistry",
        "dgrid/Grid",
        "dijit/Toolbar",
        "dijit/form/Button",
        "dojo/_base/array"
    ],
    function (declare, Container, Registry, Grid, Toolbar, Button, array) {
        return declare(Container, {
            data: [
                { first: "Bob", last: "Barker", age: 89 },
                { first: "Vanna", last: "White", age: 55 },
                { first: "Pat", last: "Sajak", age: 65 }
            ],
            postCreate: function (x, node) {
                this.inherited(arguments);

                toolbar = new Toolbar({region:"top"});
                array.forEach(["Cut", "Copy", "Paste"], function(label){
                    var button = new Button({
                        // note: should always specify a label, for accessibility reasons.
                        // Just set showLabel=false if you don't want it to be displayed normally
                        label: label,
                        showLabel: false,
                        iconClass: "dijitButtonIcon dijitIconSave"
                    });

                    toolbar.addChild(button);
                });
/*
                var grid = new Grid({
                    region: "center",
                    columns: {
                        first: "First Name",
                        last: "Last Name",
                        age: "Age"
                    }
                });*/

                this.grid = new (declare([Grid, Registry]))({
                    region: "center",
                    columns: {
                        first: "First Name",
                        last: "Last Name",
                        age: "Age"
                    }
                });

                this.addChild(toolbar);
                this.addChild(this.grid);

                this.grid.renderArray(this.data);
            },
            startup: function() {
                this.inherited(arguments);
                this.resize();
            }
        });
    });