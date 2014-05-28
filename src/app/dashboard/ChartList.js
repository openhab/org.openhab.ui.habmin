define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dijit/layout/LayoutContainer",
        "dojo/request",
        "dgrid/Grid",
        "dgrid/extensions/DijitRegistry",
        "dgrid/Selection",
        "dgrid/Keyboard",
        "dijit/form/Button",
        "dijit/Toolbar",
        "dojo/_base/array"
    ],
    function (declare, lang, Container, request, Grid, Registry, Selection, Keyboard, Button, Toolbar, array) {
        return declare(Container, {

            buildRendering: function () {
                this.inherited(arguments);

                var toolDefinition = [
                    {
                        label: "Delete",
                        menuRef: "delete",
                        iconClass: "habminIconDelete"
                    },
                    {
                        label: "Edit",
                        menuRef: "edit",
                        iconClass: "habminIconEdit"
                    }
                ];
                var toolbar = new Toolbar({region:"top"});
                array.forEach(toolDefinition, function(def){
                    var button = new Button({
                        // note: should always specify a label, for accessibility reasons.
                        // Just set showLabel=false if you don't want it to be displayed normally
                        label: def.label,
                        showLabel: true,
                        iconClass: "habminButtonIcon " + def.iconClass
                    });

                    toolbar.addChild(button);
                });

                this.grid = new (declare([Grid, Registry, Selection]))({
                    region: "center",
                    showHeader: false,
                    selectionMode: "single",
                    columns: [
                        {label: "Property", field: 'name', renderCell: cellRenderer}
                    ]
                });

                this.grid.on(".dgrid-cell:click", lang.hitch(this, function(evt){
                    var cell = this.grid.cell(evt);

                    // cell.row.data.id
                }));

                this.addChild(toolbar);
                this.addChild(this.grid);

                function cellRenderer(object, value, node, options) {
                    node.innerHTML = "<span class='habminListIcon'><img src='/images/" + object.icon + ".png'></span>" + value;
                }
            },
            startup: function () {
                this.inherited(arguments);
                this.resize();

                request("http://localhost:8080/services/habmin/persistence/charts", {
                    timeout: 3333, //this.timeout,
                    handleAs: 'json',
                    headers: {
                        "Content-Type": 'application/json; charset=utf-8',
                        "Accept": "application/json"
                    }
                }).then(
                    lang.hitch(this, function (data) {
                        console.log("The file's contents is: ", data);
                        this.grid.renderArray(data.chart);
                    }),
                    lang.hitch(this, function (error) {
                        console.log("An error occurred: " + error);
                    })
                );
            }
        })
            ;
    })
;