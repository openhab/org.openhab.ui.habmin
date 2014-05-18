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
        return declare(null, {
            data: [
                { first: "Bob", last: "Barker", age: 89 },
                { first: "Vanna", last: "White", age: 55 },
                { first: "Pat", last: "Sajak", age: 65 }
            ],
            constructor: function (x, node) {
                this.container = new Container();

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

                this.container.addChild(toolbar);
                this.container.addChild(this.grid);
            },
            show: function() {
                this.container.placeAt("content");
                this.grid.resize();
                this.grid.renderArray(this.data);
            }
        });
    });