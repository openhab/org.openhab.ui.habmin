define([
        "dojo/_base/declare",
        "dijit/layout/BorderContainer",
        "dgrid/extensions/DijitRegistry",
        "dgrid/Grid",
        "dijit/Toolbar",
        "dijit/form/Button",
        "dojo/_base/array",
        "dojo/_base/lang" // lang.hitch
    ],
    function (declare, Container, Registry, Grid, Toolbar, Button, array, lang) {
        return declare(Container, {
            postCreate: function () {

                this.toolbar = new Toolbar({region:"top"});
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

                this.grid = new (declare([Grid, Registry]))({
                    region: "center",
                    columns: {
                        model: "Model",
                        icon: "Icon",
                        name: "Sitemap Name"
                    }
                });

                this.addChild(this.toolbar);
                this.addChild(this.grid);
            },
            startup: function() {
                this.inherited(arguments);
                this.resize();
            },
            loadSitemapList: function() {
                request("helloworld.txt", {
                    timeout: this.timeout,
                    handleAs: 'json'
                }).then(
                    lang.hitch(this, function (text) {
                        console.log("The file's contents is: " + text);
                        this.grid.renderArray(this.data);
                    })
                )
            }
        });
    });